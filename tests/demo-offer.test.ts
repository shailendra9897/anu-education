// FILE: tests/demo-offer.test.ts
//
// PHASE S5-A — FREE DEMO CONVERSION FOUNDATION: PURE GATE TESTS
//
// lib/demo/demo.offer.ts is the deterministic, DB-free, AI-free gate
// that decides when a WhatsApp/website enquiry should be nudged toward
// a FREE coaching demo class, plus the demo-funnel observability. All
// predicates are pure, so these tests exercise the REAL code end-to-end
// with no live DB, no AI, no network.
//
// Also verifies the Phase S5-A widening of demo-booking confirmation:
// short natural assents ("sure", "okay", "ok", "go ahead",
// "definitely") now resolve into the existing demo flow via routeIntent,
// while negations ("not sure", "unsure") never do.
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";

// Must run FIRST — dry Prisma client + GROQ_API_KEY prerequisites for
// modules that import prisma / ai-client at load time.
import "./env.setup";

import {
  evaluateDemoOpportunity,
  detectPendingDemoOffer,
  buildDemoOfferContextString,
  shouldOfferFreeDemoNow,
  getDemoFunnelStage,
} from "../lib/demo/demo.offer";
import { routeIntent } from "../lib/chat/intent-router";

// ═════════════════════════════════════════════════════════════════
// evaluateDemoOpportunity — when is an enquiry worth a demo nudge?
// ═════════════════════════════════════════════════════════════════

test("offer: pure informational question is never a demo opportunity", () => {
  const result = evaluateDemoOpportunity("What is IELTS?");
  assert.equal(result.eligible, false);
  assert.match(result.reason, /informational/i);
});

test("offer: 'tell me about PTE' is pure info, not a demo opportunity", () => {
  const result = evaluateDemoOpportunity("Tell me about PTE please");
  assert.equal(result.eligible, false);
});

test("offer: batch-timing enquiry for a course IS an opportunity", () => {
  const result = evaluateDemoOpportunity("What is the batch timing for PTE?");
  assert.equal(result.eligible, true);
  assert.equal(result.course, "PTE");
});

test("offer: fee enquiry for a course IS an opportunity", () => {
  const result = evaluateDemoOpportunity(
    "How much are the fees for German coaching in Vijayawada?"
  );
  assert.equal(result.eligible, true);
  assert.equal(result.course, "German");
});

test("offer: 'want to join the IELTS morning batch' IS an opportunity", () => {
  const result = evaluateDemoOpportunity("I want to join the IELTS morning batch");
  assert.equal(result.eligible, true);
  assert.equal(result.course, "IELTS");
});

test("offer: spoken english classes detected with canonical course", () => {
  const result = evaluateDemoOpportunity("I need spoken english classes");
  assert.equal(result.eligible, true);
  assert.equal(result.course, "Spoken English");
});

test("offer: greeting with no course is not eligible", () => {
  const result = evaluateDemoOpportunity("Hello, good morning!");
  assert.equal(result.eligible, false);
  assert.equal(result.course, null);
});

test("offer: curiosity with no demand signal is not eligible", () => {
  const result = evaluateDemoOpportunity("just curious about PTE");
  assert.equal(result.eligible, false);
  assert.match(result.reason, /demand signal/i);
});

test("offer: 'book a German class' (no demo word) still triggers a demo nudge", () => {
  // extractDemoIntent doesn't see a wish for a DEMO here, yet the message
  // is exactly the enrollment-adjacent case this phase wants to convert.
  const result = evaluateDemoOpportunity("I want to book a German class");
  assert.equal(result.eligible, true);
  assert.equal(result.course, "German");
});

// ═════════════════════════════════════════════════════════════════
// detectPendingDemoOffer — did the last assistant turn offer a demo?
// ═════════════════════════════════════════════════════════════════

test("pending-offer: natural AI offer with question mark is pending", () => {
  assert.deepEqual(
    detectPendingDemoOffer("Want me to book your free German demo?"),
    { pending: true, course: "German" }
  );
});

test("pending-offer: 'would you like' phrasing carries course → pending", () => {
  assert.deepEqual(
    detectPendingDemoOffer(
      "I've noted your interest. Would you like to book a free PTE demo class this week?"
    ),
    { pending: true, course: "PTE" }
  );
});

test("pending-offer: strict memory.service phrasing is excluded (not double-counted)", () => {
  assert.deepEqual(
    detectPendingDemoOffer("Shall I book your German demo?"),
    { pending: false, course: null }
  );
});

test("pending-offer: informative-but-no-offer text is not pending", () => {
  assert.deepEqual(
    detectPendingDemoOffer("Here is the IELTS course outline and fee schedule."),
    { pending: false, course: null }
  );
});

test("pending-offer: assistant text without a course is not pending", () => {
  assert.deepEqual(
    detectPendingDemoOffer("Would you like to book a demo? We have slots open."),
    { pending: false, course: null }
  );
});

test("pending-offer: null / empty input is not pending", () => {
  assert.deepEqual(detectPendingDemoOffer(null), { pending: false, course: null });
  assert.deepEqual(detectPendingDemoOffer(undefined), { pending: false, course: null });
  assert.deepEqual(detectPendingDemoOffer("   "), { pending: false, course: null });
});

// ═════════════════════════════════════════════════════════════════
// buildDemoOfferContextString — natural AI wording, never hardcoded
// ═════════════════════════════════════════════════════════════════

test("offer-hint: mentions the course, 'free', and a one-time policy", () => {
  const hint = buildDemoOfferContextString("German");
  assert.match(hint, /German/);
  assert.match(hint, /free/i);
  assert.match(hint, /offer/i);
  assert.match(hint, /only once/i);
});

test("offer-hint: course value flows through verbatim", () => {
  const hint = buildDemoOfferContextString("PTE Academic");
  assert.match(hint, /PTE Academic/);
  assert.doesNotMatch(hint, /demo booking has been created/); // no canned line
});

// ═════════════════════════════════════════════════════════════════
// shouldOfferFreeDemoNow — the moment gate
// ═════════════════════════════════════════════════════════════════

const baseOfferInput = {
  intent: "COACHING_LEAD",
  course: "IELTS",
  existingBooking: null,
  awaitingDemoConfirmation: false,
  offerPending: false,
};

test("nudge: enrollment-adjacent coaching lead fires", () => {
  assert.equal(shouldOfferFreeDemoNow(baseOfferInput), true);
});

test("nudge: GENERAL intent fires too", () => {
  assert.equal(
    shouldOfferFreeDemoNow({ ...baseOfferInput, intent: "GENERAL" }),
    true
  );
});

test("nudge: DEMO / HUMAN_HANDOFF / LEAD_QUALIFICATION never fire", () => {
  assert.equal(
    shouldOfferFreeDemoNow({ ...baseOfferInput, intent: "DEMO" }),
    false
  );
  assert.equal(
    shouldOfferFreeDemoNow({ ...baseOfferInput, intent: "HUMAN_HANDOFF" }),
    false
  );
  assert.equal(
    shouldOfferFreeDemoNow({ ...baseOfferInput, intent: "LEAD_QUALIFICATION" }),
    false
  );
});

test("nudge: no course → never fires", () => {
  assert.equal(
    shouldOfferFreeDemoNow({ ...baseOfferInput, course: null }),
    false
  );
});

test("nudge: never stacked on an existing/awaiting state", () => {
  assert.equal(
    shouldOfferFreeDemoNow({ ...baseOfferInput, awaitingDemoConfirmation: true }),
    false
  );
  assert.equal(
    shouldOfferFreeDemoNow({ ...baseOfferInput, offerPending: true }),
    false
  );
});

test("nudge: existing non-cancelled booking blocks; CANCELLED does not", () => {
  assert.equal(
    shouldOfferFreeDemoNow({
      ...baseOfferInput,
      existingBooking: { status: "PENDING" },
    }),
    false
  );
  assert.equal(
    shouldOfferFreeDemoNow({
      ...baseOfferInput,
      existingBooking: { status: "CONFIRMED" },
    }),
    false
  );
  assert.equal(
    shouldOfferFreeDemoNow({
      ...baseOfferInput,
      existingBooking: { status: "CANCELLED" },
    }),
    true
  );
});

test("nudge: stale-demo regression — booked German student asking about IELTS is NOT re-sold", () => {
  const intent = routeIntent({
    message: "Hi ANU, I want information about IELTS.",
    awaitingDemoConfirmation: false,
  });
  assert.equal(intent.intent, "COACHING_LEAD");
  assert.equal(
    shouldOfferFreeDemoNow({
      intent: intent.intent,
      course: evaluateDemoOpportunity("Hi ANU, I want information about IELTS.").course,
      existingBooking: { status: "PENDING" },
      awaitingDemoConfirmation: false,
      offerPending: false,
    }),
    false
  );
});

// ═════════════════════════════════════════════════════════════════
// getDemoFunnelStage — demo lifecycle observability
// ═════════════════════════════════════════════════════════════════

test("funnel: booked wins over offer signals", () => {
  assert.equal(
    getDemoFunnelStage({
      existingBooking: { status: "PENDING" },
      awaitingDemoConfirmation: true,
      offerPending: true,
    }),
    "DEMO_BOOKED"
  );
});

test("funnel: CANCELLED booking does not count and offer still registers", () => {
  assert.equal(
    getDemoFunnelStage({
      existingBooking: { status: "CANCELLED" },
      awaitingDemoConfirmation: false,
      offerPending: true,
    }),
    "DEMO_OFFERED"
  );
});

test("funnel: awaiting confirmation or pending offer → OFFERED", () => {
  assert.equal(
    getDemoFunnelStage({
      existingBooking: null,
      awaitingDemoConfirmation: true,
      offerPending: false,
    }),
    "DEMO_OFFERED"
  );
  assert.equal(
    getDemoFunnelStage({
      existingBooking: null,
      awaitingDemoConfirmation: false,
      offerPending: true,
    }),
    "DEMO_OFFERED"
  );
});

test("funnel: no activity → NONE", () => {
  assert.equal(
    getDemoFunnelStage({
      existingBooking: null,
      awaitingDemoConfirmation: false,
      offerPending: false,
    }),
    "NONE"
  );
});

// ═════════════════════════════════════════════════════════════════
// Phase S5-A confirmation widening — natural acceptances in routeIntent
// ═════════════════════════════════════════════════════════════════

test("confirmation: natural assents ('sure') while awaiting → immediate booking route", () => {
  const result = routeIntent({
    message: "sure",
    awaitingDemoConfirmation: true,
  });
  assert.equal(result.intent, "DEMO");
  assert.equal(result.confidence, 0.99);
});

test("confirmation: 'okay' / 'ok' / 'go ahead' / 'definitely' all confirm", () => {
  for (const answer of ["okay", "ok", "go ahead", "definitely", "yes sure"]) {
    const result = routeIntent({ message: answer, awaitingDemoConfirmation: true });
    assert.equal(
      result.confidence,
      0.99,
      `'${answer}' should confirm the booking at 0.99, got ${result.confidence}`
    );
  }
});

test("confirmation: 'attend' confirms when the student will attend", () => {
  const result = routeIntent({
    message: "I will attend",
    awaitingDemoConfirmation: true,
  });
  assert.equal(result.confidence, 0.99);
});

test("confirmation: negations NEVER confirm (not 0.99)", () => {
  for (const answer of ["not sure", "I am not sure", "unsure", "okay no"]) {
    const result = routeIntent({ message: answer, awaitingDemoConfirmation: true });
    assert.notEqual(
      result.confidence,
      0.99,
      `'${answer}' must NOT be treated as a positive booking confirmation`
    );
  }
});

test("confirmation: word-boundary keeps 'ok' out of 'book'/'look'", () => {
  // "looked" contains the substring "ok" but NOT the word boundary.
  const result = routeIntent({
    message: "I looked at the schedule",
    awaitingDemoConfirmation: true,
  });
  assert.equal(result.confidence, 0.9, "should stay on the plain awaiting path");
});