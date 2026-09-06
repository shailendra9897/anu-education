// FILE: tests/s6-f2-crm-polish.test.ts
//
// PHASE S6-F2 — EXISTING CRM WORKFLOW & COUNSELLOR POLISH (DB-BACKED)
//
// Verifies the additive S6-F2 server behaviours against a REAL Postgres
// (same scratch convention as follow-up.test.ts):
//   A. resolveStaffDisplayNames resolves Staff ids → names in one batch,
//      ignoring null / unknown ids and returning an empty Map for none
//   B. getAdminAdmissionDetail augments every event with the resolved
//      staff actorName for COUNSELLOR/ADMIN actors (and null otherwise)
//   C. getStudentWorkspace admission events carry the resolved actorName
//   D. listAdminAdmissions follow-up filter (Prisma-side, timezone-safe):
//      none / overdue / due / upcoming select the right records
//
// Run (scratch Postgres REQUIRED — see admission.service.test header):
//   DATABASE_URL="postgresql://test:test@127.0.0.1:5432/test" \
//     npx tsx tests/s6-f2-crm-polish.test.ts
// ────────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import { AdmissionActor, ConversationSource } from "@prisma/client";
import prisma from "../lib/prisma";
import {
  getOrCreateAdmissionEnrollment,
  recordFollowUpAttempt,
  resolveStaffDisplayNames,
} from "../lib/admission/admission.service";
import { getAdminAdmissionDetail, listAdminAdmissions } from "../lib/admission/admin.admissions.service";
import { getStudentWorkspace } from "../lib/lead/student.workspace.service";
import { FOLLOW_UP_DUE_SOON_WINDOW_MS } from "../lib/admission/followUpStatus";

const enrolledIds: string[] = [];
const leadIds: string[] = [];
const staffIds: string[] = [];
const conversationIds: string[] = [];

let seq = 0;
const uid = () => `s6f2-${Date.now()}-${++seq}`;

async function createStaff(role: string) {
  const staff = await prisma.staff.create({
    data: { name: `S6F2 ${uid()}`, email: `${uid()}@staff.dev.test`, role },
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

async function createConversation(leadId: string) {
  const conv = await prisma.conversation.create({
    data: { leadId, source: ConversationSource.WEB },
  });
  conversationIds.push(conv.id);
  return conv;
}

async function cleanup() {
  await prisma.admissionEvent
    .deleteMany({ where: { admissionEnrollmentId: { in: enrolledIds } } })
    .catch(() => {});
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

// ── A. resolveStaffDisplayNames ────────────────────────────────────

test("A. resolveStaffDisplayNames resolves ids → names, ignoring null/unknown, empty for none", async () => {
  const c1 = await createStaff("COUNSELLOR");
  const c2 = await createStaff("COUNSELLOR");

  const map = await resolveStaffDisplayNames([c1.id, c2.id, null, undefined, "does-not-exist"]);
  assert.equal(map.size, 2);
  assert.equal(map.get(c1.id), c1.name);
  assert.equal(map.get(c2.id), c2.name);
  assert.equal(map.has("does-not-exist"), false);

  const empty = new Map<string, string>();
  const none = await resolveStaffDisplayNames([]);
  assert.deepEqual([...none.entries()], [...empty.entries()]);
  const onlyNull = await resolveStaffDisplayNames([null, undefined]);
  assert.equal(onlyNull.size, 0);
});

// ── B. getAdminAdmissionDetail augments events with actorName ──────

test("B. getAdminAdmissionDetail populates event actorName for staff actors", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const lead = await createLead();
  const enrollment = await createEnrollment(lead.id, "IELTS");

  await recordFollowUpAttempt({
    enrollmentId: enrollment.id,
    actor: AdmissionActor.COUNSELLOR,
    actorId: counsellor.id,
    reason: "chased up",
  });

  const detail = await getAdminAdmissionDetail(enrollment.id);
  assert.ok(detail, "detail should exist");
  const attemptEvent = detail!.events.find((e) => e.action === "FOLLOW_UP_ATTEMPTED");
  assert.ok(attemptEvent, "attempt event present");
  assert.equal((attemptEvent as { actorName?: string | null }).actorName, counsellor.name);

  // The enrollment-created event is the SYSTEM actor — actorName must be null.
  const createdEvent = detail!.events.find((e) => e.action === "ENROLLMENT_CREATED");
  assert.ok(createdEvent);
  assert.equal((createdEvent as { actorName?: string | null }).actorName, null);
});

// ── C. getStudentWorkspace admission events carry actorName ────────

test("C. getStudentWorkspace admission events carry the resolved actorName", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const lead = await createLead();
  const enrollment = await createEnrollment(lead.id, "PTE");
  await createConversation(lead.id);

  await recordFollowUpAttempt({
    enrollmentId: enrollment.id,
    actor: AdmissionActor.COUNSELLOR,
    actorId: counsellor.id,
    reason: "chased up",
  });

  const workspace = await getStudentWorkspace(
    (await prisma.conversation.findFirstOrThrow({ where: { leadId: lead.id } })).id,
  );
  assert.ok(workspace);
  assert.equal(workspace!.admissions.length, 1);
  const attempt = workspace!.admissions[0].events.find((e) => e.action === "FOLLOW_UP_ATTEMPTED");
  assert.ok(attempt, "attempt event surface");
  assert.equal((attempt as unknown as { actorName?: string | null }).actorName, counsellor.name);
});

// ── D. listAdminAdmissions follow-up filter (Prisma-side) ──────────

test("D. listAdminAdmissions follow-up filter selects the right due-ness", async () => {
  const counsellor = await createStaff("COUNSELLOR");
  const now = Date.now();

  const leadNone = await createLead();
  const leadOverdue = await createLead();
  const leadDue = await createLead();
  const leadUpcoming = await createLead();

  const eNone = await createEnrollment(leadNone.id, "IELTS");
  const eOverdue = await createEnrollment(leadOverdue.id, "IELTS");
  const eDue = await createEnrollment(leadDue.id, "IELTS");
  const eUpcoming = await createEnrollment(leadUpcoming.id, "IELTS");

  // Set nextFollowUpAt directly to control exact relative dates.
  await prisma.admissionEnrollment.update({ where: { id: eNone.id }, data: { nextFollowUpAt: null } });
  await prisma.admissionEnrollment.update({ where: { id: eOverdue.id }, data: { nextFollowUpAt: new Date(now - 2 * 60 * 60 * 1000) } });
  await prisma.admissionEnrollment.update({ where: { id: eDue.id }, data: { nextFollowUpAt: new Date(now + 60 * 60 * 1000) } });
  await prisma.admissionEnrollment.update({ where: { id: eUpcoming.id }, data: { nextFollowUpAt: new Date(now + 48 * 60 * 60 * 1000) } });

  const ids = await listAdminAdmissions({ id: counsellor.id }, { limit: 50 });
  const allIds = ids.admissions.map((a) => a.id);
  assert.ok(allIds.includes(eNone.id) && allIds.includes(eOverdue.id) && allIds.includes(eDue.id) && allIds.includes(eUpcoming.id));

  const noneRes = await listAdminAdmissions({ id: counsellor.id }, { followUp: "none" });
  assert.ok(noneRes.admissions.map((a) => a.id).includes(eNone.id));
  assert.ok(!noneRes.admissions.map((a) => a.id).some((id) => id !== eNone.id && [eOverdue.id, eDue.id, eUpcoming.id].includes(id)));

  const overdueRes = await listAdminAdmissions({ id: counsellor.id }, { followUp: "overdue" });
  const overdueIds = overdueRes.admissions.map((a) => a.id);
  assert.ok(overdueIds.includes(eOverdue.id));
  assert.ok(!overdueIds.includes(eDue.id) && !overdueIds.includes(eUpcoming.id));

  const dueRes = await listAdminAdmissions({ id: counsellor.id }, { followUp: "due" });
  const dueIds = dueRes.admissions.map((a) => a.id);
  assert.ok(dueIds.includes(eDue.id), "due record matches the due-soon window");
  assert.ok(!dueIds.includes(eOverdue.id) && !dueIds.includes(eUpcoming.id) && !dueIds.includes(eNone.id));

  const upcomingRes = await listAdminAdmissions({ id: counsellor.id }, { followUp: "upcoming" });
  const upcomingIds = upcomingRes.admissions.map((a) => a.id);
  assert.ok(upcomingIds.includes(eUpcoming.id));
  assert.ok(!upcomingIds.includes(eDue.id) && !upcomingIds.includes(eOverdue.id) && !upcomingIds.includes(eNone.id));

  // Sanity: the due window constant is 24h (matches the classifier).
  assert.equal(FOLLOW_UP_DUE_SOON_WINDOW_MS, 24 * 60 * 60 * 1000);
});
