// FILE: lib/lead/counsellor.priority.ts
//
// ─────────────────────────────────────────────────────────────────
// PHASE S5-C — ADMISSION INTENT + COUNSELLOR PRIORITY FOUNDATION
//
//   FREE DEMO → BOOKED → POST-DEMO SIGNAL
//             → ADMISSION INTENT → COUNSELLOR PRIORITY
//
// A PURE, deterministic, DB-free, AI-free module (same pattern as
// S5-A's lib/demo/demo.offer.ts and S5-B's lib/demo/demo.followup.ts)
// that tells ANU's CRM which 1:1 conversations need a human counsellor
// FIRST. It is a FOUNDATION — it does NOT build the final admission
// engine, write a score, text a counsellor, or create a handoff.
//
//   • Nothing writes: no Lead, no DemoBooking, no HandoffEvent, no
//     PortalAccessRequest, no new table.
//   • Derived state only. No numeric score, and NO new Prisma fields
//     (Conversation.leadScore already exists from the assessment tool
//     and is intentionally untouched).
//   • Generic educational questions ("What is IELTS?", "Tell me about
//     PTE") are NEVER admission intent.
//   • The S5-A/S5-B stale-demo guard is reused: a demo booking only
//     boosts context when its course matches the course being discussed
//     NOW. An old German demo never colours a new IELTS enquiry.
//   • Human handoff and group messages stay authoritative/excluded —
//     the pure function returns NONE for both, and the adapter returns
//     even earlier for both.
// ─────────────────────────────────────────────────────────────────

import {
  normalizeMessage,
  isPureInformationalCourseQuestion,
} from "../chat/intent-router";
import {
  hasEligibleDemoContext,
  type DemoFollowUpBookingLike,
  type PostDemoResponseClass,
} from "../demo/demo.followup";

// ═════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════

export type AdmissionIntent =
  | "NONE"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type CounselorPriority =
  | "NONE"
  | "NORMAL"
  | "HIGH"
  | "URGENT";

export type AdmissionIntentClass = {
  intent: AdmissionIntent;
  /** The human-readable signal phrase that fired (file/observation aid). */
  signal: string | null;
  reason: string;
};

export type CounsellorPriorityInput = {
  message: string;
  /** Canonical course detected in the CURRENT message (e.g. what
   *  evaluateDemoOpportunity returns). null when the message names no
   *  coaching course. */
  course?: string | null;
  /** Most-recent non-cancelled DemoBooking on this conversation (the
   *  same row S5-A/S5-B already consult). */
  booking?: DemoFollowUpBookingLike | null;
  /** S5-B classification of this same message, if available. */
  postDemo?: PostDemoResponseClass | null;
  humanHandoffRequested?: boolean;
  groupConversation?: boolean;
  /** S6-D3 — the HUMAN-VERIFIED attendance fact on the conversation's
   *  DemoBooking (DemoBooking.status from S6-D2-B). DELIBERATELY distinct
   *  from message-derived postDemo.attendance: this is authoritative and
   *  only ever escalates. It NEVER auto-verifies payment, NEVER confirms
   *  admission, and NEVER marks the student contacted — it is a pure,
   *  deterministic, DB-free/AI-free conversion signal (see
   *  evaluateVerifiedAttendancePriority). */
  verifiedAttendance?: { course: string | null; status: string | null } | null;
};

export type CounsellorPriorityResult = {
  admissionIntent: AdmissionIntent;
  priority: CounselorPriority;
  /** Deterministic, defensible action recommendation. Never claims a
   *  counsellor contacted the student. */
  action: string;
  /** The course this signal belongs to — current-message course when
   *  present, otherwise the booking course. This IS the stale-guard's
   *  output: it can never be the OLD course for a NEW enquiry. */
  course: string | null;
  /** Whether the demo context was eligible for a boost (S5-A/B guard:
   *  non-cancelled booking + course matches the current message). */
  demoEligible: boolean;
  reason: string;
};

// ═════════════════════════════════════════════════════════════════
// 1. classifyAdmissionIntent — deterministic admission intent
// ═════════════════════════════════════════════════════════════════

/**
 * classifyAdmissionIntent
 * ──────────────────────────
 * Maps a single student message to an admission-intent level:
 *
 *   URGENT  — execution / money / registration language
 *             ("I want to pay", "send registration link", "register me",
 *              "fees and payment", "book my admission", "start today")
 *   HIGH    — strong joining intent
 *             ("I want to join", "I want to enroll", "how can I enroll",
 *              "I want admission", "I want to start/begin")
 *   MEDIUM  — concrete next-step questions
 *             ("what are the fees", "batch timing", "when can I start",
 *              "tell me course details", "what documents are required")
 *   LOW     — low-commitment enquiry
 *             ("just checking", "maybe later", "need to discuss",
 *              "send information")
 *   NONE    — generic educational questions and anything without an
 *             admission signal ("What is IELTS?", "What is PTE?",
 *             "Which country is good for Germany?")
 *
 * Priority DECLINED-style safety is positional: URGENT patters run first
 * so "I want to pay" can never fall into MEDIUM fee-lookup ("fees") or
 * LOW ("I want to discuss"). PURE — string in, label out.
 */
export function classifyAdmissionIntent(message: string): AdmissionIntentClass {
  const normalized = normalizeMessage(message);

  if (isPureInformationalCourseQuestion(normalized)) {
    return {
      intent: "NONE",
      signal: null,
      reason: "Generic informational course question — not admission intent",
    };
  }

  const urgent = matchFirst(normalized, URGENT_ADMISSION_PATTERNS);
  if (urgent) {
    return { intent: "URGENT", signal: urgent, reason: `Execution/payment signal: "${urgent}"` };
  }

  const high = matchFirst(normalized, HIGH_ADMISSION_PATTERNS);
  if (high) {
    return { intent: "HIGH", signal: high, reason: `Strong joining intent: "${high}"` };
  }

  const medium = matchFirst(normalized, MEDIUM_ADMISSION_PATTERNS);
  if (medium) {
    return { intent: "MEDIUM", signal: medium, reason: `Next-step enquiry: "${medium}"` };
  }

  const low = matchFirst(normalized, LOW_ADMISSION_PATTERNS);
  if (low) {
    return { intent: "LOW", signal: low, reason: `Low-commitment enquiry: "${low}"` };
  }

  return {
    intent: "NONE",
    signal: null,
    reason: "No admission signal present",
  };
}

// Operates on router-normalized text (punctuation stripped, "don't"→
// "don t"), always word-boundary, so "fee" never fires inside "coffee"
// and "registration" inside "registrations" behaves predictably.
const URGENT_ADMISSION_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: "want to pay", pattern: /\bwant to pay\b/ },
  { label: "pay question", pattern: /\b(?:where|how) (?:do|can) i pay\b/ },
  { label: "make payment", pattern: /\b(?:make|do|complete) (?:the )?payment\b/ },
  { label: "fees and payment", pattern: /\bfees and (?:the )?payment\b/ },
  { label: "pay now", pattern: /\bpay (?:now|today|the fees|fees? now)\b/ },
  { label: "registration link", pattern: /\bsend (?:me )?the? registration link\b/ },
  { label: "register me", pattern: /\bregister me\b|\bsign me up\b/ },
  { label: "book my admission", pattern: /\bbook (?:my|the) admission\b/ },
  { label: "start now", pattern: /\bstart (?:today|now|this week|immediately)\b/ },
];

const HIGH_ADMISSION_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: "want to join", pattern: /\bwant to (?:join|enroll|enrol|start|begin)\b/ },
  { label: "join", pattern: /\bjoin (?:your|the|a) (?:coaching|batch|course|academy|program)\b/ },
  { label: "enroll how", pattern: /\bhow (?:do|can) i (?:enroll|enrol|join)\b/ },
  { label: "admission ask", pattern: /\b(?:want|need|looking for) (?:the )?admission\b/ },
  { label: "take admission", pattern: /\btake admission\b/ },
];

const MEDIUM_ADMISSION_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: "fees", pattern: /\b(?:course\s*)?(?:fee|fees|price|pricing|cost)\b/ },
  { label: "batch timing", pattern: /\bbatch (?:timings?|schedule|time|start)\b/ },
  { label: "when can i start", pattern: /\bwhen (?:can|do|does) (?:i|we) (?:start|begin)\b|\bwhen (?:do|does) (?:classes|batches|courses) (?:start|begin)\b/ },
  { label: "course details", pattern: /\btell me (?:more|about|the) (?:course|batch|program|classes|coaching)\b|\bcourse (?:details|structure|curriculum|syllabus)\b/ },
  { label: "documents required", pattern: /\bdocument(?:s)? (?:required|needed|needed for|for admission)\b|\bwhat (?:all )?documents\b/ },
  { label: "admission process", pattern: /\badmission (?:requirements?|process|procedure)\b/ },
  { label: "eligibility", pattern: /\beligibility\b/ },
];

const LOW_ADMISSION_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: "just checking", pattern: /\bjust (?:checking|looking|browsing|exploring)\b/ },
  { label: "maybe later", pattern: /\bmaybe later\b|\bsome other time\b/ },
  { label: "need to discuss", pattern: /\b(?:need|want|will) to? discuss\b|\bdiscuss (?:it )?with (?:my |our |the )?(?:family|parents)\b/ },
  { label: "send information", pattern: /\bsend (?:me )?information\b|\bsend (?:the )?(?:details|info|brochure)\b|\bshare (?:the )?(?:info|details|information)\b/ },
  { label: "not ready", pattern: /\bnot (?:ready|sure|decided)\b|\blet me (?:think|decide)\b|\bneed (?:some )?time\b/ },
];

function matchFirst(normalized: string, list: { label: string; pattern: RegExp }[]): string | null {
  for (const item of list) {
    if (item.pattern.test(normalized)) return item.label;
  }
  return null;
}

// ═════════════════════════════════════════════════════════════════
// 2. evaluateCounsellorPriority — the explicit, testable priority table
// ═════════════════════════════════════════════════════════════════

/**
 * evaluateCounsellorPriority
 * ────────────────────────────
 * Combines admission intent + demo funnel context (S5-A/B) + handoff /
 * group exclusion into COUNSELLOR_PRIORITY: NONE | NORMAL | HIGH | URGENT.
 *
 * EXCLUSIONS (deterministic, in order):
 *   • group message          → NONE (groups never get counsellor signals)
 *   • human handoff requested → NONE (the existing handoff flow is
 *     authoritative; this layer must never override or duplicate it)
 *   • post-demo DECLINED     → NONE (never escalate a declined student)
 *
 * PRIORITY TABLE:
 *   URGENT when:
 *     • admission intent is URGENT (payment/registration/execution), OR
 *     • demo ATTENDED + strong joining intent (HIGH)
 *   HIGH when:
 *     • admission intent is HIGH (join/enroll/admission), OR
 *     • admission intent MEDIUM but eligibility demo context is present
 *       (DEMO_BOOKED + "what are the fees?" → HIGH, not NORMAL), OR
 *     • post-demo HIGH_INTENT (fee/payment or join ask after a demo)
 *   NORMAL when:
 *     • admission intent MEDIUM from a cold enquiry (fees / batch timing /
 *       documents), OR
 *     • post-demo MEDIUM_INTENT (interested but no direct admission ask)
 *   NONE when:
 *     • admission intent LOW / NONE with no post-demo signal,
 *     • post-demo LOW_INTENT,
 *     • any exclusion above.
 *
 * Reasoning chain is included per call so every decision is explainable.
 */
export function evaluateCounsellorPriority(
  input: CounsellorPriorityInput,
): CounsellorPriorityResult {
  const {
    message,
    course = null,
    booking = null,
    postDemo = null,
    humanHandoffRequested = false,
    groupConversation = false,
    verifiedAttendance = null,
  } = input;

  const admission = classifyAdmissionIntent(message);

  // ── Exclusions first — the adapter already returns before these reach
  //    this pure function; the flags here are defence-in-depth. ──────
  if (groupConversation) {
    return {
      admissionIntent: admission.intent,
      priority: "NONE",
      action: "Group message — no counsellor action.",
      course: null,
      demoEligible: false,
      reason: "Group conversations are excluded from counsellor prioritisation",
    };
  }

  if (humanHandoffRequested) {
    return {
      admissionIntent: admission.intent,
      priority: "NONE",
      action: "Human handoff requested — the existing handoff flow remains authoritative.",
      course: null,
      demoEligible: false,
      reason: "HUMAN_HANDOFF is handled by the existing handoff system; this layer does not override it",
    };
  }

  // ── Demo eligibility boost (S5-A/S5-B stale-demo guard reused) ────
  const demoContext = hasEligibleDemoContext(booking, course);
  const signalCourse = course ?? booking?.course ?? null;
  const attended = postDemo?.attendance === "ATTENDED";
  const declined = postDemo?.intent === "DECLINED";

  if (declined) {
    return {
      admissionIntent: admission.intent,
      priority: "NONE",
      action: "Student declined — no sales action.",
      course: signalCourse,
      demoEligible: demoContext.eligible,
      reason: "Student explicitly declined — no sales escalation",
    };
  }

  // ── Priority mapping ────────────────────────────────────────────
  let priority: CounselorPriority;
  if (admission.intent === "URGENT") {
    priority = "URGENT";
  } else if (admission.intent === "HIGH") {
    priority = attended ? "URGENT" : "HIGH";
  } else if (admission.intent === "MEDIUM") {
    priority = demoContext.eligible ? "HIGH" : "NORMAL";
  } else if (admission.intent === "LOW") {
    priority = "NONE";
  } else {
    // No admission keyword → fall back to any post-demo interest signal.
    if (postDemo?.intent === "HIGH_INTENT") priority = attended ? "URGENT" : "HIGH";
    else if (postDemo?.intent === "MEDIUM_INTENT") priority = "NORMAL";
    else priority = "NONE";
  }

  // ── S6-D3 — VERIFIED ATTENDANCE CONVERSION SIGNAL ──────────────
  // A HUMAN-VERIFIED DemoBooking.status === "ATTENDED" (S6-D2-B) for the
  // SAME course is a strong, authoritative conversion fact. It only ever
  // RAISES the queue (max with the S5-C baseline) — never downgrades —
  // and it never auto-verifies payment, never confirms admission, and
  // never marks the student contacted (pure signal only). Course
  // isolation is enforced: an ATTENDED booking is only a signal while
  // the demo context is eligible for the CURRENT course (the S5-A/B
  // stale guard), so a German demo never colours a new IELTS enquiry.
  // NO_SHOW / CANCELLED / PENDING / CONFIRMED and "no booking" all
  // leave the existing S5-C behaviour untouched.
  const verifiedBoost = evaluateVerifiedAttendancePriority({
    admission,
    message,
    postDemo,
    verifiedAttendance,
    demoEligible: demoContext.eligible,
    signalCourse,
  });
  if (verifiedBoost.applied) {
    priority = maxPriority(priority, verifiedBoost.priority);
  }

  return {
    admissionIntent: admission.intent,
    priority,
    action: buildAction({
      admission,
      priority,
      demoEligible: demoContext.eligible,
      feeSignal: hasFeeSignal(message),
      joinedSignal: admission.intent === "HIGH",
      verifiedAttendanceApplied: verifiedBoost.applied,
    }),
    course: signalCourse,
    demoEligible: demoContext.eligible,
    reason:
      admission.intent === "NONE"
        ? `Admission intent: none (${admission.reason}); post-demo signal: ${postDemo?.intent ?? "none"}${
            verifiedBoost.applied ? `; verified-ATTENDED made this a ${verifiedBoost.priority} queue item` : ""
          }`
        : `${admission.reason}; demo context eligible: ${demoContext.eligible}; priority: ${priority}${
            verifiedBoost.applied ? "; verified-ATTENDED demo — counsellor queue raised" : ""
          }`,
  };
}

function hasFeeSignal(message: string): boolean {
  return /\b(?:fee|fees|price|pricing|cost)\b/.test(normalizeMessage(message));
}

/**
 * evaluateVerifiedAttendancePriority
 * ──────────────────────────────────
 * S6-D3 — the PURE verified-attendance conversion signal. Consumes ONLY
 * the human-verified DemoBooking.status === "ATTENDED" (S6-D2-B), never
 * student wording. Explicit Phase 4 mapping:
 *
 *   ATTENDED + join          → URGENT  (queue: ADMISSION_ASSISTANCE)
 *   ATTENDED + fees/payment  → HIGH    (queue: PRIORITY_FOLLOW_UP)
 *   ATTENDED + general       → HIGH    (queue: PRIORITY_FOLLOW_UP)
 *   ATTENDED + declined      → no boost (baseline S5-C already NONE)
 *   NO_SHOW / CANCELLED / PENDING / CONFIRMED → no boost
 *   no booking               → no boost (existing S5-C behaviour)
 *
 * Course isolation (mandatory): the signal fires only when the demo
 * context is eligible for the CURRENT course (S5-A/B stale guard) AND the
 * verified booking's course matches the signal course. A German demo can
 * never raise an IELTS conversation. Nothing here writes, texts a
 * counsellor, verifies payment, confirms admission, or marks the student
 * contacted — it is a pure, deterministic, DB-free/AI-free signal.
 */
export function evaluateVerifiedAttendancePriority(input: {
  admission: AdmissionIntentClass;
  message: string;
  postDemo: PostDemoResponseClass | null | undefined;
  verifiedAttendance: { course: string | null; status: string | null } | null | undefined;
  demoEligible: boolean;
  signalCourse: string | null;
}): { applied: boolean; priority: CounselorPriority } {
  const { admission, message, postDemo, verifiedAttendance, demoEligible, signalCourse } = input;

  if (verifiedAttendance?.status !== "ATTENDED") {
    return { applied: false, priority: "NONE" };
  }

  // Course isolation: no valid demo context, or the verified booking's
  // course does not match the course being discussed → no cross-course signal.
  if (!demoEligible) return { applied: false, priority: "NONE" };
  const verifiedCourse = verifiedAttendance.course;
  if (verifiedCourse && signalCourse && !coursesTolerantMatch(verifiedCourse, signalCourse)) {
    return { applied: false, priority: "NONE" };
  }

  // A declined student is never escalated (baseline S5-C is already NONE).
  if (postDemo?.intent === "DECLINED") {
    return { applied: false, priority: "NONE" };
  }

  const fee = hasFeeSignal(message);
  const joining =
    admission.intent === "HIGH" ||
    (admission.intent === "URGENT" && !fee) ||
    (postDemo?.intent === "HIGH_INTENT" && !fee);

  if (joining) {
    // ATTENDED + join → ADMISSION_ASSISTANCE
    return { applied: true, priority: "URGENT" };
  }
  // ATTENDED + fees/payment or general interest → PRIORITY_FOLLOW_UP
  return { applied: true, priority: "HIGH" };
}

/** Tolerant course equality — one normalized value contained in the other. */
function coursesTolerantMatch(a: string, b: string): boolean {
  const x = a.toLowerCase().trim();
  const y = b.toLowerCase().trim();
  return x === y || x.includes(y) || y.includes(x);
}

function maxPriority(a: CounselorPriority, b: CounselorPriority): CounselorPriority {
  const rank: Record<CounselorPriority, number> = {
    NONE: 0,
    NORMAL: 1,
    HIGH: 2,
    URGENT: 3,
  };
  return rank[a] >= rank[b] ? a : b;
}

function buildAction(input: {
  admission: AdmissionIntentClass;
  priority: CounselorPriority;
  demoEligible: boolean;
  feeSignal: boolean;
  joinedSignal: boolean;
  /** S6-D3 — the queue item was raised by a verified-ATTENDED demo. */
  verifiedAttendanceApplied?: boolean;
}): string {
  const { admission, priority, demoEligible, feeSignal, joinedSignal, verifiedAttendanceApplied } = input;
  const verified = verifiedAttendanceApplied ? " (verified demo attendance)" : "";

  switch (priority) {
    case "URGENT":
      return feeSignal && verified
        ? "Follow up regarding course fees after a verified demo attendance."
        : "Contact student for admission/payment assistance.";
    case "HIGH":
      if (feeSignal) return `Follow up regarding course fees${verified}.`;
      if (joinedSignal) {
        return demoEligible
          ? `Follow up after demo — student wants to join${verified}.`
          : "Contact student to complete admission interest.";
      }
      return `Follow up after demo${verified}.`;
    case "NORMAL":
      if (feeSignal) return "Follow up regarding course fees.";
      if (admission.intent === "MEDIUM") return "Follow up with course details.";
      return "Follow up after demo.";
    case "NONE":
    default:
      if (admission.intent === "LOW") {
        return "Student is not ready yet — information only, no immediate sales action.";
      }
      return "Information only — no immediate sales action.";
  }
}

// ═════════════════════════════════════════════════════════════════
// 3. buildCounsellorContextString — the only AI-facing part
// ═════════════════════════════════════════════════════════════════

/**
 * buildCounsellorContextString
 * ────────────────────────────
 * Small system-prompt block that gives the AI the conversion signal so
 * it can respond naturally and helpfully — WITHOUT leaking the internal
 * priority labels (never "URGENT lead", never "lead score"), without
 * pressuring the student, and without fabricating counsellor contact or
 * availability. Returns null when there is nothing to inject.
 */
export function buildCounsellorContextString(input: {
  priority: CounselorPriority;
  admissionIntent: AdmissionIntent;
  course?: string | null;
  demoEligible?: boolean;
  attended?: boolean;
}): string | null {
  if (input.priority === "NONE") return null;

  const course = input.course ?? null;
  const coursePhrase = course ? `${course} ` : "";
  const studentLine = course
    ? `The student is actively interested in joining our ${course} coaching program.`
    : "The student is actively interested in joining our coaching program.";

  const demoLine = input.attended
    ? `They completed a free ${coursePhrase}demo.`
    : input.demoEligible
      ? `They have a free ${coursePhrase}demo booked or in progress.`
      : null;

  const lines = [
    "CONVERSION CONTEXT:",
    studentLine,
    ...(demoLine ? [demoLine] : []),
    "Help them with the natural next step — fees, batches, documents, or enrollment.",
    "Offer counsellor assistance only where it genuinely helps, or if the student asks.",
    "Never pressure the student and never push payment.",
    "Never claim seats, discounts, or admission are available unless confirmed by the knowledge base.",
    "Never claim a counsellor has already reached out to the student.",
    "",
  ];

  return lines.join("\n");
}