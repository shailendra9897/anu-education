// FILE: lib/knowledge/md-loader.ts
//
// Safe recursive loader for knowledge/**/*.md files.
// Parses YAML front-matter (simple key: value format) and splits
// the Markdown body into sections on ## headings.
//
// Zero external dependencies — hand-parsed for safety and speed.

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type {
  KnowledgeDoc,
  KnowledgeFrontMatter,
  KnowledgeSection,
  KnowledgeStatus,
} from "./types";

// ── YAML front-matter parser (minimal) ──────────────────────────
// Handles the exact format emitted by the knowledge markdown files:
//   ---
//   key: value
//   key: value with : colons
//   ---
// Does NOT handle arrays, nested objects, or quoted strings.

function parseFrontMatter(raw: string): {
  frontMatter: KnowledgeFrontMatter;
  body: string;
} | null {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith("---")) return null;

  const end = trimmed.indexOf("\n---", 3);
  if (end === -1) return null;

  const yamlBlock = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 4).trim();

  const fm: Record<string, string> = {};
  for (const line of yamlBlock.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    fm[key] = val;
  }

  if (!fm.title || !fm.status) return null;

  return {
    frontMatter: {
      title: fm.title,
      category: fm.category ?? "",
      source: fm.source ?? "",
      status: (fm.status as KnowledgeStatus) ?? "verified",
      last_reviewed: fm.last_reviewed ?? "",
    },
    body,
  };
}

// ── Markdown section splitter ────────────────────────────────────

function splitSections(body: string): { h1: string; sections: KnowledgeSection[] } {
  const lines = body.split("\n");
  let h1 = "";
  const sections: KnowledgeSection[] = [];
  let current: KnowledgeSection | null = null;

  for (const line of lines) {
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match && !h1) {
      h1 = h1Match[1].trim();
      continue;
    }

    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      if (current) sections.push(current);
      current = { heading: h2Match[1].trim(), body: "" };
      continue;
    }

    if (current) {
      current.body += (current.body ? "\n" : "") + line;
    }
  }
  if (current) sections.push(current);

  return { h1, sections };
}

// ── Normalizer ───────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Recursive directory walker ───────────────────────────────────

async function walkDir(dir: string): Promise<string[]> {
  const results: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkDir(full)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

// ── Public API ───────────────────────────────────────────────────

export type LoadedKnowledge = {
  docs: KnowledgeDoc[];
  loadedAt: string;
};

let cached: LoadedKnowledge | null = null;

/**
 * Load all Markdown files under the knowledge directory tree.
 * Results are cached after the first call. Pass refresh: true to
 * force a reload.
 */
export async function loadMarkdownKnowledge(opts?: {
  refresh?: boolean;
  knowledgeDir?: string;
}): Promise<LoadedKnowledge> {
  if (!opts?.refresh && cached) return cached;

  const root =
    opts?.knowledgeDir ??
    process.env.ANU_KNOWLEDGE_DIR ??
    path.join(process.cwd(), "knowledge");

  const files = await walkDir(root);
  const docs: KnowledgeDoc[] = [];

  for (const absPath of files) {
    const doc = await loadSingleDoc(absPath, root);
    if (doc) docs.push(doc);
  }

  const result: LoadedKnowledge = { docs, loadedAt: new Date().toISOString() };
  cached = result;
  return result;
}

/** Parse a single markdown file into a KnowledgeDoc. Returns null on failure. */
async function loadSingleDoc(
  absPath: string,
  knowledgeRoot: string,
): Promise<KnowledgeDoc | null> {
  let raw: string;
  try {
    raw = await readFile(absPath, "utf8");
  } catch {
    return null;
  }

  const parsed = parseFrontMatter(raw);
  if (!parsed) return null;

  const { frontMatter, body } = parsed;
  const { h1, sections } = splitSections(body);
  const normalizedBody = normalize(body);

  return {
    relPath: path.relative(knowledgeRoot, absPath),
    absPath,
    meta: frontMatter,
    h1: h1 || frontMatter.title,
    sections,
    normalizedBody,
  };
}
