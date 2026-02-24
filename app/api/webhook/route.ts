import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.VERIFY_TOKEN!;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;

// 🔹 Verification (Meta calls this first)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Verification failed", { status: 403 });
}

// 🔹 Receive Messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {
      const from = message.from;

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
            to: from,
            type: "text",
            text: {
              body:
                "Hello 👋 Welcome to ANU Education.\nReply 1 for IELTS\nReply 2 for PTE\nReply 3 for German\nReply 4 for Study Abroad",
            },
          }),
        }
      );
    }

    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}