import { NextRequest, NextResponse } from "next/server";
import {
  assignCounsellor,
  releaseCounsellor,
} from "@/lib/staff/assignment.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/conversations/[id]/assign
 *
 * Assign or release a counsellor on a conversation.
 * Body: { staffId: string | null }
 *
 * staffId = string → assign that counsellor
 * staffId = null   → release ownership
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as { staffId?: string | null };

    if (body.staffId === undefined) {
      return NextResponse.json(
        { success: false, error: "staffId is required (string or null)." },
        { status: 400 },
      );
    }

    if (body.staffId === null) {
      const conversation = await releaseCounsellor(id);
      return NextResponse.json({ success: true, conversation });
    }

    if (typeof body.staffId !== "string" || !body.staffId.trim()) {
      return NextResponse.json(
        { success: false, error: "staffId must be a non-empty string or null." },
        { status: 400 },
      );
    }

    const conversation = await assignCounsellor(id, body.staffId.trim());

    return NextResponse.json({ success: true, conversation });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message.includes("not found")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 },
      );
    }

    if (message.includes("inactive")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 },
      );
    }

    console.error("[ADMIN CONVERSATIONS] ASSIGN error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to assign counsellor." },
      { status: 500 },
    );
  }
}
