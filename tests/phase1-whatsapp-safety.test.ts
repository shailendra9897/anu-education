// FILE: tests/phase1-whatsapp-safety.test.ts
//
// ─────────────────────────────────────────────────────────────────
// PHASE 1 WHATSAPP ARCHITECTURE SAFETY TESTS
//
// Regression coverage for the production-safety fixes shipped in Phase 1
// (conversation-isolation + Groq/429 + prompt-budget hardening):
//
//   A.  Conversation.phone is NEVER written from message-text extraction
//       (only name/email are eligible for conversation-row updates).
//   B.  WhatsApp group JIDs (…@g.us / …@g.whatsapp.net / …@newsletter)
//       are classified as "group_message" and never become a student
//       phone / conversation; unknown/malformed sender identities are
//       deterministically rejected (sender_not_contact).
//   C.  A phone-less / blank phone lookup is NEVER attempted
//       (buildPhoneLookupWhere → null; resolveConversation skips
//       findByPhone → no broad unscoped findFirst).
//   D.  Groq 429 is retryable, honors Retry-After, exponential backoff +
//       jitter, bounded retries; non-retryable statuses throw immediately.
//   E.  Memory block respects a character budget keeping the NEWEST
//       context; includeMemory:false skips the replay entirely.
//   F.  Knowledge context for WhatsApp is budgeted (≤ 3 docs / ≤ 3500
//       chars delivered to the model).
//   G.  WhatsApp webhook defer-and-429 on rate limit: claim released,
//       no AI, no send — and a later retry succeeds. Same deferral for
//       the Chatwoot (Evolution) path.
//
// All tests run without a live database, without Groq, without Evolution
// and without any network (ports are injected like the existing suites).
// ─────────────────────────────────────────────────────────────────

process.env.CHATWOOT_WEBHOOK_SECRET = "test-chatwoot-webhook-secret";
process.env.CHATWOOT_INBOX_ID = "1";

import "./env.setup";

import { test, after } from "node:test";
import assert from "node:assert/strict";

import { allowedConversationIdentityUpdates } from "../lib/whatsapp/ai-adapter.service";
import { classifyChatwootMessageEvent } from "../lib/chatwoot/payload";
import {
  handleChatwootWebhookPost,
  type ChatwootBridgeDeps,
} from "../lib/chatwoot/handler";
import { resetInMemoryClaimsForTests } from "../lib/chatwoot/idempotency";
import {
  buildPhoneLookupWhere,
  resolveConversation,
  type ConversationResolvePorts,
} from "../lib/chat/conversation.service";
import { ConversationSource } from "@prisma/client";
import {
  computeRetryDelayMs,
  isRetryableStatus,
  parseRetryAfterMs,
  withRetry,
} from "../lib/ai/client";
import { formatConversationMemoryBlock } from "../lib/chat/memory.service";
import { buildPrompt } from "../lib/chat/prompt.service";
import {
  processWhatsAppWebhookPayload,
  type OwnershipState,
  type WebhookDeps,
} from "../lib/whatsapp/webhook.service";
import {
  claimKeyFor,
  type IdempotencyDeps,
} from "../lib/whatsapp/idempotency";

// ── network egress guard (same convention as the other webhook suites) ─
const realFetch = global.fetch;
global.fetch = (async () => {
  throw new Error(
    "NETWORK GUARD: outbound fetch attempted during Phase 1 safety tests",
  );
}) as typeof fetch;

after(() => {
  global.fetch = realFetch;
});

// ─────────────────────────────────────────────────────────────────
// A. CONVERSATION.PHONE CONTAMINATION
// ─────────────────────────────────────────────────────────────────

test("A — a phone extracted FROM MESSAGE TEXT is never written to the conversation row", () => {
  const update = allowedConversationIdentityUpdates({
    name: "  Ravi Gadekar  ",
    phone: "+919876543210",
    email: " ravi@gadekar.example ",
  });
  assert.deepEqual(update, {
    name: "Ravi Gadekar",
    email: "ravi@gadekar.example",
  });
  assert.ok(
    !("phone" in update),
    "identity update must not contain a phone key",
  );
});

test("A — blank / absent extraction yields no conversation update", () => {
  assert.deepEqual(
    allowedConversationIdentityUpdates({
      name: "",
      phone: "9876543210",
      email: "   ",
    }),
    {},
  );
  assert.deepEqual(allowedConversationIdentityUpdates({}), {});
  assert.deepEqual(allowedConversationIdentityUpdates({ phone: null }), {});
});

// ─────────────────────────────────────────────────────────────────
// B. GROUP JID + MALFORMED SENDER PROTECTION
// ─────────────────────────────────────────────────────────────────

const BASE_PAYLOAD = {
  event: "message_created",
  id: 502,
  content: "Hi, I want details about IELTS",
  message_type: "incoming",
  private: false,
  created_at: 1755936000,
  sender: {
    id: 42,
    name: "Ravi Kumar",
    phone_number: "+917016497087",
  },
  conversation: { id: 33, inbox_id: 1 },
};

test("B — a normal WhatsApp 1:1 message is accepted", () => {
  const result = classifyChatwootMessageEvent(BASE_PAYLOAD, 1);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.observed.phone, "+917016497087");
});

test("B — @g.us sender identifier is classified group_message", () => {
  const result = classifyChatwootMessageEvent(
    {
      ...BASE_PAYLOAD,
      sender: {
        id: 42,
        name: "Group Member",
        identifier: "12345678901@g.us",
      },
    },
    1,
  );
  assert.deepEqual(result, { ok: false, reason: "group_message" });
});

test("B — @g.whatsapp.net group JID as conversation contact is group_message", () => {
  const result = classifyChatwootMessageEvent(
    {
      ...BASE_PAYLOAD,
      conversation: {
        id: 33,
        inbox_id: 1,
        contact: { id: 1, phone_number: "@abcd1234@g.whatsapp.net" },
      },
    },
    1,
  );
  assert.deepEqual(result, { ok: false, reason: "group_message" });
});

test("B — @newsletter JID via conversation.meta.sender is group_message", () => {
  const result = classifyChatwootMessageEvent(
    {
      ...BASE_PAYLOAD,
      conversation: {
        id: 33,
        inbox_id: 1,
        meta: { sender: { phone_number: "9876543210@newsletter" } },
      },
    },
    1,
  );
  assert.deepEqual(result, { ok: false, reason: "group_message" });
});

test("B — group JID at top-level contact is group_message", () => {
  const result = classifyChatwootMessageEvent(
    {
      ...BASE_PAYLOAD,
      contact: { id: 7, name: "Group", phone_number: "22@g.us" },
    },
    1,
  );
  assert.deepEqual(result, { ok: false, reason: "group_message" });
});

test("B — unknown/malformed sender identity (no usable phone) is rejected", () => {
  const result = classifyChatwootMessageEvent(
    {
      ...BASE_PAYLOAD,
      sender: { id: 42, name: "Ravi Kumar", identifier: "unknown_handle" },
    },
    1,
  );
  assert.deepEqual(result, { ok: false, reason: "sender_not_contact" });
});

test("B — an alphanumeric (non-phone) sender JID is rejected, not routed", () => {
  const result = classifyChatwootMessageEvent(
    {
      ...BASE_PAYLOAD,
      sender: {
        id: 42,
        name: "Ravi Kumar",
        identifier: "abc_def@s.whatsapp.net",
      },
    },
    1,
  );
  assert.deepEqual(result, { ok: false, reason: "sender_not_contact" });
});

test("B — a numeric WhatsApp JID identifier remains a usable sender (regression)", () => {
  const result = classifyChatwootMessageEvent(
    {
      ...BASE_PAYLOAD,
      contact: undefined,
      sender: {
        id: 42,
        name: "Ravi Kumar",
        type: "contact",
        identifier: "919876543210@s.whatsapp.net",
      },
    },
    1,
  );
  assert.equal(result.ok, true, "numeric JID identifier must be accepted");
});

// ─────────────────────────────────────────────────────────────────
// C. PHONE-LESS LOOKUP HARDENING
// ─────────────────────────────────────────────────────────────────

test("C — buildPhoneLookupWhere returns null for missing / blank phone", () => {
  for (const phone of [undefined, "", "   "]) {
    const where = buildPhoneLookupWhere({
      phone: phone as string,
      source: ConversationSource.WHATSAPP,
    });
    assert.equal(where, null, `phone=${JSON.stringify(phone)} must not look up`);
  }
});

test("C — buildPhoneLookupWhere still builds a source-scoped where for a real phone", () => {
  const where = buildPhoneLookupWhere({
    phone: "  +919428186817  ",
    source: ConversationSource.WHATSAPP,
  })!;
  assert.equal(where.phone, "+919428186817");
  assert.equal(where.source, "WHATSAPP");
});

test("C — resolveConversation never calls findByPhone without a valid phone", async () => {
  let findByPhoneCalls = 0;
  const ports = {
    findByPhone: async () => {
      findByPhoneCalls++;
      return null;
    },
    findBySession: async () => null,
    create: async (data: unknown) => ({ id: "new-1", ...(data as object) }),
  } as unknown as ConversationResolvePorts;

  const result = await resolveConversation(
    { phone: undefined, source: ConversationSource.WHATSAPP, sourcePage: "/whatsapp" },
    ports,
  );
  assert.equal(result.created, true, "blank phone must create a fresh thread");
  assert.equal(findByPhoneCalls, 0, "no broad unscoped lookup is allowed");

  const result2 = await resolveConversation(
    { phone: "   ", source: ConversationSource.WHATSAPP },
    ports,
  );
  assert.equal(result2.created, true);
  assert.equal(findByPhoneCalls, 0);
});

// ─────────────────────────────────────────────────────────────────
// D. GROQ 429 / RETRY HARDENING (lib/ai/client)
// ─────────────────────────────────────────────────────────────────

test("D — 429 is retryable and Retry-After is honored", async () => {
  let attempts = 0;
  const err429 = Object.assign(new Error("rate limited"), {
    status: 429,
    headers: { get: (name: string) => (name === "retry-after" ? "0.001" : null) },
  });

  const done = await withRetry(
    async () => {
      attempts++;
      if (attempts < 3) throw err429;
      return "done";
    },
    3,
    1,
  );

  assert.equal(done, "done");
  assert.equal(attempts, 3, "initial call + 2 retries");
});

test("D — persistent 429 gives up after bounded retries", async () => {
  const err429 = Object.assign(new Error("still limited"), {
    status: 429,
    headers: { get: (name: string) => (name === "retry-after" ? "0.001" : null) },
  });
  let attempts = 0;

  await assert.rejects(
    withRetry(
      async () => {
        attempts++;
        throw err429;
      },
      2,
      1,
    ),
    (error: unknown) => (error as { status?: number }).status === 429,
  );
  assert.equal(attempts, 3, "initial call + max(2) retries maximum");
});

test("D — non-retryable statuses throw immediately (400, 422…)", async () => {
  const err400 = Object.assign(new Error("bad request"), { status: 400 });
  let attempts = 0;

  await assert.rejects(
    withRetry(
      async () => {
        attempts++;
        throw err400;
      },
      3,
      1,
    ),
    (error: unknown) => (error as { status?: number }).status === 400,
  );
  assert.equal(attempts, 1, "no retries for 4xx");
});

test("D — isRetryableStatus: 429/5xx true, 4xx false", () => {
  assert.equal(isRetryableStatus(429), true);
  assert.equal(isRetryableStatus(500), true);
  assert.equal(isRetryableStatus(503), true);
  assert.equal(isRetryableStatus(400), false);
  assert.equal(isRetryableStatus(undefined), false);
});

test("D — computeRetryDelayMs uses Retry-After, bounded by MAX_RETRY_DELAY_MS", () => {
  const longWait = Object.assign(new Error("x"), {
    status: 429,
    headers: { get: (_: string) => "99999" },
  });
  assert.equal(computeRetryDelayMs(longWait, 1000), 10000);

  const smallWait = Object.assign(new Error("x"), {
    status: 429,
    headers: { get: (_: string) => "0.2" },
  });
  assert.equal(computeRetryDelayMs(smallWait, 1000), 200);
});

test("D — computeRetryDelayMs falls back to backoff + jitter, always bounded", () => {
  for (let i = 0; i < 50; i++) {
    const delay = computeRetryDelayMs({ status: 500 }, 1000);
    assert.ok(delay >= 1000 && delay <= 10000, `delay=${delay}`);
  }
});

test("D — parseRetryAfterMs handles number, object, HTTP-date, and junk", () => {
  assert.equal(parseRetryAfterMs({ status: 400 }), null);
  assert.equal(parseRetryAfterMs(Object.assign(new Error("x"), { headers: null })), null);
  assert.equal(
    parseRetryAfterMs(
      Object.assign(new Error("x"), {
        headers: { get: (_: string) => "5" },
      }),
    ),
    5000,
  );
  assert.equal(
    parseRetryAfterMs(Object.assign(new Error("x"), { headers: { "retry-after": "7" } })),
    7000,
  );
  const httpDate = parseRetryAfterMs(
    Object.assign(new Error("x"), {
      headers: { get: (_: string) => "Sat, 25 Nov 2099 00:00:00 GMT" },
    }),
  );
  assert.ok(httpDate !== null && httpDate >= 0 && httpDate <= 10000);
  assert.equal(
    parseRetryAfterMs(Object.assign(new Error("x"), { headers: { get: (_: string) => "not-a-number" } })),
    null,
  );
});

// ─────────────────────────────────────────────────────────────────
// E. MEMORY BLOCK BUDGET (lib/chat/memory.service)
// ─────────────────────────────────────────────────────────────────

test("E — memory block keeps the NEWEST context within the budget", () => {
  const long = "x".repeat(80);
  const lines = [`User: ${long}`, `Assistant: ${"y".repeat(80)}`, `User: ${"z".repeat(80)}`];

  const block = formatConversationMemoryBlock(lines, 200);

  assert.ok(block.length <= 200, `block length ${block.length} > 200`);
  assert.ok(block.includes("(older messages omitted)"), "truncation is marked");
  assert.ok(block.endsWith("z".repeat(80)), "newest message is preserved");
  assert.ok(!block.includes("x".repeat(80)), "oldest message is dropped");
});

test("E — memory block passes through unchanged when within budget", () => {
  const lines = ["User: hi", "Assistant: hello"];
  assert.equal(
    formatConversationMemoryBlock(lines, 2000),
    "Previous Conversation:\nUser: hi\nAssistant: hello",
  );
});

test("E — includeMemory:false skips the memory replay (no DB call)", async () => {
  const prompt = await buildPrompt({
    userMessage: "ielts fees",
    sourcePage: "/whatsapp",
    conversationId: "conv-whatsapp-1",
    includeMemory: false,
  });
  assert.equal(prompt.memory, "", "memory replay must be skipped");
  assert.ok(prompt.system.includes("/whatsapp"), "source page preserved");
});

// ─────────────────────────────────────────────────────────────────
// F. KNOWLEDGE BUDGET FOR WHATSAPP (lib/chat/prompt.service)
// ─────────────────────────────────────────────────────────────────

test("F — WhatsApp knowledge budget: ≤ 3 documents / ≤ 3500 characters", async () => {
  const prompt = await buildPrompt({
    userMessage: "ielts fees and classes",
    sourcePage: "/whatsapp",
    includeMemory: false,
    knowledgeOptions: { maxDocuments: 3, maxCharacters: 3500 },
  });

  assert.ok(
    prompt.knowledge.length <= 3500,
    `knowledge length ${prompt.knowledge.length} exceeds 3500`,
  );
  const docHeaders = (prompt.knowledge.match(/\n\n\[/g) ?? []).length;
  assert.ok(docHeaders <= 3, `document headers ${docHeaders} exceed 3`);
});

// ─────────────────────────────────────────────────────────────────
// G. RATE LIMITING — AI is deferred and the claim is released
// ─────────────────────────────────────────────────────────────────

function studentTextPayload(body: string, messageId: string): unknown {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "WABA_ANU",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "919428186817",
                phone_number_id: "PNID_ANU",
              },
              contacts: [{ profile: { name: "Test Student" }, wa_id: "919876543210" }],
              messages: [
                {
                  from: "919876543210",
                  id: messageId,
                  timestamp: "1755000000",
                  type: "text",
                  text: { body },
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

function makeClaimsStore(): {
  claims: IdempotencyDeps;
  rows: Map<string, number>;
} {
  const rows = new Map<string, number>();
  return {
    rows,
    claims: {
      findMarkers: async (key: string) => (rows.has(key) ? [{ id: key }] : []),
      insertMarker: async (key: string) => {
        rows.set(key, Date.now());
      },
      deleteMarkers: async (key: string) => {
        rows.delete(key);
      },
    },
  };
}

test("G — WhatsApp webhook defers on rate limit: 429, no AI, no send, claim released, retry succeeds", async () => {
  const { claims, rows } = makeClaimsStore();
  let aiCalls = 0;
  let sendCalls = 0;
  let limited = true;

  const deps: WebhookDeps = {
    findOrCreateConversation: async () => ({
      conversation: { id: "conv-wa-1", phone: "+919876543210", name: null },
      created: false,
    }),
    getOwnership: async () => "UNASSIGNED" as OwnershipState,
    saveUserMessage: async () => ({}),
    updateProfileNameIfMissing: async () => ({}),
    runAiPipeline: async () => {
      aiCalls++;
      return "ANU AI reply";
    },
    sendText: async () => {
      sendCalls++;
      return { ok: true, toDigits: "919876543210", messageId: "graph-1" };
    },
    checkRateLimit: async () => limited,
    claims,
  };

  const wamid = "wamid.rate.limited.1";

  // 1 → limited: 429, nothing produced, claim released.
  const limitedResult = await processWhatsAppWebhookPayload(
    deps,
    studentTextPayload("Hi", wamid),
  );
  assert.equal(limitedResult.status, 429);
  assert.equal(limitedResult.genuineFailure, true);
  assert.deepEqual(limitedResult.outcomes, [
    { messageId: wamid, action: "rate_limited" },
  ]);
  assert.equal(aiCalls, 0, "AI must not run while limited");
  assert.equal(sendCalls, 0, "no reply can exist while limited");
  assert.equal(
    rows.has(claimKeyFor(wamid)),
    false,
    "claim released so Meta can retry",
  );

  // 2 → quota back: the SAME delivery succeeds because the claim was free.
  limited = false;
  const retry = await processWhatsAppWebhookPayload(
    deps,
    studentTextPayload("Hi", wamid),
  );
  assert.equal(retry.status, 200);
  assert.equal(aiCalls, 1, "retry runs the AI pipeline");
  assert.equal(sendCalls, 1, "retry sends the reply");
  assert.equal(
    rows.has(claimKeyFor(wamid)),
    true,
    "processed delivery keeps its claim",
  );
});

test("G — ASSIGNED / HANDED_OFF threads skip AI AND the rate-limit gate", async () => {
  const { claims } = makeClaimsStore();
  let aiCalls = 0;
  let rateChecks = 0;

  const deps: WebhookDeps = {
    findOrCreateConversation: async () => ({
      conversation: { id: "conv-wa-2", phone: "+919876543210", name: null },
      created: false,
    }),
    getOwnership: async () => "ASSIGNED" as OwnershipState,
    saveUserMessage: async () => ({}),
    updateProfileNameIfMissing: async () => ({}),
    runAiPipeline: async () => {
      aiCalls++;
      return "ANU AI reply";
    },
    sendText: async () => ({ ok: true, toDigits: "919876543210", messageId: "graph-1" }),
    checkRateLimit: async () => {
      rateChecks++;
      return true;
    },
    claims,
  };

  const result = await processWhatsAppWebhookPayload(
    deps,
    studentTextPayload("Hi counsellor", "wamid.assigned.1"),
  );
  assert.equal(result.status, 200);
  assert.equal(result.outcomes[0].action, "processed");
  assert.equal(aiCalls, 0, "assigned threads never invoke AI");
  assert.equal(rateChecks, 0, "rate-limit gate is UNASSIGNED-only");
});

test("G — Chatwoot (Evolution) handler defers on rate limit and releases its claim", async () => {
  resetInMemoryClaimsForTests();

  let aiCalls = 0;
  let sendCalls = 0;
  let limited = true;
  const chatwootClaims = makeClaimsStore();

  function deps(): ChatwootBridgeDeps {
    return {
      findOrCreateConversation: async ({ phone }) => ({
        conversation: { id: "conv-ch-1", phone: phone ?? null, name: null },
        created: false,
      }),
      getOwnership: async () => "UNASSIGNED",
      saveUserMessage: async () => ({}),
      updateProfileNameIfMissing: async () => ({}),
      runAiPipeline: async () => {
        aiCalls++;
        return "AI reply";
      },
      sendEvolutionWhatsAppText: async () => {
        sendCalls++;
        return { ok: true, messageId: "evt-x" };
      },
      checkRateLimit: async () => limited,
      claims: chatwootClaims.claims,
    };
  }

  const payload = {
    event: "message_created",
    id: 501,
    content: "Hi, I want a demo",
    message_type: "incoming",
    private: false,
    created_at: 1755936000,
    sender: { id: 42, name: "Ravi Kumar", phone_number: "+917016497087" },
    conversation: { id: 33, inbox_id: 1 },
  };

  const post = () =>
    handleChatwootWebhookPost(
      new Request("http://localhost/api/webhook/chatwoot/x", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
      "test-chatwoot-webhook-secret",
      deps(),
    );

  // 1 → limited: 429, nothing produced, claim released.
  const response = await post();
  assert.equal(response.status, 429, "transport signals back-off");
  assert.equal(aiCalls, 0, "AI must not run while deferred");
  assert.equal(sendCalls, 0, "no Evolution reply while deferred");

  // 2 → quota back: the SAME delivery processes cleanly — proof the
  // claim was really released (a held claim would answer 200 duplicate).
  limited = false;
  const retry = await post();
  assert.equal(retry.status, 200, "retry is accepted, not a duplicate");
  assert.equal(aiCalls, 1, "retry runs the AI pipeline");
  assert.equal(sendCalls, 1, "retry sends the Evolution reply");
});

test("G — Chatwoot route-level ignore for a group message (group_message)", async () => {
  resetInMemoryClaimsForTests();

  const payload = {
    event: "message_created",
    id: 503,
    content: "Hi everyone",
    message_type: "incoming",
    private: false,
    created_at: 1755936000,
    sender: { id: 42, name: "Group Member", identifier: "9012345678@g.us" },
    conversation: { id: 34, inbox_id: 1 },
  };

  const response = await handleChatwootWebhookPost(
    new Request("http://localhost/api/webhook/chatwoot/x", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    "test-chatwoot-webhook-secret",
    fakeDeferDeps(),
  );

  assert.equal(response.status, 200);
  assert.equal(
    (await response.json()).outcome,
    "group_message",
    "group traffic surfaces observably and is ignored with 200",
  );
});

function fakeDeferDeps(): ChatwootBridgeDeps {
  let aiCalls = 0;
  return {
    findOrCreateConversation: async ({ phone }) => ({
      conversation: { id: "conv-ch-g", phone: phone ?? null, name: null },
      created: false,
    }),
    getOwnership: async () => "UNASSIGNED",
    saveUserMessage: async () => ({}),
    updateProfileNameIfMissing: async () => ({}),
    runAiPipeline: async () => {
      aiCalls++;
      return "AI reply";
    },
    sendEvolutionWhatsAppText: async () => ({ ok: true, messageId: "evt-x" }),
    claims: makeClaimsStore().claims,
  };
}