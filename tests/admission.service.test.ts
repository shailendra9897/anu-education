// FILE: tests/admission.service.test.ts
//
// PHASE S6-B1 — ADMISSION / CONVERSION SERVICE LAYER (DB-BACKED)
//
// Verifies the canonical (Lead × course) record against a REAL Postgres:
//   A. lead×course uniqueness — never two records, including creation
//      time and under TRUE concurrency (running in parallel)
//   B/E. course isolation — different courses are different journeys;
//      "PTE" vs "PTE Academic" stay distinct records
//   C. duplicate / repeat get-or-create is idempotent
//   F/H. a valid journey applies and its immutable event history is
//      complete, ordered, and consistent (previousState → nextState)
//   G. an invalid transition is rejected with a precise code and the
//      row + history are untouched
//   I. an idempotent repeat of a logical transition/event collapses to
//      ONE event (DB unique index + service short-circuit)
//   J. a genuinely later occurrence (no key, or a discriminator) still
//      records a NEW event
//   K. counsellor assignment NEVER implies contact (no COUNSELLOR_CONTACTED,
//      no contactedAt)
//   L. a student saying "I paid" never verifies payment
//   M. payment verification requires a COUNSELLOR/ADMIN; AI rejected
//   N. admission confirmation is human-only
//   O. the journey survives a conversation lifecycle (delete) — the
//      record is owned by Lead, not the conversation
//   T. migration shape (+ additive-only, no DROP) + client model presence
//
// Run against the scratch DB (existing convention):
//   DATABASE_URL="postgresql://test:test@127.0.0.1:5432/test" \
//     npx tsx tests/admission.service.test.ts
// (env.setup already defaults to that URL; container REQUIRED.)
// ────────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AdmissionActor,
  AdmissionEventAction,
  AdmissionState,
} from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import prisma from "../lib/prisma";
import {
  getAdmissionEnrollment,
  getAdmissionEnrollmentById,
  getOrCreateAdmissionEnrollment,
  recordAdmissionEvent,
  recordAdmissionTransition,
  setCounsellorAssignment,
} from "../lib/admission/admission.service";
import { AdmissionLifecycleErrorCode } from "../lib/admission/admission.lifecycle";

// ── UNIQUE TEST HARNESS ───────────────────────────────────────────
let seq = 0;
const uid = () => `s6b1-${Date.now()}-${++seq}`;

const enrolledIds: string[] = [];
const leadIds: string[] = [];
const staffIds: string[] = [];

async function createLead() {
  const lead = await prisma.lead.create({
    data: { phone: `+1${String(Math.floor(Math.random() * 1e10)).padStart(10, "0")}`, email: `${uid()}@dev.test` },
  });
  leadIds.push(lead.id);
  return lead;
}

async function createStaff(role = "COUNSELLOR") {
  const staff = await prisma.staff.create({
    data: { name: `S6B1 ${uid()}`, email: `${uid()}@staff.dev.test`, role },
  });
  staffIds.push(staff.id);
  return staff;
}

async function createEnrollment(leadId: string, course: string) {
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId, course });
  enrolledIds.push(enrollment.id);
  return enrollment;
}

/** Walk the happy path to a given state under an authorized actor. */
async function walkTo(
  enrollmentId: string,
  toState: AdmissionState,
): Promise<void> {
  const chain: Array<[AdmissionState, AdmissionActor]> = [
    [AdmissionState.COUNSELLOR_CONTACT_PENDING, AdmissionActor.AI],
    [AdmissionState.COUNSELLOR_CONTACTED, AdmissionActor.COUNSELLOR],
    [AdmissionState.PAYMENT_PENDING, AdmissionActor.COUNSELLOR],
    [AdmissionState.PAYMENT_VERIFICATION, AdmissionActor.COUNSELLOR],
    [AdmissionState.PAYMENT_VERIFIED, AdmissionActor.COUNSELLOR],
    [AdmissionState.ADMISSION_CONFIRMED, AdmissionActor.ADMIN],
  ];
  for (const [state, actor] of chain) {
    await recordAdmissionTransition({ enrollmentId, toState: state, actor });
    if (state === toState) break;
  }
  const current = await prisma.admissionEnrollment.findUnique({ where: { id: enrollmentId } });
  assert.equal(current?.state, toState);
}

async function cleanup() {
  await prisma.admissionEvent.deleteMany({ where: { admissionEnrollmentId: { in: enrolledIds } } }).catch(() => {});
  await prisma.admissionEnrollment.deleteMany({ where: { id: { in: enrolledIds } } }).catch(() => {});
  for (const id of leadIds) await prisma.lead.deleteMany({ where: { id } }).catch(() => {});
  for (const id of staffIds) await prisma.staff.deleteMany({ where: { id } }).catch(() => {});
  enrolledIds.length = 0;
  leadIds.length = 0;
  staffIds.length = 0;
}

test.afterEach(cleanup);
test.after(() => prisma.$disconnect());

// ── A. UNIQUENESS ─────────────────────────────────────────────────
test("A. one record per (lead × course) — creation is reflected once", async () => {
  const lead = await createLead();
  const first = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
  assert.equal(first.created, true);
  const second = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
  assert.equal(second.created, false);
  assert.equal(second.enrollment.id, first.enrollment.id);

  const fetched = await getAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
  assert.equal(fetched?.id, first.enrollment.id);
  const fetchedOther = await getAdmissionEnrollment({ leadId: lead.id, course: "GMAT" });
  assert.equal(fetchedOther, null, "absence of a journey = null, never a NONE row");
});

test("A. an unrecognized course is rejected before any write", async () => {
  const lead = await createLead();
  await assert.rejects(
    getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "German A1" }),
    (err: unknown) => {
      const e = err as { code?: string };
      return e?.code === AdmissionLifecycleErrorCode.INVALID_COURSE;
    },
  );
  const rows = await prisma.admissionEnrollment.count({ where: { leadId: lead.id } });
  assert.equal(rows, 0);
});

// ── D. TRUE CONCURRENCY ───────────────────────────────────────────
test("D. concurrent get-or-create for the same (lead×course) yields ONE row", async () => {
  const lead = await createLead();
  const results = await Promise.all(
    Array.from({ length: 8 }, () =>
      getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "PTE" }),
    ),
  );
  const ids = new Set(results.map((r) => r.enrollment.id));
  assert.equal(ids.size, 1, "all concurrent creators must resolve to the same record");
  const wins = results.filter((r) => r.created).length;
  assert.equal(wins, 1, "exactly one creator wins");
  const rows = await prisma.admissionEnrollment.count({
    where: { leadId: lead.id, course: "PTE" },
  });
  assert.equal(rows, 1);
});

// ── B/E. COURSE ISOLATION ─────────────────────────────────────────
test("B/E. different courses are distinct journeys; PTE ≠ PTE Academic", async () => {
  const lead = await createLead();
  const ielts = await createEnrollment(lead.id, "IELTS");
  const german = await createEnrollment(lead.id, "Goethe");
  assert.notEqual(ielts.id, german.id);
  assert.equal(german.course, "German", "Goethe normalizes to the canonical German");

  const pte = await createEnrollment(lead.id, "PTE");
  const pteAcad = await createEnrollment(lead.id, "PTE Academic");
  assert.equal(pte.course, "PTE");
  assert.equal(pteAcad.course, "PTE Academic");
  assert.notEqual(pte.id, pteAcad.id, "PTE and PTE Academic are separate journeys");
  assert.equal(
    await prisma.admissionEnrollment.count({ where: { leadId: lead.id } }),
    4,
  );
});

// ── F/H. HAPPY PATH + EVENT HISTORY ───────────────────────────────
test("F/H. a full journey applies atomically with a complete, ordered history", async () => {
  const lead = await createLead();
  const { enrollment } = await getOrCreateAdmissionEnrollment({
    leadId: lead.id,
    course: "IELTS Academic",
    actor: AdmissionActor.SYSTEM,
    reason: "web form submit",
  });
  const id = enrollment.id;

  const steps: Array<{ to: AdmissionState; actor: AdmissionActor; reason?: string }> = [
    { to: AdmissionState.COUNSELLOR_CONTACT_PENDING, actor: AdmissionActor.AI, reason: "interest detected in chat" },
    { to: AdmissionState.COUNSELLOR_CONTACTED, actor: AdmissionActor.COUNSELLOR },
    { to: AdmissionState.PAYMENT_PENDING, actor: AdmissionActor.COUNSELLOR },
    { to: AdmissionState.PAYMENT_VERIFICATION, actor: AdmissionActor.COUNSELLOR, reason: "UPI screenshot received" },
    { to: AdmissionState.PAYMENT_VERIFIED, actor: AdmissionActor.COUNSELLOR, reason: "credited on 9428186817@axl" },
    { to: AdmissionState.ADMISSION_CONFIRMED, actor: AdmissionActor.ADMIN },
    { to: AdmissionState.ADMISSION_COMPLETED, actor: AdmissionActor.ADMIN },
  ];
  for (const s of steps) {
    const applied = await recordAdmissionTransition({
      enrollmentId: id,
      toState: s.to,
      actor: s.actor,
      reason: s.reason,
    });
    assert.equal(applied.applied, true, `transition to ${s.to} must apply`);
  }

  const full = await getAdmissionEnrollmentById(id);
  assert.equal(full?.state, AdmissionState.ADMISSION_COMPLETED);
  assert.ok(full?.contactedAt, "COUNSELLOR_CONTACTED sets contactedAt");

  const order = full!.events.map((e) => [e.action, e.previousState, e.nextState]);
  const expected: Array<[AdmissionEventAction, AdmissionState | null, AdmissionState]> = [
    [AdmissionEventAction.ENROLLMENT_CREATED, null, AdmissionState.INTERESTED],
    [AdmissionEventAction.INTEREST_DETECTED, AdmissionState.INTERESTED, AdmissionState.COUNSELLOR_CONTACT_PENDING],
    [AdmissionEventAction.COUNSELLOR_CONTACTED, AdmissionState.COUNSELLOR_CONTACT_PENDING, AdmissionState.COUNSELLOR_CONTACTED],
    [AdmissionEventAction.PAYMENT_CLAIMED, AdmissionState.COUNSELLOR_CONTACTED, AdmissionState.PAYMENT_PENDING],
    [AdmissionEventAction.PAYMENT_VERIFICATION_STARTED, AdmissionState.PAYMENT_PENDING, AdmissionState.PAYMENT_VERIFICATION],
    [AdmissionEventAction.PAYMENT_VERIFIED, AdmissionState.PAYMENT_VERIFICATION, AdmissionState.PAYMENT_VERIFIED],
    [AdmissionEventAction.ADMISSION_CONFIRMED, AdmissionState.PAYMENT_VERIFIED, AdmissionState.ADMISSION_CONFIRMED],
    [AdmissionEventAction.ADMISSION_COMPLETED, AdmissionState.ADMISSION_CONFIRMED, AdmissionState.ADMISSION_COMPLETED],
  ];
  assert.equal(order.length, expected.length, "history must be exactly the applied events");
  for (let i = 0; i < expected.length; i++) {
    assert.deepEqual(order[i], expected[i], `event #${i}`);
  }

  const rawEvents = full!.events;
  for (let i = 1; i < rawEvents.length; i++) {
    assert.ok(
      rawEvents[i].createdAt.getTime() >= rawEvents[i - 1].createdAt.getTime(),
      "history is time-ordered",
    );
    const e = rawEvents[i];
    assert.equal(e.previousState, rawEvents[i - 1].nextState, "state walk is chained");
  }
});

// ── G. INVALID TRANSITION REJECTED ────────────────────────────────
test("G. an invalid transition is rejected and nothing changes", async () => {
  const lead = await createLead();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "GRE" });
  const id = enrollment.id;

  await assert.rejects(
    recordAdmissionTransition({
      enrollmentId: id,
      toState: AdmissionState.ADMISSION_COMPLETED,
      actor: AdmissionActor.ADMIN,
    }),
    (err: unknown) => {
      const e = err as { code?: string };
      return e?.code === AdmissionLifecycleErrorCode.INVALID_TRANSITION;
    },
  );

  const after = await prisma.admissionEnrollment.findUnique({ where: { id } });
  assert.equal(after?.state, AdmissionState.INTERESTED, "state untouched");
  const count = await prisma.admissionEvent.count({ where: { admissionEnrollmentId: id } });
  assert.equal(count, 1, "only the creation event exists");
});

// ── I. IDEMPOTENCY ────────────────────────────────────────────────
test("I. a repeat of an already-applied transition stays a single event", async () => {
  const lead = await createLead();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "TOEFL" });
  const id = enrollment.id;

  const a = await recordAdmissionTransition({
    enrollmentId: id,
    toState: AdmissionState.COUNSELLOR_CONTACT_PENDING,
    actor: AdmissionActor.AI,
  });
  assert.equal(a.applied, true);

  const b = await recordAdmissionTransition({
    enrollmentId: id,
    toState: AdmissionState.COUNSELLOR_CONTACT_PENDING,
    actor: AdmissionActor.AI,
  });
  assert.equal(b.applied, false, "repeat is a no-op");
  assert.equal(b.event, null);

  const interestEvents = await prisma.admissionEvent.count({
    where: { admissionEnrollmentId: id, action: AdmissionEventAction.INTEREST_DETECTED },
  });
  assert.equal(interestEvents, 1);
});

test("I. an idempotent free-form event (discriminator) collapses to one row", async () => {
  const lead = await createLead();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "German" });
  const id = enrollment.id;

  const a = await recordAdmissionEvent({
    enrollmentId: id,
    action: AdmissionEventAction.SYSTEM_NOTE,
    actor: AdmissionActor.STUDENT,
    reason: "student says: payment done",
    discriminator: "claim-2026-sep",
  });
  assert.equal(a.applied, true);

  const b = await recordAdmissionEvent({
    enrollmentId: id,
    action: AdmissionEventAction.SYSTEM_NOTE,
    actor: AdmissionActor.STUDENT,
    reason: "student says: payment done",
    discriminator: "claim-2026-sep",
  });
  assert.equal(b.applied, false);
  assert.equal(b.event.id, a.event.id, "resolved to the existing event");

  const count = await prisma.admissionEvent.count({ where: { admissionEnrollmentId: id } });
  assert.equal(count, 2, "creation + one claimed note");
});

// ── J. LEGITIMATE LATER OCCURRENCES ───────────────────────────────
test("J. a later occurrence still records as a NEW event", async () => {
  const lead = await createLead();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "French" });
  const id = enrollment.id;

  const n1 = await recordAdmissionEvent({
    enrollmentId: id,
    action: AdmissionEventAction.NOTE_ADDED,
    actor: AdmissionActor.COUNSELLOR,
    reason: "first counsel note",
  });
  const n2 = await recordAdmissionEvent({
    enrollmentId: id,
    action: AdmissionEventAction.NOTE_ADDED,
    actor: AdmissionActor.COUNSELLOR,
    reason: "later counsel note (no key → always inserted)",
  });
  assert.notEqual(n1.event.id, n2.event.id, "keyless notes are distinct rows");

  const later = await recordAdmissionEvent({
    enrollmentId: id,
    action: AdmissionEventAction.SYSTEM_NOTE,
    actor: AdmissionActor.STUDENT,
    reason: "paid",
    discriminator: "first-claim",
  });
  const again = await recordAdmissionEvent({
    enrollmentId: id,
    action: AdmissionEventAction.SYSTEM_NOTE,
    actor: AdmissionActor.STUDENT,
    discriminator: "second-claim",
  });
  assert.notEqual(later.event.id, again.event.id, "distinct discriminator → new event");
  const count = await prisma.admissionEvent.count({ where: { admissionEnrollmentId: id } });
  assert.equal(count, 5, "creation + 2 notes + 2 claims");
});

// ── K. ASSIGNMENT ≠ CONTACT ───────────────────────────────────────
test("K. counsellor assignment never implies contact", async () => {
  const lead = await createLead();
  const staff = await createStaff();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
  const id = enrollment.id;

  const { enrollment: assigned } = await setCounsellorAssignment({
    enrollmentId: id,
    staffId: staff.id,
    actor: AdmissionActor.COUNSELLOR,
  });
  assert.equal(assigned.assignedCounsellorId, staff.id);
  assert.equal(assigned.state, AdmissionState.INTERESTED, "state unchanged by assignment");
  assert.equal(assigned.contactedAt, null, "assignment is NOT contact");

  const full = await getAdmissionEnrollmentById(id);
  const action = full!.events.map((e) => e.action);
  assert.ok(action.includes(AdmissionEventAction.COUNSELLOR_ASSIGNED));
  assert.ok(!action.includes(AdmissionEventAction.COUNSELLOR_CONTACTED));

  const released = await setCounsellorAssignment({
    enrollmentId: id,
    staffId: null,
    actor: AdmissionActor.ADMIN,
  });
  assert.equal(released.enrollment.assignedCounsellorId, null);
});

test("K. AI cannot assign a counsellor", async () => {
  const lead = await createLead();
  const staff = await createStaff();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
  await assert.rejects(
    setCounsellorAssignment({
      enrollmentId: enrollment.id,
      staffId: staff.id,
      actor: AdmissionActor.AI,
    }),
    (err: unknown) => (err as { code?: string })?.code === AdmissionLifecycleErrorCode.FORBIDDEN_ACTOR,
  );
});

// ── L. "I PAID" IS NOT A VERIFICATION ─────────────────────────────
test("L. a student claiming payment never reaches a verification state", async () => {
  const lead = await createLead();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
  const id = enrollment.id;
  await walkTo(id, AdmissionState.PAYMENT_VERIFICATION);

  // the student's claim is captured as a NOTE only
  const note = await recordAdmissionEvent({
    enrollmentId: id,
    action: AdmissionEventAction.SYSTEM_NOTE,
    actor: AdmissionActor.STUDENT,
    reason: "student says: payment bhej diya / I paid",
  });
  assert.equal(note.applied, true);

  await assert.rejects(
    recordAdmissionTransition({
      enrollmentId: id,
      toState: AdmissionState.PAYMENT_VERIFIED,
      actor: AdmissionActor.STUDENT,
    }),
    (err: unknown) =>
      (err as { code?: string })?.code === AdmissionLifecycleErrorCode.REQUIRES_HUMAN_VERIFICATION,
  );

  const after = await prisma.admissionEnrollment.findUnique({ where: { id } });
  assert.equal(after?.state, AdmissionState.PAYMENT_VERIFICATION, "state unchanged by the claim");
});

// ── M. PAYMENT VERIFICATION IS HUMAN-ONLY ─────────────────────────
test("M. only COUNSELLOR/ADMIN may verify payment; AI is forbidden", async () => {
  const lead = await createLead();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
  const id = enrollment.id;

  const { enrollment: afterAi } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "GMAT" });
  // reach PAYMENT_VERIFICATION via the helper for both journeys
  await walkTo(id, AdmissionState.PAYMENT_VERIFICATION);
  await walkTo(afterAi.id, AdmissionState.PAYMENT_VERIFICATION);

  await assert.rejects(
    recordAdmissionTransition({
      enrollmentId: id,
      toState: AdmissionState.PAYMENT_VERIFIED,
      actor: AdmissionActor.AI,
      reason: "AI overlay saw a screenshot URL",
    }),
    (err: unknown) =>
      (err as { code?: string })?.code === AdmissionLifecycleErrorCode.REQUIRES_HUMAN_VERIFICATION,
  );

  const verified = await recordAdmissionTransition({
    enrollmentId: afterAi.id,
    toState: AdmissionState.PAYMENT_VERIFIED,
    actor: AdmissionActor.COUNSELLOR,
    reason: "UPI reflected",
  });
  assert.equal(verified.applied, true);
  assert.equal(verified.enrollment.state, AdmissionState.PAYMENT_VERIFIED);
});

// ── N. ADMISSION CONFIRMATION IS HUMAN-ONLY ───────────────────────
test("N. admission confirmation and completion require a human", async () => {
  const lead = await createLead();
  const { enrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
  const id = enrollment.id;
  await walkTo(id, AdmissionState.PAYMENT_VERIFIED);

  await assert.rejects(
    recordAdmissionTransition({
      enrollmentId: id,
      toState: AdmissionState.ADMISSION_CONFIRMED,
      actor: AdmissionActor.SYSTEM,
    }),
    (err: unknown) =>
      (err as { code?: string })?.code === AdmissionLifecycleErrorCode.REQUIRES_HUMAN_VERIFICATION,
  );

  const confirmed = await recordAdmissionTransition({
    enrollmentId: id,
    toState: AdmissionState.ADMISSION_CONFIRMED,
    actor: AdmissionActor.ADMIN,
  });
  assert.equal(confirmed.applied, true);

  const completed = await recordAdmissionTransition({
    enrollmentId: id,
    toState: AdmissionState.ADMISSION_COMPLETED,
    actor: AdmissionActor.ADMIN,
  });
  assert.equal(completed.applied, true);
  assert.equal(completed.enrollment.state, AdmissionState.ADMISSION_COMPLETED);

  const after = await prisma.admissionEnrollment.findUnique({ where: { id } });
  // a terminal record cannot move anywhere (short-circuit only covers
  // repeats of the SAME target, so this still reaches the guard)
  await assert.rejects(
    recordAdmissionTransition({
      enrollmentId: id,
      toState: AdmissionState.ADMISSION_CONFIRMED,
      actor: AdmissionActor.ADMIN,
    }),
    (err: unknown) => (err as { code?: string })?.code === AdmissionLifecycleErrorCode.TERMINAL_STATE,
  );
  assert.equal(after?.state, AdmissionState.ADMISSION_COMPLETED);
});

// ── O. CONVERSATION LIFECYCLE ─────────────────────────────────────
test("O. deleting a conversation never deletes the admission journey", async () => {
  const lead = await createLead();
  const conversation = await prisma.conversation.create({
    data: { source: "WHATSAPP", phone: lead.phone, leadId: lead.id },
  });
  const { enrollment } = await getOrCreateAdmissionEnrollment({
    leadId: lead.id,
    course: "IELTS",
    reason: "conversation ${conversation.id}",
  });
  const id = enrollment.id;
  const { enrollment: alsoMainEnrollment } = await getOrCreateAdmissionEnrollment({ leadId: lead.id, course: "IELTS" });
  assert.equal(alsoMainEnrollment.id, id);

  await prisma.conversation.delete({ where: { id: conversation.id } });

  const survivors = await prisma.admissionEnrollment.count({ where: { id } });
  assert.equal(survivors, 1, "journey owned by Lead, survives conversation deletion");
  const events = await prisma.admissionEvent.count({ where: { admissionEnrollmentId: id } });
  assert.equal(events, 1);
});

// ── T. MIGRATION + CLIENT SHAPE ───────────────────────────────────
test("T. migration is additive-only and installs the canonical tables + constraints", () => {
  const root = join(__dirname, "..", "prisma", "migrations", "20260830120000_admission_canonical", "migration.sql");
  const sql = readFileSync(root, "utf8");

  assert.ok(sql.includes('CREATE TABLE "AdmissionEnrollment"'), "AdmissionEnrollment table");
  assert.ok(sql.includes('CREATE TABLE "AdmissionEvent"'), "AdmissionEvent table");
  assert.ok(
    sql.includes('CREATE UNIQUE INDEX "AdmissionEnrollment_leadId_course_key"'),
    "unique (leadId, course)",
  );
  assert.ok(
    sql.includes('CREATE UNIQUE INDEX "AdmissionEvent_admissionEnrollmentId_eventKey_key"'),
    "unique (enrollmentId, eventKey)",
  );
  assert.ok(
    sql.includes("ON DELETE CASCADE"),
    "cascade delete for the journey with its events",
  );
  assert.ok(!/DROP TABLE/i.test(sql), "additive-only: the migration never drops anything");

  const client = prisma as unknown as Record<string, unknown>;
  assert.ok(client.admissionEnrollment, "Prisma client exposes admissionEnrollment");
  assert.ok(client.admissionEvent, "Prisma client exposes admissionEvent");
});