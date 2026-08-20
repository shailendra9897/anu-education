// FILE: lib/staff/assignment.service.ts
//
// Server-side conversation assignment and ownership logic.
// The ownership gate (getConversationOwnership) is the single
// source of truth for determining whether AI may respond.
//
// Authentication is handled by app/middleware.ts.
// This service does NOT handle auth.

import prisma from "@/lib/prisma";

// ── OWNERSHIP STATE ────────────────────────────────────────────

export type ConversationOwnership =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "HANDED_OFF";

/**
 * getConversationOwnership
 * ────────────────────────
 * Deterministic ownership check. Returns the current state of a
 * conversation based on assignedCounsellorId and status.
 *
 * THIS IS THE SAFETY GATE for future WhatsApp webhook:
 *
 *   UNASSIGNED → AI may respond
 *   ASSIGNED   → AI must NOT auto-respond
 *   HANDED_OFF → AI must NOT respond
 */
export async function getConversationOwnership(
  conversationId: string,
): Promise<ConversationOwnership> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      assignedCounsellorId: true,
      status: true,
    },
  });

  if (!conversation) {
    throw new Error(`Conversation ${conversationId} not found`);
  }

  if (conversation.status === "HANDED_OFF") {
    return "HANDED_OFF";
  }

  if (conversation.assignedCounsellorId !== null) {
    return "ASSIGNED";
  }

  return "UNASSIGNED";
}

// ── ASSIGN ─────────────────────────────────────────────────────

/**
 * assignCounsellor
 * ────────────────
 * Assigns a counsellor to a conversation. Validates that both
 * the staff member and conversation exist, and that the staff
 * member is active.
 *
 * Does NOT change Conversation.status — assignment is separate
 * from handoff status.
 */
export async function assignCounsellor(
  conversationId: string,
  staffId: string,
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const staff = await prisma.staff.findUnique({ where: { id: staffId } });

  if (!staff) {
    throw new Error("Staff member not found");
  }

  if (!staff.active) {
    throw new Error("Cannot assign to an inactive staff member");
  }

  return prisma.conversation.update({
    where: { id: conversationId },
    data: { assignedCounsellorId: staffId },
  });
}

// ── RELEASE ────────────────────────────────────────────────────

/**
 * releaseCounsellor
 * ─────────────────
 * Removes counsellor ownership. Sets assignedCounsellorId to null.
 * Does NOT change Conversation.status.
 */
export async function releaseCounsellor(conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return prisma.conversation.update({
    where: { id: conversationId },
    data: { assignedCounsellorId: null },
  });
}

// ── LIST CONVERSATIONS (for admin view) ────────────────────────

export type ConversationWithOwnership = {
  id: string;
  source: string;
  status: string;
  phone: string | null;
  sessionId: string | null;
  name: string | null;
  email: string | null;
  leadScore: number | null;
  leadTier: string | null;
  assignedCounsellorId: string | null;
  assignedCounsellor: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count: {
    messages: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export async function listConversations(options?: {
  status?: string;
  assigned?: boolean | null;
  limit?: number;
  offset?: number;
}) {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  if (options?.status && options.status !== "ALL") {
    where.status = options.status;
  }

  if (options?.assigned === true) {
    where.assignedCounsellorId = { not: null };
  } else if (options?.assigned === false) {
    where.assignedCounsellorId = null;
  }

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      include: {
        assignedCounsellor: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.conversation.count({ where }),
  ]);

  return {
    conversations,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}
