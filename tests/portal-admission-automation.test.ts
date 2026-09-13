// FILE: tests/portal-admission-automation.test.ts
//
// CRM-PORTAL-AUTO-02 — ADMISSION → PORTAL AUTOMATION (DB-BACKED)
//
// Verifies that when an AUTHORIZED admission action APPLIES the
// terminal ADMISSION_COMPLETED transition, the shared portal
// processing service provisions the student's portal access
// automatically — against a REAL Postgres:
//   A1  ADMISSION_COMPLETED applied → PortalAccessRequest created for
//       the lead and auto-processed once (hermetic: with the portal
//       password absent it lands FAILED "not configured", never a
//       browser); the admission itself stays ADMISSION_COMPLETED
//   A2  repeating the ADMISSION_COMPLETED action (already at the state)
//       → applied:false → NEVER duplicates the request / re-processes
//   A3  lead without contact details (no email) → admission completes,
//       NO malformed PortalAccessRequest is ever created (skipped)
//   A4  autoProvision with an injected registration → PENDING request
//       created and processed to COMPLETED (portalLogin = email)
//   A4b existing PENDING request (from another flow, e.g. demo) is
//       REUSED — never a second PortalAccessRequest for the same email
//   A5  an existing FAILED request is NEVER silently auto-retried — it
//       is left retryable through the manual queue
//   A6  STUDENT / AI actors can NEVER reach ADMISSION_COMPLETED
//       (lifecycle barrier) — so automation can never be triggered by
//       student/AI/system actions
//
// Run (existing convention, scratch Postgres REQUIRED):
//   npx tsx tests/portal-admission-automation.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AdmissionActor,
  AdmissionState,
  PortalAccessStatus,
} from "@prisma/client";
import prisma from "../lib/prisma";
import {
  getOrCreateAdmissionEnrollment,
  recordAdmissionTransition,
} from "../lib/admission/admission.service";
import { performAdminAdmissionAction } from "../lib/admission/admin.admissions.service";
import { AdmissionLifecycleErrorCode } from "../lib/admission/admission.lifecycle";
import {
  createPortalAccessRequest,
  markPortalAccessFailed,
  getPortalAccessRequest,
} from "../lib/portal/portal.access.service";
import {
  autoProvisionPortalForAdmission,
  type PortalRegistrationFn,
} from "../lib/portal/portal.processor";

// ── UNIQUE TEST HARNESS ───────────────────────────────────────────
let seq = 0;
const uid = () => `adm-${Date.now()}-${++seq}`;

const enrolledIds: string[] = [];
const leadIds: string[] = [];
const staffIds: string[] = [];
const requestIds: string[] = [];

type TestLead = {
  id: string;
  email: string;
  name: string;
};

async function createLead(input?: {
  name?: string;
  email?: string;
  phone?: string;
}): Promise<TestLead> {
  const email = input?.email ?? `${uid()}@dev.test`;
  const name = input?.name ?? `Auto Student ${uid()}`;
  const lead = await prisma.lead.create({
    data: {
      name,
      phone: input?.phone ?? `+1${String(Math.floor(Math.random() * 1e10)).padStart(10, "0")}`,
      email,
    },
  });
  leadIds.push(lead.id);
  return { id: lead.id, email, name };
}

async function createStaff(role = "ADMIN") {
  const staff = await prisma.staff.create({
    data: { name: `Auto ${uid()}`, email: `${uid()}@staff.dev.test`, role },
  });
  staffIds.push(staff.id);
  return staff;
}

async function createEnrollment(leadId: string, course = "IELTS") {
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId, course });
  enrolledIds.push(enrollment.id);
  return enrollment;
}

/** Walk to ADMISSION_CONFIRMED under authorized actors (ADMIN). */
async function walkToConfirmed(enrollmentId: string): Promise<void> {
  const chain = [
    AdmissionState.COUNSELLOR_CONTACT_PENDING,
    AdmissionState.COUNSELLOR_CONTACTED,
    AdmissionState.PAYMENT_PENDING,
    AdmissionState.PAYMENT_VERIFICATION,
    AdmissionState.PAYMENT_VERIFIED,
    AdmissionState.ADMISSION_CONFIRMED,
  ] as const;
  for (const state of chain) {
    await recordAdmissionTransition({
      enrollmentId,
      toState: state,
      actor: AdmissionActor.ADMIN,
    });
  }
}

async function cleanup() {
  await prisma.portalAccessRequest
    .deleteMany({ where: { id: { in: requestIds } } })
    .catch(() => {});
  await prisma.admissionEvent
    .deleteMany({ where: { admissionEnrollmentId: { in: enrolledIds } } })
    .catch(() => {});
  await prisma.admissionEnrollment
    .deleteMany({ where: { id: { in: enrolledIds } } })
    .catch(() => {});
  for (const id of leadIds) {
    await prisma.lead.deleteMany({ where: { id } }).catch(() => {});
  }
  for (const id of staffIds) {
    await prisma.staff.deleteMany({ where: { id } }).catch(() => {});
  }
  enrolledIds.length = 0;
  leadIds.length = 0;
  staffIds.length = 0;
  requestIds.length = 0;
}

test.afterEach(cleanup);
test.after(() => prisma.$disconnect());

async function countRequestsForEmail(email: string) {
  return prisma.portalAccessRequest.count({ where: { email } });
}

// ── A1. FULL PIPELINE (hermetic) ─────────────────────────────────
test("A1. ADMISSION_COMPLETED action applied → PortalAccessRequest auto-created and processed once", async () => {
  const lead = await createLead();
  const staff = await createStaff("ADMIN");
  const enrollment = await createEnrollment(lead.id);
  await walkToConfirmed(enrollment.id);

  const previous = process.env.PORTAL_PASSWORD;
  let result;
  try {
    delete process.env.PORTAL_PASSWORD;
    result = await performAdminAdmissionAction({
      admissionEnrollmentId: enrollment.id,
      action: "ADMISSION_COMPLETED",
      actor: AdmissionActor.ADMIN,
      actorId: staff.id,
      reason: "Admission done — auto-provision portal access",
    });
  } finally {
    if (previous === undefined) delete process.env.PORTAL_PASSWORD;
    else process.env.PORTAL_PASSWORD = previous;
  }

  assert.equal(result.applied, true, "the terminal transition applied");
  assert.equal(result.enrollment.state, AdmissionState.ADMISSION_COMPLETED);

  const requests = await prisma.portalAccessRequest.findMany({
    where: { email: lead.email },
  });
  assert.equal(requests.length, 1, "exactly ONE PortalAccessRequest for the lead");
  const request = requests[0];
  assert.equal(request.leadId, lead.id);
  assert.equal(request.studentName, lead.name);
  assert.equal(request.email, lead.email);

  // Hermetic: no portal password → the request was auto-processed and
  // landed FAILED(CONFIGURATION) WITHOUT ever launching a browser.
  assert.equal(request.status, PortalAccessStatus.FAILED, "portal password absent → failed-not-configured, no browser");
  assert.match(request.errorMessage ?? "", /not configured/i);
  assert.equal(request.processedBy, staff.id, "the acting authorized staff is recorded");

  const updated = await getPortalAccessRequest(request.id);
  assert.equal(updated?.status, PortalAccessStatus.FAILED);
});

// ── A2. REPEAT action → never duplicates ──────────────────────────
test("A2. re-running ADMISSION_COMPLETED (already completed) → applied:false, no duplicate request", async () => {
  const lead = await createLead();
  const staff = await createStaff("ADMIN");
  const enrollment = await createEnrollment(lead.id);
  await walkToConfirmed(enrollment.id);

  const previous = process.env.PORTAL_PASSWORD;
  try {
    delete process.env.PORTAL_PASSWORD;
    const first = await performAdminAdmissionAction({
      admissionEnrollmentId: enrollment.id,
      action: "ADMISSION_COMPLETED",
      actor: AdmissionActor.ADMIN,
      actorId: staff.id,
    });
    assert.equal(first.applied, true);

    const second = await performAdminAdmissionAction({
      admissionEnrollmentId: enrollment.id,
      action: "ADMISSION_COMPLETED",
      actor: AdmissionActor.ADMIN,
      actorId: staff.id,
    });
    assert.equal(second.applied, false, "already at terminal state → no re-apply");

    const count = await countRequestsForEmail(lead.email);
    assert.equal(count, 1, "still exactly one request — never a duplicate");
  } finally {
    if (previous === undefined) delete process.env.PORTAL_PASSWORD;
    else process.env.PORTAL_PASSWORD = previous;
  }
});

// ── A3. MISSING CONTACT DETAILS → skip, never malformed ──────────
test("A3. lead without email → admission completes, NO malformed PortalAccessRequest", async () => {
  const lead = await createLead({ email: "missing@nowhere.test" });
  const staff = await createStaff("ADMIN");
  const enrollment = await createEnrollment(lead.id);
  await walkToConfirmed(enrollment.id);

  // Strip the email so the lead has incomplete contact details.
  await prisma.lead.update({ where: { id: lead.id }, data: { email: null } });

  const result = await performAdminAdmissionAction({
    admissionEnrollmentId: enrollment.id,
    action: "ADMISSION_COMPLETED",
    actor: AdmissionActor.ADMIN,
    actorId: staff.id,
  });

  assert.equal(result.applied, true);
  assert.equal(result.enrollment.state, AdmissionState.ADMISSION_COMPLETED);
  assert.equal(
    await countRequestsForEmail(lead.email),
    0,
    "no malformed request was created for a lead without an email",
  );
  assert.equal(
    await prisma.portalAccessRequest.count({ where: { leadId: lead.id } }),
    0,
  );
});

// ── A4. DIRECT AUTOPROVISION → COMPLETED (injected registration) ─
test("A4. autoProvision creates + processes a PENDING request to COMPLETED", async () => {
  const lead = await createLead();
  const enrollment = await createEnrollment(lead.id);

  const fakeRegistration: PortalRegistrationFn = async (input) => ({
    success: true,
    message: "Registration completed successfully.",
    portalLogin: input.email,
    portalStatus: "Awaiting Approval",
    selectedCourse: "IELTS Academic Champion - Trial",
  });

  const previous = process.env.PORTAL_PASSWORD;
  let provision;
  try {
    process.env.PORTAL_PASSWORD = "test-shared-password";
    provision = await autoProvisionPortalForAdmission(enrollment.id, {
      registration: fakeRegistration,
      processedBy: "test-staff",
    });
  } finally {
    if (previous === undefined) delete process.env.PORTAL_PASSWORD;
    else process.env.PORTAL_PASSWORD = previous;
  }

  assert.equal(provision.status, "REQUEST_PROCESSED_COMPLETED");
  const request = provision.portalRequest;
  assert.equal(request?.status, PortalAccessStatus.COMPLETED);
  assert.equal(request?.portalLogin, lead.email);
  assert.equal(request?.leadId, lead.id);
  assert.equal(request?.processedBy, "test-staff");
  assert.equal(request?.attemptCount, 1);
});

// ── A4b. REUSE an existing PENDING request (never a duplicate) ───
test("A4b. an existing PENDING request (demo flow) is reused and processed — one row only", async () => {
  const lead = await createLead();
  const enrollment = await createEnrollment(lead.id);
  const existing = await createPortalAccessRequest({
    leadId: lead.id,
    studentName: "Pre-existing student",
    email: lead.email,
    phone: "+15550009900",
    course: "IELTS",
  });
  requestIds.push(existing.id);

  let registrationCalls = 0;
  const fakeRegistration: PortalRegistrationFn = async (input) => {
    registrationCalls += 1;
    return { success: true, message: "ok", portalLogin: input.email };
  };

  const previous = process.env.PORTAL_PASSWORD;
  let provision;
  try {
    process.env.PORTAL_PASSWORD = "test-shared-password";
    provision = await autoProvisionPortalForAdmission(enrollment.id, {
      registration: fakeRegistration,
    });
  } finally {
    if (previous === undefined) delete process.env.PORTAL_PASSWORD;
    else process.env.PORTAL_PASSWORD = previous;
  }

  assert.equal(provision.status, "REQUEST_PROCESSED_COMPLETED");
  assert.equal(provision.portalRequest?.id, existing.id, "the existing request was reused");
  assert.equal(await countRequestsForEmail(lead.email), 1, "never a second row");
  assert.equal(registrationCalls, 1);
});

// ── A5. FAILED request → left retryable, never auto-retried ─────
test("A5. an existing FAILED request is left to the manual queue — never silently auto-retried", async () => {
  const lead = await createLead();
  const enrollment = await createEnrollment(lead.id);

  const existing = await createPortalAccessRequest({
    leadId: lead.id,
    studentName: "Failed student",
    email: lead.email,
    phone: "+15550008800",
    course: "IELTS",
  });
  requestIds.push(existing.id);
  await markPortalAccessFailed(existing.id, "previous portal failure");

  let registrationCalls = 0;
  const spyRegistration: PortalRegistrationFn = async (input) => {
    registrationCalls += 1;
    return { success: true, message: "ok", portalLogin: input.email };
  };

  const provision = await autoProvisionPortalForAdmission(enrollment.id, {
    registration: spyRegistration,
  });

  assert.equal(provision.status, "REQUEST_FAILED_LEFT_RETRYABLE");
  assert.equal(registrationCalls, 0, "FAILED request was NOT auto-retried");
  assert.equal(provision.portalRequest?.status, PortalAccessStatus.FAILED);
});

// ── A6. STUDENT / AI can never reach ADMISSION_COMPLETED ─────────
test("A6. STUDENT / AI actors are barred from ADMISSION_COMPLETED — automation can never run for them", async () => {
  const lead = await createLead();
  const enrollment = await createEnrollment(lead.id);
  await walkToConfirmed(enrollment.id);

  for (const actor of [AdmissionActor.AI, AdmissionActor.STUDENT]) {
    await assert.rejects(
      recordAdmissionTransition({
        enrollmentId: enrollment.id,
        toState: AdmissionState.ADMISSION_COMPLETED,
        actor,
      }),
      (err: unknown) => {
        assert.ok(err && typeof err === "object" && "code" in err);
        assert.equal(
          (err as { code: string }).code,
          AdmissionLifecycleErrorCode.REQUIRES_HUMAN_VERIFICATION,
        );
        return true;
      },
    );
  }

  assert.equal(
    await prisma.portalAccessRequest.count({ where: { leadId: lead.id } }),
    0,
    "no automation ever fired for a rejected actor",
  );
});