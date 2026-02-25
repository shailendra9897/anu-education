import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {
      const from = message.from;

      let userReply = "";

      if (message.type === "text") {
        userReply = message.text?.body?.trim();
      }

      // 🔥 MENU FLOW

      if (!userReply || ["hi", "hello", "hey"].includes(userReply.toLowerCase())) {
        await sendReply(from,
`Hello 👋 Welcome to ANU Education.

Reply with number:

1️⃣ IELTS  
2️⃣ PTE  
3️⃣ German  
4️⃣ Study Abroad`
        );
      }

      else if (userReply === "1") {
        await sendReply(from,
`🎓 FREE 3-Day IELTS Demo Available!

Register here:
https://study.anuedu.in/register`);
      }

      else if (userReply === "2") {
        await sendReply(from,
`🎯 FREE 3-Day PTE Demo Available!

Register here:
https://study.anuedu.in/register`);
      }

      else if (userReply === "3") {
        await sendReply(from,
`🇩🇪 FREE German Language Demo!

Register here:
https://study.anuedu.in/register`);
      }

      else if (userReply === "4") {
        await sendReply(from,
`🌍 FREE Study Abroad Counselling!

Book here:
https://study.anuedu.in/register`);
      }

      else {
        await sendReply(from,
`Please reply with:

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

// ✅ Helper function
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