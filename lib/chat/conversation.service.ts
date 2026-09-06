// FILE: lib/conversation.service.ts
//
// ─────────────────────────────────────────────────────────────────
// Conversation lookup/creation logic — used by website chat, the
// WhatsApp webhook, and (read-only) by CRM/Admin views.
//
// RENAMED from conversation.ts → conversation.service.ts to signal
// this is a service module (business logic over the DB), not a raw
// data-access file — consistent with how the rest of the codebase
// separates lib/assessment/*Engine.ts (logic) from lib/prisma.ts
// (connection).
//
// CORE LOGIC — deliberately this simple, nothing more:
//
//   findOrCreateConversation({ phone, sessionId, source, sourcePage })
//
//   Phone provided?
//     ├─ Yes → matching conversation exists? → return it
//     │         no match → fall through to sessionId check
//     └─ No  → skip straight to sessionId check
//
//   sessionId provided?
//     ├─ Yes → matching conversation exists? → return it
//     │         no match → create new
//     └─ No  → create new
//
//   No match at all → create new conversation
//
// WHY PHONE IS CHECKED BEFORE SESSION ID:
//   A phone number identifies a real person across devices and
//   channels (a student can start on WhatsApp, later open the
//   website chat, and it's still THE SAME LEAD). A sessionId only
//   identifies one anonymous browser tab. Phone is the stronger,
//   more durable identity signal, so it's checked first.
// ─────────────────────────────────────────────────────────────────

import { ConversationSource } from "@prisma/client";
import type { Conversation, Prisma } from "@prisma/client";
import prisma from "../prisma";
import { ensureLeadLinkedToConversation } from "../lead/lead.identity.service";

// ── INPUT TYPE ──────────────────────────────────────────────────
export interface FindOrCreateConversationInput {
  phone?:      string;              // E.164 format, e.g. "+919428186817"
  sessionId?:  string;               // web widget session token
  source:      ConversationSource;   // "WEB" | "WHATSAPP"
  sourcePage?: string;               // e.g. "/test-prep/gmat"
}

// ── PUBLIC API ────────────────────────────────────────────────────

/**
 * Return type for findOrCreateConversation.
 *
 * `created` tells the caller whether the conversation was NEWLY created
 * by this call (true) or an existing conversation was reused (false).
 * This is what lets the WhatsApp bridge deliver a genuine first-contact
 * acknowledgement exactly once per new WhatsApp thread, while never
 * repeating it for existing conversations.
 *
 * The `conversation` field carries the same shape as before, so existing
 * callers only need to read `.conversation` (plus optionally `.created`).
 */
export type FindOrCreateConversationResult = {
  conversation: Conversation;
  created: boolean;
};

/**
 * The WHERE clause used for the "phone" lookup.
 *
 * Phase 7 source scoping: for source="WHATSAPP" the match is restricted
 * to WHATSAPP conversations, so a WEB conversation can never be reused
 * by a WhatsApp thread. For source="WEB" the match is intentionally
 * UNCHANGED (any source), preserving website chat behavior.
 *
 * In both cases only ACTIVE or HANDED_OFF, non-deleted conversations are
 * eligible — a CLOSED/ARCHIVED one means the previous enquiry wrapped up.
 *
 * Safety (Phase 1): a phone-based lookup REQUIRES a valid routing phone.
 * Returns null for undefined/null/blank input so callers NEVER fall back
 * to a broad `findFirst` without a phone condition — that would match the
 * most recently updated WHATSAPP conversation in the whole database and
 * leak one student's thread into another's.
 */
export function buildPhoneLookupWhere(input: {
  phone?: string;
  source: ConversationSource;
}): Prisma.ConversationWhereInput | null {
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  if (!phone) {
    return null;
  }
  return {
    phone,
    ...(input.source === "WHATSAPP" ? { source: input.source } : {}),
    status: { in: ["ACTIVE", "HANDED_OFF"] },
    deletedAt: null,
  } as Prisma.ConversationWhereInput;
}

/**
 * Pure orchestration core of findOrCreateConversation.
 *
 * Exposed for deterministic unit testing without a database: the real
 * prisma-backed service (findOrCreateConversation) and tests share this
 * exact decision logic through injected lookup/create ports.
 */
export type ConversationResolvePorts = {
  findByPhone(where: Prisma.ConversationWhereInput): Promise<Conversation | null>;
  findBySession(sessionId: string): Promise<Conversation | null>;
  create(data: {
    phone?: string;
    sessionId?: string | null;
    source: ConversationSource;
    sourcePage?: string | null;
  }): Promise<Conversation>;
};

export async function resolveConversation(
  input: FindOrCreateConversationInput,
  db: ConversationResolvePorts
): Promise<FindOrCreateConversationResult> {
  const { phone, sessionId, source } = input;

  // 1. Phone exists? → look for a matching conversation.
  //    buildPhoneLookupWhere requires a valid routing phone and returns
  //    null otherwise, so a phone-less/blank lookup is NEVER executed.
  if (phone) {
    const phoneWhere = buildPhoneLookupWhere({ phone, source });
    if (phoneWhere) {
      const byPhone = await db.findByPhone(phoneWhere);
      if (byPhone) return { conversation: byPhone, created: false };
    }
  }

  // 2. Session exists? → look for a matching conversation.
  //    sessionId is @unique in the schema, so at most one can match.
  if (sessionId) {
    const bySession = await db.findBySession(sessionId);
    if (bySession && !bySession.deletedAt) {
      return { conversation: bySession, created: false };
    }
  }

  // 3. No match → create a new conversation.
  const created = await db.create({
    phone,
    sessionId: sessionId ?? null,
    source,
    sourcePage: input.sourcePage ?? null,
  });
  return { conversation: created, created: true };
}

/**
 * findOrCreateConversation
 * ─────────────────────────
 * The single entry point for both the website chat widget and the
 * WhatsApp webhook. Given phone and/or sessionId, returns the
 * existing conversation if one matches, otherwise creates a new one.
 *
 * See the file-header diagram above for the exact lookup order.
 *
 * SOURCE SCOPING (Phase 7):
 *   For source="WHATSAPP" the phone match is constrained to WHATSAPP
 *   conversations only. This prevents a WhatsApp inbound message from
 *   silently reusing an unrelated WEB conversation (and its stale demo
 *   bookings / ownership / lead state). If no WHATSAPP conversation
 *   exists for the phone, a new WHATSAPP conversation is created.
 *   A WEB conversation is never re-used for a WhatsApp thread.
 *
 *   For source="WEB" behavior is intentionally UNCHANGED (phone match
 *   across sources, then sessionId), preserving website chat semantics.
 *
 * CANONICAL CRM IDENTITY (Phase 3C / C1):
 *   Once a conversation is resolved/created, it is linked to the
 *   canonical Lead when the conversation carries a phone or email
 *   (WHATSAPP inbound always does). Linking NEVER changes which
 *   conversation is returned — a WEB conversation is still NEVER
 *   reused by WhatsApp. The Lead is the identity layer ABOVE
 *   conversations; conversation reuse stays exactly as documented.
 *   Anonymous web rows (no phone/email yet) are left unlinked.
 */
export async function findOrCreateConversation(
  input: FindOrCreateConversationInput
): Promise<FindOrCreateConversationResult> {
  const result = await resolveConversation(input, {
    findByPhone: (where) =>
      prisma.conversation.findFirst({
        where,
        orderBy: { updatedAt: "desc" },
      }),
    findBySession: (sessionId) =>
      prisma.conversation.findUnique({ where: { sessionId } }),
    create: (data) => prisma.conversation.create({ data }),
  });

  // C1 — canonical CRM identity link (best-effort, non-blocking).
  const conversation = result.conversation;
  if (conversation.phone || conversation.email) {
    const linked = await ensureLeadLinkedToConversation({
      conversationId: conversation.id,
      knownConversation: conversation,
      identitySource: input.source === "WHATSAPP" ? "WHATSAPP" : "WEB",
    });
    return { conversation: linked.conversation, created: result.created };
  }

  return result;
}

/**
 * getConversation
 * ───────────────
 * Simple lookup by id — used by CRM/Admin views and by the
 * WhatsApp webhook when a message references a known conversation.
 */
export async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
  });
}

/**
 * touchConversation
 * ──────────────────
 * Bumps `updatedAt` — call this whenever a new message is added, so
 * findOrCreateConversation's "most recently updated" ordering (and
 * any "active conversations" CRM view) stays accurate.
 */
export async function touchConversation(
  conversationId: string
): Promise<Conversation> {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
}
