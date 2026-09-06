// FILE: lib/chatwoot/idempotency.ts
//
// Chatwoot duplicate-protection service.
// Prevents the same Chatwoot message from being processed more than
// once across redeliveries, retries, or concurrent invocations.
//
// Two-tier strategy (mirrors lib/whatsapp/idempotency.ts):
//
//   TIER 1 (memory): globalThis TTL Map — fast path, collapses
//     concurrent deliveries within a warm process.
//
//   TIER 2 (database): rows in the existing Prisma RateLimitLog
//     model with identifier = "cw-msg:<messageId>" and endpoint =
//     "/api/webhook/chatwoot". No schema change required.
//
// SECURITY:
//   - Never log Chatwoot webhook secrets.
//   - Never log message content.
//   - Never log API tokens.
//   - Message ID may appear in operational logs as an opaque key.

import prisma from "../prisma";

const CLAIM_PREFIX = "cw-msg:";
const CLAIM_ENDPOINT = "/api/webhook/chatwoot";
const MEMORY_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MEMORY_MAX_ENTRIES = 5000;

type MemoryClaims = Map<string, number>; // key → claimedAt epoch ms

const globalForIdempotency = globalThis as typeof globalThis & {
  __chatwootWebhookIdempotency?: MemoryClaims;
};

function getMemoryClaims(): MemoryClaims {
  if (!globalForIdempotency.__chatwootWebhookIdempotency) {
    globalForIdempotency.__chatwootWebhookIdempotency = new Map();
  }
  return globalForIdempotency.__chatwootWebhookIdempotency;
}

/** Test hook — wipes the in-memory tier between tests. */
export function resetInMemoryClaimsForTests(): void {
  getMemoryClaims().clear();
}

// ── INJECTABLE PORTS ──────────────────────────────────────────────

export type ChatwootIdempotencyDeps = {
  findMarkers?: (key: string) => Promise<unknown[]>;
  insertMarker?: (key: string) => Promise<unknown>;
  deleteMarkers?: (key: string) => Promise<unknown>;
};

function defaultDeps(): Required<ChatwootIdempotencyDeps> {
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
 * claimChatwootMessageProcessing
 * ─────────────────────────────
 * Returns true if THIS call is granted the right to process the
 * Chatwoot message; false if it was already processed (duplicate).
 * Never throws — a DB outage must not crash the webhook handler;
 * in that case we fall back to the memory tier.
 */
export async function claimChatwootMessageProcessing(
  messageId: string,
  deps?: ChatwootIdempotencyDeps
): Promise<boolean> {
  const impl = { ...defaultDeps(), ...deps };
  const key = `${CLAIM_PREFIX}${messageId}`;
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
    // C1 — race-safe dedup via @@unique([identifier, endpoint]): two
    // instances inserting the same new key → P2002 on the loser. That
    // is NOT a DB outage; treat as already-claimed (duplicate), never
    // as a fresh claim (failing open here would double-process).
    if (isUniqueViolation(error)) {
      seedMemory(claims, key, now);
      return false;
    }
    console.error(
      "[Chatwoot Webhook] idempotency DB tier unavailable, continuing with memory tier only",
      error instanceof Error ? error.message : error
    );
  }

  seedMemory(claims, key, now);
  return true;
}

/**
 * releaseChatwootMessageClaim
 * ───────────────────────────
 * Removes both the memory claim and any matching DB marker.
 * Used when a genuine processing failure means the message should
 * be eligible for reprocessing on a retry. Never throws.
 */
export async function releaseChatwootMessageClaim(
  messageId: string,
  deps?: ChatwootIdempotencyDeps
): Promise<void> {
  const impl = { ...defaultDeps(), ...deps };
  const key = `${CLAIM_PREFIX}${messageId}`;

  getMemoryClaims().delete(key);

  try {
    await impl.deleteMarkers(key);
  } catch (error) {
    console.error(
      "[Chatwoot Webhook] failed to release idempotency claim",
      error instanceof Error ? error.message : error
    );
  }
}

// ── INTERNAL ─────────────────────────────────────────────────────

/** true when the error is a Prisma P2002 unique-constraint violation. */
function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === "P2002";
}

function seedMemory(claims: MemoryClaims, key: string, now: number): void {
  if (claims.size >= MEMORY_MAX_ENTRIES) {
    for (const [k, claimedAt] of claims) {
      if (now - claimedAt > MEMORY_TTL_MS) claims.delete(k);
    }
    while (claims.size >= MEMORY_MAX_ENTRIES) {
      const oldest = claims.keys().next().value;
      if (oldest === undefined) break;
      claims.delete(oldest);
    }
  }
  claims.set(key, now);
}
