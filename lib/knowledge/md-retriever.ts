// FILE: lib/knowledge/md-retriever.ts
//
// Deterministic, keyword-based retrieval over knowledge/**/*.md.
// No vector database, no external APIs — pure string matching.
//
// Scoring hierarchy (highest → lowest):
//   1. Title exact match          +40
//   2. Title contains query term  +20 per term
//   3. Category match             +12 per term
//   4. Section heading match      +8 per term
//   5. Body text match            +2 per term
//
// Safety rules:
//   - coming_soon docs are excluded by default.
//   - needs_review docs are included but flagged.
//   - A no-match query returns an explicit KnowledgeNoMatch.

import { loadMarkdownKnowledge, type LoadedKnowledge } from "./md-loader";
import type {
  KnowledgeDoc,
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

// ── Scoring ──────────────────────────────────────────────────────

function scoreDoc(doc: KnowledgeDoc, terms: string[]): number {
  if (terms.length === 0) return 0;

  const titleNorm = normalize(doc.meta.title);
  const h1Norm = normalize(doc.h1);
  const catNorm = normalize(doc.meta.category);
  const combinedTitle = `${titleNorm} ${h1Norm}`;
  let score = 0;

  for (const term of terms) {
    // 1. Exact title match (whole normalized title equals query)
    if (combinedTitle === normalize(terms.join(" "))) {
      score += 40;
    }
    // 2. Title contains term
    if (hasTerm(combinedTitle, term)) {
      score += 20;
    }
    // 3. Category match
    if (hasTerm(catNorm, term)) {
      score += 12;
    }
    // 4. Section heading match
    for (const sec of doc.sections) {
      if (hasTerm(normalize(sec.heading), term)) {
        score += 8;
      }
    }
    // 5. Body text match
    if (hasTerm(doc.normalizedBody, term)) {
      score += 2;
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

  const scored = filtered
    .map((doc) => ({
      doc,
      score: scoreDoc(doc, terms),
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
