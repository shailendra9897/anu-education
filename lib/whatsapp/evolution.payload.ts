// FILE: lib/whatsapp/evolution.payload.ts
//
// Evolution API (Baileys) webhook payload parsing + classification for
// the ANU AI inbound adapter. Transports a real student WhatsApp
// message, delivered by Evolution's `messages.upsert` event, into the
// SAME normalized event shape the AI bridge consumes.
//
// ─────────────────────────────────────────────────────────────────
// EXPECTED EVOLUTION EVENT SHAPE (documented; Evolution/API V2 webhook)
//
// Evolution POSTs instance events to a configured webhook URL with an
// `apikey` request header (global/instance API key). The `messages.upsert`
// delivery body is:
//
// {
//   event:      "messages.upsert",        // event.name in API V2
//   instance:   "anu_education",          // evolution instance identifier
//   data: {
//     key: {
//       remoteJid: "919876543210@s.whatsapp.net", // sender JID for 1:1
//       fromMe:    false,                // TRUE for OUR OWN sends
//       id:        "3EB0F1C2E1A2F3A4..." // Baileys message id → idempotency
//     },
//     pushName:  "Ravi Kumar",           // contact display name (best effort,
//                                        //   may be absent)
//     message: {
//       conversation: "Hello",            // plain text
//        // OR
//       extendedTextMessage: { text: "longer text" }
//       // OR any of imageMessage / videoMessage / audioMessage /
//       //      documentMessage / stickerMessage / reactionMessage …
//     },
//     messageTimestamp: 1755936000,       // unix seconds (number or string)
//     participant: undefined              // ABSENT for 1:1; present for GROUP
//   },
//   destination: "messages.upsert"
// }
//
// ACCEPT only when ALL hold:
//   • event                      === "messages.upsert"
//   • data.key.fromMe            === false        (never our own sends)
//   • data.key.remoteJid         → a 1:1 phone JID (never @g.us /
//                                  @broadcast / @newsletter, and no
//                                  `data.participant` group marker)
//   • data.message               → text only (conversation or
//                                  extendedTextMessage.text)
//   • resolved sender            → a usable phone (7–15 digits)
//   • data.key.id               → non-empty (idempotency key)
//
// Everything else is IGNORED safely; the transport answers HTTP 200 so
// Evolution does not retry noise.
//
// Explicit rejections:
//   • non-messages.upsert events (connection.update, messages.update,
//     messages.delete, send.message …) → "unsupported_event"
//   • contacts that are groups/communities (…@g.us / …@g.whatsapp.net /
//     …@broadcast / …@newsletter, or data.participant present)
//     → "group_message"
//   • our own outbound deliveries (fromMe=true) → "self_message"
//     (loop protection: the AI's own Evolution replies must never be
//     fed back into the pipeline)
//   • image/video/audio/document/sticker/reaction/location messages
//     → "non_text_message"
//   • empty / missing text              → "empty_content"
//   • missing message id                → "no_message_id"
//   • unusable sender identity          → "invalid_sender"
//
// All functions are pure (no I/O) so they are unit-testable offline.
// Phone normalization is deliberately delegated to the shared
// lib/whatsapp/phone.ts normalizeIndianPhone — see evolution.handler.ts.
// ─────────────────────────────────────────────────────────────────

import { normalizeIndianPhone } from "./phone";

export type EvolutionIgnoreReason =
  | "malformed_payload"
  | "unsupported_event"
  | "group_message"
  | "self_message"
  | "non_text_message"
  | "empty_content"
  | "no_message_id"
  | "invalid_sender";

export interface ObservedEvolutionMessage {
  /** Evolution event name, always "messages.upsert" on accept. */
  eventName: string;
  /** Evolution instance identifier (e.g. "anu_education"). */
  instance: string | null;
  /**
   * Baileys message id (data.key.id). THE idempotency key — one id must
   * never produce two AI replies even if Evolution retries delivery.
   */
  messageId: string;
  /** Raw sender JID (e.g. "919876543210@s.whatsapp.net"). */
  remoteJid: string | null;
  /** E.164 storage form, e.g. "+919876543210" (Conversation.phone). */
  senderPhoneE164: string;
  /** Digits-only Graph/Evolution form, e.g. "919876543210". */
  senderPhoneDigits: string;
  /** Trimmed student text. */
  textBody: string;
  /** Contact display name when Evolution supplied one. */
  pushName: string | null;
  /** Unix seconds of the message, when parseable. */
  messageTimestampSec: number | null;
  /** Received-to timestamp, when parseable. */
  receivedAt: Date | null;
}

export type ClassifyEvolutionResult =
  | { ok: true; observed: ObservedEvolutionMessage }
  | { ok: false; reason: EvolutionIgnoreReason };

// ── defensive field readers ───────────────────────────────────────

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

/**
 * GROUP_JID_RE — WhatsApp group/community identity suffix. A group JID
 * resolves to a shared room, never to a single student phone:
 *   <jid>@g.us            — WhatsApp group
 *   <jid>@g.whatsapp.net  — WhatsApp group (alternative domain)
 *   <id>@broadcast        — status/announcement broadcast
 *   <id>@newsletter       — WhatsApp channel/community
 * Identical semantics to the Meta (payload.ts) and Chatwoot paths.
 */
const GROUP_JID_RE = /@(g\.us|g\.whatsapp\.net|broadcast|newsletter)$/i;

function isGroupJid(remoteJid: string | null | undefined): boolean {
  return typeof remoteJid === "string" && GROUP_JID_RE.test(remoteJid.trim());
}

/**
 * jidToDigits — strips the JID domain suffix (…@s.whatsapp.net,
 * …@c.us, …@g.us …) so the remaining subscriber identity can be
 * normalized with the shared phone helper. Accepts an already-digits
 * string untouched.
 */
export function jidToDigits(jid: string | null | undefined): string | null {
  if (typeof jid !== "string") return null;
  const digits = jid.replace(/@.*$/, "").replace(/\D/g, "");
  return digits || null;
}

/**
 * extractMessageText — the text message variants Evolution/Baileys
 * delivers. Only plain text is a student message:
 *   message.conversation (string)                    → text
 *   message.extendedTextMessage.text (string)        → text
 *   conversation/extendedTextMessage present-but-empty → empty
 *   any other message key (imageMessage, audioMessage …) → non_text
 */
function extractMessageText(
  message: Record<string, unknown> | null
):
  | { kind: "text"; text: string }
  | { kind: "empty" }
  | { kind: "non_text"; type: string } {
  if (!message) return { kind: "non_text", type: "missing" };

  if (typeof message.conversation === "string") {
    const text = message.conversation.trim();
    return text
      ? { kind: "text", text }
      : { kind: "empty" };
  }

  const extended = asRecord(message.extendedTextMessage);
  if (extended) {
    if (typeof extended.text === "string") {
      const text = extended.text.trim();
      return text ? { kind: "text", text } : { kind: "empty" };
    }
    return { kind: "empty" };
  }

  const firstKey = Object.keys(message)[0] ?? "unknown";
  return { kind: "non_text", type: firstKey };
}

/**
 * parseMessageTimestamp — unix seconds as a number or numeric string.
 */
function parseMessageTimestamp(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? Math.floor(value) : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.floor(parsed) : null;
  }
  return null;
}

// ── ENTRY POINT ─────────────────────────────────────────────────

/**
 * classifyEvolutionMessageEvent
 * ─────────────────────────────
 * Validates an Evolution webhook body and, when it is a genuine 1:1
 * inbound student text message, extracts the canonical fields. Never
 * throws. Sender phone is normalized through the SHARED
 * normalizeIndianPhone helper so Evolution conversations reuse the
 * exact E.164 store format used by Meta/Chatwoot.
 */
export function classifyEvolutionMessageEvent(
  payload: unknown
): ClassifyEvolutionResult {
  const root = asRecord(payload);
  if (!root) return { ok: false, reason: "malformed_payload" };

  const eventName = typeof root.event === "string" ? root.event : "";

  // 1. Event kind — only newly-upsterted messages are candidates.
  if (eventName !== "messages.upsert") {
    return { ok: false, reason: "unsupported_event" };
  }

  const data = asRecord(root.data);
  if (!data) return { ok: false, reason: "malformed_payload" };

  const key = asRecord(data.key);
  if (!key) return { ok: false, reason: "malformed_payload" };

  const remoteJid = asString(key.remoteJid);
  const fromMe = key.fromMe === true;

  // 2. GROUP guard — a shared room (…@g.us / …@broadcast / …@newsletter)
  //    or an event carrying a `participant` (group sender identity) is
  //    NEVER a student thread: no conversation, no Message, no AI.
  if (
    isGroupJid(remoteJid) ||
    (data.participant !== null && data.participant !== undefined)
  ) {
    return { ok: false, reason: "group_message" };
  }

  // 3. SELF guard — our own outbound deliveries (fromMe=true). Feeding
  //    these back would make ANU AI answer its own Evolution replies —
  //    an infinite loop.
  if (fromMe) return { ok: false, reason: "self_message" };

  // 4. Unique message id — required for idempotency claims.
  const messageId = asString(key.id);
  if (!messageId) return { ok: false, reason: "no_message_id" };

  // 5. Text-only gateway.
  const message = asRecord(data.message);
  const extracted = extractMessageText(message);
  if (extracted.kind === "non_text") {
    return { ok: false, reason: "non_text_message" };
  }
  if (extracted.kind === "empty") {
    return { ok: false, reason: "empty_content" };
  }

  // 6. Resolve + normalize the sender through the shared phone helper.
  const digits = jidToDigits(remoteJid);
  if (!digits) return { ok: false, reason: "invalid_sender" };

  const normalized = normalizeIndianPhone(digits);
  if (!normalized.ok) return { ok: false, reason: "invalid_sender" };

  const messageTimestampSec = parseMessageTimestamp(data.messageTimestamp);
  const receivedAt = messageTimestampSec
    ? new Date(messageTimestampSec * 1000)
    : null;

  return {
    ok: true,
    observed: {
      eventName,
      instance: typeof root.instance === "string" ? root.instance : null,
      messageId,
      remoteJid,
      senderPhoneE164: normalized.e164,
      senderPhoneDigits: normalized.digits,
      textBody: extracted.text,
      pushName: asString(data.pushName),
      messageTimestampSec,
      receivedAt,
    },
  };
}