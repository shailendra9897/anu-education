// FILE: lib/demo/demo.offer.ts
//
// ─────────────────────────────────────────────────────────────────
// PHASE S5-A — FREE DEMO CONVERSION FOUNDATION
//
// Deterministic, DB-free, AI-free gate that decides whether an
// inbound student message should be nudged toward a FREE coaching
// demo class, plus the funnel-stage observability for the whole
// demo lifecycle.
//
//   None → Free demo offered → Student accepted → Booked
//
// All five functions are PURE (string/state in, primitive out) so
// they are exhaustively testable without a database, and they reuse
// the exact vocabulary the rest of ANU already uses:
//   • normalizeMessage + isPureInformationalCourseQuestion from
//     lib/chat/intent-router.ts
//   • COACHING_COURSES from lib/lead/leadExtractor.ts
//
// Nothing here books a demo, writes a row, or talks to the AI. The
// adapter (lib/whatsapp/ai-adapter.service.ts) ORs this gate with the
// existing memory.service demo state and feeds the EXISTING
// demo.booking flow unchanged.
// ─────────────────────────────────────────────────────────────────

import {
  normalizeMessage,
  isPureInformationalCourseQuestion,
} from "../chat/intent-router";
import { COACHING_COURSES } from "../lead/leadExtractor";

// ═════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════

export type DemoOpportunity = {
  eligible: boolean;
  course: string | null;
  reason: string;
};

export type OfferPendingState = {
  pending: boolean;
  course: string | null;
};

export type DemoFunnelStage =
  | "NONE"
  | "DEMO_OFFERED"
  | "DEMO_ACCEPTED"
  | "DEMO_BOOKED";

export type DemoBookingLike = {
  status?: string | null;
};

// ═════════════════════════════════════════════════════════════════
// VOCABULARY — same canonical course values as COACHING_COURSES
// ═════════════════════════════════════════════════════════════════

// Enrollment-demand signals. Deliberately INCLUDES informational
// proximity words ("batch", "timing", "fee", "schedule", "score",
// "cost") so "what is the batch timing for PTE?" reads as an
// enrollment-adjacent enquiry — NOT a pure-info question — and is a
// legitimate FREE-demo candidate per the phase objective. Pure-info
// wording ("what is IELTS?") is blocked separately below.
const COACHING_DEMAND_KEYWORDS = [
  "want",
  "need",
  "looking for",
  "interested in",
  "join",
  "joining",
  "enrol",
  "enroll",
  "admission",
  "register",
  "registration",
  "batch",
  "timing",
  "timings",
  "schedule",
  "fee",
  "fees",
  "price",
  "cost",
  "coaching",
  "classes",
  "class",
  "training",
  "prepare",
  "preparation",
  "prep",
  "score",
  "book",
];

// ═════════════════════════════════════════════════════════════════
// 1. evaluateDemoOpportunity — is THIS message worth a demo nudge?
// ═════════════════════════════════════════════════════════════════

/**
 * evaluateDemoOpportunity
 * ─────────────────────────
 * Decides whether a student message shows enough coaching-enrolment
 * intent to make a FREE demo the natural next step.
 *
 * Eligible = a coaching course is mentioned AND the message carries an
 * enrollment/demand signal, and it is NOT a pure informational course
 * question ("what is IELTS?", "tell me about PTE").
 *
 * The returned canonical course (e.g. "German", "PTE Academic") comes
 * from COACHING_COURSES, so whatever reuses it stays consistent with
 * coaching-lead extraction.
 */
export function evaluateDemoOpportunity(message: string): DemoOpportunity {
  const normalized = normalizeMessage(message);

  if (isPureInformationalCourseQuestion(normalized)) {
    return {
      eligible: false,
      course: null,
      reason: "Pure informational course question — answer it, do not sell",
    };
  }

  const course = detectCoachingCourse(normalized);
  if (!course) {
    return {
      eligible: false,
      course: null,
      reason: "No coaching course mentioned in the message",
    };
  }

  if (!hasDemandSignal(normalized)) {
    return {
      eligible: false,
      course,
      reason: "Course mentioned but no enrollment/demand signal",
    };
  }

  return {
    eligible: true,
    course,
    reason: `Enrollment-adjacent ${course} enquiry — valuable free-demo candidate`,
  };
}

// ═════════════════════════════════════════════════════════════════
// 2. detectPendingDemoOffer — did the last assistant turn offer one?
// ═════════════════════════════════════════════════════════════════

// Phrasing memory.service already owns (its isAwaitingDemoConfirmation
// / getPendingDemoCourse handles these) — this module must NOT
// double-count them; it exists to catch NATURAL AI offers that
// memory.service's strict phrase list misses.
const STRICT_AWAITING_PHRASES = [
  "would you like me to book",
  "shall i book",
];

const OFFER_ASK_SIGNALS = [
  /\?/,
  /\bwould you like\b/,
  /\bshall i\b/,
  /\bwant me to\b/,
  /\bshould i\b/,
  /\bmay i book\b/,
  /\bcould i book\b/,
];

const DEMO_WORD = /\bdemo\b/;

/**
 * detectPendingDemoOffer
 * ────────────────────────
 * Given the last assistant message text, decides whether the AI has
 * just offered the student a demo class and is awaiting an answer.
 *
 * A pending offer requires ALL of: a demo mention, an offer-ask signal
 * (question, "would you like …", "should I …"), and a course present in
 * the text. When it fires, a subsequent bare "yes"/"sure"/"okay" from
 * the student can be routed into the existing demo-booking flow with the
 * right course — even though memory.service wouldn't recognise the
 * natural phrasing as a booking ask.
 */
export function detectPendingDemoOffer(
  lastAssistantText: string | null | undefined,
): OfferPendingState {
  if (!lastAssistantText) return { pending: false, course: null };

  const raw = lastAssistantText.trim();
  if (!raw) return { pending: false, course: null };

  const lower = raw.toLowerCase();

  // memory.service already recognises its strict booking-ask phrasing —
  // leave that to it; this module only catches the natural AI wording.
  if (STRICT_AWAITING_PHRASES.some((phrase) => lower.includes(phrase))) {
    return { pending: false, course: null };
  }

  const mentionsDemo = DEMO_WORD.test(lower);
  const asksOffer = OFFER_ASK_SIGNALS.some((signal) => signal.test(lower));
  const course = detectCoachingCourse(normalizeMessage(raw));

  if (!mentionsDemo || !asksOffer || !course) {
    return { pending: false, course: null };
  }

  return { pending: true, course };
}

// ═════════════════════════════════════════════════════════════════
// 3. buildDemoOfferContextString — the only AI-facing part (natural)
// ═════════════════════════════════════════════════════════════════

/**
 * buildDemoOfferContextString
 * ─────────────────────────────
 * Builds the system-prompt instruction block that lets the AI word the
 * demo offer NATURALLY. The reply text is never hardcoded here — the
 * model decides the sentence. The block scopes the offer to THIS turn
 * only and forbids repeating an offer, so the pipeline stays unconverted
 * and pushy-free.
 */
export function buildDemoOfferContextString(course: string): string {
  return [
    `FREE DEMO OFFER (this reply only):`,
    `The student has shown enrolment intent for ${course}. After answering`,
    `their latest question, naturally offer ONE free ${course} demo class and`,
    `ask whether they would like to book it.`,
    `- Be genuine, not pushy. Emphasise it is completely free and a low-effort`,
    `  way to try the training before deciding.`,
    `- Offer the demo only once; never repeat an offer that has already been made.`,
    `- If the student declines or is not ready, accept it gracefully and keep`,
    `  helping with the original question.`,
    ``,
  ].join("\n");
}

// ═════════════════════════════════════════════════════════════════
// 4. shouldOfferFreeDemoNow — is this the moment to nudge?
// ═════════════════════════════════════════════════════════════════

/**
 * shouldOfferFreeDemoNow
 * ────────────────────────
 * Whether the CURRENT assistant reply should carry a free-demo offer.
 *
 * Fires ONLY when:
 *   • the routed intent is COACHING_LEAD or GENERAL (an explicit DEMO
 *     request already lives in the demo flow; human handoff and
 *     study-abroad qualification are out of scope for a coaching demo)
 *   • a course is known
 *   • the student is NOT already awaiting an answer on a demo offer
 *     (no offers stacked on top of offers)
 *   • there is NO existing (non-cancelled) DemoBooking — an already
 *     booked student is never re-sold a demo.
 */
export function shouldOfferFreeDemoNow(input: {
  intent: string;
  course: string | null;
  existingBooking: DemoBookingLike | null;
  awaitingDemoConfirmation: boolean;
  offerPending: boolean;
}): boolean {
  const {
    intent,
    course,
    existingBooking,
    awaitingDemoConfirmation,
    offerPending,
  } = input;

  if (intent !== "COACHING_LEAD" && intent !== "GENERAL") return false;
  if (!course) return false;
  if (awaitingDemoConfirmation || offerPending) return false;
  if (existingBooking && existingBooking.status !== "CANCELLED") return false;

  return true;
}

// ═════════════════════════════════════════════════════════════════
// 5. getDemoFunnelStage — where is the student in the demo lifecycle?
// ═════════════════════════════════════════════════════════════════

/**
 * getDemoFunnelStage
 * ───────────────────
 * Maps deterministic, already-available state to the demo funnel stage:
 *
 *   NONE          — no demo activity yet
 *   DEMO_OFFERED  — a demo offer is on the table awaiting a reply
 *   DEMO_ACCEPTED — reserved/transient: the student's "yes" and the
 *                   DemoBooking row creation happen in the SAME turn
 *                   (demo.booking.ts createDemoBooking), so one turn
 *                   later this stage resolves to DEMO_BOOKED
 *   DEMO_BOOKED   — a non-cancelled DemoBooking exists for the
 *                   conversation (complete or still collecting details)
 *
 * BOOKED wins over every other signal; a CANCELLED booking does NOT
 * count as booked, so a cancelled student can be re-offered.
 */
export function getDemoFunnelStage(input: {
  existingBooking: DemoBookingLike | null;
  awaitingDemoConfirmation: boolean;
  offerPending: boolean;
}): DemoFunnelStage {
  const { existingBooking, awaitingDemoConfirmation, offerPending } = input;

  if (existingBooking && existingBooking.status !== "CANCELLED") {
    return "DEMO_BOOKED";
  }

  if (awaitingDemoConfirmation || offerPending) {
    return "DEMO_OFFERED";
  }

  return "NONE";
}

// ═════════════════════════════════════════════════════════════════
// INTERNAL HELPERS — pure
// ═════════════════════════════════════════════════════════════════

function detectCoachingCourse(normalized: string): string | null {
  const sorted = Object.keys(COACHING_COURSES).sort(
    (a, b) => b.length - a.length,
  );
  for (const keyword of sorted) {
    if (new RegExp(`\\b${escapeRegex(keyword)}\\b`).test(normalized)) {
      return COACHING_COURSES[keyword];
    }
  }
  return null;
}

function hasDemandSignal(normalized: string): boolean {
  return COACHING_DEMAND_KEYWORDS.some(
    (keyword) =>
      new RegExp(`\\b${escapeRegex(keyword)}\\b`).test(normalized),
  );
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}