import { retrieveKnowledge } from "./md-retriever";
import type { KnowledgeRetrievalResult, KnowledgeDoc } from "./types";
import type { KnowledgeCollection } from "./knowledge.loader";
import type { KnowledgeSearchResult } from "./knowledge.service";

export function toLegacySearchResult(
  result: KnowledgeRetrievalResult,
): KnowledgeSearchResult {
  const { doc, score } = result;
  const id = doc.relPath.replace(/\.md$/, "");
  const fileName = id.split("/").pop() ?? id;

  return {
    id,
    collection: collectionLabel(doc) as KnowledgeCollection,
    fileName,
    score,
    data: buildData(doc),
  };
}

export async function searchKnowledgeFromMarkdown(
  query: string,
  options: { limit?: number } = {},
): Promise<KnowledgeSearchResult[]> {
  const output = await retrieveKnowledge(query, {
    limit: options.limit ?? 6,
  });

  if (!Array.isArray(output)) return [];

  return output.map(toLegacySearchResult);
}

function collectionLabel(doc: KnowledgeDoc): string {
  const [first, second] = doc.relPath.split("/");

  switch (first) {
    case "courses":
      return "courses";
    case "admissions":
      return "countries";
    case "faq":
      return "shared";
    case "policies":
      return "policies";
    case "services":
      if (second === "pricing.md") return "pricing";
      return "shared";
    default:
      return first;
  }
}

function buildData(doc: KnowledgeDoc): Record<string, unknown> {
  const { meta, h1, sections } = doc;

  return {
    id: doc.relPath.replace(/\.md$/, ""),
    name: h1 || meta.title,
    title: meta.title,
    category: meta.category,
    source: meta.source,
    status: meta.status,
    availability: meta.availability ?? null,
    pricing_status: meta.pricing_status ?? null,
    demo_available: meta.demo_available ?? null,
    pricing: meta.pricing ?? null,
    demo_schedule: meta.demo_schedule ?? null,
    batch_schedule: meta.batch_schedule ?? null,
    demo_timings: meta.demo_timings ?? null,
    batch_timings: meta.batch_timings ?? null,
    aliases: meta.aliases ?? null,
    tags: meta.tags ?? null,
    last_reviewed: meta.last_reviewed,
    h1,
    sections,
  };
}
