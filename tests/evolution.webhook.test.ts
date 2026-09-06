// FILE: tests/evolution.webhook.test.ts
//
// ─────────────────────────────────────────────────────────────────
// EVOLUTION INBOUND WEBHOOK TESTS
// (parser + handler transport + auth + bridge)
//
// Drives the REAL handler (lib/whatsapp/evolution.handler.ts) and the
// REAL Evolution parser (lib/whatsapp/evolution.payload.ts) using FAKE
// injectable bridge dependencies. No real Prisma, no real AI, no real
// Evolution, no network.
//
// NETWORK GUARD: a global fetch GUARD throws if ANY network egress is
// attempted (Groq / Evolution / WhatsApp), proving the handler cannot
// send anything.
//
// Run: npx tsx tests/evolution.webhook.test.ts
// ─────────────────────────────────────────────────────────────────

process.env.EVOLUTION_WEBHOOK_SECRET = "test-evolution-webhook-secret";
delete process.env.EVOLUTION_API_KEY; // dedicated-secret mode by default
process.env.DATABASE_URL = "postgresql://unused:unused@127.0.0.1/unused";

import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  handleEvolutionWebhookPost,
  verifyEvolutionAuth,
  type EvolutionBridgeDeps,
  type EvolutionOwnership,
} from "../lib/whatsapp/evolution.handler";
import {
  classifyEvolutionMessageEvent,
  jidToDigits,
  type EvolutionIgnoreReason,
} from "../lib/whatsapp/evolution.payload";
import {
  claimEvolutionMessageProcessing,
  releaseEvolutionMessageClaim,
  resetInMemoryClaimsForTests,
} from "../lib/whatsapp/evolution.idempotency";

const SECRET = "test-evolution-webhook-secret";

// ── network egress guard ──────────────────────────────────────────
const realFetch = global.fetch;

before(() => {
  global.fetch = (() => {
    throw new Error("NETWORK EGRESS BLOCKED: Evolution webhook must not send");
  }) as typeof fetch;
});

after(() => {
  global.fetch = realFetch;
});

beforeEach(() => {
  resetInMemoryClaimsForTests();
});

// ── fake bridge dependencies with call tracing ────────────────────

type FakeBridge = Required<Omit<EvolutionBridgeDeps, "claims">> & {
  claims: Required<NonNullable<EvolutionBridgeDeps["claims"]>>;
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
  ownership: EvolutionOwnership;
  conversationName: string | null;
  failResolve: boolean;
  failAi: boolean;
  failSend: boolean;
  saveMessageCalls: { conversationId: string; content: string }[];
  sendCalls: { phone: string; reply: string }[];
};

function createFakeBridge(
  overrides: Partial<{
    ownership: EvolutionOwnership;
    conversationName: string | null;
    failResolve: boolean;
    failAi: boolean;
    failSend: boolean;
  }> = {}
): FakeBridge {
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
          id: "conv-evo",
          phone: phone ?? null,
          name: state.conversationName,
        },
        created: false,
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
    updateProfileNameIfMissing: async (conversationId, profileName) => {
      calls.updateProfileNameIfMissing += 1;
      return { conversationId, profileName };
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

// ── fixtures ──────────────────────────────────────────────────────

/**
 * Canonical Evolution `messages.upsert` webhook body (API V2 shape) for
 * a genuine 1:1 inbound student text message.
 */
const BASE_PAYLOAD = {
  event: "messages.upsert",
  instance: "anu_education",
  data: {
    key: {
      remoteJid: "917016497087@s.whatsapp.net",
      fromMe: false,
      id: "3EB0F1C2E1A2F3A4B5C6D7E8",
    },
    pushName: "Ravi Kumar",
    message: {
      conversation: "Hi, I want to book a demo class",
    },
    messageTimestamp: 1755936000,
  },
  destination: "messages.upsert",
};

function postJson(
  body: string,
  deps: EvolutionBridgeDeps,
  secret: string | null = SECRET,
  headers: Record<string, string> = {}
): Promise<Response> {
  return handleEvolutionWebhookPost(
    new Request("http://localhost/api/webhook/evolution/x", {
      method: "POST",
      body,
      headers,
    }),
    secret,
    deps
  );
}

function expectIgnored(reason: EvolutionIgnoreReason) {
  return (payload: unknown) => {
    const result = classifyEvolutionMessageEvent(payload);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, reason);
  };
}

// ── parser: acceptance & extraction ───────────────────────────────

test("parser: valid incoming text message → extracted fields", () => {
  const result = classifyEvolutionMessageEvent(BASE_PAYLOAD);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.observed.messageId, "3EB0F1C2E1A2F3A4B5C6D7E8");
  assert.equal(result.observed.remoteJid, "917016497087@s.whatsapp.net");
  assert.equal(result.observed.senderPhoneE164, "+917016497087");
  assert.equal(result.observed.senderPhoneDigits, "917016497087");
  assert.equal(result.observed.textBody, "Hi, I want to book a demo class");
  assert.equal(result.observed.pushName, "Ravi Kumar");
  assert.equal(result.observed.instance, "anu_education");
  assert.equal(result.observed.eventName, "messages.upsert");
  assert.equal(result.observed.messageTimestampSec, 1755936000);
  assert.ok(result.observed.receivedAt instanceof Date);
});

test("parser: extendedTextMessage accepted; digits-only + @c.us JIDs accepted", () => {
  const extended = {
    ...BASE_PAYLOAD,
    data: {
      ...BASE_PAYLOAD.data,
      message: { extendedTextMessage: { text: "longer student text" } },
    },
  };
  const r1 = classifyEvolutionMessageEvent(extended);
  assert.equal(r1.ok, true);
  if (r1.ok) assert.equal(r1.observed.textBody, "longer student text");

  // @c.us legacy JID form
  const cus = {
    ...BASE_PAYLOAD,
    data: { ...BASE_PAYLOAD.data, key: { remoteJid: "7016497087@c.us", fromMe: false, id: "X1" } },
  };
  const r2 = classifyEvolutionMessageEvent(cus);
  assert.equal(r2.ok, true);
  if (r2.ok) assert.equal(r2.observed.senderPhoneE164, "+917016497087");
});

test("phone normalization: jidToDigits strips domain suffix", () => {
  assert.equal(jidToDigits("917016497087@s.whatsapp.net"), "917016497087");
  assert.equal(jidToDigits("7016497087@c.us"), "7016497087");
  assert.equal(jidToDigits("917016497087"), "917016497087");
  assert.equal(jidToDigits(null), null);
  assert.equal(jidToDigits("abc"), null);
});

test("parser: rejection matrix", () => {
  const rejections: Record<string, (payload: unknown) => boolean> = {
    unsupported_event: (p) => {
      const r = classifyEvolutionMessageEvent({ ...(p as object), event: "connection.update" });
      return !r.ok && r.reason === "unsupported_event";
    },
    group_message_jid: (p) => {
      const r = classifyEvolutionMessageEvent({
        ...(p as object),
        data: {
          ...(p as { data: { key: { remoteJid: string } } }).data,
          key: { remoteJid: "1234567890-123456@g.us", fromMe: false, id: "G1" },
        },
      });
      return !r.ok && r.reason === "group_message";
    },
    group_message_participant: (p) => {
      const r = classifyEvolutionMessageEvent({
        ...(p as object),
        data: {
          ...(p as { data: object }).data,
          participant: "917016497087@s.whatsapp.net",
        },
      } as Record<string, unknown>);
      return !r.ok && r.reason === "group_message";
    },
    self_message: (p) => {
      const r = classifyEvolutionMessageEvent({
        ...(p as object),
        data: {
          ...(p as { data: object }).data,
          key: { remoteJid: "917016497087@s.whatsapp.net", fromMe: true, id: "S1" },
        },
      });
      return !r.ok && r.reason === "self_message";
    },
    non_text_message: (p) => {
      const r = classifyEvolutionMessageEvent({
        ...(p as object),
        data: {
          ...(p as { data: object }).data,
          message: { imageMessage: { url: "https://x/y.webp" } },
        },
      });
      return !r.ok && r.reason === "non_text_message";
    },
    empty_content: (p) => {
      const r = classifyEvolutionMessageEvent({
        ...(p as object),
        data: {
          ...(p as { data: object }).data,
          message: { conversation: "   " },
        },
      });
      return !r.ok && r.reason === "empty_content";
    },
    no_message_id: (p) => {
      const r = classifyEvolutionMessageEvent({
        ...(p as object),
        data: {
          ...(p as { data: object }).data,
          key: { remoteJid: "917016497087@s.whatsapp.net", fromMe: false },
        },
      });
      return !r.ok && r.reason === "no_message_id";
    },
    invalid_sender: (p) => {
      const r = classifyEvolutionMessageEvent({
        ...(p as object),
        data: {
          ...(p as { data: object }).data,
          key: { remoteJid: "unknown@s.whatsapp.net", fromMe: false, id: "U1" },
        },
      });
      return !r.ok && r.reason === "invalid_sender";
    },
  };

  for (const [name, check] of Object.entries(rejections)) {
    const payload = JSON.parse(JSON.stringify(BASE_PAYLOAD)) as object;
    assert.equal(check(payload), true, `should reject ${name}`);
  }

  for (const bad of [null, undefined, "string", 42, [], true]) {
    const r = classifyEvolutionMessageEvent(bad as unknown);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, "malformed_payload");
  }
});

test("parser: safe handling of missing optional fields", () => {
  const minimal = {
    event: "messages.upsert",
    data: {
      key: { remoteJid: "917016497087@s.whatsapp.net", fromMe: false, id: "M1" },
      message: { conversation: "hi" },
    },
  };
  const result = classifyEvolutionMessageEvent(minimal);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.observed.instance, null);
  assert.equal(result.observed.pushName, null);
  assert.equal(result.observed.messageTimestampSec, null);
  assert.equal(result.observed.receivedAt, null);

  // messageTimestamp as a numeric string
  const strTs = {
    ...minimal,
    data: { ...minimal.data, messageTimestamp: "1755936000" },
  };
  const r2 = classifyEvolutionMessageEvent(strTs);
  assert.equal(r2.ok, true);
  if (r2.ok) assert.equal(r2.observed.messageTimestampSec, 1755936000);
});

// ── auth ──────────────────────────────────────────────────────────

test("auth: dedicated webhook secret (path) — ok / invalid / unconfigured", () => {
  const secrets = { webhookSecret: "sec-123", apiKey: "key-456" };

  assert.equal(
    verifyEvolutionAuth("sec-123", null, secrets),
    "ok"
  );
  assert.equal(
    verifyEvolutionAuth("wrong", null, secrets),
    "invalid"
  );
  assert.equal(
    verifyEvolutionAuth(null, "key-456", secrets),
    "invalid" // webhook secret configured → header ignored
  );
});

test("auth: Evolution-native apikey header mode when no webhook secret", () => {
  const secrets = { webhookSecret: null, apiKey: "key-456" };

  assert.equal(
    verifyEvolutionAuth(null, "key-456", secrets),
    "ok"
  );
  assert.equal(
    verifyEvolutionAuth("anything", "key-456", secrets),
    "ok" // path secret not authoritative in header mode
  );
  assert.equal(
    verifyEvolutionAuth(null, "wrong", secrets),
    "invalid"
  );
});

test("auth: neither configured → unconfigured (fail closed)", () => {
  assert.equal(
    verifyEvolutionAuth(null, null, { webhookSecret: null, apiKey: null }),
    "unconfigured"
  );
});

test("webhook: invalid authentication → 403", async () => {
  const fake = createFakeBridge();
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake, "wrong-secret");
  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { ok: false });
  assert.equal(fake.calls.findOrCreateConversation, 0);
  assert.equal(fake.calls.runAi, 0);
  assert.equal(fake.calls.sent, 0);
});

test("webhook: missing authentication → 403", async () => {
  const fake = createFakeBridge();
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake, null);
  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { ok: false });
});

test("webhook: apikey header mode authenticates (no path secret)", async () => {
  const savedSecret = process.env.EVOLUTION_WEBHOOK_SECRET;
  delete process.env.EVOLUTION_WEBHOOK_SECRET;
  process.env.EVOLUTION_API_KEY = "test-evolution-api-key";
  try {
    const fake = createFakeBridge();
    const res = await postJson(
      JSON.stringify(BASE_PAYLOAD),
      fake,
      null,
      { apikey: "test-evolution-api-key" }
    );
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, outcome: "replied" });

    const wrong = await postJson(
      JSON.stringify(BASE_PAYLOAD),
      createFakeBridge(),
      null,
      { apikey: "wrong" }
    );
    assert.equal(wrong.status, 403);
  } finally {
    process.env.EVOLUTION_WEBHOOK_SECRET = savedSecret;
    delete process.env.EVOLUTION_API_KEY;
  }
});

test("webhook: unconfigured auth → 403 (fail closed)", async () => {
  const savedSecret = process.env.EVOLUTION_WEBHOOK_SECRET;
  const savedKey = process.env.EVOLUTION_API_KEY;
  delete process.env.EVOLUTION_WEBHOOK_SECRET;
  delete process.env.EVOLUTION_API_KEY;
  try {
    const fake = createFakeBridge();
    const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake, null);
    assert.equal(res.status, 403);
    assert.deepEqual(await res.json(), { ok: false });
  } finally {
    process.env.EVOLUTION_WEBHOOK_SECRET = savedSecret;
    process.env.EVOLUTION_API_KEY = savedKey;
  }
});

test("route base path without secret: auth semantics covered by verifyEvolutionAuth", () => {
  // The base route (no [secret] segment) delegates to the same handler
  // with secret = null. In apikey-header mode that is valid auth; with a
  // configured EVOLUTION_WEBHOOK_SECRET it is 403. The decision is the
  // pure function below — no DB/route round-trip needed here.
  assert.equal(
    verifyEvolutionAuth(null, "test-evolution-api-key", {
      webhookSecret: null,
      apiKey: "test-evolution-api-key",
    }),
    "ok"
  );
  assert.equal(
    verifyEvolutionAuth(null, "test-evolution-api-key", {
      webhookSecret: "sec",
      apiKey: "test-evolution-api-key",
    }),
    "invalid"
  );
});

// ── handler / bridge ──────────────────────────────────────────────

test("UNASSIGNED: resolve, ownership, inbound once, AI once, Evolution once, replied", async () => {
  const fake = createFakeBridge({ ownership: "UNASSIGNED" });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "replied" });

  assert.equal(fake.calls.claim, 1, "idempotency claim");
  assert.equal(fake.calls.findOrCreateConversation, 1, "conversation resolved");
  assert.equal(fake.calls.getOwnership, 1, "ownership checked");
  // On UNASSIGNED the AI adapter saves the inbound message itself; the
  // handler must NOT pre-save it (single-write, same rule as Chatwoot).
  assert.equal(fake.calls.saveUserMessage, 0, "inbound NOT saved by handler (adapter saves it)");
  assert.equal(fake.calls.runAi, 1, "AI called exactly once");
  assert.equal(fake.calls.sent, 1, "Evolution called exactly once");

  // Correct normalized E.164 phone and AI reply passed to Evolution.
  assert.deepEqual(fake.sendCalls[0], {
    phone: "+917016497087",
    reply: "AI reply to: Hi, I want to book a demo class",
  });

  assert.equal(fake.calls.release, 0, "no release on success");
});

test("profile-name enrichment: called only when conversation name missing", async () => {
  const missing = createFakeBridge({ ownership: "UNASSIGNED", conversationName: null });
  await postJson(JSON.stringify(BASE_PAYLOAD), missing);
  assert.equal(missing.calls.updateProfileNameIfMissing, 1);

  const present = createFakeBridge({ ownership: "UNASSIGNED", conversationName: "Existing" });
  await postJson(JSON.stringify(BASE_PAYLOAD), present);
  assert.equal(present.calls.updateProfileNameIfMissing, 0);
});

test("ASSIGNED: inbound saved once, AI 0, Evolution 0, ai_skipped_assigned", async () => {
  const fake = createFakeBridge({ ownership: "ASSIGNED" });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "ai_skipped_assigned" });
  assert.equal(fake.calls.saveUserMessage, 1, "inbound saved by handler");
  assert.equal(fake.calls.runAi, 0, "AI never called for ASSIGNED");
  assert.equal(fake.calls.sent, 0, "Evolution never called for ASSIGNED");
});

test("HANDED_OFF: inbound saved once, AI 0, Evolution 0, ai_skipped_handed_off", async () => {
  const fake = createFakeBridge({ ownership: "HANDED_OFF" });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "ai_skipped_handed_off" });
  assert.equal(fake.calls.saveUserMessage, 1);
  assert.equal(fake.calls.runAi, 0);
  assert.equal(fake.calls.sent, 0);
});

test("duplicate: same Evolution message id → no AI, no Evolution, duplicate", async () => {
  const fake = createFakeBridge({ ownership: "UNASSIGNED" });

  const first = await postJson(JSON.stringify(BASE_PAYLOAD), fake);
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { ok: true, outcome: "replied" });

  // Reset counts after the first (successful) processing.
  fake.calls.findOrCreateConversation = 0;
  fake.calls.saveUserMessage = 0;
  fake.calls.getOwnership = 0;
  fake.calls.updateProfileNameIfMissing = 0;
  fake.calls.runAi = 0;
  fake.calls.sent = 0;

  const second = await postJson(JSON.stringify(BASE_PAYLOAD), fake);
  assert.equal(second.status, 200);
  assert.deepEqual(await second.json(), { ok: true, outcome: "duplicate" });

  assert.equal(fake.calls.findOrCreateConversation, 0, "no conversation resolve");
  assert.equal(fake.calls.runAi, 0, "AI never called for duplicate");
  assert.equal(fake.calls.sent, 0, "Evolution never called for duplicate");
});

test("idempotency service: claim → duplicate → release → re-claim (fake store)", async () => {
  const markers: string[] = [];
  const deps = {
    findMarkers: async (key: string) => (markers.includes(key) ? [{ id: "m" }] : []),
    insertMarker: async (key: string) => {
      if (markers.includes(key)) throw Object.assign(new Error("dup"), { code: "P2002" });
      markers.push(key);
    },
    deleteMarkers: async (key: string) => {
      const i = markers.indexOf(key);
      if (i >= 0) markers.splice(i, 1);
    },
  };

  assert.equal(await claimEvolutionMessageProcessing("EVO-1", deps), true);
  assert.equal(await claimEvolutionMessageProcessing("EVO-1", deps), false, "duplicate blocked");
  await releaseEvolutionMessageClaim("EVO-1", deps);
  assert.equal(await claimEvolutionMessageProcessing("EVO-1", deps), true, "re-claimable after genuine failure");
});

test("AI failure: release claim, HTTP 500, no Evolution send", async () => {
  const fake = createFakeBridge({ ownership: "UNASSIGNED", failAi: true });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { ok: false });
  assert.equal(fake.calls.runAi, 1, "AI attempted once");
  assert.equal(fake.calls.sent, 0, "no Evolution send");
  assert.equal(fake.calls.release, 1, "claim released on AI failure");
});

test("Evolution send failure: AI once, Evolution once, claim NOT released, reply_failed 200", async () => {
  const fake = createFakeBridge({ ownership: "UNASSIGNED", failSend: true });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "reply_failed" });
  assert.equal(fake.calls.runAi, 1);
  assert.equal(fake.calls.sent, 1);
  assert.equal(fake.calls.release, 0, "claim kept after send failure");
});

test("processing failure: claim released, genuine failure, no send", async () => {
  const fake = createFakeBridge({ ownership: "UNASSIGNED", failResolve: true });
  const res = await postJson(JSON.stringify(BASE_PAYLOAD), fake);

  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { ok: false });
  assert.equal(fake.calls.release, 1, "claim released");
  assert.equal(fake.calls.saveUserMessage, 0);
  assert.equal(fake.calls.runAi, 0);
  assert.equal(fake.calls.sent, 0);
});

test("group message routed through handler → 200 group_message, no AI, no send", async () => {
  const groupPayload = {
    ...BASE_PAYLOAD,
    data: {
      ...BASE_PAYLOAD.data,
      key: { remoteJid: "1234567890-123456@g.us", fromMe: false, id: "G-1" },
      participant: "917016497087@s.whatsapp.net",
    },
  };
  const fake = createFakeBridge();
  const res = await postJson(JSON.stringify(groupPayload), fake);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "group_message" });
  assert.equal(fake.calls.runAi, 0);
  assert.equal(fake.calls.sent, 0);
  assert.equal(fake.calls.findOrCreateConversation, 0);
});

test("self message (fromMe=true) routed through handler → 200 ignored, no AI", async () => {
  const selfPayload = {
    ...BASE_PAYLOAD,
    data: {
      ...BASE_PAYLOAD.data,
      key: { remoteJid: "917016497087@s.whatsapp.net", fromMe: true, id: "S-1" },
    },
  };
  const fake = createFakeBridge();
  const res = await postJson(JSON.stringify(selfPayload), fake);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "ignored" });
  assert.equal(fake.calls.runAi, 0);
  assert.equal(fake.calls.sent, 0);
  assert.equal(fake.calls.findOrCreateConversation, 0);
});

test("unicode/whitespace robustness: trimmed text body survives", async () => {
  const payload = {
    ...BASE_PAYLOAD,
    data: {
      ...BASE_PAYLOAD.data,
      message: { conversation: "  Hello, I need IELTS coaching  " },
      key: { remoteJid: "917016497087@s.whatsapp.net", fromMe: false, id: "U-1" },
    },
  };
  const fake = createFakeBridge();
  const res = await postJson(JSON.stringify(payload), fake);
  assert.equal(res.status, 200);
  assert.deepEqual(fake.sendCalls[0], {
    phone: "+917016497087",
    reply: "AI reply to: Hello, I need IELTS coaching",
  });
});