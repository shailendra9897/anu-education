// FILE: lib/assessment/types.ts
//
// ─────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for all assessment types.
//
// All engine files (scoreEngine, recommendationEngine,
// SearchEngine, assessmentRules) import FROM here.
// Nothing in this file imports from any engine file.
// No functions. No logic. Types only.
//
// Sections:
//   1. Primitives & Enums
//   2. Assessment Input  → AssessmentAnswer, Answers
//   3. Score Layer       → ScoreBreakdown
//   4. Recommendation    → RecommendationResult (CountryRecommendation, etc.)
//   5. Combined Output   → AssessmentResult
//   6. Search Layer      → SearchOptions, SearchResult, Searchable*
//   7. UI / Report       → ResultTier config, dimension metadata
// ─────────────────────────────────────────────────────────────────


// ═════════════════════════════════════════════════════════════════
// 1. PRIMITIVES & ENUMS
// ═════════════════════════════════════════════════════════════════

/** Study purpose — drives country matrix and course recommendations */
export type PurposeFlag =
  | "study"      // Higher Education / University Degree
  | "pr"         // PR Pathway
  | "work"       // Job Opportunities
  | "research"   // Research / PhD
  | "unsure";

/** Budget tier — derived from Q8 answer */
export type BudgetTier = "low" | "mid" | "high";

/** Academic backlog severity */
export type BacklogFlag = "clear" | "minor" | "moderate" | "serious";

/** Level of study from Q2 */
export type StudyLevel = "diploma" | "bachelors" | "masters" | "mba" | "phd";

/** Application stage from Q11 */
export type ApplicationStage =
  | "exploring"
  | "shortlisting"
  | "preparing"
  | "ready"
  | "needs-counselling";

/** Three result tiers based on final score */
export type ResultTier = "READY" | "ALMOST" | "EARLY";

/** Course recommendation urgency */
export type CoursePriority = "urgent" | "recommended" | "optional";

/** Action plan item category — used for icon mapping in UI */
export type ActionCategory =
  | "english"
  | "documents"
  | "university"
  | "visa"
  | "financial"
  | "counselling";


// ═════════════════════════════════════════════════════════════════
// 2. ASSESSMENT INPUT
// ═════════════════════════════════════════════════════════════════

/**
 * AssessmentAnswer
 * ────────────────
 * A single answer to one assessment question.
 * Supports single-select (string) and multi-select (string[]).
 *
 * @example
 *   { questionId: 6, value: "IELTS 6.5 / PTE 58 / Equivalent" }
 *   { questionId: 10, value: ["Valid Passport", "Academic Transcripts"] }
 */
export interface AssessmentAnswer {
  questionId: number;
  value:      string | string[];
}

/**
 * Answers
 * ───────
 * Flat map of all student answers — the primary input shape
 * for all engine functions.
 * Key = question id (1-based integer).
 * Value = string (single-select) or string[] (multi-select).
 *
 * @example
 *   {
 *     1:  "Higher Education / University Degree",
 *     6:  "IELTS 6.5 / PTE 58 / Equivalent",
 *     10: ["Valid Passport", "Academic Transcripts / Marksheets"],
 *   }
 */
export type Answers = Record<number, string | string[]>;

/** Convert AssessmentAnswer[] → Answers map */
export function answersFromArray(arr: AssessmentAnswer[]): Answers {
  return Object.fromEntries(arr.map((a) => [a.questionId, a.value]));
}

/** Convert Answers map → AssessmentAnswer[] (e.g. for API serialisation) */
export function answersToArray(answers: Answers): AssessmentAnswer[] {
  return Object.entries(answers).map(([id, value]) => ({
    questionId: Number(id),
    value,
  }));
}


// ═════════════════════════════════════════════════════════════════
// 3. SCORE LAYER
// ═════════════════════════════════════════════════════════════════

/**
 * ScoreBreakdown
 * ──────────────
 * Per-dimension scores returned by scoreEngine.calculateScore().
 * All dimension values are raw points (before penalty).
 * `penalty` is the backlog deduction (positive number, subtracted).
 * `total` is the final 0–100 clamped score.
 */
export interface ScoreBreakdown {
  academic:    number; // Q4  — max 30
  english:     number; // Q6  — max 25
  budget:      number; // Q8  — max 15
  timeline:    number; // Q9  — max 15
  documents:   number; // Q10 — max 10 (capped)
  destination: number; // Q7  — max  5
  penalty:     number; // backlog deduction — always a positive value, subtracted
  total:       number; // 0–100 final score
}

/** Maximum points per scoring dimension — for progress bars in UI */
export const SCORE_DIMENSION_MAX: Record<
  keyof Omit<ScoreBreakdown, "total" | "penalty">,
  number
> = {
  academic:    30,
  english:     25,
  budget:      15,
  timeline:    15,
  documents:   10,
  destination:  5,
};

/** Human-readable label per dimension — for result card display */
export const SCORE_DIMENSION_LABELS: Record<
  keyof Omit<ScoreBreakdown, "total" | "penalty">,
  string
> = {
  academic:    "Academic Score",
  english:     "English Proficiency",
  budget:      "Budget Readiness",
  timeline:    "Application Timeline",
  documents:   "Documents Ready",
  destination: "Country Clarity",
};

/** Qualification flags from non-scoring questions — never affects score */
export interface AssessmentFlags {
  backlogs:  BacklogFlag;
  purpose:   PurposeFlag;
  level:     StudyLevel;
  stage:     ApplicationStage;
  challenge: string; // CHALLENGE_FLAGS key e.g. "english-prep"
}


// ═════════════════════════════════════════════════════════════════
// 4. RECOMMENDATION LAYER
// ═════════════════════════════════════════════════════════════════

/** One recommended country with match score and reasons */
export interface CountryRecommendation {
  name:        string;   // e.g. "Germany 🇩🇪"
  reasons:     string[]; // 2–3 personalised why-this-country sentences
  match:       number;   // 0–100 match score for this student
  visaPath:    string;   // e.g. "Student Route + Graduate Route (2 yrs)"
  intakeNote:  string;   // e.g. "Next intake: Jan 2026"
}

/** One recommended course with priority and link */
export interface CourseRecommendation {
  id:       string;         // e.g. "ielts-coaching"
  title:    string;         // e.g. "IELTS Academic Coaching"
  reason:   string;         // personalised explanation for this student
  priority: CoursePriority;
  url:      string;         // internal page path
}

/** One step in the personalised action plan */
export interface ActionItem {
  order:    number;         // 1-based display order
  text:     string;         // e.g. "Improve IELTS to Band 7"
  category: ActionCategory; // for icon mapping in UI
  urgent:   boolean;        // red/amber badge in UI
}

/** One identified strength */
export interface Strength {
  label:  string; // e.g. "Strong Academics"
  detail: string; // one supporting sentence
  icon:   string; // emoji
}

/** One identified weakness with a fix suggestion */
export interface Weakness {
  label:   string; // e.g. "English score needs improvement"
  detail:  string;
  icon:    string; // emoji
  fixWith: string; // e.g. "IELTS Coaching" — points to a solution
}

/**
 * RecommendationResult
 * ────────────────────
 * Full output of recommendationEngine.buildRecommendation().
 * Everything ResultCard, PDF generator, CRM, or AI Counsellor needs
 * for the recommendation layer — separate from the score itself.
 */
export interface RecommendationResult {
  countries:  CountryRecommendation[];
  courses:    CourseRecommendation[];
  strengths:  Strength[];
  weaknesses: Weakness[];
  actionPlan: ActionItem[];
}


// ═════════════════════════════════════════════════════════════════
// 5. COMBINED OUTPUT
// ═════════════════════════════════════════════════════════════════

/**
 * AssessmentResult
 * ────────────────
 * The complete output of a finished assessment.
 * Combines score (from scoreEngine) + recommendation (from
 * recommendationEngine) into one serialisable object.
 *
 * This is what gets:
 *   - Rendered by ResultCard.tsx
 *   - Stored in the CRM / database
 *   - Sent to the AI Counsellor
 *   - Used to generate a PDF report
 *   - Passed to LeadCaptureModal as context
 */
export interface AssessmentResult {
  // ── Identity ──────────────────────────────────────────────────
  id?:          string;    // optional — assigned when saved to DB
  completedAt?: string;    // ISO timestamp — assigned on completion
  source?:      string;    // e.g. "study-abroad-readiness" — for multi-assessment CRM

  // ── Input ─────────────────────────────────────────────────────
  answers:      Answers;

  // ── Score layer ───────────────────────────────────────────────
  score:        number;         // 0–100 final score
  breakdown:    ScoreBreakdown;
  tier:         ResultTier;
  tierConfig:   TierConfig;     // label, colour, CTA text
  flags:        AssessmentFlags;

  // ── Recommendation layer ──────────────────────────────────────
  recommendation: RecommendationResult;

  // ── Legacy flattened aliases (kept for backwards compat) ──────
  /** @deprecated — use recommendation.countries */
  topCountries: string[];
  /** @deprecated — use recommendation.actionPlan[0].text */
  nextStep:     string;
}

/**
 * TierConfig
 * ──────────
 * UI configuration for a result tier — used by ResultCard.
 */
export interface TierConfig {
  label:        string;  // e.g. "Ready to Apply"
  emoji:        string;  // e.g. "🟢"
  tagline:      string;  // one-line summary shown under the score
  colour:       string;  // hex — for inline styles in ResultCard
  ctaPrimary:   string;  // primary button label
  ctaSecondary: string;  // secondary button label
}


// ═════════════════════════════════════════════════════════════════
// 6. SEARCH LAYER
// ═════════════════════════════════════════════════════════════════

export interface SearchOptions {
  minScore?:  number;   // 0–1 minimum relevance. Default 0.3
  limit?:     number;   // max results. Default 10
  highlight?: boolean;  // include highlighted excerpts. Default true
  fields?:    string[]; // restrict search to specific fields
}

export interface SearchResult<T> {
  item:     T;
  score:    number;    // 0–1 relevance score
  matches:  string[];  // which fields matched
  excerpt?: string;    // highlighted snippet (** markers)
}

export interface SearchableQuestion {
  id:       number;
  text:     string;
  subtext?: string;
  options:  string[];
  emoji:    string;
}

export interface SearchableCourse {
  id:     string;
  title:  string;
  desc:   string;
  tags:   string[];
  url:    string;
  price?: string;
}

export interface SearchableCountry {
  id:      string;
  name:    string;
  aliases: string[];
  tags:    string[];
  url:     string;
}

export interface SearchableFAQ {
  id:       string;
  question: string;
  answer:   string;
  tags:     string[];
}

export interface SearchIndex {
  questions?: SearchableQuestion[];
  courses?:   SearchableCourse[];
  countries?: SearchableCountry[];
  faqs?:      SearchableFAQ[];
}

export type QuestionSearchResult = SearchResult<SearchableQuestion>;
export type CourseSearchResult   = SearchResult<SearchableCourse>;
export type CountrySearchResult  = SearchResult<SearchableCountry>;
export type FAQSearchResult      = SearchResult<SearchableFAQ>;

export interface UniversalSearchResult {
  type:     "question" | "course" | "country" | "faq";
  score:    number;
  item:     SearchableQuestion | SearchableCourse | SearchableCountry | SearchableFAQ;
  matches:  string[];
  excerpt?: string;
}


// ═════════════════════════════════════════════════════════════════
// 7. UTILITY TYPES
// ═════════════════════════════════════════════════════════════════

/**
 * PartialAssessmentResult
 * ───────────────────────
 * Used while the student is mid-assessment (auto-save, resume later).
 * Everything is optional except answers.
 */
export type PartialAssessmentResult = Pick<AssessmentResult, "answers"> &
  Partial<Omit<AssessmentResult, "answers">>;

/**
 * AssessmentSummary
 * ─────────────────
 * Lightweight version for CRM list views — no full breakdown.
 */
export interface AssessmentSummary {
  id:          string;
  completedAt: string;
  score:       number;
  tier:        ResultTier;
  topCountry:  string;
  source:      string;
}

/**
 * LeadContext
 * ───────────
 * Passed to LeadCaptureModal so it can pre-fill fields
 * and personalise the WhatsApp message.
 */
export interface LeadContext {
  score:       number;
  tier:        ResultTier;
  topCountry:  string;
  topCourse:   string;
  challenge:   string;
}
