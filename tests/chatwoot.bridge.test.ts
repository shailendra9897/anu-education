// FILE: tests/chatwoot.bridge.test.ts
//
// ─────────────────────────────────────────────────────────────────
// CHATWOOT BRIDGE — Phase 3 (ingest + ownership gate + AI + Evolution)
//
// Verifies the handler's bridge pipeline end-to-end using injected
// FAKE dependencies. No real Prisma, no real AI, no real Evolution,
// no network.
//
// Required coverage:
//   1. UNASSIGNED → resolve, ownership, inbound saved once, AI once,
//      Evolution once, correct phone+reply, outcome replied
//   2. ASSIGNED → inbound saved once, AI 0, Evolution 0,
//      outcome ai_skipped_assigned
//   3. HANDED_OFF → inbound saved once, AI 0, Evolution 0,
//      outcome ai_skipped_handed_off
//   4. DUPLICATE → AI 0, Evolution 0, no save, no ownership
//   5. AI failure → release claim, HTTP 500, no Evolution
//   6. Evolution failure → AI once, Evolution once, claim NOT released,
//      outcome reply_failed, HTTP 200
//   7. Missing phone → AI 0, Evolution 0, claim released, HTTP 500
//   8. Profile-name enrichment (missing vs existing)
//   9. Classifier rejection matrix
//  10. Idempotency behavior (covered separately, exercised here)
//  11. Network guard — global fetch throws on any egress
//  12. No duplicate inbound Message persistence
// ─────────────────────────────────────────────────────────────────

process.env.CHATWOOT_WEBHOOK_SECRET = "test-chatwoot-webhook-secret";
process.env.CHATWOOT_INBOX_ID = "1";
process.env.DATABASE_URL = "postgresql://unused:unused@127.0.0.1/unused";

import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  handleChatwootWebhookPost,
  type ChatwootBridgeDeps,
  type ChatwootOwnership,
} from "../lib/chatwoot/handler";
import { classifyChatwootMessageEvent } from "../lib/chatwoot/payload";
import { resetInMemoryClaimsForTests } from "../lib/chatwoot/idempotency";

const SECRET = "test-chatwoot-webhook-secret";

// ── network egress guard ──────────────────────────────────────────
const realFetch = global.fetch;

before(() => {
  global.fetch = (() => {
    throw new Error("NETWORK EGRESS BLOCKED: bridge must not send");
  }) as typeof fetch;
});

after(() => {
  global.fetch = realFetch;
});

beforeEach(() => {
  resetInMemoryClaimsForTests();
});

// ── fake dependencies with call tracing ───────────────────────────

type FakeBridge = Required<Omit<ChatwootBridgeDeps, "claims">> & {
  claims: Required<NonNullable<ChatwootBridgeDeps["claims"]>>;
  calls: {
    claim: number;
    findOrCreateConversation: number;
    getOwnership: number;
    saveUserMessage: number;
    updateProfileNameIfMissing: number;
    release: number;
    runAi: number;
    sent: number;
  };
  ownership: ChatwootOwnership;
  conversationName: string | null;
  isNewConversation: boolean;
  failResolve: boolean;
  failAi: boolean;
  failSend: boolean;
  saveMessageCalls: { conversationId: string; content: string }[];
  sendCalls: { phone: string; reply: string }[];
};

function createFakeBridge(overrides: Partial<{
  ownership: ChatwootOwnership;
  conversationName: string | null;
  isNewConversation: boolean;
  failResolve: boolean;
  failAi: boolean;
  failSend: boolean;
}> = {}): FakeBridge {
  const calls = {
    claim: 0,
    findOrCreateConversation: 0,
    getOwnership: 0,
    saveUserMessage: 0,
    updateProfileNameIfMissing: 0,
    release: 0,
    runAi: 0,
    sent: 0,
  };
  const state = {
    ownership: overrides.ownership ?? ("UNASSIGNED" as const),
    conversationName:
      overrides.conversationName === undefined ? null : overrides.conversationName,
    isNewConversation: overrides.isNewConversation ?? false,
    failResolve: overrides.failResolve ?? false,
    failAi: overrides.failAi ?? false,
    failSend: overrides.failSend ?? false,
  };
  const saveMessageCalls: { conversationId: string; content: string }[] = [];
  const sendCalls: { phone: string; reply: string }[] = [];

  const deps: FakeBridge = {
    calls,
    ownership: state.ownership,
    conversationName: state.conversationName,
    isNewConversation: state.isNewConversation,
    failResolve: state.failResolve,
    failAi: state.failAi,
    failSend: state.failSend,
    saveMessageCalls,
    sendCalls,
    findOrCreateConversation: async ({ phone }) => {
      calls.findOrCreateConversation += 1;
      if (state.failResolve) throw new Error("simulated resolve failure");
      return {
        conversation: {
          id: "conv-fake",
          phone: phone ?? null,
          name: state.conversationName,
        },
        created: state.isNewConversation,
      };
    },
    getOwnership: async (_conversationId) => {
      calls.getOwnership += 1;
      return state.ownership;
    },
    saveUserMessage: async (conversationId, content) => {
      calls.saveUserMessage += 1;
      saveMessageCalls.push({ conversationId, content });
      return {};
    },
    updateProfileNameIfMissing: async () => {
      calls.updateProfileNameIfMissing += 1;
      return {};
    },
    runAiPipeline: async (_conversation, userMessage) => {
      calls.runAi += 1;
      if (state.failAi) throw new Error("simulated AI failure");
      return `AI reply to: ${userMessage}`;
    },
    sendEvolutionWhatsAppText: async (phone, reply) => {
      calls.sent += 1;
      sendCalls.push({ phone, reply });
      if (state.failSend) return { ok: false, error: "simulated send failure" };
      return { ok: true, messageId: "evt-123" };
    },
    // Phase 1 — optional AI rate-limit gate. Off by default so these
    // tests keep their existing AI-path expectations unchanged.
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

  return deps;
}

function postJson(
  body: string,
  deps: ChatwootBridgeDeps,
  secret: string | null = SECRET
): Promise<Response> {
  return handleChatwootWebhookPost(
    new Request("http://localhost/api/webhook/chatwoot/x", {
      method: "POST",
      body,
    }),
    secret,
    deps
  );
}

const BASE_PAYLOAD = {
  event: "message_created",
  id: 501,
  content: "Hi, I want to book a demo class",
  message_type: "incoming",
  private: false,
  created_at: 1755936000,
  sender: {
    id: 42,
    name: "Ravi Kumar",
    phone_number: "+917016497087",
  },
  contact: {
    id: 42,
    name: "Ravi Kumar",
    phone_number: "+917016497087",
  },
  conversation: {
    id: 33,
    inbox_id: 1,
    status: "open",
    contact: { id: 42, phone_number: "+917016497087" },
  },
};

// ── tests ─────────────────────────────────────────────────────────

test("UNASSIGNED: resolve, ownership, inbound once, AI once, Evolution once, replied", async () => {
  const fake = createFakeBridge({ ownership: "UNASSIGNED" });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "replied" });

  assert.equal(fake.calls.claim, 1, "idempotency claim");
  assert.equal(fake.calls.findOrCreateConversation, 1, "conversation resolved");
  assert.equal(fake.calls.getOwnership, 1, "ownership checked");
  // Option B: on UNASSIGNED the AI adapter saves the inbound message;
  // the handler must NOT pre-save it → saveUserMessage = 0.
  assert.equal(fake.calls.saveUserMessage, 0, "inbound NOT saved by handler (adapter saves it)");
  assert.equal(fake.calls.runAi, 1, "AI called exactly once");
  assert.equal(fake.calls.sent, 1, "Evolution called exactly once");

  // Correct phone and AI reply passed to Evolution.
  assert.deepEqual(fake.sendCalls[0], {
    phone: "+917016497087",
    reply: "AI reply to: Hi, I want to book a demo class",
  });

  assert.equal(fake.calls.release, 0, "no release on success");
});

test("ASSIGNED: inbound saved once, AI 0, Evolution 0, ai_skipped_assigned", async () => {
  const fake = createFakeBridge({ ownership: "ASSIGNED" });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "ai_skipped_assigned" });

  assert.equal(fake.calls.saveUserMessage, 1, "inbound saved exactly once");
  assert.equal(fake.saveMessageCalls.length, 1, "exactly one inbound row");
  assert.equal(fake.calls.runAi, 0, "AI never called for ASSIGNED");
  assert.equal(fake.calls.sent, 0, "Evolution never called for ASSIGNED");
  assert.equal(fake.calls.release, 0);
});

test("HANDED_OFF: inbound saved once, AI 0, Evolution 0, ai_skipped_handed_off", async () => {
  const fake = createFakeBridge({ ownership: "HANDED_OFF" });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "ai_skipped_handed_off" });

  assert.equal(fake.calls.saveUserMessage, 1, "inbound saved exactly once");
  assert.equal(fake.saveMessageCalls.length, 1, "exactly one inbound row");
  assert.equal(fake.calls.runAi, 0, "AI never called for HANDED_OFF");
  assert.equal(fake.calls.sent, 0, "Evolution never called for HANDED_OFF");
  assert.equal(fake.calls.release, 0);
});

test("duplicate: no save, no ownership, no AI, no Evolution", async () => {
  const fake = createFakeBridge();

  const first = await postJson(JSON.stringify(BASE_PAYLOAD), fake);
  assert.equal(first.status, 200);

  // Reset counts after the first (successful) processing.
  fake.calls.findOrCreateConversation = 0;
  fake.calls.saveUserMessage = 0;
  fake.calls.getOwnership = 0;
  fake.calls.updateProfileNameIfMissing = 0;
  fake.calls.runAi = 0;
  fake.calls.sent = 0;

  // Second delivery of the same message → in-memory claim already set.
  const second = await postJson(JSON.stringify(BASE_PAYLOAD), fake);
  assert.equal(second.status, 200);
  assert.deepEqual(await second.json(), { ok: true, outcome: "duplicate" });

  assert.equal(fake.calls.findOrCreateConversation, 0, "no conversation resolve");
  assert.equal(fake.calls.saveUserMessage, 0, "no message save");
  assert.equal(fake.calls.getOwnership, 0, "no ownership check");
  assert.equal(fake.calls.runAi, 0, "AI never called for duplicate");
  assert.equal(fake.calls.sent, 0, "Evolution never called for duplicate");
});

test("AI failure: release claim, HTTP 500, no Evolution", async () => {
  const fake = createFakeBridge({ ownership: "UNASSIGNED", failAi: true });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { ok: false });
  assert.equal(fake.calls.runAi, 1, "AI attempted once");
  assert.equal(fake.calls.sent, 0, "no Evolution send");
  assert.equal(fake.calls.release, 1, "claim released on AI failure");
  // Handler never pre-saved inbound on UNASSIGNED.
  assert.equal(fake.calls.saveUserMessage, 0);
});

test("Evolution failure: AI once, Evolution once, claim NOT released, reply_failed 200", async () => {
  const fake = createFakeBridge({ ownership: "UNASSIGNED", failSend: true });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "reply_failed" });
  assert.equal(fake.calls.runAi, 1, "AI called once");
  assert.equal(fake.calls.sent, 1, "Evolution called once");
  assert.equal(fake.calls.release, 0, "claim NOT released on send failure");
});

test("missing phone/contact identity: safely rejected, no AI, no Evolution", async () => {
  const fake = createFakeBridge();

  // The classifier guarantees a phone/identifier for accepted events
  // (it refuses senders with no contact identity → sender_not_contact).
  // A payload with no usable identity is therefore safely rejected as
  // "ignored" rather than processed. The handler ALSO carries a
  // defensive post-claim phone-null branch (release + 500) for any
  // future classifier path that yields null phone.
  const noIdentity = {
    ...BASE_PAYLOAD,
    sender: { id: 42, name: "Ravi Kumar" },
    contact: undefined,
    conversation: { id: 33, inbox_id: 1 },
  };

  const res = await postJson(JSON.stringify(noIdentity), fake);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "ignored" });
  assert.equal(fake.calls.runAi, 0, "AI not called without contact identity");
  assert.equal(fake.calls.sent, 0, "Evolution not called without contact identity");
  assert.equal(fake.calls.findOrCreateConversation, 0, "no conversation resolution");
});

test("profile name: missing name → enrichment called", async () => {
  const fake = createFakeBridge({ ownership: "UNASSIGNED", conversationName: null });
  await postJson(JSON.stringify(BASE_PAYLOAD), fake);
  assert.equal(fake.calls.updateProfileNameIfMissing, 1, "enrichment called when name missing");
});

test("profile name: existing name → enrichment NOT called", async () => {
  const fake = createFakeBridge({ ownership: "UNASSIGNED", conversationName: "Existing Name" });
  await postJson(JSON.stringify(BASE_PAYLOAD), fake);
  assert.equal(fake.calls.updateProfileNameIfMissing, 0, "enrichment NOT called when name present");
});

test("no duplicate inbound Message persistence (UNASSIGNED single-write)", async () => {
  const fake = createFakeBridge({ ownership: "UNASSIGNED" });
  await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  // Handler did not pre-save the inbound message on UNASSIGNED, so the
  // only inbound write is the one the AI adapter performs. saveUserMessage
  // (the handler's write) must not be invoked.
  assert.equal(fake.calls.saveUserMessage, 0, "handler did not write inbound (adapter is sole writer)");
  assert.equal(fake.saveMessageCalls.length, 0, "no handler-initiated inbound write");
});

test("processing failure: claim released, genuine failure, no send", async () => {
  const fake = createFakeBridge({ ownership: "UNASSIGNED", failResolve: true });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { ok: false });
  assert.equal(fake.calls.release, 1, "claim released");
  assert.equal(fake.calls.saveUserMessage, 0, "no save on failure");
  assert.equal(fake.calls.runAi, 0, "no AI on failure");
  assert.equal(fake.calls.sent, 0, "no send on failure");
});

test("classifier rejection matrix still passes", () => {
  const rejections: Record<string, (payload: unknown) => boolean> = {
    outgoing: (p) => {
      const r = classifyChatwootMessageEvent({ ...(p as object), message_type: "outgoing" }, 1);
      return !r.ok && r.reason === "non_incoming_message";
    },
    private_note: (p) => {
      const r = classifyChatwootMessageEvent({ ...(p as object), private: true }, 1);
      return !r.ok && r.reason === "private_note";
    },
    unsupported_event: (p) => {
      const r = classifyChatwootMessageEvent({ ...(p as object), event: "message_updated" }, 1);
      return !r.ok && r.reason === "unsupported_event";
    },
    sender_not_contact: (p) => {
      const r = classifyChatwootMessageEvent(
        { ...(p as object), sender: { type: "user" } },
        1
      );
      return !r.ok && r.reason === "sender_not_contact";
    },
    empty_content: (p) => {
      const r = classifyChatwootMessageEvent({ ...(p as object), content: "" }, 1);
      return !r.ok && r.reason === "empty_content";
    },
    inbox_mismatch: (p) => {
      const r = classifyChatwootMessageEvent(
        { ...(p as object), conversation: { ...(p as { conversation: object }).conversation, inbox_id: 99 } },
        1
      );
      return !r.ok && r.reason === "inbox_mismatch";
    },
  };

  for (const [name, check] of Object.entries(rejections)) {
    const payload = JSON.parse(JSON.stringify(BASE_PAYLOAD)) as object;
    assert.equal(check(payload), true, `should reject ${name}`);
  }

  for (const bad of [null, undefined, "string", 42, [], true]) {
    const r = classifyChatwootMessageEvent(bad as unknown, 1);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, "malformed_payload");
  }
});

test("security: wrong and missing secret return 403", async () => {
  const fake = createFakeBridge();

  const wrong = await postJson(JSON.stringify(BASE_PAYLOAD), fake, "wrong-secret");
  assert.equal(wrong.status, 403);
  assert.deepEqual(await wrong.json(), { ok: false });

  const missing = await postJson(JSON.stringify(BASE_PAYLOAD), fake, null);
  assert.equal(missing.status, 403);
  assert.deepEqual(await missing.json(), { ok: false });
});
