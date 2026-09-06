import { NextRequest, NextResponse } from "next/server";
import {
  isAdminAuthError,
  adminAuthErrorResponse,
  requireAdminAuth,
} from "@/lib/auth/admin-guard";
import { getStudentWorkspace } from "@/lib/lead/student.workspace.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/conversations/[id]
 *
 * The single read endpoint for the unified counsellor student workspace:
 * one student/conversion journey assembled from the existing canonical
 * records (Lead, conversations, transcript, demo bookings + attendance,
 * admissions, latest counsellor action, lead context, portal requests).
 *
 * SECURITY:
 *   • authn: requireAdminAuth (middleware + staff identity gate).
 *   • authz: any authenticated ACTIVE staff may read a conversation detail
 *     (consistent with the existing conversation list + admission detail
 *     read behaviour). All WRITE actions remain gated per-record on the
 *     admission actions endpoint.
 *   • 401 unauthn, 403 inactive/missing staff, 404 unknown conversation.
 *
 * Opening this view NEVER mutates any record — it is a pure read.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminAuth(req);

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Conversation id is required." },
        { status: 400 },
      );
    }

    const workspace = await getStudentWorkspace(id);

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: "Conversation not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, workspace });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return adminAuthErrorResponse(error);
    }
    console.error("[ADMIN STUDENT WORKSPACE] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load the student workspace." },
      { status: 500 },
    );
  }
}
