// FILE: lib/chatwoot/handler.ts
//
// ─────────────────────────────────────────────────────────────────
// CHATWOOT WEBHOOK HANDLER — Phase 3 (bridge: ingest + ownership + AI)
//
// Transport-level concerns shared by the route controllers:
//   • URL-path secret authentication (timing-safe, fail-closed)
//   • JSON parsing (HTTP 400 on garbage)
//   • classification dispatch (payload.ts)
//   • idempotency claim / release
//   • conversation resolution (shared store)
//   • profile-name enrichment
//   • ownership safety gate
//   • inbound student message persistence
//   • ANU AI activation (UNASSIGNED only) + Evolution send
//
// FLOW:
//   classify → idempotency → find/create Conversation → profile name →
//   ownership gate → save inbound → if ASSIGNED/HANDED_OFF STOP →
//   if UNASSIGNED: run existing ANU AI adapter, send via Evolution.
//
// SINGLE-WRITE GUARANTEE:
//   ASSIGNED / HANDED_OFF → handler saves the inbound USER message here.
//   UNASSIGNED            → the AI adapter saves BOTH the USER and the
//     ASSISTANT message itself; the handler does NOT save the inbound
//     message on this path. Exactly ONE inbound row in every branch.
//
// SECURITY:
//   • never logs the webhook secret
//   • never logs message content
//   • never logs API tokens
//   • phone logged in masked form only
//   • message ID and conversation ID may appear in operational logs
// ─────────────────────────────────────────────────────────────────

import crypto from "crypto";
import { NextResponse } from "next/server";

import { getChatwootInboxId, getChatwootWebhookSecret } from "./config";
import { classifyChatwootMessageEvent } from "./payload";
import {
  claimChatwootMessageProcessing,
  releaseChatwootMessageClaim,
  type ChatwootIdempotencyDeps,
} from "./idempotency";
import { findOrCreateConversation } from "../chat/conversation.service";
import { getConversationOwnership } from "../staff/assignment.service";
import prisma from "../prisma";
import type { EvolutionSendResult } from "../whatsapp/evolution.send";

// ── PORTS ────────────────────────────────────────────────────────

export type ChatwootConversation = {
  id: string;
  phone: string | null;
  name: string | null;
};

export type ChatwootOwnership = "UNASSIGNED" | "ASSIGNED" | "HANDED_OFF";

export type ChatwootBridgeDeps = {
  findOrCreateConversation(input: {
    phone?: string;
    source: "WHATSAPP";
    sourcePage?: string;
  }): Promise<{ conversation: ChatwootConversation; created: boolean }>;
  getOwnership(conversationId: string): Promise<ChatwootOwnership>;
  saveUserMessage(
    conversationId: string,
    content: string
  ): Promise<unknown>;
  updateProfileNameIfMissing(
    conversationId: string,
    profileName: string
  ): Promise<unknown>;
  /** Runs the existing ANU AI pipeline (saves USER + ASSISTANT itself). */
  runAiPipeline(
    conversation: ChatwootConversation,
    userMessage: string
  ): Promise<string>;
  /** Sends the reply via Evolution API. */
  sendEvolutionWhatsAppText(
    phone: string,
    reply: string
  ): Promise<EvolutionSendResult>;
  /**
   * Phase 1 — optional AI rate-limit gate (per conversation and/or phone).
   * When supplied and returning true, the AI pipeline is NOT invoked for
   * this message: the claim is released and the transport answers HTTP
   * 429 so Chatwoot/Meta backs off, re-delivering later when quota is
   * available.
   */
  checkRateLimit?(conversationId: string, phone: string): Promise<boolean>;
  claims?: ChatwootIdempotencyDeps;
};

function defaultBridgeDeps(): ChatwootBridgeDeps {
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
    getOwnership: (conversationId) =>
      getConversationOwnership(conversationId),
    saveUserMessage: (conversationId, content) =>
      prisma.message.create({
        data: {
          conversationId,
          role: "USER",
          content,
        },
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
      // requires a database connection / env vars (rateLimiter imports
      // prisma). Reuses the EXACT shared limiter used by the website chat
      // route — one set of throttles for every AI entry point.
      const { checkChatRateLimit } = await import("../ai/rateLimiter");
      return (await checkChatRateLimit({ conversationId, ip: phone })).limited;
    },
  };
}

// ── REQUEST SHAPE ────────────────────────────────────────────────

/** Minimal request shape actually consumed (eases unit testing). */
interface TextBodyRequest {
  text(): Promise<string>;
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

let warnedMissingSecret = false;

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

// ── HANDLER ──────────────────────────────────────────────────────

export async function handleChatwootWebhookPost(
  req: TextBodyRequest,
  providedSecret: string | null | undefined,
  bridgeDeps?: ChatwootBridgeDeps
): Promise<NextResponse> {
  // ── Authentication — fail closed ────────────────────────────────
  const expectedSecret = getChatwootWebhookSecret();

  if (!expectedSecret) {
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
    console.warn("[Chatwoot Webhook] rejected", {
      reason: "malformed_json",
    });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // ── Classification ─────────────────────────────────────────────
  const result = classifyChatwootMessageEvent(payload, getChatwootInboxId());

  if (!result.ok) {
    // Phase 1: WhatsApp groups surface observably, distinct from generic
    // noise, so operators can see exactly how many group messages were
    // dropped instead of being treated as student calls.
    if (result.reason === "group_message") {
      console.log("[Chatwoot Webhook] ignored", { reason: "group_message" });
      return NextResponse.json(
        { ok: true, outcome: "group_message" },
        { status: 200 }
      );
    }
    console.log("[Chatwoot Webhook] ignored", { reason: result.reason });
    return NextResponse.json(
      { ok: true, outcome: "ignored" },
      { status: 200 }
    );
  }

  const { messageId, conversationId, inboxId, phone, senderName, content } =
    result.observed;

  console.log("[Chatwoot Webhook] observed", {
    messageId,
    conversationId,
    inboxId,
    phone: maskPhone(phone),
    event: "message_created",
  });

  // ── Guard: no usable message ID ─────────────────────────────────
  if (messageId === null) {
    console.warn("[Chatwoot Webhook] rejected", {
      reason: "no_message_id",
    });
    return NextResponse.json(
      { ok: true, outcome: "ignored" },
      { status: 200 }
    );
  }

  // ── Bridge processing ──────────────────────────────────────────
  const deps = bridgeDeps ?? defaultBridgeDeps();
  const stringMessageId = String(messageId);

  // 1. Idempotency claim
  const claimed = await claimChatwootMessageProcessing(
    stringMessageId,
    deps.claims
  );

  console.log("[Chatwoot Webhook] idempotency result", {
    messageId,
    claimed,
  });

  if (!claimed) {
    console.log("[Chatwoot Webhook] duplicate", { messageId });
    return NextResponse.json(
      { ok: true, outcome: "duplicate" },
      { status: 200 }
    );
  }

  // ── Guard: no reply destination (phone) ────────────────────────
  // The classifier accepted the message but did not provide a phone,
  // so the reply cannot be routed to the student. Treated as a
  // controlled processing failure: release the claim and return 500.
  if (!phone) {
    console.warn("[Chatwoot Webhook] no_phone — releasing claim", {
      messageId,
    });
    await releaseChatwootMessageClaim(stringMessageId, deps.claims);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // 2. Conversation resolution + bridge processing.
  //    On genuine failure BEFORE an outbound reply exists, release the
  //    claim so Chatwoot can retry. Once a reply has been sent (or a
  //    send may have reached the student), the claim is KEPT.
  try {
    // 2a. Find or create shared Conversation (source=WHATSAPP).
    const { conversation } = await deps.findOrCreateConversation({
      phone,
      source: "WHATSAPP",
      sourcePage: "/whatsapp",
    });

    console.log("[Chatwoot Webhook] conversation", {
      messageId,
      conversationId: conversation.id,
      phone: maskPhone(phone),
    });

    // 2b. Best-effort profile-name enrichment (never overwrite).
    if (senderName && !conversation.name) {
      try {
        await deps.updateProfileNameIfMissing(
          conversation.id,
          senderName
        );
      } catch (error) {
        console.warn(
          "[Chatwoot Webhook] profile-name enrichment skipped",
          error instanceof Error ? error.message : error
        );
      }
    }

    // 2c. Ownership safety gate (MUST precede any AI decision).
    const ownership = await deps.getOwnership(conversation.id);

    // 2d. Ownership branch.
    // ASSIGNED / HANDED_OFF: save inbound message, NEVER invoke AI.
    if (ownership !== "UNASSIGNED") {
      await deps.saveUserMessage(conversation.id, content);
      if (ownership === "ASSIGNED") {
        console.log("[Chatwoot Webhook] assigned — AI skipped", {
          messageId,
          conversationId: conversation.id,
        });
        return NextResponse.json(
          { ok: true, outcome: "ai_skipped_assigned" },
          { status: 200 }
        );
      }
      console.log("[Chatwoot Webhook] handed off — AI skipped", {
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
    // we must NOT save the inbound message here (single-write, Option B).
    // Ownership was already verified UNASSIGNED above — never delegated
    // to the AI.

    // 2e. AI rate-limit gate (Phase 1). Runs ONLY for UNASSIGNED threads.
    //     When limited: do NOT run the AI, do NOT save any message,
    //     release the claim, and answer 429 so Chatwoot redelivers later.
    //     The claim release is safe — nothing was persisted and no outbound
    //     reply exists, so a retry cannot duplicate anything.
    if (deps.checkRateLimit) {
      const limited = await deps.checkRateLimit(conversation.id, phone);
      if (limited) {
        console.log("[Chatwoot Webhook] rate limited — deferred", {
          messageId,
          conversationId: conversation.id,
        });
        await releaseChatwootMessageClaim(stringMessageId, deps.claims);
        return NextResponse.json(
          { ok: false, outcome: "rate_limited" },
          { status: 429 }
        );
      }
    }

    // 2f. AI failure → release claim, HTTP 500, no Evolution send.
    let reply: string;
    try {
      reply = await deps.runAiPipeline(conversation, content);
    } catch (error) {
      console.error("[Chatwoot Webhook] AI failure — releasing claim", {
        messageId,
        conversationId: conversation.id,
        reason: error instanceof Error ? error.message : String(error),
      });
      await releaseChatwootMessageClaim(stringMessageId, deps.claims);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    // 2g. Evolution send — failure AFTER AI must NOT release the claim
    //     (the reply may have reached the student; retrying risks a
    //     duplicate). Return 200 reply_failed instead.
    const send = await deps.sendEvolutionWhatsAppText(phone, reply);

    if (!send.ok) {
      console.error("[Chatwoot Webhook] Evolution send failed", {
        messageId,
        conversationId: conversation.id,
        reason: send.error,
      });
      return NextResponse.json(
        { ok: true, outcome: "reply_failed" },
        { status: 200 }
      );
    }

    console.log("[Chatwoot Webhook] replied", {
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
    // Release claim so Chatwoot can retry.
    await releaseChatwootMessageClaim(stringMessageId, deps.claims);
    console.error("[Chatwoot Webhook] processing failure", {
      messageId,
      reason: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
