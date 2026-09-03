// FILE: tests/chatwoot.phase7.test.ts
//
// Phase 7 — REMOVED first-contact acknowledgement + OWNERSHIP SAFETY
//
// The static "first-contact acknowledgement" (the SYSTEM greeting sent on
// a brand-new WHATSAPP conversation) was REMOVED in Phase S3. A new
// conversation is now answered with the ACTUAL AI reply ONLY:
//   new → webhook → conversation → ownership UNASSIGNED → AI → ONE reply.
//
// This suite pins the post-removal contract:
//   • a new UNASSIGNED WhatsApp conversation → exactly ONE outbound
//     Evolution send, and it is the AI reply (never the static greeting)
//   • no SYSTEM message is ever produced (the dep no longer exists)
//   • ASSIGNED / HANDED_OFF → no AI, no Evolution, inbound saved once
//   • AI failure → claim released, HTTP 500 (unchanged)
//   • Evolution AI-reply failure → claim kept, reply_failed (unchanged)
//   • duplicate webhook delivery → idempotent, no repeat send
// ─────────────────────────────────────────────────────────────────

process.env.CHATWOOT_WEBHOOK_SECRET = "test-chatwoot-webhook-secret";
process.env.CHATWOOT_INBOX_ID = "1";
process.env.DATABASE_URL = "postgresql://unused:unused@127.0.0.1/unused";

import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  handleChatwootWebhookPost,
  type ChatwootBridgeDeps,
} from "../lib/chatwoot/handler";
import { resetInMemoryClaimsForTests } from "../lib/chatwoot/idempotency";

const SECRET = "test-chatwoot-webhook-secret";

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

type CallCounts = {
  claim: number;
  getOwnership: number;
  saveUserMessage: number;
  runAi: number;
  sent: number;
  release: number;
};

function countCalls(f: Fake): CallCounts {
  return {
    claim: f.calls.claim,
    getOwnership: f.calls.getOwnership,
    saveUserMessage: f.calls.saveUserMessage,
    runAi: f.calls.runAi,
    sent: f.calls.sent,
    release: f.calls.release,
  };
}

type Fake = {
  calls: CallCounts;
  sendCalls: { phone: string; reply: string }[];
  ownership: "UNASSIGNED" | "ASSIGNED" | "HANDED_OFF";
  created: boolean;
  failAi: boolean;
  failSend: boolean;
  release: boolean;
};

function makeFake(overrides: Partial<{
  ownership: "UNASSIGNED" | "ASSIGNED" | "HANDED_OFF";
  created: boolean;
  failAi: boolean;
  failSend: boolean;
}> = {}): { fake: Fake; deps: ChatwootBridgeDeps } {
  const calls: CallCounts = {
    claim: 0,
    getOwnership: 0,
    saveUserMessage: 0,
    runAi: 0,
    sent: 0,
    release: 0,
  };
  const sendCalls: { phone: string; reply: string }[] = [];
  const fake: Fake = {
    calls,
    sendCalls,
    ownership: overrides.ownership ?? "UNASSIGNED",
    created: overrides.created ?? false,
    failAi: overrides.failAi ?? false,
    failSend: overrides.failSend ?? false,
    release: false,
  };

  const deps: ChatwootBridgeDeps = {
    findOrCreateConversation: async ({ phone }) => ({
      conversation: { id: "conv-ph7", phone: phone ?? null, name: null },
      created: fake.created,
    }),
    getOwnership: async () => {
      calls.getOwnership += 1;
      return fake.ownership;
    },
    saveUserMessage: async () => {
      calls.saveUserMessage += 1;
      return {};
    },
    updateProfileNameIfMissing: async () => ({}),
    runAiPipeline: async () => {
      calls.runAi += 1;
      if (fake.failAi) throw new Error("simulated AI failure");
      return "AI reply";
    },
    sendEvolutionWhatsAppText: async (phone, reply) => {
      calls.sent += 1;
      sendCalls.push({ phone, reply });
      if (fake.failSend) return { ok: false, error: "simulated send failure" };
      return { ok: true, messageId: Date.now().toString() };
    },
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

  return { fake, deps };
}

function postJson(body: string, deps: ChatwootBridgeDeps): Promise<Response> {
  return handleChatwootWebhookPost(
    new Request("http://localhost/api/webhook/chatwoot/x", {
      method: "POST",
      body,
    }),
    SECRET,
    deps
  );
}

const BASE = {
  event: "message_created",
  id: 701,
  content: "Hi ANU, I want information about IELTS.",
  message_type: "incoming",
  private: false,
  created_at: 1755936000,
  sender: { id: 42, name: "New Student", phone_number: "+917016497087" },
  contact: { id: 42, name: "New Student", phone_number: "+917016497087" },
  conversation: {
    id: 60,
    inbox_id: 1,
    status: "open",
    contact: { id: 42, phone_number: "+917016497087" },
  },
};

const GREETING_FRAGMENTS = [
  "Hello 👋",
  "Thank you for contacting",
  "Book FREE demo class",
  "Skill India Certified Career Counsellor",
];

// ── A. new UNASSIGNED conversation → AI reply ONLY ────────────────

test("A — new UNASSIGNED WhatsApp contact → ONLY the AI reply is sent (no greeting, no SYSTEM record)", async () => {
  const { fake, deps } = makeFake({ created: true });
  const res = await postJson(JSON.stringify(BASE), deps);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "replied" });

  // Exactly ONE Evolution send — the actual AI reply, nothing else.
  assert.equal(fake.calls.sent, 1, "exactly one outbound Evolution send");
  assert.equal(fake.sendCalls[0].reply, "AI reply");
  assert.equal(fake.sendCalls[0].phone, "+917016497087");

  // The static greeting must never appear in ANY outbound send.
  for (const fragment of GREETING_FRAGMENTS) {
    assert.ok(
      !fake.sendCalls.some((s) => s.reply.includes(fragment)),
      `outbound send must not contain greeting fragment: ${JSON.stringify(fragment)}`
    );
  }

  // No SYSTEM message: the saveSystemMessage dependency no longer exists,
  // and the handler can never persist role=SYSTEM.
  assert.equal(fake.calls.saveUserMessage, 0, "inbound not saved by handler (adapter saves it)");
  assert.equal(fake.calls.runAi, 1, "AI ran once");
  assert.equal(fake.calls.release, 0, "no claim release on success");
});

// ── B. existing 1:1 conversation → AI reply ONLY ──────────────────

test("B — message on an existing conversation → ONLY the AI reply is sent (no greeting)", async () => {
  const { fake, deps } = makeFake({ created: false });
  const res = await postJson(JSON.stringify(BASE), deps);
  assert.equal(res.status, 200);

  assert.equal(fake.calls.sent, 1, "only the AI reply is sent");
  assert.equal(fake.sendCalls[0].reply, "AI reply");
  for (const fragment of GREETING_FRAGMENTS) {
    assert.ok(
      !fake.sendCalls.some((s) => s.reply.includes(fragment)),
      `outbound send must not contain greeting fragment: ${JSON.stringify(fragment)}`
    );
  }
  assert.equal(fake.calls.runAi, 1);
});

// ── C. ASSIGNED → no AI and no outbound ─────────────────────────

test("C — ASSIGNED → no AI, no Evolution send", async () => {
  const { fake, deps } = makeFake({ created: true, ownership: "ASSIGNED" });
  const res = await postJson(JSON.stringify(BASE), deps);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "ai_skipped_assigned" });

  assert.equal(fake.calls.sent, 0, "no Evolution send");
  assert.equal(fake.calls.runAi, 0, "no AI");
  assert.equal(fake.calls.saveUserMessage, 1, "inbound saved exactly once for counsellor");
});

// ── D. HANDED_OFF → no AI and no outbound ───────────────────────

test("D — HANDED_OFF → no AI, no Evolution send", async () => {
  const { fake, deps } = makeFake({ created: true, ownership: "HANDED_OFF" });
  const res = await postJson(JSON.stringify(BASE), deps);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "ai_skipped_handed_off" });

  assert.equal(fake.calls.sent, 0, "no Evolution send");
  assert.equal(fake.calls.runAi, 0, "no AI");
  assert.equal(fake.calls.saveUserMessage, 1, "inbound saved exactly once for counsellor");
});

// ── E. AI failure → claim-release behaviour unchanged ─────────────

test("E — AI failure → release claim, HTTP 500, no Evolution send", async () => {
  const { fake, deps } = makeFake({ created: true, failAi: true });
  const res = await postJson(JSON.stringify(BASE), deps);
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { ok: false });

  assert.equal(fake.calls.sent, 0, "nothing sent when AI failed");
  assert.equal(fake.calls.release, 1, "claim released for safe retry");
  // On retry the conversation already exists (created=false) so nothing
  // special happens — only the AI reply path is re-attempted.
});

// ── F. Evolution AI-reply send fails → claim kept, reply_failed ───

test("F — Evolution AI-reply send fails → claim kept, reply_failed", async () => {
  const { fake, deps } = makeFake({ created: true, failSend: true });
  const res = await postJson(JSON.stringify(BASE), deps);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, outcome: "reply_failed" });

  assert.equal(fake.calls.sent, 1, "the AI reply send was attempted");
  assert.equal(fake.sendCalls[0].reply, "AI reply");
  assert.equal(fake.calls.runAi, 1);
  assert.equal(fake.calls.release, 0, "claim kept on send failure (no double-send risk)");
});

// ── G. duplicate webhook delivery → idempotent, no repeat send ────

test("G — duplicate webhook delivery → no repeat send, no side effects", async () => {
  const { fake, deps } = makeFake({ created: true });
  const first = await postJson(JSON.stringify(BASE), deps);
  assert.equal(first.status, 200);

  const second = await postJson(JSON.stringify(BASE), deps);
  assert.equal(second.status, 200);
  assert.deepEqual(await second.json(), { ok: true, outcome: "duplicate" });

  // Only the first delivery produced the (single) AI reply.
  assert.equal(fake.calls.sent, 1, "exactly one outbound send total");
  assert.equal(fake.sendCalls[0].reply, "AI reply");
  assert.equal(fake.calls.runAi, 1, "AI ran once only");
});