// FILE: lib/assessment/recommendationEngine.ts
//
// ─────────────────────────────────────────────────────────────────
// RESPONSIBILITY:
//   "Give me answers + score → I return personalised recommendations."
//
// No React. No WhatsApp. No database. No HTTP. No side effects.
// Pure TypeScript only.
//
// Reusable for:
//   Study Abroad Readiness Assessment result card
//   Germany / Canada PR / French Readiness Assessments
//   AI Counsellor recommendation layer
//   CRM auto-suggestions
//   PDF personalised report generation
//
// ─────────────────────────────────────────────────────────────────
// PUBLIC API
//   getTopCountries(answers, breakdown)    → CountryRecommendation[]
//   getRecommendedCourses(answers)         → CourseRecommendation[]
//   getActionPlan(answers, breakdown)      → ActionItem[]
//   getStrengths(answers, breakdown)       → Strength[]
//   getWeaknesses(answers, breakdown)      → Weakness[]
//   buildRecommendation(answers, breakdown)→ RecommendationReport
//
// PRIVATE HELPERS
//   resolvePurpose()
//   resolveBudgetTier()
//   resolveEnglishGap()
//   resolveBacklogFlag()
//   resolveDocumentGaps()
//   resolveStage()
//   scoreCountry()
// ─────────────────────────────────────────────────────────────────

import {
  COUNTRY_MATRIX,
  BACKLOG_FLAGS,
  PURPOSE_FLAGS,
  LEVEL_FLAGS,
  CHALLENGE_FLAGS,
  type BudgetTier,
  type PurposeFlag,
} from "./assessmentRules";

import type { Answers, ScoreBreakdown } from "./scoreEngine";

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface CountryRecommendation {
  name:      string;   // e.g. "Germany 🇩🇪"
  reasons:   string[]; // 2–3 why-this-country sentences
  match:     number;   // 0–100 match score for this student
  visaPath:  string;   // e.g. "Student Route + Graduate Route (2 yrs)"
  intakeNote: string;  // e.g. "Next intake: Jan 2026 — apply by Oct 2025"
}

export interface CourseRecommendation {
  id:       string;   // e.g. "ielts-coaching"
  title:    string;   // e.g. "IELTS Academic Coaching"
  reason:   string;   // why this course is recommended for this student
  priority: "urgent" | "recommended" | "optional";
  url:      string;
}

export interface ActionItem {
  order:    number;
  text:     string;   // e.g. "Improve IELTS to Band 7"
  category: "english" | "documents" | "university" | "visa" | "financial" | "counselling";
  urgent:   boolean;
}

export interface Strength {
  label:   string;   // e.g. "Strong Academics"
  detail:  string;   // one supporting sentence
  icon:    string;   // emoji
}

export interface Weakness {
  label:   string;   // e.g. "English score needs improvement"
  detail:  string;
  icon:    string;
  fixWith: string;   // e.g. "IELTS Coaching" — link to solution
}

export interface RecommendationReport {
  countries:   CountryRecommendation[];
  courses:     CourseRecommendation[];
  strengths:   Strength[];
  weaknesses:  Weakness[];
  actionPlan:  ActionItem[];
}

// ─────────────────────────────────────────────────────────────────
// PRIVATE HELPERS — answer accessors
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
// PRIVATE HELPERS — profile resolvers
// ─────────────────────────────────────────────────────────────────

function resolvePurpose(answers: Answers): PurposeFlag {
  return PURPOSE_FLAGS[single(answers, 1)] ?? "unsure";
}

function resolveBudgetTier(answers: Answers): BudgetTier {
  const b = single(answers, 8);
  if (b === "₹40 lakhs+" || b === "₹25 – 40 lakhs") return "high";
  if (b === "₹15 – 25 lakhs")                        return "mid";
  return "low";
}

function resolveBacklogFlag(answers: Answers) {
  return BACKLOG_FLAGS[single(answers, 5)] ?? "clear";
}

function resolveStage(answers: Answers) {
  const s = single(answers, 11);
  if (s.includes("Ready to apply"))     return "ready";
  if (s.includes("Preparing"))          return "preparing";
  if (s.includes("Shortlisting"))       return "shortlisting";
  if (s.includes("complete counselling")) return "needs-counselling";
  return "exploring";
}

/** Returns the student's English level as a numeric band (0–9 scale) */
function resolveEnglishBand(answers: Answers): number {
  const e = single(answers, 6);
  if (e.includes("7.0+"))        return 7.0;
  if (e.includes("6.5"))         return 6.5;
  if (e.includes("6.0"))         return 6.0;
  if (e.includes("5.5"))         return 5.5;
  if (e.includes("below IELTS")) return 5.0;
  return 0; // not taken
}

/** How many points below target band is the student?
 *  Returns positive number = gap, 0 = sufficient, negative = exceeds */
function resolveEnglishGap(
  answers:  Answers,
  country:  string
): number {
  const band   = resolveEnglishBand(answers);
  const targets: Record<string, number> = {
    "Canada 🇨🇦":          6.5,
    "Australia 🇦🇺":        6.5,
    "United Kingdom 🇬🇧":  6.5,
    "USA 🇺🇸":              6.5,
    "Germany 🇩🇪":          6.5,
    "Other Europe 🇪🇺":    6.0,
  };
  const target = targets[country] ?? 6.5;
  return parseFloat((target - band).toFixed(1));
}

/** Documents the student has NOT yet prepared */
function resolveDocumentGaps(answers: Answers): string[] {
  const have  = new Set(multi(answers, 10));
  const all   = [
    "Valid Passport",
    "Academic Transcripts / Marksheets",
    "English Test Scorecard (IELTS / PTE / etc.)",
    "Statement of Purpose (SOP)",
    "Letters of Recommendation (LOR)",
  ];
  if (have.has("None of these yet")) return all;
  return all.filter((d) => !have.has(d));
}

/** Returns a 0–100 match score for a given country vs student profile */
function scoreCountry(
  country:   string,
  answers:   Answers,
  breakdown: ScoreBreakdown
): number {
  const budget    = resolveBudgetTier(answers);
  const purpose   = resolvePurpose(answers);
  const englishGap = resolveEnglishGap(answers, country);
  const backlogs  = resolveBacklogFlag(answers);
  const chosen    = single(answers, 7); // student's own pick

  // Base: use matrix to determine if this country is recommended
  const matrixList = COUNTRY_MATRIX[purpose][budget];
  const matrixRank = matrixList.indexOf(country); // 0, 1, 2 or -1

  let score = 0;

  // Matrix position: 1st = 40pts, 2nd = 30pts, 3rd = 20pts, not in list = 10pts
  score += matrixRank === 0 ? 40 : matrixRank === 1 ? 30 : matrixRank === 2 ? 20 : 10;

  // Academic fit (from breakdown)
  score += Math.round((breakdown.academic / 30) * 20);

  // English readiness: no gap = 20pts, each 0.5 gap = -4pts
  score += Math.max(0, 20 - englishGap * 8);

  // Budget fit
  const budgetCountryMap: Record<string, BudgetTier[]> = {
    "Germany 🇩🇪":         ["low", "mid", "high"],
    "Other Europe 🇪🇺":    ["low", "mid"],
    "Canada 🇨🇦":          ["mid", "high"],
    "Australia 🇦🇺":        ["mid", "high"],
    "United Kingdom 🇬🇧":  ["mid", "high"],
    "USA 🇺🇸":              ["high"],
  };
  const fits = budgetCountryMap[country]?.includes(budget);
  score += fits ? 10 : 0;

  // Student's own choice gets +10 preference bonus
  if (chosen === country) score += 10;

  // Backlog penalty
  if (backlogs === "serious")  score -= 12;
  if (backlogs === "moderate") score -= 6;
  if (backlogs === "minor")    score -= 2;

  return Math.max(0, Math.min(100, score));
}

// ─────────────────────────────────────────────────────────────────
// ===========================
// PUBLIC API
// ===========================
// ─────────────────────────────────────────────────────────────────

/**
 * getTopCountries
 * ───────────────
 * Returns top 3 country recommendations with match score,
 * visa pathway, and 2–3 personalised reasons per country.
 *
 * @param answers   — raw assessment answers
 * @param breakdown — ScoreBreakdown from scoreEngine.calculateScore()
 */
export function getTopCountries(
  answers:   Answers,
  breakdown: ScoreBreakdown
): CountryRecommendation[] {
  const purpose     = resolvePurpose(answers);
  const budgetTier  = resolveBudgetTier(answers);
  const englishBand = resolveEnglishBand(answers);
  const chosen      = single(answers, 7);
  const level       = LEVEL_FLAGS[single(answers, 2)] ?? "masters";

  // Candidate pool: matrix list + student's own choice
  const matrixList = COUNTRY_MATRIX[purpose][budgetTier];
  const candidates = chosen && chosen !== "Not Decided Yet"
    ? [...new Set([chosen, ...matrixList])]
    : matrixList;

  const COUNTRY_DATA: Record<string, {
    reasons: (a: Answers, bd: ScoreBreakdown) => string[];
    visaPath:   string;
    intakeNote: string;
  }> = {
    "Canada 🇨🇦": {
      reasons: (a) => {
        const r = ["Canada accepts the most Indian students globally — 226,000+ study permits in 2024."];
        if (resolvePurpose(a) === "pr") r.push("Express Entry PR pathway is directly linked to your study program and work experience.");
        if (englishBand >= 6.0) r.push("Your current IELTS level meets most Canadian university requirements.");
        if (englishBand < 6.0)  r.push("After improving your IELTS to 6.5, you'll qualify for SDS (fast-track visa in ~20 days).");
        return r.slice(0, 3);
      },
      visaPath:   "Student Visa (SDS) + PGWP (up to 3 yrs work permit)",
      intakeNote: "Primary intakes: January & September — apply 4–6 months early",
    },
    "Australia 🇦🇺": {
      reasons: (a) => {
        const r = ["Australia offers a 2–4 year post-study work visa (Temporary Graduate Visa subclass 485)."];
        if (resolveBudgetTier(a) !== "low") r.push("Your budget covers tuition and living costs for most Australian universities outside Sydney/Melbourne.");
        r.push("Strong employment market for international graduates in engineering, healthcare, and IT.");
        return r.slice(0, 3);
      },
      visaPath:   "Student Visa (subclass 500) + Graduate Visa (subclass 485)",
      intakeNote: "Primary intakes: February & July — apply 3–5 months early",
    },
    "United Kingdom 🇬🇧": {
      reasons: () => {
        const r = ["1-year master's degrees — fastest route to a postgraduate qualification globally."];
        r.push("Graduate Route visa allows 2 years of post-study work (if applied before 31 Dec 2026).");
        if (englishBand >= 6.5) r.push("Your English score already meets most UK university requirements.");
        return r.slice(0, 3);
      },
      visaPath:   "Student Route Visa + Graduate Route (2 yrs, apply before Dec 2026)",
      intakeNote: "Primary intake: September — apply January to May",
    },
    "USA 🇺🇸": {
      reasons: () => [
        "World's top-ranked universities — strong for research, MBA, and STEM programs.",
        "OPT (Optional Practical Training) allows 1–3 years of work after graduation.",
        "Largest international student job market — strong alumni networks across industries.",
      ],
      visaPath:   "F-1 Student Visa + OPT (1 yr) + STEM OPT extension (3 yrs for STEM)",
      intakeNote: "Primary intakes: August/September & January — apply 9–12 months early",
    },
    "Germany 🇩🇪": {
      reasons: (a) => {
        const r = ["Many German public universities charge zero or minimal tuition (€0–500/semester)."];
        if (resolveBudgetTier(a) === "low") r.push("Germany is the most affordable English-medium study destination for Indian students.");
        r.push("Post-study job-seeker visa (18 months) and long-term PR pathway after 2 years of work.");
        return r.slice(0, 3);
      },
      visaPath:   "Student Visa (Schengen) + Job Seeker Visa (18 months) + EU Blue Card",
      intakeNote: "Primary intakes: October (Winter) & April (Summer) — apply 3–4 months early",
    },
    "Other Europe 🇪🇺": {
      reasons: () => [
        "Countries like Ireland, France, Netherlands, and Sweden offer affordable, English-medium master's degrees.",
        "EU study opens access to work across 27 EU member states after graduation.",
        "Lower competition for admissions compared to UK/Canada/Australia.",
      ],
      visaPath:   "Varies by country — Ireland, France, Netherlands most common for Indian students",
      intakeNote: "Intakes vary by country — typically September; apply 4–6 months early",
    },
  };

  const ranked = candidates
    .map((country) => {
      const data  = COUNTRY_DATA[country];
      if (!data) return null;
      const match = scoreCountry(country, answers, breakdown);
      return {
        name:       country,
        reasons:    data.reasons(answers, breakdown),
        match,
        visaPath:   data.visaPath,
        intakeNote: data.intakeNote,
      } satisfies CountryRecommendation;
    })
    .filter((c): c is CountryRecommendation => c !== null)
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);

  return ranked;
}

/**
 * getRecommendedCourses
 * ─────────────────────
 * Returns 2–5 course recommendations based on:
 *   - Target country (determines visa English test type)
 *   - English band (determines urgency of coaching)
 *   - Purpose (PR → French; study → IELTS Academic; work → PTE)
 *   - Missing documents (SOP missing → SOP writing course)
 *
 * @param answers — raw assessment answers
 */
export function getRecommendedCourses(
  answers: Answers
): CourseRecommendation[] {
  const englishBand = resolveEnglishBand(answers);
  const country     = single(answers, 7);
  const purpose     = resolvePurpose(answers);
  const docs        = new Set(multi(answers, 10));
  const challenge   = CHALLENGE_FLAGS[single(answers, 12)] ?? "";
  const courses: CourseRecommendation[] = [];

  // ── English test coaching ──────────────────────────────────────
  const needsEnglish = englishBand < 6.5 || englishBand === 0;

  if (needsEnglish) {
    // Canada → IELTS General (PR) or IELTS Academic (study)
    if (country.includes("Canada") && purpose === "pr") {
      courses.push({
        id:       "ielts-general",
        title:    "IELTS General Training",
        reason:   "Canada Express Entry PR requires IELTS General — CLB 7+ in all bands.",
        priority: "urgent",
        url:      "/test-prep/ielts-general",
      });
    } else if (country.includes("United Kingdom")) {
      courses.push({
        id:       "ielts-ukvi",
        title:    "IELTS for UKVI (Academic)",
        reason:   "UK Student visa requires IELTS for UKVI specifically — standard IELTS Academic is not accepted for the visa itself.",
        priority: "urgent",
        url:      "/test-prep/ielts-online",
      });
    } else if (country.includes("Australia") || country.includes("Canada")) {
      courses.push({
        id:       "pte",
        title:    "PTE Academic Coaching",
        reason:   "PTE Academic is accepted for Australia and Canada SDS — results in 48 hours vs 13 days for IELTS.",
        priority: englishBand < 5.5 ? "urgent" : "recommended",
        url:      "/test-prep/pte",
      });
    } else {
      courses.push({
        id:       "ielts-academic",
        title:    "IELTS Academic Coaching",
        reason:   `Your current English level (${englishBand === 0 ? "not tested" : `Band ${englishBand}`}) needs to reach Band 6.5+ for ${country || "your target country"}.`,
        priority: englishBand < 5.5 ? "urgent" : "recommended",
        url:      "/test-prep/ielts-online",
      });
    }
  }

  // ── Duolingo — fast, cheap, good for USA ──────────────────────
  if (country.includes("USA") && (englishBand < 6.5 || englishBand === 0)) {
    courses.push({
      id:       "duolingo",
      title:    "Duolingo English Test Coaching",
      reason:   "DET is accepted by 5,500+ US universities, costs ~₹6,000, and gives results in 48 hours.",
      priority: "recommended",
      url:      "/test-prep/duolingo",
    });
  }

  // ── French — Canada PR CRS points ─────────────────────────────
  if (
    (country.includes("Canada") || country.includes("France") || country.includes("Europe")) &&
    (purpose === "pr" || purpose === "study")
  ) {
    courses.push({
      id:       "french",
      title:    "French Language Course (A1–B2 + TEF Canada)",
      reason:   country.includes("Canada")
        ? "French TEF score adds up to 50 CRS points for Canada Express Entry — potentially worth hundreds of thousands of rupees in faster PR."
        : "French is essential for study in France and improves your EU mobility after graduation.",
      priority: country.includes("Canada") && purpose === "pr" ? "urgent" : "recommended",
      url:      "/language/french",
    });
  }

  // ── German — Germany / Europe ─────────────────────────────────
  if (country.includes("Germany") || country.includes("Europe")) {
    courses.push({
      id:       "german",
      title:    "German Language Course (A1–B2)",
      reason:   "German A2/B1 level significantly improves your social integration and job prospects in Germany after graduation.",
      priority: "recommended",
      url:      "/language/german",
    });
  }

  // ── Spoken English — confidence gap ───────────────────────────
  if (
    englishBand < 6.0 ||
    challenge === "english-prep" ||
    !docs.has("English Test Scorecard (IELTS / PTE / etc.)")
  ) {
    courses.push({
      id:       "spoken-english",
      title:    "Spoken English + Communication",
      reason:   "Building spoken fluency before your IELTS / PTE exam significantly improves your Speaking and Listening scores.",
      priority: "optional",
      url:      "/language/spoken-english",
    });
  }

  // ── GRE — research / PhD ──────────────────────────────────────
  if (purpose === "research" || single(answers, 2).includes("PhD")) {
    courses.push({
      id:       "gre",
      title:    "GRE Coaching",
      reason:   "Most PhD and research programmes in the USA, Canada, and UK require a GRE score.",
      priority: "urgent",
      url:      "/test-prep/gre",
    });
  }

  // ── GMAT — MBA ────────────────────────────────────────────────
  if (single(answers, 2).includes("MBA")) {
    courses.push({
      id:       "gmat",
      title:    "GMAT Coaching",
      reason:   "Top business schools in the USA, UK, Canada, and Australia require a GMAT score for MBA admissions.",
      priority: "urgent",
      url:      "/test-prep/gmat",
    });
  }

  // Deduplicate by id and return max 5
  const seen = new Set<string>();
  return courses
    .filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; })
    .sort((a, b) => {
      const order = { urgent: 0, recommended: 1, optional: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 5);
}

/**
 * getActionPlan
 * ─────────────
 * Returns 4–6 ordered, personalised action items.
 * Each item has a category for icon mapping in the UI.
 *
 * @param answers   — raw assessment answers
 * @param breakdown — ScoreBreakdown from scoreEngine
 */
export function getActionPlan(
  answers:   Answers,
  breakdown: ScoreBreakdown
): ActionItem[] {
  const englishBand = resolveEnglishBand(answers);
  const docGaps     = resolveDocumentGaps(answers);
  const stage       = resolveStage(answers);
  const country     = single(answers, 7);
  const purpose     = resolvePurpose(answers);
  const backlogs    = resolveBacklogFlag(answers);
  const items: ActionItem[] = [];
  let order = 1;

  // 1. English — always first if gap exists
  if (englishBand < 6.5) {
    const target = englishBand < 5.5 ? "Band 6.5" : "Band 7.0";
    items.push({
      order:    order++,
      text:     `Improve IELTS / PTE to ${target} (current: ${englishBand === 0 ? "not taken" : `Band ${englishBand}`})`,
      category: "english",
      urgent:   true,
    });
  }

  // 2. English test booking — if not yet tested
  if (englishBand === 0) {
    items.push({
      order:    order++,
      text:     "Book your IELTS / PTE test date (takes 2–4 weeks from booking to exam)",
      category: "english",
      urgent:   true,
    });
  }

  // 3. Passport — if missing
  if (docGaps.includes("Valid Passport")) {
    items.push({
      order:    order++,
      text:     "Apply for passport immediately — takes 4–8 weeks (Tatkal: 1–2 weeks)",
      category: "documents",
      urgent:   true,
    });
  }

  // 4. Transcripts — if missing
  if (docGaps.includes("Academic Transcripts / Marksheets")) {
    items.push({
      order:    order++,
      text:     "Collect attested academic transcripts from your institution",
      category: "documents",
      urgent:   false,
    });
  }

  // 5. Backlog clearance
  if (backlogs === "moderate" || backlogs === "serious") {
    items.push({
      order:    order++,
      text:     "Clear outstanding academic backlogs — most universities allow max 2 backlogs",
      category: "documents",
      urgent:   backlogs === "serious",
    });
  }

  // 6. University shortlisting
  if (stage === "exploring" || stage === "shortlisting" || stage === "needs-counselling") {
    items.push({
      order:    order++,
      text:     `Shortlist 5–8 universities in ${country !== "Not Decided Yet" ? country : "your target country"} based on your profile`,
      category: "university",
      urgent:   false,
    });
  }

  // 7. SOP — if missing
  if (docGaps.includes("Statement of Purpose (SOP)")) {
    items.push({
      order:    order++,
      text:     "Write and get your Statement of Purpose (SOP) reviewed",
      category: "documents",
      urgent:   false,
    });
  }

  // 8. LOR — if missing
  if (docGaps.includes("Letters of Recommendation (LOR)")) {
    items.push({
      order:    order++,
      text:     "Request Letters of Recommendation (LOR) from professors or employers",
      category: "documents",
      urgent:   false,
    });
  }

  // 9. Country-specific steps
  if (country.includes("Germany")) {
    items.push({
      order:    order++,
      text:     "Open a blocked account (€11,904) for Germany student visa",
      category: "financial",
      urgent:   false,
    });
  }

  if (country.includes("Canada") && purpose === "pr") {
    items.push({
      order:    order++,
      text:     "Prepare GIC (Guaranteed Investment Certificate ~CAD 20,635) for Canada SDS",
      category: "financial",
      urgent:   false,
    });
  }

  if (country.includes("United Kingdom")) {
    items.push({
      order:    order++,
      text:     "Apply before Dec 2026 to secure the 2-year Graduate Route visa (drops to 18 months from Jan 2027)",
      category: "visa",
      urgent:   true,
    });
  }

  // 10. French for Canada PR
  if (country.includes("Canada") && purpose === "pr") {
    items.push({
      order:    order++,
      text:     "Start French Language coaching — TEF Canada score adds up to 50 CRS points for Express Entry",
      category: "english",
      urgent:   false,
    });
  }

  // 11. Apply / Visa
  if (stage === "preparing" || stage === "ready") {
    items.push({
      order:    order++,
      text:     "Submit university applications — most require 3–6 months processing",
      category: "university",
      urgent:   false,
    });
  }

  // 12. Always end with counselling CTA
  items.push({
    order:    order++,
    text:     "Book a free 1:1 counselling session with ANU Education to finalise your roadmap",
    category: "counselling",
    urgent:   false,
  });

  // Return top 6, sorted by urgency then order
  return items
    .sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return a.order - b.order;
    })
    .slice(0, 6)
    .map((item, i) => ({ ...item, order: i + 1 }));
}

/**
 * getStrengths
 * ────────────
 * Returns 2–4 personalised strengths based on score breakdown.
 *
 * @param answers   — raw assessment answers
 * @param breakdown — ScoreBreakdown from scoreEngine
 */
export function getStrengths(
  answers:   Answers,
  breakdown: ScoreBreakdown
): Strength[] {
  const strengths: Strength[] = [];

  // Academic
  if (breakdown.academic >= 22) {
    strengths.push({
      label:  "Strong Academic Profile",
      detail: `Your academic score (${single(answers, 4)}) meets or exceeds the entry requirements of most universities in your target country.`,
      icon:   "🎓",
    });
  }

  // English
  if (breakdown.english >= 18) {
    strengths.push({
      label:  "Good English Proficiency",
      detail: `Your English score (${single(answers, 6)}) is above the minimum requirement for most universities and student visa applications.`,
      icon:   "🗣️",
    });
  }

  // Budget
  if (breakdown.budget >= 9) {
    strengths.push({
      label:  "Sufficient Budget",
      detail: `Your budget (${single(answers, 8)}) covers tuition and living costs in your target country without requiring a student loan for basic expenses.`,
      icon:   "💰",
    });
  }

  // Timeline
  if (breakdown.timeline >= 12) {
    strengths.push({
      label:  "Ready Timeline",
      detail: `You want to start ${single(answers, 9).toLowerCase()} — this gives enough time to prepare documents, take language tests, and receive a university offer.`,
      icon:   "📅",
    });
  }

  // Documents
  if (breakdown.documents >= 6) {
    const count = multi(answers, 10).filter((d) => d !== "None of these yet").length;
    strengths.push({
      label:  `${count} Key Documents Ready`,
      detail: "Having core documents prepared already puts you ahead of most applicants at this stage.",
      icon:   "📁",
    });
  }

  // Clear on backlogs
  if (resolveBacklogFlag(answers) === "clear") {
    strengths.push({
      label:  "Clean Academic Record",
      detail: "No backlogs or arrears — this meets the eligibility requirements of universities across all your target countries.",
      icon:   "✅",
    });
  }

  // Destination clarity
  if (single(answers, 7) !== "Not Decided Yet") {
    strengths.push({
      label:  "Clear Destination in Mind",
      detail: `You've identified ${single(answers, 7)} as your target — this helps focus your university shortlisting, visa planning, and language preparation.`,
      icon:   "🌍",
    });
  }

  return strengths.slice(0, 4);
}

/**
 * getWeaknesses
 * ─────────────
 * Returns 2–4 personalised weaknesses with fix suggestions.
 *
 * @param answers   — raw assessment answers
 * @param breakdown — ScoreBreakdown from scoreEngine
 */
export function getWeaknesses(
  answers:   Answers,
  breakdown: ScoreBreakdown
): Weakness[] {
  const weaknesses: Weakness[] = [];
  const docGaps = resolveDocumentGaps(answers);
  const englishBand = resolveEnglishBand(answers);

  // English gap
  if (breakdown.english < 14) {
    weaknesses.push({
      label:   englishBand === 0
        ? "English Test Not Yet Taken"
        : `English Score Below Target (Band ${englishBand})`,
      detail:  englishBand === 0
        ? "Most universities and student visas require a minimum IELTS/PTE score. This is the single biggest blocker to your application right now."
        : `You need Band 6.5–7.0 for most universities in your target country. Your current level (Band ${englishBand}) needs improvement.`,
      icon:    "⚠️",
      fixWith: "IELTS / PTE Coaching",
    });
  }

  // Academic
  if (breakdown.academic < 15) {
    weaknesses.push({
      label:   "Academic Score Below Average",
      detail:  `Your academic score (${single(answers, 4)}) may limit your options at competitive universities. Focus on universities with flexible entry requirements or foundation programs.`,
      icon:    "📊",
      fixWith: "Free University Shortlisting Counselling",
    });
  }

  // Budget gap
  if (breakdown.budget < 5) {
    weaknesses.push({
      label:   "Budget May Be a Constraint",
      detail:  "Your stated budget is below average for most English-speaking countries. Germany and select European countries with free/low tuition may be a better fit.",
      icon:    "💸",
      fixWith: "Education Loan + Scholarship Guidance",
    });
  }

  // Backlogs
  const backlogs = resolveBacklogFlag(answers);
  if (backlogs === "moderate" || backlogs === "serious") {
    weaknesses.push({
      label:   backlogs === "serious"
        ? "Significant Backlogs — Admission Risk"
        : "Academic Backlogs Present",
      detail:  backlogs === "serious"
        ? "More than 5 backlogs is a red flag for most universities. A counsellor can help identify universities with flexible backlog policies or suggest a foundation year."
        : "1–5 backlogs may restrict you to certain universities. Clearing pending backlogs before applying significantly improves your shortlist.",
      icon:    "🚧",
      fixWith: "Free Counselling — Backlog-Friendly University Guidance",
    });
  }

  // Missing passport
  if (docGaps.includes("Valid Passport")) {
    weaknesses.push({
      label:   "No Passport Yet",
      detail:  "A valid passport is required before any university application or visa. Apply immediately — even Tatkal takes 1–2 weeks.",
      icon:    "🛂",
      fixWith: "Apply for Passport",
    });
  }

  // Missing SOP
  if (docGaps.includes("Statement of Purpose (SOP)")) {
    weaknesses.push({
      label:   "SOP Not Yet Prepared",
      detail:  "The Statement of Purpose is one of the most important admission documents. A weak or generic SOP is a common reason for both rejection and visa refusal.",
      icon:    "✍️",
      fixWith: "SOP Writing Service — ANU Education",
    });
  }

  // No country decided
  if (single(answers, 7) === "Not Decided Yet") {
    weaknesses.push({
      label:   "No Target Country Selected",
      detail:  "Without a target country, you cannot prepare the right English test, plan your budget accurately, or research university deadlines.",
      icon:    "🌍",
      fixWith: "Free Country Selection Counselling",
    });
  }

  return weaknesses.slice(0, 4);
}

/**
 * buildRecommendation
 * ───────────────────
 * The single entry-point for all consumers of this engine.
 * Accepts answers + score breakdown, returns everything
 * ResultCard, PDF generator, CRM, or AI Counsellor needs.
 *
 * @param answers   — Record<questionId, string | string[]>
 * @param breakdown — ScoreBreakdown from scoreEngine.calculateScore()
 * @returns RecommendationReport
 */
export function buildRecommendation(
  answers:   Answers,
  breakdown: ScoreBreakdown
): RecommendationReport {
  return {
    countries:  getTopCountries(answers, breakdown),
    courses:    getRecommendedCourses(answers),
    strengths:  getStrengths(answers, breakdown),
    weaknesses: getWeaknesses(answers, breakdown),
    actionPlan: getActionPlan(answers, breakdown),
  };
}