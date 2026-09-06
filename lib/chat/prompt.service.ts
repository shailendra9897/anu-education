// app/lib/chat/prompt.service.ts
import { searchKnowledge, type KnowledgeSearchResult } from "../knowledge/knowledge.service";
import { buildConversationContext } from "./memory.service";

export type PromptMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type KnowledgeContextOptions = {
  maxCharacters?: number;
  maxDocuments?: number;
};

export type ConversationContextOptions = {
  limit?: number;
};

const DEFAULT_CONTEXT_CHARACTERS = 10000;
const DEFAULT_CONTEXT_DOCUMENTS = 6;

// ── Build the static system prompt ──────────────────────────────────
export function buildSystemPrompt(): string {
  return [
    "You are ANU AI, the official assistant for ANU Education.",
    "Use the supplied ANU knowledge context as the source of truth.",
    "Answer clearly, briefly, and professionally for students, parents, partners, CRM users, WhatsApp leads, and admins.",
    "Do not invent fees, visa outcomes, deadlines, batch availability, or admission guarantees.",
    "If information is missing, outdated, or marked needs_review, ask the user to confirm with ANU Education or the official authority.",
    "For leads, collect the useful next detail: name, phone, target country, target course, intake, budget, and current education level.",
  ].join("\n");
}

// ── Build knowledge context from user message ──────────────────────
export async function buildKnowledgeContext(
  userMessage: string,
  options: KnowledgeContextOptions = {},
): Promise<string> {
  const results = await searchKnowledge(userMessage, {
    limit: options.maxDocuments ?? DEFAULT_CONTEXT_DOCUMENTS,
  });

  return formatKnowledgeResults(
    results,
    options.maxCharacters ?? DEFAULT_CONTEXT_CHARACTERS,
  );
}

// ── Format knowledge search results ────────────────────────────────
function formatKnowledgeResults(
  results: KnowledgeSearchResult[],
  maxCharacters: number,
): string {
  if (results.length === 0) {
    return "No directly matching ANU knowledge document was found.";
  }

  const chunks: string[] = [];
  let remaining = maxCharacters;

  for (const result of results) {
    const header = `\n\n[${result.collection}/${result.fileName} | score ${result.score}]\n`;
    const body = JSON.stringify(result.data, null, 2);
    const chunk = `${header}${body}`;

    if (remaining <= header.length) break;

    if (chunk.length > remaining) {
      chunks.push(`${header}${body.slice(0, remaining - header.length)}\n...`);
      break;
    }

    chunks.push(chunk);
    remaining -= chunk.length;
  }

  // Hard bound: the join+trim must never exceed maxCharacters. The
  // "\n..." truncation marker is appended AFTER filling the budget, so a
  // final slice guarantees callers a prompt no larger than requested
  // (critical for the tightened WhatsApp knowledge budget).
  return chunks.join("").trim().slice(0, maxCharacters);
}
export type BuildPromptInput = {
  userMessage: string;
  conversationId?: string | null;
  sourcePage?: string;
  knowledgeOptions?: KnowledgeContextOptions;
  memoryOptions?: ConversationContextOptions;
  /**
   * Phase 1: when false, the memory replay is skipped entirely. Used by
   * the WhatsApp pipeline, which already supplies the recent-message
   * history inline (chronological) and would otherwise double-count the
   * same rows — twice the tokens for no additional signal. Defaults to
   * true (website chat keeps the current behavior).
   */
  includeMemory?: boolean;
};

// ── Build the full prompt structure using a single input object ──
export async function buildPrompt({
  userMessage,
  conversationId,
  sourcePage,
  knowledgeOptions,
  memoryOptions,
  includeMemory = true,
}: BuildPromptInput): Promise<{
  system: string;
  memory: string;
  knowledge: string;
  userMessage: string;
}> {
  // Build system prompt, append sourcePage if provided
  let system = buildSystemPrompt();
  if (sourcePage) {
    system += `\n\nCurrent Page: ${sourcePage}`;
  }

  const memory =
    conversationId && includeMemory
      ? await buildConversationContext(conversationId, memoryOptions?.limit)
      : "";

  const knowledge = await buildKnowledgeContext(userMessage, knowledgeOptions);

  return {
    system,
    memory,
    knowledge,
    userMessage,
  };
}