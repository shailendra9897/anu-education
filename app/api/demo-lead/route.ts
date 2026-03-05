export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK!;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const name = body.name;
    const phone = body.phone;
    const course = body.course || "IELTS";

    if (!phone) {
      return NextResponse.json(
        { error: "Phone required" },
        { status: 400 }
      );
    }

    // ==========================
    // SAVE TO GOOGLE SHEET
    // ==========================

    if (GOOGLE_SHEET_WEBHOOK) {

      await fetch(GOOGLE_SHEET_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: new Date().toLocaleString(),
          name,
          phone,
          course,
          source: "Free Demo Landing Page"
        })
      });

    }

    // ==========================
    // SEND WHATSAPP MESSAGE
    // ==========================

    if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {

      await fetch(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phone,
            type: "text",
            text: {
              body:
`Hello ${name || ""} 👋

Thank you for registering for ANU Education FREE Demo Class.

Course: ${course}

Our counsellor will contact you shortly.

Website:
https://www.anuedu.in`
            }
          }),
        }
      );

    }

    return NextResponse.json({ success: true });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );

  }

}