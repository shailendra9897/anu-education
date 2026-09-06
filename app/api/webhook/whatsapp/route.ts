// FILE: app/api/webhook/whatsapp/route.ts
//
// ─────────────────────────────────────────────────────────────────
// META WHATSAPP WEBHOOK ENDPOINT (Task 19)
//
//   GET  → Meta subscription verification (hub.mode/hub.verify_token/
//          hub.challenge against WHATSAPP_VERIFY_TOKEN).
//   POST → Meta WhatsApp events for WABA 9428186817.
//
// All business logic lives in lib/whatsapp/* services; this file is a
// thin controller that wires the REAL implementations into the
// injectable ports used by webhook.service.ts:
//
//   findOrCreateConversation → existing shared conversation service
//                              (source=WHATSAPP, phone identity)
//   getOwnership             → deterministic gate from
//                              lib/staff/assignment.service.ts
//   saveUserMessage          → existing message.service (shared store)
//   runAiPipeline            → ai-adapter around the EXISTING website
//                              AI engine (Groq via lib/ai/client)
//   sendText                 → lib/whatsapp/send.sendWhatsAppText
//
// HTTP contract for Meta:
//   200 → event accepted (handled, ignored, duplicate, unsupported…)
//   400 → malformed payload (not worth retrying)
//   401 → invalid X-Hub-Signature-256
//   403 → failed GET verification token
//   500 → genuine pre-reply processing failure; Meta retries with
//         backoff and our idempotency layer keeps it safe. ALSO used
//         when production runs without WHATSAPP_APP_SECRET (fail-
//         closed: unsigned production webhooks are never processed).
//   429 → AI rate limited; nothing was saved or sent, the claim is
//         released, and Meta redelivers with its own backoff (Phase 1).
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import type { Conversation } from "@prisma/client";
import { ConversationSource, MessageRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import { findOrCreateConversation } from "@/lib/chat/conversation.service";
import { saveMessage } from "@/lib/chat/message.service";
import { getConversationOwnership } from "@/lib/staff/assignment.service";
import { runAnuAiPipelineForWhatsApp } from "@/lib/whatsapp/ai-adapter.service";
import { getWhatsAppVerifyToken } from "@/lib/whatsapp/config";
import {
  processWhatsAppWebhookPayload,
  type WebhookDeps,
} from "@/lib/whatsapp/webhook.service";
import { verifyWebhookSubscription } from "@/lib/whatsapp/verify";
import { verifyMetaSignature } from "@/lib/whatsapp/signature";
import { sendWhatsAppText } from "@/lib/whatsapp/send";
import { checkChatRateLimit } from "@/lib/ai/rateLimiter";

export const dynamic = "force-dynamic";

// ── REAL DEPENDENCY WIRING ────────────────────────────────────────

const whatsappWebhookDeps: WebhookDeps = {
  findOrCreateConversation: async (input) => {
    const result = await findOrCreateConversation({
      ...input,
      source: input.source as ConversationSource,
    });
    return { conversation: result.conversation, created: result.created };
  },

  getOwnership: (conversationId: string) =>
    getConversationOwnership(conversationId),

  saveUserMessage: (conversationId: string, content: string) =>
    saveMessage({ conversationId, role: MessageRole.USER, content }),

  updateProfileNameIfMissing: async (
    conversationId: string,
    profileName: string
  ) => {
    const existing = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { name: true },
    });
    if (!existing || !existing.name) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { name: profileName },
      });
    }
  },

  runAiPipeline: (conversation, userMessage: string) =>
    runAnuAiPipelineForWhatsApp(conversation as Conversation, userMessage),

  sendText: (phone: string, text: string) => sendWhatsAppText(phone, text),

  // Phase 1 — shared AI rate limiter (the same one the website /api/chat
  // route uses). Keyed per phone (the WhatsApp sender) AND per
  // conversation, so a burst of inbound traffic cannot exhaust the Groq
  // TPM budget. When limited, the webhook service defers the message and
  // answers 429 so Meta redelivers with its own natural backoff.
  checkRateLimit: async (conversationId: string, phone: string | null) => {
    const result = await checkChatRateLimit({
      conversationId,
      ip: phone ?? undefined,
    });
    return result.limited;
  },
};

// ── GET — Meta webhook verification ───────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("[WhatsApp Webhook] verification request", {
    hasMode: !!mode,
    hasToken: !!token,
    hasChallenge: !!challenge,
    tokenMatched:
      token === process.env.WHATSAPP_VERIFY_TOKEN,
  });

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    console.log(
      "[WhatsApp Webhook] verification successful"
    );

    return new Response(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  console.error(
    "[WhatsApp Webhook] verification failed"
  );

  return new Response("Forbidden", {
    status: 403,
  });
}

// ── POST — Meta WhatsApp events ───────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (error) {
    console.log("[WhatsApp Webhook] error", {
      stage: "read_body",
      reason: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "unreadable body" }, { status: 400 });
  }

  const signature = verifyMetaSignature(
    rawBody,
    req.headers.get("x-hub-signature-256")
  );

  if (signature === "invalid") {
    console.warn("[WhatsApp Webhook] signature verification failed");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  if (signature === "rejected_missing_production_secret") {
    // R2 — production MUST NOT process unsigned webhooks. Fail closed
    // with a server error so misconfiguration is loud and immediate.
    console.error(
      "[WhatsApp Webhook] error",
      { stage: "signature_config", reason: "WHATSAPP_APP_SECRET missing in production" }
    );
    return NextResponse.json(
      { error: "server configuration error" },
      { status: 500 }
    );
  }

  // Only "verified" and "skipped_development" reach this point.

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.warn("[WhatsApp Webhook] malformed JSON body");
    return NextResponse.json({ error: "malformed JSON" }, { status: 400 });
  }

  try {
    const result = await processWhatsAppWebhookPayload(whatsappWebhookDeps, payload);
    return NextResponse.json(
      {
        received: true,
        object: result.object ?? null,
        outcomes: result.outcomes,
      },
      { status: result.status }
    );
  } catch (error) {
    // Last-resort guard: never leak internals to Meta, but signal a
    // genuine failure so Meta retries (idempotency keeps it safe).
    console.error("[WhatsApp Webhook] error", {
      stage: "dispatch",
      reason: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
