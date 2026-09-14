// FILE: lib/staff/assignment.service.ts
//
// Server-side conversation assignment and ownership logic.
// The ownership gate (getConversationOwnership) is the single
// source of truth for determining whether AI may respond.
//
// Authentication is handled by middleware.ts + lib/auth/admin-guard.ts.
// This service does NOT handle auth.

import prisma from "@/lib/prisma";
import { MessageRole } from "@prisma/client";
import {
  COUNSELLOR_ACTION_PREFIX,
  parseActionEventContent,
  compareActionQueueItems,
  matchesActionFilter,
  type CounsellorActionState,
} from "@/lib/lead/counsellor.action";
import { deriveLeadStage, type LeadStage } from "@/lib/lead/lead.qualification";

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
  /**
   * S5-D — read-only derived counsellor action, taken from the latest
   * audit-only COUNSELLOR_ACTION SYSTEM event for the conversation
   * (null when no action was ever derived). Never a raw score/label
   * straight from the priority resolver; always the sanitised queue
   * state. Internal admin surface only.
   */
  derivedAction: {
    state: CounsellorActionState;
    course: string | null;
    reason: string;
  } | null;
  /**
   * LEAD-QUALIFICATION-AGENT-02 — presentation-only qualification stage
   * (batch-computed, compute-on-read). Approximation for the list: demos
   * and transcript intent are NOT re-fetched per page; the stage here is
   * derived from the page's leadContext + admission states only. The
   * conversation detail workspace re-derives the full stage. null when
   * no page data could be computed.
   */
  qualificationStage: LeadStage | null;
};

export type ListConversationsOptions = {
  status?: string;
  assigned?: boolean | null;
  /** S5-E — "ALL" | "FOLLOW_UP" | "PRIORITY_FOLLOW_UP" |
   *  "ADMISSION_ASSISTANCE" | "NONE" (no actionable queue item). */
  action?: string | null;
  limit?: number;
  offset?: number;
};

function latestActionByConversation(
  conversationIds: string[],
): Promise<Map<string, { state: CounsellorActionState; course: string | null; reason: string } | null>> {
  return (async () => {
    const result = new Map<string, { state: CounsellorActionState; course: string | null; reason: string } | null>();
    if (conversationIds.length === 0) return result;

    // End of the S5-D event log — the LATEST COUNSELLOR_ACTION SYSTEM audit
    // row per conversation (schema-free; these rows never reach the AI or
    // the student). orderBy desc + first-write-wins gives the latest event.
    const events = await prisma.message.findMany({
      where: {
        conversationId: { in: conversationIds },
        role: MessageRole.SYSTEM,
        content: { startsWith: COUNSELLOR_ACTION_PREFIX },
      },
      orderBy: { createdAt: "desc" },
      select: { conversationId: true, content: true },
    });

    for (const event of events) {
      if (result.has(event.conversationId)) continue;
      const parsed = parseActionEventContent(event.content);
      result.set(
        event.conversationId,
        parsed && parsed.state !== "NONE"
          ? { state: parsed.state, course: parsed.course, reason: parsed.reason }
          : null,
      );
    }

    return result;
  })();
}

export async function listConversations(options?: ListConversationsOptions) {
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

  // S5-E — queue ordering + action filter (Objective 2/3).
  //
  // The admin list is small (a local counsellor surface), so we order the
  // FULL candidate set in-app: fetch light id/activity rows, attach the
  // derived action, sort with the pure queue comparator
  // (ADMISSION_ASSISTANCE → PRIORITY_FOLLOW_UP → FOLLOW_UP → NONE/null,
  // most recently active first within a state), then apply the action
  // filter and paginate. Sorting the whole set keeps the order coherent
  // across "Load More" pages. Assignment behavior is untouched (the same
  // status/assigned filters apply) and no data is duplicated anywhere.
  const candidates = await prisma.conversation.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: { id: true, updatedAt: true },
  });

  const derivedByConversation = await latestActionByConversation(
    candidates.map((c) => c.id),
  );

  const ordered = candidates
    .map((c) => ({
      id: c.id,
      updatedAt: c.updatedAt,
      derivedAction: derivedByConversation.get(c.id) ?? null,
    }))
    .sort(compareActionQueueItems)
    .filter((item) => matchesActionFilter(options?.action, item.derivedAction));

  const total = ordered.length;
  const page = ordered.slice(offset, offset + limit);
  const pageIds = page.map((p) => p.id);

  const rows = await prisma.conversation.findMany({
    where: { id: { in: pageIds } },
    include: {
      assignedCounsellor: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  // LEAD-QUALIFICATION-AGENT-02 — lightweight list stage, batch-computed
  // with exactly 2 queries (never per-row): leadContexts by
  // conversationId + admission enrollments by leadId for this page. The
  // qualification module stays DB-free; only its pure stage derivation is
  // fed here. Transcript/demo signals are intentionally excluded to keep
  // the list cheap — the detail workspace re-derives the full stage.
  const leadContexts = await prisma.leadContext.findMany({
    where: { conversationId: { in: pageIds } },
  });
  const leadIds = rows.map((r) => r.leadId).filter((id): id is string => Boolean(id));
  const admissionsByLead = new Map<string, Array<{ course: string; state: string }>>();
  if (leadIds.length > 0) {
    const enrollments = await prisma.admissionEnrollment.findMany({
      where: { leadId: { in: leadIds } },
      select: { leadId: true, course: true, state: true },
    });
    for (const e of enrollments) {
      const list = admissionsByLead.get(e.leadId) ?? [];
      list.push({ course: e.course, state: e.state });
      admissionsByLead.set(e.leadId, list);
    }
  }
  const leadContextById = new Map(leadContexts.map((c) => [c.conversationId, c]));
  const stageByConversation = new Map<string, LeadStage>();
  for (const r of rows) {
    const leadContext = leadContextById.get(r.id) ?? undefined;
    const admissions = r.leadId && admissionsByLead.get(r.leadId)
      ? admissionsByLead.get(r.leadId)
      : undefined;
    try {
      const { stage } = deriveLeadStage({
        conversation: { id: r.id, name: r.name, status: r.status, assignedCounsellorId: r.assignedCounsellorId },
        leadContext,
        admissions,
      });
      stageByConversation.set(r.id, stage);
    } catch {
      // Pure derivation should never throw; leave the stage null so the
      // list simply omits the badge for this row.
    }
  }

  const rowById = new Map(rows.map((r) => [r.id, r]));
  const conversations = page.map((item) => ({
    ...(rowById.get(item.id) as NonNullable<(typeof rows)[number]>),
    derivedAction: item.derivedAction,
    qualificationStage: stageByConversation.get(item.id) ?? null,
  }));

  return {
    conversations,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}
