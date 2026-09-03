// FILE: lib/chatwoot/payload.ts
//
// ─────────────────────────────────────────────────────────────────
// CHATWOOT WEBHOOK PAYLOAD CLASSIFIER (Task 6B — observe-only)
//
// Chatwoot fires many event kinds (message_created, message_updated,
// conversation_updated, …) for BOTH traffic directions and for
// private agent notes. The ANU AI pipeline may only ever react to a
// genuine student message arriving on the WhatsApp API-channel inbox.
//
// ACCEPT only when ALL hold:
//
//   event                 === "message_created"
//   message_type          === "incoming"   (or numeric 0)
//   private               === false
//   sender.type           === "contact"
//   content               → non-empty text
//   conversation.inbox_id === CHATWOOT_INBOX_ID
//
// Everything else is IGNORED safely; the transport answers HTTP 200
// so Chatwoot never retries noise.
//
// Explicit rejections:
//   • outgoing messages            → "non_incoming_message"
//   • private notes                → "private_note"
//   • message_updated / other      → "unsupported_event"
//   • bot / system / agent senders → "sender_not_contact"
//   • WHATSAPP GROUPS (…@g.us etc) → "group_message"   (Phase 1)
//   • foreign or missing inbox     → "inbox_mismatch"
//   • empty / non-text content     → "empty_content"
//
// OBSERVE-ONLY: embedded conversation ownership/status is read but
// NEVER trusted for AI decisions. Extraction is limited to identity
// fields needed for observation logs.
// ─────────────────────────────────────────────────────────────────

export type ChatwootIgnoreReason =
  | "malformed_payload"
  | "unsupported_event"
  | "non_incoming_message"
  | "private_note"
  | "sender_not_contact"
  | "empty_content"
  | "inbox_mismatch"
  | "group_message";

export interface ObservedChatwootMessage {
  /** Chatwoot message id (top-level `id`). */
  messageId: number | null;
  /** Chatwoot conversation id. */
  conversationId: number | null;
  /** Inbox the message arrived on. */
  inboxId: number | null;
  /** Contact phone in Chatwoot form, e.g. "+919428186817". */
  phone: string | null;
  /** Raw student text (never logged by the transport layer). */
  content: string;
  /** Contact display name when available. */
  senderName: string | null;
  /** Message creation time as ISO-8601 when parseable. */
  createdAtIso: string | null;
}

export type ClassifyChatwootResult =
  | { ok: true; observed: ObservedChatwootMessage }
  | { ok: false; reason: ChatwootIgnoreReason };

// ── defensive field readers ───────────────────────────────────────

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asTrimmedString(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

// Phase 1 — WhatsApp GROUP identity scanner. A group/community JID is a
// shared room, NOT a student phone number:
//   <jid>@g.us             — WhatsApp group
//   <jid>@g.whatsapp.net   — WhatsApp group (alternative domain)
//   <id>@newsletter        — WhatsApp channel/community
// If any identity field carries one of these, the message must be
// routed as a group message and never treated as a student's 1:1.
const GROUP_JID_RE = /@(g\.us|g\.whatsapp\.net|newsletter)$/i;

function hasGroupJid(...values: Array<string | null | undefined>): boolean {
  return values.some(
    (value) => typeof value === "string" && GROUP_JID_RE.test(value.trim())
  );
}

// Phase 1 — malformed/unknown sender identity guard. A Chatwoot sender
// must resolve to a plausible WhatsApp phone. Accept a phone-like value
// (7–15 digits, relaxed separators) or a phone JID:
//   <digits>            |  +<digits>
//   <digits>@s.whatsapp.net  |  <digits>@c.us
// Anything else (e.g. "unknown", unit IDs, agent handles) is NOT a
// usable sender identity: accepting it would fabricate a synthetic
// phone, create a junk Conversation/Lead, and 500-loop on every retry.
const SENDER_JID_RE = /^\+?[0-9]{7,15}(@s\.whatsapp\.net|@c\.us)?$/i;

function senderIdentifierPhone(identifier: string | null): string | null {
  if (!identifier) return null;
  const clamped = identifier.trim();
  if (!SENDER_JID_RE.test(clamped)) return null;
  return clamped.replace(/@.*$/, "").replace(/^\+/, "");
}

function isUsableSenderPhone(value: string | null): boolean {
  if (!value) return false;
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Phone resolution order (first hit wins):
 *   1. conversation.contact.phone_number   (standard webhook shape)
 *   2. conversation.meta.sender.phone_number
 *   3. top-level contact.phone_number      (older payload shapes)
 *   4. root.sender.phone_number            (sender-level fallback)
 *   5. root.sender.identifier              (identity fallback)
 */
function extractChatwootPhone(
  root: Record<string, unknown>,
  conversation: Record<string, unknown> | null
): string | null {
  const convContact = conversation ? asRecord(conversation.contact) : null;
  if (convContact) {
    const phone = asTrimmedString(convContact.phone_number);
    if (phone) return phone;
  }

  const convMeta = conversation ? asRecord(conversation.meta) : null;
  const metaSender = convMeta ? asRecord(convMeta.sender) : null;
  if (metaSender) {
    const phone = asTrimmedString(metaSender.phone_number);
    if (phone) return phone;
  }

  const topLevelContact = asRecord(root.contact);
  const topLevelPhone = topLevelContact
    ? asTrimmedString(topLevelContact.phone_number)
    : null;
  if (topLevelPhone) return topLevelPhone;

  const sender = asRecord(root.sender);
  if (sender) {
    const phone = asTrimmedString(sender.phone_number);
    if (phone) return phone;

    const identifier = asTrimmedString(sender.identifier);
    if (identifier) return identifier;
  }

  return null;
}

// ── classifier ────────────────────────────────────────────────────

export function classifyChatwootMessageEvent(
  payload: unknown,
  expectedInboxId: number
): ClassifyChatwootResult {
  const root = asRecord(payload);
  if (!root) return { ok: false, reason: "malformed_payload" };

  // 1. Event kind — only genuinely NEW inbound messages are candidates.
  //    Rejects message_updated, conversation_updated, status events…
  if (root.event !== "message_created") {
    return { ok: false, reason: "unsupported_event" };
  }

  // 2. Direction — counsellor/AI replies arrive as outgoing events and
  //    MUST NOT trigger the pipeline (numeric 0 == incoming in some
  //    internal payloads).
  const isIncoming =
    root.message_type === "incoming" || root.message_type === 0;
  if (!isIncoming) return { ok: false, reason: "non_incoming_message" };

  // 3. Private/internal agent notes must never reach the AI.
  //    Strict per contract: only an explicit `false` passes.
  if (root.private !== false) {
    return { ok: false, reason: "private_note" };
  }

  // 4. Sender must be the external contact — rejects counsellors
  //    ("user"), automation bots and system actors.
  const sender = asRecord(root.sender);

  const senderType = asTrimmedString(sender?.type);
  const senderPhone = asTrimmedString(sender?.phone_number);
  const senderIdentifier = asTrimmedString(sender?.identifier);

  const isAgentOrBot =
    senderType === "user" || senderType === "agent_bot";

  // 4a. WhatsApp GROUP protection (Phase 1). A message that resolves to a
  //     group JID (…@g.us / …@g.whatsapp.net / …@newsletter) anywhere in
  //     its identity chain is a shared-room message, never a student's
  //     1:1. This check runs BEFORE the usable-sender gate: a group member
  //     may carry ONLY a g.us identifier, which would otherwise fail the
  //     phone-identity gate and be misreported as sender_not_contact.
  //     Rejecting here means a synthetic "phone" is never built,
  //     normalized, persisted, or routed into a Conversation/Lead, and the
  //     reason surfaces observably as "group_message".
  const conversation = asRecord(root.conversation);
  const convContact = conversation ? asRecord(conversation.contact) : null;
  const convMeta = conversation ? asRecord(conversation.meta) : null;
  const convMetaSender = convMeta ? asRecord(convMeta.sender) : null;
  const rootContact = asRecord(root.contact);

  if (
    hasGroupJid(
      senderPhone,
      senderIdentifier,
      convContact ? asTrimmedString(convContact.phone_number) : null,
      convMetaSender ? asTrimmedString(convMetaSender.phone_number) : null,
      rootContact ? asTrimmedString(rootContact.phone_number) : null,
    )
  ) {
    return { ok: false, reason: "group_message" };
  }

  // Sender identity must be USABLE, not just present (Phase 1): a bare
  // non-phone handle is an unknown/malformed sender, never a student.
  const isExternalContact =
    !!sender &&
    !isAgentOrBot &&
    (isUsableSenderPhone(senderPhone) ||
      senderIdentifierPhone(senderIdentifier) !== null);

  if (!isExternalContact) {
    return { ok: false, reason: "sender_not_contact" };
  }

  // 5. Text-only acceptance.
  const content = asTrimmedString(root.content);
  if (!content) return { ok: false, reason: "empty_content" };

  // 6. Must originate from the configured WhatsApp API-channel inbox.
  const inboxId = conversation ? asFiniteNumber(conversation.inbox_id) : null;
  if (inboxId === null || inboxId !== expectedInboxId) {
    return { ok: false, reason: "inbox_mismatch" };
  }

  // ── Extraction (identity fields only) ───────────────────────────
  return {
    ok: true,
    observed: {
      messageId: asFiniteNumber(root.id),
      conversationId: conversation ? asFiniteNumber(conversation.id) : null,
      inboxId,
      phone: extractChatwootPhone(root, conversation),
      content,
      senderName: asTrimmedString(sender.name),
      createdAtIso: toIsoFromUnixSeconds(asFiniteNumber(root.created_at)),
    },
  };
}

function toIsoFromUnixSeconds(seconds: number | null): string | null {
  if (seconds === null || seconds <= 0) return null;
  try {
    return new Date(seconds * 1000).toISOString();
  } catch {
    return null;
  }
}
