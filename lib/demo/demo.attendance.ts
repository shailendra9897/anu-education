// FILE: lib/demo/demo.attendance.ts
//
// PHASE S6-D2-B — COUNSELLOR-CONTROLLED FREE DEMO ATTENDANCE (PURE DOMAIN)
//
// The deterministic, DB-free, AI-free layer that governs which demo
// attendance outcomes a booking may reach and which actor may issue them.
//
// Core guarantees exercised here:
//   • Attendance truth belongs to DemoBooking — NEVER to a conversation,
//     an AdmissionEnrollment, or a PortalAccessRequest.
//   • AI and student text can NEVER mutate attendance. The only actors
//     that may are authenticated counsellors/admins (decided server-side).
//   • METADATA LIFECYCLE (fail-closed): a booking may move forward only
//     from PENDING or CONFIRMED. ATTENDED / NO_SHOW / CANCELLED are
//     outcome states and can never leapfrog each other without an
//     explicit, separately-audited correction mechanism (none exists yet).
//   • Idempotent repeats of the SAME outcome on an already-achieved
//     booking are legal no-ops; CONFLICTING second transitions are
//     rejected.
//   • Course/booking isolation is inherited: attendance mutates only the
//     targeted DemoBooking row (one booking is one row), so a German demo
//     can never touch an IELTS booking, and PTE remains distinct from
//     PTE Academic exactly as the canonical course behavior dictates.
// ─────────────────────────────────────────────────────────────────────

import { DemoBookingStatus } from "@prisma/client";

export type DemoAttendanceStatus = DemoBookingStatus;

export const PENDING = DemoBookingStatus.PENDING;
export const CONFIRMED = DemoBookingStatus.CONFIRMED;
export const ATTENDED = DemoBookingStatus.ATTENDED;
export const NO_SHOW = DemoBookingStatus.NO_SHOW;
export const CANCELLED = DemoBookingStatus.CANCELLED;

/** Outcomes that require an authorized human and carry a timestamp. */
export const ATTENDANCE_OUTCOME_STATUSES: ReadonlySet<DemoBookingStatus> =
  new Set([ATTENDED, NO_SHOW, CANCELLED]);

export enum DemoAttendanceErrorCode {
  NOT_FOUND = "NOT_FOUND",
  INVALID_TRANSITION = "INVALID_TRANSITION",
  TERMINAL_STATE = "TERMINAL_STATE",
  FORBIDDEN_ACTOR = "FORBIDDEN_ACTOR",
  ALREADY_IN_STATE = "ALREADY_IN_STATE",
  CONCURRENT_MODIFICATION = "CONCURRENT_MODIFICATION",
  INVALID_ACTION = "INVALID_ACTION",
}

export class DemoAttendanceError extends Error {
  readonly code: DemoAttendanceErrorCode;

  constructor(code: DemoAttendanceErrorCode, message: string) {
    super(message);
    this.name = "DemoAttendanceError";
    this.code = code;
  }
}

/**
 * ALLOWED_ATTENDANCE_TRANSITIONS — the fail-closed attendance graph.
 *
 *   PENDING | CONFIRMED → ATTENDED | NO_SHOW | CANCELLED
 *
 * Outcome states (ATTENDED / NO_SHOW / CANCELLED) are terminal for
 * attendance: they cannot move to one another and cannot be re-opened
 * to PENDING/CONFIRMED. A repeat transition to the SAME current status
 * is handled as an idempotent no-op by the caller, NOT listed here as a
 * move — so a re-issued MARK_ATTENDED on an already-ATTENDED booking does
 * not create a duplicate logical effect.
 */
export const ALLOWED_ATTENDANCE_TRANSITIONS: Readonly<
  Record<DemoBookingStatus, ReadonlySet<DemoBookingStatus>>
> = {
  [PENDING]: new Set([ATTENDED, NO_SHOW, CANCELLED]),
  [CONFIRMED]: new Set([ATTENDED, NO_SHOW, CANCELLED]),
  [ATTENDED]: new Set(),
  [NO_SHOW]: new Set(),
  [CANCELLED]: new Set(),
};

export function assertAttendanceTransition(
  from: DemoBookingStatus,
  to: DemoBookingStatus,
): void {
  const allowed = ALLOWED_ATTENDANCE_TRANSITIONS[from];
  if (!allowed || !allowed.has(to)) {
    throw new DemoAttendanceError(
      DemoAttendanceErrorCode.INVALID_TRANSITION,
      `Attendance transition from "${from}" to "${to}" is not permitted.`,
    );
  }
}

export function isAttendanceOutcomeStatus(
  value: unknown,
): value is DemoBookingStatus {
  return (
    typeof value === "string" &&
    ATTENDANCE_OUTCOME_STATUSES.has(value as DemoBookingStatus)
  );
}

export const DEMO_ATTENDANCE_STATUSES: readonly DemoBookingStatus[] = [
  DemoBookingStatus.PENDING,
  DemoBookingStatus.CONFIRMED,
  DemoBookingStatus.ATTENDED,
  DemoBookingStatus.NO_SHOW,
  DemoBookingStatus.CANCELLED,
];

/**
 * buildAttendanceEventKey — deterministic idempotency key for a logical
 * attendance decision. Identical to the AdmissionEvent scheme: two issues
 * of the same (booking, from, to, actor, discriminator) collapse to ONE
 * audit row under the @@unique([demoBookingId, eventKey]) constraint.
 */
export function buildAttendanceEventKey(
  demoBookingId: string,
  from: DemoBookingStatus,
  to: DemoBookingStatus,
  discriminator?: string,
): string {
  return `attend:${demoBookingId}:${from}:${to}${discriminator ? `:${discriminator}` : ""}`;
}

// ── AUTHORIZATION (pure) ───────────────────────────────────────────

export type DemoBookingOwnershipLike = {
  status: DemoBookingStatus;
};

export type ConversationOwnershipLike = {
  assignedCounsellorId: string | null;
};

export type AttendanceIdentity = {
  id: string;
  role: string;
};

export type AttendancePermission =
  | { allowed: true }
  | {
      allowed: false;
      reason: "ASSIGNED_TO_OTHER" | "NOT_OWNER";
    };

/**
 * canManageDemoBooking — who may mutate a booking's attendance.
 *
 *  · ADMIN may manage any demo booking.
 *  · A COUNSELLOR (or OPERATOR, treated as counsellor-level) may manage a
 *    booking only while its Conversation is UNASSIGNED (unclaimed — allows
 *    self-claim to record attendance) OR assigned to that counsellor. A
 *    booking whose conversation is assigned to ANOTHER counsellor is
 *    always rejected — matching the S6-B2 admission convention.
 */
export function canManageDemoBooking(
  identity: Pick<AttendanceIdentity, "id" | "role">,
  conversation: ConversationOwnershipLike | null,
): AttendancePermission {
  if (!conversation) {
    // A booking with no resolvable conversation must fail closed.
    return { allowed: false, reason: "ASSIGNED_TO_OTHER" };
  }
  if (identity.role === "ADMIN") return { allowed: true };
  if (
    conversation.assignedCounsellorId !== null &&
    conversation.assignedCounsellorId !== identity.id
  ) {
    return { allowed: false, reason: "ASSIGNED_TO_OTHER" };
  }
  return { allowed: true };
}
