// FILE: lib/whatsapp/evolution.idempotency.ts
//
// Evolution inbound duplicate-protection service.
// Prevents the same Evolution/Baileys message id from being processed
// more than once across webhook redeliveries, retries, or concurrent
// invocations.
//
// Two-tier strategy — the SAME mechanism as the Meta and Chatwoot
// paths (it deliberately mirrors lib/whatsapp/idempotency.ts and
// lib/chatwoot/idempotency.ts; NO new database system is introduced):
//
//   TIER 1 (memory): globalThis TTL Map — fast path, collapses
//     concurrent deliveries within a warm process.
//
//   TIER 2 (database): rows in the EXISTING Prisma RateLimitLog model
//     with identifier = "evo-msg:<messageId>" and endpoint =
//     "/api/webhook/evolution". RateLimitLog is unique on
//     [identifier, endpoint], so a concurrent claim of the same key
//     yields a P2002 unique violation on the loser — treated as an
//     already-claimed duplicate, never a fresh claim.
//
// SECURITY:
//   - Never log webhook secrets.
//   - Never log message content.
//   - Never log API tokens.
//   - Message ID may appear in operational logs as an opaque key.

import prisma from "../prisma";

const CLAIM_PREFIX = "evo-msg:";
const CLAIM_ENDPOINT = "/api/webhook/evolution";
const MEMORY_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MEMORY_MAX_ENTRIES = 5000;

type MemoryClaims = Map<string, number>; // key → claimedAt epoch ms

const globalForIdempotency = globalThis as typeof globalThis & {
  __evolutionWebhookIdempotency?: MemoryClaims;
};

function getMemoryClaims(): MemoryClaims {
  if (!globalForIdempotency.__evolutionWebhookIdempotency) {
    globalForIdempotency.__evolutionWebhookIdempotency = new Map();
  }
  return globalForIdempotency.__evolutionWebhookIdempotency;
}

/** Test hook — wipes the in-memory tier between tests. */
export function resetInMemoryClaimsForTests(): void {
  getMemoryClaims().clear();
}

// ── INJECTABLE PORTS ──────────────────────────────────────────────

export type EvolutionIdempotencyDeps = {
  findMarkers?: (key: string) => Promise<unknown[]>;
  insertMarker?: (key: string) => Promise<unknown>;
  deleteMarkers?: (key: string) => Promise<unknown>;
};

function defaultDeps(): Required<EvolutionIdempotencyDeps> {
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
 * claimEvolutionMessageProcessing
 * ───────────────────────────────
 * Returns true if THIS call is granted the right to process the
 * message; false if it was already processed (duplicate). Never throws
 * — an idempotency-store outage must not crash the webhook; in that
 * case we fail over to the memory tier only (same semantics as the
 * Meta/Chatwoot paths).
 */
export async function claimEvolutionMessageProcessing(
  messageId: string,
  deps?: EvolutionIdempotencyDeps
): Promise<boolean> {
  const impl = { ...defaultDeps(), ...deps };
  const key = `${CLAIM_PREFIX}${messageId}`;
  const now = Date.now();

  // Tier 1 — memory.
  const claims = getMemoryClaims();
  if (claims.has(key)) return false;

  // Tier 2 — database (race-safe via @@unique([identifier, endpoint])).
  try {
    const existing = await impl.findMarkers(key);
    if (existing && existing.length > 0) {
      seedMemory(claims, key, now);
      return false;
    }
    await impl.insertMarker(key);
  } catch (error) {
    // P2002 → another instance claimed the same key first. That is NOT a
    // DB outage — treat as already-claimed (duplicate), never as a fresh
    // claim (failing open here would double-process the message).
    if (isUniqueViolation(error)) {
      seedMemory(claims, key, now);
      return false;
    }
    console.error(
      "[Evolution Webhook] idempotency DB tier unavailable, continuing with memory tier only",
      error instanceof Error ? error.message : error
    );
  }

  seedMemory(claims, key, now);
  return true;
}

/**
 * releaseEvolutionMessageClaim
 * ────────────────────────────
 * Rolls back a claim after a GENUINE processing failure so Evolution's
 * retry can be processed again. Only called when no reply reached the
 * student — never after a successful AI response/send (that would
 * create duplicates).
 */
export async function releaseEvolutionMessageClaim(
  messageId: string,
  deps?: EvolutionIdempotencyDeps
): Promise<void> {
  const impl = { ...defaultDeps(), ...deps };
  const key = `${CLAIM_PREFIX}${messageId}`;

  getMemoryClaims().delete(key);

  try {
    await impl.deleteMarkers(key);
  } catch (error) {
    console.error(
      "[Evolution Webhook] failed to release idempotency claim",
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
  // Opportunistic eviction of expired entries keeps the map bounded.
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