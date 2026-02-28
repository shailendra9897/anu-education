export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;
const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("WEBHOOK BODY:", JSON.stringify(body, null, 2));

    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: "no message" });
    }

    const from = message.from;
    let userMessage = "";
    let source = "Unknown";

    // =============================
    // ✅ QUICK REPLY BUTTON
    // =============================
    if (message.type === "button") {

      userMessage = message.button.text;
      source = "Quick Reply Button";

      console.log("BUTTON CLICKED:", userMessage);
    }

    // =============================
    // ✅ NORMAL TEXT
    // =============================
    else if (message.type === "text") {

      userMessage = message.text.body;
      source = "Text Reply";
    }

    else {
      return NextResponse.json({ status: "unsupported type" });
    }

    // =============================
    // SAVE TO GOOGLE SHEET
    // =============================

    const payload = {
  date: new Date().toLocaleString(),
  phone: from,
  name: "",
  message: userMessage,
  source: source,
  status: "New",
  followup: "",
  notes: ""
};

    if (GOOGLE_SHEET_WEBHOOK) {
      await fetch(GOOGLE_SHEET_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    // =============================
    // AUTO REPLY LOGIC
    // =============================

    if (userMessage.toLowerCase().includes("yes")) {

      await sendReply(from,
`🎉 Great!

Please register here:
https://study.anuedu.in/register

Our counsellor will contact you shortly.`);
    }

    else {

      await sendReply(from,
`Thank you for your response.

Our ANU Education team will contact you soon.`);
    }

    return NextResponse.json({ status: "processed" });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function sendReply(to: string, message: string) {
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
        to,
        type: "text",
        text: { body: message },
      }),
    }
  );
}