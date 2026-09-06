import { NextRequest, NextResponse } from "next/server";
import { DemoBookingStatus } from "@prisma/client";
import { requireAdminAuth } from "@/lib/auth/admin-guard";
import {
  demoAttendanceErrorResponse,
  recordAttendanceAction,
} from "@/lib/demo/demo.attendance.service";

export const dynamic = "force-dynamic";

const ATTENDANCE_ACTIONS = ["MARK_ATTENDED", "MARK_NO_SHOW", "CANCEL"] as const;
type AttendanceAction = (typeof ATTENDANCE_ACTIONS)[number];

const ACTION_TO_STATUS: Record<AttendanceAction, DemoBookingStatus> = {
  MARK_ATTENDED: DemoBookingStatus.ATTENDED,
  MARK_NO_SHOW: DemoBookingStatus.NO_SHOW,
  CANCEL: DemoBookingStatus.CANCELLED,
};

/**
 * POST /api/admin/demo-bookings/[id]/actions
 *
 * The single guarded endpoint for counsellor-controlled demo attendance.
 * Body: { action, note? } where action ∈ MARK_ATTENDED | MARK_NO_SHOW | CANCEL.
 *
 * SECURITY MODEL (S6-D2-B, Tasks 3/4/6):
 *   • authn: requireAdminAuth (middleware + staff identity gate)
 *   • authz: per-record rule — a COURSELLOR may resolve a booking only
 *     when its Conversation is unassigned OR assigned to them; but the
 *     action is re-checked inside resolveManageableAttendanceTarget.
 *     ADMIN may manage any booking.
 *   • actor: DERIVED SERVER-SIDE from the authenticated staff identity
 *     (identity.id + identity.role). A browser-supplied actor value is
 *     never read — STUDENT / AI / SYSTEM can never be introduced.
 *   • idempotency/concurrency: recordAttendanceAction performs an atomic
 *     compare-and-swap (UPDATE ... WHERE status = previous) plus an
 *     immutable audit event; conflicting transitions → 409, same-outcome
 *     repeats → idempotent no-op. Never last-write-wins.
 *
 * Attendance NEVER confirms admission and NEVER verifies payment — it
 * only flips DemoBooking.status (and timestamps) and writes an audit
 * event. No AdmissionEnrollment is touched here.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const identity = await requireAdminAuth(req);

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Demo booking id is required." },
        { status: 400 },
      );
    }

    const body = (await req.json()) as { action?: string; note?: string };

    const action = body.action as AttendanceAction;
    if (!ATTENDANCE_ACTIONS.includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid attendance action." },
        { status: 400 },
      );
    }

    const toStatus = ACTION_TO_STATUS[action];

    // recordAttendanceAction enforces authorization (fail-closed) and is
    // the single authority over attendance — it never reads a
    // browser-supplied actor; only the server-derived identity.id/role.
    const result = await recordAttendanceAction({
      demoBookingId: id,
      toStatus,
      actor: { id: identity.id, role: identity.role },
      note: body.note?.trim() || null,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return demoAttendanceErrorResponse(error);
  }
}
