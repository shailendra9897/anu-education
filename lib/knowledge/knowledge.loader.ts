import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonObject = { [key: string]: JsonValue };

export type KnowledgeCollection =
  | "shared"
  | "courses"
  | "countries"
  | "pricing"
  | "mbbsAbroad";

export type KnowledgeDocument = {
  id: string;
  collection: KnowledgeCollection;
  fileName: string;
  path: string;
  data: JsonObject;
  searchableText: string;
};

export type KnowledgeBase = {
  shared: Record<string, JsonObject>;
  courses: Record<string, JsonObject>;
  countries: Record<string, JsonObject>;
  pricing: JsonObject | null;
  mbbsAbroad: JsonObject | null;
  documents: KnowledgeDocument[];
  loadedAt: string;
};

export type KnowledgeContext = {
  systemInstruction: string;
  context: string;
  selectedDocuments: Array<{
    id: string;
    collection: KnowledgeCollection;
    fileName: string;
    score: number;
  }>;
};

type KnowledgeSource = {
  load(): Promise<KnowledgeBase>;
};

type ContextOptions = {
  maxCharacters?: number;
  maxDocuments?: number;
};

const DEFAULT_KNOWLEDGE_DIR =
  process.env.ANU_KNOWLEDGE_DIR ||
  path.join(process.cwd(), "data");
  
const DEFAULT_MAX_CHARACTERS = 12000;
const DEFAULT_MAX_DOCUMENTS = 8;

let cachedKnowledge: KnowledgeBase | null = null;

class FileKnowledgeSource implements KnowledgeSource {
  constructor(private readonly rootDir: string) {}

  async load(): Promise<KnowledgeBase> {
    const documents: KnowledgeDocument[] = [];

    const shared = await this.loadDirectory("shared", "shared", documents);
    const courses = await this.loadDirectory("courses", "courses", documents);
    const countries = await this.loadDirectory("countries", "countries", documents);
    const pricing = await this.loadSingleFile("pricing.json", "pricing", documents);
    const mbbsAbroad = await this.loadSingleFile(
      "mbbs-abroad.json",
      "mbbsAbroad",
      documents,
    );

    return {
      shared,
      courses,
      countries,
      pricing,
      mbbsAbroad,
      documents,
      loadedAt: new Date().toISOString(),
    };
  }

  private async loadDirectory(
    dirName: string,
    collection: KnowledgeCollection,
    documents: KnowledgeDocument[],
  ): Promise<Record<string, JsonObject>> {
    const dirPath = path.join(this.rootDir, dirName);
    const entries = await readdir(dirPath, { withFileTypes: true });
    const collectionData: Record<string, JsonObject> = {};

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) continue;

      const filePath = path.join(dirPath, entry.name);
      const data = await readJsonObject(filePath);
      const id = getDocumentId(data, entry.name);

      collectionData[id] = data;
      documents.push(toKnowledgeDocument(id, collection, entry.name, filePath, data));
    }

    return collectionData;
  }

  private async loadSingleFile(
    fileName: string,
    collection: KnowledgeCollection,
    documents: KnowledgeDocument[],
  ): Promise<JsonObject | null> {
    const filePath = path.join(this.rootDir, fileName);
    const data = await readJsonObject(filePath);
    const id = getDocumentId(data, fileName);

    documents.push(toKnowledgeDocument(id, collection, fileName, filePath, data));
    return data;
  }
}

// Keep this contract stable. A future MySQL source only needs to implement
// KnowledgeSource.load(), so the chatbot/API route can keep calling this file.
class MySqlKnowledgeSource implements KnowledgeSource {
  async load(): Promise<KnowledgeBase> {
    throw new Error("MySQL knowledge source is not configured yet.");
  }
}

export async function loadKnowledge(options: { refresh?: boolean } = {}) {
  if (!options.refresh && cachedKnowledge) return cachedKnowledge;

  const source = createKnowledgeSource();
  cachedKnowledge = await source.load();
  return cachedKnowledge;
}

export async function getKnowledgeForPrompt(
  userMessage: string,
  options: ContextOptions = {},
): Promise<KnowledgeContext> {
  const knowledge = await loadKnowledge();
  const selectedDocuments = selectRelevantDocuments(userMessage, knowledge, options);
  const context = compactDocuments(
    selectedDocuments.map(({ document }) => document),
    options.maxCharacters ?? DEFAULT_MAX_CHARACTERS,
  );

  return {
    systemInstruction:
      "Use the ANU Education knowledge below as the source of truth. " +
      "Answer only with relevant information. If a requested fee, visa rule, " +
      "deadline, batch, or policy is missing or marked needs_review, say it must be confirmed with ANU Education or the official authority.",
    context,
    selectedDocuments: selectedDocuments.map(({ document, score }) => ({
      id: document.id,
      collection: document.collection,
      fileName: document.fileName,
      score,
    })),
  };
}

export function buildGptMessages(userMessage: string, knowledge: KnowledgeContext) {
  return [
    {
      role: "system" as const,
      content: knowledge.systemInstruction,
    },
    {
      role: "system" as const,
      content: `ANU Education knowledge context:\n${knowledge.context}`,
    },
    {
      role: "user" as const,
      content: userMessage,
    },
  ];
}

function createKnowledgeSource(): KnowledgeSource {
  if (process.env.ANU_KNOWLEDGE_SOURCE === "mysql") {
    return new MySqlKnowledgeSource();
  }

  return new FileKnowledgeSource(DEFAULT_KNOWLEDGE_DIR);
}

async function readJsonObject(filePath: string): Promise<JsonObject> {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as JsonValue;

  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(`Knowledge file must contain a JSON object: ${filePath}`);
  }

  return parsed as JsonObject;
}

function getDocumentId(data: JsonObject, fileName: string) {
  return typeof data.id === "string"
    ? data.id
    : fileName.replace(/\.json$/i, "");
}

function toKnowledgeDocument(
  id: string,
  collection: KnowledgeCollection,
  fileName: string,
  filePath: string,
  data: JsonObject,
): KnowledgeDocument {
  return {
    id,
    collection,
    fileName,
    path: filePath,
    data,
    searchableText: normalizeSearchText(JSON.stringify(data)),
  };
}

function selectRelevantDocuments(
  userMessage: string,
  knowledge: KnowledgeBase,
  options: ContextOptions,
) {
  const queryTerms = extractSearchTerms(userMessage);
  const maxDocuments = options.maxDocuments ?? DEFAULT_MAX_DOCUMENTS;
  const scored = knowledge.documents
    .map((document) => ({
      document,
      score: scoreDocument(document, queryTerms),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const mustInclude = knowledge.documents.filter((document) =>
    ["company.json", "faq.json", "pricing.json"].includes(document.fileName),
  );

  const merged = [...mustInclude, ...scored.map(({ document }) => document)];
  const uniqueDocuments = Array.from(
    new Map(merged.map((document) => [document.path, document])).values(),
  ).slice(0, maxDocuments);

  return uniqueDocuments.map((document) => ({
    document,
    score:
      scored.find((item) => item.document.path === document.path)?.score ??
      (document.id === "pricing" ? 3 : 1),
  }));
}

function scoreDocument(document: KnowledgeDocument, queryTerms: string[]) {
  if (queryTerms.length === 0) return 0;

  let score = 0;
  const idText = normalizeSearchText(`${document.id} ${document.fileName}`);

  for (const term of queryTerms) {
    if (idText.includes(term)) score += 8;
    if (document.searchableText.includes(term)) score += 2;
  }

  if (document.collection === "pricing" && hasAny(queryTerms, ["fee", "fees", "price", "pricing", "cost"])) {
    score += 10;
  }

  if (document.collection === "countries" && hasAny(queryTerms, ["visa", "country", "deadline", "funds", "process"])) {
    score += 4;
  }

  if (document.collection === "courses" && hasAny(queryTerms, ["course", "class", "batch", "mock", "test", "exam"])) {
    score += 4;
  }

  return score;
}

function compactDocuments(documents: KnowledgeDocument[], maxCharacters: number) {
  const chunks: string[] = [];
  let remaining = maxCharacters;

  for (const document of documents) {
    const payload = JSON.stringify(document.data, null, 2);
    const header = `\n\n[${document.collection}/${document.fileName}]\n`;
    const next = `${header}${payload}`;

    if (remaining <= header.length) break;

    if (next.length > remaining) {
      chunks.push(`${header}${payload.slice(0, remaining - header.length)}\n...`);
      break;
    }

    chunks.push(next);
    remaining -= next.length;
  }

  return chunks.join("").trim();
}

function extractSearchTerms(input: string) {
  const normalized = normalizeSearchText(input);
  const terms = normalized
    .split(" ")
    .filter((term) => term.length >= 3)
    .filter((term) => !STOP_WORDS.has(term));

  return Array.from(new Set(terms));
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
