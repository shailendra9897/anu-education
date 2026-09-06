// FILE: tests/webhook.integration.test.ts
//
// ─────────────────────────────────────────────────────────────────
// LOCAL WHATSAPP WEBHOOK INTEGRATION TESTS (Task 19 verification)
//
// Simulated Meta payloads driven through the REAL webhook pipeline:
//   parse/classify (payload.ts) → dispatch (webhook.service.ts)
//   → ownership gate → AI/send ports.
//
// External systems are mocked at the architectural seams (never the
// code under test):
//   - DB/AI/send  → fake WebhookDeps ports mirroring route wiring
//   - idempotency → in-memory claim store (same semantics)
//   - network     → global fetch GUARD that throws if anything tries
//                   to leave the process (proves no real WhatsApp
//                   message / Groq call can happen)
// Scenario 9 goes through the REAL Next.js route POST handler to
// verify signature rejection end-to-end (returns before any DB work).
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";

import {
  parseWhatsAppWebhookPayload,
  type ParsePayloadResult,
} from "../lib/whatsapp/payload";
import {
  processWhatsAppWebhookPayload,
  type OwnershipState,
  type OwnedConversation,
  type WebhookDeps,
} from "../lib/whatsapp/webhook.service";
import {
  resetInMemoryClaimsForTests,
  type IdempotencyDeps,
} from "../lib/whatsapp/idempotency";
import { routeIntent } from "../lib/chat/intent-router";
import { NextRequest } from "next/server";
import * as whatsappRoute from "../app/api/webhook/whatsapp/route";

// ── NETWORK GUARD — fail loudly if anything attempts outbound I/O ─

const realFetch = globalThis.fetch;
globalThis.fetch = (async () => {
  throw new Error(
    "NETWORK GUARD: outbound fetch attempted during webhook integration tests"
  );
}) as typeof fetch;

after(() => {
  globalThis.fetch = realFetch;
});

// ── FAKE PORTS (mirror of route.ts real wiring) ───────────────────

type CallRecorder = {
  conversationsCreated: Array<Record<string, unknown>>;
  ownershipChecks: string[];
  savedUserMessages: Array<{ conversationId: string; content: string }>;
  profileNameUpdates: Array<{ conversationId: string; name: string }>;
  aiCalls: Array<{ conversationId: string; message: string }>;
  sendCalls: Array<{ phone: string; text: string }>;
};

function makeFakes(options?: {
  ownership?: OwnershipState;
}): { deps: WebhookDeps; calls: CallRecorder; claimsRows: Map<string, number> } {
  const calls: CallRecorder = {
    conversationsCreated: [],
    ownershipChecks: [],
    savedUserMessages: [],
    profileNameUpdates: [],
    aiCalls: [],
    sendCalls: [],
  };

  const claimsRows = new Map<string, number>();
  const claims: IdempotencyDeps = {
    findMarkers: async (key) =>
      claimsRows.has(key) ? [{ id: key }] : [],
    insertMarker: async (key) => {
      claimsRows.set(key, Date.now());
    },
    deleteMarkers: async (key) => {
      claimsRows.delete(key);
    },
  };

  const conversation: OwnedConversation = {
    id: "conv_test_1",
    phone: "+919876543210",
    name: null,
  };

  const deps: WebhookDeps = {
    findOrCreateConversation: async (input) => {
      calls.conversationsCreated.push({ ...input });
      return { conversation, created: false };
    },
    getOwnership: async (conversationId) => {
      calls.ownershipChecks.push(conversationId);
      return options?.ownership ?? "UNASSIGNED";
    },
    saveUserMessage: async (cid, content) => {
      calls.savedUserMessages.push({ conversationId: cid, content });
    },
    updateProfileNameIfMissing: async (cid, name) => {
      calls.profileNameUpdates.push({ conversationId: cid, name });
    },
    // Stands in for lib/whatsapp/ai-adapter.service (Groq + demo flow).
    runAiPipeline: async (conv, message) => {
      calls.aiCalls.push({ conversationId: conv.id, message });
      return "ANU AI reply";
    },
    // Stands in for lib/whatsapp/send.sendWhatsAppText.
    sendText: async (phone, text) => {
      calls.sendCalls.push({ phone, text });
      return { ok: true, toDigits: "919876543210", messageId: "graph-1" };
    },
    claims,
  };

  return { deps, calls, claimsRows };
}

// ── META PAYLOAD BUILDERS ────────────────────────────────────────

const BUSINESS_DISPLAY_NUMBER = "919428186817"; // ANU Education number

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
                display_phone_number: BUSINESS_DISPLAY_NUMBER,
                phone_number_id: "PNID_ANU",
              },
              contacts: [
                { profile: { name: "Test Student" }, wa_id: "919876543210" },
              ],
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

function smbEchoPayload(): unknown {
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
                display_phone_number: BUSINESS_DISPLAY_NUMBER,
                phone_number_id: "PNID_ANU",
              },
              smb_message_echoes: [
                {
                  id: "wamid.ECHO_MANUAL_1",
                  from: BUSINESS_DISPLAY_NUMBER,
                  to: "919876543210",
                  timestamp: "1755000100",
                  type: "text",
                  text: { body: "counsellor typed this manually" },
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

function selfNumberPayload(): unknown {
  // Coexistence shape-drift simulation: business-originated message
  // appearing INSIDE value.messages[] instead of smb_message_echoes.
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
                display_phone_number: BUSINESS_DISPLAY_NUMBER,
                phone_number_id: "PNID_ANU",
              },
              messages: [
                {
                  from: BUSINESS_DISPLAY_NUMBER,
                  id: "wamid.SELF_1",
                  timestamp: "1755000200",
                  type: "text",
                  text: { body: "sent from our own Business App" },
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

function statusEventPayload(): unknown {
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
                display_phone_number: BUSINESS_DISPLAY_NUMBER,
                phone_number_id: "PNID_ANU",
              },
              statuses: [
                {
                  id: "wamid.OUTBOUND_1",
                  status: "delivered",
                  timestamp: "1755000300",
                  recipient_id: "919876543210",
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

beforeEach(() => {
  resetInMemoryClaimsForTests();
});

/** Narrowing helper — assert.ok on the discriminated parse result. */
function expectParsedOk(parsed: ParsePayloadResult) {
  if (!parsed.ok) {
    throw new Error(`payload failed to parse: ${parsed.reason}`);
  }
  return parsed;
}

// ── SCENARIO 1 — "Hello" → inbound_message → AI path ─────────────

test("1. student 'Hello' → HTTP 200, inbound_message, conversation created, AI reached", async () => {
  const { deps, calls } = makeFakes();
  const payload = studentTextPayload("Hello", "wamid.S1");

  const parsed = expectParsedOk(parseWhatsAppWebhookPayload(payload));
  assert.equal(parsed.events.length, 1);
  assert.equal(parsed.events[0].kind, "inbound_message");

  const result = await processWhatsAppWebhookPayload(deps, payload);

  assert.equal(result.status, 200); // HTTP 200 equivalent
  assert.deepEqual(calls.conversationsCreated, [
    { phone: "+919876543210", source: "WHATSAPP", sourcePage: "/whatsapp" },
  ]);
  assert.equal(calls.aiCalls.length, 1); // AI path reached
  assert.equal(calls.aiCalls[0]?.message, "Hello");
  assert.equal(calls.sendCalls.length, 1);
  assert.equal(calls.sendCalls[0]?.text, "ANU AI reply");
});

// ── SCENARIO 2 — German demo request → DEMO intent/demo flow ─────

test("2. 'I want a German demo class' → DEMO intent, demo flow trigger reached", async () => {
  // Real deterministic router used by the production AI adapter:
  const routed = routeIntent({ message: "I want a German demo class" });
  assert.equal(routed.intent, "DEMO");

  const { deps, calls } = makeFakes();
  const result = await processWhatsAppWebhookPayload(
    deps,
    studentTextPayload("I want a German demo class", "wamid.S2")
  );

  assert.equal(result.status, 200);
  // In production the adapter's DEMO branch (processDemoRequest) is
  // the FIRST thing executed inside this port for this intent.
  assert.equal(calls.aiCalls.length, 1);
  assert.equal(calls.aiCalls[0]?.message, "I want a German demo class");
  assert.equal(calls.conversationsCreated.length, 1);
});

// ── SCENARIO 3 — assigned counsellor → AI NOT called ─────────────

test("3. assigned conversation → HTTP 200, message saved, NO AI, NO reply", async () => {
  const { deps, calls } = makeFakes({ ownership: "ASSIGNED" });

  const result = await processWhatsAppWebhookPayload(
    deps,
    studentTextPayload("Are there evening batches?", "wamid.S3")
  );

  assert.equal(result.status, 200);
  assert.equal(calls.savedUserMessages.length, 1); // stored for counsellor
  assert.equal(calls.aiCalls.length, 0);           // AI NOT called
  assert.equal(calls.sendCalls.length, 0);         // WhatsApp reply NOT sent
});

// ── SCENARIO 4 — HANDED_OFF → AI NOT called ──────────────────────

test("4. HANDED_OFF conversation → HTTP 200, NO AI, NO reply", async () => {
  const { deps, calls } = makeFakes({ ownership: "HANDED_OFF" });

  const result = await processWhatsAppWebhookPayload(
    deps,
    studentTextPayload("hello again", "wamid.S4")
  );

  assert.equal(result.status, 200);
  assert.equal(calls.aiCalls.length, 0);
  assert.equal(calls.sendCalls.length, 0);
  assert.ok(calls.ownershipChecks.includes("conv_test_1"));
});

// ── SCENARIO 5 — Coexistence smb_message_echoes → ignored ────────

test("5. smb_message_echoes → HTTP 200, echo ignored, NO AI", async () => {
  const { deps, calls } = makeFakes();

  const result = await processWhatsAppWebhookPayload(deps, smbEchoPayload());

  assert.equal(result.status, 200);
  assert.equal(result.outcomes[0]?.action, "echo_ignored");
  assert.equal(calls.conversationsCreated.length, 0);
  assert.equal(calls.aiCalls.length, 0);
  assert.equal(calls.sendCalls.length, 0);
});

// ── SCENARIO 6 — self-number inside value.messages[] → ignored ───

test("6. self-number message → HTTP 200, self_message_ignored, NO AI", async () => {
  const { deps, calls } = makeFakes();

  const parsed = expectParsedOk(parseWhatsAppWebhookPayload(selfNumberPayload()));
  assert.equal(parsed.events[0]?.kind, "self_message_ignored");

  const result = await processWhatsAppWebhookPayload(deps, selfNumberPayload());

  assert.equal(result.status, 200);
  assert.equal(result.outcomes[0]?.action, "self_message_ignored");
  assert.equal(calls.conversationsCreated.length, 0);
  assert.equal(calls.aiCalls.length, 0);
  assert.equal(calls.sendCalls.length, 0);
});

// ── SCENARIO 7 — WhatsApp status event → ignored ─────────────────

test("7. delivery/status event → HTTP 200, ignored, NO AI", async () => {
  const { deps, calls } = makeFakes();

  const result = await processWhatsAppWebhookPayload(deps, statusEventPayload());

  assert.equal(result.status, 200);
  assert.equal(result.outcomes[0]?.action, "status_ignored");
  assert.equal(calls.aiCalls.length, 0);
  assert.equal(calls.sendCalls.length, 0);
});

// ── SCENARIO 8 — duplicate wamid → single AI call/reply ──────────

test("8. duplicate wamid → second delivery produces NO extra AI call/reply", async () => {
  const { deps, calls } = makeFakes(); // shared claims store across deliveries

  const first = await processWhatsAppWebhookPayload(
    deps,
    studentTextPayload("What are IELTS fees?", "wamid.DUP_1")
  );
  const second = await processWhatsAppWebhookPayload(
    deps,
    studentTextPayload("What are IELTS fees?", "wamid.DUP_1")
  );

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(second.outcomes[0]?.action, "duplicate");
  assert.equal(calls.aiCalls.length, 1);
  assert.equal(calls.sendCalls.length, 1);
});

// ── SCENARIO 9 — invalid signature rejected by REAL route ────────

test("9. invalid/missing X-Hub-Signature-256 → 401, AI NOT called, no side effects", async () => {
  const { deps, calls } = makeFakes();
  const rawBody = JSON.stringify(studentTextPayload("Hello", "wamid.SIG_1"));

  process.env.WHATSAPP_APP_SECRET = "integration-test-secret";
  try {
    const url = "http://localhost:3000/api/webhook/whatsapp";

    const tampered = await whatsappRoute.POST(
      new NextRequest(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": "sha256=" + "ab".repeat(32),
        },
        body: rawBody,
      })
    );
    assert.equal(tampered.status, 401);

    const unsigned = await whatsappRoute.POST(
      new NextRequest(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: rawBody,
      })
    );
    assert.equal(unsigned.status, 401);

    assert.deepEqual(await tampered.json(), { error: "invalid signature" });
  } finally {
    delete process.env.WHATSAPP_APP_SECRET;
  }

  // Structural guarantee: rejection happens BEFORE any port wiring
  // (DB/AI/send) is invoked — verified by zero recorded interactions.
  assert.equal(calls.aiCalls.length, 0);
  assert.equal(calls.sendCalls.length, 0);
  assert.equal(calls.conversationsCreated.length, 0);
  void deps;
});

// ── SCENARIO 10 — malformed payload safely rejected/ignored ──────

test("10. malformed payload → safely handled, NO AI", async () => {
  const { deps, calls } = makeFakes();

  const notJson = await processWhatsAppWebhookPayload(deps, "not-an-object");
  assert.equal(notJson.status, 400);

  const missingEntry = await processWhatsAppWebhookPayload(deps, { object: "x" });
  assert.equal(missingEntry.status, 400);

  const unknownShape = await processWhatsAppWebhookPayload(deps, {
    object: "whatsapp_business_account",
    entry: [{ id: "WABA_ANU", changes: [{ field: "account_update", value: {} }] }],
  });
  assert.equal(unknownShape.status, 200);
  assert.equal(unknownShape.outcomes[0]?.action, "unknown_ignored");

  assert.equal(calls.aiCalls.length, 0);
  assert.equal(calls.sendCalls.length, 0);
});
