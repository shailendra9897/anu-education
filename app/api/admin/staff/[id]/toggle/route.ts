import { NextRequest, NextResponse } from "next/server";
import { toggleStaffActive } from "@/lib/staff/staff.service";
import {
  isAdminAuthError,
  adminAuthErrorResponse,
  requireAdminAuth,
} from "@/lib/auth/admin-guard";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/staff/[id]/toggle
 *
 * Toggle a staff member's active status.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminAuth(req, { role: "ADMIN" });

    const { id } = await context.params;
    const staff = await toggleStaffActive(id);

    return NextResponse.json({ success: true, staff });
  } catch (error: unknown) {
    if (isAdminAuthError(error)) {
      return adminAuthErrorResponse(error);
    }
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message.includes("not found")) {
      return NextResponse.json(
        { success: false, error: "Staff member not found." },
        { status: 404 },
      );
    }

    console.error("[ADMIN STAFF] TOGGLE error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to toggle staff status." },
      { status: 500 },
    );
  }
}
