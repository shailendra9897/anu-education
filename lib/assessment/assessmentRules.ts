// FILE: lib/assessment/assessmentRules.ts
//
// ─────────────────────────────────────────────────────────────────
// PURE DATA — no functions, no calculations, no imports.
// All scoring tables used by scoreEngine.ts live here.
//
// Each table maps an answer string (exactly as it appears in
// QuestionCard QUESTIONS options) → point value.
//
// Maximum possible raw score across all tables:
//   Academic    30
//   English     25
//   Budget      15
//   Timeline    15
//   Documents   10
//   Destination  5
//   ─────────────
//   TOTAL      100  ← already normalised, no division needed
//
// Non-scoring questions (purpose, level, qualification,
// backlogs, application status, biggest challenge) contribute
// to RESULT_LABELS / country recommendations in scoreEngine,
// not to the numeric score. Their weights live in BONUS_RULES.
// ─────────────────────────────────────────────────────────────────

// ── 1. ACADEMIC SCORE ─────────────────────────────────────────────
// Q4 in QuestionCard — university eligibility signal
export const ACADEMIC_RULES: Record<string, number> = {
  "80% and above":   30,
  "70% – 79%":       27,
  "60% – 69%":       22,
  "50% – 59%":       15,
  "Below 50%":        8,
};

// ── 2. ENGLISH PROFICIENCY ────────────────────────────────────────
// Q6 — merged English test + score question
export const ENGLISH_RULES: Record<string, number> = {
  "IELTS 7.0+ / PTE 65+ / Equivalent":          25,
  "IELTS 6.5 / PTE 58 / Equivalent":            18,
  "IELTS 6.0 / PTE 50 / Equivalent":            14,
  "IELTS 5.5 / PTE 42 / Equivalent":            10,
  "Taken a test — below IELTS 5.5 equivalent":   6,
  "Not taken any English test yet":               3,
};

// ── 3. BUDGET ─────────────────────────────────────────────────────
// Q8 — total study budget (tuition + living)
export const BUDGET_RULES: Record<string, number> = {
  "₹40 lakhs+":       15,
  "₹25 – 40 lakhs":  12,
  "₹15 – 25 lakhs":   9,
  "₹10 – 15 lakhs":   5,
  "Below ₹10 lakhs":  2,
};

// ── 4. TIMELINE (APPLICATION URGENCY) ────────────────────────────
// Q9 — when the student wants to start their application
export const TIMELINE_RULES: Record<string, number> = {
  "As soon as possible (within 1 month)": 15,
  "Within 3 months":                      12,
  "Within 6 months":                       9,
  "Within 9 months":                       5,
  "Just exploring for now":                2,
};

// ── 5. DOCUMENTS READY ────────────────────────────────────────────
// Q10 — multi-select; each document = 2 pts, max 10
// "None of these yet" is the only 0-point entry.
// ScoreEngine sums individual values — table kept for reference.
export const DOCUMENT_RULES: Record<string, number> = {
  "Valid Passport":                              2,
  "Academic Transcripts / Marksheets":          2,
  "English Test Scorecard (IELTS / PTE / etc.)": 2,
  "Statement of Purpose (SOP)":                 2,
  "Letters of Recommendation (LOR)":            2,
  "None of these yet":                          0,
};

// ── 6. DESTINATION ────────────────────────────────────────────────
// Q7 — target country.
// Decided = student has clarity (minor score contribution).
// "Not Decided Yet" = lower readiness signal.
export const DESTINATION_RULES: Record<string, number> = {
  "Canada 🇨🇦":        5,
  "Australia 🇦🇺":     5,
  "United Kingdom 🇬🇧": 5,
  "USA 🇺🇸":           5,
  "Germany 🇩🇪":       5,
  "Other Europe 🇪🇺":  4,
  "Not Decided Yet":   1,
};

// ── 7. BONUS RULES (non-numeric questions) ────────────────────────
// These don't contribute to the 0–100 score but scoreEngine
// uses them for result-card label decisions and counselling flags.

// Q5 — backlogs (qualification risk flag)
export const BACKLOG_FLAGS: Record<string, "clear" | "minor" | "moderate" | "serious"> = {
  "No backlogs":          "clear",
  "Yes, 1–2 backlogs":    "minor",
  "Yes, 3–5 backlogs":    "moderate",
  "More than 5 backlogs": "serious",
};

// Q1 — purpose (used to recommend IELTS Academic vs General)
export const PURPOSE_FLAGS: Record<string, "study" | "pr" | "work" | "research" | "unsure"> = {
  "Higher Education / University Degree": "study",
  "PR Pathway (Permanent Residency)":     "pr",
  "Better Job Opportunities":             "work",
  "Research / PhD":                       "research",
  "Not Sure Yet":                         "unsure",
};

// Q2 — level of study (used for university tier matching)
export const LEVEL_FLAGS: Record<string, "diploma" | "bachelors" | "masters" | "mba" | "phd"> = {
  "Diploma / Certificate": "diploma",
  "Bachelor's Degree":     "bachelors",
  "Master's Degree":       "masters",
  "MBA":                   "mba",
  "PhD / Research":        "phd",
};

// Q11 — application stage (used for urgency-tier in result card CTA)
export const STAGE_FLAGS: Record<string, "exploring" | "shortlisting" | "preparing" | "ready" | "needs-counselling"> = {
  "Just starting to explore":             "exploring",
  "Shortlisting countries and universities": "shortlisting",
  "Preparing my documents":              "preparing",
  "Ready to apply — need guidance":      "ready",
  "Need complete counselling from scratch": "needs-counselling",
};

// Q12 — biggest challenge (used for personalised next-step message)
export const CHALLENGE_FLAGS: Record<string, string> = {
  "Choosing the right country":        "country-selection",
  "English preparation (IELTS / PTE)": "english-prep",
  "Budget or education loan":          "budget",
  "Selecting the right university":    "university-selection",
  "Visa process and documents":        "visa",
  "Scholarships and funding":          "scholarships",
  "Don't know where to start":         "full-counselling",
};

// ── 8. RESULT TIER THRESHOLDS ─────────────────────────────────────
// Used by scoreEngine to classify the final score into a tier.
// Thresholds are INCLUSIVE minimums.
export const TIER_THRESHOLDS = {
  READY:     75, // 75–100 → 🟢 Ready to Apply
  ALMOST:    45, // 45–74  → 🟡 Almost Ready
  EARLY:      0, // 0–44   → 🔴 Early Stage
} as const;

export type ResultTier = "READY" | "ALMOST" | "EARLY";

// ── 9. TIER METADATA ─────────────────────────────────────────────
// Label, colour, and primary CTA per tier — used by ResultCard.
export const TIER_CONFIG: Record<ResultTier, {
  label: string;
  emoji: string;
  tagline: string;
  colour: string;        // Tailwind-compatible hex for inline styles
  ctaPrimary: string;
  ctaSecondary: string;
}> = {
  READY: {
    label:       "Ready to Apply",
    emoji:       "🟢",
    tagline:     "You have a strong profile. Let's get your applications moving.",
    colour:      "#16a34a",
    ctaPrimary:  "Book Free Counselling →",
    ctaSecondary: "View Your Country Matches",
  },
  ALMOST: {
    label:       "Almost Ready",
    emoji:       "🟡",
    tagline:     "A few targeted improvements will make your profile application-ready.",
    colour:      "#d97706",
    ctaPrimary:  "Start Coaching + Counselling →",
    ctaSecondary: "Book Free Demo Class",
  },
  EARLY: {
    label:       "Early Stage",
    emoji:       "🔴",
    tagline:     "You're in the right place. Let's build your roadmap from scratch.",
    colour:      "#dc2626",
    ctaPrimary:  "Get Free Personalised Roadmap →",
    ctaSecondary: "Book Free Demo Class",
  },
};

// ── 10. COUNTRY RECOMMENDATION MATRIX ────────────────────────────
// Maps (purpose + budget tier) → recommended countries.
// ScoreEngine uses this to build the top-3 country list in ResultCard.
// Budget tiers: "low" (<15L), "mid" (15–25L), "high" (25L+)
export type BudgetTier = "low" | "mid" | "high";
export type PurposeFlag = "study" | "pr" | "work" | "research" | "unsure";

export const COUNTRY_MATRIX: Record<PurposeFlag, Record<BudgetTier, string[]>> = {
  study: {
    low:  ["Germany 🇩🇪", "Other Europe 🇪🇺", "Canada 🇨🇦"],
    mid:  ["Canada 🇨🇦", "United Kingdom 🇬🇧", "Germany 🇩🇪"],
    high: ["United Kingdom 🇬🇧", "USA 🇺🇸", "Australia 🇦🇺"],
  },
  pr: {
    low:  ["Canada 🇨🇦", "Germany 🇩🇪", "Australia 🇦🇺"],
    mid:  ["Canada 🇨🇦", "Australia 🇦🇺", "Germany 🇩🇪"],
    high: ["Canada 🇨🇦", "Australia 🇦🇺", "United Kingdom 🇬🇧"],
  },
  work: {
    low:  ["Germany 🇩🇪", "Canada 🇨🇦", "Other Europe 🇪🇺"],
    mid:  ["Canada 🇨🇦", "Germany 🇩🇪", "Australia 🇦🇺"],
    high: ["USA 🇺🇸", "United Kingdom 🇬🇧", "Canada 🇨🇦"],
  },
  research: {
    low:  ["Germany 🇩🇪", "Other Europe 🇪🇺", "Canada 🇨🇦"],
    mid:  ["United Kingdom 🇬🇧", "Canada 🇨🇦", "Germany 🇩🇪"],
    high: ["USA 🇺🇸", "United Kingdom 🇬🇧", "Australia 🇦🇺"],
  },
  unsure: {
    low:  ["Germany 🇩🇪", "Canada 🇨🇦", "Other Europe 🇪🇺"],
    mid:  ["Canada 🇨🇦", "United Kingdom 🇬🇧", "Germany 🇩🇪"],
    high: ["Canada 🇨🇦", "Australia 🇦🇺", "United Kingdom 🇬🇧"],
  },
};

// ── 11. NEXT-STEP MESSAGES ────────────────────────────────────────
// Used by ResultCard to show a personalised action line
// based on Q12 biggest challenge answer.
export const NEXT_STEP_MESSAGES: Record<string, string> = {
  "country-selection":   "Our counsellors will shortlist the top 3 countries for your exact profile.",
  "english-prep":        "Start your free IELTS / PTE demo class today — your score is the fastest thing to improve.",
  "budget":              "We'll walk you through education loan options and scholarship eligibility in your free session.",
  "university-selection":"We'll match you to universities with the highest admission probability for your profile.",
  "visa":                "Our Skill India certified counsellors handle documentation, SOP, and mock interview prep.",
  "scholarships":        "We'll identify scholarships you're likely eligible for based on your academic score and country.",
  "full-counselling":    "Book a free session — we'll map your entire journey from English prep to university admission.",
};
