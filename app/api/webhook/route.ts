export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;
const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK!;

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: "no message" });
    }

    const from = message.from;

    let userMessage = "";
    let source = "Text";

    // ==========================
    // QUICK REPLY BUTTON
    // ==========================

    if (
      message.type === "interactive" &&
      message.interactive?.button_reply
    ) {

      userMessage = message.interactive.button_reply.title;
      source = "Button Click";

      // Save to Google Sheet
      await saveLead(from, userMessage, source);

      // IELTS
      if (userMessage.toLowerCase().includes("ielts")) {
        await sendReply(
          from,
`🎓 IELTS Demo Class

Join our FREE 3-day IELTS demo.

Register here:
https://study.anuedu.in/register`
        );
      }

      // PTE
      else if (userMessage.toLowerCase().includes("pte")) {
        await sendReply(
          from,
`🎯 PTE Demo Class

Join our FREE PTE demo class.

Register here:
https://study.anuedu.in/register`
        );
      }

      // Study Abroad
      else if (userMessage.toLowerCase().includes("study")) {
        await sendReply(
          from,
`🌍 Study Abroad Counselling

Get FREE counselling for:
UK 🇬🇧
Canada 🇨🇦
Germany 🇩🇪
Australia 🇦🇺

Book here:
https://study.anuedu.in/register`
        );
      }

      return NextResponse.json({ status: "button processed" });
    }

    // ==========================
    // NORMAL TEXT MESSAGE
    // ==========================

    if (message.type === "text") {

      userMessage = message.text.body;
      source = "Text Message";

      await saveLead(from, userMessage, source);

      await sendReply(
        from,
`Thank you for messaging ANU Education.

Our team will contact you shortly.`
      );

      return NextResponse.json({ status: "text processed" });

    }

    return NextResponse.json({ status: "ignored" });

  } catch (error) {

    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );

  }
}

// ==========================
// SAVE TO GOOGLE SHEET
// ==========================

async function saveLead(phone: string, message: string, source: string) {

  if (!GOOGLE_SHEET_WEBHOOK) return;

  await fetch(GOOGLE_SHEET_WEBHOOK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      date: new Date().toLocaleString(),
      phone: phone,
      message: message,
      source: source
    })
  });

}

// ==========================
// SEND WHATSAPP MESSAGE
// ==========================

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
        to: to,
        type: "text",
        text: {
          body: message
        },
      }),
    }
  );

}