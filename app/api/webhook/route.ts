export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUserTemplate } from "@/lib/getUserTemplate";
import { saveLead } from "@/lib/saveLead";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET!; // from Meta App Dashboard

// Simple in‑memory duplicate cache (use Redis in production)
const processedMessages = new Map<string, number>();

// ==========================
// TEMPLATE → REPLY MAPPING
// ==========================
const TEMPLATE_REPLIES: Record<string, { yesReply: string; interestedReply: string }> = {
  teacher_collaboration_primary: {
    yesReply: `Great 👍 You can refer students and earn commission 💰\n\nShall we connect for details?`,
    interestedReply: `Great 👍 You can earn commission by referring students 💰`,
  },
  college_faculty_program_2026: {
    yesReply: `Great 👍 Faculty partnership program\n\nRefer students and earn rewards 💰`,
    interestedReply: `You're eligible for faculty referral rewards!`,
  },
  consultant_collaboration_2026: {
    yesReply: `Let’s connect for partnership 🤝`,
    interestedReply: `Let’s discuss how we can work together 🤝`,
  },
  default: {
    yesReply: `🎓 Great!\n\nChoose your course:\n1️⃣ IELTS Coaching\n2️⃣ PTE Coaching\n3️⃣ Study Abroad`,
    interestedReply: `👉 Complete registration:\nhttps://study.anuedu.in/register`,
  },
};

// ==========================
// SIGNATURE VERIFICATION
// ==========================
function verifySignature(body: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !APP_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", APP_SECRET)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
}

// ==========================
// DUPLICATE CHECK
// ==========================
function isDuplicate(messageId: string): boolean {
  const now = Date.now();
  const lastSeen = processedMessages.get(messageId);
  if (lastSeen && now - lastSeen < 300000) return true; // 5 minutes
  processedMessages.set(messageId, now);
  return false;
}

// ==========================
// MAIN WEBHOOK
// ==========================
export async function POST(req: NextRequest) {
  try {
    // 1. Verify signature
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    if (!verifySignature(rawBody, signature)) {
      console.error("Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const change = body?.entry?.[0]?.changes?.[0]?.value;
    if (!change) return NextResponse.json({ status: "no change" });

    const message = change?.messages?.[0];
    if (!message) return NextResponse.json({ status: "no message" });

    // 2. Duplicate prevention
    const messageId = message.id;
    if (isDuplicate(messageId)) {
      return NextResponse.json({ status: "duplicate" });
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

      await safeSaveLead(from, "unknown", userMessage, source, "Interested");

      const msg = reply.toLowerCase();
      const lastTemplate = await getUserTemplate(from);
      const replyConfig = TEMPLATE_REPLIES[lastTemplate as keyof typeof TEMPLATE_REPLIES] || TEMPLATE_REPLIES.default;

      // YES / DETAILS
      if (msg.includes("yes") || msg.includes("details")) {
        await sendReply(from, replyConfig.yesReply);
        return NextResponse.json({ status: "YES handled" });
      }

      // NO
      if (msg.includes("no")) {
        await sendReply(from, `No problem 🙂\n\nYou can connect anytime if needed.`);
        return NextResponse.json({ status: "NO handled" });
      }

      // Specific buttons
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
    // TEXT MESSAGE HANDLING
    // ==========================
    if (message.type === "text") {
      userMessage = message.text.body.trim().toLowerCase();
      source = "Text Message";

      await safeSaveLead(from, "unknown", userMessage, source, "New");

      // OPT‑OUT HANDLING
      if (userMessage === "stop" || userMessage === "unsubscribe") {
        await safeSaveLead(from, "OPT_OUT", userMessage, source, "Unsubscribed");
        await sendReply(from, "You have been unsubscribed. You won't receive further messages.");
        return NextResponse.json({ status: "opt-out handled" });
      }

      const lastTemplate = await getUserTemplate(from);
      const replyConfig = TEMPLATE_REPLIES[lastTemplate as keyof typeof TEMPLATE_REPLIES] || TEMPLATE_REPLIES.default;

      // HOT LEAD DETECTION
      if (
        userMessage.includes("yes") ||
        userMessage.includes("interested") ||
        userMessage.includes("join") ||
        userMessage.includes("demo")
      ) {
        await safeSaveLead(from, lastTemplate || "unknown", userMessage, source, "Interested");
        await sendReply(from, replyConfig.interestedReply);
        return NextResponse.json({ status: "hot lead handled" });
      }

      // GREETING / MENU
      if (userMessage === "hi" || userMessage === "hello" || userMessage === "menu") {
        await sendMenu(from);
      }
      // MENU OPTIONS
      else if (userMessage === "1") {
        await sendReply(from, `🎓 IELTS Demo\nhttps://study.anuedu.in/register`);
      } else if (userMessage === "2") {
        await sendReply(from, `🎯 PTE Demo\nhttps://study.anuedu.in/register`);
      } else if (userMessage === "3") {
        await sendReply(from, `🌍 Study Abroad\nhttps://study.anuedu.in/register`);
      } else if (userMessage === "4") {
        await sendReply(from, `🎓 Demo\n1️⃣ IELTS\n2️⃣ PTE`);
      } else {
        await sendMenu(from);
      }

      return NextResponse.json({ status: "text processed" });
    }

    return NextResponse.json({ status: "ignored" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ==========================
// HELPER: SEND MENU
// ==========================
async function sendMenu(to: string) {
  await sendReply(
    to,
    `Hello 👋 Welcome to ANU Education.\n\nReply with:\n\n1️⃣ IELTS\n2️⃣ PTE\n3️⃣ Study Abroad\n4️⃣ Demo`
  );
}

// ==========================
// HELPER: SEND TEXT REPLY
// ==========================
async function sendReply(to: string, message: string) {
  try {
    await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
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
    });
  } catch (err) {
    console.error("Failed to send reply:", err);
  }
}

// ==========================
// HELPER: SAFE LEAD SAVE (non‑blocking)
// ==========================
async function safeSaveLead(phone: string, template: string, message: string, source: string, status: string) {
  try {
    await saveLead(phone, template, message, source, status);
  } catch (err) {
    console.error("Failed to save lead:", err);
  }
}