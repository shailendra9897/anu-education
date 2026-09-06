import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_ADMISSION_ACTIONS,
  actorForStaffIdentity,
  adminAdmissionErrorResponse,
  canModifyAdmission,
  performAdminAdmissionAction,
  type AdminAdmissionAction,
} from "@/lib/admission/admin.admissions.service";
import { requireAdminAuth } from "@/lib/auth/admin-guard";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/admissions/[id]/actions
 *
 * The single counselor-action endpoint for the admission workspace.
 *
 * Body: { action, staffId?, reason?, note?, discriminator? }
 *
 * SECURITY MODEL (Task 5 / Task 9):
 *   • authn:  requireAdminAuth (middleware + staff identity gate)
 *   • authz:  per-record ownership rule — a COUNSELLOR may work a
 *             record only when it is unassigned or assigned to them
 *   • actor:  DERIVED SERVER-SIDE from the authenticated staff
 *             identity (ADMIN staff → ADMIN verb, everyone else →
 *             COUNSELLOR). A browser-supplied actor value is never
 *             read, so STUDENT / AI / SYSTEM can never be introduced.
 *   • state:  every state change goes through the S6-B1
 *             recordAdmissionTransition / recordAdmissionEvent /
 *             setCounsellorAssignment — never a direct UPDATE here.
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
        { success: false, error: "Admission record id is required." },
        { status: 400 },
      );
    }

    const body = (await req.json()) as {
      action?: string;
      staffId?: string | null;
      reason?: string | null;
      note?: string | null;
      discriminator?: string | null;
      nextFollowUpAt?: string | null;
    };

    const action = body.action as AdminAdmissionAction;
    if (!ADMIN_ADMISSION_ACTIONS.includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid admission action." },
        { status: 400 },
      );
    }

    // Existence + the current assignment for the authorization decision.
    const enrollment = await prisma.admissionEnrollment.findUnique({
      where: { id },
      select: { assignedCounsellorId: true },
    });
    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Admission record not found." },
        { status: 404 },
      );
    }

    const intent =
      action === "ASSIGN" || action === "RELEASE"
        ? action
        : action === "NOTE"
          ? "NOTE"
          : "STATE";

    const permission = canModifyAdmission(
      identity,
      enrollment,
      intent,
      action === "ASSIGN" ? body.staffId ?? null : null,
    );

    if (!permission.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            permission.reason === "ASSIGNED_TO_OTHER"
              ? "This admission is assigned to another counsellor."
              : "You may only claim or release your own admission assignments.",
        },
        { status: 403 },
      );
    }

    // Actor is derived server-side; body.actor is deliberately ignored.
    const actor = actorForStaffIdentity(identity.role);

    // S6-F1 — parse the ISO follow-up date server-side. A malformed date
    // for a scheduled follow-up is rejected by the domain layer; an empty
    // string / null clears the scheduled follow-up.
    let nextFollowUpAt: Date | null | undefined;
    if (typeof body.nextFollowUpAt === "string" && body.nextFollowUpAt.trim() !== "") {
      nextFollowUpAt = new Date(body.nextFollowUpAt);
    } else if (body.nextFollowUpAt === null) {
      nextFollowUpAt = null;
    }

    const result = await performAdminAdmissionAction({
      admissionEnrollmentId: id,
      action,
      actor,
      actorId: identity.id,
      reason: body.reason?.trim() || null,
      note: body.note?.trim() || null,
      staffId: body.staffId ?? null,
      discriminator: body.discriminator?.trim() || null,
      nextFollowUpAt,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return adminAdmissionErrorResponse(error);
  }
}