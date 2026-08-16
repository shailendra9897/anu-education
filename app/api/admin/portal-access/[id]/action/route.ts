import { NextRequest, NextResponse } from "next/server";
import {
  getPortalAccessRequest,
  markPortalAccessProcessing,
  markPortalAccessCompleted,
  markPortalAccessFailed,
  retryPortalAccess,
} from "@/lib/portal/portal.access.service";
import { registerStudentOnPortal } from "@/lib/demo/portal/portal.registration";
import type { PortalCourseKey } from "@/lib/portal/portal.types";

export const dynamic = "force-dynamic";

type Action =
  | "PROCESS"
  | "COMPLETE"
  | "FAIL"
  | "RETRY";

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Request ID is required." },
        { status: 400 },
      );
    }

    const body = (await req.json()) as {
      action?: Action;
      errorMessage?: string;
      portalStudentId?: string;
      portalLogin?: string;
      notes?: string;
    };

    const action = body.action;

    if (
      action !== "PROCESS" &&
      action !== "COMPLETE" &&
      action !== "FAIL" &&
      action !== "RETRY"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action.",
        },
        { status: 400 },
      );
    }

    if (action === "PROCESS") {
      const portalRequest = await getPortalAccessRequest(id);

      if (!portalRequest) {
        return NextResponse.json(
          { success: false, error: "Portal access request not found." },
          { status: 404 },
        );
      }

      if (portalRequest.status === "COMPLETED") {
        return NextResponse.json({
          success: true,
          request: portalRequest,
          message: "Portal access is already completed.",
        });
      }

      if (portalRequest.status === "PROCESSING") {
        return NextResponse.json(
          {
            success: false,
            error: "This portal request is already being processed.",
          },
          { status: 409 },
        );
      }

      await markPortalAccessProcessing(id, "admin");

      try {
        const course = normalizePortalCourse(portalRequest.course);
        const result = await registerStudentOnPortal({
          name: portalRequest.studentName,
          email: portalRequest.email,
          phone: portalRequest.phone,
          password: "Demo@123",
          course,
        });

        if (!result.success) {
          const request = await markPortalAccessFailed(
            id,
            result.errorMessage || result.message || "Portal registration failed.",
          );

          return NextResponse.json({
            success: false,
            request,
            message: result.message,
            errorCode: result.errorCode,
          });
        }

        const notes = [
          result.message,
          result.selectedCourse ? `Course: ${result.selectedCourse}` : null,
          result.portalStatus ? `Portal status: ${result.portalStatus}` : null,
        ]
          .filter(Boolean)
          .join(" | ");

        const request = await markPortalAccessCompleted(id, {
          portalStudentId: result.portalStudentId,
          portalLogin: result.portalLogin,
          notes,
        });

        return NextResponse.json({
          success: true,
          request,
          message: "Portal registration completed successfully.",
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown portal registration error.";
        const request = await markPortalAccessFailed(id, message);

        return NextResponse.json({
          success: false,
          request,
          message,
        });
      }
    }

    if (action === "COMPLETE") {
      const request = await markPortalAccessCompleted(id, {
        portalStudentId: body.portalStudentId,
        portalLogin: body.portalLogin,
        notes: body.notes,
      });

      return NextResponse.json({ success: true, request });
    }

    if (action === "FAIL") {
      if (!body.errorMessage?.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "errorMessage is required when marking failed.",
          },
          { status: 400 },
        );
      }

      const request = await markPortalAccessFailed(id, body.errorMessage.trim());
      return NextResponse.json({ success: true, request });
    }

    const request = await retryPortalAccess(id);
    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error(
      "[ADMIN PORTAL ACTION] Error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update portal access request.",
      },
      { status: 500 },
    );
  }
}

function normalizePortalCourse(course?: string | null): PortalCourseKey {
  const value = (course ?? "").trim().toLowerCase();

  if (value.includes("ielts")) return "ielts";
  if (value.includes("pte")) return "pte";
  if (value.includes("german")) return "german";
  if (value.includes("french")) return "french";
  if (value.includes("toefl")) return "toefl";
  if (value.includes("gre")) return "gre";
  if (value.includes("gmat")) return "gmat";
  if (value.includes("sat")) return "sat";
  if (value.includes("duolingo")) return "duolingo";
  if (value.includes("spoken english") || value.includes("spoken")) {
    return "spoken_english";
  }

  throw new Error(`No portal course mapping found for "${course ?? ""}".`);
}
