// FILE: lib/assessment/SearchEngine.ts
//
// ─────────────────────────────────────────────────────────────────
// RESPONSIBILITY:
//   "Give me a query → I return matching results."
//
// No React. No WhatsApp. No database. No HTTP. No side effects.
// Pure TypeScript only.
//
// Reusable for:
//   Assessment question search
//   Course catalogue search
//   Country guide search
//   University search
//   FAQ search
//   CRM student search
//   AI Counsellor intent matching
//
// ─────────────────────────────────────────────────────────────────
// PUBLIC API
//   searchQuestions(query, questions)     → QuestionSearchResult[]
//   searchCourses(query, courses)         → CourseSearchResult[]
//   searchCountries(query, countries)     → CountrySearchResult[]
//   searchFAQs(query, faqs)               → FAQSearchResult[]
//   searchAll(query, index)               → UniversalSearchResult[]
//
// PRIVATE HELPERS
//   normalise()
//   tokenise()
//   scoreMatch()
//   fuzzyMatch()
//   highlightMatches()
//   rankResults()
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface SearchOptions {
  /** Minimum match score to include in results (0–1). Default 0.3 */
  minScore?:    number;
  /** Maximum results to return. Default 10 */
  limit?:       number;
  /** Whether to include highlighted snippets. Default true */
  highlight?:   boolean;
  /** Fields to search within (if omitted, searches all fields) */
  fields?:      string[];
}

export interface SearchResult<T> {
  item:       T;
  score:      number;   // 0–1 relevance score
  matches:    string[]; // which fields matched
  excerpt?:   string;   // highlighted snippet
}

// ── Domain-specific item shapes ───────────────────────────────────

export interface SearchableQuestion {
  id:       number;
  text:     string;
  subtext?: string;
  options:  string[];
  emoji:    string;
}

export interface SearchableCourse {
  id:       string;
  title:    string;
  desc:     string;
  tags:     string[];   // e.g. ["IELTS", "English", "Gujarat", "Canada"]
  url:      string;
  price?:   string;
}

export interface SearchableCountry {
  id:       string;
  name:     string;
  aliases:  string[];   // e.g. ["UK", "Britain", "England"]
  tags:     string[];   // e.g. ["PR", "masters", "low cost"]
  url:      string;
}

export interface SearchableFAQ {
  id:       string;
  question: string;
  answer:   string;
  tags:     string[];
}

/** Universal search index — all searchable content in one object */
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

// ─────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────

/** Lowercase, trim, collapse whitespace, strip punctuation */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ")   // punctuation → space
    .replace(/\s+/g, " ");
}

/** Split normalised string into unique tokens, filtering stop words */
const STOP_WORDS = new Set([
  "a","an","the","is","are","was","were","be","been","being",
  "do","does","did","have","has","had","will","would","could",
  "should","may","might","shall","can","need","dare","ought",
  "used","i","my","me","we","our","you","your","it","its",
  "this","that","these","those","and","or","but","if","in",
  "on","at","to","for","of","with","by","from","as","into",
  "through","during","before","after","above","below","between",
  "out","off","over","under","again","then","once","here","there",
  "when","where","why","how","all","both","each","few","more",
  "most","other","some","such","no","not","only","own","same",
  "so","than","too","very","just","about",
]);

function tokenise(text: string): string[] {
  return [
    ...new Set(
      normalise(text)
        .split(" ")
        .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
    ),
  ];
}

/** Returns a 0–1 score for how well `query` matches `target`.
 *  Weights: exact phrase > all tokens present > partial tokens */
function scoreMatch(query: string, target: string): number {
  if (!query || !target) return 0;

  const nQuery  = normalise(query);
  const nTarget = normalise(target);

  // Exact phrase match — highest score
  if (nTarget.includes(nQuery)) {
    // Bonus if it starts at word boundary
    const idx = nTarget.indexOf(nQuery);
    return idx === 0 || nTarget[idx - 1] === " " ? 1.0 : 0.92;
  }

  const qTokens = tokenise(query);
  const tTokens = new Set(tokenise(target));

  if (qTokens.length === 0) return 0;

  // Count how many query tokens appear in target
  const exactHits = qTokens.filter((t) => tTokens.has(t)).length;

  // Fuzzy: count partial matches (query token is substring of a target token)
  const fuzzyHits = qTokens.filter(
    (qt) => !tTokens.has(qt) && [...tTokens].some((tt) => tt.includes(qt) || qt.includes(tt))
  ).length;

  const score =
    (exactHits * 1.0 + fuzzyHits * 0.5) / qTokens.length;

  return Math.min(score, 0.89); // cap below 1.0 — exact phrase wins
}

/** Simple fuzzy: returns true if strings share enough character bigrams */
function fuzzyMatch(a: string, b: string): boolean {
  const na = normalise(a);
  const nb = normalise(b);
  if (na === nb) return true;

  // Build bigram sets
  const bigrams = (s: string) =>
    new Set(
      s.split("").slice(0, -1).map((c, i) => c + s[i + 1])
    );

  const ba = bigrams(na);
  const bb = bigrams(nb);
  if (ba.size === 0 || bb.size === 0) return false;

  let shared = 0;
  ba.forEach((bg) => { if (bb.has(bg)) shared++; });

  const similarity = (2 * shared) / (ba.size + bb.size);
  return similarity > 0.4;
}

/** Wraps matching substrings with a marker for UI highlighting.
 *  Returns the excerpt with **bold** markers around matches. */
function highlightMatches(text: string, query: string): string {
  if (!text || !query) return text;

  const nQuery = normalise(query);
  const tokens = tokenise(query);

  let result = text;

  // Highlight exact phrase first
  const phraseRegex = new RegExp(
    nQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "gi"
  );
  result = result.replace(phraseRegex, (m) => `**${m}**`);

  // Highlight individual tokens not already wrapped
  tokens.forEach((token) => {
    const tokenRegex = new RegExp(
      `(?<!\*\*)\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b(?!\*\*)`,
      "gi"
    );
    result = result.replace(tokenRegex, (m) => `**${m}**`);
  });

  return result;
}

/** Builds a short excerpt: the sentence most relevant to the query */
function buildExcerpt(text: string, query: string, maxLen = 160): string {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  if (sentences.length === 0) return text.slice(0, maxLen);

  // Pick sentence with highest match score
  let best = sentences[0];
  let bestScore = 0;

  for (const s of sentences) {
    const s_ = scoreMatch(query, s);
    if (s_ > bestScore) {
      bestScore = s_;
      best = s;
    }
  }

  const trimmed = best.trim();
  return trimmed.length > maxLen
    ? trimmed.slice(0, maxLen - 1) + "…"
    : trimmed;
}

/** Sort results descending by score, apply limit */
function rankResults<T>(
  results: SearchResult<T>[],
  limit: number
): SearchResult<T>[] {
  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────
// ===========================
// PUBLIC API
// ===========================
// ─────────────────────────────────────────────────────────────────

/**
 * searchQuestions
 * ───────────────
 * Search assessment questions by text, subtext, or option labels.
 *
 * @example
 *   searchQuestions("english", QUESTIONS)
 *   // → [{ item: Q6 (English proficiency), score: 0.95, ... }]
 */
export function searchQuestions(
  query:     string,
  questions: SearchableQuestion[],
  options:   SearchOptions = {}
): QuestionSearchResult[] {
  const { minScore = 0.25, limit = 10, highlight = true } = options;

  const results: QuestionSearchResult[] = questions.map((q) => {
    const scores = [
      scoreMatch(query, q.text)               * 1.0,  // question text — highest weight
      scoreMatch(query, q.subtext ?? "")      * 0.7,
      ...q.options.map((o) => scoreMatch(query, o) * 0.5),
    ];

    const best   = Math.max(...scores);
    const matched: string[] = [];
    if (scoreMatch(query, q.text) > 0.1)           matched.push("text");
    if (scoreMatch(query, q.subtext ?? "") > 0.1)  matched.push("subtext");
    if (q.options.some((o) => scoreMatch(query, o) > 0.1)) matched.push("options");

    return {
      item:    q,
      score:   best,
      matches: matched,
      excerpt: highlight ? highlightMatches(q.text, query) : q.text,
    };
  });

  return rankResults(results, limit).filter((r) => r.score >= minScore);
}

/**
 * searchCourses
 * ─────────────
 * Search the ANU Education course catalogue.
 *
 * @example
 *   searchCourses("IELTS Ahmedabad", courses)
 *   searchCourses("Canada PR English test", courses)
 */
export function searchCourses(
  query:   string,
  courses: SearchableCourse[],
  options: SearchOptions = {}
): CourseSearchResult[] {
  const { minScore = 0.25, limit = 10, highlight = true } = options;

  const results: CourseSearchResult[] = courses.map((c) => {
    const titleScore = scoreMatch(query, c.title)       * 1.0;
    const descScore  = scoreMatch(query, c.desc)        * 0.7;
    const tagScore   = Math.max(
      0,
      ...c.tags.map((t) => scoreMatch(query, t) * 0.8)
    );

    const best    = Math.max(titleScore, descScore, tagScore);
    const matched: string[] = [];
    if (titleScore > 0.1) matched.push("title");
    if (descScore  > 0.1) matched.push("description");
    if (tagScore   > 0.1) matched.push("tags");

    return {
      item:    c,
      score:   best,
      matches: matched,
      excerpt: highlight ? buildExcerpt(c.desc, query) : undefined,
    };
  });

  return rankResults(results, limit).filter((r) => r.score >= minScore);
}

/**
 * searchCountries
 * ───────────────
 * Search countries by name, alias, or tag.
 * Handles common alternate names ("UK" → United Kingdom, etc.)
 *
 * @example
 *   searchCountries("UK masters")
 *   searchCountries("cheap European country")
 */
export function searchCountries(
  query:     string,
  countries: SearchableCountry[],
  options:   SearchOptions = {}
): CountrySearchResult[] {
  const { minScore = 0.2, limit = 9, highlight = true } = options;

  const results: CountrySearchResult[] = countries.map((c) => {
    const nameScore    = scoreMatch(query, c.name)      * 1.0;
    const aliasScore   = Math.max(
      0,
      ...c.aliases.map((a) => scoreMatch(query, a) * 0.95)
    );
    const tagScore     = Math.max(
      0,
      ...c.tags.map((t) => scoreMatch(query, t) * 0.7)
    );
    const fuzzy        = fuzzyMatch(query, c.name) ? 0.3 : 0;

    const best    = Math.max(nameScore, aliasScore, tagScore, fuzzy);
    const matched: string[] = [];
    if (nameScore  > 0.1) matched.push("name");
    if (aliasScore > 0.1) matched.push("alias");
    if (tagScore   > 0.1) matched.push("tags");

    return {
      item:    c,
      score:   best,
      matches: matched,
      excerpt: highlight ? highlightMatches(c.name, query) : c.name,
    };
  });

  return rankResults(results, limit).filter((r) => r.score >= minScore);
}

/**
 * searchFAQs
 * ──────────
 * Search FAQ content by question or answer text.
 * Useful for on-page FAQ search, AI counsellor intent matching,
 * and chatbot fallback responses.
 *
 * @example
 *   searchFAQs("can I work while studying UK")
 *   searchFAQs("IELTS score for Canada PR")
 */
export function searchFAQs(
  query:  string,
  faqs:   SearchableFAQ[],
  options: SearchOptions = {}
): FAQSearchResult[] {
  const { minScore = 0.2, limit = 5, highlight = true } = options;

  const results: FAQSearchResult[] = faqs.map((f) => {
    const qScore = scoreMatch(query, f.question) * 1.0;
    const aScore = scoreMatch(query, f.answer)   * 0.6;
    const tScore = Math.max(
      0,
      ...f.tags.map((t) => scoreMatch(query, t) * 0.5)
    );

    const best    = Math.max(qScore, aScore, tScore);
    const matched: string[] = [];
    if (qScore > 0.1) matched.push("question");
    if (aScore > 0.1) matched.push("answer");
    if (tScore > 0.1) matched.push("tags");

    return {
      item:    f,
      score:   best,
      matches: matched,
      excerpt: highlight
        ? buildExcerpt(f.answer, query)
        : undefined,
    };
  });

  return rankResults(results, limit).filter((r) => r.score >= minScore);
}

/**
 * searchAll
 * ─────────
 * Universal search across all content types in a SearchIndex.
 * Returns a ranked, interleaved list with type labels.
 * Best for a global search bar or AI counsellor intent routing.
 *
 * @example
 *   searchAll("IELTS coaching Ahmedabad", {
 *     courses:   allCourses,
 *     countries: allCountries,
 *     faqs:      allFAQs,
 *   })
 */
export function searchAll(
  query:   string,
  index:   SearchIndex,
  options: SearchOptions = {}
): UniversalSearchResult[] {
  const { limit = 12 } = options;
  const combined: UniversalSearchResult[] = [];

  if (index.questions) {
    searchQuestions(query, index.questions, { ...options, limit: 4 }).forEach((r) => {
      combined.push({ type: "question", score: r.score, item: r.item, matches: r.matches, excerpt: r.excerpt });
    });
  }

  if (index.courses) {
    searchCourses(query, index.courses, { ...options, limit: 6 }).forEach((r) => {
      combined.push({ type: "course", score: r.score, item: r.item, matches: r.matches, excerpt: r.excerpt });
    });
  }

  if (index.countries) {
    searchCountries(query, index.countries, { ...options, limit: 4 }).forEach((r) => {
      combined.push({ type: "country", score: r.score, item: r.item, matches: r.matches, excerpt: r.excerpt });
    });
  }

  if (index.faqs) {
    searchFAQs(query, index.faqs, { ...options, limit: 4 }).forEach((r) => {
      combined.push({ type: "faq", score: r.score, item: r.item, matches: r.matches, excerpt: r.excerpt });
    });
  }

  return combined
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────
// UTILITY EXPORTS
// (Useful for building search UI without reimplementing logic)
// ─────────────────────────────────────────────────────────────────

/**
 * Returns a highlighted version of `text` with query matches
 * wrapped in **double asterisks** (Markdown bold).
 * UI layer converts ** markers to <mark> or <strong> tags.
 */
export function highlight(text: string, query: string): string {
  return highlightMatches(text, query);
}

/**
 * Returns true if `query` is a close enough match to `text`
 * to be considered a fuzzy hit (useful for spell-tolerance).
 */
export function isFuzzyMatch(query: string, text: string): boolean {
  return fuzzyMatch(query, text);
}

/**
 * Returns a 0–1 relevance score for a single query/target pair.
 * Useful for custom ranking in CRM or AI counsellor pipelines.
 */
export function relevanceScore(query: string, target: string): number {
  return scoreMatch(query, target);
}
