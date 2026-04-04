import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { id } = body;

    // Convert to number if it's a string
    const leadId = Number(id);
    if (isNaN(leadId)) {
      return NextResponse.json(
        { error: "Invalid lead ID (must be a number)" },
        { status: 400 }
      );
    }

    // Optional: check if lead exists before deleting
    const check = await db.query(
      "SELECT id FROM whatsapp_leads WHERE id = $1",
      [leadId]
    );
    if (check.rows.length === 0) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    await db.query("DELETE FROM whatsapp_leads WHERE id = $1", [leadId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete lead error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}