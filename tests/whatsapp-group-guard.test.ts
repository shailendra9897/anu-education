// FILE: tests/whatsapp-group-guard.test.ts
//
// ─────────────────────────────────────────────────────────────────
// PHASE S2 — WHATSAPP GROUP-MESSAGE GUARD
//
// Proves the success condition end-to-end (parse → dispatch → ports):
//
//   GROUP WhatsApp message
//     → classify group_message_ignored
//     → claim provider message id
//     → HTTP 200
//     → NO conversation creation / NO Message save / NO AI / NO send
//
//   1:1 WhatsApp message
//     → classify inbound_message
//     → existing pipeline unchanged (conversation → AI → reply)
//
// Group detection is asserted against every production-payload shape
// observed in the audit:
//   · sender identity with …@g.us suffix
//   · digits-only group id + "(GROUP)" contact profile name (the exact
//     shape that stored the "Talod Ward No - 6 (GROUP)" conversation)
//   · reply-context parent sender with a group JID
//   · GROUP media frames (image/audio/…) still dropped as group, never
//     surfaced as an "unsupported student" event
//   · legacy echo / self-number / unsupported / status handling unchanged
//
// No live database, no Groq, no Evolution, no network (ports injected +
// global fetch guard, same convention as webhook.integration.test.ts).
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

// ── NETWORK GUARD — fail loudly if anything attempts outbound I/O ─

const realFetch = globalThis.fetch;
globalThis.fetch = (async () => {
  throw new Error(
    "NETWORK GUARD: outbound fetch attempted during group-guard tests"
  );
}) as typeof fetch;

after(() => {
  globalThis.fetch = realFetch;
});

// ── META PAYLOAD BUILDERS ────────────────────────────────────────

const BUSINESS_DISPLAY_NUMBER = "919428186817";
const STUDENT_PHONE = "919876543210";

type MetaMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  context?: { from: string; id: string };
};

function metaWebhook(messages: MetaMessage[], opts?: {
  contacts?: Array<{ profile?: { name: string }; wa_id: string }>;
  width?: "value.messages";
}): unknown {
  const messageObjects = messages.map((m) => {
    const obj: Record<string, unknown> = {
      from: m.from,
      id: m.id,
      timestamp: m.timestamp,
      type: m.type,
    };
    if (m.text) obj.text = m.text;
    if (m.context) obj.context = m.context;
    return obj;
  });
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
              contacts: opts?.contacts ?? [
                { profile: { name: "Test Student" }, wa_id: STUDENT_PHONE },
              ],
              messages: messageObjects,
            },
          },
        ],
      },
    ],
  };
}

function studentText(body: string, messageId: string): unknown {
  return metaWebhook([
    {
      from: STUDENT_PHONE,
      id: messageId,
      timestamp: "1755000000",
      type: "text",
      text: { body },
    },
  ]);
}

function studentSelfNumber(): unknown {
  return metaWebhook([
    {
      from: BUSINESS_DISPLAY_NUMBER,
      id: "wamid.GUARD_SELF_1",
      timestamp: "1755000200",
      type: "text",
      text: { body: "sent from our own Business App" },
    },
  ], { contacts: [] });
}

function studentMedia(): unknown {
  return metaWebhook([
    {
      from: STUDENT_PHONE,
      id: "wamid.GUARD_MEDIA_1",
      timestamp: "1755000300",
      type: "image",
    },
  ]);
}

/** Shape A — group JID in `from` (…@g.us). */
function groupJidPayload(): unknown {
  return metaWebhook([
    {
      from: "919400000016@g.us",
      id: "wamid.GROUP_JID_1",
      timestamp: "1755000400",
      type: "text",
      text: { body: "**+91 99095 37442 - Kalpeshpanchal:**\n\nHappy Birthday sir" },
    },
  ], { contacts: [{ profile: { name: "Talod Ward No - 6 (GROUP)" }, wa_id: "919400000016@g.us" }] });
}

/** Shape B — the exact production evidence: digits-only group id +
 *  "(GROUP)" contact profile name. */
function groupProfileNamePayload(): unknown {
  return metaWebhook([
    {
      from: "919400000016",
      id: "wamid.GROUP_NAME_1",
      timestamp: "1755000500",
      type: "text",
      text: { body: "**+91 93774 63750 - Vinod Duggad:**\n\n🙏🙏🙏" },
    },
  ], { contacts: [{ profile: { name: "Talod Ward No - 6 (GROUP)" }, wa_id: "919400000016" }] });
}

/** Shape C — reply-context parent sender carries a group JID. */
function groupReplyContextPayload(): unknown {
  return metaWebhook([
    {
      from: "919400000016@g.whatsapp.net",
      id: "wamid.GROUP_CTX_1",
      timestamp: "1755000600",
      type: "text",
      text: { body: "**+91 94281 35830 - K.R.Patel:**\n\n🙏🏿" },
      context: { from: "919400000016@g.whatsapp.net", id: "wamid.PARENT_1" },
    },
  ], { contacts: [{ profile: { name: "Talod Ward No - 6 (GROUP)" }, wa_id: "919400000016@g.whatsapp.net" }] });
}

/** Shape D — media inside a group frame is still a group, not an
 *  "unsupported student message". */
function groupMediaPayload(): unknown {
  return metaWebhook([
    {
      from: "919400000016@g.us",
      id: "wamid.GROUP_MEDIA_1",
      timestamp: "1755000700",
      type: "image",
    },
  ], { contacts: [{ profile: { name: "Talod Ward No - 6 (GROUP)" }, wa_id: "919400000016@g.us" }] });
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
                  id: "wamid.GUARD_ECHO_1",
                  from: BUSINESS_DISPLAY_NUMBER,
                  to: STUDENT_PHONE,
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

// ── SPY DEPENDENCIES (mirror of route.ts real wiring) ────────────

type CallRecorder = {
  conversationsCreated: Array<Record<string, unknown>>;
  savedUserMessages: Array<{ conversationId: string; content: string }>;
  aiCalls: Array<{ conversationId: string; message: string }>;
  sendCalls: Array<{ phone: string; text: string }>;
  ownershipChecks: string[];
};

function makeFakes(): {
  deps: WebhookDeps;
  calls: CallRecorder;
  claimsRows: Map<string, number>;
} {
  const calls: CallRecorder = {
    conversationsCreated: [],
    savedUserMessages: [],
    aiCalls: [],
    sendCalls: [],
    ownershipChecks: [],
  };

  const claimsRows = new Map<string, number>();
  const claims: IdempotencyDeps = {
    findMarkers: async (key) => (claimsRows.has(key) ? [{ id: key }] : []),
    insertMarker: async (key) => {
      claimsRows.set(key, Date.now());
    },
    deleteMarkers: async (key) => {
      claimsRows.delete(key);
    },
  };

  const conversation: OwnedConversation = {
    id: "conv_guard_1",
    phone: STUDENT_PHONE,
    name: null,
  };

  const deps: WebhookDeps = {
    findOrCreateConversation: async (input) => {
      calls.conversationsCreated.push({ ...input });
      return { conversation, created: false };
    },
    getOwnership: async (conversationId) => {
      calls.ownershipChecks.push(conversationId);
      return "UNASSIGNED" as OwnershipState;
    },
    saveUserMessage: async (cid, content) => {
      calls.savedUserMessages.push({ conversationId: cid, content });
    },
    updateProfileNameIfMissing: async () => {},
    runAiPipeline: async (conv, message) => {
      calls.aiCalls.push({ conversationId: conv.id, message });
      return "ANU AI reply";
    },
    sendText: async (phone, text) => {
      calls.sendCalls.push({ phone, text });
      return { ok: true, toDigits: STUDENT_PHONE, messageId: "graph-guard-1" };
    },
    claims,
  };

  return { deps, calls, claimsRows };
}

function expectParsedOk(parsed: ParsePayloadResult) {
  if (!parsed.ok) {
    throw new Error(`payload failed to parse: ${parsed.reason}`);
  }
  return parsed;
}

beforeEach(() => {
  resetInMemoryClaimsForTests();
});

// ── A. NORMAL 1:1 TEXT → inbound_message ─────────────────────────

test("A — 1:1 student text is classified inbound_message (unchanged)", () => {
  const parsed = expectParsedOk(parseWhatsAppWebhookPayload(studentText("Hi ANU", "wamid.G1")));
  assert.equal(parsed.events.length, 1);
  assert.equal(parsed.events[0]?.kind, "inbound_message");
});

// ── B. GROUP TEXT PAYLOAD → group_message_ignored ────────────────

test("B — group JID sender (…@g.us) → group_message_ignored", () => {
  const parsed = expectParsedOk(parseWhatsAppWebhookPayload(groupJidPayload()));
  assert.equal(parsed.events.length, 1);
  assert.equal(parsed.events[0]?.kind, "group_message_ignored");
  if (parsed.events[0]?.kind === "group_message_ignored") {
    assert.equal(parsed.events[0].messageId, "wamid.GROUP_JID_1");
    assert.equal(parsed.events[0].groupName, "Talod Ward No - 6 (GROUP)");
  }
});

test("B — digits-only group id + '(GROUP)' profile name → group_message_ignored", () => {
  // The EXACT production shape that stored the "Talod Ward No - 6 (GROUP)"
  // conversation: `from` was a digits-only id, so a suffix-only check would
  // have missed it — the "(GROUP)" profile-name signal catches it.
  const parsed = expectParsedOk(parseWhatsAppWebhookPayload(groupProfileNamePayload()));
  assert.equal(parsed.events.length, 1);
  assert.equal(parsed.events[0]?.kind, "group_message_ignored");
  if (parsed.events[0]?.kind === "group_message_ignored") {
    assert.equal(parsed.events[0].messageId, "wamid.GROUP_NAME_1");
  }
});

test("B — reply-context group JID → group_message_ignored", () => {
  const parsed = expectParsedOk(parseWhatsAppWebhookPayload(groupReplyContextPayload()));
  assert.equal(parsed.events[0]?.kind, "group_message_ignored");
});

test("B — group detection fires BEFORE type gating (media in group is still a group)", () => {
  const parsed = expectParsedOk(parseWhatsAppWebhookPayload(groupMediaPayload()));
  assert.equal(parsed.events[0]?.kind, "group_message_ignored");
});

// ── C–G. GROUP PAYLOAD → NO writes, NO AI, NO send, HTTP 200 ─────

for (const [label, payload, messageId] of [
  ["group JID", groupJidPayload(), "wamid.GROUP_JID_1"],
  ["group profile name", groupProfileNamePayload(), "wamid.GROUP_NAME_1"],
  ["group reply context", groupReplyContextPayload(), "wamid.GROUP_CTX_1"],
] as const) {
  test(`C–G — ${label} message → ignored with HTTP 200, zero side effects`, async () => {
    const { deps, calls, claimsRows } = makeFakes();

    const result = await processWhatsAppWebhookPayload(deps, payload);

    // G — HTTP 200
    assert.equal(result.status, 200);
    assert.equal(result.genuineFailure, false);
    assert.deepEqual(result.outcomes, [
      { messageId, action: "group_message_ignored" },
    ]);
    // C — no conversation creation
    assert.equal(calls.conversationsCreated.length, 0);
    // D — no message save
    assert.equal(calls.savedUserMessages.length, 0);
    // E — no AI call
    assert.equal(calls.aiCalls.length, 0);
    // F — no outbound Evolution/WhatsApp send
    assert.equal(calls.sendCalls.length, 0);
    // idempotency claim made so Meta does not redeliver forever
    assert.equal(claimsRows.size, 1, "group wamid must be claimed");
    assert.equal(calls.ownershipChecks.length, 0,
      "ownership gate must not even run for a group frame");
  });
}

// ── H. SELF-MESSAGE GUARD STILL WORKS ────────────────────────────

test("H — self-number message → self_message_ignored (unchanged)", async () => {
  const { deps, calls } = makeFakes();

  const parsed = expectParsedOk(parseWhatsAppWebhookPayload(studentSelfNumber()));
  assert.equal(parsed.events[0]?.kind, "self_message_ignored");

  const result = await processWhatsAppWebhookPayload(deps, studentSelfNumber());
  assert.equal(result.status, 200);
  assert.equal(result.outcomes[0]?.action, "self_message_ignored");
  assert.equal(calls.aiCalls.length, 0);
  assert.equal(calls.sendCalls.length, 0);
  assert.equal(calls.conversationsCreated.length, 0);
});

// ── I. ECHO-EVENT HANDLING STILL WORKS ───────────────────────────

test("I — smb_message_echoes → echo_ignored (unchanged)", async () => {
  const { deps, calls } = makeFakes();

  const result = await processWhatsAppWebhookPayload(deps, smbEchoPayload());
  assert.equal(result.status, 200);
  assert.equal(result.outcomes[0]?.action, "echo_ignored");
  assert.equal(calls.conversationsCreated.length, 0);
  assert.equal(calls.aiCalls.length, 0);
  assert.equal(calls.sendCalls.length, 0);
});

// ── J. UNSUPPORTED-MESSAGE HANDLING STILL WORKS ──────────────────

test("J — unsupported media in 1:1 → unsupported (unchanged)", async () => {
  const { deps, calls } = makeFakes();

  const parsed = expectParsedOk(parseWhatsAppWebhookPayload(studentMedia()));
  assert.equal(parsed.events[0]?.kind, "unsupported_message");

  const result = await processWhatsAppWebhookPayload(deps, studentMedia());
  assert.equal(result.status, 200);
  assert.equal(result.outcomes[0]?.action, "unsupported");
  assert.equal(calls.aiCalls.length, 0);
  assert.equal(calls.sendCalls.length, 0);
});

// ── K. REGRESSION — 1:1 STILL REACHES THE EXISTING AI PIPELINE ──

test("K — 1:1 student message still reaches the AI pipeline and replies", async () => {
  const { deps, calls } = makeFakes();

  const parsed = expectParsedOk(parseWhatsAppWebhookPayload(studentText("What are IELTS fees?", "wamid.G2")));
  assert.equal(parsed.events[0]?.kind, "inbound_message");

  const result = await processWhatsAppWebhookPayload(deps, studentText("What are IELTS fees?", "wamid.G2"));

  assert.equal(result.status, 200);
  assert.deepEqual(calls.conversationsCreated, [
    { phone: `+${STUDENT_PHONE}`, source: "WHATSAPP", sourcePage: "/whatsapp" },
  ]);
  assert.equal(calls.aiCalls.length, 1);
  assert.equal(calls.aiCalls[0]?.message, "What are IELTS fees?");
  assert.equal(calls.sendCalls.length, 1);
  assert.equal(calls.sendCalls[0]?.text, "ANU AI reply");
});

// ── CROSS-CONVERSATION REGRESSION ────────────────────────────────

test("L — distinct 1:1 phones resolve to distinct routing identities; group never joins them", async () => {
  const { deps, calls } = makeFakes();

  // Student A
  await processWhatsAppWebhookPayload(
    deps,
    metaWebhook([
      { from: "919111111111", id: "wamid.CROSS_A1", timestamp: "1755001000", type: "text", text: { body: "hi A" } },
    ], { contacts: [{ profile: { name: "Student A" }, wa_id: "919111111111" }] }),
  );
  // Student B
  await processWhatsAppWebhookPayload(
    deps,
    metaWebhook([
      { from: "919222222222", id: "wamid.CROSS_B1", timestamp: "1755001005", type: "text", text: { body: "hi B" } },
    ], { contacts: [{ profile: { name: "Student B" }, wa_id: "919222222222" }] }),
  );
  // Group broadcast between them
  await processWhatsAppWebhookPayload(deps, groupProfileNamePayload());

  // Each phone routes to its OWN conversation identity — the group never
  // created a conversation, so it cannot have merged into either student's.
  assert.deepEqual(calls.conversationsCreated.map((c) => c.phone), [
    "+919111111111",
    "+919222222222",
  ]);
  assert.equal(calls.conversationsCreated.length, 2,
    "only the two 1:1 threads create conversations; the group creates none");
  assert.equal(calls.aiCalls.length, 2, "exactly two AI replies: A and B only");
  assert.equal(calls.sendCalls.length, 2, "exactly two outbound replies: A and B only");
  // No group frame leaked into any conversation history port.
  assert.ok(calls.savedUserMessages.every((m) => !/group/i.test(m.content)),
    "no group transcript stored in any conversation");
});