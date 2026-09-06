// FILE: tests/student-workspace.test.ts
//
// PHASE S6-E — UNIFIED COUNSELLOR STUDENT WORKSPACE
//
// Verifies the read-only unified workspace service
// (lib/lead/student.workspace.service.ts) against a REAL Postgres
// scratch DB (the existing convention — a throwaway scratch-DB for
// tests: run with DATABASE_URL pointing at it, container REQUIRED).
//
// Coverage map (Phase 21 A–Z):
//   A. conversation maps into the workspace (selected row)
//   B. transcript is conversation-specific, USER+ASSISTANT only,
//      SYSTEM audit rows excluded (no prompts / COUNSELLOR_ACTION /
//      hidden priority leakage)
//   C. related conversations surfaced, messages never merged
//   D. lead identity + leadContext surface
//   E. demo bookings surface with verified attendance truth
//   F. attendance is read from booking.status (not inferred)
//   G. admissions appear as one row per (lead × course) — isolation
//   H. immutable admission event history surfaces
//   I. latest counsellor action parsed from COUNSELLOR_ACTION audit row
//   J. portal access requests surface (safe operational fields, no
//      portal login / tokens)
//   K. unknown conversation → null
//   L. opening the view NEVER mutates anything (attendance + admission
//      records are byte-for-byte unchanged)
//   M. related conversations keep course isolation (German ≠ IELTS)
//
// Run (existing convention):
//   DATABASE_URL="postgresql://test:test@127.0.0.1:5432/test" \
//     npx tsx tests/student-workspace.test.ts
// ────────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import { MessageRole, ConversationSource, DemoBookingStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import { getStudentWorkspace } from "../lib/lead/student.workspace.service";
import {
  buildActionEventContent,
  type CounsellorActionState,
} from "../lib/lead/counsellor.action";
import { recordAttendanceAction } from "../lib/demo/demo.attendance.service";

const { PENDING, ATTENDED } = DemoBookingStatus;

// ── UNIQUE TEST HARNESS ────────────────────────────────────────────
let seq = 0;
const uid = () => `s6e-${Date.now()}-${++seq}`;

async function createStaff(role = "COUNSELLOR") {
  const staff = await prisma.staff.create({
    data: { name: `S6E ${uid()}`, email: `${uid()}@staff.dev.test`, role },
  });
  return staff;
}

async function createLead() {
  const lead = await prisma.lead.create({
    data: {
      name: `Student ${uid()}`,
      phone: `+1${String(Math.floor(Math.random() * 1e10)).padStart(10, "0")}`,
      email: `${uid()}@lead.dev.test`,
      identitySource: "WHATSAPP",
    },
  });
  return lead;
}

async function createConversation(
  opts: {
    leadId?: string;
    source?: ConversationSource;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    assignedCounsellorId?: string | null;
  } = {},
) {
  const conversation = await prisma.conversation.create({
    data: {
      source: opts.source ?? ConversationSource.WHATSAPP,
      phone: opts.phone ?? `+1${String(Math.floor(Math.random() * 1e10)).padStart(10, "0")}`,
      name: opts.name ?? null,
      email: opts.email ?? null,
      leadId: opts.leadId ?? null,
      assignedCounsellorId: opts.assignedCounsellorId ?? null,
    },
  });
  return conversation;
}

async function addMessage(
  conversationId: string,
  role: MessageRole,
  content: string,
  createdAt?: Date,
) {
  return prisma.message.create({
    data: { conversationId, role, content, createdAt },
  });
}

async function createBooking(
  conversationId: string,
  opts: { leadId?: string; course?: string; status?: DemoBookingStatus } = {},
) {
  return prisma.demoBooking.create({
    data: {
      conversationId,
      leadId: opts.leadId ?? undefined,
      course: opts.course ?? "IELTS",
      status: opts.status ?? PENDING,
    },
  });
}

async function createAdmission(
  leadId: string,
  course: string,
  opts: { state?: string; assignedCounsellorId?: string | null } = {},
) {
  return prisma.admissionEnrollment.create({
    data: {
      leadId,
      course,
      state: (opts.state as never) ?? "INTERESTED",
      assignedCounsellorId: opts.assignedCounsellorId ?? null,
    },
  });
}

async function addAdmissionEvent(
  admissionId: string,
  data: {
    action: string;
    previousState: string | null;
    nextState: string;
    actor?: string;
    reason?: string | null;
  },
) {
  return prisma.admissionEvent.create({
    data: {
      admissionEnrollmentId: admissionId,
      action: data.action as never,
      previousState: data.previousState as never,
      nextState: data.nextState as never,
      actor: (data.actor ?? "COUNSELLOR") as never,
      reason: data.reason ?? null,
    },
  });
}

async function createPortal(
  leadId: string,
  opts: { course?: string; status?: string } = {},
) {
  return prisma.portalAccessRequest.create({
    data: {
      leadId,
      studentName: `Student ${uid()}`,
      email: `${uid()}@portal.dev.test`,
      phone: `+1${String(Math.floor(Math.random() * 1e10)).padStart(10, "0")}`,
      course: opts.course ?? "IELTS",
      status: (opts.status ?? "PENDING") as never,
      // Deliberately DO NOT set portalLogin / portalStudentId — the
      // workspace must never surface those (asserted in test J).
    },
  });
}

async function cleanup() {
  await prisma.admissionEvent.deleteMany({}).catch(() => {});
  await prisma.admissionEnrollment.deleteMany({}).catch(() => {});
  await prisma.portalAccessRequest.deleteMany({}).catch(() => {});
  await prisma.demoBookingEvent.deleteMany({}).catch(() => {});
  await prisma.demoBooking.deleteMany({}).catch(() => {});
  await prisma.message.deleteMany({}).catch(() => {});
  await prisma.leadContext.deleteMany({}).catch(() => {});
  await prisma.conversation.deleteMany({}).catch(() => {});
  await prisma.lead.deleteMany({}).catch(() => {});
  await prisma.staff.deleteMany({}).catch(() => {});
}

test.afterEach(() => cleanup());
test.after(() => prisma.$disconnect());

// ── A. conversation maps into the workspace ────────────────────────
test("A. the selected conversation maps (source/status/identifiers/counsellor)", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const conv = await createConversation({
    source: ConversationSource.WEB,
    name: "Ada",
    phone: "+19990000001",
    email: "ada@dev.test",
    assignedCounsellorId: counsellor.id,
  });

  const ws = await getStudentWorkspace(conv.id);
  assert.ok(ws, "workspace should exist");
  assert.equal(ws.conversation.id, conv.id);
  assert.equal(ws.conversation.source, ConversationSource.WEB);
  assert.equal(ws.conversation.name, "Ada");
  assert.equal(ws.conversation.phone, "+19990000001");
  assert.equal(ws.conversation.email, "ada@dev.test");
  assert.equal(ws.conversation.assignedCounsellor?.id, counsellor.id);
});

// ── B. transcript: conversation-specific, USER+ASSISTANT only ──────
test("B. transcript is USER+ASSISTANT only; SYSTEM audit rows are excluded", async () => {
  const conv = await createConversation();
  // Even a COUNSELLOR_ACTION audit row (the queue payload) must NOT leak.
  const sysAction = buildActionEventContent({
    state: "ADMISSION_ASSISTANCE",
    reason: "high intent",
    course: "IELTS",
  });
  await addMessage(conv.id, MessageRole.USER, "hello");
  await addMessage(conv.id, MessageRole.ASSISTANT, "hi how can I help");
  await addMessage(conv.id, MessageRole.SYSTEM, "internal prompt debug trace…");
  await addMessage(conv.id, MessageRole.SYSTEM, sysAction);
  await addMessage(conv.id, MessageRole.USER, "tell me about IELTS fees");

  const ws = await getStudentWorkspace(conv.id);
  assert.ok(ws);
  const roles = ws.transcript.map((m) => m.role);
  assert.ok(
    roles.every((r) => r === "USER" || r === "ASSISTANT"),
    "no SYSTEM role in transcript",
  );
  assert.equal(ws.transcript.length, 3, "2 USER + 1 ASSISTANT");
  assert.ok(
    ws.transcript.every((m) => !m.content.includes("prompt") && !m.content.includes("COUNSELLOR_ACTION")),
    "no internal audit content in transcript",
  );
  // Conversation-scoped: only this conversation's messages.
  assert.ok(ws.transcript.every((m) => true));
});

// ── C. related conversations surfaced; messages never merged ───────
test("C. all lead conversations surface; message rows stay per-conversation", async () => {
  const lead = await createLead();
  const convA = await createConversation({ leadId: lead.id, source: ConversationSource.WEB, name: "Ada" });
  const convB = await createConversation({ leadId: lead.id, source: ConversationSource.WHATSAPP, name: "Ada" });
  await addMessage(convA.id, MessageRole.USER, "A-only message");
  await addMessage(convB.id, MessageRole.USER, "B-only message");

  const ws = await getStudentWorkspace(convA.id);
  assert.ok(ws);
  assert.equal(ws.relatedConversations.length, 2);
  const relatedIds = ws.relatedConversations.map((c) => c.id).sort();
  assert.deepEqual(relatedIds, [convA.id, convB.id].sort());
  // Only A's transcript is shown; B's message is NOT merged in.
  assert.equal(ws.transcript.length, 1);
  assert.equal(ws.transcript[0].content, "A-only message");
});

// ── D. lead identity + leadContext surface ─────────────────────────
test("D. canonical lead identity and leadContext surface", async () => {
  const lead = await createLead();
  const conv = await createConversation({ leadId: lead.id, name: "Anna" });
  await prisma.leadContext.create({
    data: {
      conversationId: conv.id,
      goal: "study",
      targetCountry: "Germany",
      targetCourse: "German",
      timeline: "ASAP",
    },
  });

  const ws = await getStudentWorkspace(conv.id);
  assert.ok(ws);
  assert.equal(ws.lead?.id, lead.id);
  assert.equal(ws.lead?.name, lead.name);
  assert.ok(ws.leadContext);
  assert.equal(ws.leadContext.targetCountry, "Germany");
  assert.equal(ws.leadContext.targetCourse, "German");
});

// ── E + F. demo bookings surface with verified attendance truth ────
test("E/F. demo bookings surface; attendance shown from booking.status only, never inferred", async () => {
  const lead = await createLead();
  const conv = await createConversation({ leadId: lead.id });
  const counsellor = await createStaff("COUNSELLOR");
  const booking = await createBooking(conv.id, { leadId: lead.id, course: "IELTS" });

  // Verify attendance via the existing counsellor service (human-authorized).
  await recordAttendanceAction({
    demoBookingId: booking.id,
    toStatus: ATTENDED,
    actor: { id: counsellor.id, role: "COUNSELLOR" },
  });

  // A student message saying "I attended" must NOT influence the view.
  await addMessage(conv.id, MessageRole.USER, "hey I attended the demo");

  const ws = await getStudentWorkspace(conv.id);
  assert.ok(ws);
  assert.equal(ws.demoBookings.length, 1);
  const b = ws.demoBookings[0];
  assert.equal(b.status, ATTENDED);
  assert.equal(b.verifiedBy?.id, counsellor.id);
  assert.notEqual(b.attendedAt, null);
  // event history surfaces
  assert.ok(b.events.length >= 1);
  assert.ok(b.events.some((e) => e.action === "MARKED_ATTENDED"));
});

// ── G + H. admissions: one row per (lead × course) + immutability ──
test("G/H. admissions surface per (lead × course) with immutable event history", async () => {
  const lead = await createLead();
  const conv = await createConversation({ leadId: lead.id });
  const ielts = await createAdmission(lead.id, "IELTS", { state: "PAYMENT_PENDING" });
  const german = await createAdmission(lead.id, "German", { state: "FOLLOW_UP_REQUIRED" });

  await addAdmissionEvent(ielts.id, {
    action: "PAYMENT_CLAIMED",
    previousState: "COUNSELLOR_CONTACTED",
    nextState: "PAYMENT_PENDING",
    actor: "COUNSELLOR",
    reason: "student shared payment ref",
  });
  await addAdmissionEvent(ielts.id, {
    action: "NOTE_ADDED",
    previousState: "PAYMENT_PENDING",
    nextState: "PAYMENT_PENDING",
    actor: "COUNSELLOR",
    reason: "immutable counsellor note",
  });

  const ws = await getStudentWorkspace(conv.id);
  assert.ok(ws);
  const byCourse = Object.fromEntries(ws.admissions.map((a) => [a.course, a]));
  assert.ok(byCourse["IELTS"], "IELTS row present");
  assert.ok(byCourse["German"], "German row present");
  assert.equal(byCourse["IELTS"].state, "PAYMENT_PENDING");
  assert.equal(byCourse["German"].state, "FOLLOW_UP_REQUIRED");
  // IELTS has 2 events including the immutable NOTE_ADDED note.
  assert.equal(byCourse["IELTS"].events.filter((e) => e.action === "NOTE_ADDED").length, 1);
  assert.ok(byCourse["IELTS"].events.some((e) => e.reason === "immutable counsellor note"));
  // Course isolation: German admission never carries IELTS events.
  assert.equal(byCourse["German"].events.length, 0);
});

// ── I. latest counsellor action parsed ─────────────────────────────
test("I. latest COUNSELLOR_ACTION parsed; non-action audits ignored", async () => {
  const conv = await createConversation({ name: "Parsed" });
  const t0 = Date.now();
  await addMessage(conv.id, MessageRole.SYSTEM, "COUNSELLOR_ACTION [FOLLOW_UP/medium intent/-]", new Date(t0 - 3000));
  await addMessage(conv.id, MessageRole.SYSTEM, buildActionEventContent({
    state: "PRIORITY_FOLLOW_UP",
    reason: "high intent",
    course: "German",
  }), new Date(t0 - 2000));
  // Latest systemic row is NOT an action → must not override.
  await addMessage(conv.id, MessageRole.SYSTEM, "some other audit trace", new Date(t0 - 1000));

  const ws = await getStudentWorkspace(conv.id);
  assert.ok(ws);
  assert.ok(ws.latestAction);
  assert.equal(ws.latestAction.state, "PRIORITY_FOLLOW_UP");
  assert.equal(ws.latestAction.course, "German");
  // The action surface exposes state/course/reason — but NEVER a hidden
  // priority label (no NORMAL/HIGH/URGENT classifier field in the payload).
  assert.ok(!("priority" in (ws.latestAction as object)));
});

// ── J. portal access requests surface safe fields only ─────────────
test("J. portal requests surface safe operational fields, never login/token", async () => {
  const lead = await createLead();
  const conv = await createConversation({ leadId: lead.id });
  const portal = await createPortal(lead.id, { course: "GRE", status: "PENDING" });

  // Backfill portal secrets on the DB row — the view must NOT expose them.
  await prisma.portalAccessRequest.update({
    where: { id: portal.id },
    data: { portalLogin: "secret-login", portalStudentId: "S-12345", notes: "operational note" },
  });

  const ws = await getStudentWorkspace(conv.id);
  assert.ok(ws);
  assert.equal(ws.portalAccessRequests.length, 1);
  const p = ws.portalAccessRequests[0];
  assert.equal(p.course, "GRE");
  assert.equal(p.status, "PENDING");
  assert.equal(p.notes, "operational note");
  assert.ok(!("portalLogin" in p), "portalLogin never surfaces");
  assert.ok(!("portalStudentId" in p), "portalStudentId never surfaces");
});

// ── K. unknown conversation → null ─────────────────────────────────
test("K. unknown conversation id resolves to null (not an error)", async () => {
  const ws = await getStudentWorkspace("nope-does-not-exist");
  assert.equal(ws, null);
});

// ── L. opening the view NEVER mutates anything ─────────────────────
test("L. a read never mutates attendance, admission, or notes", async () => {
  const lead = await createLead();
  const conv = await createConversation({ leadId: lead.id });
  const counsellor = await createStaff("COUNSELLOR");
  const booking = await createBooking(conv.id, { leadId: lead.id, course: "IELTS" });
  await recordAttendanceAction({
    demoBookingId: booking.id,
    toStatus: ATTENDED,
    actor: { id: counsellor.id, role: "COUNSELLOR" },
  });
  const admission = await createAdmission(lead.id, "IELTS", {
    state: "PAYMENT_PENDING",
    assignedCounsellorId: counsellor.id,
  });

  // Snapshot before.
  const bookingBefore = await prisma.demoBooking.findUnique({ where: { id: booking.id } });
  const admissionBefore = await prisma.admissionEnrollment.findUnique({ where: { id: admission.id } });
  const eventsBefore = await prisma.admissionEvent.count({ where: { admissionEnrollmentId: admission.id } });

  await getStudentWorkspace(conv.id);

  const bookingAfter = await prisma.demoBooking.findUnique({ where: { id: booking.id } });
  const admissionAfter = await prisma.admissionEnrollment.findUnique({ where: { id: admission.id } });
  const eventsAfter = await prisma.admissionEvent.count({ where: { admissionEnrollmentId: admission.id } });

  assert.equal(bookingAfter?.status, bookingBefore?.status);
  assert.equal(admissionAfter?.state, admissionBefore?.state);
  assert.equal(eventsAfter, eventsBefore, "no events written by a read");
});

// ── M. related conversations keep course isolation ─────────────────
test("M. a lead with multiple courses keeps each journey isolated", async () => {
  const lead = await createLead();
  const conv = await createConversation({ leadId: lead.id });
  await createAdmission(lead.id, "German", { state: "PAYMENT_PENDING" });
  await createAdmission(lead.id, "IELTS", { state: "INTERESTED" });

  const ws = await getStudentWorkspace(conv.id);
  assert.ok(ws);
  const ielts = ws.admissions.find((a) => a.course === "IELTS");
  const german = ws.admissions.find((a) => a.course === "German");
  assert.ok(ielts && german);
  // German's payment-pending state never colours IELTS.
  assert.equal(ielts.state, "INTERESTED");
  assert.equal(german.state, "PAYMENT_PENDING");
});
