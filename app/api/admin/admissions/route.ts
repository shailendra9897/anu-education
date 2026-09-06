import { NextRequest, NextResponse } from "next/server";
import {
  listAdminAdmissions,
  adminAdmissionErrorResponse,
} from "@/lib/admission/admin.admissions.service";
import { requireAdminAuth } from "@/lib/auth/admin-guard";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/admissions
 *
 * List admission records with the canonical filters:
 *   ?course=IELTS&state=COUNSELLOR_CONTACT_PENDING
 *   &assignee=unassigned|me|<staffId>
 *   &followUp=none|overdue|due|upcoming
 *   &limit=50&offset=0
 *
 * Ordering: urgent/actionable states first, newest updated first
 * within a state (pure ADMISSION_QUEUE_RANK). Also returns the active
 * counsellor list + canonical course/state options for the workspace
 * UI. Any authenticated active staff member may read it.
 */
export async function GET(req: NextRequest) {
  try {
    const identity = await requireAdminAuth(req);

    const course = req.nextUrl.searchParams.get("course") || undefined;
    const state = req.nextUrl.searchParams.get("state") || "ALL";
    const assignee = req.nextUrl.searchParams.get("assignee") || undefined;
    const followUpRaw = req.nextUrl.searchParams.get("followUp") || undefined;
    const followUp =
      followUpRaw === "none" ||
      followUpRaw === "overdue" ||
      followUpRaw === "due" ||
      followUpRaw === "upcoming"
        ? followUpRaw
        : undefined;
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0", 10);

    const result = await listAdminAdmissions(identity, {
      course,
      state: state as "ALL",
      assignee,
      followUp,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return adminAdmissionErrorResponse(error);
  }
}