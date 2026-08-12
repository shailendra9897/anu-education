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

  const lines = messages.map((msg) => {
    const role = msg.role === "USER" ? "User" : "Assistant";
    return `${role}: ${msg.content}`;
  });

  return `Previous Conversation:\n${lines.join("\n")}`;
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
export async function isAwaitingDemoConfirmation(
  conversationId: string,
): Promise<boolean> {
  const recent = await getRecentMessages(conversationId, 6);

  console.log(
    "[DEMO MEMORY DEBUG]",
    recent.map((message) => ({
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
    })),
  );

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