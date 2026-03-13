export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;
const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK!;

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const change = body?.entry?.[0]?.changes?.[0]?.value;

    if (!change) {
      return NextResponse.json({ status: "no change" });
    }

    const message = change?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: "no message" });
    }

    const from = message.from;

    let userMessage = "";
    let source = "Text";

    // ==========================
    // BUTTON CLICK HANDLING
    // ==========================

    if (
      message.type === "interactive" &&
      message.interactive?.button_reply
    ) {

      userMessage = message.interactive.button_reply.title;
      source = "Button Click";

      await saveLead(from, userMessage, source);

      const msg = userMessage.toLowerCase();

      // YES BUTTON

      if (msg.includes("yes")) {

        await sendMenu(from);

      }

      // NO BUTTON

      else if (msg.includes("no")) {

        await sendReply(
          from,
`No problem 🙂

You can register anytime here:

https://study.anuedu.in/register`
        );

      }

      // IELTS

      else if (msg.includes("ielts")) {

        await sendReply(
          from,
`🎓 IELTS Demo Class

Join our FREE 3-day IELTS demo.

Reply:

1️⃣ Today
2️⃣ Tomorrow
3️⃣ Weekend Batch`
        );

      }

      // PTE

      else if (msg.includes("pte")) {

        await sendReply(
          from,
`🎯 PTE Demo Class

Join our FREE PTE demo class.

Reply:

1️⃣ Today
2️⃣ Tomorrow
3️⃣ Weekend Batch`
        );

      }

      // STUDY ABROAD

      else if (msg.includes("study")) {

        await sendReply(
          from,
`🌍 Study Abroad Counselling

We guide students for:

🇩🇪 Germany
🇬🇧 UK
🇨🇦 Canada
🇦🇺 Australia

Reply with country name.`
        );

      }

      return NextResponse.json({ status: "button processed" });

    }

    // ==========================
    // NORMAL TEXT MESSAGE
    // ==========================

    if (message.type === "text") {

      userMessage = message.text.body.trim().toLowerCase();
      source = "Text Message";

      await saveLead(from, userMessage, source);

      // GREETING

      if (
        userMessage === "hi" ||
        userMessage === "hello" ||
        userMessage === "menu"
      ) {

        await sendMenu(from);

      }

      // IELTS

      else if (userMessage === "1") {

        await sendReply(
          from,
`🎓 IELTS FREE Demo

Register here:
https://study.anuedu.in/register`
        );

      }

      // PTE

      else if (userMessage === "2") {

        await sendReply(
          from,
`🎯 PTE FREE Demo

Register here:
https://study.anuedu.in/register`
        );

      }

      // STUDY ABROAD

      else if (userMessage === "3") {

        await sendReply(
          from,
`🌍 Study Abroad Counselling

Book FREE counselling:
https://study.anuedu.in/register`
        );

      }

      // DEMO MENU

      else if (userMessage === "4") {

        await sendReply(
          from,
`🎓 FREE Demo Classes

Choose course:

1️⃣ IELTS
2️⃣ PTE`
        );

      }

      // DEMO SLOT

      else if (userMessage === "today") {

        await sendReply(
          from,
`✅ Demo slot booked for TODAY.

Our counsellor will contact you shortly.`
        );

      }

      else if (userMessage === "tomorrow") {

        await sendReply(
          from,
`✅ Demo slot booked for TOMORROW.

Our counsellor will contact you shortly.`
        );

      }

      else if (userMessage === "weekend") {

        await sendReply(
          from,
`✅ Weekend demo slot reserved.

Our team will contact you shortly.`
        );

      }

      // TEMPLATE YES TEXT

      else if (userMessage.includes("yes")) {

        await sendMenu(from);

      }

      // UNKNOWN MESSAGE

      else {

        await sendMenu(from);

      }

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
// SEND MAIN MENU
// ==========================

async function sendMenu(to: string) {

  await sendReply(
    to,
`Hello 👋 Welcome to ANU Education.

How can we help you?

Reply with number:

1️⃣ IELTS Coaching
2️⃣ PTE Coaching
3️⃣ Study Abroad Counselling
4️⃣ Book FREE Demo`
  );

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