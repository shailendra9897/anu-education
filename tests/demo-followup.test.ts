// FILE: tests/demo-followup.test.ts
//
// PHASE S5-B — FREE DEMO ATTENDANCE + CONVERSION FOLLOW-UP FOUNDATION
//
// lib/demo/demo.followup.ts is the deterministic, DB-free, AI-free layer
// that derives the demo attendance outcome + post-demo conversion signal
// from the CURRENT student message and the EXISTING DemoBooking row.
// All predicates are pure — no live DB, no AI, no network.
//
// Core guarantees exercised here:
//   • DEMO_BOOKED ≠ DEMO_ATTENDED — a booking row never implies the
//     student attended; attendance comes only from the student's words.
//   • stale-demo protection — a follow-up context is eligible only for a
//     non-cancelled booking on the SAME course still being discussed.
//   • intent priority DECLINED > HIGH > MEDIUM > LOW (> NONE), so
//     "not interested" can never escalate into a counsellor signal.
//   • LOW / DECLINED never produce a sales-level counsellor action.
//   • reminder readiness is a pure audit predicate — nothing is sent.
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";

// Must run FIRST — dry Prisma client + GROQ_API_KEY prerequisites for
// modules that import prisma / ai-client at load time.
import "./env.setup";

import {
  evaluateDemoFollowUp,
  hasEligibleDemoContext,
  classifyPostDemoResponse,
  describeCounsellorAction,
  buildPostDemoContextString,
  getDemoReminderReadiness,
  type DemoFollowUpBookingLike,
} from "../lib/demo/demo.followup";

// ── test fixture helper ───────────────────────────────────────────
function makeBooking(overrides: Partial<DemoFollowUpBookingLike> = {}): DemoFollowUpBookingLike {
  return {
    id: "bok_test_1",
    conversationId: "conv_1",
    leadId: "lead_1",
    course: "German",
    preferredBatch: "Weekend Morning",
    preferredDate: null,
    reminderSentAt: null,
    status: "CONFIRMED",
    ...overrides,
  };
}

// ═════════════════════════════════════════════════════════════════
// 1. hasEligibleDemoContext — eligibility + stale-demo guard
// ═════════════════════════════════════════════════════════════════

test("followup: no booking on the conversation → not eligible", () => {
  const ctx = hasEligibleDemoContext(null, "German");
  assert.equal(ctx.eligible, false);
  assert.equal(ctx.course, null);
});

test("followup: booking with no course → not eligible", () => {
  const booking = makeBooking({ course: null });
  assert.equal(hasEligibleDemoContext(booking, null).eligible, false);
});

test("followup: cancelled booking → not eligible and no follow-up", () => {
  const booking = makeBooking({ status: "CANCELLED" });
  const ctx = hasEligibleDemoContext(booking, "German");
  assert.equal(ctx.eligible, false);
  assert.match(ctx.reason, /cancelled/i);

  const evaluation = evaluateDemoFollowUp({
    booking,
    currentMessageCourse: "German",
    message: "I want to join the course",
  });
  assert.equal(evaluation.eligible, false);
});

test("followup: CONFIRMED booking → eligible", () => {
  const ctx = hasEligibleDemoContext(makeBooking({ status: "CONFIRMED" }), "German");
  assert.equal(ctx.eligible, true);
  assert.equal(ctx.course, "German");
});

test("followup: PENDING booking → eligible too", () => {
  const ctx = hasEligibleDemoContext(makeBooking({ status: "PENDING" }), "German");
  assert.equal(ctx.eligible, true);
});

test("followup: stale-demo guard — German booking, IELTS message → NOT eligible", () => {
  const booking = makeBooking({ course: "German" });
  const ctx = hasEligibleDemoContext(booking, "IELTS");
  assert.equal(ctx.eligible, false);
  assert.match(ctx.reason, /IELTS/);
  assert.match(ctx.reason, /German/);
});

test("followup: exact same course → eligible (booking course preserved)", () => {
  const ctx = hasEligibleDemoContext(makeBooking(), "German");
  assert.equal(ctx.eligible, true);
  assert.equal(ctx.course, "German");
});

test("followup: tolerant course match — 'PTE' vs 'PTE Academic' is same course", () => {
  const booking = makeBooking({ course: "PTE Academic" });
  assert.equal(hasEligibleDemoContext(booking, "PTE").eligible, true);
  const booking2 = makeBooking({ course: "PTE" });
  assert.equal(hasEligibleDemoContext(booking2, "PTE Academic").eligible, true);
});

test("followup: message with no course named → still eligible within booking course", () => {
  const ctx = hasEligibleDemoContext(makeBooking(), null);
  assert.equal(ctx.eligible, true);
  assert.equal(ctx.course, "German");
});

test("followup: conversation-scoped — context consults exactly the booking instance provided", () => {
  // The module has no global state: changing which booking is passed in
  // changes the outcome, i.e. only THIS conversation's row is consulted.
  const german = hasEligibleDemoContext(makeBooking({ course: "German" }), "German");
  assert.equal(german.eligible, true);
  const english = hasEligibleDemoContext(makeBooking({ course: "Spoken English" }), "German");
  assert.equal(english.eligible, false);
  assert.equal(english.course, "Spoken English");
});

// ═════════════════════════════════════════════════════════════════
// 2. classifyPostDemoResponse — attendance + intent from words only
// ═════════════════════════════════════════════════════════════════

test("followup: booking ≠ attendance — fees question after booking leaves attendance UNKNOWN", () => {
  const r = classifyPostDemoResponse("How much are the fees for German?");
  assert.equal(r.attendance, "UNKNOWN");
});

test("followup: 'the demo was great, I want to join' → ATTENDED + HIGH_INTENT", () => {
  const r = classifyPostDemoResponse("The demo was great, I want to join");
  assert.equal(r.attendance, "ATTENDED");
  assert.equal(r.intent, "HIGH_INTENT");
});

test("followup: 'yes I attended the demo' → ATTENDED", () => {
  assert.equal(classifyPostDemoResponse("Yes I attended the demo").attendance, "ATTENDED");
});

test("followup: 'I went to the demo today' → ATTENDED", () => {
  assert.equal(classifyPostDemoResponse("I went to the demo today").attendance, "ATTENDED");
});

test("followup: 'I could not attend the demo' → NO_SHOW", () => {
  const r = classifyPostDemoResponse("Sorry I could not attend the demo");
  assert.equal(r.attendance, "NO_SHOW");
});

test("followup: 'I missed my demo session' → NO_SHOW", () => {
  assert.equal(classifyPostDemoResponse("I missed my demo session").attendance, "NO_SHOW");
});

test("followup: 'please cancel my demo' → CANCELLED", () => {
  assert.equal(classifyPostDemoResponse("Please cancel my demo").attendance, "CANCELLED");
});

test("followup: priority DECLINED beats MEDIUM — 'not interested' is DECLINED, never escalated", () => {
  const r = classifyPostDemoResponse("Actually I am not interested");
  assert.equal(r.intent, "DECLINED");
});

test("followup: priority HIGH beats MEDIUM — fee ask with 'more' is HIGH_INTENT", () => {
  const r = classifyPostDemoResponse("Tell me more about the fees");
  assert.equal(r.intent, "HIGH_INTENT");
});

test("followup: 'I need some time to decide' → LOW_INTENT, not HIGH", () => {
  const r = classifyPostDemoResponse("I need some time to decide");
  assert.equal(r.intent, "LOW_INTENT");
});

test("followup: post-demo response recognized end-to-end with booking", () => {
  const evaluation = evaluateDemoFollowUp({
    booking: makeBooking({ status: "CONFIRMED" }),
    currentMessageCourse: "German",
    message: "The demo was amazing, I want to join German",
  });
  assert.equal(evaluation.eligible, true);
  assert.equal(evaluation.course, "German");
  assert.equal(evaluation.response.attendance, "ATTENDED");
  assert.equal(evaluation.response.intent, "HIGH_INTENT");
});

// ═════════════════════════════════════════════════════════════════
// 3. describeCounsellorAction — deterministic counsellor signal
// ═════════════════════════════════════════════════════════════════

function action(message: string, course = "German") {
  const response = classifyPostDemoResponse(message);
  return describeCounsellorAction({ message, response, course });
}

test("followup: high intent (join) → 'wants to join' counsellor action", () => {
  const a = action("I want to join the German batch");
  assert.ok(a);
  assert.match(a!, /join/i);
  assert.match(a!, /German/);
});

test("followup: fees after demo → fees counsellor action", () => {
  const a = action("Can you tell me the fees after the demo?");
  assert.ok(a);
  assert.match(a!, /fees/i);
});

test("followup: explicit enrollment ask → enrollment counsellor action", () => {
  const a = action("How do I enrol in PTE?");
  assert.ok(a);
  assert.match(a!, /enrollment/i);
});

test("followup: medium intent → counsellor follow-up recommended", () => {
  const a = action("I liked the demo, tell me more");
  assert.ok(a);
  assert.match(a!, /follow-up recommended/i);
});

test("followup: LOW_INTENT → null action (no sales escalation)", () => {
  assert.equal(action("I need some time to decide"), null);
});

test("followup: DECLINED → null action (never escalated)", () => {
  assert.equal(action("I am not interested, thanks"), null);
});

test("followup: NONE → null action", () => {
  assert.equal(action("Okay thanks"), null);
});

test("followup: declined student is recorded but never escalated (evaluate + action)", () => {
  const evaluation = evaluateDemoFollowUp({
    booking: makeBooking(),
    currentMessageCourse: "German",
    message: "Not interested, please stop",
  });
  assert.equal(evaluation.response.intent, "DECLINED");
  assert.equal(
    describeCounsellorAction({
      message: "Not interested, please stop",
      response: evaluation.response,
      course: evaluation.course ?? "",
    }),
    null
  );
});

// ═════════════════════════════════════════════════════════════════
// 4. buildPostDemoContextString — AI-facing hint, never hardcoded reply
// ═════════════════════════════════════════════════════════════════

test("followup: context block announces POST-DEMO CONTEXT with course+batch", () => {
  const block = buildPostDemoContextString({
    course: "German",
    batch: "Weekend Morning",
    attendance: "ATTENDED",
    intent: "HIGH_INTENT",
  });
  assert.match(block, /POST-DEMO CONTEXT/);
  assert.match(block, /German/);
  assert.match(block, /Weekend Morning/);
});

test("followup: context block never hardcodes a reply or claims counsellor contact", () => {
  const block = buildPostDemoContextString({
    course: "PTE",
    batch: null,
    attendance: "UNKNOWN",
    intent: "NONE",
  });
  assert.doesNotMatch(block, /say "|reply with|tell them:/i);
  assert.doesNotMatch(block, /counsellor (has|has already) contacted/i);
});

// ═════════════════════════════════════════════════════════════════
// 5. getDemoReminderReadiness — pure audit predicate (nothing sent)
// ═════════════════════════════════════════════════════════════════

test("followup: no booking → not schedulable, 'no booking' reason", () => {
  const r = getDemoReminderReadiness(null);
  assert.equal(r.schedulable, false);
  assert.equal(r.hasDate, false);
  assert.equal(r.alreadyReminded, false);
  assert.match(r.reason, /no demo booking/i);
});

test("followup: booking without preferredDate → not schedulable (timed reminder impossible)", () => {
  const r = getDemoReminderReadiness(makeBooking({ preferredDate: null, status: "PENDING" }));
  assert.equal(r.schedulable, false);
  assert.equal(r.hasDate, false);
  assert.match(r.reason, /preferredDate/i);
});

test("followup: cancelled booking → not schedulable", () => {
  const r = getDemoReminderReadiness(makeBooking({ status: "CANCELLED" }));
  assert.equal(r.schedulable, false);
  assert.match(r.reason, /cancelled/i);
});

test("followup: already reminded → not schedulable despite date", () => {
  const r = getDemoReminderReadiness(
    makeBooking({ preferredDate: new Date(), reminderSentAt: new Date() })
  );
  assert.equal(r.schedulable, false);
  assert.equal(r.alreadyReminded, true);
});

test("followup: date + active + not reminded → schedulable predicate true (foundation only)", () => {
  const r = getDemoReminderReadiness(makeBooking({ preferredDate: new Date() }));
  assert.equal(r.hasDate, true);
  assert.equal(r.alreadyReminded, false);
  assert.equal(r.schedulable, true);
});

test("followup: scheduler infrastructure NOT present — reason surfaces the audit finding", () => {
  const r = getDemoReminderReadiness(makeBooking({ preferredDate: new Date() }));
  assert.match(r.reason, /no scheduler infrastructure/i);
});

// ═════════════════════════════════════════════════════════════════
// 6. Regression — shared router behaviors stay intact
//    (HUMAN_HANDOFF / group ordering live in the adapter + webhook;
//    those suites — webhook.integration, whatsapp-group-guard,
//    phase1-whatsapp-safety — are re-run wholesale in validation.)
// ═════════════════════════════════════════════════════════════════

test("followup: normalizeMessage interoperability does not disturb router intents", async () => {
  const { routeIntent } = await import("../lib/chat/intent-router");
  assert.equal(routeIntent({ message: "I need to talk to a human", awaitingDemoConfirmation: false }).intent, "HUMAN_HANDOFF");
});

test("followup: no booking + no signal → eligible=false, intent NONE, no action", () => {
  const evaluation = evaluateDemoFollowUp({
    booking: null,
    currentMessageCourse: null,
    message: "Thanks, bye!",
  });
  assert.equal(evaluation.eligible, false);
  assert.equal(evaluation.response.intent, "NONE");
});