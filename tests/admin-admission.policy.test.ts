// FILE: tests/admin-admission.policy.test.ts
//
// PHASE S6-B2 — PURE POLICY TESTS FOR THE ADMISSION WORKSPACE
//
// DB-free verification of the server-side governance of the
// /admin/admissions surface:
//   • actor derivation (ADMIN → ADMIN verb; everyone else → COUNSELLOR;
//     STUDENT/AI/SYSTEM can never be derived from a staff login)
//   • per-record authorization (unassigned | self | other → allowed/
//     denied, including "assign is a self-claim, reassign is ADMIN")
//   • urgent-first queue ordering (pure, deterministic)
//   • action vocabulary ↔ lifecycle state mapping
//   • safe HTTP mapping of lifecycle error codes
//
// Run: npx tsx tests/admin-admission.policy.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import { AdmissionActor, AdmissionState } from "@prisma/client";
import {
  actorForStaffIdentity,
  canModifyAdmission,
  compareAdmissionQueueItems,
  ADMISSION_QUEUE_RANK,
  ADMIN_ACTION_TO_STATE,
  ADMIN_ADMISSION_ACTIONS,
  ADMISSION_COURSE_OPTIONS,
  adminAdmissionErrorResponse,
} from "../lib/admission/admin.admissions.service";
import {
  AdmissionLifecycleError,
  AdmissionLifecycleErrorCode,
} from "../lib/admission/admission.lifecycle";

// ── ACTOR DERIVATION ──────────────────────────────────────────────

test("actor derivation: ADMIN staff → ADMIN verb; everyone else → COUNSELLOR", () => {
  assert.equal(actorForStaffIdentity("ADMIN"), AdmissionActor.ADMIN);
  assert.equal(actorForStaffIdentity("COUNSELLOR"), AdmissionActor.COUNSELLOR);
  assert.equal(actorForStaffIdentity("OPERATOR"), AdmissionActor.COUNSELLOR);
});

test("a staff login can never derive a STUDENT / AI / SYSTEM actor", () => {
  const derived = [
    actorForStaffIdentity("ADMIN"),
    actorForStaffIdentity("COUNSELLOR"),
    actorForStaffIdentity("OPERATOR"),
  ];
  for (const actor of derived) {
    assert.ok(
      actor === AdmissionActor.ADMIN || actor === AdmissionActor.COUNSELLOR,
      `derived actor must be human, got ${String(actor)}`,
    );
  }
});

// ── PER-RECORD AUTHORIZATION (TASK 9 / TEST D) ────────────────────

const COUNSELLOR_A = { id: "staff-a", role: "COUNSELLOR" };
const ADMIN = { id: "staff-admin", role: "ADMIN" };

test("per-record rule: ADMIN may work, assign or release anything", () => {
  assert.equal(canModifyAdmission(ADMIN, { assignedCounsellorId: "staff-b" }, "STATE").allowed, true);
  assert.equal(canModifyAdmission(ADMIN, { assignedCounsellorId: null }, "NOTE").allowed, true);
  assert.equal(canModifyAdmission(ADMIN, { assignedCounsellorId: "staff-b" }, "ASSIGN", "staff-x").allowed, true);
  assert.equal(canModifyAdmission(ADMIN, { assignedCounsellorId: "staff-b" }, "RELEASE").allowed, true);
});

test("per-record rule: unassigned records are workable by any counsellor", () => {
  assert.equal(canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: null }, "STATE").allowed, true);
  assert.equal(canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: null }, "NOTE").allowed, true);
});

test("per-record rule: a counsellor owns only their own records", () => {
  // own record → work + release allowed
  assert.equal(
    canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: "staff-a" }, "STATE").allowed,
    true,
  );
  assert.equal(
    canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: "staff-a" }, "NOTE").allowed,
    true,
  );
  assert.equal(
    canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: "staff-a" }, "RELEASE").allowed,
    true,
  );
});

test("per-record rule: another counsellor's record is off-limits to a counsellor", () => {
  const deniedState = canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: "staff-b" }, "STATE");
  assert.equal(deniedState.allowed, false);
  assert.equal((deniedState as { reason: string }).reason, "ASSIGNED_TO_OTHER");

  assert.equal(canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: "staff-b" }, "NOTE").allowed, false);
  assert.equal(canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: "staff-b" }, "RELEASE").allowed, false);
  assert.equal(canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: "staff-b" }, "ASSIGN", "staff-a").allowed, false);
  assert.equal(canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: "staff-b" }, "ASSIGN", "staff-c").allowed, false);
});

test("per-record rule: assignment is a self-claim for a counsellor", () => {
  assert.equal(canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: null }, "ASSIGN", "staff-a").allowed, true);
  assert.equal(canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: null }, "ASSIGN", "staff-b").allowed, false);
  assert.equal(canModifyAdmission(COUNSELLOR_A, { assignedCounsellorId: null }, "RELEASE").allowed, false);
});

// ── QUEUE ORDERING (TASK 3) ───────────────────────────────────────

test("urgent/actionable states sort before terminal journeys", () => {
  const states = Object.values(AdmissionState);
  const byRank = [...states].sort(
    (a, b) => ADMISSION_QUEUE_RANK[a] - ADMISSION_QUEUE_RANK[b],
  );
  // the two most actionable first
  assert.equal(byRank[0], AdmissionState.COUNSELLOR_CONTACT_PENDING);
  assert.equal(byRank[1], AdmissionState.PAYMENT_VERIFICATION);
  // terminal and closed trails
  assert.equal(byRank.length, 12);
  assert.equal(byRank[byRank.length - 1], AdmissionState.LOST);
  assert.equal(byRank[byRank.length - 2], AdmissionState.ADMISSION_COMPLETED);
});

test("queue comparator: rank first, then newest updated first", () => {
  const urgent = {
    state: AdmissionState.PAYMENT_VERIFICATION,
    updatedAt: new Date("2026-09-01T10:00:00Z"),
  };
  const calm = {
    state: AdmissionState.INTERESTED,
    updatedAt: new Date("2026-09-05T10:00:00Z"),
  };
  assert.ok(compareAdmissionQueueItems(urgent, calm) < 0);

  const a = {
    state: AdmissionState.COUNSELLOR_CONTACT_PENDING,
    updatedAt: new Date("2026-09-01T10:00:00Z"),
  };
  const b = {
    state: AdmissionState.COUNSELLOR_CONTACT_PENDING,
    updatedAt: new Date("2026-09-03T10:00:00Z"),
  };
  assert.ok(compareAdmissionQueueItems(a, b) > 0, "newest updated first within a state");
});

// ── ACTION VOCABULARY ─────────────────────────────────────────────

test("every workspace action maps to a lifecycle target via the canonical service", () => {
  assert.equal(ADMIN_ADMISSION_ACTIONS.length, 16);
  assert.equal(ADMIN_ACTION_TO_STATE.CONTACT_PENDING, AdmissionState.COUNSELLOR_CONTACT_PENDING);
  assert.equal(ADMIN_ACTION_TO_STATE.MARK_CONTACTED, AdmissionState.COUNSELLOR_CONTACTED);
  assert.equal(ADMIN_ACTION_TO_STATE.FOLLOW_UP, AdmissionState.FOLLOW_UP_REQUIRED);
  assert.equal(ADMIN_ACTION_TO_STATE.FOLLOW_UP_ATTEMPTED, undefined);
  assert.equal(ADMIN_ACTION_TO_STATE.DOCUMENTS_PENDING, AdmissionState.DOCUMENTS_PENDING);
  assert.equal(ADMIN_ACTION_TO_STATE.PAYMENT_PENDING, AdmissionState.PAYMENT_PENDING);
  assert.equal(ADMIN_ACTION_TO_STATE.PAYMENT_VERIFICATION, AdmissionState.PAYMENT_VERIFICATION);
  assert.equal(ADMIN_ACTION_TO_STATE.PAYMENT_VERIFIED, AdmissionState.PAYMENT_VERIFIED);
  assert.equal(ADMIN_ACTION_TO_STATE.ADMISSION_CONFIRMED, AdmissionState.ADMISSION_CONFIRMED);
  assert.equal(ADMIN_ACTION_TO_STATE.ADMISSION_COMPLETED, AdmissionState.ADMISSION_COMPLETED);
  assert.equal(ADMIN_ACTION_TO_STATE.NOT_INTERESTED, AdmissionState.NOT_INTERESTED);
  assert.equal(ADMIN_ACTION_TO_STATE.LOST, AdmissionState.LOST);
  assert.equal(ADMIN_ACTION_TO_STATE.REACTIVATE, AdmissionState.INTERESTED);
  assert.equal(ADMIN_ACTION_TO_STATE.ASSIGN, undefined);
  assert.equal(ADMIN_ACTION_TO_STATE.RELEASE, undefined);
  assert.equal(ADMIN_ACTION_TO_STATE.NOTE, undefined);
});

test("course options come from the single canonical vocabulary", () => {
  assert.ok(ADMISSION_COURSE_OPTIONS.includes("IELTS"));
  assert.ok(ADMISSION_COURSE_OPTIONS.includes("PTE"));
  assert.ok(ADMISSION_COURSE_OPTIONS.includes("PTE Academic"));
  assert.ok(ADMISSION_COURSE_OPTIONS.includes("German"));
  assert.ok(ADMISSION_COURSE_OPTIONS.length >= 14);
});

// ── SAFE ERROR MAPPING (TASK 9) ───────────────────────────────────

test("lifecycle errors are mapped to safe precise HTTP responses", () => {
  const res400 = adminAdmissionErrorResponse(
    new AdmissionLifecycleError(AdmissionLifecycleErrorCode.INVALID_TRANSITION, "INTERESTED -> LOST is not allowed"),
  );
  assert.equal(res400.status, 400);

  const res409 = adminAdmissionErrorResponse(
    new AdmissionLifecycleError(AdmissionLifecycleErrorCode.CONCURRENT_MODIFICATION, "lost a race"),
  );
  assert.equal(res409.status, 409);

  const res404 = adminAdmissionErrorResponse(
    new AdmissionLifecycleError(AdmissionLifecycleErrorCode.NOT_FOUND, "not found"),
  );
  assert.equal(res404.status, 404);

  const res403 = adminAdmissionErrorResponse(
    new AdmissionLifecycleError(AdmissionLifecycleErrorCode.REQUIRES_HUMAN_VERIFICATION, "human only"),
  );
  assert.equal(res403.status, 403);
});