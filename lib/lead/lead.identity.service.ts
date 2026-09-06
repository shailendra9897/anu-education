// FILE: lib/lead/lead.identity.service.ts
//
// ─────────────────────────────────────────────────────────────────
// PHASE 3C / C1 — CANONICAL CRM IDENTITY
//
// One Lead = one real person/student, recognized the same way across
// the website chat and WhatsApp. Each channel keeps its own
// Conversation row (reuse stays source-scoped in
// conversation.service.ts); the Lead is the layer ABOVE conversations
// that answers "is this the same student?".
//
// MATCHING ORDER (requirement 4):
//   1. normalized phone   → Lead.phone  (E.164 via normalizeIndianPhone)
//   2. normalized email   → Lead.email  (@unique)
//   3. explicit Lead ID   → Lead.id     (caller already resolved one)
//   4. create new Lead    → with whatever (name/phone/email) is known
//
// NON-OVERWRITE RULE: once a Lead is found, we NEVER mutate its
// fields from a different channel. A WhatsApp message matched by phone
// does NOT copy a website-only email onto the Lead (that could be a
// sibling/parent sharing the number — ambiguity is recorded, not
// guessed). Lead fields are only populated at creation time. A Lead
// found by phone with a null email stays null until matched directly.
//
// ANONYMOUS SAFETY: a conversation with neither phone nor email (e.g.
// fresh web session) is returned unchanged — we never force-create a
// Lead from no identity.
//
// Tests inject fake ports (no Prisma, matching the repo convention).
// ─────────────────────────────────────────────────────────────────

import type { Conversation, Lead, LeadIdentitySource } from "@prisma/client";
import { normalizeIndianPhone } from "../whatsapp/phone";
import prisma from "../prisma";

// ── NORMALIZATION ──────────────────────────────────────────────────

/**
 * normalizeIdentityPhone
 * Reuses the WhatsApp phone normalizer so WEB and WHATSAPP agree on the
 * storage form ("+91..." E.164). Returns null for unusable input — a
 * phone that does not normalize is never used for matching or stored.
 */
export function normalizeIdentityPhone(input: unknown): string | null {
  if (typeof input !== "string" || !input.trim()) return null;
  const result = normalizeIndianPhone(input);
  return result.ok ? result.e164 : null;
}

/**
 * normalizeIdentityEmail
 * Lowercases + trims; basic structural guard. Null for unusable input.
 */
export function normalizeIdentityEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const email = input.trim().toLowerCase();
  if (!email || email.length > 320) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

// ── PORTS ──────────────────────────────────────────────────────────

export type LeadPorts = {
  findLeadByPhone(phone: string): Promise<Lead | null>;
  findLeadByEmail(email: string): Promise<Lead | null>;
  findLeadById(id: string): Promise<Lead | null>;
  createLead(input: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    identitySource?: LeadIdentitySource | null;
  }): Promise<Lead>;
};

function defaultLeadPorts(): LeadPorts {
  return {
    // phone is intentionally not @unique — duplicate numbers exist in
    // real data. Earliest Lead wins (deterministic, safe).
    findLeadByPhone: (phone) =>
      prisma.lead.findFirst({
        where: { phone },
        orderBy: { createdAt: "asc" },
      }),
    findLeadByEmail: (email) => prisma.lead.findUnique({ where: { email } }),
    findLeadById: (id) => prisma.lead.findUnique({ where: { id } }),
    createLead: async (data) => {
      try {
        return await prisma.lead.create({ data });
      } catch (error) {
        // Risk-free create, race-safe: WEB + WHATSAPP can create the
        // same new person simultaneously → the email unique index throws
        // P2002 on the loser. Re-find instead of failing / double-creating.
        if (
          (error as { code?: string } | null)?.code === "P2002" &&
          data.email
        ) {
          const existing = await prisma.lead.findUnique({
            where: { email: data.email },
          });
          if (existing) return existing;
        }
        throw error;
      }
    },
  };
}

// ── PURE RESOLVER (DB-free, fully unit-testable) ──────────────────

export type ResolveLeadInput = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  explicitLeadId?: string | null;
  identitySource?: LeadIdentitySource | null;
};

/**
 * resolveLeadForIdentity
 * The matching decision core, dependency-injected per match order:
 * explicit Lead ID → normalized phone → normalized email → create.
 * Never overwrites fields on an existing Lead.
 */
export async function resolveLeadForIdentity(
  input: ResolveLeadInput,
  ports: LeadPorts,
): Promise<{ lead: Lead; created: boolean }> {
  // 3. Explicit Lead ID (highest precedence among lookups).
  if (input.explicitLeadId) {
    const byId = await ports.findLeadById(input.explicitLeadId);
    if (byId) return { lead: byId, created: false };
  }

  // 1. Normalized phone.
  const phone = normalizeIdentityPhone(input.phone);
  if (phone) {
    const byPhone = await ports.findLeadByPhone(phone);
    if (byPhone) return { lead: byPhone, created: false };
  }

  // 2. Normalized email.
  const email = normalizeIdentityEmail(input.email);
  if (email) {
    const byEmail = await ports.findLeadByEmail(email);
    if (byEmail) return { lead: byEmail, created: false };
  }

  // 4. Create new.
  const created = await ports.createLead({
    name: input.name ? input.name.trim() : null,
    phone,
    email,
    identitySource: input.identitySource,
  });
  return { lead: created, created: true };
}

// ── CONVERSATION LINKING (real, prisma-backed) ────────────────────

export type EnsureLeadPorts = LeadPorts & {
  findConversation(id: string): Promise<Conversation | null>;
  setConversationLead(id: string, leadId: string): Promise<Conversation>;
};

function defaultEnsureLeadPorts(): EnsureLeadPorts {
  return {
    ...defaultLeadPorts(),
    findConversation: (id) => prisma.conversation.findUnique({ where: { id } }),
    setConversationLead: (id, leadId) =>
      prisma.conversation.update({ where: { id }, data: { leadId } }),
  };
}

export type EnsureLeadLinkedInput = {
  conversationId: string;
  explicitLeadId?: string | null;
  identitySource?: LeadIdentitySource | null;
  /** Preloaded fresh conversation row — skips the initial re-fetch. */
  knownConversation?: Conversation | null;
};

/**
 * ensureLeadLinkedToConversation
 * ─────────────────────────────────
 * Guarantees `conversation.leadId` points at a canonical Lead:
 *   • already linked          → returns (lead, conversation)
 *   • no phone/email identity → returns (null, conversation) — anonymous
 *   • otherwise               → resolve-or-create Lead, write leadId
 *
 * Follows the non-overwrite rule: linking NEVER copies email/name from
 * one channel onto a Lead matched via a different signal.
 */
export async function ensureLeadLinkedToConversation(
  input: EnsureLeadLinkedInput,
  ports?: EnsureLeadPorts,
): Promise<{ lead: Lead | null; conversation: Conversation }> {
  const db = ports ?? defaultEnsureLeadPorts();

  const conversation =
    input.knownConversation ?? (await db.findConversation(input.conversationId));
  if (!conversation) {
    throw new Error(`conversation not found: ${input.conversationId}`);
  }

  if (conversation.leadId) {
    const lead = await db.findLeadById(conversation.leadId);
    return { lead, conversation };
  }

  const phone = normalizeIdentityPhone(conversation.phone);
  const email = normalizeIdentityEmail(conversation.email);
  if (!phone && !email && !input.explicitLeadId) {
    // Anonymous visitor (fresh web session, no details yet).
    return { lead: null, conversation };
  }

  const { lead } = await resolveLeadForIdentity(
    {
      name: conversation.name,
      phone: conversation.phone,
      email: conversation.email,
      explicitLeadId: input.explicitLeadId,
      identitySource: input.identitySource,
    } satisfies ResolveLeadInput,
    db,
  );

  const updated = await db.setConversationLead(conversation.id, lead.id);
  return { lead, conversation: updated };
}