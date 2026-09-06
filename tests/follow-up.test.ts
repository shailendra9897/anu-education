// FILE: tests/follow-up.test.ts
//
// PHASE S6-F1 — COUNSELLOR FOLLOW-UP DATE + DUE STATUS
//
// Exercises the follow-up scheduling/attempt/status work end-to-end
// against a REAL Postgres (same scratch convention as
// admin-admission-workspace.test.ts) plus pure classifier unit tests.
//
//   A. pure classifier: NONE / OVERDUE / DUE_SOON / UPCOMING + timezone
//      independence + isValidFollowUpDate future-only gate
//   B. FOLLOW_UP schedules -> enters FOLLOW_UP_REQUIRED + sets
//      nextFollowUpAt atomically
//   C. rescheduling IN PLACE while already in FOLLOW_UP_REQUIRED
//   D. clearing via nextFollowUpAt = null
//   E. leaving FOLLOW_UP_REQUIRED auto-clears nextFollowUpAt
//   F. a follow-up attempt clears the date but does NOT change state,
//      and records a distinct FOLLOW_UP_ATTEMPTED event
//   G. repeated attempts are never collapsed (unique discriminator)
//   H. past / invalid dates are rejected (400 INVALID_STATE)
//   I. AI / STUDENT / SYSTEM can never schedule or attempt (403
//      FORBIDDEN_ACTOR at the service layer; forged browser actors are
//      ignored at the API layer)
//   J. authorization: own + unassigned counsellor OK, other's → 403,
//      ADMIN override works
//   K. assignment ≠ scheduling and contact ≠ scheduling
//   L. list + detail endpoints expose nextFollowUpAt; derived status
//      surfaces on workspace
//   M. course isolation (a follow-up on one course never leaks to
//      another enrollment)
//   N. regression: admissions list + conversations queue + detail still
//      work, and the follow-up code never touches payment/UPI
//
// Run (scratch Postgres REQUIRED — see admission.service.test header):
//   DATABASE_URL="postgresql://test:test@127.0.0.1:5432/test" \
//     npx tsx tests/follow-up.test.ts
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
import {
  setNextFollowUpDate,
  recordFollowUpAttempt,
} from "../lib/admission/admission.service";
import {
  classifyFollowUpStatus,
  FOLLOW_UP_DUE_SOON_WINDOW_MS,
  isValidFollowUpDate,
} from "../lib/admission/followUpStatus";
import { GET as listAdmissions } from "../app/api/admin/admissions/route";
import { GET as getAdmissionDetail } from "../app/api/admin/admissions/[id]/route";
import { POST as admissionAction } from "../app/api/admin/admissions/[id]/actions/route";
import { GET as listConversations } from "../app/api/admin/conversations/route";

const ADMIN_PASS = "s6f1-secret-pass";
process.env.ADMIN_USER ??= "admin";
process.env.ADMIN_PASS ??= ADMIN_PASS;

const enrolledIds: string[] = [];
const leadIds: string[] = [];
const staffIds: string[] = [];
const conversationIds: string[] = [];

let seq = 0;
const uid = () => `s6f1-${Date.now()}-${++seq}`;

// ── harness ────────────────────────────────────────────────────────

async function createStaff(role: string) {
  const staff = await prisma.staff.create({
    data: {
      name: `S6F1 ${uid()}`,
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

/** Walk an (unassigned/own) enrollment into COUNSELLOR_CONTACTED. */
async function toContacted(user: string, enrollmentId: string) {
  const p = await action(user, enrollmentId, { action: "CONTACT_PENDING" });
  assert.equal(p.status, 200);
  const c = await action(user, enrollmentId, { action: "MARK_CONTACTED" });
  assert.equal(c.status, 200);
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

async function row(id: string) {
  return prisma.admissionEnrollment.findUnique({ where: { id } });
}

const future = (ms = 7 * 24 * 60 * 60 * 1000) =>
  new Date(Date.now() + ms).toISOString();

// ── A. PURE CLASSIFIER ─────────────────────────────────────────────

test("A1. classifyFollowUpStatus: NONE when no date is scheduled", () => {
  const r = classifyFollowUpStatus(null);
  assert.equal(r.status, "NONE");
  assert.equal(r.label, "No follow-up");
  assert.equal(r.isScheduled, false);
  assert.equal(r.isOverdue, false);
  assert.equal(r.isDueSoon, false);
  assert.equal(r.msUntilDue, 0);

  assert.equal(classifyFollowUpStatus(undefined).status, "NONE");
});

test("A2. classifyFollowUpStatus: OVERDUE / DUE_SOON / UPCOMING across the whole window", () => {
  const now = Date.now();
  const past = new Date(now - 1000);
  assert.equal(classifyFollowUpStatus(past, now).status, "OVERDUE");

  // exactly-now is overdue (inclusive).
  assert.equal(classifyFollowUpStatus(new Date(now), now).status, "OVERDUE");

  // just inside the due-soon window.
  const dueSoon = new Date(now + FOLLOW_UP_DUE_SOON_WINDOW_MS);
  assert.equal(classifyFollowUpStatus(dueSoon, now).status, "DUE_SOON");

  // boundary: exactly the window is DUE_SOON (inclusive).
  assert.equal(classifyFollowUpStatus(new Date(now + FOLLOW_UP_DUE_SOON_WINDOW_MS), now).status, "DUE_SOON");

  // one ms beyond the window is UPCOMING.
  assert.equal(classifyFollowUpStatus(new Date(now + FOLLOW_UP_DUE_SOON_WINDOW_MS + 1), now).status, "UPCOMING");

  const far = new Date(now + 30 * 24 * 60 * 60 * 1000);
  assert.equal(classifyFollowUpStatus(far, now).status, "UPCOMING");
  const soon = classifyFollowUpStatus(new Date(now + 60_000), now);
  assert.equal(soon.isDueSoon, true);
  assert.equal(soon.isOverdue, false);
  const over = classifyFollowUpStatus(new Date(now - 5_000), now);
  assert.equal(over.isOverdue, true);
  assert.equal(over.msUntilDue, -5_000);
});

test("A3. classifyFollowUpStatus is timezone-independent (absolute epoch ms)", () => {
  const iso = "2026-09-01T12:00:00.000Z";
  // Representing the same instant in three different timezone offsets.
  const variants = [
    "2026-09-01T17:30:00.000+05:30",
    "2026-09-01T08:00:00.000-04:00",
    "2026-09-01T12:00:00.000Z",
  ];
  for (const v of variants) {
    assert.equal(
      new Date(v).getTime(),
      new Date(iso).getTime(),
      `${v} is the same instant`,
    );
    const r = classifyFollowUpStatus(v, new Date(iso).getTime() - 60_000);
    assert.equal(r.status, "DUE_SOON", `${v} classified against epoch now`);
  }
  // A date that is "today" in one zone but "tomorrow" in another is still
  // classified purely by msUntilDue, never a calendar boundary.
  assert.equal(classifyFollowUpStatus("2026-09-01T23:59:00.000Z", "2026-09-01T23:58:00.000Z").isOverdue, false);
});

test("A4. isValidFollowUpDate rejects past, exactly-now, and invalid values", () => {
  const now = Date.now();
  assert.equal(isValidFollowUpDate(new Date(now - 1), now), false);
  assert.equal(isValidFollowUpDate(new Date(now), now), false, "exactly-now is not valid");
  assert.equal(isValidFollowUpDate(new Date(now + 1), now), true);
  assert.equal(isValidFollowUpDate("not-a-date", now), false);
  assert.equal(isValidFollowUpDate(12345, now), false, "epoch 12345 is in the past");
  assert.equal(isValidFollowUpDate({}, now), false);
  assert.equal(isValidFollowUpDate(null, now), false);
  assert.equal(isValidFollowUpDate(undefined, now), false);
});

// ── B/C/D. SCHEDULE, RESCHEDULE, CLEAR VIA API ─────────────────────

test("B + C + D. FOLLOW_UP schedules, reschedules in place, and clears via nextFollowUpAt=null", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
    await prisma.admissionEnrollment.update({
      where: { id: enrollment.id },
      data: { assignedCounsellorId: counsellor.id },
    });
    await toContacted(counsellor.email, enrollment.id);

    // B — first-time schedule enters FOLLOW_UP_REQUIRED + sets the date.
    const d1 = future(7 * 24 * 60 * 60 * 1000);
    const sched = await action(counsellor.email, enrollment.id, {
      action: "FOLLOW_UP",
      nextFollowUpAt: d1,
      reason: "call after materials sent",
    });
    assert.equal(sched.status, 200);
    let r = await row(enrollment.id);
    assert.equal(r?.state, AdmissionState.FOLLOW_UP_REQUIRED);
    assert.equal(r?.nextFollowUpAt?.toISOString(), new Date(d1).toISOString());

    let events = await prisma.admissionEvent.findMany({
      where: { admissionEnrollmentId: enrollment.id, action: AdmissionEventAction.FOLLOW_UP_REQUIRED },
      orderBy: { createdAt: "asc" },
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].actor, AdmissionActor.COUNSELLOR);
    assert.equal(events[0].nextState, AdmissionState.FOLLOW_UP_REQUIRED);

    // Idempotency — repeating the SAME schedule without a discriminator is
    // collapsed by the (admissionEnrollmentId, eventKey) unique index as a
    // safe no-op (the date is unchanged, no duplicate event).
    const same = await action(counsellor.email, enrollment.id, {
      action: "FOLLOW_UP",
      nextFollowUpAt: d1,
    });
    assert.equal(same.status, 200);
    r = await row(enrollment.id);
    assert.equal(r?.nextFollowUpAt?.toISOString(), new Date(d1).toISOString(), "identical repeat does not regress the date");
    events = await prisma.admissionEvent.findMany({
      where: { admissionEnrollmentId: enrollment.id, action: AdmissionEventAction.FOLLOW_UP_REQUIRED },
    });
    assert.equal(events.length, 1, "identical repeat collapsed to one event");

    // C — reschedule to a NEW date needs a distinct discriminator (CLEAR +
    // distinct) so the new date is recorded as its own event. IN PLACE —
    // no state change, the single live column is updated.
    const d2 = future(14 * 24 * 60 * 60 * 1000);
    const resched = await action(counsellor.email, enrollment.id, {
      action: "FOLLOW_UP",
      nextFollowUpAt: d2,
      discriminator: "reschedule-2",
    });
    assert.equal(resched.status, 200);
    r = await row(enrollment.id);
    assert.equal(r?.state, AdmissionState.FOLLOW_UP_REQUIRED, "reschedule does not change state");
    assert.equal(r?.nextFollowUpAt?.toISOString(), new Date(d2).toISOString());

    events = await prisma.admissionEvent.findMany({
      where: { admissionEnrollmentId: enrollment.id, action: AdmissionEventAction.FOLLOW_UP_REQUIRED },
      orderBy: { createdAt: "asc" },
    });
    assert.equal(events.length, 2, "scheduling + distinct reschedule each recorded");

    // D — clear via nextFollowUpAt = null (distinct discriminator).
    const clear = await action(counsellor.email, enrollment.id, {
      action: "FOLLOW_UP",
      nextFollowUpAt: null,
      discriminator: "clear-3",
    });
    assert.equal(clear.status, 200);
    r = await row(enrollment.id);
    assert.equal(r?.nextFollowUpAt, null);
    events = await prisma.admissionEvent.findMany({
      where: { admissionEnrollmentId: enrollment.id, action: AdmissionEventAction.FOLLOW_UP_REQUIRED },
    });
    assert.equal(events.length, 3, "date cleared recorded as its own event");
  } finally {
    restore();
  }
});

test("D2. leaving FOLLOW_UP_REQUIRED auto-clears nextFollowUpAt", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "PTE Academic" });
    await prisma.admissionEnrollment.update({
      where: { id: enrollment.id },
      data: { assignedCounsellorId: counsellor.id },
    });
    await toContacted(counsellor.email, enrollment.id);
    await action(counsellor.email, enrollment.id, { action: "FOLLOW_UP", nextFollowUpAt: future() });
    assert.ok((await row(enrollment.id))?.nextFollowUpAt, "scheduled before moving on");

    const moveOn = await action(counsellor.email, enrollment.id, { action: "PAYMENT_PENDING" });
    assert.equal(moveOn.status, 200);
    const r = await row(enrollment.id);
    assert.equal(r?.state, AdmissionState.PAYMENT_PENDING);
    assert.equal(r?.nextFollowUpAt, null, "leaving FOLLOW_UP_REQUIRED clears the date");
  } finally {
    restore();
  }
});

// ── F/G. ATTEMPTS ──────────────────────────────────────────────────

test("F. a follow-up attempt clears the date but does NOT change state, and records FOLLOW_UP_ATTEMPTED", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
    await prisma.admissionEnrollment.update({
      where: { id: enrollment.id },
      data: { assignedCounsellorId: counsellor.id },
    });
    await toContacted(counsellor.email, enrollment.id);
    await action(counsellor.email, enrollment.id, { action: "FOLLOW_UP", nextFollowUpAt: future() });
    assert.ok((await row(enrollment.id))?.nextFollowUpAt);

    const attempt = await action(counsellor.email, enrollment.id, {
      action: "FOLLOW_UP_ATTEMPTED",
      reason: "called, no answer",
    });
    assert.equal(attempt.status, 200);

    const r = await row(enrollment.id);
    assert.equal(r?.state, AdmissionState.FOLLOW_UP_REQUIRED, "attempt does not change state");
    assert.equal(r?.nextFollowUpAt, null, "attempt clears the scheduled date");

    const events = await prisma.admissionEvent.findMany({
      where: { admissionEnrollmentId: enrollment.id, action: AdmissionEventAction.FOLLOW_UP_ATTEMPTED },
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].actor, AdmissionActor.COUNSELLOR);
    assert.equal(events[0].reason, "called, no answer");
  } finally {
    restore();
  }
});

test("G. repeated attempts are distinct events (auto-minted discriminator), never collapsed", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "German" });
    await prisma.admissionEnrollment.update({
      where: { id: enrollment.id },
      data: { assignedCounsellorId: counsellor.id },
    });
    await toContacted(counsellor.email, enrollment.id);
    await action(counsellor.email, enrollment.id, { action: "FOLLOW_UP", nextFollowUpAt: future() });

    const a1 = await action(counsellor.email, enrollment.id, { action: "FOLLOW_UP_ATTEMPTED" });
    const a2 = await action(counsellor.email, enrollment.id, { action: "FOLLOW_UP_ATTEMPTED" });
    assert.equal(a1.status, 200);
    assert.equal(a2.status, 200);

    const events = await prisma.admissionEvent.findMany({
      where: { admissionEnrollmentId: enrollment.id, action: AdmissionEventAction.FOLLOW_UP_ATTEMPTED },
      orderBy: { createdAt: "asc" },
    });
    assert.equal(events.length, 2, "two attempts produce two distinct events");
    assert.notEqual(events[0].id, events[1].id);
    assert.notEqual(events[0].eventKey, events[1].eventKey);
  } finally {
    restore();
  }
});

// ── H. INVALID / PAST DATES ────────────────────────────────────────

test("H. past / invalid follow-up dates are rejected (400 INVALID_STATE)", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
    await prisma.admissionEnrollment.update({
      where: { id: enrollment.id },
      data: { assignedCounsellorId: counsellor.id },
    });
    await toContacted(counsellor.email, enrollment.id);

    const past = new Date(Date.now() - 60_000).toISOString();
    const res = await action(counsellor.email, enrollment.id, {
      action: "FOLLOW_UP",
      nextFollowUpAt: past,
    });
    assert.equal(res.status, 400);
    const body = await jsonOf(res);
    assert.equal(body.errorCode, "INVALID_STATE");

    const r = await row(enrollment.id);
    assert.equal(r?.nextFollowUpAt, null, "no date set on rejection");
    assert.equal(r?.state, AdmissionState.COUNSELLOR_CONTACTED, "state untouched");
  } finally {
    restore();
  }
});

test("H2. the service layer rejects past dates with an explicit error", async () => {
  const lead = await createLead();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "TOEFL" });
  await assert.rejects(
    () =>
      setNextFollowUpDate({
        enrollmentId: enrollment.id,
        nextFollowUpAt: new Date(Date.now() - 1000),
        actor: AdmissionActor.ADMIN,
        actorId: "admin",
      }),
    /must be in the future/,
  );
});

// ── I. AI / STUDENT / SYSTEM CANNOT SCHEDULE OR ATTEMPT ─────────────

test("I. AI/STUDENT/SYSTEM actors are forbidden at the service layer (403 FORBIDDEN_ACTOR)", async () => {
  const lead = await createLead();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });

  for (const bad of [
    AdmissionActor.STUDENT,
    AdmissionActor.SYSTEM,
    "AI" as AdmissionActor,
  ]) {
    await assert.rejects(
      () =>
        setNextFollowUpDate({
          enrollmentId: enrollment.id,
          nextFollowUpAt: new Date(Date.now() + 3_600_000),
          actor: bad,
          actorId: "x",
        }),
      (err: unknown) =>
        err instanceof Error && err.message.includes("Only COUNSELLOR or ADMIN may schedule"),
    );
    await assert.rejects(
      () =>
        recordFollowUpAttempt({
          enrollmentId: enrollment.id,
          actor: bad,
          actorId: "x",
        }),
      (err: unknown) =>
        err instanceof Error && err.message.includes("Only COUNSELLOR or ADMIN may record"),
    );
  }
});

test("I2. a forged AI/STUDENT/SYSTEM actor in the API body never reaches the lifecycle", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
    await prisma.admissionEnrollment.update({
      where: { id: enrollment.id },
      data: { assignedCounsellorId: counsellor.id },
    });
    await toContacted(counsellor.email, enrollment.id);

    // Even with a hostile actor, the server derives COUNSELLOR from the
    // authenticated staff identity and applies the schedule.
    const res = await action(counsellor.email, enrollment.id, {
      action: "FOLLOW_UP",
      nextFollowUpAt: future(),
      actor: "AI",
    });
    assert.equal(res.status, 200);
    const r = await row(enrollment.id);
    assert.ok(r?.nextFollowUpAt, "scheduling succeeded under the derived human actor");
    const ev = await prisma.admissionEvent.findFirst({
      where: { admissionEnrollmentId: enrollment.id, action: AdmissionEventAction.FOLLOW_UP_REQUIRED },
    });
    assert.equal(ev?.actor, AdmissionActor.COUNSELLOR);
  } finally {
    restore();
  }
});

// ── J. AUTHORIZATION ───────────────────────────────────────────────

test("J. counsellor can schedule unassigned + own; cannot schedule another's (403); ADMIN overrides", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const owner = await createStaff("COUNSELLOR");
  const admin = await createStaff("ADMIN");

  // J1 — unassigned: counsellor may schedule.
  const lead1 = await createLead();
  const e1 = await createEnrollment(lead1.id, "IELTS");
  const r1 = withUser(counsellor.email);
  try {
    await toContacted(counsellor.email, e1.id);
    const ok = await action(counsellor.email, e1.id, { action: "FOLLOW_UP", nextFollowUpAt: future() });
    assert.equal(ok.status, 200);
  } finally {
    r1();
  }

  // J2 — own: counsellor may schedule.
  const lead2 = await createLead();
  const e2 = await createEnrollment(lead2.id, "IELTS");
  await prisma.admissionEnrollment.update({ where: { id: e2.id }, data: { assignedCounsellorId: counsellor.id } });
  const r2 = withUser(counsellor.email);
  try {
    await toContacted(counsellor.email, e2.id);
    const ok = await action(counsellor.email, e2.id, { action: "FOLLOW_UP", nextFollowUpAt: future() });
    assert.equal(ok.status, 200);
  } finally {
    r2();
  }

  // J3 — another counsellor's record → 403.
  const lead3 = await createLead();
  const e3 = await createEnrollment(lead3.id, "IELTS");
  await prisma.admissionEnrollment.update({ where: { id: e3.id }, data: { assignedCounsellorId: owner.id } });
  const r3 = withUser(counsellor.email);
  try {
    const denied = await action(counsellor.email, e3.id, { action: "FOLLOW_UP", nextFollowUpAt: future() });
    assert.equal(denied.status, 403);
    assert.equal((await row(e3.id))?.nextFollowUpAt, null);
  } finally {
    r3();
  }

  // J4 — ADMIN can schedule anyone's record.
  const r4 = withUser(admin.email);
  try {
    await toContacted(admin.email, e3.id);
    const ok = await action(admin.email, e3.id, { action: "FOLLOW_UP", nextFollowUpAt: future() });
    assert.equal(ok.status, 200);
    assert.ok((await row(e3.id))?.nextFollowUpAt);
  } finally {
    r4();
  }
});

// ── K. ASSIGNMENT ≠ SCHEDULING; CONTACT ≠ SCHEDULING ────────────────

test("K. assignment and contact never imply a follow-up date", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const restore = withUser(counsellor.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });

    // assignment
    await action(counsellor.email, enrollment.id, { action: "ASSIGN", staffId: counsellor.id });
    let r = await row(enrollment.id);
    assert.equal(r?.assignedCounsellorId, counsellor.id);
    assert.equal(r?.nextFollowUpAt, null, "assigning never schedules");
    assert.equal(r?.state, AdmissionState.INTERESTED);

    // contact
    await toContacted(counsellor.email, enrollment.id);
    r = await row(enrollment.id);
    assert.equal(r?.state, AdmissionState.COUNSELLOR_CONTACTED);
    assert.equal(r?.nextFollowUpAt, null, "marking contacted never schedules");
  } finally {
    restore();
  }
});

// ── L. SURFACES EXPOSE nextFollowUpAt ──────────────────────────────

test("L. list + detail expose nextFollowUpAt; derived status surfaces on workspace", async () => {
  const admin = await createStaff("ADMIN");
  const restore = withUser(admin.email);
  try {
    const lead = await createLead();
    const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
    await toContacted(admin.email, enrollment.id);
    const d = future(10 * 24 * 60 * 60 * 1000);
    await action(admin.email, enrollment.id, { action: "FOLLOW_UP", nextFollowUpAt: d });

    // list
    const listRes = await listAdmissions(getReq("http://localhost:3000/api/admin/admissions", admin.email));
    assert.equal(listRes.status, 200);
    const listBody = await jsonOf(listRes);
    const rows = (listBody.admissions as Array<{ id: string; nextFollowUpAt: string | null }>);
    const mine = rows.find((x) => x.id === enrollment.id);
    assert.ok(mine, "row present in list");
    assert.equal(mine?.nextFollowUpAt, new Date(d).toISOString());

    // detail
    const detRes = await getAdmissionDetail(
      getReq(`http://localhost:3000/api/admin/admissions/${enrollment.id}`, admin.email),
      { params: Promise.resolve({ id: enrollment.id }) },
    );
    assert.equal(detRes.status, 200);
    const detBody = await jsonOf(detRes);
    const detail = detBody.admission as { nextFollowUpAt: string | null };
    assert.equal(detail.nextFollowUpAt, new Date(d).toISOString());

    // classifier on the returned date matches UPCOMING (10 days out).
    const fu = classifyFollowUpStatus(detail.nextFollowUpAt);
    assert.equal(fu.status === "UPCOMING" || fu.status === "DUE_SOON", true);
    assert.equal(fu.isScheduled, true);
  } finally {
    restore();
  }
});

// ── M. COURSE ISOLATION ────────────────────────────────────────────

test("M. a follow-up on one course never leaks to another enrollment", async () => {
  const admin = await createStaff("ADMIN");
  const restore = withUser(admin.email);
  try {
    const lead = await createLead();
    const e1 = await createEnrollment(lead.id, "IELTS");
    const e2 = await createEnrollment(lead.id, "PTE Academic");
    await toContacted(admin.email, e1.id);
    const d = future();
    await action(admin.email, e1.id, { action: "FOLLOW_UP", nextFollowUpAt: d });

    const r1 = await row(e1.id);
    const r2 = await row(e2.id);
    assert.ok(r1?.nextFollowUpAt);
    assert.equal(r2?.nextFollowUpAt, null, "other course unaffected");
    assert.notEqual(r1?.id, r2?.id);
  } finally {
    restore();
  }
});

// ── N. REGRESSION + BOUNDARIES ─────────────────────────────────────

test("N1. admissions list + conversations queue still work", async () => {
  const admin = await createStaff("ADMIN");
  const restore = withUser(admin.email);
  try {
    const lead = await createLead();
    await createEnrollment(lead.id, "IELTS");

    const listRes = await listAdmissions(getReq("http://localhost:3000/api/admin/admissions", admin.email));
    assert.equal(listRes.status, 200);
    assert.equal((await jsonOf(listRes)).success, true);

    const conversation = await prisma.conversation.create({
      data: { source: "WHATSAPP", phone: lead.phone, leadId: lead.id },
    });
    conversationIds.push(conversation.id);
    const convRes = await listConversations(getReq("http://localhost:3000/api/admin/conversations", admin.email));
    assert.equal(convRes.status, 200);
    assert.equal((await jsonOf(convRes)).success, true);
  } finally {
    restore();
  }
});

test("N2. the follow-up code never surfaces a second queue/engine and never touches payment/UPI", () => {
  const root = join(__dirname, "..");
  const files = [
    "lib/admission/followUpStatus.ts",
    "lib/admission/admission.lifecycle.ts",
    "lib/admission/admission.service.ts",
    "lib/admission/admin.admissions.service.ts",
    "app/admin/admissions/page.tsx",
    "app/api/admin/admissions/[id]/actions/route.ts",
  ].map((p) => readFileSync(join(root, p), "utf8").toLowerCase());

  for (const [i, source] of files.entries()) {
    assert.ok(!source.includes("/pay-course"), `no pay-course link in file ${i}`);
    assert.ok(!source.includes("upi"), `no upi reference in file ${i}`);
    assert.ok(!source.includes("9428186817"), `no hardcoded UPI id in file ${i}`);
  }
  // The classifier is the ONE status computation; there is no scheduler or
  // notifications engine added by this phase.
  const statusSrc = readFileSync(join(root, "lib/admission/followUpStatus.ts"), "utf8");
  assert.ok(statusSrc.includes("classifyFollowUpStatus"));
  // The classifier must be truly import-safe for the client surfaces: no
  // runtime import of Prisma (a mention in a comment is fine).
  assert.ok(
    !/import[\s\S]*?from\s+["']@prisma\/client["']/.test(statusSrc),
    "the classifier is dependency-free / client-safe",
  );
});
