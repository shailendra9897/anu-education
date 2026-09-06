// FILE: lib/admission/admission.lifecycle.ts
//
// ═════════════════════════════════════════════════════════════════
// PHASE S6-B1 — ADMISSION / CONVERSION PURE DOMAIN LAYER
//
// The deterministic, DB-free, AI-free core of the canonical
// (Lead × course) admission record (S6-A audit — OPTION D).
//
//   • WHAT it owns: allowed states, the smallest safe transition
//     graph, actor authority (WHO may cause WHAT), event action
//     normalization, idempotency-key construction, and the canonical
//     course vocabulary (single source = COACHING_COURSES).
//   • WHAT it is NOT: it makes NO AI calls, sends NO WhatsApp, reads
//     NO database. It cannot mark a payment verified, confirm an
//     admission, or contact anyone — those are human-gated policies
//     expressed here and enforced by lib/admission/admission.service.ts.
//   • It does NOT duplicate S5: classifyAdmissionIntent /
//     evaluateCounsellorPriority / mapCounsellorPriorityToAction
//     remain lib/lead/counsellor.priority.ts + counsellor.action.ts.
//
// Design rules (S6-B1):
//   1. Absence of an AdmissionEnrollment row = NONE. There is no
//      pointless NONE row and no NONE enum value.
//   2. The record is owned by Lead × canonical course — never by a
//      conversation id.
//   3. A transition is VALID only if both the graph AND the actor
//      policy allow it. AI can raise an opportunity to
//      COUNSELLOR_CONTACT_PENDING at most; it can never touch
//      payment-verification or admission-confirmation states.
//      "I paid / payment done / done" NEVER verifies payment.
//   4. Idempotency: every transition event carries a deterministic
//      (enrollmentId, action, actor) key; Postgres' unique index
//      collapses concurrent/sequential duplicates to one row. A
//      caller passes a `discriminator` only for a genuinely later
//      repeat of the SAME logical action.
// ═════════════════════════════════════════════════════════════════

import {
  AdmissionActor,
  AdmissionEventAction,
  AdmissionState,
} from "@prisma/client";
import { COACHING_COURSES } from "../lead/leadExtractor";

// ═════════════════════════════════════════════════════════════════
// ERROR TYPES
// ═════════════════════════════════════════════════════════════════

export enum AdmissionLifecycleErrorCode {
  INVALID_STATE = "INVALID_STATE",
  INVALID_TRANSITION = "INVALID_TRANSITION",
  TERMINAL_STATE = "TERMINAL_STATE",
  FORBIDDEN_ACTOR = "FORBIDDEN_ACTOR",
  REQUIRES_HUMAN_VERIFICATION = "REQUIRES_HUMAN_VERIFICATION",
  INVALID_COURSE = "INVALID_COURSE",
  NOT_FOUND = "NOT_FOUND",
  ALREADY_IN_STATE = "ALREADY_IN_STATE",
  CONCURRENT_MODIFICATION = "CONCURRENT_MODIFICATION",
  EVENT_ACTION_NOT_ALLOWED = "EVENT_ACTION_NOT_ALLOWED",
}

export class AdmissionLifecycleError extends Error {
  readonly code: AdmissionLifecycleErrorCode;

  constructor(code: AdmissionLifecycleErrorCode, message: string) {
    super(message);
    this.name = "AdmissionLifecycleError";
    this.code = code;
  }
}

// ═════════════════════════════════════════════════════════════════
// STATES
// ═════════════════════════════════════════════════════════════════

/** All canonical admission states, in display order. */
export const ADMISSION_STATES: readonly AdmissionState[] = [
  AdmissionState.INTERESTED,
  AdmissionState.COUNSELLOR_CONTACT_PENDING,
  AdmissionState.COUNSELLOR_CONTACTED,
  AdmissionState.FOLLOW_UP_REQUIRED,
  AdmissionState.DOCUMENTS_PENDING,
  AdmissionState.PAYMENT_PENDING,
  AdmissionState.PAYMENT_VERIFICATION,
  AdmissionState.PAYMENT_VERIFIED,
  AdmissionState.ADMISSION_CONFIRMED,
  AdmissionState.ADMISSION_COMPLETED,
  AdmissionState.NOT_INTERESTED,
  AdmissionState.LOST,
];

export function isAdmissionState(value: unknown): value is AdmissionState {
  return (
    typeof value === "string" &&
    (ADMISSION_STATES as readonly string[]).includes(value)
  );
}

export function isAdmissionActor(value: unknown): value is AdmissionActor {
  return (
    typeof value === "string" &&
    [
      AdmissionActor.STUDENT,
      AdmissionActor.COUNSELLOR,
      AdmissionActor.ADMIN,
      AdmissionActor.SYSTEM,
      AdmissionActor.AI,
    ].includes(value as AdmissionActor)
  );
}

/** Terminal states: the journey is finished and cannot be resumed. */
export const TERMINAL_ADMISSION_STATES: ReadonlySet<AdmissionState> = new Set([
  AdmissionState.ADMISSION_COMPLETED,
  AdmissionState.LOST,
]);

/**
 * Reversible states: an explicit reactivation is supported ONLY from
 * these. NOT_INTERESTED is reversible (a student who left the funnel
 * may return); LOST is not.
 */
export const REVERSIBLE_ADMISSION_STATES: ReadonlySet<AdmissionState> =
  new Set([AdmissionState.NOT_INTERESTED]);

/**
 * Human-verification states: reaching ANY of these requires an explicit
 * authorized human (COUNSELLOR | ADMIN) action. AI, SYSTEM and STUDENT
 * can never reach them — a student saying "I paid" does not verify
 * payment and the AI must never confirm an admission.
 */
export const HUMAN_VERIFICATION_ADMISSION_STATES: ReadonlySet<AdmissionState> = new Set([
  AdmissionState.PAYMENT_VERIFICATION,
  AdmissionState.PAYMENT_VERIFIED,
  AdmissionState.ADMISSION_CONFIRMED,
  AdmissionState.ADMISSION_COMPLETED,
]);

export function isTerminalAdmissionState(value: AdmissionState): boolean {
  return TERMINAL_ADMISSION_STATES.has(value);
}

export function isReversibleAdmissionState(value: AdmissionState): boolean {
  return REVERSIBLE_ADMISSION_STATES.has(value);
}

export function isHumanVerificationAdmissionState(value: AdmissionState): boolean {
  return HUMAN_VERIFICATION_ADMISSION_STATES.has(value);
}

// ═════════════════════════════════════════════════════════════════
// TRANSITION GRAPH — the smallest safe set
// ═════════════════════════════════════════════════════════════════
//
//   INTERESTED ──────────────────────────────────────────────────┐
//      │  (detection)                                            │ any non-terminal can
//      ▼                                                         │ → NOT_INTERESTED / LOST
//   COUNSELLOR_CONTACT_PENDING                                   │
//      │  (counsellor reaches out)                               │
//      ▼                                                         │
//   COUNSELLOR_CONTACTED ──────► FOLLOW_UP_REQUIRED              │
//      │  │      │                   │  │                        │
//      │  │      └─► DOCUMENTS_PENDING│  └─► INTERESTED (back)   │
//      │  └──────► PAYMENT_PENDING ◄──┘   └─► COUNSELLOR_CONTACTED
//      │                 │
//      ▼                 ▼
//   PAYMENT_VERIFICATION ◄── (evidence rejected → back)
//      │  [HUMAN-ONLY]
//      ▼
//   PAYMENT_VERIFIED
//      │  [HUMAN-ONLY]
//      ▼
//   ADMISSION_CONFIRMED
//      │  [HUMAN-ONLY]
//      ▼
//   ADMISSION_COMPLETED   (terminal)
//
//   NOT_INTERESTED ──(REACTIVATED)──► INTERESTED   (reversible)
//   LOST / ADMISSION_COMPLETED = terminal.
// ═════════════════════════════════════════════════════════════════

export const ALLOWED_ADMISSION_TRANSITIONS: Readonly<
  Record<AdmissionState, readonly AdmissionState[]>
> = {
  [AdmissionState.INTERESTED]: [
    AdmissionState.COUNSELLOR_CONTACT_PENDING,
    AdmissionState.NOT_INTERESTED,
    AdmissionState.LOST,
  ],
  [AdmissionState.COUNSELLOR_CONTACT_PENDING]: [
    AdmissionState.COUNSELLOR_CONTACTED,
    AdmissionState.INTERESTED,
    AdmissionState.NOT_INTERESTED,
    AdmissionState.LOST,
  ],
  [AdmissionState.COUNSELLOR_CONTACTED]: [
    AdmissionState.FOLLOW_UP_REQUIRED,
    AdmissionState.DOCUMENTS_PENDING,
    AdmissionState.PAYMENT_PENDING,
    AdmissionState.NOT_INTERESTED,
    AdmissionState.LOST,
  ],
  [AdmissionState.FOLLOW_UP_REQUIRED]: [
    AdmissionState.INTERESTED,
    AdmissionState.COUNSELLOR_CONTACTED,
    AdmissionState.PAYMENT_PENDING,
    AdmissionState.NOT_INTERESTED,
    AdmissionState.LOST,
  ],
  [AdmissionState.DOCUMENTS_PENDING]: [
    AdmissionState.PAYMENT_PENDING,
    AdmissionState.COUNSELLOR_CONTACTED,
    AdmissionState.NOT_INTERESTED,
    AdmissionState.LOST,
  ],
  [AdmissionState.PAYMENT_PENDING]: [
    AdmissionState.PAYMENT_VERIFICATION,
    AdmissionState.NOT_INTERESTED,
    AdmissionState.LOST,
  ],
  [AdmissionState.PAYMENT_VERIFICATION]: [
    AdmissionState.PAYMENT_VERIFIED,
    AdmissionState.PAYMENT_PENDING, // evidence rejected/insufficient
    AdmissionState.NOT_INTERESTED,
    AdmissionState.LOST,
  ],
  [AdmissionState.PAYMENT_VERIFIED]: [AdmissionState.ADMISSION_CONFIRMED],
  [AdmissionState.ADMISSION_CONFIRMED]: [AdmissionState.ADMISSION_COMPLETED],
  [AdmissionState.ADMISSION_COMPLETED]: [],
  [AdmissionState.NOT_INTERESTED]: [
    AdmissionState.INTERESTED, // explicit REACTIVATED only
    AdmissionState.LOST,
  ],
  [AdmissionState.LOST]: [],
};

export function isAllowedTransition(
  from: AdmissionState,
  to: AdmissionState,
): boolean {
  if (!isAdmissionState(from) || !isAdmissionState(to)) return false;
  return (ALLOWED_ADMISSION_TRANSITIONS[from] as readonly AdmissionState[]).includes(to);
}

// ═════════════════════════════════════════════════════════════════
// ACTOR AUTHORITY
// ═════════════════════════════════════════════════════════════════

/** States only a COUNSELLOR or ADMIN may reach. */
export function actorMayReachState(
  to: AdmissionState,
  actor: AdmissionActor,
): boolean {
  if (HUMAN_VERIFICATION_ADMISSION_STATES.has(to)) {
    return actor === AdmissionActor.COUNSELLOR || actor === AdmissionActor.ADMIN;
  }
  switch (actor) {
    case AdmissionActor.STUDENT:
      // A student's words are interpreted by a counsellor/system; a
      // student can never drive a state transition by themselves.
      return false;
    case AdmissionActor.AI:
      // AI may only surface an opportunity for a human; it can never
      // claim contact, documents, payment or admission.
      return to === AdmissionState.COUNSELLOR_CONTACT_PENDING;
    case AdmissionActor.SYSTEM:
      // Unattended automation: create an opportunity, surface it, or
      // record a decline classification — never humans-only work.
      return (
        to === AdmissionState.INTERESTED ||
        to === AdmissionState.COUNSELLOR_CONTACT_PENDING ||
        to === AdmissionState.NOT_INTERESTED
      );
    case AdmissionActor.COUNSELLOR:
    case AdmissionActor.ADMIN:
    default:
      return true;
  }
}

export function canActorPerformTransition(
  from: AdmissionState,
  to: AdmissionState,
  actor: AdmissionActor,
): boolean {
  return isAllowedTransition(from, to) && actorMayReachState(to, actor);
}

export function canCreateAdmissionEnrollment(actor: AdmissionActor): boolean {
  return actor !== AdmissionActor.STUDENT;
}

/**
 * assertAdmissionTransition
 * ──────────────────────────
 * Pure validation of a state transition. Throws an
 * AdmissionLifecycleError with a precise code on any violation.
 * Does NOT touch the database.
 */
export function assertAdmissionTransition(
  from: AdmissionState,
  to: AdmissionState,
  actor: AdmissionActor,
): void {
  if (!isAdmissionState(from) || !isAdmissionState(to)) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.INVALID_STATE,
      `Admission state from=${from} to=${to} is not a canonical state`,
    );
  }
  if (isTerminalAdmissionState(from)) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.TERMINAL_STATE,
      `Cannot transition from terminal state ${from}`,
    );
  }
  if (!isAllowedTransition(from, to)) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.INVALID_TRANSITION,
      `Transition ${from} -> ${to} is not allowed`,
    );
  }
  if (!actorMayReachState(to, actor)) {
    if (HUMAN_VERIFICATION_ADMISSION_STATES.has(to)) {
      throw new AdmissionLifecycleError(
        AdmissionLifecycleErrorCode.REQUIRES_HUMAN_VERIFICATION,
        `${to} requires an explicit COUNSELLOR or ADMIN action; actor=${actor} is not authorized`,
      );
    }
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.FORBIDDEN_ACTOR,
      `Actor ${actor} may not cause the transition to ${to}`,
    );
  }
}

// ═════════════════════════════════════════════════════════════════
// EVENT ACTION NORMALIZATION
// ═════════════════════════════════════════════════════════════════

/** Canonical event action used to ARRIVE at a given state. */
export const ADMISSION_STATE_TO_ACTION: Readonly<
  Record<AdmissionState, AdmissionEventAction>
> = {
  [AdmissionState.INTERESTED]: AdmissionEventAction.INTEREST_DETECTED,
  [AdmissionState.COUNSELLOR_CONTACT_PENDING]: AdmissionEventAction.INTEREST_DETECTED,
  [AdmissionState.COUNSELLOR_CONTACTED]: AdmissionEventAction.COUNSELLOR_CONTACTED,
  [AdmissionState.FOLLOW_UP_REQUIRED]: AdmissionEventAction.FOLLOW_UP_REQUIRED,
  [AdmissionState.DOCUMENTS_PENDING]: AdmissionEventAction.DOCUMENTS_REQUESTED,
  [AdmissionState.PAYMENT_PENDING]: AdmissionEventAction.PAYMENT_CLAIMED,
  [AdmissionState.PAYMENT_VERIFICATION]: AdmissionEventAction.PAYMENT_VERIFICATION_STARTED,
  [AdmissionState.PAYMENT_VERIFIED]: AdmissionEventAction.PAYMENT_VERIFIED,
  [AdmissionState.ADMISSION_CONFIRMED]: AdmissionEventAction.ADMISSION_CONFIRMED,
  [AdmissionState.ADMISSION_COMPLETED]: AdmissionEventAction.ADMISSION_COMPLETED,
  [AdmissionState.NOT_INTERESTED]: AdmissionEventAction.NOT_INTERESTED,
  [AdmissionState.LOST]: AdmissionEventAction.LOST,
};

/**
 * deriveTransitionAction — the event action for a specific (from → to)
 * walk. The one special case: a NOT_INTERESTED reactivation must be
 * recorded distinctly as REACTIVATED, never as a fresh INTEREST_DETECTED.
 */
export function derivationTargetAction(
  from: AdmissionState,
  to: AdmissionState,
): AdmissionEventAction {
  if (from === AdmissionState.NOT_INTERESTED && to === AdmissionState.INTERESTED) {
    return AdmissionEventAction.REACTIVATED;
  }
  return ADMISSION_STATE_TO_ACTION[to];
}

/** Event actions that only COUNSELLOR | ADMIN may cause. */
export const HUMAN_VERIFICATION_EVENT_ACTIONS: ReadonlySet<AdmissionEventAction> =
  new Set([
    AdmissionEventAction.PAYMENT_VERIFICATION_STARTED,
    AdmissionEventAction.PAYMENT_VERIFIED,
    AdmissionEventAction.ADMISSION_CONFIRMED,
    AdmissionEventAction.ADMISSION_COMPLETED,
  ]);

/**
 * canActorEmitEvent — actor authority for FREE-FORM (non-transition)
 * events (notes, claims, system notes). A student can contribute a
 * NOTE_ADDED/SYSTEM_NOTE record (e.g. "student says: I paid") but can
 * never be the actor of a verification/confirmation event.
 */
export function canActorEmitEvent(
  action: AdmissionEventAction,
  actor: AdmissionActor,
): boolean {
  if (HUMAN_VERIFICATION_EVENT_ACTIONS.has(action)) {
    return actor === AdmissionActor.COUNSELLOR || actor === AdmissionActor.ADMIN;
  }
  if (actor === AdmissionActor.STUDENT) {
    return (
      action === AdmissionEventAction.NOTE_ADDED ||
      action === AdmissionEventAction.SYSTEM_NOTE
    );
  }
  return true;
}

export function assertAdmissionEventActionAllowed(
  action: AdmissionEventAction,
  actor: AdmissionActor,
): void {
  if (!canActorEmitEvent(action, actor)) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.EVENT_ACTION_NOT_ALLOWED,
      `Actor ${actor} may not emit event action ${action}`,
    );
  }
}

// ═════════════════════════════════════════════════════════════════
// IDEMPOTENCY KEYS — deterministic, unique-index-backed
// ═════════════════════════════════════════════════════════════════
//
// The AdmissionEvent @@unique([admissionEnrollmentId, eventKey]) index
// makes an idempotent event a DB-level guarantee: the SAME logical
// action (same enrollment, action, actor and — if provided —
// discriminator) can only ever exist ONCE, whether it arrives
// sequentially or concurrently (the losing insert hits P2002).
//
//   · buildAdmissionEventKey → the DEFAULT key for a logical action.
//   · A non-null eventKey is REQUIRED for state-transition events,
//     so the transition's event is race-proof.
//   · `discriminator` is how a genuinely LATER repeat of the same
//     logical action becomes a new, legitimate event (e.g. a counsellor
//     contacting the same student again weeks later). Without it the
//     same (action, actor) collapses to the existing event.
//   · Free-form events (notes) with NO key are always inserted —
//     Postgres treats NULL as distinct in the unique index.
// ═════════════════════════════════════════════════════════════════

export function buildAdmissionEventKey(
  admissionEnrollmentId: string,
  action: AdmissionEventAction,
  actor: AdmissionActor,
  discriminator?: string,
): string {
  const parts = [admissionEnrollmentId, action, actor];
  if (discriminator) parts.push(discriminator);
  return parts.join(":");
}

export function buildTransitionEventKey(
  admissionEnrollmentId: string,
  from: AdmissionState,
  to: AdmissionState,
  actor: AdmissionActor,
  discriminator?: string,
): string {
  return buildAdmissionEventKey(
    admissionEnrollmentId,
    derivationTargetAction(from, to),
    actor,
    discriminator,
  );
}

// ═════════════════════════════════════════════════════════════════
// COURSE NORMALIZATION — canonical vocabulary, single source
// ═════════════════════════════════════════════════════════════════
//
// Mirrors the tolerant matching used by extractCoachingCourse /
// detectCoachingCourse: an exact canonical value is kept as-is; a
// fuzzy input is folded (lowercase + whitespace-collapsed) and matched
// longest-key-first against COACHING_COURSES. "PTE Academic" and "PTE"
// remain DISTINCT canonical values — exactly as today — and German/
// Goethe, French/TEF/TCF both resolve to their canonical course.
// Returns null when the input is not a recognized coaching course
// (e.g. "German A1", garbage) — callers decide how to handle that.
// ═════════════════════════════════════════════════════════════════

const CANONICAL_COURSE_VALUES: ReadonlySet<string> = new Set(
  Object.values(COACHING_COURSES),
);

export function normalizeAdmissionCourse(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw) return null;

  if (CANONICAL_COURSE_VALUES.has(raw)) return raw;

  const folded = raw.toLowerCase().replace(/\s+/g, " ").trim();
  const keys = Object.keys(COACHING_COURSES).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (folded === key) return COACHING_COURSES[key];
  }
  return null;
}

export function isCanonicalAdmissionCourse(value: unknown): boolean {
  return typeof value === "string" && CANONICAL_COURSE_VALUES.has(value);
}

// S6-F1 — derived counsellor follow-up due status. The pure classification
// logic lives in the dependency-free ./followUpStatus module (server AND
// client-safe); re-exported here so the server domain/service surfaces keep
// a stable import path.
export {
  FOLLOW_UP_DUE_SOON_WINDOW_MS,
  FOLLOW_UP_STATUS_LABELS,
  classifyFollowUpStatus,
  isValidFollowUpDate,
} from "./followUpStatus";
export type {
  FollowUpDueStatus,
  FollowUpStatusResult,
} from "./followUpStatus";