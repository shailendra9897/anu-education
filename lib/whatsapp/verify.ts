// FILE: lib/whatsapp/verify.ts
//
// ─────────────────────────────────────────────────────────────────
// Meta webhook subscription verification (GET /api/webhook/whatsapp).
//
// Meta calls the webhook URL once with query parameters:
//   hub.mode         = "subscribe"
//   hub.verify_token = the token you typed into the Meta App dashboard
//   hub.challenge    = opaque string that must be echoed back verbatim
//
// Success  → HTTP 200, body is exactly the challenge (plain text).
// Mismatch → HTTP 403.
//
// Pure logic lives here so it can be unit-tested without Next.js.
// ─────────────────────────────────────────────────────────────────

export type WebhookVerificationParams = {
  mode: string | null;
  verifyToken: string | null;
  challenge: string | null;
};

export type WebhookVerificationResult =
  | { ok: true; challenge: string }
  | { ok: false };

export function verifyWebhookSubscription(
  params: WebhookVerificationParams,
  expectedVerifyToken: string | null
): WebhookVerificationResult {
  if (!expectedVerifyToken) {
    // Misconfiguration — never accept verification without a secret.
    console.error(
      "[WhatsApp Webhook] WHATSAPP_VERIFY_TOKEN is not configured; cannot verify subscription"
    );
    return { ok: false };
  }

  if (
    params.mode === "subscribe" &&
    params.verifyToken === expectedVerifyToken &&
    typeof params.challenge === "string"
  ) {
    return { ok: true, challenge: params.challenge };
  }

  return { ok: false };
}
