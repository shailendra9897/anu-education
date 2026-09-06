// FILE: tests/ownership.gate.test.ts
//
// Web-chat ownership gate (WP-B2). The gate must mirror the WhatsApp
// ownership rule: only UNASSIGNED conversations reach the AI;
// ASSIGNED / HANDED_OFF conversations are held with the fixed
// counsellor reply. The decision core is dependency-injected and
// DB-free; the real prisma binding is exercised only via tsc.
//
// Run: npx tsx tests/ownership.gate.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  evaluateOwnershipGate,
  COUNSELLOR_HOLD_REPLY,
  type OwnershipGatePorts,
} from "../lib/chat/ownership.gate";

function portsFor(ownership: "UNASSIGNED" | "ASSIGNED" | "HANDED_OFF"): OwnershipGatePorts {
  return {
    getOwnership: async () => ownership,
  };
}

test("UNASSIGNED → AI is allowed (allow_ai)", async () => {
  const decision = await evaluateOwnershipGate("conv-1", portsFor("UNASSIGNED"));
  assert.equal(decision.outcome, "allow_ai");
});

test("ASSIGNED → AI is not allowed; held with fixed reply", async () => {
  const decision = await evaluateOwnershipGate("conv-1", portsFor("ASSIGNED"));
  assert.equal(decision.outcome, "counsellor_hold");
  if (decision.outcome === "counsellor_hold") {
    assert.equal(decision.reason, "ASSIGNED");
    assert.equal(decision.reply, COUNSELLOR_HOLD_REPLY);
  }
});

test("HANDED_OFF → AI is not allowed; held with fixed reply", async () => {
  const decision = await evaluateOwnershipGate("conv-1", portsFor("HANDED_OFF"));
  assert.equal(decision.outcome, "counsellor_hold");
  if (decision.outcome === "counsellor_hold") {
    assert.equal(decision.reason, "HANDED_OFF");
    assert.equal(decision.reply, COUNSELLOR_HOLD_REPLY);
  }
});

test("the hold reply is a fixed, non-empty constant", () => {
  assert.equal(typeof COUNSELLOR_HOLD_REPLY, "string");
  assert.ok(COUNSELLOR_HOLD_REPLY.trim().length > 0, "reply must not be empty");
  assert.ok(
    COUNSELLOR_HOLD_REPLY.includes("counsellor"),
    "reply must mention the counsellor",
  );
});

test("ASSIGNED and HANDED_OFF return the identical fixed reply", async () => {
  const assigned = await evaluateOwnershipGate("c1", portsFor("ASSIGNED"));
  const handedOff = await evaluateOwnershipGate("c1", portsFor("HANDED_OFF"));
  assert.equal(
    assigned.outcome === "counsellor_hold" ? assigned.reply : null,
    handedOff.outcome === "counsellor_hold" ? handedOff.reply : null,
  );
});