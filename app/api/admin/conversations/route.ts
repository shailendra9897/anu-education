import { NextRequest, NextResponse } from "next/server";
import { listConversations } from "@/lib/staff/assignment.service";
import {
  isAdminAuthError,
  adminAuthErrorResponse,
  requireAdminAuth,
} from "@/lib/auth/admin-guard";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/conversations
 *
 * List conversations with ownership info.
 * Optional: ?status=ACTIVE&assigned=true&limit=50&offset=0
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req);

    const status = req.nextUrl.searchParams.get("status") || undefined;
    const assignedParam = req.nextUrl.searchParams.get("assigned");
    const actionParam = req.nextUrl.searchParams.get("action");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0", 10);

    const assigned =
      assignedParam === "true"
        ? true
        : assignedParam === "false"
          ? false
          : null;

    const result = await listConversations({
      status,
      assigned,
      action: actionParam,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return adminAuthErrorResponse(error);
    }
    console.error("[ADMIN CONVERSATIONS] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load conversations." },
      { status: 500 },
    );
  }
}
