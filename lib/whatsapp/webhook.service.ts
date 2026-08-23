// FILE: lib/whatsapp/webhook.service.ts
//
// ─────────────────────────────────────────────────────────────────
// WHATSAPP WEBHOOK ORCHESTRATION
//
// Pure, dependency-injected core of app/api/webhook/whatsapp/route.ts.
// All side effects (DB access, AI calls, WhatsApp sends) arrive via
// `WebhookDeps` ports; the route wires real implementations, tests
// wire fakes. This module never touches Prisma or fetch directly.
//
// ── EXACT EVENT HANDLING (PHASE 7 documentation) ────────────────
//
//  value.messages[] type "text"   → INBOUND STUDENT MESSAGE:
//      idempotency claim by wamid → find/create Conversation
//      (source=WHATSAPP) → OWNERSHIP GATE → AI pipeline → reply.
//
//  value.messages[] other types   → UNSUPPORTED (image/audio/video/
//      (image, audio, video…)      document/sticker/location/…):
//                                  logged + claimed so redeliveries
//                                  stay silent. NO AI CALL EVER.
//
//  value.statuses[]               → OUTBOUND STATUS EVENTS (delivery
//      sent/delivered/read/failed receipts for OUR sends): logged and
//      ignored. Never claimed, never processed.
//
//  value.smb_message_echoes[]     → COEXISTENCE MANUAL REPLY: a
//      message a COUNSELLOR typed in the WhatsApp Business App on our
//      number 9428186817, echoed to the Cloud API. ALWAYS IGNORED —
//      this is what prevents ANU AI from answering its own staff
//      (infinite loop protection). Same for legacy value.echoes[].
//
//  value.messages[] with          → SELF-MESSAGE GUARD (R1): even if
//      from == our own number       a business-originated message ever
//                                   appeared inside value.messages[],
//                                   it is dropped deterministically
//                                   before any stateful/AI code.
//
//  anything else / other fields   → UNKNOWN: logged once, ignored,
//      HTTP 200 so Meta does not retry harmless noise.
//
// ── ERROR BEHAVIOR (PHASE 9 documentation) ───────────────────────
//
//  Failure BEFORE any reply was sent (conversation lookup, ownership
//  read, user-message save, AI generation, unexpected throw):
//      → idempotency claim is RELEASED, HTTP 500 returned. Meta
//        retries with backoff; the retry re-claims cleanly and cannot
//        double-send because nothing reached the student yet.
//
//  Failure SENDING the generated reply (Graph API error/timeout):
//      → claim is KEPT and HTTP 200 returned. We deliberately do NOT
//        let Meta retry: the pipeline already consumed an AI response
//        and a timeout may mean the message actually arrived, so a
//        retry could duplicate the student's reply. The failure is
//        logged; the conversation history retains both messages for
//        counsellor follow-up.
//
//  Duplicate deliveries of a wamid after success: HTTP 200, action
//  "duplicate", zero side effects.
// ─────────────────────────────────────────────────────────────────

import {
  claimWhatsAppMessageProcessing,
  releaseWhatsAppMessageClaim,
  type IdempotencyDeps,
} from "./idempotency";
import type {
  InboundMessageEvent,
  WhatsAppWebhookEvent,
} from "./payload";
import { parseWhatsAppWebhookPayload } from "./payload";
import type { SendWhatsAppResult } from "./send";

// ── PORTS ────────────────────────────────────────────────────────

export type OwnedConversation = {
  id: string;
  phone: string | null;
  name?: string | null;
};

export type OwnershipState = "UNASSIGNED" | "ASSIGNED" | "HANDED_OFF";

export type WebhookDeps = {
  findOrCreateConversation(input: {
    phone?: string;
    sessionId?: string;
    source: "WEB" | "WHATSAPP";
    sourcePage?: string;
  }): Promise<OwnedConversation>;
  getOwnership(conversationId: string): Promise<OwnershipState>;
  saveUserMessage(conversationId: string, content: string): Promise<unknown>;
  updateProfileNameIfMissing(
    conversationId: string,
    profileName: string
  ): Promise<unknown>;
  runAiPipeline(conversation: OwnedConversation, userMessage: string): Promise<string>;
  sendText(phone: string, text: string): Promise<SendWhatsAppResult>;
  /** Injectable idempotency store — defaults to memory+RateLimitLog. */
  claims?: IdempotencyDeps;
};

export type InboundHandlingOutcome =
  | "replied"
  | "reply_failed"
  | "ai_skipped_assigned"
  | "ai_skipped_handed_off";

export type EventOutcome = {
  messageId?: string;
  action:
    | "processed"
    | "reply_failed"
    | "failed"
    | "duplicate"
    | "unsupported"
    | "status_ignored"
    | "echo_ignored"
    | "self_message_ignored"
    | "unknown_ignored";
};

export type ProcessPayloadResult = {
  status: 200 | 400 | 500;
  object?: string;
  outcomes: EventOutcome[];
  genuineFailure: boolean;
};

// ── LOGGING HELPERS (PHASE 8 — no tokens, no message bodies) ─────

function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "unknown";
  const digits = phone.replace(/\D/g, "");
  return digits.length <= 4 ? "***" : `${digits.slice(0, 2)}****${digits.slice(-4)}`;
}

// ── SINGLE INBOUND TEXT MESSAGE (PHASE 3 + 4 + 5) ────────────────

/**
 * handleInboundTextMessage
 * ────────────────────────
 * Conversation resolution → deterministic ownership gate → AI path.
 * Throws only on failures where NOTHING was sent to the student
 * (caller releases the idempotency claim and lets Meta retry).
 */
export async function handleInboundTextMessage(
  deps: WebhookDeps,
  event: InboundMessageEvent
): Promise<{ outcome: InboundHandlingOutcome; conversationId: string }> {
  // PHASE 3 — shared Conversation store, source=WHATSAPP.
  const conversation = await deps.findOrCreateConversation({
    phone: event.fromPhoneE164,
    source: "WHATSAPP",
    sourcePage: "/whatsapp",
  });

  console.log("[WhatsApp Webhook] incoming", {
    messageId: event.messageId,
    from: maskPhone(event.fromPhoneE164),
    conversationId: conversation.id,
    messageType: event.messageType,
  });

  // Best-effort profile-name enrichment (Meta contact name).
  if (event.profileName && !conversation.name) {
    try {
      await deps.updateProfileNameIfMissing(conversation.id, event.profileName);
    } catch (error) {
      console.warn(
        "[WhatsApp Webhook] profile-name enrichment skipped",
        error instanceof Error ? error.message : error
      );
    }
  }

  // PHASE 4 — DETERMINISTIC OWNERSHIP SAFETY GATE.
  // MUST run before ANY Groq/AI work. Not delegated to the LLM.
  const ownership = await deps.getOwnership(conversation.id);

  if (ownership === "ASSIGNED") {
    await deps.saveUserMessage(conversation.id, event.textBody);
    console.log("[WhatsApp Webhook] assigned — AI skipped", {
      messageId: event.messageId,
      conversationId: conversation.id,
    });
    return { outcome: "ai_skipped_assigned", conversationId: conversation.id };
  }

  if (ownership === "HANDED_OFF") {
    await deps.saveUserMessage(conversation.id, event.textBody);
    console.log("[WhatsApp Webhook] handed off — AI skipped", {
      messageId: event.messageId,
      conversationId: conversation.id,
    });
    return { outcome: "ai_skipped_handed_off", conversationId: conversation.id };
  }

  // PHASE 5 — UNASSIGNED: eligible for ANU AI.
  console.log("[WhatsApp Webhook] AI processing", {
    conversationId: conversation.id,
    messageId: event.messageId,
  });
  const reply = await deps.runAiPipeline(conversation as never, event.textBody);

  const send = await deps.sendText(event.fromPhoneE164, reply);
  if (send.ok) {
    console.log("[WhatsApp Webhook] reply sent", {
      conversationId: conversation.id,
      messageId: event.messageId,
      graphMessageId: send.messageId ?? null,
    });
    return { outcome: "replied", conversationId: conversation.id };
  }

  // Send failure AFTER AI ran: keep claim, report failure upward but
  // do NOT release for retry — see header docs.
  console.log("[WhatsApp Webhook] error", {
    stage: "send_reply",
    conversationId: conversation.id,
    messageId: event.messageId,
    reason: send.error,
  });
  return { outcome: "reply_failed", conversationId: conversation.id };
}

// ── FULL PAYLOAD DISPATCH ────────────────────────────────────────

/**
 * processWebhookEvents
 * ────────────────────
 * Takes already-classified events (parseWhatsAppWebhookPayload) and
 * dispatches each according to the handling table in the header.
 */
export async function processWebhookEvents(
  deps: WebhookDeps,
  events: WhatsAppWebhookEvent[]
): Promise<Omit<ProcessPayloadResult, "object">> {
  const outcomes: EventOutcome[] = [];
  let genuineFailure = false;

  for (const event of events) {
    switch (event.kind) {
      case "inbound_message": {
        const claimed = await claimWhatsAppMessageProcessing(
          event.messageId,
          deps.claims
        );
        if (!claimed) {
          console.log("[WhatsApp Webhook] duplicate", {
            messageId: event.messageId,
          });
          outcomes.push({ messageId: event.messageId, action: "duplicate" });
          break;
        }
        try {
          const handling = await handleInboundTextMessage(deps, event);
          outcomes.push({
            messageId: event.messageId,
            action:
              handling.outcome === "reply_failed"
                ? ("reply_failed" as const)
                : ("processed" as const),
          });
        } catch (error) {
          // Genuine pre-reply failure → allow Meta retry.
          await releaseWhatsAppMessageClaim(event.messageId, deps.claims);
          console.log("[WhatsApp Webhook] error", {
            stage: "process_message",
            messageId: event.messageId,
            reason: error instanceof Error ? error.message : String(error),
          });
          outcomes.push({ messageId: event.messageId, action: "failed" });
          genuineFailure = true;
        }
        break;
      }

      case "unsupported_message": {
        console.log("[WhatsApp Webhook] unsupported message", {
          messageId: event.messageId ?? null,
          messageType: event.messageType,
          from: maskPhone(event.fromWaId),
        });
        // Claim so redeliveries don't re-log (best-effort).
        if (event.messageId) {
          await claimWhatsAppMessageProcessing(event.messageId, deps.claims).catch(() => {});
        }
        outcomes.push({
          messageId: event.messageId ?? undefined,
          action: "unsupported",
        });
        break;
      }

      case "status_event":
        console.log("[WhatsApp Webhook] outbound status event ignored", {
          statusIds: event.statusIds.length,
          phoneNumberId: event.phoneNumberId,
        });
        outcomes.push({ action: "status_ignored" });
        break;

      case "echo_event":
        // CRITICAL coexistence loop protection — see header table.
        console.log("[WhatsApp Webhook] coexistence manual reply ignored", {
          source: event.source,
          count: event.count,
        });
        outcomes.push({ action: "echo_ignored" });
        break;

      case "self_message_ignored":
        // R1 — business-originated message inside value.messages[];
        // never AI, never replied, never stored.
        console.log("[WhatsApp Webhook] self message ignored", {
          messageId: event.messageId,
          from: maskPhone(event.fromWaId),
        });
        outcomes.push({
          messageId: event.messageId ?? undefined,
          action: "self_message_ignored",
        });
        break;

      case "unknown_value":
        console.log("[WhatsApp Webhook] unknown event ignored", {
          field: event.field,
        });
        outcomes.push({ action: "unknown_ignored" });
        break;
    }
  }

  return { status: genuineFailure ? 500 : 200, outcomes, genuineFailure };
}

/**
 * processWhatsAppWebhookPayload
 * ─────────────────────────────
 * Parse + dispatch in one call. Malformed payloads are reported with
 * status 400 so obviously-corrupt traffic is not retried forever.
 */
export function processWhatsAppWebhookPayload(
  deps: WebhookDeps,
  raw: unknown
): Promise<{
  status: 200 | 400 | 500;
  outcomes: EventOutcome[];
  genuineFailure: boolean;
  object: string | null;
}> {
  const parsed = parseWhatsAppWebhookPayload(raw);
  if (!parsed.ok) {
    console.log("[WhatsApp Webhook] malformed payload", { reason: parsed.reason });
    return Promise.resolve({
      status: 400,
      outcomes: [{ action: "unknown_ignored" }],
      genuineFailure: false,
      object: null,
    });
  }
  return processWebhookEvents(deps, parsed.events).then((result) => ({
    ...result,
    object: parsed.object,
  }));
}
