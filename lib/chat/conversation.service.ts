import prisma from "../prisma";

export type ConversationChannel =
  | "website"
  | "ai"
  | "crm"
  | "whatsapp"
  | "admin";

export type ConversationInput = {
  id?: string;
  visitorId?: string;
  studentId?: string;
  channel: ConversationChannel;
  title?: string;
  metadata?: Record<string, unknown>;
};

export type ConversationRecord = ConversationInput & {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type PrismaWithConversation = typeof prisma & {
  conversation?: {
    create(args: unknown): Promise<ConversationRecord>;
    findUnique(args: unknown): Promise<ConversationRecord | null>;
    findFirst(args: unknown): Promise<ConversationRecord | null>;
    update(args: unknown): Promise<ConversationRecord>;
  };
};

export async function getConversation(conversationId: string) {
  const conversation = getConversationModel();

  return conversation.findUnique({
    where: { id: conversationId },
  });
}

export async function findOrCreateConversation(input: ConversationInput) {
  const conversation = getConversationModel();

  if (input.id) {
    const existing = await conversation.findUnique({
      where: { id: input.id },
    });

    if (existing) return existing;
  }

  if (input.visitorId || input.studentId) {
    const existing = await conversation.findFirst({
      where: {
        channel: input.channel,
        OR: [
          input.visitorId ? { visitorId: input.visitorId } : undefined,
          input.studentId ? { studentId: input.studentId } : undefined,
        ].filter(Boolean),
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existing) return existing;
  }

  return conversation.create({
    data: {
      visitorId: input.visitorId,
      studentId: input.studentId,
      channel: input.channel,
      title: input.title,
      metadata: input.metadata ?? {},
    },
  });
}

export async function touchConversation(conversationId: string) {
  return getConversationModel().update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
}

function getConversationModel() {
  const client = prisma as PrismaWithConversation;

  if (!client.conversation) {
    throw new Error("Prisma model `conversation` is not available yet.");
  }

  return client.conversation;
}
