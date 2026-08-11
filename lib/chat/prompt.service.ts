import { getMessagesForPrompt, type ChatRole } from "./message.service";
import { searchKnowledge, type KnowledgeSearchResult } from "./knowledge.service";

export type PromptMessage = {
  role: ChatRole;
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

export function buildSystemPrompt() {
  return [
    "You are ANU AI, the official assistant for ANU Education.",
    "Use the supplied ANU knowledge context as the source of truth.",
    "Answer clearly, briefly, and professionally for students, parents, partners, CRM users, WhatsApp leads, and admins.",
    "Do not invent fees, visa outcomes, deadlines, batch availability, or admission guarantees.",
    "If information is missing, outdated, or marked needs_review, ask the user to confirm with ANU Education or the official authority.",
    "For leads, collect the useful next detail: name, phone, target country, target course, intake, budget, and current education level.",
  ].join("\n");
}

export async function buildKnowledgeContext(
  userMessage: string,
  options: KnowledgeContextOptions = {},
) {
  const results = await searchKnowledge(userMessage, {
    limit: options.maxDocuments ?? DEFAULT_CONTEXT_DOCUMENTS,
  });

  return formatKnowledgeResults(
    results,
    options.maxCharacters ?? DEFAULT_CONTEXT_CHARACTERS,
  );
}

export async function buildConversationContext(
  conversationId?: string | null,
  options: ConversationContextOptions = {},
) {
  if (!conversationId) return "";

  const messages = await getMessagesForPrompt(
    conversationId,
    options.limit ?? 12,
  );

  if (messages.length === 0) return "";

  return messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");
}

function formatKnowledgeResults(
  results: KnowledgeSearchResult[],
  maxCharacters: number,
) {
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

  return chunks.join("").trim();
}
