// FILE: lib/knowledge/md-loader.ts
//
// Safe recursive loader for knowledge/**/*.md files.
// Parses YAML front-matter and splits the Markdown body into sections
// on ## headings.
//
// YAML parser supports:
//   - Scalar values:         key: value
//   - Inline string arrays:  key: [a, b, c]
//   - Block object arrays:   key:\n  - day: Mon\n    start: 9 AM
//
// Zero external dependencies — hand-parsed for safety and speed.

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type {
  KnowledgeDoc,
  KnowledgeFrontMatter,
  KnowledgeSection,
  KnowledgeStatus,
  PricingPackage,
  ScheduleSlot,
} from "./types";

// ── YAML value parsers ──────────────────────────────────────────

/** Parse a scalar YAML value as string | null. "null" or "" → null. */
function parseOptionalString(raw: string | undefined): string | null {
  if (raw === undefined || raw === "null" || raw === "") return null;
  return raw;
}

/** Parse a scalar YAML value as boolean | null. "true"/"false" → boolean, else null. */
function parseOptionalBool(raw: string | undefined): boolean | null {
  if (raw === undefined || raw === "null" || raw === "") return null;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

/** Parse a scalar YAML value as string | undefined. "null" or "" → undefined (absent). */
function parseOptionalStringOrUndefined(raw: string | undefined): string | undefined {
  if (raw === undefined || raw === "null" || raw === "") return undefined;
  return raw;
}

/** Parse a scalar YAML value as number | null. */
function parseOptionalNumber(raw: string | undefined): number | null {
  if (raw === undefined || raw === "null" || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

// ── Inline array parser ─────────────────────────────────────────
// Parses:  [a, b, c]  or  ["a", "b", "c"]

function parseInlineArray(raw: string): string[] {
  const inner = raw.slice(1, -1).trim();
  if (!inner) return [];
  return inner.split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
}

// ── Block array parser ──────────────────────────────────────────
// Parses sequences like:
//   pricing:
//     - pack_id: ielts-champion-morning
//       name: IELTS Champion Morning
//       price: "18000"
//   or
//   demo_schedule:
//     - day: Saturday
//       start: "4:00 PM"
//       end: "5:30 PM"
//       timezone: IST

function isBlockArrayStart(line: string, key: string): boolean {
  const prefix = key + ":";
  const trimmed = line.trimEnd();
  return (trimmed === prefix || trimmed === prefix + " null" || trimmed === prefix + " []");
}

function parseBlockArray(lines: string[], startIdx: number): { items: Array<Record<string, string>>; nextIdx: number } {
  const items: Array<Record<string, string>> = [];
  let current: Record<string, string> | null = null;
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (!line.startsWith(" ")) break;

    const trimmed = line.trimStart();

    if (trimmed.startsWith("- ")) {
      if (current) items.push(current);
      current = {};
      const afterDash = trimmed.slice(2).trim();
      if (afterDash.includes(":")) {
        const idx = afterDash.indexOf(":");
        const k = afterDash.slice(0, idx).trim();
        const v = afterDash.slice(idx + 1).trim();
        if (k) current[k] = v;
      }
    } else if (current) {
      const idx = trimmed.indexOf(":");
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (k) current[k] = v;
      }
    }
    i++;
  }
  if (current) items.push(current);
  return { items, nextIdx: i };
}

// ── Block array → structured type mappers ───────────────────────

/** Strip surrounding quotes from a YAML value. */
function unquote(val: string): string {
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  return val;
}

function mapToPricingPackages(raw: unknown): PricingPackage[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map((item) => ({
    pack_id: unquote(item.pack_id ?? "") || null,
    name: unquote(item.name ?? "") || null,
    price: parseOptionalNumber(item.price),
    original_price: parseOptionalNumber(item.original_price),
    discount: parseOptionalString(unquote(item.discount ?? "")),
    currency: item.currency ?? "INR",
    duration: parseOptionalString(unquote(item.duration ?? "")),
  }));
}

function mapToScheduleSlots(raw: unknown): ScheduleSlot[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map((item) => ({
    day: unquote(item.day ?? ""),
    start: unquote(item.start ?? ""),
    end: unquote(item.end ?? ""),
    timezone: item.timezone ?? "IST",
    label: parseOptionalString(unquote(item.label ?? "")),
  }));
}

// ── Front-matter parser ─────────────────────────────────────────
// Builds a two-level map from the YAML block, then constructs
// KnowledgeFrontMatter. Handles scalars, inline arrays, and
// block object arrays.

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
  const lines = yamlBlock.split("\n");

  // ── Phase 1: Parse all lines into a flat string map + detect block arrays ──
  const fm: Record<string, string> = {};
  const blockArrayKeys: string[] = [];
  const blockArrayRanges: Record<string, { startIdx: number; endIdx: number }> = {};

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || !line.includes(":")) { i++; continue; }

    const idx = line.indexOf(":");
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();

    if (!key) { i++; continue; }

    // Detect block array start:  "key:" followed by blank/null or next indented "- " line
    if (val === "" || val === "null" || val === "[]") {
      const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
      if (nextLine.trimStart().startsWith("- ")) {
        const { items, nextIdx } = parseBlockArray(lines, i + 1);
        fm[key] = JSON.stringify(items);  // Store block arrays as JSON string
        blockArrayKeys.push(key);
        blockArrayRanges[key] = { startIdx: i + 1, endIdx: nextIdx };
        i = nextIdx;
        continue;
      }
    }

    fm[key] = val;
    i++;
  }

  if (!fm.title || !fm.status) return null;

  // ── Phase 2: Construct KnowledgeFrontMatter ────────────────────
  const aliasesRaw = fm.aliases;
  const tagsRaw = fm.tags;

  let aliases: string[] | undefined;
  let tags: string[] | undefined;

  if (aliasesRaw && aliasesRaw.startsWith("[")) {
    aliases = parseInlineArray(aliasesRaw);
  } else if (aliasesRaw) {
    // Fallback: comma-separated string → array
    aliases = aliasesRaw.split(",").map((s) => s.trim()).filter(Boolean);
  }

  if (tagsRaw && tagsRaw.startsWith("[")) {
    tags = parseInlineArray(tagsRaw);
  } else if (tagsRaw) {
    tags = tagsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  }

  const pricingRaw = fm.pricing;
  const demoScheduleRaw = fm.demo_schedule;
  const batchScheduleRaw = fm.batch_schedule;

  return {
    frontMatter: {
      title: fm.title,
      category: fm.category ?? "",
      source: fm.source ?? "",
      status: (fm.status as KnowledgeStatus) ?? "verified",
      last_reviewed: fm.last_reviewed ?? "",
      // ── Scalar operational metadata ───────────────────────────
      availability: parseOptionalStringOrUndefined(fm.availability),
      pricing_status: parseOptionalString(fm.pricing_status),
      demo_available: parseOptionalBool(fm.demo_available),
      demo_timings: parseOptionalString(fm.demo_timings),
      batch_timings: parseOptionalString(fm.batch_timings),
      aliases,
      tags,
      // ── Structured pricing ────────────────────────────────────
      pricing: pricingRaw
        ? mapToPricingPackages(JSON.parse(pricingRaw) as Array<Record<string, string>>)
        : null,
      // ── Structured schedules ──────────────────────────────────
      demo_schedule: demoScheduleRaw
        ? mapToScheduleSlots(JSON.parse(demoScheduleRaw) as Array<Record<string, string>>)
        : null,
      batch_schedule: batchScheduleRaw
        ? mapToScheduleSlots(JSON.parse(batchScheduleRaw) as Array<Record<string, string>>)
        : null,
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
