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

    console.log("Incoming webhook:", JSON.stringify(body));

    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const text = message.text?.body || "";

      console.log("New Reply From:", from);
      console.log("Message:", text);

      // 🔥 Save to Google Sheet
      await fetch(
        "https://script.google.com/macros/s/AKfycbzxCC5pzCa-UCBAdttpj1Wt8ioM9acKNAeiefeQSsbEBWhSWQ2zOk7uZv9wTEUgY9E9/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: from,
            message: text,
          }),
        }
      );

      // 🔹 Auto Reply
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
                "Thank you for your response 👋\nOur counsellor will contact you shortly.\n\nIf urgent, call +91 7016497087",
            },
          }),
        }
      );
    }

    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}