import prisma from "../prisma";

export type MemoryScope =
  | "student"
  | "visitor"
  | "conversation"
  | "lead"
  | "global";

export type MemoryInput = {
  scope: MemoryScope;
  scopeId: string;
  key: string;
  value: string;
  metadata?: Record<string, unknown>;
};

export type MemoryRecord = MemoryInput & {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type PrismaWithMemory = typeof prisma & {
  memory?: {
    upsert(args: unknown): Promise<MemoryRecord>;
    findMany(args: unknown): Promise<MemoryRecord[]>;
    deleteMany(args: unknown): Promise<{ count: number }>;
  };
};

export async function remember(input: MemoryInput) {
  return getMemoryModel().upsert({
    where: {
      scope_scopeId_key: {
        scope: input.scope,
        scopeId: input.scopeId,
        key: input.key,
      },
    },
    create: {
      scope: input.scope,
      scopeId: input.scopeId,
      key: input.key,
      value: input.value,
      metadata: input.metadata ?? {},
    },
    update: {
      value: input.value,
      metadata: input.metadata ?? {},
    },
  });
}

export async function getMemory(scope: MemoryScope, scopeId: string) {
  return getMemoryModel().findMany({
    where: { scope, scopeId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getMemoryForPrompt(scope: MemoryScope, scopeId: string) {
  const memories = await getMemory(scope, scopeId);

  return memories
    .map((memory) => `${memory.key}: ${memory.value}`)
    .join("\n");
}

export async function forgetMemory(
  scope: MemoryScope,
  scopeId: string,
  key?: string,
) {
  return getMemoryModel().deleteMany({
    where: {
      scope,
      scopeId,
      ...(key ? { key } : {}),
    },
  });
}

function getMemoryModel() {
  const client = prisma as PrismaWithMemory;

  if (!client.memory) {
    throw new Error("Prisma model `memory` is not available yet.");
  }

  return client.memory;
}
