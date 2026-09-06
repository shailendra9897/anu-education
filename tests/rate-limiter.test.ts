// FILE: tests/rate-limiter.test.ts
//
// Fixed-window /api/chat rate limiter (WP-B3, updated for C1).
// C1 changed the store from an append-log to a single-row-per-key
// sliding window (RateLimitLog @@unique([identifier, endpoint]) +
// requestCount counter). The OBSERVABLE limiter behavior is unchanged:
// same 30/60s per-IP and 10/60s per-conversation limits, fail-open on
// DB errors, opportunistic pruning. Uses injected fake ports — no DB.
//
// Run: npx tsx tests/rate-limiter.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  checkChatRateLimit,
  CHAT_ENDPOINT,
  CHAT_IP_LIMIT,
  CHAT_CONVERSATION_LIMIT,
  CHAT_WINDOW_MS,
  LIMIT_LOG_RETENTION_MS,
  getClientIp,
  resetRateLimitPruneStateForTests,
  GLOBAL_AI_IDENTIFIER,
  GLOBAL_AI_ENDPOINT,
  GLOBAL_AI_LIMIT,
  type RateLimitPorts,
} from "../lib/ai/rateLimiter";

// ── fake store: single row per (identifier, endpoint) ──────────────

type Slot = { createdAt: number; requestCount: number };

function fakeStore() {
  const slots = new Map<string, Slot>();
  const pruneCalls: Date[] = [];
  let peekFails = false;
  let recordFails = false;

  const keyFor = (identifier: string, endpoint: string) =>
    `${identifier}\u0000${endpoint}`;

  const ports: RateLimitPorts = {
    peek: async (identifier, endpoint, windowStart) => {
      if (peekFails) throw new Error("db down");
      const slot = slots.get(keyFor(identifier, endpoint));
      if (!slot) return 0;
      return slot.createdAt >= windowStart.getTime() ? slot.requestCount : 0;
    },
    record: async (identifier, endpoint, now) => {
      if (recordFails) throw new Error("db down");
      const k = keyFor(identifier, endpoint);
      const existing = slots.get(k);
      if (!existing) {
        slots.set(k, { createdAt: now.getTime(), requestCount: 1 });
        return;
      }
      const stale = now.getTime() - existing.createdAt >= CHAT_WINDOW_MS;
      slots.set(
        k,
        stale
          ? { createdAt: now.getTime(), requestCount: 1 }
          : { createdAt: existing.createdAt, requestCount: existing.requestCount + 1 },
      );
    },
    pruneOlderThan: async (until) => {
      pruneCalls.push(until);
    },
  };

  return {
    ports,
    pruneCalls,
    slotCount: () => slots.size,
    getCount: (identifier: string, endpoint: string) =>
      slots.get(keyFor(identifier, endpoint))?.requestCount ?? 0,
    setPeekFail: (v: boolean) => {
      peekFails = v;
    },
    setRecordFail: (v: boolean) => {
      recordFails = v;
    },
  };
}

// ── under / over limit ─────────────────────────────────────────────

test("under the per-IP limit → requests succeed", async () => {
  const store = fakeStore();
  for (let i = 0; i < CHAT_IP_LIMIT - 1; i++) {
    const result = await checkChatRateLimit(
      { ip: "1.2.3.4" },
      store.ports,
    );
    assert.equal(result.limited, false);
  }
});

test("at the per-IP limit → next request is limited (429), and the limited request is NOT recorded", async () => {
  const store = fakeStore();
  for (let i = 0; i < CHAT_IP_LIMIT; i++) {
    await checkChatRateLimit({ ip: "1.2.3.4" }, store.ports);
  }
  const limited = await checkChatRateLimit({ ip: "1.2.3.4" }, store.ports);
  assert.equal(limited.limited, true);
  // One row per key (unique-index invariant): the IP row plus the shared
  // global AI row, and NO extra write from the limited 429 request.
  assert.equal(store.slotCount(), 2);
  assert.equal(store.getCount("ip:1.2.3.4", CHAT_ENDPOINT), CHAT_IP_LIMIT);
  assert.equal(
    store.getCount(GLOBAL_AI_IDENTIFIER, GLOBAL_AI_ENDPOINT),
    CHAT_IP_LIMIT,
    "the global bucket counts the allowed requests too",
  );
});

test("window expiry frees the IP (stale counter is reset, not accumulated)", async () => {
  const store = fakeStore();
  const base = Date.now();
  for (let i = 0; i < CHAT_IP_LIMIT; i++) {
    await checkChatRateLimit({ ip: "1.2.3.4", now: new Date(base) }, store.ports);
  }
  assert.equal((await checkChatRateLimit({ ip: "1.2.3.4", now: new Date(base) }, store.ports)).limited, true);
  // Just past the 60s window → the stale window is treated as empty.
  const result = await checkChatRateLimit(
    { ip: "1.2.3.4", now: new Date(base + CHAT_WINDOW_MS + 1) },
    store.ports,
  );
  assert.equal(result.limited, false);
});

test("different IPs are limited independently", async () => {
  const store = fakeStore();
  for (let i = 0; i < CHAT_IP_LIMIT; i++) {
    await checkChatRateLimit({ ip: "9.9.9.9" }, store.ports);
  }
  assert.equal(
    (await checkChatRateLimit({ ip: "9.9.9.9" }, store.ports)).limited,
    true,
  );
  assert.equal(
    (await checkChatRateLimit({ ip: "8.8.8.8" }, store.ports)).limited,
    false,
  );
});

test("different conversations are limited independently (same IP)", async () => {
  const store = fakeStore();
  for (let i = 0; i < CHAT_CONVERSATION_LIMIT; i++) {
    await checkChatRateLimit(
      { ip: "7.7.7.7", conversationId: "conv-a" },
      store.ports,
    );
  }
  assert.equal(
    (
      await checkChatRateLimit(
        { ip: "7.7.7.7", conversationId: "conv-a" },
        store.ports,
      )
    ).limited,
    true,
  );
  assert.equal(
    (
      await checkChatRateLimit(
        { ip: "7.7.7.7", conversationId: "conv-b" },
        store.ports,
      )
    ).limited,
    false,
  );
});

test("no IP and no conversationId → still consumes the shared GLOBAL AI bucket (cannot be bypassed by omitting identifiers)", async () => {
  const store = fakeStore();
  for (let i = 0; i < GLOBAL_AI_LIMIT; i++) {
    const result = await checkChatRateLimit({}, store.ports);
    assert.equal(result.limited, false);
  }
  assert.equal(
    store.getCount(GLOBAL_AI_IDENTIFIER, GLOBAL_AI_ENDPOINT),
    GLOBAL_AI_LIMIT,
  );
  const rejected = await checkChatRateLimit({}, store.ports);
  assert.equal(rejected.limited, true, "global bucket applies with no identifying keys");
  // The limited request is not recorded — global stays pinned at its limit.
  assert.equal(
    store.getCount(GLOBAL_AI_IDENTIFIER, GLOBAL_AI_ENDPOINT),
    GLOBAL_AI_LIMIT,
  );
  assert.equal(store.slotCount(), 1, "only the single global row exists");
});

// ── global AI bucket (S4) ──────────────────────────────────────────

test("GLOBAL AI bucket — requests below the limit pass; above it are rejected via the same RateLimitLog store", async () => {
  const store = fakeStore();
  assert.equal(store.getCount(GLOBAL_AI_IDENTIFIER, GLOBAL_AI_ENDPOINT), 0);

  for (let i = 0; i < 5; i++) {
    const result = await checkChatRateLimit(
      { ip: `below-${i}`, conversationId: `bc-${i}` },
      store.ports,
    );
    assert.equal(result.limited, false);
  }
  assert.equal(
    store.getCount(GLOBAL_AI_IDENTIFIER, GLOBAL_AI_ENDPOINT),
    5,
    "each allowed request increments the single global row (RateLimitLog mechanism)",
  );

  for (let i = 0; i < GLOBAL_AI_LIMIT - 5; i++) {
    const result = await checkChatRateLimit(
      { ip: `fill-${i}`, conversationId: `fc-${i}` },
      store.ports,
    );
    assert.equal(result.limited, false);
  }

  const over = await checkChatRateLimit(
    { ip: "over-limit", conversationId: "over-conv" },
    store.ports,
  );
  assert.equal(over.limited, true, "request above the global limit is rejected");
  assert.equal(
    store.getCount(GLOBAL_AI_IDENTIFIER, GLOBAL_AI_ENDPOINT),
    GLOBAL_AI_LIMIT,
    "the rejected request is never recorded into the global bucket",
  );
});

test("GLOBAL AI bucket — multiple phones collectively consume the same shared bucket", async () => {
  const store = fakeStore();
  // 3 phones × 20 requests = 60 → exactly the global limit. Each phone is
  // at 20/30 (under its own per-IP limit) and each conversation is fresh.
  for (let i = 0; i < 20; i++) {
    const a = await checkChatRateLimit({ ip: "phone-A", conversationId: `a-${i}` }, store.ports);
    const b = await checkChatRateLimit({ ip: "phone-B", conversationId: `b-${i}` }, store.ports);
    const c = await checkChatRateLimit({ ip: "phone-C", conversationId: `c-${i}` }, store.ports);
    assert.equal(a.limited, false);
    assert.equal(b.limited, false);
    assert.equal(c.limited, false);
  }
  assert.equal(
    store.getCount(GLOBAL_AI_IDENTIFIER, GLOBAL_AI_ENDPOINT),
    GLOBAL_AI_LIMIT,
  );

  // A fresh phone (own IP + conversation both at 0) is still rejected:
  // the shared bucket is exhausted, so no per-source check can pass it.
  const fresh = await checkChatRateLimit(
    { ip: "brand-new-phone", conversationId: "fresh-conv" },
    store.ports,
  );
  assert.equal(fresh.limited, true);
});

test("GLOBAL AI bucket — a single phone cannot bypass it by rotating identifiers", async () => {
  const store = fakeStore();
  // phone-X makes one request per round, 20 rounds (its own per-IP count is
  // only 20/30) while phone-Y + phone-Z together exhaust the shared bucket.
  for (let i = 0; i < 20; i++) {
    assert.equal((await checkChatRateLimit({ ip: "phone-X", conversationId: `x-${i}` }, store.ports)).limited, false);
    const y = await checkChatRateLimit({ ip: "phone-Y", conversationId: `y-${i}` }, store.ports);
    const z = await checkChatRateLimit({ ip: "phone-Z", conversationId: `z-${i}` }, store.ports);
    assert.equal(y.limited, false);
    assert.equal(z.limited, false);
  }

  // phone-X retries with a brand-new conversation id: its own IP (20/30)
  // and fresh conversation would both pass the per-source checks — only the
  // exhausted GLOBAL bucket can reject it.
  const bypass = await checkChatRateLimit(
    { ip: "phone-X", conversationId: "brand-new-conv" },
    store.ports,
  );
  assert.equal(bypass.limited, true, "rotating the conversation id cannot dodge the shared bucket");
});

test("GLOBAL AI bucket — expires with the fixed window (stale counter resets)", async () => {
  const store = fakeStore();
  const base = Date.now();
  for (let i = 0; i < GLOBAL_AI_LIMIT; i++) {
    await checkChatRateLimit(
      { ip: `w-${i}`, conversationId: `wc-${i}`, now: new Date(base) },
      store.ports,
    );
  }
  assert.equal(
    (
      await checkChatRateLimit(
        { ip: "zz", conversationId: "cc", now: new Date(base) },
        store.ports,
      )
    ).limited,
    true,
  );
  const later = await checkChatRateLimit(
    { ip: "zz", conversationId: "cc", now: new Date(base + CHAT_WINDOW_MS + 1) },
    store.ports,
  );
  assert.equal(later.limited, false);
});

// ── fail-open ──────────────────────────────────────────────────────

test("DB failure while peeking → fail open (request succeeds)", async () => {
  const store = fakeStore();
  store.setPeekFail(true);
  const result = await checkChatRateLimit({ ip: "1.1.1.1" }, store.ports);
  assert.equal(result.limited, false);
});

test("DB failure while recording → fail open (request succeeds)", async () => {
  const store = fakeStore();
  store.setRecordFail(true);
  const result = await checkChatRateLimit({ ip: "1.1.1.1" }, store.ports);
  assert.equal(result.limited, false);
});

// ── pruning ────────────────────────────────────────────────────────

test("rows older than 1 day are pruned opportunistically", async () => {
  resetRateLimitPruneStateForTests();
  const store = fakeStore();
  const now = new Date();
  await checkChatRateLimit({ ip: "2.2.2.2", now }, store.ports);
  assert.ok(store.pruneCalls.length >= 1, "prune must be invoked");
  const until = store.pruneCalls[0];
  assert.ok(
    now.getTime() - until.getTime() >= LIMIT_LOG_RETENTION_MS,
    "prune threshold must be at least the 1-day retention",
  );
});

test("prune failures are swallowed (chat continues)", async () => {
  resetRateLimitPruneStateForTests();
  const store = fakeStore();
  const failingPrune: RateLimitPorts = {
    ...store.ports,
    pruneOlderThan: async () => {
      throw new Error("prune db down");
    },
  };
  const result = await checkChatRateLimit(
    { ip: "3.3.3.3" },
    failingPrune,
  );
  assert.equal(result.limited, false);
});

// ── client IP extraction ───────────────────────────────────────────

test("getClientIp reads the first x-forwarded-for entry", () => {
  const req = new Request("http://localhost:3000/api/chat", {
    headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
  });
  assert.equal(getClientIp(req), "1.2.3.4");
});

test("getClientIp falls back to cf-connecting-ip then x-real-ip", () => {
  const req = new Request("http://localhost:3000/api/chat", {
    headers: { "cf-connecting-ip": "10.0.0.1" },
  });
  assert.equal(getClientIp(req), "10.0.0.1");

  const req2 = new Request("http://localhost:3000/api/chat", {
    headers: { "x-real-ip": "10.0.0.2" },
  });
  assert.equal(getClientIp(req2), "10.0.0.2");
});

test("getClientIp returns null when no forwarding headers exist", () => {
  const req = new Request("http://localhost:3000/api/chat");
  assert.equal(getClientIp(req), null);
});