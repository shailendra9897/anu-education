// FILE: lib/admission/followUpStatus.ts
//
// S6-F1 — DERIVED COUNSELLOR FOLLOW-UP DUE STATUS (PURE, DB-FREE).
//
// Deliberately dependency-free (NO @prisma/client, NO node APIs) so that
// BOTH server module-surfaces (the domain service, the workspace/admissions
// server queries) AND client component-surfaces (the S6-E workspace) can
// import the exact same deterministic classification without dragging
// Prisma into a client bundle.
//
// A single, deterministic classifier for the due-ness of ONE scheduled
// follow-up date (`nextFollowUpAt`) against a wall-clock `now`. It is NOT
// a second priority/queue engine — it only classifies; nothing here
// schedules, notifies, or writes. Duplicating this tiny pure logic in a
// client component is unnecessary and exactly what this module prevents.
//
// TIMEZONE SAFETY: all comparisons use absolute epoch milliseconds
// (Date.getTime()), never calendar/local boundaries — so "overdue vs
// due soon vs upcoming" is timezone-independent on every deployment.
// ═════════════════════════════════════════════════════════════════

/** How far in the future a follow-up is considered "due soon". */
export const FOLLOW_UP_DUE_SOON_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

export type FollowUpDueStatus =
  | "NONE" // no scheduled follow-up
  | "OVERDUE" // due date has passed (inclusive of exactly-now)
  | "DUE_SOON" // within the due-soon window (not yet overdue)
  | "UPCOMING"; // scheduled later than the due-soon window

export type FollowUpStatusResult = {
  status: FollowUpDueStatus;
  /** Human label for the CRM surfaces. */
  label: string;
  isScheduled: boolean;
  isOverdue: boolean;
  isDueSoon: boolean;
  /** Milliseconds until due; negative when overdue; when not scheduled
   *  the amount 0 is returned and `isScheduled` is false. */
  msUntilDue: number;
};

export const FOLLOW_UP_STATUS_LABELS: Readonly<Record<FollowUpDueStatus, string>> = {
  NONE: "No follow-up",
  OVERDUE: "Overdue",
  DUE_SOON: "Due soon",
  UPCOMING: "Upcoming",
};

/**
 * classifyFollowUpStatus — derived due state for ONE scheduled date.
 *
 *   nextFollowUpAt == null          → NONE
 *   nextFollowUpAt <= now           → OVERDUE   (inclusive: exactly-now is overdue)
 *   nextFollowUpAt <= now + window  → DUE_SOON
 *   otherwise                       → UPCOMING
 */
export function classifyFollowUpStatus(
  nextFollowUpAt: Date | string | null | undefined,
  now: Date | string | number = Date.now(),
): FollowUpStatusResult {
  if (nextFollowUpAt == null) {
    return {
      status: "NONE",
      label: FOLLOW_UP_STATUS_LABELS.NONE,
      isScheduled: false,
      isOverdue: false,
      isDueSoon: false,
      msUntilDue: 0,
    };
  }

  const due = new Date(nextFollowUpAt).getTime();
  const nowMs = new Date(now).getTime();
  const msUntilDue = due - nowMs;

  let status: FollowUpDueStatus;
  if (msUntilDue <= 0) {
    status = "OVERDUE";
  } else if (msUntilDue <= FOLLOW_UP_DUE_SOON_WINDOW_MS) {
    status = "DUE_SOON";
  } else {
    status = "UPCOMING";
  }

  return {
    status,
    label: FOLLOW_UP_STATUS_LABELS[status],
    isScheduled: true,
    isOverdue: status === "OVERDUE",
    isDueSoon: status === "DUE_SOON",
    msUntilDue,
  };
}

/**
 * isValidFollowUpDate — a candidate follow-up date MUST be in the future
 * (strictly after `now`) for a new/rescheduled follow-up. Past dates
 * (and exactly-now) are rejected. Pure, DB-free.
 */
export function isValidFollowUpDate(
  value: unknown,
  now: Date | string | number = Date.now(),
): value is Date {
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "string" || typeof value === "number") {
    date = new Date(value);
  } else {
    return false;
  }
  if (Number.isNaN(date.getTime())) return false;
  const nowMs = new Date(now).getTime();
  return date.getTime() > nowMs;
}
