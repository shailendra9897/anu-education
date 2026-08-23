// FILE: lib/whatsapp/signature.ts
//
// ─────────────────────────────────────────────────────────────────
// X-Hub-Signature-256 validation for Meta webhook POSTs.
//
// Meta signs every webhook payload with HMAC-SHA256 using the App
// Secret and sends it as:  X-Hub-Signature-256: sha256=<hexdigest>
//
// Behavior (R2 hardening):
//   - PRODUCTION (NODE_ENV=production): WHATSAPP_APP_SECRET is
//     REQUIRED. If missing → "rejected_missing_production_secret"
//     and the route must refuse the webhook with a server error.
//     Unsigned production payloads are NEVER processed.
//   - DEVELOPMENT/TEST: the secret may be absent for local work;
//     verification is then skipped ONCE-warned ("skipped_development")
//     so local testing stays possible. This downgrade is explicit and
//     only reachable outside production.
//   - Secret configured → invalid/missing signature → rejected.
//
// Comparison is timing-safe (crypto.timingSafeEqual).
// ─────────────────────────────────────────────────────────────────

import crypto from "crypto";
import { getWhatsAppAppSecret } from "./config";

let warnedMissingSecret = false;

export type SignatureCheckResult =
  | "verified"
  | "invalid"
  | "skipped_development"
  | "rejected_missing_production_secret";

export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null
): SignatureCheckResult {
  const appSecret = getWhatsAppAppSecret();

  if (!appSecret) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[WhatsApp Webhook] WHATSAPP_APP_SECRET is not configured in production — rejecting unsigned webhook"
      );
      return "rejected_missing_production_secret";
    }

    if (!warnedMissingSecret) {
      console.warn(
        "[WhatsApp Webhook] WHATSAPP_APP_SECRET not set — development mode: payload signature verification is DISABLED (never the case in production)"
      );
      warnedMissingSecret = true;
    }
    return "skipped_development";
  }

  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return "invalid";
  }

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader, "utf8");

  // Equal-length requirement of timingSafeEqual; length mismatch is
  // itself proof of an invalid signature.
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return "invalid";
  }

  return "verified";
}
