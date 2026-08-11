import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(process.env.GOOGLE_SHEET_WEBHOOK!, {
      method: "GET"
    });

    const data = await res.json();

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch CRM data" }, { status: 500 });
  }
}