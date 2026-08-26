// FILE: lib/knowledge/types.ts
//
// Typed structures for the Markdown knowledge base.
// These types are deliberately decoupled from the existing JSON-based
// knowledge types in knowledge.loader.ts — a future embedding/vector
// search can replace md-retriever.ts without touching these shapes.
//
// ARCHITECTURE RULE:
//   Markdown body = human-readable knowledge/content.
//   YAML front-matter = structured facts required by application logic.
//   Application code MUST NOT parse Markdown tables or free-text fields.

/** Valid knowledge document statuses. */
export type KnowledgeStatus = "verified" | "needs_review" | "coming_soon";

// ── Structured operational metadata types ────────────────────────

/**
 * A single pricing package for a course.
 * All fields nullable — ANU may not have confirmed every pack yet.
 */
export interface PricingPackage {
  /** Unique pack identifier (e.g. "ielts-champion-morning"). null if unknown. */
  pack_id: string | null;
  /** Human-readable pack name (e.g. "IELTS Academic - Champion Morning"). */
  name: string | null;
  /** Final payable price in the specified currency. null if unknown. */
  price: number | null;
  /** Original/list price before discount. null if unknown or no discount. */
  original_price: number | null;
  /** Discount description (e.g. "50%"). null if unknown. */
  discount: string | null;
  /** ISO currency code. Defaults to "INR" for ANU. */
  currency: string;
  /** Access/duration description (e.g. "180 days", "5 days"). null if unknown. */
  duration: string | null;
}

/**
 * A single schedule slot (demo or batch).
 * All fields required once a slot exists — a slot with missing
 * day/start/end is not useful for application logic.
 */
export interface ScheduleSlot {
  /** Day(s) of the week (e.g. "Monday-Friday", "Mon-Wed-Fri", "Saturday"). */
  day: string;
  /** Start time in HH:MM AM/PM format (e.g. "7:30 AM"). */
  start: string;
  /** End time in HH:MM AM/PM format (e.g. "9:30 AM"). */
  end: string;
  /** IANA timezone or label (e.g. "Asia/Kolkata", "IST"). */
  timezone: string;
  /** Optional batch/level label (e.g. "Morning Beginners", "A1", "Champion"). null if unlabelled. */
  label?: string | null;
}

// ── Top-level YAML front-matter fields ──────────────────────────

/** Top-level YAML front-matter fields. */
export interface KnowledgeFrontMatter {
  title: string;
  category: string;
  source: string;
  status: KnowledgeStatus;
  last_reviewed: string;

  // ── Operational metadata (optional, for future migration) ──────
  // These fields support the eventual replacement of data/*.json.
  // All are optional — absent values are treated as "not yet known".
  //
  // Scalar fields: availability, pricing_status, demo_available, aliases, tags
  // Structured fields: pricing (PricingPackage[]), demo_schedule, batch_schedule
  //
  // The YAML parser in md-loader.ts supports:
  //   - Scalar values:         key: value
  //   - Inline string arrays:  key: [a, b, c]
  //   - Block object arrays:   key:\n  - day: Mon\n    start: 9 AM

  /** Whether this entity is active, coming_soon, or discontinued. */
  availability?: string;
  /** Pricing status: "published", "needs_review", "coming_soon", or null. */
  pricing_status?: string | null;
  /** Whether a free demo is available. */
  demo_available?: boolean | null;

  // ── Structured pricing (replaces data/pricing.json per-course) ──
  /** List of pricing packages. null = not yet populated. Empty array = confirmed no packs. */
  pricing?: PricingPackage[] | null;

  // ── Structured schedules (replace free-text timing fields) ──────
  /** Recurring demo schedule slots. null = not yet populated. Empty array = confirmed no demos. */
  demo_schedule?: ScheduleSlot[] | null;
  /** Regular batch schedule slots. null = not yet populated. Empty array = confirmed no batches. */
  batch_schedule?: ScheduleSlot[] | null;

  // ── Legacy scalar timing fields (deprecated, kept for Part 2 compat) ─
  // These will be removed once demo.availability.ts and prompt.service.ts
  // migrate to the structured fields above.
  /** @deprecated Use demo_schedule instead. */
  demo_timings?: string | null;
  /** @deprecated Use batch_schedule instead. */
  batch_timings?: string | null;

  // ── Search metadata ──────────────────────────────────────────────
  /** Alternate names / search aliases. Inline string array in YAML. */
  aliases?: string[];
  /** Search / category tags. Inline string array in YAML. */
  tags?: string[];
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
