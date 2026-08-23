// FILE: lib/whatsapp/payload.ts
//
// ─────────────────────────────────────────────────────────────────
// Meta WhatsApp Cloud API webhook payload parsing + classification.
//
// PHASE 7 — LOOP PROTECTION (Coexistence):
//
// With WhatsApp Business App + Cloud API coexistence enabled on the
// ANU number 9428186817, the webhook receives several DIFFERENT event
// shapes on the same endpoint. Treating every event as a student
// message would make ANU AI answer its own counsellors' manual
// replies — an infinite loop. This module classifies every known
// shape BEFORE any processing happens:
//
//   value.messages[]           → inbound student message  → process
//   value.statuses[]           → delivery status of OUR outbound
//                                messages (sent/delivered/read/failed)
//                                → IGNORED
//   value.smb_message_echoes[] → COEXISTENCE ECHO: a message a
//                                counsellor sent manually from the
//                                WhatsApp Business App. These are
//                                business-side messages echoed back
//                                to the Cloud API. → IGNORED, never
//                                passed to AI.
//   value.echoes[]             → legacy echo shape → IGNORED
//   value.messages[] where     → SELF-MESSAGE GUARD: even inside
//   from == metadata.            the inbound array, a message whose
//   display_phone_number         sender equals OUR OWN number can
//                                never be a student — classified
//                                self_message_ignored → IGNORED
//                                (defense-in-depth against coexistence
//                                shape drift).
//   anything else              → unknown_value → IGNORED
//
// Only `inbound_message` events with type "text" ever reach the AI.
// Every other classification is logged and dropped with HTTP 200.
//
// Reference payload shapes (Meta Cloud API "messages" field):
//
// Inbound text:
// {
//   object: "whatsapp_business_account",
//   entry: [{
//     id: "<WABA_ID>",
//     changes: [{
//       field: "messages",
//       value: {
//         messaging_product: "whatsapp",
//         metadata: { display_phone_number: "919428186817",
//                     phone_number_id: "<PNID>" },
//         contacts: [{ profile: { name: "Student" },
//                      wa_id: "919876543210" }],
//         messages: [{ from: "919876543210", id: "wamid.X",
//                      timestamp: "1700000000", type: "text",
//                      text: { body: "hello" } }]
//       }
//     }]
//   }]
// }
//
// Outbound status callback:
//   value.statuses = [{ id: "wamid.X" (OUR message), status:
//                       "sent|delivered|read|failed", ... }]
//
// Coexistence manual reply from the Business App (counsellor typed it
// on the phone / app UI):
//   value.smb_message_echoes = [{ id: "wamid.Y", from: "919428186817",
//                                 ... }]
//
// All functions are pure (no I/O) so they are unit-testable offline.
// ─────────────────────────────────────────────────────────────────

import { waIdToE164Phone } from "./phone";

// ── EVENT TYPES ─────────────────────────────────────────────────

export type InboundMessageEvent = {
  kind: "inbound_message";
  wabaId: string | null;
  phoneNumberId: string | null;
  messageId: string;
  fromWaId: string;
  /** E.164 form stored in Conversation.phone, e.g. "+919876543210" */
  fromPhoneE164: string;
  timestampSec: string | null;
  receivedAt: Date | null;
  messageType: "text";
  textBody: string;
  profileName: string | null;
};

export type UnsupportedMessageEvent = {
  kind: "unsupported_message";
  phoneNumberId: string | null;
  messageId: string | null;
  fromWaId: string | null;
  messageType: string;
};

export type StatusEvent = {
  kind: "status_event";
  phoneNumberId: string | null;
  statusIds: string[];
};

export type EchoEvent = {
  kind: "echo_event";
  /** smb_message_echoes = WhatsApp Business App manual reply */
  source: "smb_message_echoes" | "echoes";
  count: number;
  phoneNumberId: string | null;
};

export type SelfMessageEvent = {
  kind: "self_message_ignored";
  messageId: string | null;
  fromWaId: string | null;
};

export type UnknownValueEvent = {
  kind: "unknown_value";
  field: string | null;
};

export type WhatsAppWebhookEvent =
  | InboundMessageEvent
  | UnsupportedMessageEvent
  | StatusEvent
  | EchoEvent
  | SelfMessageEvent
  | UnknownValueEvent;

export type ParsePayloadResult =
  | { ok: false; reason: string }
  | { ok: true; object: string; events: WhatsAppWebhookEvent[] };

/** Message types we currently act on. Everything else is ignored. */
export const SUPPORTED_MESSAGE_TYPES = ["text"] as const;

// ── ENTRY POINT ─────────────────────────────────────────────────

/**
 * parseWhatsAppWebhookPayload
 * ───────────────────────────
 * Validates the top-level envelope and flattens entry[].changes[]
 * into a flat list of classified events. Never throws.
 */
export function parseWhatsAppWebhookPayload(
  raw: unknown
): ParsePayloadResult {
  if (!isRecord(raw)) {
    return { ok: false, reason: "payload is not an object" };
  }

  const objectName = typeof raw.object === "string" ? raw.object : "";

  if (!Array.isArray(raw.entry)) {
    return { ok: false, reason: "entry array missing" };
  }

  const events: WhatsAppWebhookEvent[] = [];

  for (const entryItem of raw.entry) {
    if (!isRecord(entryItem)) continue;

    const wabaId =
      typeof entryItem.id === "string" ? entryItem.id : null;

    if (!Array.isArray(entryItem.changes)) continue;

    for (const change of entryItem.changes) {
      if (!isRecord(change)) continue;

      const field =
        typeof change.field === "string" ? change.field : null;
      const value = isRecord(change.value) ? change.value : null;

      if (!value) {
        events.push({ kind: "unknown_value", field });
        continue;
      }

      // We only understand the "messages" field today. Other webhook
      // fields subscribed on the same app (account_update, flows,
      // etc.) are safely reported as unknown.
      if (field !== null && field !== "messages") {
        events.push({ kind: "unknown_value", field });
        continue;
      }

      const phoneNumberId =
        isRecord(value.metadata) &&
        typeof value.metadata.phone_number_id === "string"
          ? value.metadata.phone_number_id
          : null;

      const displayPhoneNumber =
        isRecord(value.metadata) &&
        typeof value.metadata.display_phone_number === "string"
          ? value.metadata.display_phone_number
          : null;

      // ── OUTBOUND STATUS EVENTS → ignore ───────────────────────
      // Delivery receipts for OUR OWN sends. High volume, zero
      // conversational meaning — never processed, never claimed.
      if (Array.isArray(value.statuses) && value.statuses.length > 0) {
        const statusIds = value.statuses
          .filter(isRecord)
          .map((s) => (typeof s.id === "string" ? s.id : null))
          .filter((id): id is string => id !== null);
        events.push({ kind: "status_event", phoneNumberId, statusIds });
      }

      // ── COEXISTENCE MANUAL-REPLY ECHOES → ignore ───────────────
      // smb_message_echoes carries messages a counsellor sent from
      // the WhatsApp Business App itself (coexistence mode). If these
      // were processed as student messages, ANU AI would reply to its
      // own staff — the exact loop this task forbids.
      if (
        Array.isArray(value.smb_message_echoes) &&
        value.smb_message_echoes.length > 0
      ) {
        events.push({
          kind: "echo_event",
          source: "smb_message_echoes",
          count: value.smb_message_echoes.length,
          phoneNumberId,
        });
      }

      // Legacy echo array seen on older WABA configurations.
      if (Array.isArray(value.echoes) && value.echoes.length > 0) {
        events.push({
          kind: "echo_event",
          source: "echoes",
          count: value.echoes.length,
          phoneNumberId,
        });
      }

      // ── INBOUND STUDENT MESSAGES → process ────────────────────
      if (Array.isArray(value.messages)) {
        const contacts = Array.isArray(value.contacts)
          ? value.contacts.filter(isRecord)
          : [];

        for (const message of value.messages) {
          if (!isRecord(message)) continue;

          const messageId =
            typeof message.id === "string" ? message.id : null;
          const fromWaId =
            typeof message.from === "string" ? message.from : null;
          const messageType =
            typeof message.type === "string" ? message.type : "unknown";

          // ── R1 SELF-NUMBER GUARD ──────────────────────────────────
          // A message whose sender equals OUR OWN business number can
          // never originate from a student (coexistence shape-drift
          // defense). Deterministic check, runs before any
          // classification that could reach the AI path.
          if (isSelfNumber(fromWaId, displayPhoneNumber)) {
            events.push({
              kind: "self_message_ignored",
              messageId,
              fromWaId,
            });
            continue;
          }

          if (!SUPPORTED_MESSAGE_TYPES.includes(
            messageType as (typeof SUPPORTED_MESSAGE_TYPES)[number]
          )) {
            events.push({
              kind: "unsupported_message",
              phoneNumberId,
              messageId,
              fromWaId,
              messageType,
            });
            continue;
          }

          const textBody =
            isRecord(message.text) && typeof message.text.body === "string"
              ? message.text.body
              : "";

          if (!messageId || !fromWaId || !textBody.trim()) {
            // A text message without an ID/sender/body cannot be
            // deduplicated or answered — treat as unsupported rather
            // than risking an unclaimable AI path.
            events.push({
              kind: "unsupported_message",
              phoneNumberId,
              messageId,
              fromWaId,
              messageType: messageId ? "text_incomplete" : messageType,
            });
            continue;
          }

          const e164 = waIdToE164Phone(fromWaId);
          if (!e164) {
            events.push({
              kind: "unsupported_message",
              phoneNumberId,
              messageId,
              fromWaId,
              messageType: "text_invalid_sender",
            });
            continue;
          }

          const timestampSec =
            typeof message.timestamp === "string"
              ? message.timestamp
              : null;

          const receivedAt = timestampSec
            ? new Date(Number.parseInt(timestampSec, 10) * 1000 || Date.now())
            : null;

          const contactProfileName = contacts.find(
            (c) => c.wa_id === fromWaId
          );

          const profileName =
            isRecord(contactProfileName) &&
            isRecord(contactProfileName.profile) &&
            typeof contactProfileName.profile.name === "string"
              ? contactProfileName.profile.name
              : null;

          events.push({
            kind: "inbound_message",
            wabaId,
            phoneNumberId,
            messageId,
            fromWaId,
            fromPhoneE164: e164,
            timestampSec,
            receivedAt,
            messageType: "text",
            textBody: textBody.trim(),
            profileName,
          });
        }
      }

      // A value with none of the recognized arrays (e.g. error
      // notices) is recorded as unknown so it can be observed in logs.
      if (
        !Array.isArray(value.messages) &&
        !Array.isArray(value.statuses) &&
        !Array.isArray(value.smb_message_echoes) &&
        !Array.isArray(value.echoes)
      ) {
        events.push({ kind: "unknown_value", field });
      }
    }
  }

  return { ok: true, object: objectName, events };
}

// ── INTERNAL ─────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * isSelfNumber
 * ────────────
 * True when the message sender IS our own WhatsApp business number.
 * Comparison is digits-only and tolerant of country-code presence
 * ("9428186817" vs "919428186817"), so a display number published
 * without the 91 prefix still matches.
 */
function isSelfNumber(
  fromWaId: string | null,
  displayPhoneNumber: string | null
): boolean {
  if (!fromWaId || !displayPhoneNumber) return false;
  const from = fromWaId.replace(/\D/g, "");
  const own = displayPhoneNumber.replace(/\D/g, "");
  if (!from || !own) return false;
  if (from === own) return true;
  // Same subscriber with/without country code (min 10 digits to avoid
  // coincidental short-suffix matches).
  if (own.length >= 10 && from.endsWith(own)) return true;
  if (from.length >= 10 && own.endsWith(from)) return true;
  return false;
}
