import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { saveLead } from "@/lib/saveLead";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;
const API_SECRET = process.env.BULK_API_SECRET;

// Simple in‑memory rate limiter
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 500;
const RATE_WINDOW = 60 * 60 * 1000;

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(identifier);
  if (!record || now > record.resetTime) {
    rateLimit.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }
  if (record.count >= RATE_LIMIT) return true;
  record.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const authHeader = req.headers.get("authorization");
    if (API_SECRET && authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    let numbers: string[] = [];
    let contacts: Array<{ name: string; phone: string }> = [];

    // Support both old (numbers) and new (contacts) formats
    if (body.contacts && Array.isArray(body.contacts)) {
      contacts = body.contacts;
      numbers = contacts.map(c => c.phone);
    } else if (body.numbers && Array.isArray(body.numbers)) {
      numbers = body.numbers;
      contacts = numbers.map(phone => ({ name: "Student", phone }));
    } else {
      return NextResponse.json(
        { success: false, error: "Missing contacts or numbers array" },
        { status: 400 }
      );
    }

    const templateName: string = body.templateName;
    const templateVariables: Record<string, string> = body.templateVariables || {};

    if (!numbers.length || !templateName) {
      return NextResponse.json(
        { success: false, error: "Missing numbers or templateName" },
        { status: 400 }
      );
    }

    // Rate limiting
    const userIp = req.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(userIp)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    // Validate and clean phone numbers
    const validContacts = contacts
      .map((contact) => {
        let digits = contact.phone.replace(/\D/g, "");
        if (digits.length === 10) digits = "91" + digits;
        if (digits.length === 12 && digits.startsWith("91")) return { ...contact, phone: digits };
        return null;
      })
      .filter((c): c is { name: string; phone: string } => c !== null);

    if (validContacts.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid Indian mobile numbers found" },
        { status: 400 }
      );
    }

    // Prepare template components
    const hasVariables = Object.keys(templateVariables).length > 0;
    const templateComponents = hasVariables
      ? [
          {
            type: "body",
            parameters: Object.values(templateVariables).map((value) => ({
              type: "text",
              text: value,
            })),
          },
        ]
      : [];

    let sent = 0;
    let failed = 0;
    const results: Array<{ phone: string; status: string; error?: string }> = [];

    for (const contact of validContacts) {
      try {
        const payload: any = {
          messaging_product: "whatsapp",
          to: contact.phone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
          },
        };
        if (templateComponents.length) {
          payload.template.components = templateComponents;
        }

        const response = await fetch(
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

        const responseData = await response.json();

        if (response.ok) {
          sent++;
          results.push({ phone: contact.phone, status: "sent" });
          // Save lead with template name and optional name field
          await saveLead(
            contact.phone,
            templateName,
            `Sent to ${contact.name} using template: ${templateName}`,
            "Campaign",
            "Sent"
          );
        } else {
          failed++;
          const errorMsg = responseData.error?.message || "WhatsApp API error";
          results.push({ phone: contact.phone, status: "failed", error: errorMsg });
          console.error(`Failed for ${contact.phone}:`, errorMsg);
        }

        // Delay between messages
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err: any) {
        failed++;
        results.push({ phone: contact.phone, status: "failed", error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: validContacts.length,
      results,
    });
  } catch (error: any) {
    console.error("Bulk send error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}