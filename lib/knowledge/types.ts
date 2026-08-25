// FILE: lib/knowledge/types.ts
//
// Typed structures for the Markdown knowledge base.
// These types are deliberately decoupled from the existing JSON-based
// knowledge types in knowledge.loader.ts — a future embedding/vector
// search can replace md-retriever.ts without touching these shapes.

/** Valid knowledge document statuses. */
export type KnowledgeStatus = "verified" | "needs_review" | "coming_soon";

/** Top-level YAML front-matter fields. */
export interface KnowledgeFrontMatter {
  title: string;
  category: string;
  source: string;
  status: KnowledgeStatus;
  last_reviewed: string;
}

/** A parsed Markdown section (## heading + body). */
export interface KnowledgeSection {
  heading: string;
  body: string;
}

/** A fully parsed Markdown knowledge document. */
export interface KnowledgeDoc {
  /** Relative path from knowledge root, e.g. "courses/ielts.md". */
  relPath: string;
  /** Absolute file path on disk. */
  absPath: string;
  /** Parsed front-matter. */
  meta: KnowledgeFrontMatter;
  /** H1 title extracted from Markdown body (first # line). */
  h1: string;
  /** All ## sections extracted from the Markdown body. */
  sections: KnowledgeSection[];
  /** Full Markdown body text (without front-matter), lowercased and
   *  normalised for searching. */
  normalizedBody: string;
}

/** A retrieval result returned to callers. */
export interface KnowledgeRetrievalResult {
  doc: KnowledgeDoc;
  /** Deterministic relevance score (higher = more relevant). */
  score: number;
  /** The section(s) that matched, if a heading-level match drove the score. */
  matchedSections: string[];
}

/** Shape of a "no match" response. */
export interface KnowledgeNoMatch {
  kind: "no_match";
  query: string;
}
