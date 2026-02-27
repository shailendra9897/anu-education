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

    // ===========================
    // BUTTON REPLY HANDLING
    // ===========================

    if (message?.interactive?.type === "button_reply") {

      const reply = message.interactive.button_reply.title;

      const payload = {
        date: new Date().toLocaleString(),
        phone: from,
        message: reply,
        source: "Marketing Button"
      };

      await fetch(GOOGLE_SHEET_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // Auto Reply Logic
      if (reply.toLowerCase().includes("yes")) {
        await sendReply(from,
`🎉 Great!

Please register here:
https://study.anuedu.in/register

Our counsellor will contact you shortly.`);
      } else {
        await sendReply(from,
`No problem 😊

If you need guidance anytime, just message us.`);
      }

      return NextResponse.json({ status: "button processed" });
    }

    return NextResponse.json({ status: "ok" });

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
        to: to,
        type: "text",
        text: { body: message },
      }),
    }
  );
}