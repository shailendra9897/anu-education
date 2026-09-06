// FILE: tests/ai-client-retry.test.ts
//
// S4 — SINGLE RETRY POLICY (lib/ai/client).
//
// Proves:
//   1. The OpenAI SDK is configured with maxRetries: 0, so the SDK performs
//      NO automatic retries (its intrinsic retry stack was previously
//      multiplying under our custom withRetry() — a persistent 429 could
//      fire up to ~12 underlying HTTP attempts per message).
//   2. withRetry() remains the single retry owner and performs exactly its
//      configured number of attempts on a persistent 429 — no hidden SDK
//      retries, no infinite loop.
//
// Run: npx tsx tests/ai-client-retry.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";

import { groq, withRetry } from "../lib/ai/client";

test("SDK retry stacking removed — OpenAI client configured with maxRetries=0", () => {
  assert.equal(typeof groq.maxRetries, "number", "client exposes maxRetries");
  assert.equal(groq.maxRetries, 0, "SDK must not auto-retry under withRetry");
});

test("persistent 429 — withRetry performs exactly MAX_RETRIES attempts, no hidden retries, no infinite loop", async () => {
  const err429 = Object.assign(new Error("still limited"), {
    status: 429,
    headers: { get: (_: string) => "0" },
  });
  let attempts = 0;
  let exhausted = false;

  await assert.rejects(
    withRetry(async () => {
      attempts++;
      throw err429;
    }),
    (error: unknown) => (error as { status?: number }).status === 429,
  );

  exhausted = attempts === 4;
  assert.equal(attempts, 4, "1 initial call + MAX_RETRIES(3) retries = exactly 4 attempts");
  assert.equal(exhausted, true);
  assert.ok(attempts < 50, "bounded — a wedged service can never loop forever");
});