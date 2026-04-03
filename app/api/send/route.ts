import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { saveLead } from "@/lib/saveLead";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;
const API_SECRET = process.env.BULK_API_SECRET; // optional: protect endpoint

// Simple in‑memory rate limiter (per IP / user)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 500; // messages per hour per user
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

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
    // 1. Authentication (optional but recommended)
    const authHeader = req.headers.get("authorization");
    if (API_SECRET && authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse and validate input
    const body = await req.json();
    const numbers: string[] = body.numbers || [];
    const templateName: string = body.templateName;
    const templateVariables: Record<string, string> = body.templateVariables || {};

    if (!numbers.length || !templateName) {
      return NextResponse.json(
        { success: false, error: "Missing numbers or templateName" },
        { status: 400 }
      );
    }

    // Optional: get user identifier from header or IP for rate limiting
    const userIp = req.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(userIp)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    // 3. Validate phone numbers (Indian format)
    const validNumbers = numbers.filter((num) => {
      const digits = num.replace(/\D/g, "");
      return digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
    }).map((num) => {
      let digits = num.replace(/\D/g, "");
      if (digits.length === 10) digits = "91" + digits;
      return digits;
    });

    if (validNumbers.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid Indian mobile numbers found" },
        { status: 400 }
      );
    }

    // 4. Prepare template components (if variables are provided)
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

    // 5. Send messages with delay
    let sent = 0;
    let failed = 0;
    const results: Array<{ phone: string; status: string; error?: string }> = [];

    for (const phone of validNumbers) {
      try {
        const payload: any = {
          messaging_product: "whatsapp",
          to: phone,
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
          results.push({ phone, status: "sent" });
          // Save successful lead
          await saveLead(
            phone,
            templateName,
            templateName,
            "Campaign",
            "Sent"
          );
        } else {
          failed++;
          const errorMsg = responseData.error?.message || "WhatsApp API error";
          results.push({ phone, status: "failed", error: errorMsg });
          console.error(`Failed for ${phone}:`, errorMsg);
        }

        // Delay to respect WhatsApp rate limits (adjust as needed)
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second between messages
      } catch (err: any) {
        failed++;
        results.push({ phone, status: "failed", error: err.message });
      }
    }

    // 6. Return summary
    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: validNumbers.length,
      results, // optional: include details for debugging
    });
  } catch (error: any) {
    console.error("Bulk send error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}