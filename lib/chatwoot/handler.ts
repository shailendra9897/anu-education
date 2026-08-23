// FILE: lib/chatwoot/handler.ts
//
// ─────────────────────────────────────────────────────────────────
// SHARED CHATWOOT WEBHOOK HANDLER (Task 6B — observe-only)
//
// Transport-level concerns shared by the route controllers:
//   • URL-path secret authentication (timing-safe, fail-closed)
//   • JSON parsing (HTTP 400 on garbage)
//   • classification dispatch (payload.ts) → structured logs
//
// OBSERVE-ONLY GUARANTEES (enforced by tests/chatwoot.webhook.test.ts):
//   no database writes, no AI/Groq calls, no Chatwoot API calls,
//   no Evolution/WhatsApp sends, no idempotency store usage.
//
// LOG HYGIENE: never logs the webhook secret, request headers, env
// values or message content. Phone numbers ARE logged because they
// are operationally required to correlate observations with the
// existing WhatsApp webhook trail (same convention as Task 19).
// ─────────────────────────────────────────────────────────────────

import crypto from "crypto";
import { NextResponse } from "next/server";

import { getChatwootInboxId, getChatwootWebhookSecret } from "./config";
import { classifyChatwootMessageEvent } from "./payload";

/** Minimal request shape actually consumed (eases unit testing). */
interface TextBodyRequest {
  text(): Promise<string>;
}

let warnedMissingSecret = false;

/**
 * Timing-safe equality over SHA-256 digests. Hashing first avoids
 * length leakage and makes the comparison well-defined for any pair
 * of inputs.
 */
function secretsMatch(provided: string, expected: string): boolean {
  const digestProvided = crypto
    .createHash("sha256")
    .update(provided)
    .digest();
  const digestExpected = crypto
    .createHash("sha256")
    .update(expected)
    .digest();
  return crypto.timingSafeEqual(digestProvided, digestExpected);
}

export async function handleChatwootWebhookPost(
  req: TextBodyRequest,
  providedSecret: string | null | undefined
): Promise<NextResponse> {
  // ── Authentication — fail closed ────────────────────────────────
  const expectedSecret = getChatwootWebhookSecret();

  if (!expectedSecret) {
    // Misconfiguration must never open the endpoint; stay loud once.
    if (!warnedMissingSecret) {
      console.warn("[Chatwoot Webhook] rejected", {
        reason: "secret_not_configured",
      });
      warnedMissingSecret = true;
    }
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  if (
    typeof providedSecret !== "string" ||
    providedSecret.length === 0 ||
    !secretsMatch(providedSecret, expectedSecret)
  ) {
    // Never echo the provided value back to logs or response.
    console.warn("[Chatwoot Webhook] rejected", {
      reason: "invalid_secret",
    });
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  // ── Body parsing ────────────────────────────────────────────────
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    console.warn("[Chatwoot Webhook] rejected", {
      reason: "unreadable_body",
    });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.warn("[Chatwoot Webhook] rejected", { reason: "malformed_json" });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // ── Classification (observe-only) ───────────────────────────────
  const result = classifyChatwootMessageEvent(payload, getChatwootInboxId());

  if (!result.ok) {
    console.log("[Chatwoot Webhook] ignored", { reason: result.reason });
    return NextResponse.json(
      { ok: true, outcome: "ignored" },
      { status: 200 }
    );
  }

  const { messageId, conversationId, inboxId, phone } = result.observed;
  console.log("[Chatwoot Webhook] observed", {
    messageId,
    conversationId,
    inboxId,
    phone,
    event: "message_created",
  });

  return NextResponse.json(
    { ok: true, outcome: "observed" },
    { status: 200 }
  );
}
