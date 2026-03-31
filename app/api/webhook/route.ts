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
console.log("BUTTON DATA:", JSON.stringify(message));
    const from = message.from;

    let userMessage = "";
    let source = "Text";

   // ==========================
// BUTTON CLICK HANDLING
// ==========================

if (message.type === "button" || message.type === "interactive") {

  const reply =
    message.button?.payload ||
    message.button?.text ||
    message.interactive?.button_reply?.title ||
    message.interactive?.button_reply?.id ||
    message.interactive?.list_reply?.title ||
    message.interactive?.list_reply?.id ||
    "";

  userMessage = reply;
  source = "Button Click";

  await saveLead(from, userMessage, source, "Interested");

  const msg = reply.toLowerCase();

  // 🔥 DETECT TYPE USING CONTEXT (TEMP LOGIC)
  const contextId = message.context?.id || "";

  let userType = "student";

  // 👉 If you sent teacher template recently → treat as teacher
  if (msg.includes("collaborate") || msg.includes("teacher")) {
    userType = "teacher";
  }

  // ==========================
  // YES BUTTON
  // ==========================
  if (msg.includes("yes") || msg.includes("details")) {

    if (userType === "teacher") {

      await sendReply(
        from,
`Great 👍  

We offer:
✔ Student counselling  
✔ Admission support  
✔ Visa guidance  

You can refer students and earn commission 💰  

Shall we connect for details?`
      );

    } else {

      await sendReply(
        from,
`🎓 Great!

Choose your course:

1️⃣ IELTS Coaching  
2️⃣ PTE Coaching  
3️⃣ Study Abroad`
      );

    }

    return NextResponse.json({ status: "YES handled" });
  }

  // ==========================
  // NO BUTTON
  // ==========================
  if (msg.includes("no")) {

    await sendReply(
      from,
`No problem 🙂  

You can connect anytime if needed.`
    );

    return NextResponse.json({ status: "NO handled" });
  }

  // ==========================
  // OTHER BUTTONS
  // ==========================

  if (msg.includes("ielts")) {
    await sendReply(from, `🎓 IELTS Demo\n\nReply:\n1️⃣ Today\n2️⃣ Tomorrow\n3️⃣ Weekend`);
    return NextResponse.json({ status: "IELTS handled" });
  }

  if (msg.includes("pte")) {
    await sendReply(from, `🎯 PTE Demo\n\nReply:\n1️⃣ Today\n2️⃣ Tomorrow\n3️⃣ Weekend`);
    return NextResponse.json({ status: "PTE handled" });
  }

  if (msg.includes("study")) {
    await sendReply(from, `🌍 Study Abroad\n\nReply with country name.`);
    return NextResponse.json({ status: "Study handled" });
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

  // 🔥 HOT LEAD DETECTION (ADD HERE)
  if (
    userMessage.includes("yes") ||
    userMessage.includes("interested") ||
    userMessage.includes("join") ||
    userMessage.includes("demo")
  ) {

    await saveLead(from, userMessage, source, "Interested");

    await sendReply(
      from,
`Great 👍  

Your seat is almost reserved.  

👉 Complete registration:
https://study.anuedu.in/register`
    );

    return NextResponse.json({ status: "hot lead handled" });
  }

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
await saveLead(from, "Demo Booked Today", source, "Converted");
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

async function saveLead(
  phone: string,
  message: string,
  source: string,
  status: string = "New"
) {
  if (!GOOGLE_SHEET_WEBHOOK) return;

  await fetch(GOOGLE_SHEET_WEBHOOK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      date: new Date().toLocaleString(),
      phone,
      message,
      source,
      status
    })
  });}

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