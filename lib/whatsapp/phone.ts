// FILE: lib/whatsapp/phone.ts
//
// ─────────────────────────────────────────────────────────────────
// Safe phone normalization for WhatsApp Cloud API.
//
// Two canonical forms exist in this codebase:
//
//   1. DB storage (Conversation.phone) → E.164 with "+", e.g.
//      "+919428186817" — matches prisma/schema.prisma comment and is
//      what findOrCreateConversation() looks up by exact string match.
//
//   2. Meta Graph API `to` field → digits only, no "+", e.g.
//      "919428186817".
//
// Indian numbers (ANU Education's market) are handled explicitly:
//   10 digits starting 6-9  → domestic mobile, prefix "91"
//   11 digits starting "0"  → trunk-prefixed, strip "0", prefix "91"
//   12 digits starting "91" → already E.164 digits
// Other lengths 8–15 digits are passed through as international
// numbers when they arrive with a leading "+".
// ─────────────────────────────────────────────────────────────────

export type PhoneNormalizationResult =
  | { ok: true; digits: string; e164: string }
  | { ok: false; reason: string };

/**
 * normalizeIndianPhone
 * ────────────────────
 * Accepts any reasonable human/app input ("+91 94281 86817",
 * "9428186817", "09428186817", "919428186817") and returns both the
 * Graph API form (`digits`, no "+") and the storage form (`e164`,
 * with "+"). Never throws; returns { ok:false } for unusable input.
 */
export function normalizeIndianPhone(input: unknown): PhoneNormalizationResult {
  if (typeof input !== "string") {
    return { ok: false, reason: "phone must be a string" };
  }

  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return { ok: false, reason: "phone contains no digits" };
  }

  // International dialing prefixes ("0011...", "011..." style) are not
  // used in India for mobiles; treat a lone leading zero as trunk code.
  if (digits.startsWith("00")) {
    digits = digits.replace(/^0+/, "");
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    // Domestic Indian mobile — add country code.
    digits = `91${digits}`;
  } else if (digits.length === 12 && digits.startsWith("91")) {
    // Already includes India country code.
  } else if (
    !hasPlus &&
    !(digits.length >= 8 && digits.length <= 15)
  ) {
    return {
      ok: false,
      reason: `unsupported phone length after normalization (${digits.length} digits)`,
    };
  }

  if (hasPlus && digits.length > 15) {
    return { ok: false, reason: "phone exceeds E.164 maximum of 15 digits" };
  }

  return { ok: true, digits, e164: `+${digits}` };
}

/**
 * waIdToE164Phone
 * ───────────────
 * Converts Meta's `from` / `wa_id` value (always digits-only MSISDN,
 * e.g. "919428186817") into the E.164-with-plus form stored in
 * Conversation.phone.
 */
export function waIdToE164Phone(waId: string): string | null {
  const normalized = normalizeIndianPhone(waId);
  return normalized.ok ? normalized.e164 : null;
}
