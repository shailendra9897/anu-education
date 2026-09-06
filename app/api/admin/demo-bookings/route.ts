import { NextRequest, NextResponse } from "next/server";
import { DemoBookingStatus } from "@prisma/client";
import { requireAdminAuth } from "@/lib/auth/admin-guard";
import {
  demoAttendanceErrorResponse,
  listBookingsForAttendance,
} from "@/lib/demo/demo.attendance.service";
import { DEMO_ATTENDANCE_STATUSES } from "@/lib/demo/demo.attendance";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/demo-bookings
 *
 * Lists DemoBookings for the counsellor/admin attendance surface,
 * scoped to what the authenticated staff may see: ADMIN sees all (plus
 * assignee filters); a COURSELLOR sees only bookings on conversations
 * that are unassigned or assigned to them. This is a read-only view —
 * attendance writes happen via POST /[id]/actions.
 */
export async function GET(req: NextRequest) {
  try {
    const identity = await requireAdminAuth(req);

    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? "ALL";
    const assignee = url.searchParams.get("assignee") ?? undefined;
    const limitRaw = Number(url.searchParams.get("limit") ?? "50");
    const offsetRaw = Number(url.searchParams.get("offset") ?? "0");
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 200) : 50;
    const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? Math.floor(offsetRaw) : 0;

    if (status !== "ALL" && !DEMO_ATTENDANCE_STATUSES.includes(status as DemoBookingStatus)) {
      return NextResponse.json(
        { success: false, error: "Invalid status filter." },
        { status: 400 },
      );
    }

    const result = await listBookingsForAttendance(identity, {
      status: status as DemoBookingStatus | "ALL",
      assignee,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, ...result, statuses: DEMO_ATTENDANCE_STATUSES });
  } catch (error) {
    return demoAttendanceErrorResponse(error);
  }
}
