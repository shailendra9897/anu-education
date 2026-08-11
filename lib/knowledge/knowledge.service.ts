import {
  loadKnowledge,
  type KnowledgeCollection,
  type KnowledgeDocument,
} from "./knowledge.loader";

export type KnowledgeSearchResult = {
  id: string;
  collection: KnowledgeCollection;
  fileName: string;
  score: number;
  data: Record<string, unknown>;
};

export type KnowledgeSearchOptions = {
  collections?: KnowledgeCollection[];
  limit?: number;
};

const DEFAULT_SEARCH_LIMIT = 6;

export async function searchKnowledge(
  query: string,
  options: KnowledgeSearchOptions = {},
): Promise<KnowledgeSearchResult[]> {
  const knowledge = await loadKnowledge();
  const terms = extractSearchTerms(query);
  const collections = new Set(options.collections);
  const limit = options.limit ?? DEFAULT_SEARCH_LIMIT;

  return knowledge.documents
    .filter((document) =>
      collections.size > 0 ? collections.has(document.collection) : true,
    )
    .map((document) => ({
      document,
      score: scoreKnowledgeDocument(document, terms),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ document, score }) => ({
      id: document.id,
      collection: document.collection,
      fileName: document.fileName,
      score,
      data: document.data as Record<string, unknown>,
    }));
}

export async function loadCountry(countryId: string) {
  const knowledge = await loadKnowledge();
  return knowledge.countries[normalizeId(countryId)] ?? null;
}

export async function loadCourse(courseId: string) {
  const knowledge = await loadKnowledge();
  return knowledge.courses[normalizeId(courseId)] ?? null;
}

export async function loadFAQ() {
  const knowledge = await loadKnowledge();
  return knowledge.shared["shared-faq"] ?? knowledge.shared.faq ?? null;
}

function scoreKnowledgeDocument(
  document: KnowledgeDocument,
  terms: string[],
) {
  if (terms.length === 0) return 0;

  let score = 0;
  const titleText = normalizeSearchText(`${document.id} ${document.fileName}`);

  for (const term of terms) {
    if (titleText.includes(term)) score += 10;
    if (document.searchableText.includes(term)) score += 2;
  }

  if (document.collection === "pricing" && hasAny(terms, ["fee", "fees", "price", "pricing", "cost"])) {
    score += 12;
  }

  if (document.collection === "countries" && hasAny(terms, ["visa", "country", "deadline", "funds", "process"])) {
    score += 6;
  }

  if (document.collection === "courses" && hasAny(terms, ["course", "class", "batch", "mock", "test", "exam"])) {
    score += 6;
  }

  return score;
}

function extractSearchTerms(input: string) {
  return Array.from(
    new Set(
      normalizeSearchText(input)
        .split(" ")
        .filter((term) => term.length >= 3)
        .filter((term) => !STOP_WORDS.has(term)),
    ),
  );
}

function normalizeId(value: string) {
  return normalizeSearchText(value).replace(/\s+/g, "-");
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(terms: string[], candidates: string[]) {
  return candidates.some((candidate) => terms.includes(candidate));
}

const STOP_WORDS = new Set([
  "about",
  "after",
  "all",
  "and",
  "anu",
  "are",
  "can",
  "for",
  "from",
  "how",
  "into",
  "need",
  "only",
  "please",
  "send",
  "tell",
  "that",
  "the",
  "this",
  "what",
  "when",
  "where",
  "which",
  "with",
]);
