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

    // =============================
    // 🔥 HANDLE QUICK REPLY BUTTON
    // =============================
    if (message.type === "button") {
      const buttonText = message.button?.text;

      if (buttonText === "Yes, Send Details") {

        // Save lead to Google Sheet
        await fetch(GOOGLE_SHEET_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: new Date().toLocaleString(),
            phone: from,
            message: "Interested - Yes, Send Details",
            source: "Template Button"
          })
        });

        await sendReply(from,
`Great 😊

Book your FREE demo here:
https://study.anuedu.in/register

Our counsellor will guide you further.`);

        return NextResponse.json({ status: "button yes handled" });
      }

      if (buttonText === "Not Now") {

        await fetch(GOOGLE_SHEET_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: new Date().toLocaleString(),
            phone: from,
            message: "Not Interested - Not Now",
            source: "Template Button"
          })
        });

        await sendReply(from,
`No problem 😊

If you plan for IELTS / PTE / German later, feel free to message us anytime.`);

        return NextResponse.json({ status: "button no handled" });
      }
    }

    // =============================
    // 🔥 HANDLE FLOW SUBMISSION
    // =============================
    if (message?.interactive?.type === "nfm_reply") {
      const flowData = message.interactive.nfm_reply.response_json;

      await fetch(GOOGLE_SHEET_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toLocaleString(),
          phone: from,
          message: JSON.stringify(flowData),
          source: "WhatsApp Flow"
        })
      });

      await sendReply(from,
`🎉 Thank you for booking your FREE Demo!

Our ANU Education counsellor will contact you shortly.`);

      return NextResponse.json({ status: "flow processed" });
    }

    // =============================
    // 🔥 HANDLE TEXT MESSAGE (Fallback)
    // =============================
    if (message.type === "text") {
      const userReply = message.text?.body?.trim().toLowerCase();

      if (["hi", "hello", "hey"].includes(userReply)) {
        await sendReply(from,
`Hello 👋 Welcome to ANU Education.

Reply with number:

1️⃣ IELTS  
2️⃣ PTE  
3️⃣ German  
4️⃣ Study Abroad`);
      }
    }

    return NextResponse.json({ status: "ok" });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// =============================
// ✅ Helper function
// =============================
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