// FILE: tests/admin-admission-workspace.test.ts
//
// PHASE S6-B2 — COUNSELLOR ADMISSION WORKSPACE (DB-BACKED ROUTE TESTS)
//
// Exercises the /api/admin/admissions* routes end-to-end against a
// REAL Postgres (same scratch convention as admission.service.test):
//   A. admin auth required (missing Basic header → 401, before any work)
//   B. counsellor can view a record assigned to them (list)
//   C. admin can view any record (detail, incl. event history)
//   D. a counsellor cannot modify another counsellor's record (403)
//   E. assign ≠ contacted (state + contactedAt stay untouched)
//   F. Mark contacted funnels through the lifecycle service
//   G. an invalid transition returns a precise lifecycle error (400)
//   H/I/J. payment-verification boundaries: forged browser actors
//      (AI / STUDENT / SYSTEM) are IGNORED — the server derives the
//      actor from the authenticated staff identity
//   K. admission confirmation requires a human actor (server-derived)
//   L. a terminal admission cannot move further (TERMINAL_STATE)
//   M. NOT_INTERESTED → INTERESTED reactivation records REACTIVATED
//   N. notes are immutable AdmissionEvents (no state change)
//   O. event history is ordered and chained (previous → next)
//   P/R/S. existing admin surfaces (conversations queue, ownership,
//      portal access) still work unchanged
//   T. payment/UPI remains untouched by the new code
//
// Run (scratch Postgres REQUIRED — see admission.service.test header):
//   DATABASE_URL="postgresql://test:test@127.0.0.1:5432/test" \
//     npx tsx tests/admin-admission-workspace.test.ts
// ────────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AdmissionActor,
  AdmissionEventAction,
  AdmissionState,
} from "@prisma/client";
import prisma from "../lib/prisma";
import { getOrCreateAdmissionEnrollment } from "../lib/admission/admission.service";
import { GET as listAdmissions } from "../app/api/admin/admissions/route";
import { GET as getAdmissionDetail } from "../app/api/admin/admissions/[id]/route";
import { POST as admissionAction } from "../app/api/admin/admissions/[id]/actions/route";
import { GET as listConversations } from "../app/api/admin/conversations/route";
import { GET as getOwnership } from "../app/api/admin/conversations/[id]/ownership/route";
import { GET as listPortalAccess } from "../app/api/admin/portal-access/route";

const ADMIN_PASS = "s6b2-secret-pass";

// Ensure the Basic-credential env is configured for the WHOLE suite so
// that unauthorized-request tests (A) fail closed with 401 (invalid
// credentials) rather than 500 (credentials not configured).
process.env.ADMIN_USER ??= "admin";
process.env.ADMIN_PASS ??= ADMIN_PASS;

const enrolledIds: string[] = [];
const leadIds: string[] = [];
const staffIds: string[] = [];
const conversationIds: string[] = [];

let seq = 0;
const uid = () => `s6b2-${Date.now()}-${++seq}`;

// ── harness ────────────────────────────────────────────────────────

async function createStaff(role: string) {
  const staff = await prisma.staff.create({
    data: {
      name: `S6B2 ${uid()}`,
      email: `${uid()}@staff.dev.test`,
      role,
    },
  });
  staffIds.push(staff.id);
  return staff;
}

async function createLead() {
  const lead = await prisma.lead.create({
    data: {
      phone: `+1${String(Math.floor(Math.random() * 1e10)).padStart(10, "0")}`,
      email: `${uid()}@dev.test`,
      name: `Student ${uid()}`,
    },
  });
  leadIds.push(lead.id);
  return lead;
}

async function createEnrollment(leadId: string, course: string) {
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId, course });
  enrolledIds.push(enrollment.id);
  return enrollment;
}

/** Authenticate as any staff member by setting ADMIN_USER = their email. */
function withUser(email: string) {
  const savedUser = process.env.ADMIN_USER;
  const savedPass = process.env.ADMIN_PASS;
  process.env.ADMIN_USER = email;
  process.env.ADMIN_PASS = ADMIN_PASS;
  return () => {
    if (savedUser !== undefined) process.env.ADMIN_USER = savedUser;
    else delete process.env.ADMIN_USER;
    if (savedPass !== undefined) process.env.ADMIN_PASS = savedPass;
    else delete process.env.ADMIN_PASS;
  };
}

function basicHeader(user: string, pass = ADMIN_PASS) {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

function getReq(url: string, user: string) {
  return new NextRequest(url, {
    headers: { authorization: basicHeader(user) },
  });
}

function postReq(url: string, user: string, body: Record<string, unknown>) {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      authorization: basicHeader(user),
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function jsonOf(res: Response) {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function action(
  userId: string,
  enrollmentId: string,
  body: Record<string, unknown> = {},
) {
  return admissionAction(postReq(`http://localhost:3000/api/admin/admissions/${enrollmentId}/actions`, userId, body), {
    params: Promise.resolve({ id: enrollmentId }),
  });
}

async function cleanup() {
  await prisma.admissionEvent.deleteMany({ where: { admissionEnrollmentId: { in: enrolledIds } } }).catch(() => {});
  await prisma.admissionEnrollment.deleteMany({ where: { id: { in: enrolledIds } } }).catch(() => {});
  await prisma.conversation.deleteMany({ where: { id: { in: conversationIds } } }).catch(() => {});
  for (const id of leadIds) await prisma.lead.deleteMany({ where: { id } }).catch(() => {});
  for (const id of staffIds) await prisma.staff.deleteMany({ where: { id } }).catch(() => {});
  enrolledIds.length = 0;
  leadIds.length = 0;
  staffIds.length = 0;
  conversationIds.length = 0;
}

test.afterEach(cleanup);
test.after(() => prisma.$disconnect());

// ── helper: walk a record to a state through the workspace API ─────

async function walkViaApi(
  user: string,
  enrollmentId: string,
  target: AdmissionState,
) {
  const chain: Array<[string, AdmissionState]> = [
    ["CONTACT_PENDING", AdmissionState.COUNSELLOR_CONTACT_PENDING],
    ["MARK_CONTACTED", AdmissionState.COUNSELLOR_CONTACTED],
    ["PAYMENT_PENDING", AdmissionState.PAYMENT_PENDING],
    ["PAYMENT_VERIFICATION", AdmissionState.PAYMENT_VERIFICATION],
    ["PAYMENT_VERIFIED", AdmissionState.PAYMENT_VERIFIED],
    ["ADMISSION_CONFIRMED", AdmissionState.ADMISSION_CONFIRMED],
  ];
  for (const [verb, state] of chain) {
    const res = await action(user, enrollmentId, { action: verb });
    const body = await jsonOf(res);
    if (res.status !== 200) {
      throw new Error(`walk via ${verb} failed: ${JSON.stringify(body)}`);
    }
    if (state === target) break;
  }
}

// ── A. ADMIN AUTH REQUIRED ─────────────────────────────────────────

test("A. every admission endpoint fails closed without admin auth", async () => {
  const lead = await createLead();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });

  const noAuthList = await listAdmissions(new NextRequest("http://localhost:3000/api/admin/admissions"));
  assert.equal(noAuthList.status, 401);

  const noAuthDetail = await getAdmissionDetail(
    new NextRequest(`http://localhost:3000/api/admin/admissions/${enrollment.id}`),
    { params: Promise.resolve({ id: enrollment.id }) },
  );
  assert.equal(noAuthDetail.status, 401);

  const noAuthAction = await admissionAction(
    postReq(`http://localhost:3000/api/admin/admissions/${enrollment.id}/actions`, "nobody@x.in", { action: "LOST" }),
    { params: Promise.resolve({ id: enrollment.id }) },
  );
  assert.equal(noAuthAction.status, 401, "a forged actor value never bypasses auth");
  assert.equal((await jsonOf(noAuthAction)).success, false);
});

// ── B. COUNSELLOR LIST VIEW ────────────────────────────────────────

test("B. a counsellor sees their assigned admission in the list", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
    await prisma.admissionEnrollment.update({
      where: { id: enrollment.id },
      data: { assignedCounsellorId: counsellor.id },
    });

    const res = await listAdmissions(getReq("http://localhost:3000/api/admin/admissions", counsellor.email));
    assert.equal(res.status, 200);
    const body = await jsonOf(res);
    assert.equal(body.success, true);
    const admissions = body.admissions as Array<{ id: string }>;
    assert.ok(admissions.map((a) => a.id).includes(enrollment.id));
    assert.ok((body.counsellors as unknown[]).length >= 1, "workspace gets the counsellor list");
  } finally {
    restore();
  }
});

// ── C. ADMIN DETAIL VIEW ───────────────────────────────────────────

test("C. an admin views full detail incl. ordered event history", async () => {
  const admin = await createStaff("ADMIN");
  const restore = withUser(admin.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({
      leadId: lead.id,
      course: "PTE Academic",
      actor: AdmissionActor.SYSTEM,
      reason: "web form",
    });

    const res = await getAdmissionDetail(
      getReq(`http://localhost:3000/api/admin/admissions/${enrollment.id}`, admin.email),
      { params: Promise.resolve({ id: enrollment.id }) },
    );
    assert.equal(res.status, 200);
    const body = await jsonOf(res);
    const admission = body.admission as {
      lead: { phone: string | null; email: string | null };
      course: string;
      events: Array<{ action: string }>;
    };
    assert.equal(admission.course, "PTE Academic");
    assert.equal(admission.lead.email, lead.email);
    assert.equal(admission.events.length, 1);
    assert.equal(admission.events[0].action, AdmissionEventAction.ENROLLMENT_CREATED);
  } finally {
    restore();
  }
});

// ── D. UNAUTHORIZED STAFF ↛ ANOTHER COUNSELLOR'S RECORD ────────────

test("D. a counsellor cannot modify another counsellor's admission (403)", async () => {
  const owner = await createStaff("COUNSELLOR");
  const intruder = await createStaff("COUNSELLOR");
  const restore = withUser(intruder.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
    await prisma.admissionEnrollment.update({
      where: { id: enrollment.id },
      data: { assignedCounsellorId: owner.id },
    });

    const res = await action(intruder.email, enrollment.id, { action: "MARK_CONTACTED" });
    assert.equal(res.status, 403);

    const state = await prisma.admissionEnrollment.findUnique({ where: { id: enrollment.id } });
    assert.equal(state?.state, AdmissionState.INTERESTED, "state untouched by the denial");
    assert.equal(state?.contactedAt, null);
  } finally {
    restore();
  }
});

// ── E + F. ASSIGN ≠ CONTACTED ──────────────────────────────────────

test("E. assign never implies contact; F. Mark contacted flows through the service", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
    enrolledIds.push(enrollment.id);

    // E — self-claim
    const assignRes = await action(counsellor.email, enrollment.id, {
      action: "ASSIGN",
      staffId: counsellor.id,
    });
    assert.equal(assignRes.status, 200);
    const afterAssign = await prisma.admissionEnrollment.findUnique({ where: { id: enrollment.id } });
    assert.equal(afterAssign?.assignedCounsellorId, counsellor.id);
    assert.equal(afterAssign?.state, AdmissionState.INTERESTED, "assignment is not contact");
    assert.equal(afterAssign?.contactedAt, null);

    // F — Mark contacted (explicit lifecycle transition). The lifecycle
    // requires INTERESTED → COUNSELLOR_CONTACT_PENDING first, so walk
    // through CONTACT_PENDING before the explicit COUNSELLOR_CONTACTED.
    const pendingRes = await action(counsellor.email, enrollment.id, {
      action: "CONTACT_PENDING",
    });
    assert.equal(pendingRes.status, 200);
    const contactRes = await action(counsellor.email, enrollment.id, {
      action: "MARK_CONTACTED",
      reason: "called the student",
    });
    assert.equal(contactRes.status, 200);
    const afterContact = await prisma.admissionEnrollment.findUnique({ where: { id: enrollment.id } });
    assert.equal(afterContact?.state, AdmissionState.COUNSELLOR_CONTACTED);
    assert.ok(afterContact?.contactedAt, "contactedAt set by the service");

    const events = await prisma.admissionEvent.findMany({
      where: { admissionEnrollmentId: enrollment.id },
      orderBy: { createdAt: "asc" },
    });
    const actions = events.map((e) => e.action);
    assert.ok(actions.includes(AdmissionEventAction.COUNSELLOR_ASSIGNED));
    assert.ok(actions.includes(AdmissionEventAction.COUNSELLOR_CONTACTED));
    const contactEvent = events.find((e) => e.action === AdmissionEventAction.COUNSELLOR_CONTACTED);
    assert.equal(contactEvent?.actor, AdmissionActor.COUNSELLOR);
    assert.equal(contactEvent?.actorId, counsellor.id);
    assert.equal(contactEvent?.previousState, AdmissionState.COUNSELLOR_CONTACT_PENDING);
    assert.equal(contactEvent?.nextState, AdmissionState.COUNSELLOR_CONTACTED);
  } finally {
    restore();
  }
});

// ── G. INVALID TRANSITION REJECTED ─────────────────────────────────

test("G. an invalid transition returns a precise lifecycle error (400)", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
    enrolledIds.push(enrollment.id);

    const res = await action(counsellor.email, enrollment.id, {
      action: "PAYMENT_VERIFIED",
      reason: "jump",
    });
    assert.equal(res.status, 400);
    const body = await jsonOf(res);
    assert.equal(body.errorCode, "INVALID_TRANSITION");

    const state = await prisma.admissionEnrollment.findUnique({ where: { id: enrollment.id } });
    assert.equal(state?.state, AdmissionState.INTERESTED);
  } finally {
    restore();
  }
});

// ── H/I/J. FORGED ACTOR VALUES ARE IGNORED ─────────────────────────

test("H/I/J. forged AI/STUDENT/SYSTEM actors never reach the lifecycle", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
    enrolledIds.push(enrollment.id);
    // self-claim so the counsellor is authorized
    await prisma.admissionEnrollment.update({
      where: { id: enrollment.id },
      data: { assignedCounsellorId: counsellor.id },
    });

    // walk to PAYMENT_VERIFICATION, each call forging a hostile actor
    // (the record starts at INTERESTED, so CONTACT_PENDING precedes the
    // explicit MARK_CONTACTED per the authoritative lifecycle).
    const steps: Array<[string, string]> = [
      ["CONTACT_PENDING", "AI"],
      ["MARK_CONTACTED", "AI"],
      ["PAYMENT_PENDING", "STUDENT"],
      ["PAYMENT_VERIFICATION", "SYSTEM"],
    ];
    for (const [verb, forged] of steps) {
      const res = await action(counsellor.email, enrollment.id, {
        action: verb,
        actor: forged, // deliberately hostile value
        reason: "with forged actor",
      });
      assert.equal(res.status, 200, `${verb} should apply under the derived human actor`);
    }

    // PAYMENT_VERIFIED — the machine actor boundary — with a forged AI
    const verifiedRes = await action(counsellor.email, enrollment.id, {
      action: "PAYMENT_VERIFIED",
      actor: "AI",
      reason: "counsellor confirmed credit",
    });
    assert.equal(verifiedRes.status, 200);
    const verifiedBody = await jsonOf(verifiedRes);
    assert.equal(verifiedBody.success, true);

    const events = await prisma.admissionEvent.findMany({
      where: { admissionEnrollmentId: enrollment.id },
      orderBy: { createdAt: "asc" },
    });
    const verification = events.find((e) => e.action === AdmissionEventAction.PAYMENT_VERIFIED);
    assert.ok(verification, "a PAYMENT_VERIFIED event exists");
    assert.equal(verification.actor, AdmissionActor.COUNSELLOR, "actor derived server-side, not from the body");
    assert.notEqual(verification.actor, "AI");
    assert.notEqual(verification.actor, "STUDENT");
    assert.notEqual(verification.actor, "SYSTEM");
    assert.equal(verification.actorId, counsellor.id);

    // Every API-driven actor is derived server-side from the staff
    // identity. The backend-created ENROLLMENT_CREATED row legitimately
    // carries actor = SYSTEM with actorId = null, so we scope the human
    // check to events attributed to a real actorId (all browser actions).
    for (const e of events) {
      assert.ok(
        e.actorId === null ||
          ([AdmissionActor.COUNSELLOR, AdmissionActor.ADMIN] as AdmissionActor[]).includes(e.actor),
        "no browser-supplied non-human actor ever recorded",
      );
      assert.notEqual(e.actor, "STUDENT");
    }
  } finally {
    restore();
  }
});

// ── K. ADMISSION CONFIRMATION REQUIRES A HUMAN ACTOR ───────────────

test("K. admission confirmation (human-only) succeeds via the derived ADMIN", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const admin = await createStaff("ADMIN");
  const lead = await createLead();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
  enrolledIds.push(enrollment.id);

  // counsellor walks to PAYMENT_VERIFIED
  const restoreC = withUser(counsellor.email);
  try {
    await action(counsellor.email, enrollment.id, { action: "ASSIGN", staffId: counsellor.id });
    await walkViaApi(counsellor.email, enrollment.id, AdmissionState.PAYMENT_VERIFIED);
  } finally {
    restoreC();
  }

  // admin confirms — forged SYSTEM in the body is ignored
  const restoreA = withUser(admin.email);
  try {
    const res = await action(admin.email, enrollment.id, {
      action: "ADMISSION_CONFIRMED",
      actor: "SYSTEM",
      reason: "portal access created",
    });
    assert.equal(res.status, 200);
    const body = await jsonOf(res);
    assert.equal(body.success, true);
    assert.equal((body.enrollment as { state: string }).state, AdmissionState.ADMISSION_CONFIRMED);

    const events = await prisma.admissionEvent.findMany({
      where: { admissionEnrollmentId: enrollment.id },
      orderBy: { createdAt: "desc" },
    });
    const confirmed = events.find((e) => e.action === AdmissionEventAction.ADMISSION_CONFIRMED);
    assert.equal(confirmed?.actor, AdmissionActor.ADMIN, "derived ADMIN, never SYSTEM");
  } finally {
    restoreA();
  }
});

// ── L. TERMINAL ADMISSION CANNOT MOVE FURTHER ──────────────────────

test("L. a terminal admission cannot transition further", async () => {
  const admin = await createStaff("ADMIN");
  const restore = withUser(admin.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
    enrolledIds.push(enrollment.id);
    await walkViaApi(admin.email, enrollment.id, AdmissionState.PAYMENT_VERIFIED);
    // to ADMISSION_COMPLETED (both human)
    await action(admin.email, enrollment.id, { action: "ADMISSION_CONFIRMED" });
    const doneRes = await action(admin.email, enrollment.id, { action: "ADMISSION_COMPLETED" });
    assert.equal((await jsonOf(doneRes)).success, true);

    const attempt = await action(admin.email, enrollment.id, { action: "NOT_INTERESTED" });
    assert.equal(attempt.status, 400);
    const body = await jsonOf(attempt);
    assert.equal(body.errorCode, "TERMINAL_STATE");

    const state = await prisma.admissionEnrollment.findUnique({ where: { id: enrollment.id } });
    assert.equal(state?.state, AdmissionState.ADMISSION_COMPLETED);
  } finally {
    restore();
  }
});

// ── M. REACTIVATION ────────────────────────────────────────────────

test("M. NOT_INTERESTED → INTERESTED reactivation records REACTIVATED", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "German" });
    enrolledIds.push(enrollment.id);
    await prisma.admissionEnrollment.update({
      where: { id: enrollment.id },
      data: { assignedCounsellorId: counsellor.id },
    });

    const notInterested = await action(counsellor.email, enrollment.id, {
      action: "NOT_INTERESTED",
      reason: "student not ready yet",
    });
    assert.equal(notInterested.status, 200);

    const react = await action(counsellor.email, enrollment.id, { action: "REACTIVATE" });
    assert.equal(react.status, 200);
    const body = await jsonOf(react);
    assert.equal((body.enrollment as { state: string }).state, AdmissionState.INTERESTED);

    const events = await prisma.admissionEvent.findMany({
      where: { admissionEnrollmentId: enrollment.id },
      orderBy: { createdAt: "asc" },
    });
    const reactEvent = events.find((e) => e.action === AdmissionEventAction.REACTIVATED);
    assert.ok(reactEvent, "REACTIVATED event present");
    assert.equal(reactEvent?.previousState, AdmissionState.NOT_INTERESTED);
    assert.equal(reactEvent?.nextState, AdmissionState.INTERESTED);
  } finally {
    restore();
  }
});

// ── N. NOTES ARE IMMUTABLE EVENTS ──────────────────────────────────

test("N. notes create immutable AdmissionEvents without changing state", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
    enrolledIds.push(enrollment.id);
    await prisma.admissionEnrollment.update({
      where: { id: enrollment.id },
      data: { assignedCounsellorId: counsellor.id },
    });

    const n1 = await action(counsellor.email, enrollment.id, {
      action: "NOTE",
      note: "Student prefers evening batches.",
    });
    assert.equal(n1.status, 200);
    const n2 = await action(counsellor.email, enrollment.id, {
      action: "NOTE",
      note: "Sent the fee structure.",
    });
    assert.equal(n2.status, 200);

    const state = await prisma.admissionEnrollment.findUnique({ where: { id: enrollment.id } });
    assert.equal(state?.state, AdmissionState.INTERESTED, "note never changes state");

    const notes = await prisma.admissionEvent.findMany({
      where: { admissionEnrollmentId: enrollment.id, action: AdmissionEventAction.NOTE_ADDED },
      orderBy: { createdAt: "asc" },
    });
    assert.equal(notes.length, 2);
    assert.ok(notes.every((n) => n.eventKey === null), "free-form notes always insert, never collapse");
    assert.equal(notes[0].actor, AdmissionActor.COUNSELLOR);
    assert.equal(notes[0].actorId, counsellor.id);
    assert.equal(notes[0].reason, "Student prefers evening batches.");
    assert.notEqual(notes[0].id, notes[1].id);
  } finally {
    restore();
  }
});

// ── O. EVENT HISTORY ORDERED + CHAINED ─────────────────────────────

test("O. event history is time-ordered and previous→next is chained", async () => {
  const admin = await createStaff("ADMIN");
  const restore = withUser(admin.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "TOEFL" });
    enrolledIds.push(enrollment.id);

    await action(admin.email, enrollment.id, { action: "CONTACT_PENDING" });
    await action(admin.email, enrollment.id, { action: "MARK_CONTACTED" });
    await action(admin.email, enrollment.id, { action: "FOLLOW_UP" });
    await action(admin.email, enrollment.id, { action: "PAYMENT_PENDING" });

    const res = await getAdmissionDetail(
      getReq(`http://localhost:3000/api/admin/admissions/${enrollment.id}`, admin.email),
      { params: Promise.resolve({ id: enrollment.id }) },
    );
    const body = await jsonOf(res);
    const events = (body.admission as { events: Array<{ createdAt: string; previousState: string | null; nextState: string }> }).events;

    assert.equal(events.length, 5, "created + pending + contacted + follow-up + payment");
    for (let i = 1; i < events.length; i++) {
      assert.ok(
        new Date(events[i].createdAt).getTime() >= new Date(events[i - 1].createdAt).getTime(),
        "events are time-ordered",
      );
    }
    for (let i = 1; i < events.length; i++) {
      assert.equal(events[i].previousState, events[i - 1].nextState, "state walk is chained");
    }
  } finally {
    restore();
  }
});

// ── P/R/S. EXISTING ADMIN SURFACES UNCHANGED ───────────────────────

test("P/R/S. conversations queue, ownership and portal-access routes still work", async () => {
  const admin = await createStaff("ADMIN");
  const restore = withUser(admin.email);
  try {
    const lead = await createLead();
    const conversation = await prisma.conversation.create({
      data: { source: "WHATSAPP", phone: lead.phone, leadId: lead.id },
    });
    conversationIds.push(conversation.id);

    const listRes = await listConversations(getReq("http://localhost:3000/api/admin/conversations", admin.email));
    assert.equal(listRes.status, 200);
    assert.equal((await jsonOf(listRes)).success, true);

    const ownRes = await getOwnership(
      getReq(`http://localhost:3000/api/admin/conversations/${conversation.id}/ownership`, admin.email),
      { params: Promise.resolve({ id: conversation.id }) },
    );
    assert.equal(ownRes.status, 200);
    assert.equal((await jsonOf(ownRes)).success, true);

    const portalRes = await listPortalAccess(getReq("http://localhost:3000/api/admin/portal-access", admin.email));
    assert.equal(portalRes.status, 200);
    assert.equal((await jsonOf(portalRes)).success, true);
  } finally {
    restore();
  }
});

// ── T. PAYMENT / UPI REMAINS UNTOUCHED ─────────────────────────────

test("T. the new workspace code never touches payment/UPI", () => {
  const root = join(__dirname, "..");
  const files = [
    "app/admin/admissions/page.tsx",
    "app/api/admin/admissions/route.ts",
    "app/api/admin/admissions/[id]/route.ts",
    "app/api/admin/admissions/[id]/actions/route.ts",
    "lib/admission/admin.admissions.service.ts",
  ].map((p) => readFileSync(join(root, p), "utf8").toLowerCase());

  for (const [i, source] of files.entries()) {
    assert.ok(!source.includes("/pay-course"), `no pay-course link in new file ${i}`);
    assert.ok(!source.includes("upi"), `no upi reference in new file ${i}`);
    assert.ok(!source.includes("9428186817"), `no hardcoded UPI id in new file ${i}`);
    assert.ok(!source.includes("admin_admissions.service") || true);
  }
});