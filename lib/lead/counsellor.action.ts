// FILE: lib/lead/counsellor.action.ts
//
// ─────────────────────────────────────────────────────────────────
// PHASE S5-D — COUNSELLOR ACTION QUEUE FOUNDATION
//
// Turns the S5-C deterministic priority (NONE | NORMAL | HIGH |
// URGENT) into a small, explicit ACTION QUEUE state for ANU
// counsellors:
//
//     NONE               → no action
//     FOLLOW_UP          → routine follow-up
//     PRIORITY_FOLLOW_UP → needs a counsellor soon
//     ADMISSION_ASSISTANCE → admission / payment assistance
//
// It is a FOUNDATION, in the same spirit as S5-A/B/C:
//
//   • PURE / DB-free / AI-free — string in, verdict out.
//   • NO schema change, NO new table, NO new column.
//   • NO outbound message of any kind: nothing is sent to the student
//     or to a counsellor. An "event" is an audit-only MessageRole.SYSTEM
//     row (SYSTEM rows are filtered out of the AI context by
//     getRecentMessages) so a counsellor/admin can SEE the queue — it
//     never claims a counsellor was contacted or notified.
//   • IDEMPOTENT AUDIT: an event is emitted at most once per escalation
//     level, in the order NONE → FOLLOW_UP → PRIORITY_FOLLOW_UP →
//     ADMISSION_ASSISTANCE. Repeated same-level turns never duplicate
//     an event, and a downgrade never creates one.
//   • DEFENCE-IN-DEPTH OWNERSHIP: shouldTrackCounsellorAction mirrors
//     the webhook ownership gate (assigned / HANDED_OFF are excluded).
//     In the real pipeline those conversations never reach the adapter
//     at all — these flags are belt-and-suspenders only.
//
// Inverse direction — anything student-facing, any payment, any
// "counsellor has been notified" wording — is deliberately absent.
// ─────────────────────────────────────────────────────────────────

import type {
  CounselorPriority,
  CounsellorPriorityResult,
} from "./counsellor.priority";

// ═════════════════════════════════════════════════════════════════
// STATE MODEL
// ═════════════════════════════════════════════════════════════════

export type CounsellorActionState =
  | "NONE"
  | "FOLLOW_UP"
  | "PRIORITY_FOLLOW_UP"
  | "ADMISSION_ASSISTANCE";

export const COUNSELLOR_ACTION_STATES: readonly CounsellorActionState[] = [
  "NONE",
  "FOLLOW_UP",
  "PRIORITY_FOLLOW_UP",
  "ADMISSION_ASSISTANCE",
];

export function isCounsellorActionState(
  value: unknown,
): value is CounsellorActionState {
  return (
    typeof value === "string" &&
    (COUNSELLOR_ACTION_STATES as readonly string[]).includes(value)
  );
}

/**
 * actionStateRank
 * Escalation order for the transition rule: the audit only ever moves
 * forward once — a repeated state, or a downgrade, never emits.
 */
export function actionStateRank(state: CounsellorActionState): number {
  switch (state) {
    case "NONE":
      return 0;
    case "FOLLOW_UP":
      return 1;
    case "PRIORITY_FOLLOW_UP":
      return 2;
    case "ADMISSION_ASSISTANCE":
      return 3;
  }
}

/**
 * mapCounsellorPriorityToAction
 * The single, deterministic mapping from the S5-C priority table to the
 * action queue state (Objective 1). Nothing else derives an action — the
 * S5-C resolver stays the one source of truth (no duplicated classifier).
 */
export function mapCounsellorPriorityToAction(
  priority: CounselorPriority,
): CounsellorActionState {
  switch (priority) {
    case "NONE":
      return "NONE";
    case "NORMAL":
      return "FOLLOW_UP";
    case "HIGH":
      return "PRIORITY_FOLLOW_UP";
    case "URGENT":
      return "ADMISSION_ASSISTANCE";
  }
}

// ═════════════════════════════════════════════════════════════════
// OWNERSHIP / EXCLUSION GATE (defence-in-depth, mirror of the real
// webhook ownership gate — the adapter already skips these)
// ═════════════════════════════════════════════════════════════════

export type CounsellorActionGateInput = {
  /** The S5-C derived priority — the ONLY trigger. NONE can never fire. */
  priority: CounselorPriority;
  /** A counsellor already owns this thread — the human is in the loop. */
  assignedCounsellorId?: string | null;
  /** Existing handoff is authoritative — never re-escalate a HANDED_OFF. */
  status?: string | null;
};

export function shouldTrackCounsellorAction(
  input: CounsellorActionGateInput,
): boolean {
  if (input.priority === "NONE") return false;
  if (input.assignedCounsellorId != null) return false;
  if (input.status === "HANDED_OFF") return false;
  return true;
}

// ═════════════════════════════════════════════════════════════════
// EVENT AUDIT (MessageRole.SYSTEM payload)
//
// Content form (Objective 4):  COUNSELLOR_ACTION [<STATE>/<reason>/<course>]
// The reason is a deterministic, slash-free internal queue note. It is
// derived ONLY from the S5-C result, never claims a counsellor has been
// notified/contacted, and never claims payment or admission happened.
// ═════════════════════════════════════════════════════════════════

export const COUNSELLOR_ACTION_PREFIX = "COUNSELLOR_ACTION [";
export const COUNSELLOR_ACTION_NO_COURSE = "-";

export type CounsellorActionEvent = {
  state: CounsellorActionState;
  reason: string;
  course: string | null;
};

/**
 * buildActionReason
 * Deterministic internal queue note taken from the S5-C recommendation.
 * Slashes are the parse delimiter inside [..], so they are stripped.
 */
export function buildActionReason(result: CounsellorPriorityResult): string {
  return result.action.replace(/\//g, " ");
}

export function buildActionEventContent(input: {
  state: CounsellorActionState;
  reason: string;
  course?: string | null;
}): string {
  const state = input.state;
  const course = input.course || COUNSELLOR_ACTION_NO_COURSE;
  // The reason sits inside a slash-delimited block — keep it slash-free.
  const reason = input.reason.replace(/\//g, " ");
  return `${COUNSELLOR_ACTION_PREFIX}${state}/${reason}/${course}]`;
}

/**
 * parseActionEventContent
 * Reads the state/course back from a stored audit row (used by the admin
 * conversations list). Returns null for any content that is not a
 * COUNSELLOR_ACTION event — the admin surface then shows no action.
 */
export function parseActionEventContent(
  content: unknown,
): CounsellorActionEvent | null {
  if (typeof content !== "string") return null;
  if (!content.startsWith(COUNSELLOR_ACTION_PREFIX)) return null;

  const end = content.indexOf("]", COUNSELLOR_ACTION_PREFIX.length);
  if (end === -1) return null;

  const inner = content.slice(
    COUNSELLOR_ACTION_PREFIX.length,
    end,
  );
  const [stateRaw, reason = "", ...courseParts] = inner.split("/");

  if (!isCounsellorActionState(stateRaw)) return null;

  const coursePart = courseParts.join("/");
  return {
    state: stateRaw,
    reason,
    course:
      coursePart && coursePart !== COUNSELLOR_ACTION_NO_COURSE
        ? coursePart
        : null,
  };
}

// ═════════════════════════════════════════════════════════════════
// IDEMPOTENT TRANSITION RULE (Objective 5)
//
// emit exactly one event per escalation:
//     (no event yet)  → any non-NONE state         → emit
//     FOLLOW_UP        → PRIORITY_FOLLOW_UP / ADMISSION_ASSISTANCE → emit
//     PRIORITY_FOLLOW_UP → ADMISSION_ASSISTANCE    → emit
//     same state / downgrade                       → no emit
// ═════════════════════════════════════════════════════════════════

export function shouldEmitActionEvent(
  previous: CounsellorActionState | null | undefined,
  next: CounsellorActionState,
): boolean {
  if (next === "NONE") return false;
  const nextRank = actionStateRank(next);
  if (previous == null) return true;
  return actionStateRank(previous) < nextRank;
}

// ═════════════════════════════════════════════════════════════════
// PHASE S5-E — QUEUE ORDERING + FILTERING (pure)
//
// Display order for the counsellor queue (Objective 2):
//     ADMISSION_ASSISTANCE → PRIORITY_FOLLOW_UP → FOLLOW_UP → NONE
// with the most recently active conversation first within the same
// action state. A conversation with no derived action (null) behaves
// like NONE — it sorts last. These helpers define the contract the
// admin list implements; they are DB-free so the ordering and filter
// rules are unit-tested directly.
// ═════════════════════════════════════════════════════════════════

/** Display order for the counsellor queue — most urgent first. */
export const ACTION_QUEUE_ORDER: readonly CounsellorActionState[] = [
  "ADMISSION_ASSISTANCE",
  "PRIORITY_FOLLOW_UP",
  "FOLLOW_UP",
  "NONE",
];

export function actionQueuePosition(state: CounsellorActionState): number {
  return ACTION_QUEUE_ORDER.indexOf(state);
}

export type ActionQueueItemLike = {
  updatedAt: Date | string;
  derivedAction: { state: CounsellorActionState } | null;
};

/**
 * compareActionQueueItems
 * Total order used by the admin list:
 *   1. higher action state first (ADMISSION_ASSISTANCE > PRIORITY_FOLLOW_UP
 *      > FOLLOW_UP > NONE/null),
 *   2. within the same state, most recently updated conversation first.
 * Returns a negative/zero/positive sort comparator.
 */
export function compareActionQueueItems(
  a: ActionQueueItemLike,
  b: ActionQueueItemLike,
): number {
  const rankA = a.derivedAction ? actionQueuePosition(a.derivedAction.state) : 3;
  const rankB = b.derivedAction ? actionQueuePosition(b.derivedAction.state) : 3;
  if (rankA !== rankB) return rankA - rankB;

  const timeA = new Date(a.updatedAt).getTime();
  const timeB = new Date(b.updatedAt).getTime();
  return timeB - timeA;
}

/**
 * matchesActionFilter
 * Filter predicate for the admin queue (Objective 3):
 *   "ALL" / undefined / null → everything
 *   "ADMISSION_ASSISTANCE" | "PRIORITY_FOLLOW_UP" | "FOLLOW_UP" → that state
 *   "NONE" → conversations with NO actionable queue item
 * A derived action never carries state NONE (NONE events are never written),
 * so "NONE" simply means derivedAction === null.
 */
export function matchesActionFilter(
  filter: string | null | undefined,
  derivedAction: { state: CounsellorActionState } | null,
): boolean {
  if (!filter || filter === "ALL") return true;
  if (filter === "NONE") {
    return derivedAction == null || derivedAction.state === "NONE";
  }
  if (derivedAction == null) return false;
  return derivedAction.state === filter;
}