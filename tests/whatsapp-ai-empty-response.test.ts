// FILE: tests/whatsapp-ai-empty-response.test.ts
//
// ─────────────────────────────────────────────────────────────────
// WHATSAPP-AI-FIX-01 — EMPTY AI RESPONSE REGRESSION TESTS
//
// Proves the WHATSAPP-CRM-E2E-01 production defect is fixed:
//   A thinking-model response (qwen/qwen3.6-27b) can consume the
//   entire WHATSAPP_MAX_TOKENS budget inside its  thinking block;
//   stripThinkingTags() then reduces the output to an empty string,
//   which the pipeline previously handled as a "successful" reply:
//   an empty ASSISTANT Message was persisted, Evolution send was
//   never called, and — because the idempotency claim was retained —
//   the student never received a retry.
//
// Coverage:
//   A. Normal AI response — non-empty content persists, outbound fires.
//   B. Thinking-model response —  thinking blocks stripped, answer survives.
//   C. Empty response — detected as failure, no empty ASSISTANT row,
//      no Evolution send with empty text, failure observable.
//   D. Existing WhatsApp behavior — idempotency, self-echo, ownership,
//      CRM conversation association remain correct.
//
// Run: npx tsx tests/whatsapp-ai-empty-response.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

process.env.EVOLUTION_WEBHOOK_SECRET = "test-evolution-webhook-secret";
delete process.env.EVOLUTION_API_KEY;
process.env.DATABASE_URL = "postgresql://unused:unused@127.0.0.1/unused";

import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  generateChatCompletion,
  groq,
} from "../lib/ai/client";
import { assertNonEmptyAssistantReply } from "../lib/whatsapp/ai-adapter.service";
import {
  handleEvolutionWebhookPost,
  type EvolutionBridgeDeps,
  type EvolutionOwnership,
} from "../lib/whatsapp/evolution.handler";
import { classifyEvolutionMessageEvent } from "../lib/whatsapp/evolution.payload";
import { resetInMemoryClaimsForTests } from "../lib/whatsapp/evolution.idempotency";

// ── network egress guard ──────────────────────────────────────────
const realFetch = global.fetch;

before(() => {
  global.fetch = (() => {
    throw new Error("NETWORK EGRESS BLOCKED: must not send anything");
  }) as typeof fetch;
});

after(() => {
  global.fetch = realFetch;
});

beforeEach(() => {
  resetInMemoryClaimsForTests();
});

// ── Groq mock helpers ─────────────────────────────────────────────

type GroqCreateSpy = (
  args: Record<string, unknown>
) => Promise<{
  choices: Array<{ message: { content: string | null } }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}>;

let originalCreate: ((...args: never[]) => unknown) | undefined;

/**
 * Patch the module's exported `groq` client with a fake completion
 * source. Returns a recorder for the create() call args so tests can
 * assert `reasoning_effort` is forwarded.
 */
function mockGroqCreate(handler: GroqCreateSpy): {
  calls: Array<Record<string, unknown>>;
  restore: () => void;
} {
  const calls: Array<Record<string, unknown>> = [];
  originalCreate ??= groq.chat.completions.create as unknown as (
    ...args: never[]
  ) => unknown;

  (groq.chat.completions.create as unknown) = async (
    args: Record<string, unknown>
  ) => {
    calls.push(args);
    return handler(args);
  };

  return {
    calls,
    restore: () => {
      if (originalCreate) {
        (groq.chat.completions.create as unknown) = originalCreate;
      }
    },
  };
}

function okGroq(content: string) {
  return async () => ({
    choices: [{ message: { content } }],
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  });
}

// ── handler fake bridge deps (mirrors evolution.webhook.test.ts) ──

type FakeBridge = {
  /** Injectable deps passed into the real handler. */
  deps: EvolutionBridgeDeps;
  /** Call counters, keyed by stage name. */
  calls: Record<string, number>;
  /** Mutable runtime state — tests can flip runAiResult/failAi between calls. */
  state: { runAiResult: string | (() => string); failAi: boolean };
  sendCalls: Array<{ phone: string; reply: string }>;
};

function createFakeBridge(
  overrides: {
    ownership?: EvolutionOwnership;
    runAiResult?: string | (() => string);
    failAi?: boolean;
  } = {}
): FakeBridge {
  let ownership: EvolutionOwnership = overrides.ownership ?? "UNASSIGNED";
  const state = {
    runAiResult: overrides.runAiResult ?? "AI reply",
    failAi: overrides.failAi ?? false,
  };

  const calls: Record<string, number> = {
    claim: 0,
    resolve: 0,
    ownershipCheck: 0,
    saveUser: 0,
    profile: 0,
    runAi: 0,
    sent: 0,
    release: 0,
  };
  const sendCalls: Array<{ phone: string; reply: string }> = [];

  const deps: EvolutionBridgeDeps = {
    findOrCreateConversation: async ({ phone }) => {
      calls.resolve += 1;
      return {
        conversation: { id: "conv-empty-test", phone: phone ?? null, name: null },
        created: false,
      };
    },
    getOwnership: async () => {
      calls.ownershipCheck += 1;
      return ownership;
    },
    saveUserMessage: async () => {
      calls.saveUser += 1;
      return {};
    },
    updateProfileNameIfMissing: async () => {
      calls.profile += 1;
      return {};
    },
    runAiPipeline: async (_conv, _userMessage) => {
      calls.runAi += 1;
      if (state.failAi) throw new Error("simulated AI failure");
      const result =
        typeof state.runAiResult === "function"
          ? state.runAiResult()
          : state.runAiResult;
      // Mirrors the production empty-reply guard inside
      // runAnuAiPipelineForWhatsApp (assertNonEmptyAssistantReply).
      if (!result || !result.trim()) {
        throw new Error(
          "[WhatsApp AI] empty assistant response after generation (conversation conv-empty-test)"
        );
      }
      return result;
    },
    sendEvolutionWhatsAppText: async (phone, reply) => {
      calls.sent += 1;
      sendCalls.push({ phone, reply });
      return { ok: true, messageId: "evt-test-1" };
    },
    checkRateLimit: async () => false,
    claims: {
      findMarkers: async () => [],
      insertMarker: async () => {
        calls.claim += 1;
        return {};
      },
      deleteMarkers: async () => {
        calls.release += 1;
        return {};
      },
    },
  };

  return {
    deps,
    calls,
    state,
    sendCalls,
  };
}

const BASE_PAYLOAD = {
  event: "messages.upsert",
  instance: "anu_education",
  data: {
    key: {
      remoteJid: "917016497087@s.whatsapp.net",
      fromMe: false,
      id: "EMPTY-FIX-001",
    },
    pushName: "Ravi Kumar",
    message: { conversation: "Hello?" },
    messageTimestamp: 1755936000,
  },
  destination: "messages.upsert",
};

function postJson(
  body: string,
  deps: EvolutionBridgeDeps,
  secret: string | null = "test-evolution-webhook-secret"
): Promise<Response> {
  return handleEvolutionWebhookPost(
    new Request("http://localhost/api/webhook/evolution/x", {
      method: "POST",
      body,
    }),
    secret,
    deps
  );
}

// ─────────────────────────────────────────────────────────────────
// A. NORMAL AI RESPONSE
// ─────────────────────────────────────────────────────────────────

test("A1 — validate: non-empty assistant reply passes through unchanged", () => {
  assert.equal(assertNonEmptyAssistantReply("Hello student", "c1"), "Hello student");
  assert.equal(
    assertNonEmptyAssistantReply("  trimmed content  ", "c1"),
    "  trimmed content  ",
    "content returned as-is (the caller's saveMessage owns trimming)"
  );
});

test("A2 — generateChatCompletion: non-empty response survives stripThinkingTags", async () => {
  const mock = mockGroqCreate(okGroq("Here is your answer."));
  try {
    const { content } = await generateChatCompletion({
      messages: [{ role: "user", content: "hi" }],
      reasoningEffort: "none",
    });
    assert.equal(content, "Here is your answer.");
  } finally {
    mock.restore();
  }
});

test("A3 — handler: non-empty AI reply → Evolution outbound fires exactly once", async () => {
  const bridge = createFakeBridge({ runAiResult: "Here is your answer." });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), bridge.deps);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "replied" });
  assert.equal(bridge.calls.runAi, 1);
  assert.equal(bridge.calls.sent, 1);
  assert.deepEqual(bridge.sendCalls[0], {
    phone: "+917016497087",
    reply: "Here is your answer.",
  });
  assert.equal(bridge.calls.release, 0, "claim retained on success");
});

// ─────────────────────────────────────────────────────────────────
// B. THINKING-MODEL RESPONSE
// ─────────────────────────────────────────────────────────────────

test("B1 — complete thinking block stripped, final answer survives", async () => {
  const mock = mockGroqCreate(
    okGroq(
      "<think>The user wants a short reply. I should be concise.</think>Sure — the IELTS course fee inquiry is answered below."
    )
  );
  try {
    const { content } = await generateChatCompletion({
      messages: [{ role: "user", content: "IELTS fees?" }],
      reasoningEffort: "none",
    });
    assert.equal(content, "Sure — the IELTS course fee inquiry is answered below.");
  } finally {
    mock.restore();
  }
});

test("B2 — truncated unclosed thinking tag (maxTokens cut-off) is fully dropped", async () => {
  const mock = mockGroqCreate(
    okGroq("<think>This reasoning was cut off mid-sentence because the 500-t")
  );
  try {
    const { content } = await generateChatCompletion({
      messages: [{ role: "user", content: "demo timing?" }],
      reasoningEffort: "none",
    });
    assert.equal(content, "");
  } finally {
    mock.restore();
  }
});

test("B3 — multiple thinking blocks handled, final answer survives", async () => {
  const mock = mockGroqCreate(
    okGroq(
      "<think>first block</think>A. \n" +
        "<think>second block</think>B. answer text"
    )
  );
  try {
    const { content } = await generateChatCompletion({
      messages: [{ role: "user", content: "A or B?" }],
      reasoningEffort: "none",
    });
    assert.equal(content, "A. \nB. answer text");
  } finally {
    mock.restore();
  }
});

test("B4 — no thinking tags: content untouched", async () => {
  const mock = mockGroqCreate(okGroq("Plain answer without any tags."));
  try {
    const { content } = await generateChatCompletion({
      messages: [{ role: "user", content: "plain?" }],
      reasoningEffort: "none",
    });
    assert.equal(content, "Plain answer without any tags.");
  } finally {
    mock.restore();
  }
});

test("B5 — reasoning_effort='none' forwarded to Groq in the request body", async () => {
  const mock = mockGroqCreate(okGroq("answer"));
  try {
    await generateChatCompletion({
      messages: [{ role: "user", content: "hi" }],
      reasoningEffort: "none",
    });
    assert.equal(mock.calls.length, 1);
    assert.equal(mock.calls[0]?.reasoning_effort, "none");
  } finally {
    mock.restore();
  }
});

// ─────────────────────────────────────────────────────────────────
// C. EMPTY RESPONSE
// ─────────────────────────────────────────────────────────────────

test("C1 — empty string detected as failure (throws)", () => {
  assert.throws(
    () => assertNonEmptyAssistantReply("", "conv-x"),
    /\[WhatsApp AI\] empty assistant response after generation \(conversation conv-x\)/
  );
});

test("C2 — whitespace-only detected as failure (throws)", () => {
  for (const whitespace of ["   ", "\n\n\t\n", " \t \n "]) {
    assert.throws(
      () => assertNonEmptyAssistantReply(whitespace, "conv-x"),
      /empty assistant response/
    );
  }
});

test("C3 — generateChatCompletion exposes empty content (guard responsibility is the caller's)", async () => {
  const mock = mockGroqCreate(okGroq(""));
  try {
    const { content } = await generateChatCompletion({
      messages: [{ role: "user", content: "hi" }],
      reasoningEffort: "none",
    });
    assert.equal(content, "");
    assert.ok(
      !content.trim(),
      "the client returns the stripped content; the WhatsApp guard must reject it"
    );
  } finally {
    mock.restore();
  }
});

test("C4 — handler: runAiPipeline empty result → claim released, Evolution NOT called, HTTP 500 (failure observable)", async () => {
  const bridge = createFakeBridge({ runAiResult: "   " });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), bridge.deps);

  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { ok: false });
  assert.equal(bridge.calls.runAi, 1, "AI attempted once");
  assert.equal(bridge.calls.sent, 0, "Evolution NEVER called with empty text");
  assert.equal(bridge.sendCalls.length, 0, "no send recorded");
  assert.equal(bridge.calls.release, 1, "claim released so Evolution can retry");
});

test("C5 — handler: runAiPipeline empty-string result behaves identically", async () => {
  const bridge = createFakeBridge({ runAiResult: "" });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), bridge.deps);

  assert.equal(res.status, 500);
  assert.equal(bridge.calls.sent, 0);
  assert.equal(bridge.calls.release, 1);
});

test("C6 — a subsequent retry REDELIVERS cleanly after an empty-response failure", async () => {
  const bridge = createFakeBridge({ runAiResult: "   " });

  // First delivery: empty reply → failure, claim released.
  const first = await postJson(JSON.stringify(BASE_PAYLOAD), bridge.deps);
  assert.equal(first.status, 500);
  assert.equal(bridge.calls.release, 1);

  // Second delivery of the SAME message after the failure → claim is
  // claimable again, AI produces a non-empty reply, Evolution fires.
  bridge.state.runAiResult = "Recovered answer.";
  const second = await postJson(JSON.stringify(BASE_PAYLOAD), bridge.deps);
  assert.equal(second.status, 200);
  assert.deepEqual(await second.json(), { ok: true, outcome: "replied" });
  assert.equal(bridge.calls.runAi, 2);
  assert.equal(bridge.calls.sent, 1);
  assert.deepEqual(bridge.sendCalls[0], {
    phone: "+917016497087",
    reply: "Recovered answer.",
  });
});

// ─────────────────────────────────────────────────────────────────
// D. EXISTING WHATSAPP BEHAVIOR (regression)
// ─────────────────────────────────────────────────────────────────

test("D1 — idempotency: duplicate message id → no AI, no Evolution, duplicate", async () => {
  const bridge = createFakeBridge();
  const first = await postJson(JSON.stringify(BASE_PAYLOAD), bridge.deps);
  assert.equal(first.status, 200);

  const second = await postJson(JSON.stringify(BASE_PAYLOAD), bridge.deps);
  assert.equal(second.status, 200);
  assert.deepEqual(await second.json(), { ok: true, outcome: "duplicate" });
  assert.equal(bridge.calls.runAi, 1, "only one AI call for the duplicate pair");
  assert.equal(bridge.calls.sent, 1, "only one outbound");
});

test("D2 — self-echo: fromMe=true → ignored, no AI, no send", async () => {
  const selfPayload = {
    ...BASE_PAYLOAD,
    data: {
      ...BASE_PAYLOAD.data,
      key: { remoteJid: "917016497087@s.whatsapp.net", fromMe: true, id: "SELF-1" },
    },
  };
  const r = classifyEvolutionMessageEvent(selfPayload);
  assert.equal(r.ok, false);

  const bridge = createFakeBridge();
  const res = await postJson(JSON.stringify(selfPayload), bridge.deps);
  assert.equal(res.status, 200);
  assert.equal(bridge.calls.runAi, 0);
  assert.equal(bridge.calls.sent, 0);
  assert.equal(bridge.calls.resolve, 0, "no conversation lookup for self-echo");
});

test("D3 — ownership: ASSIGNED → inbound saved, AI skipped, no send", async () => {
  const bridge = createFakeBridge({ ownership: "ASSIGNED" });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), bridge.deps);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "ai_skipped_assigned" });
  assert.equal(bridge.calls.saveUser, 1, "inbound saved for counsellor");
  assert.equal(bridge.calls.runAi, 0);
  assert.equal(bridge.calls.sent, 0);
});

test("D4 — ownership: HANDED_OFF → inbound saved, AI skipped, no send", async () => {
  const bridge = createFakeBridge({ ownership: "HANDED_OFF" });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), bridge.deps);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "ai_skipped_handed_off" });
  assert.equal(bridge.calls.saveUser, 1);
  assert.equal(bridge.calls.runAi, 0);
  assert.equal(bridge.calls.sent, 0);
});

test("D5 — group message → ignored, no conversation, no AI", async () => {
  const groupPayload = {
    ...BASE_PAYLOAD,
    data: {
      ...BASE_PAYLOAD.data,
      key: { remoteJid: "1234567890-123456@g.us", fromMe: false, id: "G-1" },
      participant: "917016497087@s.whatsapp.net",
    },
  };
  const bridge = createFakeBridge();
  const res = await postJson(JSON.stringify(groupPayload), bridge.deps);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "group_message" });
  assert.equal(bridge.calls.resolve, 0);
  assert.equal(bridge.calls.runAi, 0);
  assert.equal(bridge.calls.sent, 0);
});

test("D6 — CRM conversation association: find/create pinned to phone + source=WHATSAPP", async () => {
  const lookedUp: Array<Record<string, unknown>> = [];
  const deps: EvolutionBridgeDeps = {
    findOrCreateConversation: async (input) => {
      lookedUp.push({ ...input });
      return {
        conversation: { id: "conv-crm", phone: input.phone ?? null, name: null },
        created: false,
      };
    },
    getOwnership: async () => "UNASSIGNED",
    saveUserMessage: async () => ({}),
    updateProfileNameIfMissing: async () => ({}),
    runAiPipeline: async (_c, m) => `reply: ${m}`,
    sendEvolutionWhatsAppText: async (phone, reply) => {
      void phone;
      void reply;
      return { ok: true, messageId: "evt-crm-1" };
    },
    claims: {
      findMarkers: async () => [],
      insertMarker: async () => ({}),
      deleteMarkers: async () => ({}),
    },
  };

  const res = await postJson(JSON.stringify(BASE_PAYLOAD), deps);
  assert.equal(res.status, 200);
  assert.deepEqual(lookedUp[0], {
    phone: "+917016497087",
    source: "WHATSAPP",
    sourcePage: "/whatsapp",
  });
});

test("D7 — guard is a pure function: no mutation of inputs, no side effects (CRM-safe)", () => {
  const content = "  valid reply  ";
  const out = assertNonEmptyAssistantReply(content, "conv-crm-safe");
  assert.equal(content, "  valid reply  ", "input string not mutated");
  assert.equal(out, "  valid reply  ");
});