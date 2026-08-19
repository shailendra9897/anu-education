// FILE: lib/lead/leadExtractor.ts
//
// ─────────────────────────────────────────────────────────────────
// Automatically detects lead information from free-text student
// messages, e.g.:
//
//   "Hi, I'm Rahul. I completed BTech and want to study in Germany
//    next year."
//
//   → { name: "Rahul", country: "Germany", goal: "study",
//       timeline: "next year" }
//
// ⚠️ SCHEMA CHANGE REQUIRED before persistLeadContext() will compile:
//   `intake` is one of the 8 requested fields but does NOT exist yet
//   on the LeadContext model in prisma/schema.prisma. Add one line:
//
//     model LeadContext {
//       ...
//       timeline         String?
//       intake           String?   // ← ADD THIS LINE
//       biggestChallenge String?
//       ...
//     }
//
//   Then run `npx prisma migrate dev --name add_lead_intake`.
//   Everything else in this file already matches the existing schema.
//
// ARCHITECTURE — WHY THIS IS REGEX/KEYWORD-BASED, NOT AN LLM CALL:
//   Every business-logic file in lib/ so far (scoreEngine,
//   recommendationEngine, SearchEngine) is a pure, deterministic
//   function with zero AI calls and zero side effects — cheap, fast,
//   fully testable, and impossible to hallucinate wrong. This file
//   follows the same pattern: extraction runs on every user message
//   at zero token cost, using the SAME course/country vocabulary
//   already defined in lib/ai/systemPrompt.ts (ANU_FACTS) and the
//   SAME goal vocabulary already defined in lib/assessment/types.ts
//   (PurposeFlag) — so a lead detected via chat and a lead detected
//   via the Study Abroad Readiness Assessment use identical values
//   and can be merged/compared downstream without translation.
//
//   This has a real limit: heavily reworded or unusual phrasing may
//   not match. That's an intentional trade-off for v1 — see the
//   extension point at the bottom of this file for how to add an
//   LLM-based fallback extractor later without changing the public
//   API (extractLead() signature stays the same either way).
// ─────────────────────────────────────────────────────────────────

import { ANU_FACTS } from "@/lib/ai/systemPrompt";
import type { PurposeFlag } from "@/lib/assessment/types";
import prisma from "@/lib/prisma";

// ═════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════

/**
 * LeadExtractionResult
 * ─────────────────────
 * Every field is optional — a single message rarely contains all of
 * them. extractLead() merges results across a conversation's turns
 * (see mergeLeadExtraction below), so the caller accumulates a
 * fuller picture over time rather than requiring one perfect message.
 */
export interface LeadExtractionResult {
  name?:          string;
  phone?:         string;   // E.164 where possible, raw digits otherwise
  email?:         string;
  country?:       string;   // matches ANU_FACTS.countries values
  course?:        string;   // matches an ANU_FACTS.courseCategories value
  intake?:        string;   // e.g. "Fall 2026", "September intake"
  budget?:        string;   // bucketed, see BUDGET_BUCKETS below
  englishLevel?:  string;   // e.g. "IELTS 6.5", "Beginner", "Not taken yet"
  timeline?:      string;   // e.g. "Next Year", "Within 3 months", "ASAP"
  goal?:          PurposeFlag; // "study" | "pr" | "work" | "research" | "unsure"
}

// ═════════════════════════════════════════════════════════════════
// LOOKUP TABLES — reuse existing vocabulary, don't invent new lists
// ═════════════════════════════════════════════════════════════════

// Country aliases → canonical ANU_FACTS.countries value.
// Canonical values themselves are always matched too (case-insensitive).
const COUNTRY_ALIASES: Record<string, string> = {
  "us":              "USA",
  "usa":             "USA",
  "america":         "USA",
  "united states":   "USA",
  "uk":              "UK",
  "united kingdom":  "UK",
  "britain":         "UK",
  "england":         "UK",
  "uae":             "Dubai/UAE",
  "dubai":           "Dubai/UAE",
  "emirates":        "Dubai/UAE",
  "germany":         "Germany",
  "canada":          "Canada",
  "australia":       "Australia",
  "france":          "France",
  "ireland":         "Ireland",
  "new zealand":     "New Zealand",
  "nz":              "New Zealand",
};

// Course keyword → canonical course name from ANU_FACTS.courseCategories.
const COURSE_KEYWORDS: Record<string, string> = {
  "ielts academic":  "IELTS Academic",
  "ielts general":   "IELTS General",
  "ielts":           "IELTS Academic", // default IELTS mention to Academic
  "pte":             "PTE Academic",
  "toefl":           "TOEFL",
  "duolingo":        "Duolingo English Test",
  "det":             "Duolingo English Test",
  "gre":             "GRE",
  "gmat":            "GMAT",
  "sat":             "SAT",
  "french":          "French (A1–B2, TEF/TCF)",
  "tef":             "French (A1–B2, TEF/TCF)",
  "tcf":             "French (A1–B2, TEF/TCF)",
  "german":          "German (A1–B2, Goethe)",
  "goethe":          "German (A1–B2, Goethe)",
  "spoken english":  "Spoken English",
  "mbbs":            "MBBS Abroad Counselling",
};

// Budget buckets — deliberately mirrors the vocabulary used in
// lib/assessment/assessmentRules.ts's BUDGET_RULES keys (not
// imported directly, since those keys are tied to exact multiple-
// choice option strings from the assessment quiz) so a chat-detected
// budget and an assessment-detected budget describe the same ranges.
const BUDGET_BUCKETS: { max: number; label: string }[] = [
  { max: 1_000_000,          label: "Below ₹10 lakhs" },
  { max: 1_500_000,          label: "₹10 – 15 lakhs" },
  { max: 2_500_000,          label: "₹15 – 25 lakhs" },
  { max: 4_000_000,          label: "₹25 – 40 lakhs" },
  { max: Number.POSITIVE_INFINITY, label: "₹40 lakhs+" },
];

// ═════════════════════════════════════════════════════════════════
// INDIVIDUAL EXTRACTORS — each is a pure function: string → value | null
// ═════════════════════════════════════════════════════════════════

function extractName(message: string): string | null {
  const patterns = [
    /\bi'?m\s+([A-Z][a-zA-Z]{1,20})\b/,
    /\bmy name is\s+([A-Z][a-zA-Z]{1,20})\b/i,
    /\bthis is\s+([A-Z][a-zA-Z]{1,20})\b/i,
    /\bhi,?\s+i'?m\s+([A-Z][a-zA-Z]{1,20})\b/i,
  ];
  // Common words that look like names in these patterns but aren't.
  const STOPWORDS = new Set([
    "not", "just", "still", "also", "very", "sure", "here",
    "interested", "looking", "planning", "trying", "hoping",
  ]);

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1] && !STOPWORDS.has(match[1].toLowerCase())) {
      // Capitalise first letter only, lowercase rest — normalises
      // "RAHUL" or "rahul" to "Rahul".
      const raw = match[1];
      return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    }
  }
  return null;
}

function extractPhone(message: string): string | null {
  // Indian 10-digit mobile (starts 6-9), with or without +91 prefix.
  const withCountryCode = message.match(/\+?91[\s-]?([6-9]\d{9})\b/);
  if (withCountryCode) return `+91${withCountryCode[1]}`;

  const bareIndian = message.match(/\b([6-9]\d{9})\b/);
  if (bareIndian) return `+91${bareIndian[1]}`;

  // Generic international fallback (loose — good enough to flag
  // "a phone number was mentioned", not to validate it fully).
  const intl = message.match(/\+\d{1,3}[\s-]?\d{6,14}\b/);
  if (intl) return intl[0].replace(/[\s-]/g, "");

  return null;
}

function extractEmail(message: string): string | null {
  const match = message.match(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/);
  return match ? match[0].toLowerCase() : null;
}

function extractCountry(message: string): string | null {
  const lower = message.toLowerCase();

  // Check aliases first (longer/more specific phrases before short ones)
  const sortedAliases = Object.keys(COUNTRY_ALIASES).sort((a, b) => b.length - a.length);
  for (const alias of sortedAliases) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(lower)) {
      return COUNTRY_ALIASES[alias];
    }
  }

  // Fall back to direct canonical name match (e.g. "Australia", "France")
  for (const country of ANU_FACTS.countries) {
    if (new RegExp(`\\b${country}\\b`, "i").test(lower)) {
      return country;
    }
  }

  return null;
}

function extractCourse(message: string): string | null {
  const lower = message.toLowerCase();
  const sortedKeywords = Object.keys(COURSE_KEYWORDS).sort((a, b) => b.length - a.length);
  for (const keyword of sortedKeywords) {
    if (new RegExp(`\\b${keyword}\\b`, "i").test(lower)) {
      return COURSE_KEYWORDS[keyword];
    }
  }
  return null;
}

function extractIntake(message: string): string | null {
  // Specific academic-term phrasing → Intake (distinct from the more
  // general Timeline field — "Fall 2026" is an intake; "next year"
  // is a timeline, see extractTimeline below).
  const seasonYear = message.match(
    /\b(spring|summer|fall|autumn|winter)\s*(?:intake)?\s*(20\d{2})?\b/i
  );
  if (seasonYear) {
    const season = seasonYear[1][0].toUpperCase() + seasonYear[1].slice(1).toLowerCase();
    const year = seasonYear[2] ? ` ${seasonYear[2]}` : "";
    return `${season}${year}`;
  }

  const monthIntake = message.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s*intake\b/i
  );
  if (monthIntake) {
    const month = monthIntake[1];
    return `${month[0].toUpperCase()}${month.slice(1).toLowerCase()} intake`;
  }

  return null;
}

function extractBudget(message: string): string | null {
  // ₹ / Rs / lakhs patterns — normalise to a rupee amount, then
  // bucket it using BUDGET_BUCKETS above.
  const lakhMatch = message.match(/(?:₹|rs\.?)?\s*([\d,.]+)\s*(?:lakh|lakhs|l)\b/i);
  if (lakhMatch) {
    const amount = parseFloat(lakhMatch[1].replace(/,/g, "")) * 100_000;
    return bucketBudget(amount);
  }

  const rupeeMatch = message.match(/₹\s*([\d,]+)(?!\s*(?:lakh|lakhs|l\b))/i);
  if (rupeeMatch) {
    const amount = parseFloat(rupeeMatch[1].replace(/,/g, ""));
    return bucketBudget(amount);
  }

  return null;
}

function bucketBudget(amountInRupees: number): string {
  for (const bucket of BUDGET_BUCKETS) {
    if (amountInRupees <= bucket.max) return bucket.label;
  }
  return BUDGET_BUCKETS[BUDGET_BUCKETS.length - 1].label;
}

function extractEnglishLevel(message: string): string | null {
  const ielts = message.match(/\bIELTS\s*(\d(?:\.\d)?)\b/i);
  if (ielts) return `IELTS ${ielts[1]}`;

  const pte = message.match(/\bPTE\s*(\d{2,3})\b/i);
  if (pte) return `PTE ${pte[1]}`;

  const band = message.match(/\bBand\s*(\d(?:\.\d)?)\b/i);
  if (band) return `IELTS ${band[1]}`;

  if (/\bnot taken\b|\bhaven'?t taken\b|\bno (?:english )?test yet\b/i.test(message)) {
    return "Not taken yet";
  }
  if (/\bbeginner\b|\bbasic english\b/i.test(message)) return "Beginner";
  if (/\bintermediate\b/i.test(message)) return "Intermediate";
  if (/\badvanced\b|\bfluent\b/i.test(message)) return "Advanced";

  return null;
}

function extractTimeline(message: string): string | null {
  if (/\basap\b|\bimmediately\b|\bas soon as possible\b|\bwithin (?:a|1) month\b/i.test(message)) {
    return "ASAP";
  }
  const withinMonths = message.match(/\bwithin\s+(\d{1,2})\s+months?\b/i);
  if (withinMonths) return `Within ${withinMonths[1]} months`;

  if (/\bnext year\b/i.test(message)) return "Next Year";
  if (/\bthis year\b/i.test(message)) return "This Year";
  if (/\bjust (?:exploring|looking|browsing)\b|\bnot sure yet\b/i.test(message)) {
    return "Just exploring";
  }

  return null;
}

function extractGoal(message: string): PurposeFlag | null {
  if (/\bpr\b|\bpermanent residency\b|\bimmigrat(?:e|ion)\b|\bsettle\b/i.test(message)) {
    return "pr";
  }
  if (/\bresearch\b|\bphd\b|\bdoctorate\b/i.test(message)) {
    return "research";
  }
  if (/\bjob\b|\bwork\b|\bcareer\b|\bemployment\b/i.test(message)) {
    return "work";
  }
  if (/\bstudy abroad\b|\bhigher education\b|\bmasters?\b|\bbachelors?\b|\bmba\b|\buniversity\b|\bdegree\b/i.test(message)) {
    return "study";
  }
  return null;
}

// ═════════════════════════════════════════════════════════════════
// ORCHESTRATOR — runs all extractors, merges with prior context
// ═════════════════════════════════════════════════════════════════

/**
 * extractLead
 * ───────────
 * Runs every extractor against a single message and merges the
 * result with any previously known context for the same
 * conversation. A newly detected value always overwrites the
 * previous one for that field — students often clarify or update
 * their situation mid-conversation ("actually I meant Canada, not
 * Germany"), so latest-detected-wins is the simplest, most
 * predictable merge rule. Fields with no new detection keep their
 * previous value untouched.
 *
 * @param message  the latest user message
 * @param previous optional prior extraction for this conversation
 */
export function extractLead(
  message: string,
  previous?: LeadExtractionResult
): LeadExtractionResult {
  const detected: LeadExtractionResult = {
    name:         extractName(message)         ?? undefined,
    phone:        extractPhone(message)        ?? undefined,
    email:        extractEmail(message)        ?? undefined,
    country:      extractCountry(message)      ?? undefined,
    course:       extractCourse(message)       ?? undefined,
    intake:       extractIntake(message)       ?? undefined,
    budget:       extractBudget(message)       ?? undefined,
    englishLevel: extractEnglishLevel(message) ?? undefined,
    timeline:     extractTimeline(message)     ?? undefined,
    goal:         extractGoal(message)         ?? undefined,
  };

  if (!previous) return detected;

  // Merge: newly detected value wins; otherwise keep previous.
  return {
    name:         detected.name         ?? previous.name,
    phone:        detected.phone        ?? previous.phone,
    email:        detected.email        ?? previous.email,
    country:      detected.country      ?? previous.country,
    course:       detected.course       ?? previous.course,
    intake:       detected.intake       ?? previous.intake,
    budget:       detected.budget       ?? previous.budget,
    englishLevel: detected.englishLevel ?? previous.englishLevel,
    timeline:     detected.timeline     ?? previous.timeline,
    goal:         detected.goal         ?? previous.goal,
  };
}

// ═════════════════════════════════════════════════════════════════
// PERSISTENCE — writes into LeadContext (+ Conversation for name/phone/email)
// ═════════════════════════════════════════════════════════════════

/**
 * persistLeadContext
 * ───────────────────
 * Saves an extraction result to the database:
 *   - name/phone/email → Conversation (that's where they live in
 *     the schema — LeadContext doesn't duplicate identity fields)
 *   - country/course/intake/budget/englishLevel/timeline/goal →
 *     LeadContext (upserted, one row per conversation)
 *
 * Call this after extractLead() on each user message where at least
 * one new field was detected — no need to call it on every message
 * if nothing changed.
 *
 * ⚠️ Requires the `intake` field added to LeadContext — see the
 * schema note at the top of this file.
 */
export async function persistLeadContext(
  conversationId: string,
  extraction: LeadExtractionResult
): Promise<void> {
  const { name, phone, email, ...leadFields } = extraction;
  const mappedLeadFields = {
    goal: leadFields.goal,
    targetCountry: leadFields.country,
    targetCourse: leadFields.course,
    englishLevel: leadFields.englishLevel,
    budgetRange: leadFields.budget,
    timeline: leadFields.timeline,
    intake: leadFields.intake,
  };

  // Update Conversation identity fields — only if we detected
  // something, and only overwrite existing values with new ones
  // (a later message might correct an earlier misheard name).
  if (name || phone || email) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...(name  ? { name }  : {}),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
      },
    });
  }

  // Upsert LeadContext with everything else.
  const hasLeadFields = Object.values(mappedLeadFields).some((v) => v !== undefined);
  if (hasLeadFields) {
    await prisma.leadContext.upsert({
      where:  { conversationId },
      create: { conversationId, ...mappedLeadFields },
      update: { ...mappedLeadFields },
    });
  }
}

// ═════════════════════════════════════════════════════════════════
// EXTENSION POINT — LLM fallback (not implemented yet)
// ═════════════════════════════════════════════════════════════════
//
// For messages the regex/keyword extractors above miss (unusual
// phrasing, indirect mentions), a future upgrade can add:
//
//   async function extractLeadWithLLM(message: string): Promise<LeadExtractionResult>
//
// ...called only when extractLead() returns an object with EVERY
// field still undefined (i.e. the cheap path found nothing) — so
// the token cost is paid only on messages that actually need it,
// not on every message. The return shape stays LeadExtractionResult
// either way, so callers (route.ts, the WhatsApp webhook) never need
// to know which extraction method was used.

// ═════════════════════════════════════════════════════════════════
// COACHING LEAD EXTRACTION
// ═════════════════════════════════════════════════════════════════

function escapeRegexCoaching(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface CoachingLeadContext {
  course?:          string;
  targetScore?:     string;
  currentLevel?:    string;
  preferredBatch?:  string;
  preferredTiming?: string;
  onlinePreference?: string;
  city?:            string;
  targetExamDate?:  string;
  destination?:     string;
  intake?:          string;
  budget?:          string;
  goal?:            string;
  name?:            string;
  phone?:           string;
  email?:           string;
}

const COACHING_COURSES: Record<string, string> = {
  "ielts academic":  "IELTS Academic",
  "ielts general":   "IELTS General",
  "ielts":           "IELTS",
  "pte academic":    "PTE Academic",
  "pte":             "PTE",
  "german":          "German",
  "goethe":          "German",
  "french":          "French",
  "tef":             "French",
  "tcf":             "French",
  "spoken english":  "Spoken English",
  "gre":             "GRE",
  "gmat":            "GMAT",
  "sat":             "SAT",
  "toefl":           "TOEFL",
  "duolingo":        "Duolingo",
  "det":             "Duolingo",
  "dmat":            "dMAT",
  "d-mat":           "dMAT",
};

function extractCoachingCourse(message: string): string | null {
  const lower = message.toLowerCase();
  const sorted = Object.keys(COACHING_COURSES).sort((a, b) => b.length - a.length);
  for (const keyword of sorted) {
    if (new RegExp(`\\b${escapeRegexCoaching(keyword)}\\b`, "i").test(lower)) {
      return COACHING_COURSES[keyword];
    }
  }
  return null;
}

function extractCoachingTargetScore(message: string): string | null {
  const pteScore = message.match(/\bpte\s*(?:score\s*)?(?:of\s*)?(\d{2,3})\b/i);
  if (pteScore) return `PTE ${pteScore[1]}`;

  const ieltsScore = message.match(/\bielts\s*(?:score\s*)?(?:of\s*)?(\d(?:\.\d)?)\b/i);
  if (ieltsScore) return `IELTS ${ieltsScore[1]}`;

  const toeflScore = message.match(/\btoefl\s*(?:score\s*)?(?:of\s*)?(\d{2,3})\b/i);
  if (toeflScore) return `TOEFL ${toeflScore[1]}`;

  const greScore = message.match(/\bgre\s*(?:score\s*)?(?:of\s*)?(\d{2,3})\b/i);
  if (greScore) return `GRE ${greScore[1]}`;

  const gmatScore = message.match(/\bgmat\s*(?:score\s*)?(?:of\s*)?(\d{2,3})\b/i);
  if (gmatScore) return `GMAT ${gmatScore[1]}`;

  const bandScore = message.match(/\bband\s*(\d(?:\.\d)?)\b/i);
  if (bandScore) return `IELTS Band ${bandScore[1]}`;

  const genericScore = message.match(/\b(?:score|target|need|want|get)\s*(?:of\s*)?(\d{2,3})\b/i);
  if (genericScore) return genericScore[1];

  return null;
}

function extractCoachingCurrentLevel(message: string): string | null {
  if (/\bnot taken\b|\bhaven'?t taken\b|\bno (?:english )?test yet\b|\bnever taken\b/i.test(message)) {
    return "Not taken yet";
  }
  if (/\bbeginner\b|\bbasic\b/i.test(message)) return "Beginner";
  if (/\bintermediate\b|\bband\s*5\b|\bpte\s*4\d\b/i.test(message)) return "Intermediate";
  if (/\badvanced\b|\bfluent\b|\bband\s*[7-9]\b|\bpte\s*[6-9]\d\b|\bpte\s*\d{3}\b/i.test(message)) return "Advanced";

  const ieltsLevel = message.match(/\bielts\s*(?:band\s*)?(\d(?:\.\d)?)\b/i);
  if (ieltsLevel) return `IELTS ${ieltsLevel[1]}`;

  const pteLevel = message.match(/\bpte\s*(\d{2,3})\b/i);
  if (pteLevel) return `PTE ${pteLevel[1]}`;

  return null;
}

function extractPreferredTiming(message: string): string | null {
  const lower = message.toLowerCase();
  if (/\bmorning\b|\bearly morning\b|\b6\s*(?:am|a\.m\.)\b|\b7\s*(?:am|a\.m\.)\b|\b8\s*(?:am|a\.m\.)\b/i.test(lower)) return "Morning";
  if (/\b(?:afternoon|post lunch)\b|\b12\s*(?:pm|noon)\b|\b1\s*(?:pm|p\.m\.)\b|\b2\s*(?:pm|p\.m\.)\b|\b3\s*(?:pm|p\.m\.)\b|\b4\s*(?:pm|p\.m\.)\b/i.test(lower)) return "Afternoon";
  if (/\bevening\b|\bnight\b|\b5\s*(?:pm|p\.m\.)\b|\b6\s*(?:pm|p\.m\.)\b|\b7\s*(?:pm|p\.m\.)\b|\b8\s*(?:pm|p\.m\.)\b/i.test(lower)) return "Evening";
  if (/\bweekend\b|\bsaturday\b|\bsunday\b/i.test(lower)) return "Weekend";
  if (/\bany time\b|\bflexible\b|\bno preference\b/i.test(lower)) return "Flexible";
  return null;
}

function extractOnlinePreference(message: string): string | null {
  if (/\bonline\b|\bfrom home\b|\bvirtual\b|\bvia zoom\b|\bvia teams\b/i.test(message)) return "Online";
  if (/\boffline\b|\bin[- ]?person\b|\bat (?:the )?center\b|\bat (?:the )?centre\b|\bface[- ]to[- ]face\b/i.test(message)) return "Offline";
  if (/\bboth\b|\beither\b|\bno preference\b/i.test(message)) return "Flexible";
  return null;
}

function extractCity(message: string): string | null {
  const cityPatterns = [
    /\b(?:in|from|based in|located in|living in|stay in|residing in)\s+([A-Z][a-zA-Z\s]{1,30})\b/,
    /\b(?:city\s*(?:is|:|=)\s*)([A-Z][a-zA-Z\s]{1,30})\b/i,
  ];

  const STOPWORDS = new Set([
    "india", "the", "and", "for", "with", "from", "want", "need",
    "looking", "interested", "planning", "studying", "studied",
    "online", "offline", "classes", "coaching", "course", "batch",
  ]);

  for (const pattern of cityPatterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const city = match[1].trim();
      if (!STOPWORDS.has(city.toLowerCase()) && city.length >= 2) {
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }
  }
  return null;
}

function extractTargetExamDate(message: string): string | null {
  const monthYear = message.match(
    /\b(?:in|by|before|around|targeting?)\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s*(20\d{2})?\b/i,
  );
  if (monthYear) {
    const month = monthYear[1][0].toUpperCase() + monthYear[1].slice(1).toLowerCase();
    const year = monthYear[2] ? ` ${monthYear[2]}` : "";
    return `${month}${year}`;
  }

  const examMonth = message.match(
    /\bexam\s+(?:is\s+)?(?:in\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)\s*(20\d{2})?\b/i,
  );
  if (examMonth) {
    const month = examMonth[1][0].toUpperCase() + examMonth[1].slice(1).toLowerCase();
    const year = examMonth[2] ? ` ${examMonth[2]}` : "";
    return `${month}${year}`;
  }

  const withinMonths = message.match(/\bwithin\s+(\d{1,2})\s+months?\b/i);
  if (withinMonths) return `Within ${withinMonths[1]} months`;

  if (/\basap\b|\bimmediately\b|\bas soon as possible\b/i.test(message)) return "ASAP";

  return null;
}

/**
 * extractCoachingLead
 * ────────────────────
 * Extracts coaching-specific information from a user message.
 * Returns a CoachingLeadContext with all detected fields.
 * Call this when the intent router detects COACHING_LEAD.
 */
export function extractCoachingLead(
  message: string,
  previous?: CoachingLeadContext,
): CoachingLeadContext {
  const detected: CoachingLeadContext = {
    course:           extractCoachingCourse(message)     ?? undefined,
    targetScore:      extractCoachingTargetScore(message) ?? undefined,
    currentLevel:     extractCoachingCurrentLevel(message) ?? undefined,
    preferredTiming:  extractPreferredTiming(message)    ?? undefined,
    onlinePreference: extractOnlinePreference(message)   ?? undefined,
    city:             extractCity(message)               ?? undefined,
    targetExamDate:   extractTargetExamDate(message)     ?? undefined,
    destination:      extractCountry(message)            ?? undefined,
    intake:           extractIntake(message)             ?? undefined,
    budget:           extractBudget(message)             ?? undefined,
    goal:             extractGoal(message)               ?? undefined,
    name:             extractName(message)               ?? undefined,
    phone:            extractPhone(message)              ?? undefined,
    email:            extractEmail(message)              ?? undefined,
  };

  if (!previous) return detected;

  return {
    course:           detected.course           ?? previous.course,
    targetScore:      detected.targetScore      ?? previous.targetScore,
    currentLevel:     detected.currentLevel     ?? previous.currentLevel,
    preferredTiming:  detected.preferredTiming  ?? previous.preferredTiming,
    onlinePreference: detected.onlinePreference ?? previous.onlinePreference,
    city:             detected.city             ?? previous.city,
    targetExamDate:   detected.targetExamDate   ?? previous.targetExamDate,
    destination:      detected.destination      ?? previous.destination,
    intake:           detected.intake           ?? previous.intake,
    budget:           detected.budget           ?? previous.budget,
    goal:             detected.goal             ?? previous.goal,
    name:             detected.name             ?? previous.name,
    phone:            detected.phone            ?? previous.phone,
    email:            detected.email            ?? previous.email,
  };
}

/**
 * CoachingInfoField
 * ──────────────────
 * Describes one piece of coaching information and whether it
 * has been collected.
 */
export interface CoachingInfoField {
  key:       string;
  label:     string;
  collected: boolean;
  value?:    string;
}

/**
 * COACHING_INFO_PRIORITY
 * ──────────────────────
 * Ordered list of coaching fields and their human-readable labels.
 * The first missing field is the "next most useful" piece of
 * information to ask for.
 */
const COACHING_INFO_PRIORITY: { key: string; label: string }[] = [
  { key: "course",           label: "course" },
  { key: "targetScore",      label: "target score" },
  { key: "currentLevel",     label: "current level" },
  { key: "preferredTiming",  label: "preferred timing" },
  { key: "onlinePreference", label: "online/offline preference" },
  { key: "city",             label: "city/location" },
  { key: "destination",      label: "study-abroad destination" },
  { key: "targetExamDate",   label: "target exam date" },
  { key: "intake",           label: "intake" },
  { key: "budget",           label: "budget" },
];

/**
 * getMissingCoachingInfo
 * ──────────────────────
 * Returns the ordered list of coaching fields with their
 * collection status, plus the first missing field label.
 */
export function getMissingCoachingInfo(
  context: CoachingLeadContext,
): { fields: CoachingInfoField[]; nextMissing: string | null } {
  const fields: CoachingInfoField[] = COACHING_INFO_PRIORITY.map((item) => ({
    key:       item.key,
    label:     item.label,
    collected: Boolean(context[item.key as keyof CoachingLeadContext]),
    value:     context[item.key as keyof CoachingLeadContext] ?? undefined,
  }));

  const nextMissing = fields.find((f) => !f.collected)?.label ?? null;

  return { fields, nextMissing };
}

/**
 * buildCoachingContextString
 * ──────────────────────────
 * Builds a plain-text coaching context block for the AI system
 * prompt. This tells the AI what has been collected and what to
 * ask next, enabling natural follow-up questions.
 */
export function buildCoachingContextString(
  context: CoachingLeadContext,
): string {
  const { fields, nextMissing } = getMissingCoachingInfo(context);

  const collected = fields
    .filter((f) => f.collected)
    .map((f) => `- ${f.label}: ${f.value}`)
    .join("\n");

  const lines: string[] = [
    "COACHING LEAD CONTEXT:",
    collected || "(No information collected yet.)",
    "",
  ];

  if (nextMissing) {
    lines.push(
      `NEXT ACTION: Ask for the student's ${nextMissing} in a natural, conversational way.`,
      "Do NOT ask for multiple pieces of information at once.",
      "Do NOT repeat information already collected above.",
      "Be warm and helpful. If the student asks an informational question, answer it first, then gently ask for the next missing detail.",
    );
  } else {
    lines.push(
      "All key coaching details collected. Summarize what you know and offer:",
      "1. A free demo class booking, or",
      "2. Connecting with a counsellor for enrollment details.",
    );
  }

  return lines.join("\n");
}

