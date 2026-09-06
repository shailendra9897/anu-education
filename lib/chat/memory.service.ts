// app/lib/chat/memory.service.ts
import { Message } from "@prisma/client";
import { getRecentMessages } from "./message.service";

// ── Types ────────────────────────────────────────────────────────────
export type ConversationMemory = Message[];

export type ConversationContext = string;

// ── 1. Load conversation memory (chronological) ────────────────────
export async function getConversationMemory(
  conversationId: string,
  limit: number = 15
): Promise<ConversationMemory> {
  const recent = await getRecentMessages(conversationId, limit);
  // Reverse to get oldest → newest
  return recent.reverse();
}

// ── 2. Build a plain‑text context for prompts ──────────────────────
export async function buildConversationContext(
  conversationId: string,
  limit: number = 15
): Promise<ConversationContext> {
  const messages = await getConversationMemory(conversationId, limit);

  if (messages.length === 0) {
    return "Previous Conversation:\n(No conversation history)";
  }

  // Phase 7: never include SYSTEM/business messages (e.g. the first-contact
  // acknowledgement) in the AI prompt memory — they are audit-only and must
  // not appear to the model as if they were the student's or assistant's
  // message.
  const visible = messages.filter((msg) => msg.role !== "SYSTEM");

  if (visible.length === 0) {
    return "Previous Conversation:\n(No conversation history)";
  }

  const lines = visible.map((msg) => {
    const role = msg.role === "USER" ? "User" : "Assistant";
    return `${role}: ${msg.content}`;
  });

  return formatConversationMemoryBlock(lines, memoryContextCharacterLimit());
}

// ── Pure block formatter (deterministically testable) ──────────────
// Join role:content lines into the memory block, bounded to maxChars.
// When the block overflows, the OLDEST lines are dropped first — the
// NEWEST context always survives — and the truncation is marked so the
// model knows it is missing the beginning of the thread. Exporting the
// pure core keeps the budget rule testable without a database.
export function formatConversationMemoryBlock(
  lines: string[],
  maxChars: number,
): string {
  const header = "Previous Conversation:";
  const joined = lines.join("\n");
  const context = `${header}\n${joined}`;

  if (context.length <= maxChars) {
    return context;
  }

  const marker = "(older messages omitted)";
  const prefix = `${header}\n${marker}\n`;
  const budget = maxChars - prefix.length;

  if (budget <= 0) {
    // Not enough room even for the marker header — degrade to the
    // smallest still-legible form rather than an overflowing dump.
    return `${header}\n${marker}`;
  }

  const kept: string[] = [];
  let used = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    const add = lines[i].length + (kept.length > 0 ? 1 : 0);
    if (used + add > budget) break;
    kept.unshift(lines[i]);
    used += add;
  }
  return `${prefix}${kept.join("\n")}`;
}

// Phase 1: configurable ceiling for the serialized memory replay.
// Default 3500 characters; overridable via PROMPT_MEMORY_MAX_CHARS.
function memoryContextCharacterLimit(): number {
  const raw = Number(process.env.PROMPT_MEMORY_MAX_CHARS ?? 3500);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 3500;
}

// ── 3. Get recent user intent (placeholder) ──────────────────────
export async function getRecentUserIntent(
  conversationId: string,
  limit: number = 5
): Promise<string> {
  // For now, return a placeholder. Later, we can analyse the last few user messages.
  // Could be a simple string summarising the user's most recent goal.
  const recent = await getRecentMessages(conversationId, limit);
  const userMessages = recent
    .filter((m) => m.role === "USER")
    .map((m) => m.content)
    .join(" ");

  if (!userMessages) return "No user intent detected yet.";

  // Very simple summarisation: just return the last user message as intent.
  // In a later sprint, we can use a lightweight NLP or keyword extraction.
  const lastUser = recent.find((m) => m.role === "USER");
  return lastUser ? `User's most recent goal: ${lastUser.content}` : "No user intent detected yet.";
}

// ── 4. Check whether the conversation is awaiting demo confirmation ──
// Phase 1: the [DEMO MEMORY DEBUG] dump is heavy (every inbound message
// logs the last 6 rows, body + timestamps). It stays implemented but is
// gated — enabled only under DEBUG_DEMO_MEMORY=true, so production logs
// are not flooded during normal operation. Symptom-only: it reads, never
// modifies, so this does NOT alter demo-flood behavior.
const DEMO_MEMORY_DEBUG_ENABLED =
  (process.env.DEBUG_DEMO_MEMORY ?? "").toLowerCase() === "true";

export async function isAwaitingDemoConfirmation(
  conversationId: string,
): Promise<boolean> {
  const recent = await getRecentMessages(conversationId, 6);

  if (DEMO_MEMORY_DEBUG_ENABLED) {
    console.log(
      "[DEMO MEMORY DEBUG]",
      recent.map((message) => ({
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      })),
    );
  }

  if (recent.length === 0) {
    return false;
  }

  const lastAssistantMessage = recent.find(
    (message) => message.role === "ASSISTANT",
  );

  if (!lastAssistantMessage) {
    return false;
  }

  const text = lastAssistantMessage.content.toLowerCase();

  return (
    text.includes("would you like me to book") ||
    text.includes("would you like me to book this free demo") ||
    text.includes("would you like me to book the demo") ||
    text.includes("shall i book your demo") ||
    text.includes("shall i book the free demo")
  );
}

export async function getPendingDemoMessage(
  conversationId: string,
): Promise<string | null> {
  const recent = await getRecentMessages(conversationId, 6);

  const lastAssistantMessage = recent.find(
    (message) => message.role === "ASSISTANT",
  );

  if (!lastAssistantMessage) {
    return null;
  }

  const text = lastAssistantMessage.content.toLowerCase();

  if (
    text.includes("would you like me to book") ||
    text.includes("shall i book your demo") ||
    text.includes("shall i book the free demo")
  ) {
    return lastAssistantMessage.content;
  }

  return null;
}
export async function getPendingDemoCourse(
  conversationId: string,
): Promise<string | null> {
  const pendingMessage = await getPendingDemoMessage(conversationId);

  if (!pendingMessage) {
    return null;
  }

  const text = pendingMessage.toLowerCase();

  const courses = [
    "ielts",
    "pte",
    "german",
    "french",
    "spoken english",
    "gre",
    "gmat",
    "sat",
    "toefl",
    "duolingo",
  ];

  const matchedCourse = courses.find((course) =>
    text.includes(course),
  );

  return matchedCourse ?? null;
}