// FILE: lib/whatsapp/evolution.handler.ts
//
// ─────────────────────────────────────────────────────────────────
// EVOLUTION WEBHOOK HANDLER — inbound transport adapter
//
// Transport-level concerns shared by the route controllers:
//   • authentication (fail-closed, timing-safe)
//   • JSON parsing (HTTP 400 on garbage)
//   • classification dispatch (evolution.payload.ts)
//   • idempotency claim / release
//   • conversation resolution (shared store)
//   • profile-name enrichment
//   • ownership safety gate
//   • inbound student message persistence
//   • ANU AI activation (UNASSIGNED only) + Evolution send
//
// FLOW:
//   authenticate → classify → idempotency → find/create Conversation
//   → profile name → ownership gate → save inbound → if
//   ASSIGNED/HANDED_OFF STOP → if UNASSIGNED: run existing ANU AI
//   adapter, send via Evolution.
//
// The ANU AI pipeline is NEVER re-implemented here: this handler is
// only a third transport adapter (Meta webhook / Chatwoot webhook /
// Evolution webhook) over the SAME shared pipeline and the SAME
// outbound Evolution helper the Chatwoot bridge uses.
//
// SINGLE-WRITE GUARANTEE (identical to the Chatwoot bridge):
//   ASSIGNED / HANDED_OFF → handler saves the inbound USER message here.
//   UNASSIGNED            → the AI adapter saves BOTH the USER and the
//     ASSISTANT message itself; the handler does NOT save the inbound
//     message on this path. Exactly ONE inbound row in every branch.
//
// AUTHENTICATION (fail-closed; never logs secrets):
//   1. When EVOLUTION_WEBHOOK_SECRET is configured, it is the
//      authoritative mechanism: the secret travels in the URL path
//      (/api/webhook/evolution/<secret>) and is compared timing-safely.
//   2. When it is NOT configured but EVOLUTION_API_KEY is present, the
//      Evolution-native `apikey` request header is compared timing-safely
//      (Evolution attaches this header to every webhook delivery).
//   3. Neither → the webhook fails closed (HTTP 403, loud).
//
// SECURITY:
//   • never logs the webhook secret / API key
//   • never logs message content
//   • phone logged in masked form only
//   • message ID and conversation ID may appear in operational logs
// ─────────────────────────────────────────────────────────────────

import crypto from "crypto";
import { NextResponse } from "next/server";

import { getEvolutionApiKey, getEvolutionWebhookSecret } from "./evolution.config";
import { classifyEvolutionMessageEvent } from "./evolution.payload";
import {
  claimEvolutionMessageProcessing,
  releaseEvolutionMessageClaim,
  type EvolutionIdempotencyDeps,
} from "./evolution.idempotency";
import { findOrCreateConversation } from "../chat/conversation.service";
import { getConversationOwnership } from "../staff/assignment.service";
import prisma from "../prisma";
import type { EvolutionSendResult } from "./evolution.send";

// ── PORTS ────────────────────────────────────────────────────────

export type EvolutionConversation = {
  id: string;
  phone: string | null;
  name: string | null;
};

export type EvolutionOwnership = "UNASSIGNED" | "ASSIGNED" | "HANDED_OFF";

export type EvolutionBridgeDeps = {
  findOrCreateConversation(input: {
    phone?: string;
    source: "WHATSAPP";
    sourcePage?: string;
  }): Promise<{ conversation: EvolutionConversation; created: boolean }>;
  getOwnership(conversationId: string): Promise<EvolutionOwnership>;
  saveUserMessage(conversationId: string, content: string): Promise<unknown>;
  updateProfileNameIfMissing(
    conversationId: string,
    profileName: string
  ): Promise<unknown>;
  /** Runs the existing ANU AI pipeline (saves USER + ASSISTANT itself). */
  runAiPipeline(conversation: EvolutionConversation, userMessage: string): Promise<string>;
  /** Sends the reply via the shared Evolution helper (evolution.send.ts). */
  sendEvolutionWhatsAppText(phone: string, reply: string): Promise<EvolutionSendResult>;
  /**
   * Optional AI rate-limit gate (per conversation and/or phone). When
   * supplied and returning true, the AI pipeline is NOT invoked: the
   * claim is released and the transport answers HTTP 429 so Evolution
   * backs off and re-delivers later.
   */
  checkRateLimit?(conversationId: string, phone: string): Promise<boolean>;
  claims?: EvolutionIdempotencyDeps;
};

function defaultBridgeDeps(): EvolutionBridgeDeps {
  return {
    findOrCreateConversation: async (input) => {
      const result = await findOrCreateConversation(input);
      return {
        conversation: {
          id: result.conversation.id,
          phone: result.conversation.phone,
          name: result.conversation.name,
        },
        created: result.created,
      };
    },
    getOwnership: (conversationId) => getConversationOwnership(conversationId),
    saveUserMessage: (conversationId, content) =>
      prisma.message.create({
        data: { conversationId, role: "USER", content },
      }),
    updateProfileNameIfMissing: (conversationId, profileName) =>
      prisma.conversation.update({
        where: { id: conversationId },
        data: { name: profileName },
      }),
    runAiPipeline: async (conversation, userMessage) => {
      // Lazy-load so tests can import the handler without requiring
      // GROQ_API_KEY / any external AI configuration at module load.
      const { runAnuAiPipelineForWhatsApp } = await import(
        "../whatsapp/ai-adapter.service"
      );
      return runAnuAiPipelineForWhatsApp(conversation as never, userMessage);
    },
    sendEvolutionWhatsAppText: async (phone, reply) => {
      const { sendEvolutionWhatsAppText } = await import(
        "../whatsapp/evolution.send"
      );
      return sendEvolutionWhatsAppText(phone, reply);
    },
    checkRateLimit: async (conversationId, phone) => {
      // Lazy-loaded (same pattern as runAiPipeline) so module load never
      // requires a database connection / env vars. Reuses the EXACT shared
      // limiter used by the website chat / Meta / Chatwoot — one set of
      // throttles for every AI entry point.
      const { checkChatRateLimit } = await import("../ai/rateLimiter");
      return (await checkChatRateLimit({ conversationId, ip: phone })).limited;
    },
  };
}

// ── REQUEST SHAPE ────────────────────────────────────────────────

/** Minimal request shape actually consumed (eases unit testing). */
interface EvolutionWebhookRequest {
  text(): Promise<string>;
  headers: { get(name: string): string | null };
}

// ── LOGGING HELPERS ─────────────────────────────────────────────

function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "unknown";
  const digits = phone.replace(/\D/g, "");
  return digits.length <= 4
    ? "***"
    : `${digits.slice(0, 2)}****${digits.slice(-4)}`;
}

// ── AUTH ─────────────────────────────────────────────────────────

export type EvolutionAuthSecrets = {
  webhookSecret: string | null;
  apiKey: string | null;
};

export type EvolutionAuthResult = "ok" | "invalid" | "unconfigured";

/** Lazy env read so tests can toggle configuration between cases. */
export function getEvolutionAuthSecrets(): EvolutionAuthSecrets {
  return {
    webhookSecret: getEvolutionWebhookSecret(),
    apiKey: getEvolutionApiKey(),
  };
}

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

/**
 * verifyEvolutionAuth
 * ───────────────────
 * Pure, fail-closed decision. Precedence:
 *   1. EVOLUTION_WEBHOOK_SECRET configured → URL-path secret is checked.
 *   2. Else EVOLUTION_API_KEY configured   → Evolution-native `apikey`
 *      request header is checked.
 *   3. Else                                → "unconfigured" (loud 403).
 * Never logs either secret.
 */
export function verifyEvolutionAuth(
  providedPathSecret: string | null | undefined,
  providedHeaderApikey: string | null,
  secrets: EvolutionAuthSecrets
): EvolutionAuthResult {
  if (secrets.webhookSecret) {
    return typeof providedPathSecret === "string" &&
      providedPathSecret.length > 0 &&
      secretsMatch(providedPathSecret, secrets.webhookSecret)
      ? "ok"
      : "invalid";
  }

  if (secrets.apiKey) {
    return typeof providedHeaderApikey === "string" &&
      providedHeaderApikey.length > 0 &&
      secretsMatch(providedHeaderApikey, secrets.apiKey)
      ? "ok"
      : "invalid";
  }

  return "unconfigured";
}

// ── HANDLER ──────────────────────────────────────────────────────

export async function handleEvolutionWebhookPost(
  req: EvolutionWebhookRequest,
  providedSecret: string | null | undefined,
  bridgeDeps?: EvolutionBridgeDeps
): Promise<NextResponse> {
  // ── Authentication — fail closed ────────────────────────────────
  const headerApikey = req.headers.get("apikey");
  const auth = verifyEvolutionAuth(
    providedSecret,
    headerApikey,
    getEvolutionAuthSecrets()
  );

  if (auth === "unconfigured") {
    console.error(
      "[Evolution Webhook] rejected",
      { reason: "secret_not_configured" }
    );
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  if (auth !== "ok") {
    console.warn("[Evolution Webhook] rejected", { reason: "invalid_secret" });
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  // ── Body parsing ────────────────────────────────────────────────
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    console.warn("[Evolution Webhook] rejected", { reason: "unreadable_body" });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.warn("[Evolution Webhook] rejected", { reason: "malformed_json" });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // ── Classification ─────────────────────────────────────────────
  const result = classifyEvolutionMessageEvent(payload);

  if (!result.ok) {
    if (result.reason === "group_message") {
      console.log("[Evolution Webhook] ignored", { reason: "group_message" });
      return NextResponse.json(
        { ok: true, outcome: "group_message" },
        { status: 200 }
      );
    }
    console.log("[Evolution Webhook] ignored", { reason: result.reason });
    return NextResponse.json(
      { ok: true, outcome: "ignored" },
      { status: 200 }
    );
  }

  const { messageId, textBody, senderPhoneE164, pushName } = result.observed;

  console.log("[Evolution Webhook] observed", {
    messageId,
    instance: result.observed.instance,
    phone: maskPhone(senderPhoneE164),
    event: result.observed.eventName,
  });

  // ── Bridge processing ──────────────────────────────────────────
  const deps = bridgeDeps ?? defaultBridgeDeps();

  // 1. Idempotency claim (one Baileys message id → at most one reply).
  const claimed = await claimEvolutionMessageProcessing(messageId, deps.claims);
  if (!claimed) {
    console.log("[Evolution Webhook] duplicate", { messageId });
    return NextResponse.json(
      { ok: true, outcome: "duplicate" },
      { status: 200 }
    );
  }

  // ── Guard: no reply destination (phone) ────────────────────────
  // The classifier guarantees a normalized E.164 sender, but a future
  // classifier change must not silently route an unreplyable inbound.
  if (!senderPhoneE164) {
    console.warn("[Evolution Webhook] no_phone — releasing claim", {
      messageId,
    });
    await releaseEvolutionMessageClaim(messageId, deps.claims);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // 2. Conversation resolution + bridge processing.
  //    On genuine failure BEFORE an outbound reply exists, release the
  //    claim so Evolution can retry. Once a reply has been sent (or a
  //    send may have reached the student), the claim is KEPT.
  try {
    // 2a. Find or create shared Conversation (source=WHATSAPP).
    const { conversation } = await deps.findOrCreateConversation({
      phone: senderPhoneE164,
      source: "WHATSAPP",
      sourcePage: "/whatsapp",
    });

    console.log("[Evolution Webhook] conversation", {
      messageId,
      conversationId: conversation.id,
      phone: maskPhone(senderPhoneE164),
    });

    // 2b. Best-effort profile-name enrichment (never overwrite).
    if (pushName && !conversation.name) {
      try {
        await deps.updateProfileNameIfMissing(conversation.id, pushName);
      } catch (error) {
        console.warn(
          "[Evolution Webhook] profile-name enrichment skipped",
          error instanceof Error ? error.message : error
        );
      }
    }

    // 2c. Ownership safety gate (MUST precede any AI decision).
    const ownership = await deps.getOwnership(conversation.id);

    // 2d. Ownership branch.
    // ASSIGNED / HANDED_OFF: save inbound message, NEVER invoke AI.
    if (ownership !== "UNASSIGNED") {
      await deps.saveUserMessage(conversation.id, textBody);
      if (ownership === "ASSIGNED") {
        console.log("[Evolution Webhook] assigned — AI skipped", {
          messageId,
          conversationId: conversation.id,
        });
        return NextResponse.json(
          { ok: true, outcome: "ai_skipped_assigned" },
          { status: 200 }
        );
      }
      console.log("[Evolution Webhook] handed off — AI skipped", {
        messageId,
        conversationId: conversation.id,
      });
      return NextResponse.json(
        { ok: true, outcome: "ai_skipped_handed_off" },
        { status: 200 }
      );
    }

    // ── UNASSIGNED: activate the existing ANU AI pipeline ────────
    // The AI adapter saves BOTH the USER and ASSISTANT messages itself;
    // we must NOT save the inbound message here (single-write, same
    // rule as the Chatwoot bridge). Ownership is already verified
    // UNASSIGNED above — never delegated to the AI.

    // 2e. AI rate-limit gate. Runs ONLY for UNASSIGNED threads. When
    //     limited: do NOT run the AI, do NOT save any message, release
    //     the claim, and answer 429 so Evolution redelivers later. The
    //     claim release is safe — nothing was persisted and no outbound
    //     reply exists, so a retry cannot duplicate anything.
    if (deps.checkRateLimit) {
      const limited = await deps.checkRateLimit(conversation.id, senderPhoneE164);
      if (limited) {
        console.log("[Evolution Webhook] rate limited — deferred", {
          messageId,
          conversationId: conversation.id,
        });
        await releaseEvolutionMessageClaim(messageId, deps.claims);
        return NextResponse.json(
          { ok: false, outcome: "rate_limited" },
          { status: 429 }
        );
      }
    }

    // 2f. AI failure → release claim, HTTP 500, no Evolution send.
    let reply: string;
    try {
      reply = await deps.runAiPipeline(conversation, textBody);
    } catch (error) {
      console.error("[Evolution Webhook] AI failure — releasing claim", {
        messageId,
        conversationId: conversation.id,
        reason: error instanceof Error ? error.message : String(error),
      });
      await releaseEvolutionMessageClaim(messageId, deps.claims);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    // 2g. Evolution send — failure AFTER AI must NOT release the claim
    //     (the reply may have reached the student; retrying risks a
    //     duplicate). Return 200 reply_failed instead.
    const send = await deps.sendEvolutionWhatsAppText(senderPhoneE164, reply);

    if (!send.ok) {
      console.error("[Evolution Webhook] Evolution send failed", {
        messageId,
        conversationId: conversation.id,
        reason: send.error,
      });
      return NextResponse.json(
        { ok: true, outcome: "reply_failed" },
        { status: 200 }
      );
    }

    console.log("[Evolution Webhook] replied", {
      messageId,
      conversationId: conversation.id,
      evolutionMessageId: send.messageId ?? null,
    });
    return NextResponse.json(
      { ok: true, outcome: "replied" },
      { status: 200 }
    );
  } catch (error) {
    // Genuine processing failure BEFORE any outbound reply.
    // Release claim so Evolution can retry.
    await releaseEvolutionMessageClaim(messageId, deps.claims);
    console.error("[Evolution Webhook] processing failure", {
      messageId,
      reason: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}