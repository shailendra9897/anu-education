// FILE: lib/whatsapp/send.ts
//
// ─────────────────────────────────────────────────────────────────
// PHASE 6 — OUTBOUND WHATSAPP UTILITY (conversational replies only)
//
// sendWhatsAppText(phone, text) sends a plain WhatsApp text reply via
// the Meta Cloud API using:
//   WHATSAPP_TOKEN              → bearer token
//   WHATSAPP_PHONE_NUMBER_ID    → sending identity (legacy
//                                 PHONE_NUMBER_ID also accepted)
//   WHATSAPP_GRAPH_API_VERSION  → Graph version, single source of
//                                 truth (defaults to v21.0)
//
// This is the SHARED conversational outbound sender (AI replies, Meta/
// Evolution flows). It is deliberately separate from the bulk campaign
// surfaces (app/api/send, /api/send-bulk, /admin, /admin/whatsapp,
// /admin/bulk, /admin/send-template) which were AUDITED and REMOVED in
// S6-D3 as obsolete marketing templates, along with their /api/send-template
// dead reference. getDemoReminderReadiness / /api/reminder remain.
//
// SECURITY: access tokens are never logged; Meta error bodies are
// truncated to their message field so tokens cannot leak through
// echoed payloads.
// ─────────────────────────────────────────────────────────────────

import {
  getWhatsAppGraphVersion,
  getWhatsAppPhoneNumberId,
  getWhatsAppToken,
} from "./config";
import { normalizeIndianPhone } from "./phone";

/** Meta hard limit for a WhatsApp text message body. */
const MAX_TEXT_LENGTH = 4096;
const REQUEST_TIMEOUT_MS = 15_000;

export type SendWhatsAppResult =
  | { ok: true; toDigits: string; messageId: string | null }
  | { ok: false; toDigits: string | null; error: string };

export async function sendWhatsAppText(
  phone: string,
  text: string
): Promise<SendWhatsAppResult> {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized.ok) {
    return { ok: false, toDigits: null, error: `invalid phone: ${normalized.reason}` };
  }

  const body = text?.length > MAX_TEXT_LENGTH ? `${text.slice(0, MAX_TEXT_LENGTH - 3)}...` : text;

  const token = getWhatsAppToken();
  const phoneNumberId = getWhatsAppPhoneNumberId();
  if (!token || !phoneNumberId) {
    console.error("[WhatsApp Send] missing WHATSAPP_TOKEN or phone number id configuration");
    return { ok: false, toDigits: normalized.digits, error: "whatsapp not configured" };
  }

  const url = `https://graph.facebook.com/${getWhatsAppGraphVersion()}/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalized.digits,
        type: "text",
        text: { preview_url: false, body },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const rawText = await response.text();

    if (!response.ok) {
      // Extract only the human-readable message; never surface or log
      // the full body/headers which could contain sensitive context.
      let reason = `HTTP ${response.status}`;
      try {
        const parsed = JSON.parse(rawText) as { error?: { message?: string } };
        if (parsed.error?.message) {
          reason += `: ${parsed.error.message.slice(0, 300)}`;
        }
      } catch {
        // Non-JSON error body — keep status-only reason.
      }
      console.error(`[WhatsApp Send] failed to ${normalized.digits}: ${reason}`);
      return { ok: false, toDigits: normalized.digits, error: reason };
    }

    let messageId: string | null = null;
    try {
      const parsed = JSON.parse(rawText) as {
        messages?: { id?: string }[];
      };
      messageId = parsed.messages?.[0]?.id ?? null;
    } catch {
      // 2xx with unexpected shape — still treat as delivered.
    }

    return { ok: true, toDigits: normalized.digits, messageId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown network error";
    console.error(
      `[WhatsApp Send] network failure to ${normalized.digits}: ${message}`
    );
    return { ok: false, toDigits: normalized.digits, error: message };
  }
}
