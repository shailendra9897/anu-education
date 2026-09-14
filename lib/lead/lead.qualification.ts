// FILE: lib/lead/lead.qualification.ts
//
// ─────────────────────────────────────────────────────────────────
// PHASE LEAD-QUALIFICATION-AGENT-02 — DETERMINISTIC LEAD QUALIFICATION
//
// A PURE, deterministic, AI-free, DB-free qualification layer that
// turns the EXISTING CRM aggregates into a single validated
// LeadQualification object for the counsellor/admin workspace:
//
//   existing CRM aggregates
//           │
//           ▼
//      qualifyLead(...)
//           │
//           ▼
//   validated LeadQualification
//           │
//           ▼
//   /admin/conversations/[id]  and  /admin/conversations
//
// RULES (from the approved design):
//   • Deterministic: the same input always yields the same output
//     (idempotent, compute-on-read — see the 16-case test matrix).
//   • No Prisma calls, no network calls, no LLM calls, no
//     environment variables. Every signal is passed in by the caller
//     from aggregates that were ALREADY loaded for the workspace.
//   • Every qualification FIELD carries { value, basis, confidence }.
//   • basis ∈ { FACT, INFERENCE, UNKNOWN }.
//       FACT      — explicit conversation evidence OR authoritative
//                   existing CRM state (lead context, admission state,
//                   demo booking status, canonical lead identity).
//       INFERENCE — deterministic derivation from the canonical signals
//                   above ONLY.
//       UNKNOWN   — no reliable evidence. An UNKNOWN field NEVER carries
//                   an invented value and NEVER becomes a FACT.
//   • Never invent: age, income, budget, nationality, religion, health,
//     political information, financial ability or academic results.
//     Budget continues to use the existing explicit budget extraction
//     ONLY (LeadContext.budgetRange / CoachingLeadContext.budget).
//   • leadStage is presentation-only in V1. It is never persisted, never
//     written to a database column, and never surfaced to the student.
//   • Confidence aggregates present FACT fields with the approved
//     minimum-confidence rule; null when no FACT field is present.
//   • No "qualification audit/history" SYSTEM event is emitted in V1.
// ═════════════════════════════════════════════════════════════════

import {
  classifyAdmissionIntent,
  type AdmissionIntent,
} from "./counsellor.priority";
import {
  classifyPostDemoResponse,
  hasEligibleDemoContext,
  type PostDemoResponseClass,
} from "../demo/demo.followup";
import { evaluateDemoOpportunity } from "../demo/demo.offer";
import {
  getMissingCoachingInfo,
  type CoachingLeadContext,
} from "./leadExtractor";

// ═════════════════════════════════════════════════════════════════
// CANONICAL ENUMS
// ═════════════════════════════════════════════════════════════════

export type LeadQualificationBasis = "FACT" | "INFERENCE" | "UNKNOWN";

export const LEAD_QUALIFICATION_BASES: readonly LeadQualificationBasis[] = [
  "FACT",
  "INFERENCE",
  "UNKNOWN",
];

export function isLeadQualificationBasis(
  value: unknown,
): value is LeadQualificationBasis {
  return (
    typeof value === "string" &&
    (LEAD_QUALIFICATION_BASES as readonly string[]).includes(value)
  );
}

/**
 * LeadQualificationField — every qualification field carries the same
 * three-part shape. `confidence` is always `null` for UNKNOWN, and always
 * a number in 0..1 for FACT/INFERENCE.
 */
export type LeadQualificationField<T extends string = string> = {
  value: T | null;
  basis: LeadQualificationBasis;
  confidence: number | null;
};

/**
 * LeadStage — the V1 presentation-only qualification stage, in display
 * precedence order (highest wins):
 *
 *   LOST > ADMISSION_READY > HIGH_INTENT > QUALIFIED > QUALIFYING
 *        > ENGAGED > NEW
 */
export const LEAD_STAGES = [
  "LOST",
  "ADMISSION_READY",
  "HIGH_INTENT",
  "QUALIFIED",
  "QUALIFYING",
  "ENGAGED",
  "NEW",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export function isLeadStage(value: unknown): value is LeadStage {
  return (
    typeof value === "string" && (LEAD_STAGES as readonly string[]).includes(value)
  );
}

export const LEAD_STAGE_LABELS: Readonly<Record<LeadStage, string>> = {
  LOST: "Lost",
  ADMISSION_READY: "Admission ready",
  HIGH_INTENT: "High intent",
  QUALIFIED: "Qualified",
  QUALIFYING: "Qualifying",
  ENGAGED: "Engaged",
  NEW: "New",
};

/** Evidence grades — deterministic, never a random number. */
export const QUALIFICATION_FACT_CONFIDENCE = 1;
export const QUALIFICATION_INFERENCE_CONFIDENCE = 0.8;

/** Bounds used by validateLeadQualification. */
export const MAX_MISSING_INFO = 5;
export const MAX_COUNSELLOR_SUMMARY = 240;
const MAX_FIELD_VALUE_LENGTH = 120;
const MAX_NEXT_ACTION_LENGTH = 200;
const MAX_REASON_LENGTH = 500;
const MAX_MISSING_INFO_LABEL_LENGTH = 60;

// ═════════════════════════════════════════════════════════════════
// INPUT — a structural subset of the aggregates the workspace already
// loaded. The qualification module is DB-free: it never fetches.
// ═════════════════════════════════════════════════════════════════

export type LeadContextSignals = {
  goal?: string | null;
  targetCountry?: string | null;
  targetCourse?: string | null;
  englishLevel?: string | null;
  budgetRange?: string | null;
  timeline?: string | null;
  intake?: string | null;
  biggestChallenge?: string | null;
};

export type LeadQualificationInput = {
  conversation?: {
    id?: string;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    status?: string | null;
    assignedCounsellorId?: string | null;
  } | null;
  lead?: { name?: string | null; phone?: string | null; email?: string | null } | null;
  leadContext?: LeadContextSignals | null;
  demoBookings?: Array<{
    course?: string | null;
    status?: string | null;
    preferredBatch?: string | null;
    preferredDate?: unknown;
  }> | null;
  admissions?: Array<{ course?: string | null; state?: string | null }> | null;
  latestAction?: { state?: string | null; course?: string | null; reason?: string | null } | null;
  transcript?: Array<{ role?: string | null; content?: string | null }> | null;
};

// ═════════════════════════════════════════════════════════════════
// OUTPUT
// ═════════════════════════════════════════════════════════════════

export type LeadQualification = {
  intent: LeadQualificationField<AdmissionIntent>;
  course: LeadQualificationField;
  exam: LeadQualificationField;
  destination: LeadQualificationField;
  studentType: LeadQualificationField;
  intake: LeadQualificationField;
  timeline: LeadQualificationField;
  budget: LeadQualificationField;
  urgency: LeadQualificationField<"HIGH" | "MEDIUM" | "LOW">;
  leadStage: LeadQualificationField<LeadStage>;
  /** Aggregate confidence from present FACT fields (minimum rule).
   *  null when no FACT field is present. Always null OR 0..1. */
  confidence: number | null;
  /** Deterministic gaps (max 5). Never a negative fact — an unknown
   *  field is reported as missing, never as an insufficient value. */
  missingInfo: string[];
  /** Deterministic recommendation reusing the existing counsellor /
   *  coaching / demo action signals. Never claims a counsellor was
   *  contacted. */
  nextAction: string;
  /** Deterministic one-line summary, max 240 characters. */
  counsellorSummary: string;
  /** Deterministic derivation notes (required whenever INFERENCE is used). */
  reason: string;
};

// ═════════════════════════════════════════════════════════════════
// CANONICAL STAGE / STATE VOCABULARY (reused from existing enums)
// ═════════════════════════════════════════════════════════════════

const ADMISSION_STATES_READY = new Set([
  "DOCUMENTS_PENDING",
  "PAYMENT_PENDING",
  "PAYMENT_VERIFICATION",
  "PAYMENT_VERIFIED",
  "ADMISSION_CONFIRMED",
  "ADMISSION_COMPLETED",
]);

const ADMISSION_STATES_HIGH = new Set([
  "INTERESTED",
  "COUNSELLOR_CONTACT_PENDING",
  "COUNSELLOR_CONTACTED",
  "FOLLOW_UP_REQUIRED",
]);

const ADMISSION_STATES_LOST = new Set(["LOST", "NOT_INTERESTED"]);

const URGENT_TIMELINE_PATTERN =
  /\b(?:asap|immediately|as soon as possible|immediate|urgent(?:ly)?|quickly|soon)\b/i;

const LOW_TIMELINE_PATTERN =
  /\b(?:next year|just exploring|just looking|not sure yet|probably|maybe|some(?:time)? later)\b/i;

const EXAM_ACRONYM_PATTERN =
  /\b(IELTS|PTE|TOEFL|GRE|GMAT|SAT|Duolingo|German|French)\b/i;

const CURRENT_YEAR_TIMELINE_PATTERN = /\b(?:this year|within\s+\d{1,2}\s+months?|soon)\b/i;

// ═════════════════════════════════════════════════════════════════
// PURE FIELD DERIVATION
// ═════════════════════════════════════════════════════════════════

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function factField<T extends string>(value: T | null | undefined): LeadQualificationField<T> {
  return hasText(value)
    ? { value, basis: "FACT", confidence: QUALIFICATION_FACT_CONFIDENCE }
    : { value: null, basis: "UNKNOWN", confidence: null };
}

function inferenceField<T extends string>(
  value: T | null | undefined,
): LeadQualificationField<T> {
  return hasText(value)
    ? { value, basis: "INFERENCE", confidence: QUALIFICATION_INFERENCE_CONFIDENCE }
    : { value: null, basis: "UNKNOWN", confidence: null };
}

function unknownField<T extends string>(): LeadQualificationField<T> {
  return { value: null, basis: "UNKNOWN", confidence: null };
}

function ctxValue(input: LeadQualificationInput, key: keyof LeadContextSignals): string | null {
  const ctx = input.leadContext;
  if (!ctx || typeof ctx !== "object") return null;
  const raw = ctx[key];
  return hasText(raw) ? raw : null;
}

function existingLastName(input: LeadQualificationInput): string | null {
  const name = input.lead?.name ?? input.conversation?.name ?? null;
  return hasText(name) ? name : null;
}

function existingIdentity(input: LeadQualificationInput): {
  name: string | null;
  phone: string | null;
  email: string | null;
} {
  const name = existingLastName(input);
  const phone = hasText(input.lead?.phone)
    ? input.lead!.phone
    : hasText(input.conversation?.phone)
      ? input.conversation!.phone
      : null;
  const email = hasText(input.lead?.email)
    ? input.lead!.email
    : hasText(input.conversation?.email)
      ? input.conversation!.email
      : null;
  return { name, phone, email };
}

function latestUserMessage(input: LeadQualificationInput): string | null {
  const transcript = input.transcript;
  if (!Array.isArray(transcript)) return null;
  for (let i = transcript.length - 1; i >= 0; i -= 1) {
    const m = transcript[i];
    if (m && m.role === "USER" && hasText(m.content)) return m.content;
  }
  return null;
}

function activeAdmissionStates(
  admissions: LeadQualificationInput["admissions"],
): string[] {
  if (!Array.isArray(admissions)) return [];
  const states: string[] = [];
  for (const admission of admissions) {
    if (admission && hasText(admission.state)) {
      states.push(admission.state.toUpperCase());
    }
  }
  return states;
}

function anyState(states: string[], set: ReadonlySet<string>): boolean {
  return states.some((s) => set.has(s));
}

function firstAdmissionCourse(input: LeadQualificationInput): string | null {
  const admissions = input.admissions;
  if (!Array.isArray(admissions)) return null;
  for (const a of admissions) {
    if (a && hasText(a.course)) return a.course;
  }
  return null;
}

function firstDemoCourse(input: LeadQualificationInput): string | null {
  const bookings = input.demoBookings;
  if (!Array.isArray(bookings)) return null;
  for (const b of bookings) {
    if (b && hasText(b.course)) return b.course;
  }
  return null;
}

function deriveCourseField(input: LeadQualificationInput): LeadQualificationField {
  // Authoritative CRM state first (fact), then explicit booking course.
  const ctxCourse = ctxValue(input, "targetCourse");
  if (ctxCourse) return factField(ctxCourse);
  const admissionCourse = firstAdmissionCourse(input);
  if (admissionCourse) return factField(admissionCourse);
  const demoCourse = firstDemoCourse(input);
  if (demoCourse) return factField(demoCourse);
  return unknownField();
}

function deriveExamField(
  input: LeadQualificationInput,
  course: LeadQualificationField,
): LeadQualificationField {
  const english = ctxValue(input, "englishLevel");
  if (english) {
    const match = english.match(EXAM_ACRONYM_PATTERN);
    if (match?.[1]) return factField(match[1].toUpperCase());
  }
  if (course.value) {
    const match = course.value.match(EXAM_ACRONYM_PATTERN);
    if (match?.[1]) return inferenceField(match[1].toUpperCase());
  }
  return unknownField();
}

const STUDENT_TYPE_BY_GOAL: Readonly<Record<string, string>> = {
  study: "Student",
  work: "Working professional",
  pr: "PR seeker",
  research: "Researcher",
  prmigration: "PR seeker",
};

function deriveStudentTypeField(input: LeadQualificationInput): LeadQualificationField {
  const goal = ctxValue(input, "goal");
  if (goal) {
    const key = goal.toLowerCase();
    const mapped = STUDENT_TYPE_BY_GOAL[key];
    if (mapped) return inferenceField(mapped);
  }
  return unknownField();
}

function deriveUrgencyField(input: {
  leadContext: LeadQualificationInput["leadContext"];
  admissions: LeadQualificationInput["admissions"];
  demoBookings: LeadQualificationInput["demoBookings"];
  admissionIntent: AdmissionIntent;
  stage: LeadStage;
}): LeadQualificationField<"HIGH" | "MEDIUM" | "LOW"> {
  const timeline = hasText(input.leadContext?.timeline) ? input.leadContext!.timeline! : null;
  const tl = timeline ? timeline.toLowerCase() : "";

  const states = activeAdmissionStates(input.admissions);

  const ready = anyState(states, ADMISSION_STATES_READY);
  const intentUrgent = input.admissionIntent === "URGENT";

  if (ready || intentUrgent || (tl && URGENT_TIMELINE_PATTERN.test(tl))) {
    return { value: "HIGH", basis: "INFERENCE", confidence: QUALIFICATION_INFERENCE_CONFIDENCE };
  }

  const highStage = input.stage === "ADMISSION_READY" || input.stage === "HIGH_INTENT";
  const mediumTimeline = tl && CURRENT_YEAR_TIMELINE_PATTERN.test(tl) && !URGENT_TIMELINE_PATTERN.test(tl);

  if (highStage || mediumTimeline || anyState(states, ADMISSION_STATES_HIGH)) {
    return { value: "MEDIUM", basis: "INFERENCE", confidence: QUALIFICATION_INFERENCE_CONFIDENCE };
  }

  if (tl && LOW_TIMELINE_PATTERN.test(tl)) {
    return { value: "LOW", basis: "INFERENCE", confidence: QUALIFICATION_INFERENCE_CONFIDENCE };
  }

  const hasAnySignal =
    Object.keys(input.leadContext ?? {}).length > 0 ||
    (Array.isArray(input.demoBookings) && input.demoBookings.length > 0) ||
    states.length > 0;

  if (hasAnySignal) {
    return { value: "MEDIUM", basis: "INFERENCE", confidence: QUALIFICATION_INFERENCE_CONFIDENCE };
  }

  return unknownField();
}

// ═════════════════════════════════════════════════════════════════
// STAGE DERIVATION — the approved precedence:
//   LOST > ADMISSION_READY > HIGH_INTENT > QUALIFIED > QUALIFYING
//        > ENGAGED > NEW
// Presentation-only in V1; never persisted.
// ═════════════════════════════════════════════════════════════════

export function deriveLeadStage(input: LeadQualificationInput): {
  stage: LeadStage;
  rationale: string;
} {
  const states = activeAdmissionStates(input.admissions);
  const message = latestUserMessage(input);
  const postDemo: PostDemoResponseClass = message
    ? classifyPostDemoResponse(message)
    : { attendance: "UNKNOWN", intent: "NONE" };
  const admissionIntent = classifyAdmissionIntent(message ?? "");

  // S5-B stale-demo guard (mirrors ai-adapter.service.ts S5-B gate):
  // post-demo HIGH_INTENT is only a valid stage signal when the conversation
  // has an eligible demo context — a non-cancelled booking with a course,
  // for the course named in the current message (or no course named).
  // Without this gate, purely informational messages mentioning "cost"/"fee"
  // (which match HIGH_INTENT_PATTERNS) would incorrectly elevate any lead
  // to HIGH_INTENT even with no demo at all.
  const currentMessageCourse = message
    ? evaluateDemoOpportunity(message).course
    : null;
  const hasEligiblePostDemo = Array.isArray(input.demoBookings)
    && input.demoBookings.some((b) =>
      b
        ? hasEligibleDemoContext(
            { id: "booking", course: b.course ?? null, status: b.status ?? null },
            currentMessageCourse,
          ).eligible
        : false,
    );

  const hasUserMessage = message !== null;

  if (anyState(states, ADMISSION_STATES_LOST) || postDemo.intent === "DECLINED") {
    return {
      stage: "LOST",
      rationale:
        postDemo.intent === "DECLINED"
          ? "Student explicitly declined interest"
          : "Admission journey ended (lost / not interested)",
    };
  }

  if (anyState(states, ADMISSION_STATES_READY)) {
    return {
      stage: "ADMISSION_READY",
      rationale: "Student is deep in the admission funnel (documents/payment/admission)",
    };
  }

  const intentHigh = admissionIntent.intent === "HIGH" || admissionIntent.intent === "URGENT";
  if (
    anyState(states, ADMISSION_STATES_HIGH) ||
    intentHigh ||
    (postDemo.intent === "HIGH_INTENT" && hasEligiblePostDemo)
  ) {
    return {
      stage: "HIGH_INTENT",
      rationale:
        admissionIntent.intent === "URGENT"
          ? "Urgent admission/execution signal"
          : "Strong joining/enrollment intent",
    };
  }

  const context = input.leadContext;
  const hasCourse = hasText(context?.targetCourse);
  const hasQualifier =
    hasText(context?.targetCountry) ||
    hasText(context?.budgetRange) ||
    hasText(context?.intake) ||
    hasText(context?.timeline) ||
    hasText(context?.englishLevel);
  if (hasCourse && hasQualifier) {
    return {
      stage: "QUALIFIED",
      rationale: "Course known plus at least one further qualification signal",
    };
  }

  const hasAnyContext =
    context &&
    Object.values(context).some((v) => hasText(v));
  const hasDemo = Array.isArray(input.demoBookings) && input.demoBookings.length > 0;
  const hasAdmission = states.length > 0;
  if (hasAnyContext || hasDemo || hasAdmission) {
    return {
      stage: "QUALIFYING",
      rationale: "Some qualifying signals present but not enough to mark qualified",
    };
  }

  if (hasUserMessage) {
    return {
      stage: "ENGAGED",
      rationale: "Student engaged in conversation; no qualifying signals collected yet",
    };
  }

  return {
    stage: "NEW",
    rationale: "No qualification, admission, demo or engagement signals",
  };
}

// ═════════════════════════════════════════════════════════════════
// MISSING INFORMATION — reuses getMissingCoachingInfo (the canonical
// coaching-field priority) + demo missing-detail signals + identity
// gaps. Max 5 entries. An unknown field is reported as missing, never
// as a negative fact.
// ═════════════════════════════════════════════════════════════════

function buildMissingInfo(input: LeadQualificationInput): string[] {
  const identity = existingIdentity(input);

  const coachingContext: CoachingLeadContext = {
    course: ctxValue(input, "targetCourse") ?? undefined,
    currentLevel: ctxValue(input, "englishLevel") ?? undefined,
    destination: ctxValue(input, "targetCountry") ?? undefined,
    intake: ctxValue(input, "intake") ?? undefined,
    budget: ctxValue(input, "budgetRange") ?? undefined,
    goal: ctxValue(input, "goal") ?? undefined,
  };

  const { fields } = getMissingCoachingInfo(coachingContext);
  const byKey = new Map(fields.map((f) => [f.key, f]));

  const missing: string[] = [];

  if (!identity.name) missing.push("name");
  if (!identity.phone && !identity.email) missing.push("contact details");

  // The canonical coaching-priority order for the fields this workspace
  // can observe (course → current level → destination → intake → budget).
  const coachingKeys = ["course", "currentLevel", "destination", "intake", "budget"];
  for (const key of coachingKeys) {
    const field = byKey.get(key);
    if (field && !field.collected) missing.push(field.label);
  }

  if (!ctxValue(input, "timeline")) missing.push("timeline");

  // De-duplicate deterministically and cap at the approved maximum.
  const unique: string[] = [];
  for (const label of missing) {
    if (!unique.includes(label)) unique.push(label);
    if (unique.length >= MAX_MISSING_INFO) break;
  }
  return unique;
}

// ═════════════════════════════════════════════════════════════════
// NEXT ACTION — reuses the EXISTING counsellor-action / coaching
// missing-information / demo-flow missing-information signals. Never a
// competing recommendation engine.
//
// Priority:
//   1. Existing counsellor action where applicable
//   2. Existing coaching missing-information action
//   3. Existing demo-flow missing-information action
//   4. "Information only"
//
// Suppression (mirrors the S5-C ownership gate): assigned / handed-off /
// group conversations never receive an automated sales escalation, and
// nothing ever claims a counsellor contacted the student.
// ═════════════════════════════════════════════════════════════════

const ACTION_STATE_TEXT: Readonly<Record<string, string>> = {
  FOLLOW_UP: "Follow up with the student.",
  PRIORITY_FOLLOW_UP: "Priority follow-up with the student.",
  ADMISSION_ASSISTANCE: "Assist the student with admission/payment.",
};

function demoFlowMissingAction(input: LeadQualificationInput): string | null {
  const bookings = input.demoBookings;
  if (!Array.isArray(bookings)) return null;
  for (const b of bookings) {
    if (!b) continue;
    const status = b.status?.toUpperCase();
    const active = status === "PENDING" || status === "CONFIRMED";
    if (!active) continue;
    const course = hasText(b.course) ? b.course : "the";
    if (!hasText(b.preferredBatch) && b.preferredDate == null) {
      return `Confirm the ${course} demo date and batch.`;
    }
    return `Confirm the ${course} demo attendance after it happens.`;
  }
  return null;
}

function deriveNextAction(input: LeadQualificationInput): string {
  const { conversation, latestAction } = input;

  const group = hasText(conversation?.name) && /\(group\)/i.test(conversation!.name!.trim());
  if (group) return "Group conversation — no sales action.";

  if (conversation?.status === "HANDED_OFF") {
    return "Conversation handed off to a human — no automated action.";
  }

  if (hasText(conversation?.assignedCounsellorId)) {
    const state = latestAction?.state;
    if (state && state !== "NONE" && ACTION_STATE_TEXT[state]) {
      return ACTION_STATE_TEXT[state];
    }
    return "Assigned to a counsellor — no automated action.";
  }

  if (latestAction?.state && latestAction.state !== "NONE") {
    const text = ACTION_STATE_TEXT[latestAction.state];
    if (text) return text;
  }

  const coachingContext: CoachingLeadContext = {
    course: ctxValue(input, "targetCourse") ?? undefined,
    currentLevel: ctxValue(input, "englishLevel") ?? undefined,
    destination: ctxValue(input, "targetCountry") ?? undefined,
    intake: ctxValue(input, "intake") ?? undefined,
    budget: ctxValue(input, "budgetRange") ?? undefined,
    goal: ctxValue(input, "goal") ?? undefined,
  };
  const { nextMissing } = getMissingCoachingInfo(coachingContext);
  if (nextMissing) {
    return `Ask for the student's ${nextMissing}.`;
  }

  const demoAction = demoFlowMissingAction(input);
  if (demoAction) return demoAction;

  return "Information only.";
}

// ═════════════════════════════════════════════════════════════════
// COUNSELLOR SUMMARY — deterministic one-line summary, max 240 chars.
//
// Conceptual format:
//   "{name}: {course} · urgency {urgency} · stage {stage} · wants {exam}
//    by {timeline}; missing {fields}"
//
// Null/unknown values are handled cleanly — never "null"/"undefined" or
// empty placeholders.
// ═════════════════════════════════════════════════════════════════

function buildCounsellorSummary(input: {
  name: string;
  course: string;
  urgency: string;
  stage: LeadStage;
  exam: string;
  timeline: string;
  missing: string[];
}): string {
  const name = input.name || "Anonymous student";
  const course = input.course || "no course yet";
  const urgency = input.urgency || "urgency unknown";
  const stage = LEAD_STAGE_LABELS[input.stage] ?? input.stage;

  const parts = [`${name}: ${course}`, `urgency ${urgency.toLowerCase()}`, `stage ${stage}`];
  if (input.exam) parts.push(`wants ${input.exam.toLowerCase()}`);
  if (input.timeline) parts.push(`by ${input.timeline.toLowerCase()}`);

  const missingLabel = input.missing.length > 0 ? input.missing.join(", ") : "none";
  parts.push(`missing ${missingLabel}`);

  const summary = parts.join(" · ");
  if (summary.length <= MAX_COUNSELLOR_SUMMARY) return summary;
  return `${summary.slice(0, MAX_COUNSELLOR_SUMMARY - 3)}...`;
}

// ═════════════════════════════════════════════════════════════════
// qualifyLead — the single entry point. Pure, deterministic,
// DB-free/AI-free. Same input ⇒ same output (idempotent by
// construction). Never throws for malformed input.
// ═════════════════════════════════════════════════════════════════

export function qualifyLead(input: LeadQualificationInput): LeadQualification {
  const raw = input && typeof input === "object" ? input : {};
  const safe: LeadQualificationInput = {
    conversation: raw.conversation ?? null,
    lead: raw.lead ?? null,
    leadContext: raw.leadContext ?? null,
    demoBookings: Array.isArray(raw.demoBookings) ? raw.demoBookings : null,
    admissions: Array.isArray(raw.admissions) ? raw.admissions : null,
    latestAction: raw.latestAction ?? null,
    transcript: Array.isArray(raw.transcript) ? raw.transcript : null,
  };

  const course = deriveCourseField(safe);
  const exam = deriveExamField(safe, course);
  const studentType = deriveStudentTypeField(safe);
  const destination = factField(ctxValue(safe, "targetCountry"));
  const intake = factField(ctxValue(safe, "intake"));
  const timeline = factField(ctxValue(safe, "timeline"));
  const budget = factField(ctxValue(safe, "budgetRange"));

  const message = latestUserMessage(safe);
  const admissionIntent = classifyAdmissionIntent(message ?? "");
  const intent: LeadQualificationField<AdmissionIntent> = {
    value: admissionIntent.intent,
    basis: "INFERENCE",
    confidence: QUALIFICATION_INFERENCE_CONFIDENCE,
  };

  const { stage, rationale } = deriveLeadStage(safe);
  const urgency = deriveUrgencyField({
    leadContext: safe.leadContext,
    admissions: safe.admissions,
    demoBookings: safe.demoBookings,
    admissionIntent: admissionIntent.intent,
    stage,
  });

  const fieldBag = { course, exam, destination, studentType, intake, timeline, budget };
  const factFields = Object.values(fieldBag).filter(
    (f): f is LeadQualificationField => f.basis === "FACT" && f.value != null,
  );
  const confidence =
    factFields.length === 0
      ? null
      : Math.min(...factFields.map((f) => f.confidence as number));

  const missingInfo = buildMissingInfo(safe);
  const nextAction = deriveNextAction(safe);

  const identity = existingIdentity(safe);
  const summaryInput = {
    name: existingLastName(safe) ?? identity.phone ?? "Anonymous student",
    course: course.value ?? "",
    urgency: urgency.value ?? "",
    stage,
    exam: exam.value ?? "",
    timeline: timeline.value ?? "",
    missing: missingInfo.slice(0, 3),
  };
  const counsellorSummary = buildCounsellorSummary(summaryInput);

  const inferenceCount = [intent, urgency, studentType]
    .filter((f) => f.basis === "INFERENCE" && f.value != null).length;
  const reason = `Stage ${LEAD_STAGE_LABELS[stage]} (${rationale}). Admission intent: ${intent.value ?? "NONE"}. Facts: ${
    factFields.length === 0 ? "none" : factFields.length
  }. Inferences: ${inferenceCount}. Recommended action: ${nextAction}`;

  return {
    intent,
    course,
    exam,
    destination,
    studentType,
    intake,
    timeline,
    budget,
    urgency,
    leadStage: {
      value: stage,
      basis: "INFERENCE",
      confidence: QUALIFICATION_INFERENCE_CONFIDENCE,
    },
    confidence,
    missingInfo,
    nextAction,
    counsellorSummary,
    reason,
  };
}

// ═════════════════════════════════════════════════════════════════
// validateLeadQualification — rejects malformed/out-of-bounds
// qualification objects so the workspace boundary can fall back to an
// "unavailable" state instead of rendering partial data.
// ═════════════════════════════════════════════════════════════════

export type LeadQualificationValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

function validateField(
  errors: string[],
  name: keyof LeadQualification,
  field: unknown,
  options: {
    enumValues?: readonly string[];
  } = {},
): void {
  if (!field || typeof field !== "object") {
    errors.push(`field "${name}": expected an object`);
    return;
  }
  const f = field as Record<string, unknown>;

  if (!("value" in f) || !("basis" in f) || !("confidence" in f)) {
    errors.push(`field "${name}": missing value/basis/confidence`);
    return;
  }

  const basis = f.basis;
  if (!isLeadQualificationBasis(basis)) {
    errors.push(`field "${name}": invalid basis ${JSON.stringify(basis)}`);
    return;
  }

  const confidence = f.confidence;
  if (confidence !== null) {
    if (typeof confidence !== "number" || Number.isNaN(confidence)) {
      errors.push(`field "${name}": confidence must be a number or null`);
      return;
    }
    if (confidence < 0 || confidence > 1) {
      errors.push(`field "${name}": confidence out of 0..1 (got ${confidence})`);
    }
  }

  if (basis === "UNKNOWN") {
    // An UNKNOWN field never carries an invented value and never carries
    // a confidence number — both are rejected as invalid semantics.
    if (f.value != null) {
      errors.push(`field "${name}": UNKNOWN basis must have a null value`);
    }
    if (confidence !== null) {
      errors.push(`field "${name}": UNKNOWN basis must have null confidence`);
    }
    return;
  }

  // FACT / INFERENCE require a concrete value.
  if (typeof f.value !== "string" || f.value.length === 0) {
    errors.push(`field "${name}": ${basis} requires a non-empty string value`);
  } else if (f.value.length > MAX_FIELD_VALUE_LENGTH) {
    errors.push(`field "${name}": value exceeds ${MAX_FIELD_VALUE_LENGTH} characters`);
  }

  if (confidence === null) {
    errors.push(`field "${name}": ${basis} requires a numeric confidence`);
  }

  if (options.enumValues && typeof f.value === "string") {
    if (!(options.enumValues as readonly string[]).includes(f.value)) {
      errors.push(`field "${name}": value ${JSON.stringify(f.value)} is not a canonical enum value`);
    }
  }
}

export function validateLeadQualification(
  qualification: unknown,
): LeadQualificationValidationResult {
  const errors: string[] = [];

  if (!qualification || typeof qualification !== "object") {
    return { valid: false, errors: ["qualification: expected an object"] };
  }
  const q = qualification as Record<string, unknown>;

  // Missing required structural fields.
  const requiredFields = [
    "intent",
    "course",
    "exam",
    "destination",
    "studentType",
    "intake",
    "timeline",
    "budget",
    "urgency",
    "leadStage",
  ] as const;
  for (const field of requiredFields) {
    if (!(field in q)) {
      errors.push(`missing required field "${field}"`);
    }
  }

  validateField(errors, "intent", q.intent, { enumValues: ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"] });
  validateField(errors, "course", q.course);
  validateField(errors, "exam", q.exam);
  validateField(errors, "destination", q.destination);
  validateField(errors, "studentType", q.studentType);
  validateField(errors, "intake", q.intake);
  validateField(errors, "timeline", q.timeline);
  validateField(errors, "budget", q.budget);
  validateField(errors, "urgency", q.urgency, { enumValues: ["HIGH", "MEDIUM", "LOW"] });
  validateField(errors, "leadStage", q.leadStage, { enumValues: LEAD_STAGES });

  // Aggregate confidence: null OR 0..1.
  const confidence = q.confidence;
  if (confidence !== null) {
    if (typeof confidence !== "number" || Number.isNaN(confidence)) {
      errors.push("confidence must be a number or null");
    } else if (confidence < 0 || confidence > 1) {
      errors.push(`confidence out of 0..1 (got ${confidence})`);
    }
  }

  // Non-null UNKNOWN field without valid semantics (already enforced
  // per-field in validateField; kept here as an explicit aggregate check).
  for (const field of requiredFields) {
    const f = q[field] as Record<string, unknown> | undefined;
    if (f && f.basis === "UNKNOWN" && f.value != null) {
      errors.push(`field "${field}": non-null UNKNOWN field without valid semantics`);
    }
  }

  // Empty reason wherever INFERENCE is used.
  const usesInference = requiredFields.some((field) => {
    const f = q[field] as Record<string, unknown> | undefined;
    return f?.basis === "INFERENCE";
  });
  if (typeof q.reason !== "string" || q.reason.trim().length === 0) {
    errors.push(
      usesInference
        ? "reason must be non-empty where INFERENCE is used"
        : "reason must be a non-empty string",
    );
  } else if (q.reason.length > MAX_REASON_LENGTH) {
    errors.push(`reason exceeds ${MAX_REASON_LENGTH} characters`);
  }

  // Strings exceeding limits.
  if (typeof q.counsellorSummary !== "string" || q.counsellorSummary.length === 0) {
    errors.push("counsellorSummary must be a non-empty string");
  } else if (q.counsellorSummary.length > MAX_COUNSELLOR_SUMMARY) {
    errors.push(`counsellorSummary exceeds ${MAX_COUNSELLOR_SUMMARY} characters`);
  }

  if (typeof q.nextAction !== "string" || q.nextAction.length === 0) {
    errors.push("nextAction must be a non-empty string");
  } else if (q.nextAction.length > MAX_NEXT_ACTION_LENGTH) {
    errors.push(`nextAction exceeds ${MAX_NEXT_ACTION_LENGTH} characters`);
  }

  if (!Array.isArray(q.missingInfo)) {
    errors.push("missingInfo must be an array");
  } else {
    if (q.missingInfo.length > MAX_MISSING_INFO) {
      errors.push(`missingInfo exceeds ${MAX_MISSING_INFO} entries`);
    }
    for (const entry of q.missingInfo) {
      if (typeof entry !== "string" || entry.length === 0) {
        errors.push("missingInfo entries must be non-empty strings");
      } else if (entry.length > MAX_MISSING_INFO_LABEL_LENGTH) {
        errors.push(`missingInfo entry exceeds ${MAX_MISSING_INFO_LABEL_LENGTH} characters`);
      }
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}