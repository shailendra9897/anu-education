export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;
const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK!;

export async function GET() {

  try {

    const response = await fetch(GOOGLE_SHEET_WEBHOOK);
    const leads = await response.json();

    const now = Date.now();

    for (const lead of leads) {

      const phone = lead.phone;
      const name = lead.name || "Student";
      const status = lead.status;
      const date = new Date(lead.date).getTime();

      const minutesPassed = (now - date) / 60000;

      // Only send reminder if 10 minutes passed
      if (status === "New" && minutesPassed > 10) {

        await sendReminder(phone, name);

        // Update sheet
        await fetch(GOOGLE_SHEET_WEBHOOK, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone,
            status: "Reminder Sent"
          })
        });

      }

    }

    return NextResponse.json({ status: "reminder check done" });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "reminder failed" },
      { status: 500 }
    );

  }

}

async function sendReminder(phone: string, name: string) {

  await fetch(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          body: `Hi ${name} 👋

Just reminding you to complete your FREE demo registration.

https://study.anuedu.in/register`
        }
      })
    }
  );

}