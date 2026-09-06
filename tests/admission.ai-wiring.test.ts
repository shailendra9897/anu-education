// FILE: tests/admission.ai-wiring.test.ts
//
// PHASE S6-C — AI ADMISSION RECORD WIRING (DB-BACKED)
//
// Bridges the S5-C admission-intent classification into the canonical
// (Lead × course) AdmissionEnrollment record. All mutations flow through
// the S6-B1 authority — this test drives applyAiAdmissionWiring(), the
// orchestration seam, and asserts the SAFETY GATES fail closed:
//   A. real intent + canonical course + Lead → record created and
//      advanced to COUNSELLOR_CONTACT_PENDING
//   B. reuse of (lead × course) → no duplicate row, no re-advance
//   C. course isolation — German demo never colours an IELTS record
//   D/E. NONE / LOW admission intent → no record created at all
//   F/G/H. MEDIUM / HIGH / URGENT → record created at CONTACT_PENDING
//   I. no canonical Lead → skipped
//   J. group conversation → skipped
//   K. ASSIGNED conversation → skipped
//   L. HANDED_OFF conversation → skipped
//   M. HUMAN_HANDOFF requested → skipped
//   N. unrecognised course → skipped (never throws)
//   O. reused record left untouched past the AI boundary
//   P. PTE vs PTE Academic stay distinct journeys
//   Q. a payment-claim message creates AT MOST a CONTACT_PENDING record
//      (NEVER a payment/admission state)
//   R. repeated messages collapse to ONE record and ONE transition event
//   S. bare "I paid / payment done" with no joining intent creates nothing
//
// Run against the scratch DB (existing convention):
//   DATABASE_URL="postgresql://test:test@127.0.0.1:5432/test" \
//     npx tsx tests/admission.ai-wiring.test.ts
// (env.setup already defaults to that URL; container REQUIRED.)
// ────────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import { AdmissionActor, AdmissionState } from "@prisma/client";
import prisma from "../lib/prisma";
import { applyAiAdmissionWiring } from "../lib/admission/admission.wiring";
import type { WiringAdmissionIntent } from "../lib/admission/admission.wiring";

// ── UNIQUE TEST HARNESS ───────────────────────────────────────────
let seq = 0;
const uid = () => `s6c-${Date.now()}-${++seq}`;

const enrolledIds: string[] = [];
const leadIds: string[] = [];
const conversationIds: string[] = [];

async function createLead() {
  const lead = await prisma.lead.create({
    data: {
      phone: `+1${String(Math.floor(Math.random() * 1e10)).padStart(10, "0")}`,
      email: `${uid()}@dev.test`,
    },
  });
  leadIds.push(lead.id);
  return lead;
}

async function createConversation(leadId: string, overrides: Partial<{
  status: string;
  assignedCounsellorId: string | null;
  name: string | null;
}> = {}) {
  const conversation = await prisma.conversation.create({
    data: {
      source: "WHATSAPP",
      phone: `+1${String(Math.floor(Math.random() * 1e10)).padStart(10, "0")}`,
      leadId,
      status: (overrides.status as "ACTIVE" | "HANDED_OFF") ?? "ACTIVE",
      assignedCounsellorId: overrides.assignedCounsellorId ?? null,
      name: overrides.name ?? null,
    },
  });
  conversationIds.push(conversation.id);
  return conversation;
}

function wiringInput(
  conversation: Awaited<ReturnType<typeof createConversation>>,
  p: Partial<{
    admissionIntent: WiringAdmissionIntent;
    course: string | null;
    reason: string;
    humanHandoffRequested: boolean;
    groupConversation: boolean;
  }> = {},
) {
  return {
    conversation: conversation as unknown as Parameters<typeof applyAiAdmissionWiring>[0]["conversation"],
    admissionIntent: p.admissionIntent ?? ("HIGH" as WiringAdmissionIntent),
    course: p.course ?? "IELTS",
    reason: p.reason ?? ("wants to join" as string),
    humanHandoffRequested: p.humanHandoffRequested ?? false,
    groupConversation: p.groupConversation ?? false,
  };
}

async function cleanup() {
  await prisma.admissionEvent.deleteMany({
    where: { admissionEnrollmentId: { in: enrolledIds } },
  }).catch(() => {});
  await prisma.admissionEnrollment.deleteMany({
    where: { id: { in: enrolledIds } },
  }).catch(() => {});
  for (const id of conversationIds) {
    await prisma.conversation.deleteMany({ where: { id } }).catch(() => {});
  }
  for (const id of leadIds) await prisma.lead.deleteMany({ where: { id } }).catch(() => {});
  enrolledIds.length = 0;
  leadIds.length = 0;
  conversationIds.length = 0;
}

test.afterEach(cleanup);
test.after(() => prisma.$disconnect());

// ── A. HAPPY PATH ─────────────────────────────────────────────────
test("A. real intent + canonical course + Lead creates an INTERESTED record and advances to CONTACT_PENDING", async () => {
  const lead = await createLead();
  const conversation = await createConversation(lead.id);
  const result = await applyAiAdmissionWiring(wiringInput(conversation));

  assert.equal(result.skipped, false);
  assert.equal(result.created, true);
  assert.equal(result.reused, false);
  assert.equal(result.advancedToContactPending, true);
  assert.ok(result.enrollmentId);

  const enrollment = await prisma.admissionEnrollment.findUnique({
    where: { id: result.enrollmentId! },
  });
  assert.equal(enrollment?.state, AdmissionState.COUNSELLOR_CONTACT_PENDING);
  assert.equal(enrollment?.course, "IELTS");

  // A new CONTACT_PENDING record carries exactly the create + advance events.
  const events = await prisma.admissionEvent.findMany({
    where: { admissionEnrollmentId: result.enrollmentId! },
    orderBy: { createdAt: "asc" },
  });
  assert.equal(events.length, 2);
  assert.equal(events[0].nextState, AdmissionState.INTERESTED);
  assert.equal(events[1].previousState, AdmissionState.INTERESTED);
  assert.equal(events[1].nextState, AdmissionState.COUNSELLOR_CONTACT_PENDING);
  assert.equal(events[1].actor, AdmissionActor.AI);
  enrolledIds.push(result.enrollmentId!);
});

// ── B. REUSE / IDEMPOTENCY ────────────────────────────────────────
test("B. reusing (lead × course) never duplicates the row or re-advances state", async () => {
  const lead = await createLead();
  const conversation = await createConversation(lead.id);

  const first = await applyAiAdmissionWiring(wiringInput(conversation));
  assert.equal(first.created, true);
  const second = await applyAiAdmissionWiring(wiringInput(conversation));
  assert.equal(second.created, false);
  assert.equal(second.reused, true);
  assert.equal(second.advancedToContactPending, false);
  assert.equal(second.enrollmentId, first.enrollmentId);

  const rows = await prisma.admissionEnrollment.count({
    where: { leadId: lead.id, course: "IELTS" },
  });
  assert.equal(rows, 1);
  const events = await prisma.admissionEvent.count({
    where: {
      admissionEnrollmentId: first.enrollmentId!,
      nextState: AdmissionState.COUNSELLOR_CONTACT_PENDING,
    },
  });
  assert.equal(events, 1, "advance event fired exactly once");
  enrolledIds.push(first.enrollmentId!);
});

// ── C. COURSE ISOLATION ───────────────────────────────────────────
test("C. course isolation — a German mention creates a German record, not IELTS", async () => {
  const lead = await createLead();
  const conversation = await createConversation(lead.id);
  const result = await applyAiAdmissionWiring(
    wiringInput(conversation, { course: "German", reason: "wants German demo" }),
  );
  assert.equal(result.skipped, false);
  const enrollment = await prisma.admissionEnrollment.findUnique({
    where: { id: result.enrollmentId! },
  });
  assert.equal(enrollment?.course, "German");
  const ielts = await prisma.admissionEnrollment.count({
    where: { leadId: lead.id, course: "IELTS" },
  });
  assert.equal(ielts, 0, "German intent never colours an IELTS journey");
  enrolledIds.push(result.enrollmentId!);
});

// ── D/E. NONE / LOW ARE INFORMATIONAL ─────────────────────────────
for (const intent of ["NONE", "LOW"] as WiringAdmissionIntent[]) {
  test(`D/E. ${intent} admission intent creates NO record`, async () => {
    const lead = await createLead();
    const conversation = await createConversation(lead.id);
    const result = await applyAiAdmissionWiring(wiringInput(conversation, { admissionIntent: intent }));
    assert.equal(result.skipped, true);
    assert.equal(result.enrollmentId, null);
    const rows = await prisma.admissionEnrollment.count({ where: { leadId: lead.id } });
    assert.equal(rows, 0, `${intent} must never materialise an enrollment`);
  });
}

// ── F/G/H. URGENT / HIGH / MEDIUM ALL WIRE ────────────────────────
for (const intent of ["MEDIUM", "HIGH", "URGENT"] as WiringAdmissionIntent[]) {
  test(`F/G/H. ${intent} intent wires a CONTACT_PENDING record`, async () => {
    const lead = await createLead();
    const conversation = await createConversation(lead.id);
    const result = await applyAiAdmissionWiring(wiringInput(conversation, { admissionIntent: intent }));
    assert.equal(result.skipped, false);
    assert.equal(result.advancedToContactPending, true);
    const enrollment = await prisma.admissionEnrollment.findUnique({
      where: { id: result.enrollmentId! },
    });
    assert.equal(enrollment?.state, AdmissionState.COUNSELLOR_CONTACT_PENDING);
    enrolledIds.push(result.enrollmentId!);
  });
}

// ── I. NO CANONICAL LEAD ──────────────────────────────────────────
test("I. no canonical Lead on the conversation → skipped", async () => {
  // Anonymous conversation with no lead linkage.
  const conversation = await prisma.conversation.create({
    data: { source: "WHATSAPP", phone: `+1${String(Math.floor(Math.random() * 1e10)).padStart(10, "0")}` },
  });
  conversationIds.push(conversation.id);

  const result = await applyAiAdmissionWiring(
    wiringInput(conversation as never, {}),
  );
  assert.equal(result.skipped, true);
  assert.equal(result.enrollmentId, null);
  const rows = await prisma.admissionEnrollment.count();
  const ourCount = rows;
  // No record could have been created for a conversation with no Lead.
  const forLead = await prisma.admissionEnrollment.count({
    where: { leadId: "" },
  });
  assert.equal(forLead, 0);
});

// ── J. GROUP ──────────────────────────────────────────────────────
test("J. group conversations are never wired", async () => {
  const lead = await createLead();
  const conversation = await createConversation(lead.id, { name: "ANU Edu (group)" });
  const result = await applyAiAdmissionWiring(
    wiringInput(conversation, { groupConversation: true }),
  );
  assert.equal(result.skipped, true);
  assert.equal(result.enrollmentId, null);
  const rows = await prisma.admissionEnrollment.count({ where: { leadId: lead.id } });
  assert.equal(rows, 0);
});

// ── K. ASSIGNED ───────────────────────────────────────────────────
test("K. assigned conversations (counsellor owns it) are never wired", async () => {
  const lead = await createLead();
  const staff = await prisma.staff.create({
    data: { name: `S6C ${uid()}`, email: `${uid()}@staff.dev.test`, role: "COUNSELLOR" },
  });
  const conversation = await createConversation(lead.id, {
    assignedCounsellorId: staff.id,
  });
  const result = await applyAiAdmissionWiring(wiringInput(conversation));
  assert.equal(result.skipped, true);
  assert.equal(result.enrollmentId, null);
  const rows = await prisma.admissionEnrollment.count({ where: { leadId: lead.id } });
  assert.equal(rows, 0);
  await prisma.staff.deleteMany({ where: { id: staff.id } }).catch(() => {});
});

// ── L. HANDED_OFF ─────────────────────────────────────────────────
test("L. HANDED_OFF conversations are never wired", async () => {
  const lead = await createLead();
  const conversation = await createConversation(lead.id, {
    status: "HANDED_OFF",
  });
  const result = await applyAiAdmissionWiring(wiringInput(conversation));
  assert.equal(result.skipped, true);
  assert.equal(result.enrollmentId, null);
  const rows = await prisma.admissionEnrollment.count({ where: { leadId: lead.id } });
  assert.equal(rows, 0);
});

// ── M. HUMAN HANDOFF ──────────────────────────────────────────────
test("M. human handoff requested → skipped", async () => {
  const lead = await createLead();
  const conversation = await createConversation(lead.id);
  const result = await applyAiAdmissionWiring(
    wiringInput(conversation, { humanHandoffRequested: true }),
  );
  assert.equal(result.skipped, true);
  assert.equal(result.enrollmentId, null);
  const rows = await prisma.admissionEnrollment.count({ where: { leadId: lead.id } });
  assert.equal(rows, 0);
});

// ── N. UNRECOGNISED COURSE ────────────────────────────────────────
test("N. an unrecognised course is skipped, never throws", async () => {
  const lead = await createLead();
  const conversation = await createConversation(lead.id);
  const result = await applyAiAdmissionWiring(
    wiringInput(conversation, { course: "German A1" }),
  );
  assert.equal(result.skipped, true);
  assert.equal(result.enrollmentId, null);
  const rows = await prisma.admissionEnrollment.count({ where: { leadId: lead.id } });
  assert.equal(rows, 0);
});

// ── O. REUSED RECORD PAST THE AI BOUNDARY IS LEFT ALONE ───────────
test("O. a reused record already at CONTACT_PENDING is not re-advanced", async () => {
  const lead = await createLead();
  const conversation = await createConversation(lead.id);
  const first = await applyAiAdmissionWiring(wiringInput(conversation));
  assert.equal(first.created, true);
  // Second call reuses the same record — already CONTACT_PENDING.
  const second = await applyAiAdmissionWiring(wiringInput(conversation));
  assert.equal(second.reused, true);
  assert.equal(second.advancedToContactPending, false);
  const events = await prisma.admissionEvent.count({
    where: {
      admissionEnrollmentId: first.enrollmentId!,
      nextState: AdmissionState.COUNSELLOR_CONTACT_PENDING,
    },
  });
  assert.equal(events, 1);
  enrolledIds.push(first.enrollmentId!);
});

// ── P. PTE vs PTE ACADEMIC ────────────────────────────────────────
test("P. PTE and PTE Academic remain distinct journeys", async () => {
  const lead = await createLead();
  const conversation = await createConversation(lead.id);
  const pte = await applyAiAdmissionWiring(
    wiringInput(conversation, { course: "PTE", reason: "pte" }),
  );
  const pteAcad = await applyAiAdmissionWiring(
    wiringInput(conversation, { course: "PTE Academic", reason: "pte academic" }),
  );
  assert.notEqual(pte.enrollmentId, pteAcad.enrollmentId);
  assert.equal(pte.created, true);
  assert.equal(pteAcad.created, true);
  enrolledIds.push(pte.enrollmentId!, pteAcad.enrollmentId!);
});

// ── Q. PAYMENT CLAIM NEVER VERIFIES ───────────────────────────────
test("Q. a payment/join message with real intent only reaches CONTACT_PENDING — never a payment state", async () => {
  const lead = await createLead();
  const conversation = await createConversation(lead.id);
  // "I want to pay for IELTS" is genuine URGENT joining intent.
  const result = await applyAiAdmissionWiring(
    wiringInput(conversation, { admissionIntent: "URGENT", course: "IELTS" }),
  );
  assert.equal(result.skipped, false);
  const enrollment = await prisma.admissionEnrollment.findUnique({
    where: { id: result.enrollmentId! },
  });
  assert.equal(
    enrollment?.state,
    AdmissionState.COUNSELLOR_CONTACT_PENDING,
    "AI can only ever surface the record to CONTACT_PENDING",
  );
  const verificationEvents = await prisma.admissionEvent.count({
    where: {
      admissionEnrollmentId: result.enrollmentId!,
      actor: AdmissionActor.AI,
      nextState: {
        in: [
          AdmissionState.PAYMENT_VERIFIED,
          AdmissionState.ADMISSION_CONFIRMED,
          AdmissionState.ADMISSION_COMPLETED,
        ],
      },
    },
  });
  assert.equal(verificationEvents, 0, "AI never emits a payment/admission verification");
  enrolledIds.push(result.enrollmentId!);
});

// ── R. REPEATED MESSAGES COLLAPSE ─────────────────────────────────
test("R. repeated same-conversation calls produce ONE record and ONE advance event", async () => {
  const lead = await createLead();
  const conversation = await createConversation(lead.id);
  for (let i = 0; i < 4; i++) {
    await applyAiAdmissionWiring(wiringInput(conversation, { course: "GMAT" }));
  }
  const rows = await prisma.admissionEnrollment.count({
    where: { leadId: lead.id, course: "GMAT" },
  });
  assert.equal(rows, 1);
  const events = await prisma.admissionEvent.count({
    where: {
      admissionEnrollment: { leadId: lead.id, course: "GMAT" },
      nextState: AdmissionState.COUNSELLOR_CONTACT_PENDING,
    },
  });
  assert.equal(events, 1);
  const rec = await prisma.admissionEnrollment.findUnique({
    where: { leadId_course: { leadId: lead.id, course: "GMAT" } },
  });
  enrolledIds.push(rec!.id);
});

// ── S. BARE PAYMENT CLAIM, NO JOINING INTENT ──────────────────────
test("S. a bare 'I paid / payment done / bhej diya' with no joining intent creates nothing", async () => {
  const lead = await createLead();
  const conversation = await createConversation(lead.id);
  // Bare payment claim — no MEDIUM/HIGH/URGENT joining signal.
  const result = await applyAiAdmissionWiring(
    wiringInput(conversation, { admissionIntent: "NONE", course: null }),
  );
  assert.equal(result.skipped, true);
  assert.equal(result.enrollmentId, null);
  const rows = await prisma.admissionEnrollment.count({ where: { leadId: lead.id } });
  assert.equal(rows, 0, "a bare payment claim must not invent an enrollment");
});
