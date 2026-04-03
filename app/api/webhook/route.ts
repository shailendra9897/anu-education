export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getUserTemplate } from "@/lib/getUserTemplate";
import { saveLead } from "@/lib/saveLead";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;

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

      await saveLead(from, "unknown", userMessage, source, "Interested");

      const msg = reply.toLowerCase();
console.log("👉 BUTTON CLICK:", msg);
      // 🔥 GET LAST TEMPLATE FROM DB
      const lastTemplate = await getUserTemplate(from);

      // ==========================
      // YES BUTTON (SMART LOGIC)
      // ==========================
      if (msg.includes("yes") || msg.includes("details")) {

        // 👨‍🏫 TEACHER FLOW
        const template = (lastTemplate || "").toLowerCase().trim();

if (
  template.includes("teacher") ||
  template.includes("faculty")
)  {

          await sendReply(
            from,
`Great 👍  

You can refer students and earn commission 💰  

Shall we connect for details?`
          );

        }

        // 🤝 CONSULTANT FLOW
        else if (
          lastTemplate === "consultant_collaboration_2026"
        ) {

          await sendReply(
            from,
`Let’s connect for partnership 🤝`
          );

        }

        // 🎓 STUDENT FLOW
        else {

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

      // NO BUTTON
      if (msg.includes("no")) {
        await sendReply(
          from,
`No problem 🙂  

You can connect anytime if needed.`
        );

        return NextResponse.json({ status: "NO handled" });
      }

      // OTHER BUTTONS
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

      await saveLead(from, "unknown", userMessage, source, "New");

      // 🔥 GET LAST TEMPLATE
      const lastTemplate = await getUserTemplate(from);
console.log("📞 FROM:", from);
console.log("💬 USER MESSAGE:", userMessage);
console.log("📦 TEMPLATE FROM DB:", lastTemplate);
      // HOT LEAD
      if (
        userMessage.includes("yes") ||
        userMessage.includes("interested") ||
        userMessage.includes("join") ||
        userMessage.includes("demo")
      ) {

        await saveLead(from, lastTemplate || "unknown", userMessage, source, "Interested");

        // SMART REPLY BASED ON TEMPLATE
        if (
          lastTemplate === "teacher_collaboration_primary" ||
          lastTemplate === "college_faculty_program_2026"
        ) {
          await sendReply(from, `Great 👍 You can earn commission by referring students 💰`);
        } else {
          await sendReply(from, `👉 Complete registration:\nhttps://study.anuedu.in/register`);
        }

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

      // MENU OPTIONS
      else if (userMessage === "1") {
        await sendReply(from, `🎓 IELTS Demo\nhttps://study.anuedu.in/register`);
      }

      else if (userMessage === "2") {
        await sendReply(from, `🎯 PTE Demo\nhttps://study.anuedu.in/register`);
      }

      else if (userMessage === "3") {
        await sendReply(from, `🌍 Study Abroad\nhttps://study.anuedu.in/register`);
      }

      else if (userMessage === "4") {
        await sendReply(from, `🎓 Demo\n1️⃣ IELTS\n2️⃣ PTE`);
      }

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
// MENU
// ==========================

async function sendMenu(to: string) {
  await sendReply(
    to,
`Hello 👋 Welcome to ANU Education.

Reply with:

1️⃣ IELTS  
2️⃣ PTE  
3️⃣ Study Abroad  
4️⃣ Demo`
  );
}

// ==========================
// SEND MESSAGE
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
        to,
        type: "text",
        text: { body: message },
      }),
    }
  );
}