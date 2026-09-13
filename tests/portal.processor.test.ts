// FILE: tests/portal.processor.test.ts
//
// CRM-PORTAL-AUTO-02 — SHARED PORTAL PROCESSING SERVICE (DB-BACKED)
//
// Verifies lib/portal/portal.processor.ts — the single implementation
// behind BOTH the admin "Process" button and the automatic
// admission-to-portal workflow — against a REAL Postgres:
//   P1  unknown request → NOT_FOUND
//   P2  already COMPLETED → ALREADY_COMPLETED no-op (no new attempt)
//   P3  already PROCESSING → ALREADY_PROCESSING (no double processing)
//   P4  missing portal password → CONFIGURATION, row FAILED, no browser
//   P5  happy path (injected registration) → COMPLETED, portalLogin=email
//   P6  registration failure → FAILED with errorMessage, then RETRY
//       lands it back at PENDING (retryable)
//   P6b PROCESS on a FAILED request acts as an implicit retry → COMPLETED
//   P7  TRUE concurrency: two racing PROCESS calls → the atomic
//       PENDING→PROCESSING claim lets exactly ONE registration run
//   P8  unmappable course → FAILED BEFORE any registration is invoked
//
// Run (existing convention, scratch Postgres REQUIRED):
//   npx tsx tests/portal.processor.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import { PortalAccessStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import {
  createPortalAccessRequest,
  getPortalAccessRequest,
  markPortalAccessCompleted,
  retryPortalAccess,
  markPortalAccessFailed,
} from "../lib/portal/portal.access.service";
import {
  processPortalAccessRequest,
  type PortalRegistrationFn,
} from "../lib/portal/portal.processor";

// ── UNIQUE TEST HARNESS ───────────────────────────────────────────
let seq = 0;
const uid = () => `por-${Date.now()}-${++seq}`;

const requestIds: string[] = [];
const leadIds: string[] = [];

async function cleanup() {
  await prisma.portalAccessRequest
    .deleteMany({ where: { id: { in: requestIds } } })
    .catch(() => {});
  for (const id of leadIds) {
    await prisma.lead.deleteMany({ where: { id } }).catch(() => {});
  }
  requestIds.length = 0;
  leadIds.length = 0;
}

test.afterEach(cleanup);
test.after(() => prisma.$disconnect());

async function createRequest(input: {
  studentName?: string;
  email?: string;
  phone?: string;
  course?: string;
  leadId?: string;
}) {
  const request = await createPortalAccessRequest({
    studentName: input.studentName ?? "Process Test Student",
    email: input.email ?? `${uid()}@dev.test`,
    phone: input.phone ?? "+15550001122",
    course: input.course ?? "IELTS",
    leadId: input.leadId,
  });
  requestIds.push(request.id);
  return request;
}

/** Deterministic success registration spy. */
function successRegistration(): {
  fn: PortalRegistrationFn;
  calls: Array<{ name: string; email: string; phone: string; course: string }>;
} {
  const calls: Array<{ name: string; email: string; phone: string; course: string }> = [];
  const fn: PortalRegistrationFn = async (input) => {
    calls.push(input);
    return {
      success: true,
      message: "Registration completed successfully.",
      portalLogin: input.email,
      portalStatus: "Awaiting Approval",
      selectedCourse: "IELTS Academic Champion - Trial",
    };
  };
  return { fn, calls };
}

/** Run a block with PORTAL_PASSWORD set to a non-secret test value. */
async function withPortalPassword(body: () => Promise<void>): Promise<void> {
  const previous = process.env.PORTAL_PASSWORD;
  try {
    process.env.PORTAL_PASSWORD = "test-shared-password";
    await body();
  } finally {
    if (previous === undefined) {
      delete process.env.PORTAL_PASSWORD;
    } else {
      process.env.PORTAL_PASSWORD = previous;
    }
  }
}

// ── P1. NOT FOUND ────────────────────────────────────────────────
test("P1. unknown request id → NOT_FOUND", async () => {
  const result = await processPortalAccessRequest(uid());
  assert.equal(result.status, "NOT_FOUND");
  assert.equal(result.request, undefined);
});

// ── P2. ALREADY COMPLETED ────────────────────────────────────────
test("P2. COMPLETED request → ALREADY_COMPLETED, no new attempt", async () => {
  const request = await createRequest({});
  await markPortalAccessCompleted(request.id, { portalLogin: request.email });
  const before = await getPortalAccessRequest(request.id);

  const result = await processPortalAccessRequest(request.id);
  assert.equal(result.status, "ALREADY_COMPLETED");
  assert.equal(result.request?.status, PortalAccessStatus.COMPLETED);
  assert.equal(before?.attemptCount, 0, "no attempt counter increment");
});

// ── P3. ALREADY PROCESSING ───────────────────────────────────────
test("P3. PROCESSING request → ALREADY_PROCESSING, no rework", async () => {
  const request = await createRequest({});
  await prisma.portalAccessRequest.update({
    where: { id: request.id },
    data: { status: PortalAccessStatus.PROCESSING, attemptCount: 1 },
  });
  const before = await getPortalAccessRequest(request.id);

  const result = await processPortalAccessRequest(request.id);
  assert.equal(result.status, "ALREADY_PROCESSING");
  assert.equal(before?.attemptCount, 1);
});

// ── P4. MISSING PASSWORD CONFIG ──────────────────────────────────
test("P4. no portal password → CONFIGURATION + FAILED row, registration never called", async () => {
  const request = await createRequest({});
  const previous = process.env.PORTAL_PASSWORD;
  try {
    delete process.env.PORTAL_PASSWORD;
    let registrationCalled = false;
    const result = await processPortalAccessRequest(request.id, {
      registration: async () => {
        registrationCalled = true;
        return { success: true, message: "must not run" };
      },
    });

    assert.equal(result.status, "CONFIGURATION");
    assert.equal(result.errorCode, "CONFIGURATION");
    assert.equal(registrationCalled, false);
    assert.equal(result.request?.status, PortalAccessStatus.FAILED);
    assert.match(result.request?.errorMessage ?? "", /not configured/i);
  } finally {
    if (previous === undefined) delete process.env.PORTAL_PASSWORD;
    else process.env.PORTAL_PASSWORD = previous;
  }
});

// ── P5. HAPPY PATH ───────────────────────────────────────────────
test("P5. successful registration → COMPLETED with portalLogin=email", async () => {
  const spy = successRegistration();
  const request = await createRequest({ course: "PTE Academic" });

  await withPortalPassword(async () => {
    const result = await processPortalAccessRequest(request.id, {
      processedBy: "staff@anu.in",
      registration: spy.fn,
    });

    assert.equal(result.status, "COMPLETED");
    assert.equal(result.request?.status, PortalAccessStatus.COMPLETED);
    assert.equal(result.request?.portalLogin, request.email);
    assert.equal(result.request?.processedBy, "staff@anu.in");
    assert.equal(result.request?.attemptCount, 1);
    assert.match(result.request?.notes ?? "", /Registration completed/i);
    assert.equal(spy.calls.length, 1);
    assert.equal(spy.calls[0].name, request.studentName);
    assert.equal(spy.calls[0].email, request.email);
    assert.equal(spy.calls[0].course, "pte");
  });
});

// ── P6. REGISTRATION FAILURE + RETRYABILITY ──────────────────────
test("P6. registration failure → FAILED with errorMessage; RETRY returns it to PENDING", async () => {
  const request = await createRequest({});

  await withPortalPassword(async () => {
    const result = await processPortalAccessRequest(request.id, {
      registration: async () => ({
        success: false,
        message: "Portal registration failed. Please inspect the portal response.",
        errorCode: "REGISTRATION_FAILED" as const,
        errorMessage: "Portal registration failed with an unknown error.",
      }),
    });

    assert.equal(result.status, "FAILED");
    assert.equal(result.errorCode, "REGISTRATION_FAILED");
    assert.equal(result.request?.status, PortalAccessStatus.FAILED);
    assert.match(result.request?.errorMessage ?? "", /failed/i);
    assert.ok(result.request?.failedAt, "failedAt recorded");
  });

  const retried = await retryPortalAccess(request.id);
  assert.equal(retried.status, PortalAccessStatus.PENDING, "manual retry restores PENDING");
});

// ── P6b. PROCESS ON FAILED = IMPLICIT RETRY (preserved behavior) ─
test("P6b. PROCESS on a FAILED request is an implicit retry → COMPLETED", async () => {
  const request = await createRequest({});
  await markPortalAccessFailed(request.id, "previous failure");

  const spy = successRegistration();
  await withPortalPassword(async () => {
    const result = await processPortalAccessRequest(request.id, {
      processedBy: "staff@anu.in",
      registration: spy.fn,
    });

    assert.equal(result.status, "COMPLETED");
    assert.equal(result.request?.status, PortalAccessStatus.COMPLETED);
    assert.equal(result.request?.attemptCount, 1);
    assert.equal(spy.calls.length, 1);
  });
});

// ── P7. TRUE CONCURRENCY — ONE registration, guaranteed ─────────
test("P7. two racing PROCESS calls → exactly one registration runs", async () => {
  const request = await createRequest({});

  await withPortalPassword(async () => {
    let registrationCalls = 0;
    const countRegistration: PortalRegistrationFn = async (input) => {
      registrationCalls += 1;
      // Simulate real work so the race is genuinely concurrent.
      await new Promise((resolve) => setTimeout(resolve, 40));
      return {
        success: true,
        message: "Registration completed successfully.",
        portalLogin: input.email,
      };
    };

    const results = await Promise.all([
      processPortalAccessRequest(request.id, { registration: countRegistration }),
      processPortalAccessRequest(request.id, { registration: countRegistration }),
    ]);

    assert.equal(registrationCalls, 1, "only ONE caller owns the browser/registration");
    const completed = results.filter((r) => r.status === "COMPLETED");
    assert.equal(completed.length, 1);
    const losers = results.filter((r) => r.status !== "COMPLETED");
    assert.equal(losers.length, 1);
    assert.ok(
      losers[0].status === "ALREADY_PROCESSING" ||
        losers[0].status === "ALREADY_COMPLETED",
      `loser sees the winner's state, got ${losers[0].status}`,
    );
    assert.equal(completed[0].request?.status, PortalAccessStatus.COMPLETED);
  });
});

// ── P8. UNMAPPABLE COURSE ─────────────────────────────────────────
test("P8. unmappable course → FAILED before any registration runs", async () => {
  const request = await createRequest({ course: "Quantum Rocket Science" });
  let registrationCalled = false;

  await withPortalPassword(async () => {
    const result = await processPortalAccessRequest(request.id, {
      registration: async () => {
        registrationCalled = true;
        return { success: true, message: "must not run" };
      },
    });

    assert.equal(result.status, "FAILED");
    assert.equal(registrationCalled, false);
    assert.equal(result.request?.status, PortalAccessStatus.FAILED);
    assert.match(result.request?.errorMessage ?? "", /no portal course mapping/i);
  });
});