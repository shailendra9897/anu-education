// FILE: lib/knowledge/md-retriever.ts
//
// Deterministic, keyword-based retrieval over knowledge/**/*.md.
// No vector database, no external APIs — pure string matching.
//
// Scoring hierarchy (highest → lowest):
//   1. Entity exact match           +100
//   2. Entity alias match           +80
//   3. Title contains entity        +60
//   4. Intent + entity combo        +50
//   5. Title contains query term    +20 per term
//   6. Category match               +12 per term
//   7. Section heading match        +8 per term
//   8. Body text match              +2 per term
//   9. Structured metadata signals  +5-20
//  10. Specificity bonus            +25 for specific vs generic
//
// Safety rules:
//   - coming_soon docs are excluded by default.
//   - needs_review docs are included but flagged.
//   - A no-match query returns an explicit KnowledgeNoMatch.

import { loadMarkdownKnowledge, type LoadedKnowledge } from "./md-loader";
import type {
  KnowledgeDoc,
  KnowledgeFrontMatter,
  KnowledgeNoMatch,
  KnowledgeRetrievalResult,
  KnowledgeStatus,
} from "./types";

// ── Stop words ───────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "about", "after", "all", "and", "are", "can", "for", "from",
  "how", "into", "need", "only", "please", "send", "tell",
  "that", "the", "this", "what", "when", "where", "which", "with",
  "does", "have", "info", "just", "know", "like", "more",
  "also", "been", "being", "but", "not", "you", "your",
]);

// ── Entity Dictionary ────────────────────────────────────────────
// Known ANU entities with aliases for matching.

interface EntityDef {
  canonical: string;
  aliases: string[];
  type: "course" | "country" | "service";
}

const ENTITIES: EntityDef[] = [
  // ── Courses ──
  { canonical: "IELTS Academic", aliases: ["ielts"], type: "course" },
  { canonical: "PTE Academic and PTE Core", aliases: ["pte"], type: "course" },
  { canonical: "Shorter GRE", aliases: ["gre"], type: "course" },
  { canonical: "GMAT", aliases: ["gmat"], type: "course" },
  { canonical: "SAT", aliases: ["sat"], type: "course" },
  { canonical: "TOEFL", aliases: ["toefl"], type: "course" },
  { canonical: "Duolingo English Test", aliases: ["duolingo", "det"], type: "course" },
  { canonical: "French Language Coaching", aliases: ["french"], type: "course" },
  { canonical: "German Language Coaching", aliases: ["german", "deutsch"], type: "course" },
  { canonical: "Spoken English Champion", aliases: ["spoken english", "spoken"], type: "course" },

  // ── Countries ──
  { canonical: "United States of America", aliases: ["usa", "us", "united states", "america"], type: "country" },
  { canonical: "United Kingdom", aliases: ["uk", "britain", "england"], type: "country" },
  { canonical: "Canada", aliases: ["canada"], type: "country" },
  { canonical: "Australia", aliases: ["australia"], type: "country" },
  { canonical: "Germany", aliases: ["germany", "deutschland"], type: "country" },
  { canonical: "France", aliases: ["france"], type: "country" },
  { canonical: "Ireland", aliases: ["ireland"], type: "country" },
  { canonical: "New Zealand", aliases: ["new zealand", "nz"], type: "country" },
  { canonical: "Dubai / United Arab Emirates", aliases: ["dubai", "uae", "emirates"], type: "country" },
  { canonical: "Singapore", aliases: ["singapore"], type: "country" },
  { canonical: "Italy", aliases: ["italy"], type: "country" },

  // ── Services ──
  { canonical: "ANU Education Company Overview", aliases: ["contact", "company", "about anu", "anu education"], type: "service" },
  { canonical: "ANU Education Pricing Overview", aliases: ["pricing", "fees", "price", "cost"], type: "service" },
  { canonical: "ANU Education Frequently Asked Questions", aliases: ["faq", "question", "help"], type: "service" },
  { canonical: "ANU Education B2B Partner Program", aliases: ["b2b", "partner"], type: "service" },
  { canonical: "Visa Concepts Glossary", aliases: ["visa concepts", "visa glossary"], type: "service" },
  { canonical: "MBBS Abroad", aliases: ["mbbs", "medical", "mbbs abroad"], type: "country" },
];

// ── Intent Detection ─────────────────────────────────────────────

type Intent =
  | "pricing"
  | "demo"
  | "batch"
  | "visa"
  | "admission"
  | "contact"
  | "faq"
  | "course_details"
  | "none";

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  pricing: ["fee", "fees", "price", "pricing", "cost", "inr", "usd", "₹", "$"],
  demo: ["demo", "trial", "sample", "free class", "free demo"],
  batch: ["batch", "timing", "schedule", "class time", "slot", "morning", "evening"],
  visa: ["visa", "visa process", "visa fee", "visa requirements"],
  admission: ["admission", "eligibility", "apply", "application", "requirement"],
  contact: ["contact", "phone", "email", "address", "location", "reach"],
  faq: ["faq", "question", "answer", "doubt", "query"],
  course_details: ["course", "overview", "syllabus", "curriculum", "about"],
  none: [],
};

// Combined intent patterns for multi-word detection
const COMBINED_INTENTS: Array<{ intents: Intent[]; pattern: string }> = [
  { intents: ["visa", "pricing"], pattern: "visa fee" },
  { intents: ["visa", "pricing"], pattern: "visa fees" },
  { intents: ["demo", "course_details"], pattern: "demo class" },
  { intents: ["batch", "pricing"], pattern: "course fees" },
];

function detectIntent(terms: string[]): Intent[] {
  const intents: Intent[] = [];
  const queryStr = terms.join(" ");

  // Check combined intents first (higher priority)
  for (const combo of COMBINED_INTENTS) {
    if (queryStr.includes(combo.pattern)) {
      for (const intent of combo.intents) {
        if (!intents.includes(intent)) {
          intents.push(intent);
        }
      }
    }
  }

  // Check individual intents
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (intent === "none") continue;
    if (keywords.some((kw) => queryStr.includes(kw))) {
      if (!intents.includes(intent as Intent)) {
        intents.push(intent as Intent);
      }
    }
  }

  return intents.length > 0 ? intents : ["none"];
}

// ── Entity Detection ─────────────────────────────────────────────

interface DetectedEntity {
  entity: EntityDef;
  matchType: "canonical" | "alias" | "title";
  startIndex: number;
  endIndex: number;
}

function detectEntities(query: string, docs: KnowledgeDoc[]): DetectedEntity[] {
  const queryNorm = normalize(query);
  const detected: DetectedEntity[] = [];

  // Check entity dictionary
  for (const entity of ENTITIES) {
    // Check canonical name as a whole normalized phrase
    const canonicalNorm = normalize(entity.canonical);
    const canonicalIdx = findPhraseIndex(queryNorm, canonicalNorm);
    if (canonicalIdx !== -1) {
      detected.push({
        entity,
        matchType: "canonical",
        startIndex: canonicalIdx,
        endIndex: canonicalIdx + canonicalNorm.length,
      });
      continue;
    }

    // Check aliases (longest match first). Aliases must match as whole
    // normalized tokens/phrases — never mid-word substrings, so a query
    // like "discuss fees" cannot match alias "us" inside "discuss".
    for (const alias of [...entity.aliases].sort((a, b) => b.length - a.length)) {
      const aliasNorm = normalize(alias);
      const aliasIdx = findPhraseIndex(queryNorm, aliasNorm);
      if (aliasIdx !== -1) {
        detected.push({
          entity,
          matchType: "alias",
          startIndex: aliasIdx,
          endIndex: aliasIdx + aliasNorm.length,
        });
        break;
      }
    }
  }

  // Check document titles for a full-title match
  for (const doc of docs) {
    const titleNorm = normalize(doc.meta.title);
    const titleIdx = findPhraseIndex(queryNorm, titleNorm);
    if (titleIdx !== -1) {
      const existing = detected.find(
        (d) => d.entity.canonical === doc.meta.title
      );
      if (!existing) {
        detected.push({
          entity: {
            canonical: doc.meta.title,
            aliases: doc.meta.aliases ?? [],
            type: doc.relPath.startsWith("courses/")
              ? "course"
              : doc.relPath.startsWith("admissions/")
                ? "country"
                : "service",
          },
          matchType: "title",
          startIndex: titleIdx,
          endIndex: titleIdx + titleNorm.length,
        });
      }
    }
  }

  return detected;
}

// ── Helpers ──────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTerms(input: string): string[] {
  const words = normalize(input)
    .split(" ")
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
  return [...new Set(words)];
}

function hasTerm(haystack: string, term: string): boolean {
  return haystack.includes(term);
}

/**
 * Locate the first whole-token/phrase occurrence of `needle` in the
 * already-normalized `haystack` (lowercase, single spaces, no
 * punctuation). A single-word needle only matches when it stands alone
 * as a token; a multi-word needle matches only as a complete phrase
 * with whitespace boundaries on both sides. Returns -1 if absent.
 */
function findPhraseIndex(haystack: string, needle: string): number {
  if (!needle) return -1;
  const len = needle.length;
  if (len === 0 || len > haystack.length) return -1;
  for (let i = 0; i <= haystack.length - len; ) {
    const idx = haystack.indexOf(needle, i);
    if (idx === -1) return -1;
    const before = idx === 0 || haystack[idx - 1] === " ";
    const afterEnd = idx + len;
    const after = afterEnd === haystack.length || haystack[afterEnd] === " ";
    if (before && after) return idx;
    i = idx + 1;
  }
  return -1;
}

function containsPhrase(haystack: string, needle: string): boolean {
  return findPhraseIndex(haystack, needle) !== -1;
}

// ── Document Classification ──────────────────────────────────────

type DocClass =
  | "course"
  | "country"
  | "service_pricing"
  | "service_company"
  | "service_faq"
  | "service_visa"
  | "service_other"
  | "policy"
  | "unknown";

function classifyDoc(doc: KnowledgeDoc): DocClass {
  const relPath = doc.relPath;
  const title = doc.meta.title.toLowerCase();

  if (relPath.startsWith("courses/")) return "course";
  if (relPath.startsWith("admissions/")) return "country";
  if (relPath.startsWith("policies/")) return "policy";

  if (title.includes("pricing")) return "service_pricing";
  if (title.includes("company")) return "service_company";
  if (title.includes("frequently asked") || title.includes("faq")) return "service_faq";
  if (title.includes("visa concepts") || title.includes("visa glossary")) return "service_visa";

  return "service_other";
}

function isGenericDoc(docClass: DocClass): boolean {
  return ["service_faq", "service_visa", "service_pricing", "service_other"].includes(docClass);
}

function isSpecificDoc(docClass: DocClass): boolean {
  return ["course", "country"].includes(docClass);
}

// ── Scoring ──────────────────────────────────────────────────────

function scoreDoc(
  doc: KnowledgeDoc,
  terms: string[],
  entities: DetectedEntity[],
  intents: Intent[],
): number {
  if (terms.length === 0) return 0;

  const titleNorm = normalize(doc.meta.title);
  const h1Norm = normalize(doc.h1);
  const catNorm = normalize(doc.meta.category);
  const combinedTitle = `${titleNorm} ${h1Norm}`;
  const docClass = classifyDoc(doc);
  let score = 0;

  // ── 1. Entity matching ──────────────────────────────────────
  for (const detected of entities) {
    const entityNorm = normalize(detected.entity.canonical);

    // Exact canonical match in title (whole phrase)
    if (containsPhrase(combinedTitle, entityNorm)) {
      score += 100;
    }

    // Alias match in title (whole phrase; normalized consistently)
    for (const alias of detected.entity.aliases) {
      if (containsPhrase(combinedTitle, normalize(alias))) {
        score += 80;
        break;
      }
    }

    // Entity match in body (lower boost)
    if (containsPhrase(doc.normalizedBody, entityNorm)) {
      score += 30;
    }
  }

  // ── 2. Intent matching ──────────────────────────────────────
  for (const intent of intents) {
    if (intent === "none") continue;

    const keywords = INTENT_KEYWORDS[intent];

    // Check if doc has relevant section headings
    for (const sec of doc.sections) {
      const secNorm = normalize(sec.heading);
      if (keywords.some((kw) => secNorm.includes(kw))) {
        score += 15;
        break;
      }
    }

    // Check if doc has relevant structured metadata
    if (intent === "pricing" && doc.meta.pricing && doc.meta.pricing.length > 0) {
      score += 20;
    }
    if (intent === "demo" && doc.meta.demo_available === true) {
      // Strong boost for courses with demo_available
      score += 35;
    }
    if (intent === "demo" && doc.meta.demo_schedule && doc.meta.demo_schedule.length > 0) {
      score += 20;
    }
    if (intent === "batch" && doc.meta.batch_schedule && doc.meta.batch_schedule.length > 0) {
      score += 20;
    }

    // Check body text for intent keywords
    for (const kw of keywords) {
      if (hasTerm(doc.normalizedBody, kw)) {
        score += 2;
      }
    }
  }

  // ── 3. Combined intent handling ──────────────────────────────
  // Handle "demo class" → prioritize courses with demo_available
  if (intents.includes("demo")) {
    if (docClass === "course" && doc.meta.demo_available === true) {
      score += 25;
    }
  }

  // Handle "visa fees" → prioritize country docs with visa fee info
  if (intents.includes("visa") && intents.includes("pricing")) {
    if (docClass === "country") {
      score += 40;
      // Extra boost for country docs that actually contain visa fee info
      if (doc.normalizedBody.includes("visa") && doc.normalizedBody.includes("fee")) {
        score += 30;
      }
    }
    // Penalize generic pricing docs when visa intent is present
    if (docClass === "service_pricing") {
      score -= 40;
    }
  }

  // ── 4. Specificity bonus ────────────────────────────────────
  // Specific docs (course/country) beat generic docs when the query
  // names a known entity. Applied regardless of coming_soon status:
  // coming_soon docs themselves are removed by the default status
  // filter, and merely mentioning a coming_soon course must NOT
  // suppress legitimate verified/needs_review documents (e.g. country
  // docs that list SAT/GMAT as accepted tests).
  if (entities.length > 0) {
    if (isSpecificDoc(docClass)) {
      score += 40;
    } else if (isGenericDoc(docClass)) {
      // Penalty for generic docs when entity is present
      score -= 20;
    }
  }

  // ── 6. Standard keyword scoring ─────────────────────────────
  for (const term of terms) {
    // Title contains term
    if (hasTerm(combinedTitle, term)) {
      score += 20;
    }
    // Category match
    if (hasTerm(catNorm, term)) {
      score += 12;
    }
    // Section heading match
    for (const sec of doc.sections) {
      if (hasTerm(normalize(sec.heading), term)) {
        score += 8;
      }
    }
    // Body text match
    if (hasTerm(doc.normalizedBody, term)) {
      score += 2;
    }
  }

  // ── 7. Alias/tag matching ───────────────────────────────────
  const queryStr = terms.join(" ");
  for (const alias of doc.meta.aliases ?? []) {
    if (containsPhrase(queryStr, normalize(alias))) {
      score += 40;
    }
  }
  for (const tag of doc.meta.tags ?? []) {
    if (containsPhrase(queryStr, normalize(tag))) {
      score += 10;
    }
  }

  return score;
}

function matchedSectionHeadings(doc: KnowledgeDoc, terms: string[]): string[] {
  const matched: string[] = [];
  for (const sec of doc.sections) {
    const h = normalize(sec.heading);
    if (terms.some((t) => hasTerm(h, t))) {
      matched.push(sec.heading);
    }
  }
  return matched;
}

// ── Public retrieval function ────────────────────────────────────

export type RetrievalOutput = KnowledgeRetrievalResult[] | KnowledgeNoMatch;

export async function retrieveKnowledge(
  query: string,
  options: RetrievalOptions = {},
): Promise<RetrievalOutput> {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: options.knowledgeDir,
    refresh: !!options.knowledgeDir,
  });
  const terms = extractTerms(query);
  const limit = options.limit ?? 5;

  if (terms.length === 0) {
    return { kind: "no_match", query };
  }

  let filtered = docs;

  // Status filtering
  if (options.statuses) {
    const allowed = new Set(options.statuses);
    filtered = filtered.filter((d) => allowed.has(d.meta.status));
  } else if (options.includeComingSoon) {
    // includeComingSoon: keep all non-coming_soon + all coming_soon
    // (same as no filter — all docs pass)
  } else {
    // Default: exclude coming_soon
    filtered = filtered.filter((d) => d.meta.status !== "coming_soon");
  }

  // Category filtering
  if (options.categories) {
    const cats = new Set(options.categories.map((c) => c.toLowerCase()));
    filtered = filtered.filter((d) =>
      cats.has(d.meta.category.toLowerCase().split(" ")[0]),
    );
  }

  // Detect entities and intents
  const entities = detectEntities(query, docs);
  const intents = detectIntent(terms);

  const scored = filtered
    .map((doc) => ({
      doc,
      score: scoreDoc(doc, terms, entities, intents),
      matchedSections: matchedSectionHeadings(doc, terms),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.doc.relPath.localeCompare(b.doc.relPath))
    .slice(0, limit);

  if (scored.length === 0) {
    return { kind: "no_match", query };
  }

  return scored;
}

/**
 * Convenience: retrieve and return only verified docs (no warnings).
 */
export async function retrieveVerified(
  query: string,
  options: Omit<RetrievalOptions, "statuses"> = {},
): Promise<RetrievalOutput> {
  return retrieveKnowledge(query, {
    ...options,
    statuses: ["verified"],
  });
}

// ── Retrieval options ────────────────────────────────────────────

export interface RetrievalOptions {
  /** Maximum results to return. Default 5. */
  limit?: number;
  /** Include coming_soon docs. Default false. */
  includeComingSoon?: boolean;
  /** Only include these statuses. Overrides includeComingSoon. */
  statuses?: KnowledgeStatus[];
  /** Only search within these category prefixes (e.g. ["courses"]). */
  categories?: string[];
  /** Override the knowledge directory path (for testing). */
  knowledgeDir?: string;
}
