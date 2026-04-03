import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { error: "Invalid or missing lead ID" },
        { status: 400 }
      );
    }

    await db.query(
      "DELETE FROM whatsapp_leads WHERE id = $1",
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete lead error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}