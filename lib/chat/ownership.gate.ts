// FILE: lib/chat/ownership.gate.ts
//
// ─────────────────────────────────────────────────────────────────
// WEB CHAT OWNERSHIP GATE
//
// Mirrors the WhatsApp / Chatwoot ownership safety rule for the
// website chat endpoint. The single source of truth for "can the AI
// respond?" is lib/staff/assignment.service.getConversationOwnership:
//
//   UNASSIGNED → allow AI
//   ASSIGNED   → AI MUST NOT run; caller persists the USER message
//                and returns the fixed counsellor-hold reply
//   HANDED_OFF → AI MUST NOT run; caller persists the USER message
//                and returns the fixed counsellor-hold reply
//
// The decision logic is pure and dependency-injected
// (evaluateOwnershipGate) so it is fully unit-testable without a
// database; assertAiMayRespond is the real prisma-backed binding the
// /api/chat route calls.
//
// Richer handoff triggers (HandoffTrigger) are intentionally NOT
// introduced here — that work is deferred.
// ─────────────────────────────────────────────────────────────────

import { getConversationOwnership } from "@/lib/staff/assignment.service";
import type { ConversationOwnership } from "@/lib/staff/assignment.service";

export const COUNSELLOR_HOLD_REPLY =
  "A counsellor from ANU Education is now handling this conversation and will reply here shortly.";

export type OwnershipGatePorts = {
  getOwnership(conversationId: string): Promise<ConversationOwnership>;
};

export type OwnershipGateDecision =
  | { outcome: "allow_ai" }
  | {
      outcome: "counsellor_hold";
      reason: ConversationOwnership;
      reply: string;
    };

/**
 * evaluateOwnershipGate
 * ──────────────────────
 * Pure decision core. Given a conversation id + an ownership reader,
 * returns whether AI may respond or whether the caller must hold the
 * conversation (with the fixed counsellor reply). Only UNASSIGNED
 * conversations reach the AI.
 */
export async function evaluateOwnershipGate(
  conversationId: string,
  ports: OwnershipGatePorts,
): Promise<OwnershipGateDecision> {
  const ownership = await ports.getOwnership(conversationId);

  if (ownership === "UNASSIGNED") {
    return { outcome: "allow_ai" };
  }

  return {
    outcome: "counsellor_hold",
    reason: ownership,
    reply: COUNSELLOR_HOLD_REPLY,
  };
}

/**
 * assertAiMayRespond
 * ──────────────────
 * Real binding used by app/api/chat/route.ts. Throws if the
 * conversation does not exist (getConversationOwnership throws).
 */
export async function assertAiMayRespond(
  conversationId: string,
): Promise<OwnershipGateDecision> {
  return evaluateOwnershipGate(conversationId, {
    getOwnership: getConversationOwnership,
  });
}