import { NextRequest, NextResponse } from "next/server";
import {
  markPortalAccessCompleted,
  markPortalAccessFailed,
  retryPortalAccess,
} from "@/lib/portal/portal.access.service";
import { processPortalAccessRequest } from "@/lib/portal/portal.processor";
import {
  isAdminAuthError,
  adminAuthErrorResponse,
  requireAdminAuth,
} from "@/lib/auth/admin-guard";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

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
    const identity = await requireAdminAuth(req, { role: "ADMIN" });

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
      const result = await processPortalAccessRequest(id, {
        processedBy: identity.email,
      });

      switch (result.status) {
        case "NOT_FOUND":
          return NextResponse.json(
            { success: false, error: result.message },
            { status: 404 },
          );
        case "ALREADY_COMPLETED":
          return NextResponse.json({
            success: true,
            request: result.request,
            message: result.message,
          });
        case "ALREADY_PROCESSING":
        case "NOT_PROCESSABLE":
          return NextResponse.json(
            {
              success: false,
              error: result.message,
            },
            { status: 409 },
          );
        case "CONFIGURATION":
          return NextResponse.json({
            success: false,
            request: result.request,
            message: result.message,
            errorCode: "CONFIGURATION",
          });
        case "FAILED":
          return NextResponse.json({
            success: false,
            request: result.request,
            message: result.message,
            errorCode: result.errorCode,
          });
        case "COMPLETED":
          return NextResponse.json({
            success: true,
            request: result.request,
            message: result.message,
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
    if (isAdminAuthError(error)) {
      return adminAuthErrorResponse(error);
    }
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
