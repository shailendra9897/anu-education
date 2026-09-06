// FILE: lib/demo/demo.attendance.service.ts
//
// PHASE S6-D2-B — COUNSELLOR-CONTROLLED FREE DEMO ATTENDANCE (SERVICE)
//
// The thin DB-backed layer over the pure domain (lib/demo/demo.attendance.ts).
// It is the ONLY place DemoBooking attendance status is mutated: read a
// booking, authorize the actor via the conversation, then apply ONE atomic
// compare-and-swap transition and record ONE immutable audit event in the
// same transaction. No other module (AI adapter, chat route, student-facing
// flow) writes attendance.
//
// CONCURRENCY / IDEMPOTENCY — identical to the admission service:
//   • the row write is an atomic compare-and-swap (UPDATE ... WHERE status =
//     previousStatus), so two concurrent writers of the SAME transition can
//     never both apply it;
//   • the audit event insert rides the same transaction and is additionally
//     protected by @@unique([demoBookingId, eventKey]): a re-issued or
//     parallel repeat of the SAME logical action collapses to ONE event;
//   • a CONFLICTING second transition (e.g. ATTENDED → NO_SHOW) is rejected
//     with CONCURRENT_MODIFICATION / INVALID_TRANSITION — never silent
//     last-write-wins.
// ─────────────────────────────────────────────────────────────────────

import { Prisma, DemoBookingStatus, DemoBookingEventAction } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  assertAttendanceTransition,
  buildAttendanceEventKey,
  canManageDemoBooking,
  DemoAttendanceError,
  DemoAttendanceErrorCode,
  ALLOWED_ATTENDANCE_TRANSITIONS,
  type AttendanceIdentity,
  type ConversationOwnershipLike,
} from "./demo.attendance";

function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  );
}

// ── RESOLUTION ─────────────────────────────────────────────────────

export type AttendanceActionTarget = {
  id: string;
  status: DemoBookingStatus;
  conversation: ConversationOwnershipLike | null;
};

/** Resolve a booking + its conversation ownership in one step. */
export async function getAttendanceTarget(
  demoBookingId: string,
): Promise<AttendanceActionTarget | null> {
  const booking = await prisma.demoBooking.findUnique({
    where: { id: demoBookingId },
    select: {
      id: true,
      status: true,
      conversation: {
        select: { assignedCounsellorId: true },
      },
    },
  });
  if (!booking) return null;
  return {
    id: booking.id,
    status: booking.status,
    conversation: booking.conversation,
  };
}

// ── ACTION ─────────────────────────────────────────────────────────

export type RecordAttendanceActionInput = {
  demoBookingId: string;
  // The target outcome (ATTENDED / NO_SHOW / CANCELLED).
  toStatus: DemoBookingStatus;
  // SERVER-DERIVED actor (id + role) — never browser-supplied.
  actor: { id: string; role: string };
  note?: string | null;
  /** Optional explicit discriminator for a genuinely-later reissue. */
  discriminator?: string | null;
};

export type RecordAttendanceActionResult = {
  booking: import("@prisma/client").DemoBooking;
  event: import("@prisma/client").DemoBookingEvent | null;
  applied: boolean;
};

const ACTION_FOR_STATUS: Readonly<Record<DemoBookingStatus, DemoBookingEventAction>> = {
  [DemoBookingStatus.PENDING]: DemoBookingEventAction.MARKED_ATTENDED, // unused guard
  [DemoBookingStatus.CONFIRMED]: DemoBookingEventAction.MARKED_ATTENDED,
  [DemoBookingStatus.ATTENDED]: DemoBookingEventAction.MARKED_ATTENDED,
  [DemoBookingStatus.NO_SHOW]: DemoBookingEventAction.MARKED_NO_SHOW,
  [DemoBookingStatus.CANCELLED]: DemoBookingEventAction.CANCELLED,
};

/**
 * recordAttendanceAction — apply ONE attendance outcome.
 *
 *   MARK_ATTENDED → ATTENDED  (+ attendedAt)
 *   MARK_NO_SHOW   → NO_SHOW  (+ noShowAt)
 *   CANCEL         → CANCELLED(+ cancelledAt)
 *
 * The same transition always also sets attendanceVerifiedByStaffId and
 * attendanceNote, and always emits an immutable DemoBookingEvent.
 *
 * AUTHORIZATION is enforced HERE (fail-closed), not only in the route:
 * the caller's server-derived actor is checked against the booking's
 * conversation ownership via canManageDemoBooking. A browser can never
 * name its own actor — this service is immune to actor spoofing.
 */
export async function recordAttendanceAction(
  input: RecordAttendanceActionInput,
): Promise<RecordAttendanceActionResult> {
  const { demoBookingId, toStatus, actor } = input;

  if (!ALLOWED_ATTENDANCE_TRANSITIONS[toStatus]) {
    throw new DemoAttendanceError(
      DemoAttendanceErrorCode.INVALID_ACTION,
      `"${toStatus}" is not an attendance outcome.`,
    );
  }

  const current = await prisma.demoBooking.findUnique({
    where: { id: demoBookingId },
    include: {
      conversation: { select: { assignedCounsellorId: true } },
    },
  });
  if (!current) {
    throw new DemoAttendanceError(
      DemoAttendanceErrorCode.NOT_FOUND,
      `Demo booking ${demoBookingId} not found`,
    );
  }

  // Fail-closed authorization — the single authoritative gate.
  const permission = canManageDemoBooking(actor, current.conversation ?? null);
  if (!permission.allowed) {
    throw new DemoAttendanceError(
      DemoAttendanceErrorCode.FORBIDDEN_ACTOR,
      permission.reason === "ASSIGNED_TO_OTHER"
        ? "This demo booking belongs to a conversation assigned to another counsellor."
        : "You are not authorized to manage this demo booking.",
    );
  }

  // Idempotent repeat of the SAME outcome: already achieved — no-op.
  if (current.status === toStatus) {
    return { booking: current, event: null, applied: false };
  }

  assertAttendanceTransition(current.status, toStatus);

  const eventKey = buildAttendanceEventKey(
    demoBookingId,
    current.status,
    toStatus,
    input.discriminator ?? undefined,
  );
  const action = ACTION_FOR_STATUS[toStatus];

  const now = new Date();
  const outcomePatch =
    toStatus === DemoBookingStatus.ATTENDED
      ? { attendedAt: current.attendedAt ?? now }
      : toStatus === DemoBookingStatus.NO_SHOW
        ? { noShowAt: current.noShowAt ?? now }
        : { cancelledAt: current.cancelledAt ?? now };

  try {
    const event = await prisma.$transaction(async (tx) => {
      const updated = await tx.demoBooking.updateMany({
        where: { id: demoBookingId, status: current.status },
        data: {
          status: toStatus,
          ...outcomePatch,
          attendanceVerifiedByStaffId: actor.id,
          attendanceNote: input.note?.trim() || null,
        },
      });
      if (updated.count === 0) {
        // A concurrent writer already moved this booking.
        return null;
      }
      return tx.demoBookingEvent.create({
        data: {
          demoBookingId,
          action,
          previousStatus: current.status,
          nextStatus: toStatus,
          staffId: actor.id,
          note: input.note?.trim() || null,
          eventKey,
        },
      });
    });

    const booking = await prisma.demoBooking.findUnique({
      where: { id: demoBookingId },
    });
    if (!booking) {
      throw new DemoAttendanceError(
        DemoAttendanceErrorCode.NOT_FOUND,
        `Demo booking ${demoBookingId} vanished`,
      );
    }

    if (event) return { booking, event, applied: true };

    // Lost a race but the target outcome was reached by the winner.
    if (booking.status === toStatus) {
      return { booking, event: null, applied: false };
    }
    throw new DemoAttendanceError(
      DemoAttendanceErrorCode.CONCURRENT_MODIFICATION,
      `Concurrent attendance modification on demo booking ${demoBookingId}`,
    );
  } catch (err) {
    if (isUniqueViolation(err)) {
      // Idempotency-key backstop: this logical attendance event already
      // exists (sequential repeat or a parallel winner). Nothing changed.
      const existing = await prisma.demoBookingEvent.findUnique({
        where: {
          demoBookingId_eventKey: { demoBookingId, eventKey },
        },
      });
      const booking = await prisma.demoBooking.findUnique({
        where: { id: demoBookingId },
      });
      return { booking: booking!, event: existing, applied: false };
    }
    throw err;
  }
}

// ── AUTHORIZATION (server-side) ────────────────────────────────────

/**
 * assertCanManageAttendance — resolve the target and enforce the
 * per-record rule. Returns the resolved target so callers reuse it.
 */
export async function resolveManageableAttendanceTarget(
  demoBookingId: string,
  identity: Pick<AttendanceIdentity, "id" | "role">,
): Promise<AttendanceActionTarget> {
  const target = await getAttendanceTarget(demoBookingId);
  if (!target) {
    throw new DemoAttendanceError(
      DemoAttendanceErrorCode.NOT_FOUND,
      `Demo booking ${demoBookingId} not found`,
    );
  }
  const permission = canManageDemoBooking(identity, target.conversation);
  if (!permission.allowed) {
    throw new DemoAttendanceError(
      DemoAttendanceErrorCode.FORBIDDEN_ACTOR,
      permission.reason === "ASSIGNED_TO_OTHER"
        ? "This demo booking belongs to a conversation assigned to another counsellor."
        : "You are not authorized to manage this demo booking.",
    );
  }
  return target;
}

// ── LIST / DETAIL (view queries for the counsellor attendance surface) ──

export type DemoBookingAttendanceRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  course: string | null;
  preferredBatch: string | null;
  preferredDate: Date | null;
  status: DemoBookingStatus;
  attendedAt: Date | null;
  noShowAt: Date | null;
  cancelledAt: Date | null;
  attendanceNote: string | null;
  created: Date;
  assignedCounsellor: { id: string; name: string } | null;
  attendanceVerifiedByStaff: { id: string; name: string } | null;
};

export type ListAttendanceOptions = {
  status?: DemoBookingStatus | "ALL";
  assignee?: "me" | "unassigned" | string;
  limit?: number;
  offset?: number;
};

export async function listBookingsForAttendance(
  identity: Pick<AttendanceIdentity, "id" | "role">,
  options: ListAttendanceOptions = {},
): Promise<{
  bookings: DemoBookingAttendanceRow[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}> {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  const isAdmin = identity.role === "ADMIN";

  // Admin sees every booking; a counsellor sees only bookings on
  // conversations that are unassigned or assigned to them.
  const where: Prisma.DemoBookingWhereInput = options.status && options.status !== "ALL"
    ? { status: options.status }
    : {};

  if (!isAdmin) {
    where.conversation = {
      OR: [
        { assignedCounsellorId: null },
        { assignedCounsellorId: identity.id },
      ],
    };
    // NOTE: listing intentionally omits bookings whose conversation is
    // assigned to another counsellor — they are invisible here and fully
    // blocked at the action layer via resolveManageableAttendanceTarget.
  } else {
    if (options.assignee === "me") {
      where.conversation = { assignedCounsellorId: identity.id };
    } else if (options.assignee === "unassigned") {
      where.conversation = { assignedCounsellorId: null };
    } else if (options.assignee) {
      where.conversation = { assignedCounsellorId: options.assignee };
    }
  }

  const [count, bookings] = await Promise.all([
    prisma.demoBooking.count({ where }),
    prisma.demoBooking.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        conversation: {
          select: {
            assignedCounsellor: { select: { id: true, name: true } },
          },
        },
        attendanceVerifiedByStaff: { select: { id: true, name: true } },
      },
      skip: offset,
      take: limit,
    }),
  ]);

  const rows: DemoBookingAttendanceRow[] = bookings.map((b) => ({
    id: b.id,
    name: b.name,
    phone: b.phone,
    email: b.email,
    course: b.course,
    preferredBatch: b.preferredBatch,
    preferredDate: b.preferredDate,
    status: b.status,
    attendedAt: b.attendedAt,
    noShowAt: b.noShowAt,
    cancelledAt: b.cancelledAt,
    attendanceNote: b.attendanceNote,
    created: b.createdAt,
    assignedCounsellor: b.conversation?.assignedCounsellor
      ? { id: b.conversation.assignedCounsellor.id, name: b.conversation.assignedCounsellor.name }
      : null,
    attendanceVerifiedByStaff: b.attendanceVerifiedByStaff,
  }));

  return {
    bookings: rows,
    total: count,
    limit,
    offset,
    hasMore: offset + limit < count,
  };
}

export type DemoBookingAttendanceDetail = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  course: string | null;
  preferredBatch: string | null;
  preferredDate: Date | null;
  status: DemoBookingStatus;
  attendedAt: Date | null;
  noShowAt: Date | null;
  cancelledAt: Date | null;
  attendanceNote: string | null;
  assignedCounsellor: { id: string; name: string } | null;
  attendanceVerifiedByStaff: { id: string; name: string } | null;
  conversationId: string;
  events: {
    id: string;
    action: DemoBookingEventAction;
    previousStatus: DemoBookingStatus | null;
    nextStatus: DemoBookingStatus;
    staff: { name: string } | null;
    note: string | null;
    createdAt: Date;
  }[];
};

export async function getBookingAttendanceDetail(
  demoBookingId: string,
): Promise<DemoBookingAttendanceDetail | null> {
  const booking = await prisma.demoBooking.findUnique({
    where: { id: demoBookingId },
    include: {
      conversation: {
        select: {
          assignedCounsellor: { select: { id: true, name: true } },
        },
      },
      attendanceVerifiedByStaff: { select: { id: true, name: true } },
      events: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          action: true,
          previousStatus: true,
          nextStatus: true,
          staff: { select: { name: true } },
          note: true,
          createdAt: true,
        },
      },
    },
  });
  if (!booking) return null;
  return {
    id: booking.id,
    name: booking.name,
    phone: booking.phone,
    email: booking.email,
    course: booking.course,
    preferredBatch: booking.preferredBatch,
    preferredDate: booking.preferredDate,
    status: booking.status,
    attendedAt: booking.attendedAt,
    noShowAt: booking.noShowAt,
    cancelledAt: booking.cancelledAt,
    attendanceNote: booking.attendanceNote,
    assignedCounsellor: booking.conversation?.assignedCounsellor
      ? { id: booking.conversation.assignedCounsellor.id, name: booking.conversation.assignedCounsellor.name }
      : null,
    attendanceVerifiedByStaff: booking.attendanceVerifiedByStaff,
    conversationId: booking.conversationId,
    events: booking.events,
  };
}

// ── SAFE HTTP ERROR MAPPING ─────────────────────────────────────────

import { NextResponse } from "next/server";
import {
  isAdminAuthError,
  adminAuthErrorResponse,
} from "@/lib/auth/admin-guard";

export function demoAttendanceErrorResponse(error: unknown): NextResponse {
  if (isAdminAuthError(error)) {
    return adminAuthErrorResponse(error);
  }
  if (error instanceof DemoAttendanceError) {
    let status: number;
    switch (error.code) {
      case DemoAttendanceErrorCode.NOT_FOUND:
        status = 404;
        break;
      case DemoAttendanceErrorCode.FORBIDDEN_ACTOR:
        status = 403;
        break;
      case DemoAttendanceErrorCode.CONCURRENT_MODIFICATION:
        status = 409;
        break;
      default:
        status = 400;
    }
    return NextResponse.json(
      { success: false, errorCode: error.code, error: error.message },
      { status },
    );
  }
  console.error("[DEMO ATTENDANCE] error:", error);
  return NextResponse.json(
    { success: false, error: "Unable to process the request." },
    { status: 500 },
  );
}
