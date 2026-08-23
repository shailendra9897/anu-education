// FILE: lib/whatsapp/idempotency.ts
//
// ─────────────────────────────────────────────────────────────────
// PHASE 2 — DUPLICATE PROTECTION
//
// Meta redelivers webhooks aggressively until it sees HTTP 200, and
// coexistence can deliver overlapping events from both the Cloud API
// and the Business App. The WhatsApp message ID ("wamid.…") is used
// as the idempotency key: one message → at most one Conversation
// message, one AI call, one WhatsApp reply.
//
// NO SUITABLE DEDICATED MODEL EXISTS in prisma/schema.prisma (Message
// has no provider-ID column) and this task forbids adding a
// migration. Strategy instead — two cooperating tiers:
//
//   TIER 1 (memory): per-process TTL map on globalThis. Fast path,
//     also collapses concurrent deliveries of the same wamid within
//     one warm server instance. Lost on cold start.
//
//   TIER 2 (database): rows in the existing RateLimitLog model with
//     identifier = "wa-msg:<messageId>" and endpoint =
//     "/api/webhook/whatsapp". RateLimitLog is currently referenced
//     by no other code (verified by repo-wide grep) and is indexed
//     on [identifier, endpoint, createdAt], making it a usable
//     durable marker store WITHOUT any schema change.
//
// KNOWN LIMITATIONS (documented deliberately):
//   1. RateLimitLog has NO unique constraint on identifier, so two
//      cold serverless instances processing the same message in the
//      same instant could both pass the existence check before either
//      inserts. The memory tier closes this window within a warm
//      instance; cross-instance races remain theoretically possible
//      but practically rare (Meta retries are spaced, not parallel).
//      A future migration adding `@@unique` or a WebhookEvent model
//      would eliminate this entirely.
//   2. In-memory claims are lost on restart/cold start; the DB tier
//     covers those cases.
//   3. DB markers are never garbage-collected (it is an append-only
//     log table); volume equals one small row per inbound WhatsApp
//     text message.
// ─────────────────────────────────────────────────────────────────

import prisma from "../prisma";

const CLAIM_PREFIX = "wa-msg:";
const CLAIM_ENDPOINT = "/api/webhook/whatsapp";
const MEMORY_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MEMORY_MAX_ENTRIES = 5000;

type MemoryClaims = Map<string, number>; // key → claimedAt epoch ms

const globalForIdempotency = globalThis as typeof globalThis & {
  __whatsappWebhookIdempotency?: MemoryClaims;
};

function getMemoryClaims(): MemoryClaims {
  if (!globalForIdempotency.__whatsappWebhookIdempotency) {
    globalForIdempotency.__whatsappWebhookIdempotency = new Map();
  }
  return globalForIdempotency.__whatsappWebhookIdempotency;
}

export function claimKeyFor(messageId: string): string {
  return `${CLAIM_PREFIX}${messageId}`;
}

/** Test hook — wipes the in-memory tier between tests. */
export function resetInMemoryClaimsForTests(): void {
  getMemoryClaims().clear();
}

// ── INJECTABLE PORTS ──────────────────────────────────────────────

export type IdempotencyDeps = {
  findMarkers?: (key: string) => Promise<unknown[]>;
  insertMarker?: (key: string) => Promise<unknown>;
  deleteMarkers?: (key: string) => Promise<unknown>;
};

function defaultDeps(): Required<IdempotencyDeps> {
  return {
    findMarkers: (key: string) =>
      prisma.rateLimitLog.findMany({
        where: { identifier: key, endpoint: CLAIM_ENDPOINT },
        select: { id: true },
        take: 1,
      }),
    insertMarker: (key: string) =>
      prisma.rateLimitLog.create({
        data: { identifier: key, endpoint: CLAIM_ENDPOINT },
      }),
    deleteMarkers: (key: string) =>
      prisma.rateLimitLog.deleteMany({
        where: { identifier: key, endpoint: CLAIM_ENDPOINT },
      }),
  };
}

// ── PUBLIC API ────────────────────────────────────────────────────

/**
 * claimWhatsAppMessageProcessing
 * ──────────────────────────────
 * Returns true if THIS call is granted the right to process the
 * message; false if it was already processed (duplicate). Never
 * throws — an idempotency-store outage must not crash the webhook;
 * in that case we fail open to the memory tier only.
 */
export async function claimWhatsAppMessageProcessing(
  messageId: string,
  deps?: IdempotencyDeps
): Promise<boolean> {
  const impl = { ...defaultDeps(), ...deps };
  const key = claimKeyFor(messageId);
  const now = Date.now();

  // Tier 1 — memory.
  const claims = getMemoryClaims();
  if (claims.has(key)) {
    return false;
  }

  // Tier 2 — database.
  try {
    const existing = await impl.findMarkers(key);
    if (existing && existing.length > 0) {
      seedMemory(claims, key, now);
      return false;
    }
    await impl.insertMarker(key);
  } catch (error) {
    console.error(
      "[WhatsApp Webhook] idempotency DB tier unavailable, continuing with memory tier only",
      error instanceof Error ? error.message : error
    );
  }

  seedMemory(claims, key, now);
  return true;
}

/**
 * releaseWhatsAppMessageClaim
 * ───────────────────────────
 * Rolls back a claim after a GENUINE processing failure so Meta's
 * retry can be processed again. Only called when no reply reached the
 * student — never after a successful AI response/send (that would
 * create duplicates).
 */
export async function releaseWhatsAppMessageClaim(
  messageId: string,
  deps?: IdempotencyDeps
): Promise<void> {
  const impl = { ...defaultDeps(), ...deps };
  const key = claimKeyFor(messageId);

  getMemoryClaims().delete(key);

  try {
    await impl.deleteMarkers(key);
  } catch (error) {
    console.error(
      "[WhatsApp Webhook] failed to release idempotency claim",
      error instanceof Error ? error.message : error
    );
  }
}

// ── INTERNAL ─────────────────────────────────────────────────────

function seedMemory(claims: MemoryClaims, key: string, now: number): void {
  // Opportunistic eviction of expired entries keeps the map bounded.
  if (claims.size >= MEMORY_MAX_ENTRIES) {
    for (const [k, claimedAt] of claims) {
      if (now - claimedAt > MEMORY_TTL_MS) claims.delete(k);
    }
    while (claims.size >= MEMORY_MAX_ENTRIES) {
      // Map preserves insertion order → first key is oldest.
      const oldest = claims.keys().next().value;
      if (oldest === undefined) break;
      claims.delete(oldest);
    }
  }
  claims.set(key, now);
}
