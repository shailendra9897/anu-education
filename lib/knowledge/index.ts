// FILE: lib/knowledge/index.ts
//
// Public API for the Markdown knowledge base.
// Re-exports the loader and retriever so callers import from one place.

export { loadMarkdownKnowledge } from "./md-loader";
export type { LoadedKnowledge } from "./md-loader";

export { retrieveKnowledge, retrieveVerified } from "./md-retriever";
export type { RetrievalOptions, RetrievalOutput } from "./md-retriever";

export type {
  KnowledgeDoc,
  KnowledgeFrontMatter,
  KnowledgeNoMatch,
  KnowledgeRetrievalResult,
  KnowledgeSection,
  KnowledgeStatus,
  PricingPackage,
  ScheduleSlot,
} from "./types";
