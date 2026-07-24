// FILE: lib/assessment/scoreEngine.ts
//
// ─────────────────────────────────────────────────────────────────
// RESPONSIBILITY: "Give me answers → I return the complete result."
//
// No React. No WhatsApp. No database. No HTTP. No side effects.
// Pure TypeScript functions only.
//
// Reusable as-is for:
//   Germany Readiness Assessment
//   Canada PR Assessment
//   French Readiness Assessment
//   AI Counsellor scoring
//   CRM dashboard
//   PDF report generation
//   A/B test variants (swap rules file, keep engine)
//
// ─────────────────────────────────────────────────────────────────
// PUBLIC API
//   calculateScore(answers)    → ScoreBreakdown
//   buildFullResult(answers)   → AssessmentResult
//
// PRIVATE HELPERS (not exported)
//   calculateAcademicScore()
//   calculateEnglishScore()
//   calculateBudgetScore()
//   calculateTimelineScore()
//   calculateDocumentScore()
//   calculateDestinationScore()
//   calculateBacklogPenalty()
//   getResultTier()
//   getTopCountries()
//   getNextStep()
// ─────────────────────────────────────────────────────────────────
import { buildRecommendation } from "./recommendationEngine";
import {
  ACADEMIC_RULES,
  ENGLISH_RULES,
  BUDGET_RULES,
  TIMELINE_RULES,
  DOCUMENT_RULES,
  DESTINATION_RULES,
  BACKLOG_FLAGS,
  PURPOSE_FLAGS,
  LEVEL_FLAGS,
  STAGE_FLAGS,
  CHALLENGE_FLAGS,
  TIER_THRESHOLDS,
  TIER_CONFIG,
  COUNTRY_MATRIX,
  NEXT_STEP_MESSAGES,
  type ResultTier,
  type BudgetTier,
  type PurposeFlag,
} from "./assessmentRules";

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

/** Raw answers from the assessment form.
 *  Key = question id (1-based).
 *  Value = string (single-select) or string[] (multi-select). */
export type Answers = Record<number, string | string[]>;

/** Per-dimension score breakdown.
 *  All values are raw points before any penalty.
 *  `total` is the final clamped 0–100 score after penalty. */
export interface ScoreBreakdown {
  academic:    number; // max 30
  english:     number; // max 25
  budget:      number; // max 15
  timeline:    number; // max 15
  documents:   number; // max 10 (capped)
  destination: number; // max  5
  penalty:     number; // backlog deduction (always ≤ 0 as signed value)
  total:       number; // 0–100 clamped
}

/** Qualification flags derived from non-scoring questions.
 *  Used by ResultCard for recommendations — never affects the score. */
export interface AssessmentFlags {
  backlogs:  "clear" | "minor" | "moderate" | "serious";
  purpose:   PurposeFlag;
  level:     "diploma" | "bachelors" | "masters" | "mba" | "phd";
  stage:     "exploring" | "shortlisting" | "preparing" | "ready" | "needs-counselling";
  challenge: string; // challenge key from CHALLENGE_FLAGS
}

/** Everything ResultCard, LeadCaptureModal, PDF generator, or CRM needs. */
export interface AssessmentResult {
  score: number;
  breakdown: ScoreBreakdown;
  tier: ResultTier;
  tierConfig: typeof TIER_CONFIG[ResultTier];

  topCountries: string[];
  nextStep: string;
  flags: AssessmentFlags;
}
// Human-readable labels for each scoring dimension.
export const DIMENSION_LABELS: Record<keyof Omit<ScoreBreakdown, "total" | "penalty">, string> = {
  academic:    "Academic Score",
  english:     "English Proficiency",
  budget:      "Budget Readiness",
  timeline:    "Application Timeline",
  documents:   "Documents Ready",
  destination: "Country Clarity",
};

// Maximum possible points per dimension (for progress bars in ResultCard).
export const DIMENSION_MAX: Record<keyof Omit<ScoreBreakdown, "total" | "penalty">, number> = {
  academic:    30,
  english:     25,
  budget:      15,
  timeline:    15,
  documents:   10,
  destination:  5,
};

// ─────────────────────────────────────────────────────────────────
// ANSWER ACCESSORS
// Simple read helpers — used inside private calculators.
// ─────────────────────────────────────────────────────────────────

function single(answers: Answers, qId: number): string {
  const v = answers[qId];
  return typeof v === "string" ? v.trim() : "";
}

function multi(answers: Answers, qId: number): string[] {
  const v = answers[qId];
  return Array.isArray(v) ? v : [];
}

// ─────────────────────────────────────────────────────────────────
// PRIVATE HELPERS — one per scoring dimension
// Each returns a raw point value for that dimension only.
// ─────────────────────────────────────────────────────────────────

/** Q4 — academic percentage / CGPA band.
 *  Range: 0–30 */
function calculateAcademicScore(answers: Answers): number {
  return ACADEMIC_RULES[single(answers, 4)] ?? 0;
}

/** Q6 — merged English proficiency question (test + score combined).
 *  Range: 0–25 */
function calculateEnglishScore(answers: Answers): number {
  return ENGLISH_RULES[single(answers, 6)] ?? 0;
}

/** Q8 — total study budget (tuition + living).
 *  Range: 0–15 */
function calculateBudgetScore(answers: Answers): number {
  return BUDGET_RULES[single(answers, 8)] ?? 0;
}

/** Q9 — application timeline / urgency.
 *  Range: 0–15 */
function calculateTimelineScore(answers: Answers): number {
  return TIMELINE_RULES[single(answers, 9)] ?? 0;
}

/** Q10 — multi-select documents already prepared.
 *  Each document = 2 pts. Capped at 10.
 *  Range: 0–10 */
function calculateDocumentScore(answers: Answers): number {
  const selected = multi(answers, 10);
  const raw = selected.reduce(
    (sum, doc) => sum + (DOCUMENT_RULES[doc] ?? 0),
    0
  );
  return Math.min(raw, 10);
}

/** Q7 — destination clarity (student has chosen vs still undecided).
 *  Range: 0–5 */
function calculateDestinationScore(answers: Answers): number {
  return DESTINATION_RULES[single(answers, 7)] ?? 0;
}

/** Q5 — backlog penalty deducted after summing all dimensions.
 *  Returns a non-negative deduction value (caller subtracts it).
 *  clear = 0 · minor = 1 · moderate = 4 · serious = 8 */
function calculateBacklogPenalty(answers: Answers): number {
  const flag = BACKLOG_FLAGS[single(answers, 5)] ?? "clear";
  const MAP: Record<typeof flag, number> = {
    clear:    0,
    minor:    1,
    moderate: 4,
    serious:  8,
  };
  return MAP[flag];
}

// ─────────────────────────────────────────────────────────────────

/** Classifies a 0–100 score into a result tier. */
function getResultTier(score: number): ResultTier {
  if (score >= TIER_THRESHOLDS.READY)  return "READY";
  if (score >= TIER_THRESHOLDS.ALMOST) return "ALMOST";
  return "EARLY";
}

/** Returns top-3 country recommendations.
 *  If the student named a specific country in Q7, it is
 *  placed first regardless of the matrix result. */
function getTopCountries(answers: Answers): string[] {
  const purposeRaw  = single(answers, 1);
  const purpose     = PURPOSE_FLAGS[purposeRaw] ?? "unsure";
  const budgetRaw   = single(answers, 8);

  const budgetTier: BudgetTier =
    budgetRaw === "₹40 lakhs+" || budgetRaw === "₹25 – 40 lakhs" ? "high" :
    budgetRaw === "₹15 – 25 lakhs"                               ? "mid"  :
    "low";

  const matrixList  = COUNTRY_MATRIX[purpose][budgetTier];
  const studentPick = single(answers, 7);

  if (studentPick && studentPick !== "Not Decided Yet") {
    const rest = matrixList.filter((c) => c !== studentPick);
    return [studentPick, ...rest].slice(0, 3);
  }

  return matrixList.slice(0, 3);
}

/** Returns a single personalised next-step sentence
 *  based on Q12 biggest challenge. */
function getNextStep(answers: Answers): string {
  const raw = single(answers, 12);
  const key = CHALLENGE_FLAGS[raw] ?? "full-counselling";
  return NEXT_STEP_MESSAGES[key] ?? NEXT_STEP_MESSAGES["full-counselling"];
}

/** Derives all qualification flags from non-scoring questions. */
function buildFlags(answers: Answers): AssessmentFlags {
  return {
    backlogs:  BACKLOG_FLAGS[single(answers, 5)]  ?? "clear",
    purpose:   PURPOSE_FLAGS[single(answers, 1)]  ?? "unsure",
    level:     LEVEL_FLAGS[single(answers, 2)]    ?? "masters",
    stage:     STAGE_FLAGS[single(answers, 11)]   ?? "exploring",
    challenge: CHALLENGE_FLAGS[single(answers, 12)] ?? "full-counselling",
  };
}

// ─────────────────────────────────────────────────────────────────
// ===========================
// PUBLIC API
// ===========================
// ─────────────────────────────────────────────────────────────────

/**
 * calculateScore
 * ──────────────
 * Accepts raw answers, returns a fully-typed ScoreBreakdown.
 * All six dimensions are calculated independently then summed.
 * Backlog penalty is subtracted last and the result is clamped 0–100.
 *
 * @param answers - Record<questionId, string | string[]>
 * @returns ScoreBreakdown
 */
export function calculateScore(answers: Answers): ScoreBreakdown {
  const academic    = calculateAcademicScore(answers);
  const english     = calculateEnglishScore(answers);
  const budget      = calculateBudgetScore(answers);
  const timeline    = calculateTimelineScore(answers);
  const documents   = calculateDocumentScore(answers);
  const destination = calculateDestinationScore(answers);
  const penalty     = calculateBacklogPenalty(answers);

  const rawSum = academic + english + budget + timeline + documents + destination;
  const total  = Math.max(0, Math.min(100, rawSum - penalty));

  return {
    academic,
    english,
    budget,
    timeline,
    documents,
    destination,
    penalty,
    total,
  };
}

/**
 * buildFullResult
 * ───────────────
 * The single entry-point for all consumers of this engine.
 * Accepts raw answers, returns everything needed to render
 * a result card, trigger a CRM event, generate a PDF, or
 * feed an AI counsellor — with no further calculation needed.
 *
 * @param answers - Record<questionId, string | string[]>
 * @returns AssessmentResult
 */
export function buildFullResult(answers: Answers): AssessmentResult {
  const breakdown    = calculateScore(answers);
  const tier         = getResultTier(breakdown.total);
  const tierConfig   = TIER_CONFIG[tier];
  const topCountries = getTopCountries(answers);
  const nextStep     = getNextStep(answers);
  const flags        = buildFlags(answers);

  const recommendation =
    buildRecommendation(
        answers,
        breakdown
    );

return {

    score: breakdown.total,

    breakdown,

    tier,

    tierConfig,

    topCountries,

    nextStep,

    flags,

    ...recommendation

};
}