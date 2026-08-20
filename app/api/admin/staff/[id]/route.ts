import { NextRequest, NextResponse } from "next/server";
import {
  getStaff,
  updateStaff,
  type UpdateStaffInput,
} from "@/lib/staff/staff.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/staff/[id]
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const staff = await getStaff(id);

    if (!staff) {
      return NextResponse.json(
        { success: false, error: "Staff member not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error("[ADMIN STAFF] GET [id] error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load staff member." },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/staff/[id]
 *
 * Update a staff member.
 * Body: { name?, email?, phone?, role?, active? }
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateStaffInput;

    const existing = await getStaff(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Staff member not found." },
        { status: 404 },
      );
    }

    const staff = await updateStaff(id, body);

    return NextResponse.json({ success: true, staff });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { success: false, error: "A staff member with this email already exists." },
        { status: 409 },
      );
    }

    console.error("[ADMIN STAFF] PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to update staff member." },
      { status: 500 },
    );
  }
}
