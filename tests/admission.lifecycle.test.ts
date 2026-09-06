// FILE: tests/admission.lifecycle.test.ts
//
// PHASE S6-B1 — ADMISSION / CONVERSION PURE DOMAIN LAYER
//
// Fully deterministic, DB-free, AI-free tests of the canonical
// (Lead × course) admission lifecycle:
//   • transition graph (valid + invalid)
//   • actor authority (AI/STUDENT/SYSTEM can never reach
//     human-verification states; "paid" never verifies payment)
//   • terminal / reversible / human-verification boundaries
//   • event-action normalization + REACTIVATED special case
//   • idempotency-key construction (deterministic, discriminator-aware)
//   • course normalization (COACHING_COURSES-tolerant; PTE vs
//     PTE Academic stay distinct; Goethe→German; unknown → null)
//
// Run: npx tsx tests/admission.lifecycle.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AdmissionActor,
  AdmissionEventAction,
  AdmissionState,
} from "@prisma/client";
import {
  AdmissionLifecycleError,
  AdmissionLifecycleErrorCode,
  ADMISSION_STATES,
  ALLOWED_ADMISSION_TRANSITIONS,
  assertAdmissionEventActionAllowed,
  assertAdmissionTransition,
  buildAdmissionEventKey,
  buildTransitionEventKey,
  canActorEmitEvent,
  canActorPerformTransition,
  canCreateAdmissionEnrollment,
  derivationTargetAction,
  isAdmissionState,
  isAllowedTransition,
  isCanonicalAdmissionCourse,
  isHumanVerificationAdmissionState,
  isReversibleAdmissionState,
  isTerminalAdmissionState,
  normalizeAdmissionCourse,
} from "../lib/admission/admission.lifecycle";

/** Capture-sure equivalent of assert.throws that returns the error. */
function expectThrows(fn: () => void): AdmissionLifecycleError {
  try {
    fn();
  } catch (err) {
    return err as AdmissionLifecycleError;
  }
  assert.fail("expected function to throw");
}

// ── STATE CONTEXT ────────────────────────────────────────────────

test("state context: all canonical states are recognized", () => {
  for (const s of ADMISSION_STATES) {
    assert.equal(isAdmissionState(s), true);
    assert.equal(isAdmissionState(`${s}-junk`), false);
  }
  assert.equal(isAdmissionState(null), false);
  assert.equal(isAdmissionState(42), false);
});

test("state context: terminal / reversible / human-verification sets", () => {
  assert.equal(isTerminalAdmissionState(AdmissionState.ADMISSION_COMPLETED), true);
  assert.equal(isTerminalAdmissionState(AdmissionState.LOST), true);
  assert.equal(isTerminalAdmissionState(AdmissionState.INTERESTED), false);
  assert.equal(isTerminalAdmissionState(AdmissionState.NOT_INTERESTED), false);

  assert.equal(isReversibleAdmissionState(AdmissionState.NOT_INTERESTED), true);
  assert.equal(isReversibleAdmissionState(AdmissionState.LOST), false);
  assert.equal(isReversibleAdmissionState(AdmissionState.INTERESTED), false);

  for (const s of [
    AdmissionState.PAYMENT_VERIFICATION,
    AdmissionState.PAYMENT_VERIFIED,
    AdmissionState.ADMISSION_CONFIRMED,
    AdmissionState.ADMISSION_COMPLETED,
  ]) {
    assert.equal(isHumanVerificationAdmissionState(s), true);
  }
  assert.equal(isHumanVerificationAdmissionState(AdmissionState.FOLLOW_UP_REQUIRED), false);
});

// ── TRANSITION GRAPH ─────────────────────────────────────────────

test("valid transitions are recognized and invalid ones rejected", () => {
  assert.equal(isAllowedTransition(AdmissionState.INTERESTED, AdmissionState.COUNSELLOR_CONTACT_PENDING), true);
  assert.equal(isAllowedTransition(AdmissionState.COUNSELLOR_CONTACT_PENDING, AdmissionState.COUNSELLOR_CONTACTED), true);
  assert.equal(isAllowedTransition(AdmissionState.COUNSELLOR_CONTACTED, AdmissionState.FOLLOW_UP_REQUIRED), true);
  assert.equal(isAllowedTransition(AdmissionState.COUNSELLOR_CONTACTED, AdmissionState.DOCUMENTS_PENDING), true);
  assert.equal(isAllowedTransition(AdmissionState.COUNSELLOR_CONTACTED, AdmissionState.PAYMENT_PENDING), true);
  assert.equal(isAllowedTransition(AdmissionState.FOLLOW_UP_REQUIRED, AdmissionState.INTERESTED), true);
  assert.equal(isAllowedTransition(AdmissionState.FOLLOW_UP_REQUIRED, AdmissionState.PAYMENT_PENDING), true);
  assert.equal(isAllowedTransition(AdmissionState.PAYMENT_PENDING, AdmissionState.PAYMENT_VERIFICATION), true);
  assert.equal(isAllowedTransition(AdmissionState.PAYMENT_VERIFICATION, AdmissionState.PAYMENT_VERIFIED), true);
  assert.equal(isAllowedTransition(AdmissionState.PAYMENT_VERIFIED, AdmissionState.ADMISSION_CONFIRMED), true);
  assert.equal(isAllowedTransition(AdmissionState.ADMISSION_CONFIRMED, AdmissionState.ADMISSION_COMPLETED), true);
  assert.equal(isAllowedTransition(AdmissionState.NOT_INTERESTED, AdmissionState.INTERESTED), true);

  // jumps / backwards-to-a-point / terminal exits are all rejected
  assert.equal(isAllowedTransition(AdmissionState.INTERESTED, AdmissionState.ADMISSION_COMPLETED), false);
  assert.equal(isAllowedTransition(AdmissionState.INTERESTED, AdmissionState.PAYMENT_VERIFIED), false);
  assert.equal(isAllowedTransition(AdmissionState.PAYMENT_VERIFICATION, AdmissionState.COUNSELLOR_CONTACTED), false);
  assert.equal(isAllowedTransition(AdmissionState.LOST, AdmissionState.INTERESTED), false);
  assert.equal(isAllowedTransition(AdmissionState.ADMISSION_COMPLETED, AdmissionState.ADMISSION_CONFIRMED), false);

  // every entry in the graph is a canonical target
  for (const from of ADMISSION_STATES) {
    for (const to of ALLOWED_ADMISSION_TRANSITIONS[from]) {
      assert.equal(isAdmissionState(to), true, `${from} -> ${to} target must be canonical`);
    }
  }
});

test("assertAdmissionTransition throws precise errors", () => {
  // valid human transition passes silently
  assertAdmissionTransition(
    AdmissionState.PAYMENT_VERIFICATION,
    AdmissionState.PAYMENT_VERIFIED,
    AdmissionActor.COUNSELLOR,
  );

  const e1 = expectThrows(() =>
    assertAdmissionTransition(
      AdmissionState.INTERESTED,
      AdmissionState.ADMISSION_COMPLETED,
      AdmissionActor.ADMIN,
    ),
  );
  assert.equal(e1.code, AdmissionLifecycleErrorCode.INVALID_TRANSITION);

  const e2 = expectThrows(() =>
    assertAdmissionTransition(
      AdmissionState.LOST,
      AdmissionState.INTERESTED,
      AdmissionActor.ADMIN,
    ),
  );
  assert.equal(e2.code, AdmissionLifecycleErrorCode.TERMINAL_STATE);

  const e3 = expectThrows(() =>
    assertAdmissionTransition(
      AdmissionState.INTERESTED,
      "NONSENSE" as AdmissionState,
      AdmissionActor.ADMIN,
    ),
  );
  assert.equal(e3.code, AdmissionLifecycleErrorCode.INVALID_STATE);
});

// ── ACTOR AUTHORITY ──────────────────────────────────────────────

test("AI/STUDENT/SYSTEM can never reach human-verification states", () => {
  for (const actor of [AdmissionActor.STUDENT, AdmissionActor.SYSTEM] as AdmissionActor[]) {
    assert.equal(
      canActorPerformTransition(AdmissionState.INTERESTED, AdmissionState.PAYMENT_VERIFIED, actor),
      false,
      `${String(actor)} must not reach PAYMENT_VERIFIED`,
    );
  }
  assert.equal(
    canActorPerformTransition(
      AdmissionState.INTERESTED,
      AdmissionState.COUNSELLOR_CONTACT_PENDING,
      AdmissionActor.AI,
    ),
    true,
    "AI may surface an opportunity for a human",
  );
  assert.equal(
    canActorPerformTransition(AdmissionState.INTERESTED, AdmissionState.PAYMENT_VERIFIED, AdmissionActor.AI),
    false,
    "AI may never verify payment",
  );

  // the human boundary throws a dedicated code
  const err = expectThrows(() =>
    assertAdmissionTransition(
      AdmissionState.PAYMENT_VERIFICATION,
      AdmissionState.PAYMENT_VERIFIED,
      AdmissionActor.AI,
    ),
  );
  assert.equal(err.code, AdmissionLifecycleErrorCode.REQUIRES_HUMAN_VERIFICATION);

  // COUNSELLOR / ADMIN pass verification boundaries
  assert.equal(
    canActorPerformTransition(
      AdmissionState.PAYMENT_VERIFICATION,
      AdmissionState.PAYMENT_VERIFIED,
      AdmissionActor.COUNSELLOR,
    ),
    true,
  );
  assert.equal(
    canActorPerformTransition(
      AdmissionState.PAYMENT_VERIFIED,
      AdmissionState.ADMISSION_CONFIRMED,
      AdmissionActor.ADMIN,
    ),
    true,
  );
});

test("creation authority: STUDENT cannot create an enrollment", () => {
  assert.equal(canCreateAdmissionEnrollment(AdmissionActor.SYSTEM), true);
  assert.equal(canCreateAdmissionEnrollment(AdmissionActor.AI), true);
  assert.equal(canCreateAdmissionEnrollment(AdmissionActor.COUNSELLOR), true);
  assert.equal(canCreateAdmissionEnrollment(AdmissionActor.STUDENT), false);
});

// ── EVENT-ACTION AUTHORITY ───────────────────────────────────────

test("a student saying 'paid' is a note, never a verification", () => {
  assert.equal(canActorEmitEvent(AdmissionEventAction.SYSTEM_NOTE, AdmissionActor.STUDENT), true);
  assert.equal(canActorEmitEvent(AdmissionEventAction.NOTE_ADDED, AdmissionActor.STUDENT), true);
  assert.equal(canActorEmitEvent(AdmissionEventAction.PAYMENT_VERIFIED, AdmissionActor.STUDENT), false);
  assert.equal(canActorEmitEvent(AdmissionEventAction.ADMISSION_CONFIRMED, AdmissionActor.AI), false);
  assert.equal(canActorEmitEvent(AdmissionEventAction.PAYMENT_VERIFIED, AdmissionActor.COUNSELLOR), true);

  const err = expectThrows(() =>
    assertAdmissionEventActionAllowed(AdmissionEventAction.PAYMENT_VERIFIED, AdmissionActor.AI),
  );
  assert.equal(err.code, AdmissionLifecycleErrorCode.EVENT_ACTION_NOT_ALLOWED);
});

// ── EVENT NORMALIZATION ──────────────────────────────────────────

test("derivationTargetAction maps states and special-cases reactivation", () => {
  assert.equal(
    derivationTargetAction(AdmissionState.INTERESTED, AdmissionState.COUNSELLOR_CONTACT_PENDING),
    AdmissionEventAction.INTEREST_DETECTED,
  );
  assert.equal(
    derivationTargetAction(AdmissionState.COUNSELLOR_CONTACTED, AdmissionState.PAYMENT_PENDING),
    AdmissionEventAction.PAYMENT_CLAIMED,
  );
  assert.equal(
    derivationTargetAction(AdmissionState.PAYMENT_VERIFICATION, AdmissionState.PAYMENT_VERIFIED),
    AdmissionEventAction.PAYMENT_VERIFIED,
  );
  // reactivation is its own action — never a fresh INTEREST_DETECTED
  assert.equal(
    derivationTargetAction(AdmissionState.NOT_INTERESTED, AdmissionState.INTERESTED),
    AdmissionEventAction.REACTIVATED,
  );
});

// ── IDEMPOTENCY KEYS ─────────────────────────────────────────────

test("event keys are deterministic and discriminator-aware", () => {
  const a = buildAdmissionEventKey(
    "enr-1",
    AdmissionEventAction.PAYMENT_VERIFIED,
    AdmissionActor.COUNSELLOR,
  );
  const b = buildAdmissionEventKey(
    "enr-1",
    AdmissionEventAction.PAYMENT_VERIFIED,
    AdmissionActor.COUNSELLOR,
  );
  assert.equal(a, b, "identical logical action → identical key");

  assert.notEqual(
    buildAdmissionEventKey("enr-1", AdmissionEventAction.PAYMENT_VERIFIED, AdmissionActor.ADMIN),
    a,
    "different actor → different key",
  );
  assert.notEqual(
    buildAdmissionEventKey("enr-2", AdmissionEventAction.PAYMENT_VERIFIED, AdmissionActor.COUNSELLOR),
    a,
    "different enrollment → different key",
  );
  const withLater = buildAdmissionEventKey(
    "enr-1",
    AdmissionEventAction.PAYMENT_VERIFIED,
    AdmissionActor.COUNSELLOR,
    "2026-10-01",
  );
  assert.notEqual(withLater, a, "a legitimate later repeat carries a discriminator → new key");

  const t1 = buildTransitionEventKey(
    "enr-1",
    AdmissionState.PAYMENT_VERIFICATION,
    AdmissionState.PAYMENT_VERIFIED,
    AdmissionActor.COUNSELLOR,
  );
  const t2 = buildTransitionEventKey(
    "enr-1",
    AdmissionState.PAYMENT_VERIFICATION,
    AdmissionState.PAYMENT_VERIFIED,
    AdmissionActor.COUNSELLOR,
  );
  assert.equal(t1, t2);
  // REACTIVATED transition key is distinct from a fresh INTEREST_DETECTED
  assert.notEqual(
    buildTransitionEventKey(
      "enr-1",
      AdmissionState.NOT_INTERESTED,
      AdmissionState.INTERESTED,
      AdmissionActor.COUNSELLOR,
    ),
    buildTransitionEventKey(
      "enr-1",
      AdmissionState.INTERESTED,
      AdmissionState.COUNSELLOR_CONTACT_PENDING,
      AdmissionActor.COUNSELLOR,
    ),
  );
});

// ── COURSE NORMALIZATION ─────────────────────────────────────────

test("course normalization reuses the canonical COACHING_COURSES vocabulary", () => {
  assert.equal(normalizeAdmissionCourse("IELTS"), "IELTS");
  assert.equal(normalizeAdmissionCourse("ielts"), "IELTS");
  assert.equal(normalizeAdmissionCourse("  Ielts  "), "IELTS");
  assert.equal(normalizeAdmissionCourse("IELTS Academic"), "IELTS Academic");
  assert.equal(normalizeAdmissionCourse("Goethe"), "German");
  assert.equal(normalizeAdmissionCourse("tef"), "French");
  assert.equal(normalizeAdmissionCourse("gmat"), "GMAT");
});

test("PTE and PTE Academic stay distinct canonical values", () => {
  assert.equal(normalizeAdmissionCourse("PTE"), "PTE");
  assert.equal(normalizeAdmissionCourse("pte"), "PTE");
  assert.equal(normalizeAdmissionCourse("PTE Academic"), "PTE Academic");
  assert.equal(normalizeAdmissionCourse("pte academic"), "PTE Academic");
  assert.notEqual(normalizeAdmissionCourse("PTE"), normalizeAdmissionCourse("PTE Academic"));
  assert.equal(isCanonicalAdmissionCourse("PTE Academic"), true);
  assert.equal(isCanonicalAdmissionCourse("PTE"), true);
});

test("unrecognized or empty courses normalize to null", () => {
  assert.equal(normalizeAdmissionCourse("German A1"), null);
  assert.equal(normalizeAdmissionCourse("Not a Course"), null);
  assert.equal(normalizeAdmissionCourse(""), null);
  assert.equal(normalizeAdmissionCourse("   "), null);
  assert.equal(normalizeAdmissionCourse(null), null);
  assert.equal(normalizeAdmissionCourse(42), null);
  assert.equal(isCanonicalAdmissionCourse("German A1"), false);
});