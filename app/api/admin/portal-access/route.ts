import { NextRequest, NextResponse } from "next/server";
import {
  listPortalAccessRequests,
} from "@/lib/portal/portal.access.service";
import { PortalAccessStatus } from "@prisma/client";
import {
  isAdminAuthError,
  adminAuthErrorResponse,
  requireAdminAuth,
} from "@/lib/auth/admin-guard";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/portal-access
 *
 * Optional:
 * ?status=PENDING
 * ?status=PROCESSING
 * ?status=COMPLETED
 * ?status=FAILED
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req);

    const statusParam = req.nextUrl.searchParams.get("status");

    let status: PortalAccessStatus | undefined;

    if (statusParam) {
      if (
        !Object.values(PortalAccessStatus).includes(
          statusParam as PortalAccessStatus,
        )
      ) {
        return NextResponse.json(
          {
            error: "Invalid portal access status.",
          },
          { status: 400 },
        );
      }

      status = statusParam as PortalAccessStatus;
    }

    const requests = await listPortalAccessRequests(status);

    return NextResponse.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    if (isAdminAuthError(error)) {
      return adminAuthErrorResponse(error);
    }
    console.error(
      "[ADMIN PORTAL ACCESS] GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load portal access requests.",
      },
      { status: 500 },
    );
  }
}