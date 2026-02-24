import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;

export async function POST(req: NextRequest) {
  try {
    const { numbers, templateName } = await req.json();

    if (!numbers || numbers.length === 0) {
      return NextResponse.json({ error: "No numbers provided" }, { status: 400 });
    }

    for (const number of numbers) {
      await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: number,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
          },
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}