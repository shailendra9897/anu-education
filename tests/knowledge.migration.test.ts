// FILE: tests/knowledge.migration.test.ts
//
// A2.7 verification — Markdown-to-legacy knowledge migration.
//
// Verifies that searchKnowledge() now serves Markdown knowledge through
// the legacy KnowledgeSearchResult[] contract, that the adapter preserves
// the old shape and rich data, that ANU_KNOWLEDGE_SOURCE=json rolls back
// to the old JSON path, and that buildKnowledgeContext()'s output contract
// (6-doc limit / 10,000-char cap / no-match fallback) is unchanged.
//
// Run: npx tsx tests/knowledge.migration.test.ts

import { test, before, after } from "node:test";
import assert from "node:assert/strict";

import {
  toLegacySearchResult,
  searchKnowledgeFromMarkdown,
} from "../lib/knowledge/md-to-legacy.adapter";
import { searchKnowledge } from "../lib/knowledge/knowledge.service";
import { buildKnowledgeContext } from "../lib/chat/prompt.service";
import type { KnowledgeRetrievalResult, KnowledgeDoc } from "../lib/knowledge/types";

const ORIGINAL_SOURCE = process.env.ANU_KNOWLEDGE_SOURCE;

before(() => {
  delete process.env.ANU_KNOWLEDGE_SOURCE;
});

after(() => {
  if (ORIGINAL_SOURCE === undefined) {
    delete process.env.ANU_KNOWLEDGE_SOURCE;
  } else {
    process.env.ANU_KNOWLEDGE_SOURCE = ORIGINAL_SOURCE;
  }
});

function makeResult(relPath: string, overrides: Partial<KnowledgeDoc> = {}): KnowledgeRetrievalResult {
  const doc: KnowledgeDoc = {
    relPath,
    absPath: `/knowledge/${relPath}`,
    meta: {
      title: "Synthetic",
      category: "Test",
      source: "synthetic",
      status: "verified",
      last_reviewed: "2026-08-25",
    },
    h1: "Synthetic",
    sections: [{ heading: "Overview", body: "Synthetic body" }],
    normalizedBody: "synthetic body",
    ...overrides,
  };
  return { doc, score: 12, matchedSections: [] };
}

// ── A. Adapter preserves KnowledgeSearchResult shape ─────────────

test("A1. adapter preserves the legacy KnowledgeSearchResult shape", () => {
  const legacy = toLegacySearchResult(
    makeResult("courses/ielts.md", {
      meta: {
        title: "IELTS Academic",
        category: "English proficiency test preparation",
        source: "data/courses/ielts.json",
        status: "verified",
        last_reviewed: "2026-08-25",
        availability: "active",
        pricing_status: "published",
        demo_available: true,
        pricing: [
          {
            pack_id: "ielts-self-prep",
            name: "IELTS Academic - Self Prep",
            price: 1875,
            original_price: 3750,
            discount: "50%",
            currency: "INR",
            duration: "180 days",
          },
        ],
        demo_schedule: null,
        batch_schedule: [
          {
            day: "Monday-Friday",
            start: "7:30 AM",
            end: "9:30 AM",
            timezone: "IST",
            label: "Morning Beginners",
          },
        ],
        demo_timings: null,
        batch_timings: "Morning Beginners 7:30-9:30",
        aliases: ["IELTS"],
        tags: ["english test"],
      },
      h1: "IELTS Academic",
      sections: [{ heading: "Fees", body: "See pricing.json." }],
    }),
  );

  assert.deepEqual(
    Object.keys(legacy).sort(),
    ["collection", "data", "fileName", "id", "score"],
  );
  assert.equal(legacy.id, "courses/ielts");
  assert.equal(legacy.fileName, "ielts");
  assert.equal(legacy.collection, "courses");
  assert.equal(legacy.score, 12);
});

test("A2. data carries all useful Markdown knowledge with nulls preserved", () => {
  const legacy = toLegacySearchResult(
    makeResult("courses/gmat.md", {
      meta: {
        title: "GMAT",
        category: "MBA admissions test preparation",
        source: "data/courses/gmat.json",
        status: "coming_soon",
        last_reviewed: "2026-08-25",
        availability: "coming_soon",
        pricing_status: "coming_soon",
        demo_available: false,
        pricing: null,
        demo_schedule: null,
        batch_schedule: null,
        demo_timings: null,
        batch_timings: null,
        aliases: ["GMAT"],
        tags: ["mba"],
      },
    }),
  );

  const d = legacy.data as Record<string, unknown>;
  assert.equal(d.id, "courses/gmat");
  assert.equal(d.name, "Synthetic");
  assert.equal(d.title, "GMAT");
  assert.equal(d.status, "coming_soon");
  assert.equal(d.availability, "coming_soon");
  assert.equal(d.demo_available, false);
  assert.equal(d.pricing, null);
  assert.equal(d.demo_schedule, null);
  assert.equal(d.batch_schedule, null);
  assert.equal(d.demo_timings, null);
  assert.equal(d.batch_timings, null);
  assert.deepEqual(d.aliases, ["GMAT"]);
  assert.deepEqual(d.tags, ["mba"]);
  assert.deepEqual(d.sections, [{ heading: "Overview", body: "Synthetic body" }]);
});

test("A3. collection labels map to stable compatibility labels", () => {
  const cases: Array<[string, string]> = [
    ["courses/ielts.md", "courses"],
    ["admissions/usa.md", "countries"],
    ["faq/general.md", "shared"],
    ["services/pricing.md", "pricing"],
    ["services/company.md", "shared"],
    ["services/b2b-partner-program.md", "shared"],
    ["services/visa-concepts.md", "shared"],
    ["policies/ai-operating-rules.md", "policies"],
  ];

  for (const [relPath, expected] of cases) {
    const legacy = toLegacySearchResult(makeResult(relPath));
    assert.equal(legacy.collection, expected, relPath);
  }
});

test("A4. searchKnowledgeFromMarkdown returns KnowledgeSearchResult[]", async () => {
  const results = await searchKnowledgeFromMarkdown("IELTS fees", { limit: 6 });
  assert.ok(results.length > 0);
  for (const r of results) {
    assert.deepEqual(
      Object.keys(r).sort(),
      ["collection", "data", "fileName", "id", "score"],
    );
    assert.equal(typeof r.score, "number");
    assert.equal(typeof r.collection, "string");
    assert.equal(typeof r.fileName, "string");
  }
  assert.ok(results.some((r) => r.fileName === "ielts"));
});

// ── B. Markdown course conversion ────────────────────────────────

test("B. IELTS fees returns IELTS with structured pricing and batch_schedule", async () => {
  const results = await searchKnowledge("IELTS fees", { limit: 6 });
  const ielts = results.find((r) => r.fileName === "ielts");
  assert.ok(ielts, "expected an IELTS result");
  const d = ielts.data as Record<string, unknown>;
  const pricing = d.pricing as Array<Record<string, unknown>>;
  const batchSchedule = d.batch_schedule as Array<Record<string, unknown>>;
  assert.ok(Array.isArray(pricing) && pricing.length > 0, "structured pricing");
  assert.ok(
    Array.isArray(batchSchedule) && batchSchedule.length > 0,
    "batch_schedule",
  );
  assert.ok(
    budgetPacks(pricing).every(
      (p) => typeof p.pack_id === "string" && typeof p.price === "number",
    ),
  );
});

// ── C. PTE demo ──────────────────────────────────────────────────

test("C. PTE demo class ranks PTE first with demo_schedule", async () => {
  const results = await searchKnowledge("PTE demo class", { limit: 6 });
  assert.ok(results.length > 0);
  assert.equal(results[0].fileName, "pte", "PTE should rank first");
  const d = results[0].data as Record<string, unknown>;
  const demoSchedule = d.demo_schedule as Array<Record<string, unknown>>;
  assert.ok(
    Array.isArray(demoSchedule) && demoSchedule.length > 0,
    "demo_schedule",
  );
  assert.deepEqual(
    Object.keys(demoSchedule[0]).sort(),
    ["day", "end", "label", "start", "timezone"],
  );
});

// ── D. Visa ─────────────────────────────────────────────────────

test("D. USA study visa ranks USA first with visa body sections", async () => {
  const results = await searchKnowledge("USA study visa", { limit: 6 });
  assert.ok(results.length > 0);
  assert.equal(results[0].fileName, "usa", "USA should rank first");
  const d = results[0].data as Record<string, unknown>;
  const sections = d.sections as Array<Record<string, unknown>>;
  const visa = sections.find((s) => s.heading === "Visa Process");
  assert.ok(visa, "expected a Visa Process section");
  assert.match(String(visa.body), /F-1/);
});

// ── E. coming_soon exclusion ────────────────────────────────────

test("E. GMAT fees excludes coming_soon GMAT on the Markdown path", async () => {
  const results = await searchKnowledge("GMAT fees", { limit: 6 });
  assert.ok(!results.some((r) => r.fileName === "gmat"), "GMAT must be excluded");
  assert.ok(results.length >= 0);
});

// ── F. Explicit rollback ────────────────────────────────────────

test("F. ANU_KNOWLEDGE_SOURCE=json keeps the old JSON behavior", async () => {
  process.env.ANU_KNOWLEDGE_SOURCE = "json";
  try {
    const results = await searchKnowledge("GMAT fees", { limit: 6 });
    assert.ok(
      results.some((r) => r.fileName === "gmat.json"),
      "expected gmat.json via legacy JSON path",
    );
  } finally {
    delete process.env.ANU_KNOWLEDGE_SOURCE;
  }
});

// ── G. no-match fallback ────────────────────────────────────────

test("G. no-match returns [] and preserves the prompt fallback string", async () => {
  const results = await searchKnowledge("qzxv mnpiw oerjk dallek", { limit: 6 });
  assert.deepEqual(results, []);
  const context = await buildKnowledgeContext("qzxv mnpiw oerjk dallek");
  assert.equal(
    context,
    "No directly matching ANU knowledge document was found.",
  );
});

// ── H. limit ────────────────────────────────────────────────────

test("H. searchKnowledge honours the limit option", async () => {
  const results6 = await searchKnowledge("study visa course fees", { limit: 6 });
  const results2 = await searchKnowledge("study visa course fees", { limit: 2 });
  assert.ok(results6.length <= 6);
  assert.ok(results2.length <= 2);
});

// ── I. rich data ────────────────────────────────────────────────

test("I. Markdown result carries pricing/schedules/sections where applicable", async () => {
  const results = await searchKnowledge("IELTS fees", { limit: 6 });
  const d = results.find((r) => r.fileName === "ielts")?.data as Record<string, unknown>;
  assert.ok(d);
  const pricing = d.pricing as Array<Record<string, unknown>>;
  const batch = d.batch_schedule as Array<Record<string, unknown>>;
  const sections = d.sections as Array<Record<string, unknown>>;
  const firstPack = budgetPacks(pricing)[0];
  assert.deepEqual(
    Object.keys(firstPack as object).sort(),
    ["currency", "discount", "duration", "name", "original_price", "pack_id", "price"],
  );
  assert.ok(Array.isArray(batch) && batch.length > 0);
  assert.deepEqual(
    Object.keys(batch[0]).sort(),
    ["day", "end", "label", "start", "timezone"],
  );
  assert.ok(Array.isArray(sections) && sections.length > 0);
  assert.equal(d.h1, "IELTS Academic");
});

// ── J. 10,000-character prompt cap ──────────────────────────────

test("J. buildKnowledgeContext keeps the existing output contract", async () => {
  const context = await buildKnowledgeContext("IELTS fees");
  // formatKnowledgeResults() (unchanged) bounds output to maxCharacters,
  // with a final "\n..." suffix of up to 4 chars when it must truncate.
  assert.ok(context.length <= 10004, `context too long: ${context.length}`);
  assert.match(context, /\[\w+\/\w+ \| score \d+\]/);
  const headerCount = context.match(/\[\w+\/\w+ \| score \d+\]/g)?.length ?? 0;
  assert.ok(headerCount <= 6, `expected at most 6 documents, got ${headerCount}`);
});

function budgetPacks(pricing: unknown): Array<Record<string, unknown>> {
  const arr = (Array.isArray(pricing) ? pricing : []) as Array<Record<string, unknown>>;
  const packs = arr.filter((p) => typeof p.price === "number");
  assert.ok(packs.length > 0, "expected at least one priced pack");
  return packs;
}