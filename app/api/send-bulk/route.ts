export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;
const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK!;

// SAVE TO SHEET
async function saveLead(phone: string, message: string, source: string) {
  if (!GOOGLE_SHEET_WEBHOOK) return;

  await fetch(GOOGLE_SHEET_WEBHOOK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      date: new Date().toLocaleString(),
      phone,
      message,
      source,
      status: "Sent",
    }),
  });
}

// SEND TEMPLATE FUNCTION
async function sendTemplate(phone: string, templateName: string, name: string) {
  return fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: name || "Student",
              },
            ],
          },
        ],
      },
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const numbers: string[] = body.numbers;
    const templateName = body.templateName;

    if (!numbers || numbers.length === 0 || !templateName) {
      return NextResponse.json(
        { error: "Missing numbers or template" },
        { status: 400 }
      );
    }

    let successCount = 0;
    let failCount = 0;

    for (const phone of numbers) {
      try {
        const res = await sendTemplate(phone, templateName, "Student");

        const data = await res.json();

        if (res.ok) {
          successCount++;

          // SAVE SENT DATA
          await saveLead(phone, templateName, "Template Sent");
        } else {
          failCount++;
          console.error("Send error:", data);
        }

        // DELAY (VERY IMPORTANT 🔥)
        await new Promise((r) => setTimeout(r, 700));

      } catch (err) {
        failCount++;
        console.error("Loop error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}