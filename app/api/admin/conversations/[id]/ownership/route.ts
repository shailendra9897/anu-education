import { NextRequest, NextResponse } from "next/server";
import { getConversationOwnership } from "@/lib/staff/assignment.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/conversations/[id]/ownership
 *
 * Returns the deterministic ownership state of a conversation.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const ownership = await getConversationOwnership(id);

    return NextResponse.json({ success: true, ownership });
  } catch (error: unknown) {
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
