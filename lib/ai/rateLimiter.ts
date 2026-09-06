// FILE: lib/ai/rateLimiter.ts
//
// ─────────────────────────────────────────────────────────────────
// /api/chat FIXED-WINDOW RATE LIMITER
//
// Purpose: protect the public AI endpoint from abuse and uncontrolled
// Groq spend. The limiter is deliberately INDEPENDENT of Groq token
// usage — a 429 decision is made BEFORE any prompt is built or any
// LLM call is made.
//
// STORE: RateLimitLog, but with C1's single-row-per-key semantics.
// Prior to C1 the limiter APPENDED one row per allowed request and
// counted rows within the fixed window (works, but is incompatible
// with the @@unique([identifier, endpoint]) index added for race-safe
// idempotency claims). Since C1 the table holds AT MOST ONE row per
// (identifier, endpoint): a `requestCount` counter and the row's
// createdAt as the window anchor. Each allowed request increments the
// counter; when the row falls outside the 60s window the counter is
// reset to 1.
//
// WINDOW / LIMITS (unchanged observable behavior):
//   window: 60 seconds
//   per client IP:         30 requests / 60s
//     (client IP here = x-forwarded-for first entry — generous enough
//      for shared office/NAT traffic while still bounding one source)
//   per conversation:      10 requests / 60s
//     (a web-chat conversation is a stable @unique sessionId/thread;
//      10 msgs/min is above any human conversational pace and boxes
//      in a single thread's Groq cost tightly)
//   GLOBAL AI bucket:      60 requests / 60s  (identifier: "global",
//     endpoint: "/ai") — a single SHARED fixed-window bucket applied to
//     every AI entry point that runs through checkChatRateLimit
//     (website /api/chat, Meta WhatsApp webhook, Chatwoot webhook).
//     It bounds the AGGREGATE AI request rate across all sources so a
//     burst of many distinct phones can never collectively exhaust the
//     shared Groq account while each stays under its own small limit.
//     Same single-row-per-key RateLimitLog semantics as the per-source
//     buckets; a limited request is never recorded into any bucket.
//
// FAIL-OPEN: any DB error in peeking/recording/pruning logs and
// returns "not limited" so a temporary database issue can never take
// the website chat entirely offline.
//
// PRUNING: rows older than 24h are deleted opportunistically, at most
// once per minute per process, to keep RateLimitLog bounded.
//
// No secrets and no message content are ever logged here.
// ─────────────────────────────────────────────────────────────────

import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// ── Configuration (explicit) ───────────────────────────────────────

export const CHAT_ENDPOINT = "/api/chat";
export const CHAT_WINDOW_MS = 60_000;
export const CHAT_IP_LIMIT = 30;
export const CHAT_CONVERSATION_LIMIT = 10;
export const LIMIT_LOG_RETENTION_MS = 24 * 60 * 60 * 1000;
export const PRUNE_INTERVAL_MS = 60_000;

// ── Global AI bucket (S4) ─────────────────────────────────────────
// Stable aggregate identifier + distinct "/ai" endpoint so the global
// single row can never collide with a per-source "/api/chat" row
// (RateLimitLog is unique on [identifier, endpoint]).
export const GLOBAL_AI_ENDPOINT = "/ai";
export const GLOBAL_AI_IDENTIFIER = "global";
export const GLOBAL_AI_LIMIT = 60;

// ── Injectable ports (tests inject fakes; prod uses RateLimitLog) ──

export type RateLimitPorts = {
  /** Count of allowed requests in the CURRENT window for a key (0 if none/stale). */
  peek(
    identifier: string,
    endpoint: string,
    windowStart: Date,
    now: Date,
  ): Promise<number>;
  /** Record one allowed request: create, reset-stale, or increment the single row. */
  record(identifier: string, endpoint: string, now: Date): Promise<unknown>;
  pruneOlderThan(until: Date): Promise<unknown>;
};

function defaultRateLimitPorts(): RateLimitPorts {
  const findRow = (identifier: string, endpoint: string) =>
    prisma.rateLimitLog.findUnique({
      where: { identifier_endpoint: { identifier, endpoint } },
    });

  return {
    peek: async (identifier, endpoint, windowStart, now) => {
      const row = await findRow(identifier, endpoint);
      if (!row) return 0;
      // Stale window → counted as 0 (the record phase resets it).
      return row.createdAt.getTime() >= windowStart.getTime()
        ? row.requestCount
        : 0;
    },
    record: async (identifier, endpoint, now) => {
      const row = await findRow(identifier, endpoint);
      if (!row) {
        return prisma.rateLimitLog.create({
          data: { identifier, endpoint, createdAt: now, requestCount: 1 },
        });
      }
      const stale =
        now.getTime() - row.createdAt.getTime() >= CHAT_WINDOW_MS;
      return prisma.rateLimitLog.update({
        where: { identifier_endpoint: { identifier, endpoint } },
        data: stale
          ? { createdAt: now, requestCount: 1 }
          : { requestCount: { increment: 1 } },
      });
    },
    pruneOlderThan: (until) =>
      prisma.rateLimitLog.deleteMany({
        where: { createdAt: { lt: until } },
      }),
  };
}

// ── Client IP extraction ────────────────────────────────────────────

export function getClientIp(req: Request | NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }

  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip")
  );
}

// ── Opportunistic pruning (throttled to once/minute/process) ───────

type PruneState = { lastPruneAt: number };

const globalForRateLimit = globalThis as typeof globalThis & {
  __chatRateLimitPrune?: PruneState;
};

async function maybePrune(ports: RateLimitPorts, now: Date): Promise<void> {
  const state =
    globalForRateLimit.__chatRateLimitPrune ??
    (globalForRateLimit.__chatRateLimitPrune = { lastPruneAt: 0 });

  if (now.getTime() - state.lastPruneAt < PRUNE_INTERVAL_MS) {
    return;
  }

  state.lastPruneAt = now.getTime();

  try {
    await ports.pruneOlderThan(
      new Date(now.getTime() - LIMIT_LOG_RETENTION_MS),
    );
  } catch (error) {
    console.error(
      "[RateLimiter] prune failed (ignored):",
      error instanceof Error ? error.message : String(error),
    );
  }
}

/** Test hook — clears the process-wide prune throttle so each test can
 * observe its own prune invocation. Not used outside tests. */
export function resetRateLimitPruneStateForTests(): void {
  globalForRateLimit.__chatRateLimitPrune = undefined;
}

// ── Public check ────────────────────────────────────────────────────

export type ChatRateCheckInput = {
  ip?: string | null;
  conversationId?: string | null;
  now?: Date;
};

export type ChatRateCheckResult = {
  limited: boolean;
};

/**
 * checkChatRateLimit
 * ──────────────────
 * Fixed-window limiter over RateLimitLog for AI entry points. Peeking happens
 * BEFORE recording (a limited request is never recorded, exactly as the
 * pre-C1 append-log behavior). If the IP key, the conversation key, OR the
 * shared GLOBAL AI bucket is at/over its limit the request is limited
 * (caller → HTTP 429). Always fail-open on DB errors.
 */
export async function checkChatRateLimit(
  input: ChatRateCheckInput,
  ports?: RateLimitPorts,
): Promise<ChatRateCheckResult> {
  const impl = { ...defaultRateLimitPorts(), ...ports };
  const now = input.now ?? new Date();

  const keys: Array<[key: string, limit: number]> = [];

  if (input.ip) {
    keys.push([`ip:${input.ip}`, CHAT_IP_LIMIT]);
  }
  if (input.conversationId) {
    keys.push([`conv:${input.conversationId}`, CHAT_CONVERSATION_LIMIT]);
  }

  const windowStart = new Date(now.getTime() - CHAT_WINDOW_MS);

  for (const [key, limit] of keys) {
    try {
      const count = await impl.peek(key, CHAT_ENDPOINT, windowStart, now);
      if (count >= limit) {
        return { limited: true };
      }
    } catch (error) {
      console.error(
        "[RateLimiter] count failed, failing open:",
        error instanceof Error ? error.message : String(error),
      );
      return { limited: false };
    }
  }

  // GLOBAL AI bucket — one shared bucket for every AI entry point so the
  // aggregate Groq spend across website / Meta / Chatwoot is bounded even
  // when many distinct sources are each under their own per-source limit.
  // Applies unconditionally (even with no IP/conversation keys present)
  // so the aggregate protection cannot be bypassed by omitting identifiers.
  try {
    const globalCount = await impl.peek(
      GLOBAL_AI_IDENTIFIER,
      GLOBAL_AI_ENDPOINT,
      windowStart,
      now,
    );
    if (globalCount >= GLOBAL_AI_LIMIT) {
      return { limited: true };
    }
  } catch (error) {
    console.error(
      "[RateLimiter] global count failed, failing open:",
      error instanceof Error ? error.message : String(error),
    );
    return { limited: false };
  }

  for (const [key] of keys) {
    try {
      await impl.record(key, CHAT_ENDPOINT, now);
    } catch (error) {
      console.error(
        "[RateLimiter] record failed, failing open:",
        error instanceof Error ? error.message : String(error),
      );
      return { limited: false };
    }
  }

  try {
    await impl.record(GLOBAL_AI_IDENTIFIER, GLOBAL_AI_ENDPOINT, now);
  } catch (error) {
    console.error(
      "[RateLimiter] global record failed, failing open:",
      error instanceof Error ? error.message : String(error),
    );
    return { limited: false };
  }

  await maybePrune(impl, now);

  return { limited: false };
}