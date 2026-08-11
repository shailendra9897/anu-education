export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUserTemplate } from "@/lib/getUserTemplate";
import { saveLead } from "@/lib/saveLead";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET!;

// ==========================
// DUPLICATE CACHE
// ==========================
const processedMessages = new Map<string, number>();

function isDuplicate(messageId: string): boolean {
  const now = Date.now();
  const lastSeen = processedMessages.get(messageId);
  if (lastSeen && now - lastSeen < 300000) return true;
  processedMessages.set(messageId, now);
  return false;
}

// ==========================
// SIGNATURE VERIFY
// ==========================
function verifySignature(body: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !APP_SECRET) return false;

  const signature = signatureHeader.replace(/^sha256=/, "");

  const expected = crypto
    .createHmac("sha256", APP_SECRET)
    .update(body)
    .digest("hex");

  if (signature.length !== expected.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}

// ==========================
// TEMPLATE REPLIES (PSYCHOLOGY)
// ==========================
const TEMPLATE_REPLIES: Record<string, { yesReply: string; interestedReply: string }> = {

  student_class_19rs: {
    yesReply: `🎓 Great choice!

🔥 Only limited ₹19 demo seats left today

Students are booking fast ⏳  

👉 Book your seat now:
https://study.anuedu.in/register

⚠️ Offer may close anytime`,

    interestedReply: `🔥 Your demo seat is almost confirmed!

👉 Complete booking now:
https://study.anuedu.in/register

⏳ Few ₹19 slots remaining`,
  },

  teacher_collaboration_primary: {
    yesReply: `Great 👍  

Earn extra income by referring students 💰  

Shall we connect for details?`,

    interestedReply: `You can earn commission by referring students 💰`,
  },

  consultant_collaboration_2026: {
    yesReply: `Awesome 🤝  

Let’s discuss partnership opportunities.  

Our team will contact you shortly.`,

    interestedReply: `Let’s connect and grow together 🤝`,
  },

  default: {
    yesReply: `🎓 Great!

Choose your course:

1️⃣ IELTS  
2️⃣ PTE  
3️⃣ Study Abroad`,

    interestedReply: `👉 Register now:
https://study.anuedu.in/register`,
  },
};

// ==========================
// MAIN WEBHOOK
// ==========================
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const change = body?.entry?.[0]?.changes?.[0]?.value;
    if (!change) return NextResponse.json({ status: "no change" });

    const message = change?.messages?.[0];
    if (!message) return NextResponse.json({ status: "no message" });

    const messageId = message.id;
    if (isDuplicate(messageId)) {
      return NextResponse.json({ status: "duplicate" });
    }

    const from = message.from;
    let userMessage = "";
    let source = "Text";

    const lastTemplate = await getUserTemplate(from);
    const replyConfig =
      TEMPLATE_REPLIES[lastTemplate as keyof typeof TEMPLATE_REPLIES] ||
      TEMPLATE_REPLIES.default;

    // ==========================
    // BUTTON HANDLING
    // ==========================
    if (message.type === "button" || message.type === "interactive") {

      const reply =
        message.button?.payload ||
        message.button?.text ||
        message.interactive?.button_reply?.title ||
        message.interactive?.button_reply?.id ||
        "";

      const msg = reply.toLowerCase();
      userMessage = msg;
      source = "Button";

      await safeSaveLead(from, lastTemplate || "unknown", msg, source, "Clicked");

      // RESERVE / YES
      if (msg.match(/\b(yes|interested|reserve|confirm|ok|sure)\b/)) {

        await safeSaveLead(from, lastTemplate || "unknown", msg, source, "Hot");

        await safeSendReply(from, replyConfig.yesReply);

        return NextResponse.json({ status: "YES handled" });
      }

      // STOP
      if (msg.includes("stop")) {

        await safeSaveLead(from, lastTemplate || "unknown", msg, source, "Stopped");

        await safeSendReply(
          from,
`No problem 🙂  

You won’t receive further updates.  

Message anytime if needed 👍`
        );

        return NextResponse.json({ status: "STOP handled" });
      }

      return NextResponse.json({ status: "button processed" });
    }

    // ==========================
    // TEXT HANDLING
    // ==========================
    if (message.type === "text") {

      userMessage = message.text.body.trim().toLowerCase();
      source = "Text";

      await safeSaveLead(from, lastTemplate || "unknown", userMessage, source, "New");

      // OPT OUT
      if (userMessage === "stop") {
        await safeSaveLead(from, "OPT_OUT", userMessage, source, "Unsubscribed");

        await safeSendReply(
          from,
"You have been unsubscribed. You won’t receive further messages."
        );

        return NextResponse.json({ status: "opt-out" });
      }

      // HOT LEAD
      if (
        userMessage.includes("yes") ||
        userMessage.includes("demo") ||
        userMessage.includes("join")
      ) {

        await safeSaveLead(from, lastTemplate || "unknown", userMessage, source, "Hot");

        if (lastTemplate === "student_class_19rs_1") {

          await safeSendReply(
            from,
`🔥 Great!

Your ₹19 demo seat is almost confirmed.

👉 Book now:
https://study.anuedu.in/register

⏳ Only few seats left today`
          );

        } else {
          await safeSendReply(from, replyConfig.interestedReply);
        }

        return NextResponse.json({ status: "hot lead" });
      }

      // GREETING
      if (
        userMessage === "hi" ||
        userMessage === "hello" ||
        userMessage === "menu"
      ) {
        await sendMenu(from);
        return NextResponse.json({ status: "menu" });
      }

      await sendMenu(from);
      return NextResponse.json({ status: "default" });
    }

    return NextResponse.json({ status: "ignored" });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ==========================
// MENU
// ==========================
async function sendMenu(to: string) {
  await safeSendReply(
    to,
`Hello 👋  

Want to improve your English & go abroad? 🌍  

🎓 Join our ₹19 demo class  

✔ IELTS / PTE  
✔ Expert trainers  
✔ Proven results  

👉 Type DEMO to book your seat`
  );
}

// ==========================
// SEND MESSAGE
// ==========================
async function safeSendReply(to: string, message: string) {
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
    console.error("Send error:", err);
  }
}

// ==========================
// SAVE LEAD
// ==========================
async function safeSaveLead(
  phone: string,
  template: string,
  message: string,
  source: string,
  status: string
) {
  try {
    await saveLead(phone, template, message, source, status);
  } catch (err) {
    console.error("Save error:", err);
  }
}