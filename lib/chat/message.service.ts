// app/lib/chat/message.service.ts
import prisma from "../prisma";
import { Message, MessageRole } from "@prisma/client";
import { touchConversation } from "./conversation.service";

export type MessageInput = {
  conversationId: string;
  role: MessageRole; // ✅ uses Prisma enum
  content: string;
  toolCalls?: unknown; // ✅ matches schema's 'toolCalls Json?'
};

// ── Helper to get the message model ────────────────────────────────
function getMessageModel() {
  if (!prisma.message) {
    throw new Error("Prisma model `message` is not available.");
  }
  return prisma.message;
}

// ── Save a new message ──────────────────────────────────────────────
export async function saveMessage(input: MessageInput): Promise<Message> {
  const message = await getMessageModel().create({
    data: {
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      toolCalls: input.toolCalls ?? undefined, // Prisma expects undefined if not provided
    },
  });

  // Update conversation's last activity timestamp
  await touchConversation(input.conversationId);

  return message;
}

// ── Get all messages for a conversation (oldest first) ────────────
export async function getMessages(
  conversationId: string,
  limit?: number,
): Promise<Message[]> {
  const messages = await getMessageModel().findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  return messages;
}

// ── Get recent messages (newest first, with optional limit) ──────
export async function getRecentMessages(
  conversationId: string,
  limit = 20,
): Promise<Message[]> {
  const messages = await getMessageModel().findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return messages;
}

// ── Get messages formatted for prompt consumption ──────────────────
export async function getMessagesForPrompt(
  conversationId: string,
  limit = 12,
): Promise<{ role: MessageRole; content: string }[]> {
  const messages = await getRecentMessages(conversationId, limit);
  // Return in chronological order (oldest first)
  return messages
    .reverse()
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

// ── Delete a single message by ID ──────────────────────────────────
export async function deleteMessage(messageId: string): Promise<Message> {
  const deleted = await getMessageModel().delete({
    where: { id: messageId },
  });
  return deleted;
}