// FILE: lib/demo/demo.followup.ts
//
// ─────────────────────────────────────────────────────────────────
// PHASE S5-B — FREE DEMO ATTENDANCE + CONVERSION FOLLOW-UP FOUNDATION
//
//   DEMO BOOKED → DEMO REMINDER (readiness only)
//               → DEMO ATTENDANCE OUTCOME
//               → POST-DEMO FEEDBACK
//               → COUNSELLOR FOLLOW-UP SIGNAL
//
// A PURE, deterministic, DB-free, AI-free module — the same pattern as
// S5-A's lib/demo/demo.offer.ts — so it is exhaustively testable with
// no database, no AI and no network.
//
//   • Nothing here writes. It NEVER creates a booking, a Lead, a
//     PortalAccessRequest or a HandoffEvent and never touches a table.
//   • It derives attendance + conversion from the CURRENT student
//     message + the EXISTING DemoBooking row. DEMO_BOOKED ≠ DEMO_ATTENDED:
//     a booking row never implies attendance.
//   • The stale-demo guard is preserved: follow-up context is eligible
//     ONLY when a non-cancelled booking exists for the SAME course the
//     student is still talking about. A new enquiry about a different
//     course never inherits an old demo thread.
//   • The AI-facing block (buildPostDemoContextString) plugs into the
//     EXISTING prompt architecture (the systemContent block that S5-A
//     already appends to) — never a hardcoded sales script.
//
// ADAPTER USAGE (lib/whatsapp/ai-adapter.service.ts): when eligible and
// the message is a real post-demo response, inject the context block and
// record a schema-free audit trail as an existing MessageRole.SYSTEM row
// (SYSTEM rows are audit-only and never shown to the AI or the user).
// ─────────────────────────────────────────────────────────────────

import { normalizeMessage } from "../chat/intent-router";

// ═════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════

/** Attendance is only ever set from the student's own words — never
 *  inferred from the mere existence of a booking. Default: UNKNOWN. */
export type DemoAttendanceOutcome =
  | "ATTENDED"
  | "NO_SHOW"
  | "CANCELLED"
  | "UNKNOWN";

/** A tiny, explicit conversion signal. Deliberately NOT a 0–100 lead
 *  score — that is a separate future system. */
export type PostDemoIntentSignal =
  | "HIGH_INTENT"
  | "MEDIUM_INTENT"
  | "LOW_INTENT"
  | "DECLINED"
  | "NONE";

export type PostDemoResponseClass = {
  attendance: DemoAttendanceOutcome;
  intent: PostDemoIntentSignal;
};

/** What the adapter knows about the booking — a subset of the real
 *  DemoBooking row, structurally compatible with the Prisma type. */
export type DemoFollowUpBookingLike = {
  id: string;
  conversationId?: string;
  leadId?: string | null;
  course?: string | null;
  preferredBatch?: string | null;
  preferredDate?: Date | string | null;
  reminderSentAt?: Date | string | null;
  status?: string | null;
};

export type DemoFollowUpContext = {
  eligible: boolean;
  course: string | null;
  reason: string;
};

// ═════════════════════════════════════════════════════════════════
// 1. hasEligibleDemoContext — course/conversation-correct stale guard
// ═════════════════════════════════════════════════════════════════

/**
 * Whether this conversation has a RELEVANT post-demo context for the
 * current student message:
 *
 *   no booking                        → not eligible
 *   booking without a course          → not eligible
 *   cancelled booking                 → not eligible
 *   message about a DIFFERENT course  → not eligible (an old German demo
 *                                       must never reply to a new IELTS
 *                                       enquiry)
 *   same course / no course named     → eligible
 *
 * The booking is conversation-scoped by construction — only the row
 * already belonging to THIS conversation is ever consulted.
 */
export function hasEligibleDemoContext(
  booking: DemoFollowUpBookingLike | null,
  currentMessageCourse: string | null,
): DemoFollowUpContext {
  if (!booking) {
    return { eligible: false, course: null, reason: "No demo booking on this conversation" };
  }
  if (!booking.course) {
    return { eligible: false, course: null, reason: "Booking has no course recorded" };
  }
  if (booking.status === "CANCELLED") {
    return { eligible: false, course: booking.course, reason: "Booking was cancelled" };
  }
  if (currentMessageCourse && !coursesMatch(booking.course, currentMessageCourse)) {
    return {
      eligible: false,
      course: booking.course,
      reason: `New ${currentMessageCourse} enquiry is unrelated to the ${booking.course} demo`,
    };
  }
  return {
    eligible: true,
    course: booking.course,
    reason: `Eligible post-demo context for ${booking.course}`,
  };
}

/** Tolerant course equality — "German" vs "German (A1–B2, Goethe)".
 *  One normalized value must be contained in the other. */
function coursesMatch(a: string, b: string): boolean {
  const x = a.toLowerCase().trim();
  const y = b.toLowerCase().trim();
  return x === y || x.includes(y) || y.includes(x);
}

// ═════════════════════════════════════════════════════════════════
// 2. classifyPostDemoResponse — what did the student just say?
// ═════════════════════════════════════════════════════════════════

/**
 * Reads the student's CURRENT message and returns:
 *   attendance — ATTENDED / NO_SHOW / CANCELLED / UNKNOWN, only from the
 *                student's own words, never from the booking existing.
 *   intent     — HIGH_INTENT / MEDIUM_INTENT / LOW_INTENT / DECLINED /
 *                NONE in priority order DECLINED > HIGH > MEDIUM > LOW,
 *                so "not interested" can never escalate and genuine
 *                enrollment intent is never downgraded to "needs time".
 *
 * Operates on router-normalized text with word boundaries ("fee" inside
 * "coffee" never fires; "not interested" is caught before MEDIUM
 * "interested").
 */
export function classifyPostDemoResponse(message: string): PostDemoResponseClass {
  const text = normalizeMessage(message);
  return {
    attendance: classifyAttendance(text),
    intent: classifyIntent(text),
  };
}

const ATTENDED_PATTERNS = [
  /\battended\b/,
  /\bwent (?:for|to) (?:the |my )?(?:demo|class|session)\b/,
  /\bjoined (?:the |my )?(?:demo|class|session)\b/,
  /\bwas (?:there|present)\b/,
  /\b(?:it was|was) (?:great|good|nice|awesome|fantastic|excellent|amazing)\b/,
];

const NO_SHOW_PATTERNS = [
  /\b(?:didn t|did not|couldn t|could not)\s*(?:attend|make|come)\b/,
  /\b(?:not able to attend|not able to make|unable to attend)\b/,
  /\b(?:couldn t come|could not come)\b/,
  /\bmissed (?:the |my )?(?:demo|class|session)\b/,
  /\bdidn t show up\b/,
];

const CANCELLED_PATTERN = /\bcancel(?:led|led it|lation)?\b/;

function classifyAttendance(text: string): DemoAttendanceOutcome {
  if (CANCELLED_PATTERN.test(text)) return "CANCELLED";
  if (testAny(text, NO_SHOW_PATTERNS)) return "NO_SHOW";
  if (testAny(text, ATTENDED_PATTERNS)) return "ATTENDED";
  return "UNKNOWN";
}

const DECLINED_PATTERNS = [
  /\bnot interested\b/,
  /\b(?:don t|dont|do not)\s+want\b/,
  /\b(?:won t|wont)\s*(?:join|take|attend|continue|come)\b/,
  /\bstop\b/,
  /\bno thanks\b/,
  /\bnot joining\b/,
  /\bnot going to\b/,
];

const HIGH_INTENT_PATTERNS = [
  /\bwant to (?:join|enrol|enroll|register|take admission)\b/,
  /\b(?:admission|admissions)\b/,
  /\bhow do i (?:enrol|enroll|join|register)\b/,
  /\benr(?:ol|oll)(?:ment|ments)?\b/,
  /\b(?:fee|fees|price|pricing|cost|payment|pay)\b/,
  /\bregistration\b|\bregister me\b|\bsign me up\b/,
  /\bjoin (?:your|the)\b/,
];

const MEDIUM_INTENT_PATTERNS = [
  /\bliked\b/,
  /\binterested\b/,
  /\btell me more\b/,
  /\bwhat are (?:the )?batches\b/,
  /\bbatches\b/,
  /\b(?:good|great|nice|awesome|excellent|amazing) (?:class|demo|session|training|coaching)\b/,
  /\bwas (?:good|great|nice|awesome|excellent)\b/,
  /\bworth (?:it|attending)\b/,
  /\bimpressed\b/,
];

const LOW_INTENT_PATTERNS = [
  /\bneed (?:some |more )?time\b/,
  /\bneed (?:to )?(?:think|decide)\b/,
  /\bdiscuss (?:it )?with (?:my )?(?:parents|family)\b/,
  /\btalk to (?:my )?(?:parents|family)\b/,
  /\bcheck with (?:my )?(?:parents|family)\b/,
  /\blater\b/,
  /\bnot (?:ready|sure|decided)\b/,
  /\bwill let (?:you|u) know\b/,
  /\blet me (?:think|decide)\b/,
  /\bconfused\b/,
  /\bnext (?:week|month)\b/,
  /\bmore time\b/,
];

function classifyIntent(text: string): PostDemoIntentSignal {
  if (testAny(text, DECLINED_PATTERNS)) return "DECLINED";
  if (testAny(text, HIGH_INTENT_PATTERNS)) return "HIGH_INTENT";
  if (testAny(text, MEDIUM_INTENT_PATTERNS)) return "MEDIUM_INTENT";
  if (testAny(text, LOW_INTENT_PATTERNS)) return "LOW_INTENT";
  return "NONE";
}

function testAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

// ═════════════════════════════════════════════════════════════════
// 3. describeCounsellorAction — the deterministic follow-up signal
// ═════════════════════════════════════════════════════════════════

const FEES_MENTION = /\b(?:fee|fees|price|pricing|cost|payment)\b/;
const ENROLLMENT_MENTION = /\b(?:admission|enrol|enroll|how do i|registration)\b/;

/**
 * The one-line counsellor-action signal a strong post-demo response
 * produces. Returns null for LOW / DECLINED / NONE — low and declined
 * students are recorded but never escalated into a sales signal.
 *
 * This is a note for the team's funnel/observability, not a promise that
 * a counsellor contacted the student — the handoff system is the only
 * thing that can promise that.
 */
export function describeCounsellorAction(input: {
  message: string;
  response: PostDemoResponseClass;
  course: string;
}): string | null {
  const { message, response, course } = input;
  if (response.intent === "DECLINED") return null;
  if (response.intent === "LOW_INTENT") return null;

  const normalized = normalizeMessage(message);

  if (response.intent === "HIGH_INTENT") {
    if (FEES_MENTION.test(normalized)) {
      return `Student asked about fees after the ${course} demo.`;
    }
    if (ENROLLMENT_MENTION.test(normalized)) {
      return `Student requested enrollment information after the ${course} demo.`;
    }
    return `Student wants to join after the ${course} demo.`;
  }

  if (response.intent === "MEDIUM_INTENT") {
    return `Student is interested after the ${course} demo — counsellor follow-up recommended.`;
  }

  return null;
}

// ═════════════════════════════════════════════════════════════════
// 4. buildPostDemoContextString — the only AI-facing part
// ═════════════════════════════════════════════════════════════════

/**
 * System-prompt instruction block for a natural post-demo reply. The AI
 * words it — nothing is hardcoded — via the EXISTING prompt architecture
 * (appended to systemContent exactly like S5-A's demoOfferContextStr).
 */
export function buildPostDemoContextString(input: {
  course: string;
  batch?: string | null;
  attendance: DemoAttendanceOutcome;
  intent: PostDemoIntentSignal;
}): string {
  const demoLine = `The student had a free ${input.course} demo booked${
    input.batch ? ` (${input.batch})` : ""
  }.`;
  return [
    "POST-DEMO CONTEXT:",
    demoLine,
    `For this reply, attendance is treated as ${input.attendance} only because the student said so this turn.`,
    "Reply naturally and conversationally:",
    "- Welcome their feedback warmly; never use a scripted sales pitch.",
    "- If they ask about fees, batches or enrollment, answer from the knowledge base",
    "  and briefly outline the natural next steps.",
    "- Only mention a counsellor if the student asks, or the correct handoff flow applies.",
    "- Never claim a counsellor has already reached out to the student.",
    "",
  ].join("\n");
}

// ═════════════════════════════════════════════════════════════════
// 5. getDemoReminderReadiness — reminder foundation audit only
// ═════════════════════════════════════════════════════════════════

/**
 * Does this booking carry ENOUGH date/time + state for a reminder to be
 * scheduled? Pure predicate — it does NOT send anything.
 *
 * Audit finding (see report): the repository has NO scheduler/cron
 * infrastructure, `preferredDate` is never populated by the booking flow
 * (only batch + time text), and `reminderSentAt` exists in the schema but
 * is never written. So a timed reminder cannot currently be computed.
 */
export function getDemoReminderReadiness(
  booking: DemoFollowUpBookingLike | null,
): { schedulable: boolean; hasDate: boolean; alreadyReminded: boolean; reason: string } {
  if (!booking) {
    return { schedulable: false, hasDate: false, alreadyReminded: false, reason: "No demo booking to remind about" };
  }

  const active = booking.status && booking.status !== "CANCELLED";
  const hasDate = Boolean(booking.preferredDate);
  const alreadyReminded = Boolean(booking.reminderSentAt);

  const schedulable = Boolean(active) && hasDate && !alreadyReminded;

  let reason: string;
  if (!active) {
    reason = "Booking is not active (cancelled) — no reminder needed";
  } else if (!hasDate) {
    reason =
      "Booking carries batch/time text only — no preferredDate timestamp, so a timed reminder cannot be computed";
  } else if (alreadyReminded) {
    reason = "Reminder already sent for this booking";
  } else {
    reason =
      "Booking has a preferredDate and no reminder sent — but no scheduler infrastructure exists in this repository";
  }

  return { schedulable, hasDate, alreadyReminded, reason };
}

// ═════════════════════════════════════════════════════════════════
// 6. evaluateDemoFollowUp — one call the adapter needs
// ═════════════════════════════════════════════════════════════════

export function evaluateDemoFollowUp(input: {
  booking: DemoFollowUpBookingLike | null;
  currentMessageCourse: string | null;
  message: string;
}): {
  eligible: boolean;
  course: string | null;
  response: PostDemoResponseClass;
  reason: string;
} {
  const context = hasEligibleDemoContext(input.booking, input.currentMessageCourse);
  const response = classifyPostDemoResponse(input.message);
  return {
    eligible: context.eligible,
    course: context.course,
    response,
    reason: context.reason,
  };
}