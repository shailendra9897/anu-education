// FILE: tests/chatwoot.webhook.test.ts
//
// ─────────────────────────────────────────────────────────────────
// CHATWOOT WEBHOOK OBSERVE-ONLY TESTS (Task 6B verification)
//
// Drives the REAL handler (lib/chatwoot/handler.ts), classifier
// (lib/chatwoot/payload.ts) and both route controllers.
//
// OBSERVE-ONLY GUARANTEE under test:
//   • a global fetch GUARD throws if ANY network egress is attempted
//     (Groq / Chatwoot API / Evolution / WhatsApp),
//   • no prisma/database module exists anywhere in this import graph,
//   • therefore the endpoint can observe but cannot act.
//
// Run: npx tsx tests/chatwoot.webhook.test.ts
// ─────────────────────────────────────────────────────────────────

process.env.CHATWOOT_WEBHOOK_SECRET = "test-chatwoot-webhook-secret";
process.env.CHATWOOT_INBOX_ID = "1";

import { test, before, after } from "node:test";
import assert from "node:assert/strict";

import { handleChatwootWebhookPost } from "../lib/chatwoot/handler";
import {
  classifyChatwootMessageEvent,
  type ChatwootIgnoreReason,
} from "../lib/chatwoot/payload";
import * as basePathRoute from "../app/api/webhook/chatwoot/route";
import * as secretPathRoute from "../app/api/webhook/chatwoot/[secret]/route";

const SECRET = "test-chatwoot-webhook-secret";

// ── network egress guard ──────────────────────────────────────────
const realFetch = global.fetch;

before(() => {
  global.fetch = (() => {
    throw new Error("NETWORK EGRESS BLOCKED: observe-only phase");
  }) as typeof fetch;
});

after(() => {
  global.fetch = realFetch;
});

// ── fixtures ──────────────────────────────────────────────────────

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
    contact: {
      id: 42,
      phone_number: "+917016497087",
    },
  },
};

function postJson(
  body: string,
  secret: string | null = SECRET
): Promise<Response> {
  return handleChatwootWebhookPost(
    new Request("http://localhost/api/webhook/chatwoot/x", {
      method: "POST",
      body,
    }),
    secret
  );
}

function expectIgnored(reason: ChatwootIgnoreReason) {
  return (payload: unknown) => {
    const result = classifyChatwootMessageEvent(payload, 1);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, reason);
  };
}

// ── classifier: acceptance & extraction ───────────────────────────

test("classifier accepts a genuine inbound student message and extracts identity fields", () => {
  const result = classifyChatwootMessageEvent(BASE_PAYLOAD, 1);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const m = result.observed;
  assert.equal(m.messageId, 501);
  assert.equal(m.conversationId, 33);
  assert.equal(m.inboxId, 1);
  assert.equal(m.phone, "+917016497087");
  assert.equal(m.senderName, "Ravi Kumar");
  assert.equal(m.content, BASE_PAYLOAD.content);
  assert.equal(m.createdAtIso, new Date(1755936000 * 1000).toISOString());
});

test("classifier accepts numeric incoming marker and string inbox_id", () => {
  const payload = {
    ...BASE_PAYLOAD,
    message_type: 0,
    conversation: { ...BASE_PAYLOAD.conversation, inbox_id: "1" },
  };
  const result = classifyChatwootMessageEvent(payload, 1);
  assert.equal(result.ok, true);
});

test("phone falls back through meta.sender then top-level contact", () => {
  const noConvContact = {
    ...BASE_PAYLOAD,
    conversation: { id: 33, inbox_id: 1, meta: { sender: { phone_number: "+919999900001" } } },
  };
  const r1 = classifyChatwootMessageEvent(noConvContact, 1);
  assert.ok(r1.ok && r1.observed.phone === "+919999900001");

  const topLevelOnly = {
    ...BASE_PAYLOAD,
    conversation: { id: 33, inbox_id: 1 },
  };
  const r2 = classifyChatwootMessageEvent(topLevelOnly, 1);
  assert.ok(r2.ok && r2.observed.phone === "+917016497087");
});

test("phone falls back to root.sender.phone_number", () => {
  const payload = {
    ...BASE_PAYLOAD,
    contact: undefined,
    sender: {
      id: 42,
      name: "Ravi Kumar",
      type: "contact",
      phone_number: "+919876543210",
    },
    conversation: { id: 33, inbox_id: 1 },
  };
  const result = classifyChatwootMessageEvent(payload, 1);
  assert.ok(result.ok && result.observed.phone === "+919876543210");
});

test("phone falls back to root.sender.identifier", () => {
  const payload = {
    ...BASE_PAYLOAD,
    contact: undefined,
    sender: {
      id: 42,
      name: "Ravi Kumar",
      type: "contact",
      identifier: "919876543210",
    },
    conversation: { id: 33, inbox_id: 1 },
  };
  const result = classifyChatwootMessageEvent(payload, 1);
  assert.ok(result.ok && result.observed.phone === "919876543210");
});

// ── classifier: explicit rejection matrix ─────────────────────────

test("rejects non-message_created events incl. message_updated", () => {
  expectIgnored("unsupported_event")({
    ...BASE_PAYLOAD,
    event: "message_updated",
  });
  expectIgnored("unsupported_event")({
    ...BASE_PAYLOAD,
    event: "conversation_updated",
  });
  expectIgnored("unsupported_event")({ ...BASE_PAYLOAD, event: undefined });
});

test("rejects outgoing messages (counsellor/AI replies)", () => {
  expectIgnored("non_incoming_message")({
    ...BASE_PAYLOAD,
    message_type: "outgoing",
  });
  expectIgnored("non_incoming_message")({
    ...BASE_PAYLOAD,
    message_type: 1,
  });
  expectIgnored("non_incoming_message")({
    ...BASE_PAYLOAD,
    message_type: undefined,
  });
});

test("accepts Chatwoot contact webhook_data without type=contact", () => {
  const result = classifyChatwootMessageEvent(
    {
      ...BASE_PAYLOAD,
      sender: {
        id: 42,
        name: "Ravi Kumar",
        phone_number: "+917016497087",
      },
    },
    1
  );

  assert.equal(result.ok, true);
});

test("rejects private notes", () => {
  expectIgnored("private_note")({
    ...BASE_PAYLOAD,
    private: true,
  });
  expectIgnored("private_note")({
    ...BASE_PAYLOAD,
    private: undefined,
  });
});

test("rejects bot/system/counsellor senders", () => {
  expectIgnored("sender_not_contact")({
    ...BASE_PAYLOAD,
    sender: { type: "user", name: "Counsellor" },
  });
  expectIgnored("sender_not_contact")({
    ...BASE_PAYLOAD,
    sender: { type: "agent_bot" },
  });
  expectIgnored("sender_not_contact")({ ...BASE_PAYLOAD, sender: undefined });
});

test("rejects empty or non-text content", () => {
  expectIgnored("empty_content")({ ...BASE_PAYLOAD, content: "" });
  expectIgnored("empty_content")({ ...BASE_PAYLOAD, content: "   " });
  expectIgnored("empty_content")({ ...BASE_PAYLOAD, content: undefined });
  expectIgnored("empty_content")({ ...BASE_PAYLOAD, content: 12345 });
});

test("rejects foreign or missing inbox", () => {
  expectIgnored("inbox_mismatch")(classifyPayloadWithInbox(2));
  expectIgnored("inbox_mismatch")(classifyPayloadWithInbox(undefined));
});

function classifyPayloadWithInbox(inboxId: number | undefined) {
  return {
    ...BASE_PAYLOAD,
    conversation: { ...BASE_PAYLOAD.conversation, inbox_id: inboxId },
  };
}

test("rejects malformed payloads", () => {
  for (const bad of [null, undefined, "string", 42, [], true]) {
    expectIgnored("malformed_payload")(bad as unknown);
  }
});

// ── handler: HTTP contract & auth ─────────────────────────────────

test("handler returns 200 observed with exact body for accepted events", async () => {
  const res = await postJson(JSON.stringify(BASE_PAYLOAD));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "observed" });
});

test("handler returns 200 ignored with exact body for rejected events", async () => {
  const res = await postJson(
    JSON.stringify({ ...BASE_PAYLOAD, message_type: "outgoing" })
  );
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "ignored" });
});

test("handler rejects wrong and missing path secrets with 403", async () => {
  const wrong = await postJson(JSON.stringify(BASE_PAYLOAD), "wrong-secret");
  assert.equal(wrong.status, 403);
  assert.deepEqual(await wrong.json(), { ok: false });

  const missing = await postJson(JSON.stringify(BASE_PAYLOAD), null);
  assert.equal(missing.status, 403);
  assert.deepEqual(await missing.json(), { ok: false });

  const empty = await postJson(JSON.stringify(BASE_PAYLOAD), "");
  assert.equal(empty.status, 403);
});

test("handler fails closed when CHATWOOT_WEBHOOK_SECRET is unset", async () => {
  const original = process.env.CHATWOOT_WEBHOOK_SECRET;
  process.env.CHATWOOT_WEBHOOK_SECRET = "";
  try {
    const res = await postJson(JSON.stringify(BASE_PAYLOAD), SECRET);
    assert.equal(res.status, 403);
    assert.deepEqual(await res.json(), { ok: false });
  } finally {
    process.env.CHATWOOT_WEBHOOK_SECRET = original;
  }
});

test("handler returns 400 for malformed JSON bodies", async () => {
  const res = await postJson("{not-json");
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { ok: false });
});

// ── route controllers ─────────────────────────────────────────────

const asNextRequest = (url: string) =>
  new Request(url) as unknown as Parameters<typeof basePathRoute.GET>[0];

test("[secret] route GET returns 405 (POST-only webhook)", async () => {
  const res = await secretPathRoute.GET(asNextRequest("http://localhost/x"));
  assert.equal(res.status, 405);
});

test("base route GET returns 405 and POST fails closed without secret segment", async () => {
  const got = await basePathRoute.GET(asNextRequest("http://localhost/y"));
  assert.equal(got.status, 405);

  const posted = await basePathRoute.POST(
    asNextRequest("http://localhost/y")
  );
  assert.equal(posted.status, 403);
  assert.deepEqual(await posted.json(), { ok: false });
});

test("[secret] route POST delegates with the path secret end-to-end", async () => {
  const req = new Request("http://localhost/api/webhook/chatwoot/x", {
    method: "POST",
    body: JSON.stringify(BASE_PAYLOAD),
  }) as unknown as Parameters<typeof secretPathRoute.POST>[0];

  const res = await secretPathRoute.POST(req, {
    params: { secret: SECRET },
  });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "observed" });

  const bad = await secretPathRoute.POST(req, {
    params: { secret: "nope" },
  });
  assert.equal(bad.status, 403);
});
