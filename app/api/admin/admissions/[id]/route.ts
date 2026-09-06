import { NextRequest, NextResponse } from "next/server";
import {
  getAdminAdmissionDetail,
  adminAdmissionErrorResponse,
} from "@/lib/admission/admin.admissions.service";
import { requireAdminAuth } from "@/lib/auth/admin-guard";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/admissions/[id]
 *
 * Full detail of one admission record:
 *   • student identity (Lead: name, phone, email)
 *   • course, state, assigned counsellor, created/updated, contactedAt
 *   • the immutable AdmissionEvent history (ascending)
 *
 * Any authenticated active staff member may read it. Events expose
 * action / previous→next / actor / reason only — never AI chain-of-
 * thought or hidden classifier internals.
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
        { success: false, error: "Admission record id is required." },
        { status: 400 },
      );
    }

    const admission = await getAdminAdmissionDetail(id);

    if (!admission) {
      return NextResponse.json(
        { success: false, error: "Admission record not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, admission });
  } catch (error) {
    return adminAdmissionErrorResponse(error);
  }
}