export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;
const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK!;

// 🔥 TEMP USER TYPE STORAGE
const userTypeMap: Record<string, string> = {};

// ==========================
// SAVE TO GOOGLE SHEET
// ==========================
async function saveLead(phone: string, message: string, source: string, status: string) {
  if (!GOOGLE_SHEET_WEBHOOK) return;

  await fetch(GOOGLE_SHEET_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: new Date().toLocaleString(),
      phone,
      message,
      source,
      status,
    }),
  });
}

// ==========================
// SEND TEMPLATE
// ==========================
async function sendTemplate(
  phone: string,
  templateName: string,
  variables: Record<string, string>
) {
  let templatePayload: any = {
    name: templateName,
    language: { code: "en" },
  };

  const variableValues = Object.values(variables || {}).filter(v => v?.trim());

  if (variableValues.length > 0) {
    templatePayload.components = [
      {
        type: "body",
        parameters: variableValues.map((val) => ({
          type: "text",
          text: val,
        })),
      },
    ];
  }

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
      template: templatePayload,
    }),
  });
}

// ==========================
// MAIN API
// ==========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const numbers: string[] = body.numbers;
    const templateName: string = body.templateName;
    const templateVariables: Record<string, string> = body.templateVariables || {};

    if (!numbers || numbers.length === 0 || !templateName) {
      return NextResponse.json(
        { error: "Missing numbers or template" },
        { status: 400 }
      );
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const phone of numbers) {
      try {
        const res = await sendTemplate(phone, templateName, templateVariables);
        const data = await res.json();

        if (res.ok) {
          sentCount++;

          // 🔥 STORE USER TYPE HERE (IMPORTANT)
          userTypeMap[phone] = templateName;

          await saveLead(phone, templateName, "Template Sent", "Sent");
        } else {
          failedCount++;
          console.error("Send error:", data);

          await saveLead(phone, templateName, "Template Failed", "Error");
        }

        await new Promise((r) => setTimeout(r, 700));

      } catch (err) {
        failedCount++;
        console.error("Loop error:", err);

        await saveLead(phone, templateName, "Template Failed", "Error");
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}