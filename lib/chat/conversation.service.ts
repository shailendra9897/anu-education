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
import type { Conversation } from "@prisma/client";
import prisma from "../prisma";

// ── INPUT TYPE ──────────────────────────────────────────────────
export interface FindOrCreateConversationInput {
  phone?:      string;              // E.164 format, e.g. "+919428186817"
  sessionId?:  string;               // web widget session token
  source:      ConversationSource;   // "WEB" | "WHATSAPP"
  sourcePage?: string;               // e.g. "/test-prep/gmat"
}

// ── PUBLIC API ────────────────────────────────────────────────────

/**
 * findOrCreateConversation
 * ─────────────────────────
 * The single entry point for both the website chat widget and the
 * WhatsApp webhook. Given phone and/or sessionId, returns the
 * existing conversation if one matches, otherwise creates a new one.
 *
 * See the file-header diagram above for the exact lookup order.
 */
export async function findOrCreateConversation(
  input: FindOrCreateConversationInput
): Promise<Conversation> {
  const { phone, sessionId, source, sourcePage } = input;

  // 1. Phone exists? → look for a matching conversation.
  //    Only ACTIVE or HANDED_OFF conversations count as "the same
  //    ongoing thread" — a CLOSED/ARCHIVED one means the student's
  //    previous enquiry wrapped up, so a new message starts fresh.
  if (phone) {
    const byPhone = await prisma.conversation.findFirst({
      where: {
        phone,
        status: { in: ["ACTIVE", "HANDED_OFF"] },
        deletedAt: null,
      },
      orderBy: { updatedAt: "desc" },
    });
    if (byPhone) return byPhone;
  }

  // 2. Session exists? → look for a matching conversation.
  //    sessionId is @unique in the schema, so at most one can match.
  if (sessionId) {
    const bySession = await prisma.conversation.findUnique({
      where: { sessionId },
    });
    if (bySession && !bySession.deletedAt) return bySession;
  }

  // 3. No match → create a new conversation.
  return prisma.conversation.create({
    data: {
      phone,
      sessionId,
      source,
      sourcePage,
    },
  });
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
