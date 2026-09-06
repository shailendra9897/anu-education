import { NextRequest, NextResponse } from "next/server";
import { getConversationOwnership } from "@/lib/staff/assignment.service";
import {
  isAdminAuthError,
  adminAuthErrorResponse,
  requireAdminAuth,
} from "@/lib/auth/admin-guard";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/conversations/[id]/ownership
 *
 * Returns the deterministic ownership state of a conversation.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminAuth(req);

    const { id } = await context.params;
    const ownership = await getConversationOwnership(id);

    return NextResponse.json({ success: true, ownership });
  } catch (error: unknown) {
    if (isAdminAuthError(error)) {
      return adminAuthErrorResponse(error);
    }
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message.includes("not found")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 },
      );
    }

    console.error("[ADMIN CONVERSATIONS] OWNERSHIP error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to determine ownership." },
      { status: 500 },
    );
  }
}
