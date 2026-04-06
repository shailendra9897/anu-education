import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const leadId = Number(id);
    if (isNaN(leadId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await db.query("DELETE FROM whatsapp_leads WHERE id = $1", [leadId]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}