// FILE: tests/ai-adapter.demo-guard.test.ts
//
// Phase 7 — STALE DEMO-STATE REGRESSION TESTS
//
// Verifies the deterministic gating used by
// lib/whatsapp/ai-adapter.service.ts (shouldContinueExistingDemoFlow):
// an old PENDING/CONFIRMED demo booking must never hijack an unrelated
// new message, while a genuinely continuing demo flow is preserved.
//
// The predicate is pure and DB-free, so these tests combine it with the
// REAL routeIntent() and extractStudentDetails() used in production to
// prove each end-to-end scenario deterministically (no live DB, no AI,
// no Evolution, no network).
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";

// Must run FIRST — lib/ai/client.ts throws at module load unless
// GROQ_API_KEY is present. Other prisma-importing test files set the
// dummy env via this shared setup module.
import "./env.setup";

import { shouldContinueExistingDemoFlow } from "../lib/whatsapp/ai-adapter.service";
import { routeIntent } from "../lib/chat/intent-router";
import { extractStudentDetails } from "../lib/demo/student-details.extractor";

// ── scenario helpers ──────────────────────────────────────────────

const COMPLETE_GERMAN_BOOKING = {
  name: "lakhan rathod",
  phone: "+917016497087",
  email: "lakhan@xyz.com",
  status: "PENDING",
};

function gateFor({
  message,
  booking,
  awaitingDemoConfirmation,
}: {
  message: string;
  booking: Parameters<typeof shouldContinueExistingDemoFlow>[0]["existingBooking"];
  awaitingDemoConfirmation: boolean;
}): boolean {
  const intentRoute = routeIntent({ message, awaitingDemoConfirmation });
  const extracted = extractStudentDetails(message);
  return shouldContinueExistingDemoFlow({
    intentRoute,
    existingBooking: booking,
    extractedStudentDetails: extracted,
  });
}

// ── 1. old German booking + NEW IELTS enquiry → NO hijack ─────────

test("stale-demo: old German booking + new IELTS enquiry → demo flow NOT continued", () => {
  const continueFlow = gateFor({
    message: "Hi ANU, I want information about IELTS.",
    booking: COMPLETE_GERMAN_BOOKING,
    awaitingDemoConfirmation: false,
  });
  assert.equal(continueFlow, false, "must NOT drive the old German demo flow");

  // Prove the routing classification too: IELTS enquiry is a coaching lead.
  const intent = routeIntent({
    message: "Hi ANU, I want information about IELTS.",
    awaitingDemoConfirmation: false,
  });
  assert.equal(intent.intent, "COACHING_LEAD");
});

// ── 2. old German booking + NEW PTE enquiry → NO hijack ───────────

test("stale-demo: old German booking + new PTE enquiry → demo flow NOT continued", () => {
  const continueFlow = gateFor({
    message: "I want information about PTE.",
    booking: COMPLETE_GERMAN_BOOKING,
    awaitingDemoConfirmation: false,
  });
  assert.equal(continueFlow, false, "must NOT drive the old German demo flow");

  const intent = routeIntent({
    message: "I want information about PTE.",
    awaitingDemoConfirmation: false,
  });
  assert.equal(intent.intent, "COACHING_LEAD");
});

// ── 3. active demo confirmation → existing demo flow preserved ───

test("stale-demo: active demo confirmation ('yes' while awaiting) → demo flow preserved", () => {
  const continueFlow = gateFor({
    message: "yes",
    booking: COMPLETE_GERMAN_BOOKING,
    awaitingDemoConfirmation: true,
  });
  assert.equal(continueFlow, true, "confirmation must continue the demo flow");

  const intent = routeIntent({
    message: "yes",
    awaitingDemoConfirmation: true,
  });
  assert.equal(intent.intent, "DEMO");
});

test("stale-demo: 'book it' while awaiting → demo flow preserved", () => {
  assert.equal(
    gateFor({
      message: "book it",
      booking: COMPLETE_GERMAN_BOOKING,
      awaitingDemoConfirmation: true,
    }),
    true,
    "'book it' must continue the demo flow"
  );
});

// ── 4. detail-collection continuation is preserved ────────────────

test("stale-demo: supplying a missing contact detail continues the demo flow", () => {
  const incompleteBooking = {
    name: null,
    phone: null,
    email: null,
    status: "PENDING",
  };
  assert.equal(
    gateFor({
      message: "lakhan rathod 7016497087 lakhan@xyz.com",
      booking: incompleteBooking,
      awaitingDemoConfirmation: false,
    }),
    true,
    "supplying the missing name/phone/email continues detail collection"
  );
});

test("stale-demo: a complete booking + plain name message does NOT hijack", () => {
  // A complete booking (nothing missing) + a message that only mentions a
  // name but is NOT a demo intent → must NOT be treated as detail-supply
  // (nothing is missing) and NOT as demo intent → demo flow NOT continued.
  const continueFlow = gateFor({
    message: "I am lakhan rathod",
    booking: COMPLETE_GERMAN_BOOKING,
    awaitingDemoConfirmation: false,
  });
  assert.equal(continueFlow, false, "complete booking must not hijack");
});

// ── 5. no demo booking → unchanged ────────────────────────────────

test("stale-demo: no demo booking → existing behavior unchanged (false)", () => {
  assert.equal(
    gateFor({
      message: "Hi ANU, I want information about IELTS.",
      booking: null,
      awaitingDemoConfirmation: false,
    }),
    false,
    "no booking → nothing to continue"
  );
});

test("stale-demo: no booking + explicit demo request still routes DEMO", () => {
  const intent = routeIntent({
    message: "I want a German demo class",
    awaitingDemoConfirmation: false,
  });
  assert.equal(intent.intent, "DEMO", "explicit demo request still DEMO intent");
});
