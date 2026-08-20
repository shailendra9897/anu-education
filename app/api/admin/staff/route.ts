import { NextRequest, NextResponse } from "next/server";
import {
  listStaff,
  createStaff,
  type CreateStaffInput,
} from "@/lib/staff/staff.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/staff
 *
 * List all staff members.
 * Optional: ?active=true ?role=COUNSELLOR
 */
export async function GET(req: NextRequest) {
  try {
    const activeParam = req.nextUrl.searchParams.get("active");
    const role = req.nextUrl.searchParams.get("role") || undefined;

    const active =
      activeParam === "true"
        ? true
        : activeParam === "false"
          ? false
          : undefined;

    const staff = await listStaff({ active, role });

    return NextResponse.json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    console.error("[ADMIN STAFF] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load staff." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/staff
 *
 * Create a new staff member.
 * Body: { name, email, phone?, role?, active? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateStaffInput;

    if (!body.name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 },
      );
    }

    if (!body.email?.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 },
      );
    }

    const staff = await createStaff(body);

    return NextResponse.json({ success: true, staff }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { success: false, error: "A staff member with this email already exists." },
        { status: 409 },
      );
    }

    console.error("[ADMIN STAFF] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to create staff member." },
      { status: 500 },
    );
  }
}
