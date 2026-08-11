console.log("🚀 SEND API HIT");

import { NextRequest, NextResponse } from "next/server";
import { saveLead } from "@/lib/saveLead";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;
const API_SECRET = process.env.BULK_API_SECRET;

// ==========================
// RATE LIMITER
// ==========================
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 500;
const RATE_WINDOW = 60 * 60 * 1000;

function isRateLimited(id: string) {
  const now = Date.now();
  const record = rateLimit.get(id);

  if (!record || now > record.resetTime) {
    rateLimit.set(id, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) return true;

  record.count++;
  return false;
}

// ==========================
// MAIN API
// ==========================
export async function POST(req: NextRequest) {
  try {
    // 🔐 AUTH (optional)
    const authHeader = req.headers.get("authorization");
    if (API_SECRET && authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("📥 BODY RECEIVED:", body);

    const templateName: string = body.templateName;
    let contacts: { name: string; phone: string }[] = [];

    // ✅ BACKWARD COMPATIBILITY: accept both "contacts" and "numbers"
    if (body.contacts && Array.isArray(body.contacts)) {
      contacts = body.contacts;
    } else if (body.numbers && Array.isArray(body.numbers)) {
      // Convert old numbers format (each element can be "Name, Phone" or just phone)
      contacts = body.numbers.map((item: string) => {
        const parts = item.split(",");
        if (parts.length >= 2) {
          // Format: "Lakhan,7016497087"
          return {
            name: parts[0].trim(),
            phone: parts[1].trim(),
          };
        } else {
          // Only phone number – use default name
          return {
            name: "Student",
            phone: item.trim(),
          };
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Missing contacts or numbers array" },
        { status: 400 }
      );
    }

    console.log("📞 CONTACTS:", contacts);
    console.log("📄 TEMPLATE:", templateName);

    if (!contacts.length || !templateName) {
      return NextResponse.json(
        { success: false, error: "Missing contacts or templateName" },
        { status: 400 }
      );
    }

    // 🚫 RATE LIMIT
    const userIp = req.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(userIp)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    let sent = 0;
    let failed = 0;

    // ==========================
    // LOOP CONTACTS
    // ==========================
    for (const contact of contacts) {
      try {
        let digits = contact.phone.replace(/\D/g, "");

        if (digits.length === 10) digits = "91" + digits;

        if (digits.length !== 12) {
          console.log("❌ INVALID NUMBER:", contact.phone);
          failed++;
          continue;
        }

        const name = contact.name || "Student";

        console.log("➡️ SENDING TO:", digits, "NAME:", name);

        // ==========================
        // PAYLOAD (template with one variable)
        // ==========================
        const payload = {
          messaging_product: "whatsapp",
          to: digits,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: name,
                  },
                ],
              },
            ],
          },
        };

        console.log("📤 PAYLOAD:", JSON.stringify(payload, null, 2));

        // ==========================
        // SEND REQUEST
        // ==========================
        const res = await fetch(
          `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const text = await res.text();
        console.log("📡 WHATSAPP RESPONSE:", text);

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: { message: text } };
        }

        if (res.ok) {
          sent++;
          console.log("✅ SENT:", digits, name);

          await saveLead(
            digits,
            templateName,
            name,
            "Campaign",
            "Sent"
          );
        } else {
          failed++;
          console.error("❌ FAILED:", digits, data);
        }

        // ⏱ delay (safe sending)
        await new Promise((r) => setTimeout(r, 700));
      } catch (err) {
        failed++;
        console.error("❌ LOOP ERROR:", err);
      }
    }

    // ==========================
    // FINAL RESPONSE
    // ==========================
    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: contacts.length,
    });
  } catch (error: any) {
    console.error("🔥 API ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}