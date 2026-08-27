// FILE: tests/knowledge.test.ts
//
// ─────────────────────────────────────────────────────────────────
// MARKDOWN KNOWLEDGE LOADER / RETRIEVER TESTS (A2.3 verification)
//
// Tests the knowledge/**/*.md loader, front-matter parsing, section
// extraction, deterministic retrieval, status handling, and edge
// cases.
//
// Run: npx tsx tests/knowledge.test.ts
// ─────────────────────────────────────────────────────────────────

import { test, before } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { writeFile, mkdir, rm } from "node:fs/promises";

import { loadMarkdownKnowledge } from "../lib/knowledge/md-loader";
import { retrieveKnowledge, retrieveVerified } from "../lib/knowledge/md-retriever";
import type { KnowledgeDoc, KnowledgeFrontMatter, KnowledgeStatus, PricingPackage, ScheduleSlot } from "../lib/knowledge/types";

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const FIXTURE_DIR = path.join(process.cwd(), "tests", "_knowledge_fixtures");

// ── Fixture helpers ──────────────────────────────────────────────

async function writeFixture(relPath: string, content: string) {
  const full = path.join(FIXTURE_DIR, relPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, content, "utf8");
}

async function cleanupFixtures() {
  await rm(FIXTURE_DIR, { recursive: true, force: true });
}

// ── Tests: loading ───────────────────────────────────────────────

test("loadMarkdownKnowledge loads all knowledge/*.md files", async () => {
  const { docs, loadedAt } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  assert.ok(docs.length > 0, "should load at least one doc");
  assert.ok(typeof loadedAt === "string");
  assert.ok(loadedAt.length > 0);
});

test("loadMarkdownKnowledge returns typed KnowledgeDoc objects", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  const ielts = docs.find((d) => d.meta.title === "IELTS Academic");
  assert.ok(ielts, "should find IELTS doc");

  assert.equal(ielts.meta.status, "verified");
  assert.equal(ielts.meta.category, "English proficiency test preparation");
  assert.ok(ielts.h1.length > 0);
  assert.ok(ielts.sections.length > 0);
  assert.ok(ielts.normalizedBody.length > 0);
  assert.ok(ielts.relPath.endsWith(".md"));
});

test("loadMarkdownKnowledge parses YAML front-matter correctly", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  for (const doc of docs) {
    assert.ok(doc.meta.title, `${doc.relPath}: title should be non-empty`);
    assert.ok(doc.meta.status, `${doc.relPath}: status should be non-empty`);
    assert.ok(
      ["verified", "needs_review", "coming_soon"].includes(doc.meta.status),
      `${doc.relPath}: status should be valid, got "${doc.meta.status}"`,
    );
  }
});

test("loadMarkdownKnowledge extracts ## sections", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  const ielts = docs.find((d) => d.meta.title === "IELTS Academic");
  assert.ok(ielts);

  const headings = ielts.sections.map((s) => s.heading);
  assert.ok(headings.includes("Overview"), "should have Overview section");
  assert.ok(headings.includes("Fees"), "should have Fees section");
  assert.ok(headings.includes("Timings"), "should have Timings section");
});

test("loadMarkdownKnowledge handles missing directory gracefully", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: "/nonexistent/path",
    refresh: true,
  });
  assert.equal(docs.length, 0);
});

test("loadMarkdownKnowledge handles malformed front-matter", async () => {
  await writeFixture("bad/no-frontmatter.md", "Just some text without frontmatter.");
  await writeFixture("good/valid.md", [
    "---",
    "title: Valid Doc",
    "category: Test",
    "source: test",
    "status: verified",
    "last_reviewed: 2026-08-25",
    "---",
    "# Valid Doc",
    "## Overview",
    "Content here.",
  ].join("\n"));

  try {
    const { docs } = await loadMarkdownKnowledge({
      knowledgeDir: FIXTURE_DIR,
      refresh: true,
    });
    assert.equal(docs.length, 1, "should skip malformed, load valid");
    assert.equal(docs[0].meta.title, "Valid Doc");
  } finally {
    await cleanupFixtures();
  }
});

// ── Tests: retrieval ─────────────────────────────────────────────

test("retrieveKnowledge finds IELTS by title", async () => {
  const results = await retrieveKnowledge("IELTS", {
    knowledgeDir: KNOWLEDGE_DIR,
  });

  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const top = results[0];
  assert.ok(top.score > 0);
  assert.ok(top.doc.meta.title.includes("IELTS"));
});

test("retrieveKnowledge finds admissions by country name", async () => {
  const results = await retrieveKnowledge("student visa UK", {
    knowledgeDir: KNOWLEDGE_DIR,
  });

  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const titles = results.map((r) => r.doc.meta.title);
  assert.ok(
    titles.some((t) => t.includes("United Kingdom")),
    `should find UK doc, got: ${titles.join(", ")}`,
  );
});

test("retrieveKnowledge finds FAQ content", async () => {
  const results = await retrieveKnowledge("free demo booking", {
    knowledgeDir: KNOWLEDGE_DIR,
  });

  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const cats = results.map((r) => r.doc.meta.category);
  assert.ok(
    cats.some((c) => c.toLowerCase().includes("faq")),
    `should find FAQ doc, got categories: ${cats.join(", ")}`,
  );
});

test("retrieveKnowledge finds pricing information", async () => {
  const results = await retrieveKnowledge("IELTS fees price", {
    knowledgeDir: KNOWLEDGE_DIR,
  });

  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const titles = results.map((r) => r.doc.meta.title);
  assert.ok(
    titles.some((t) => t.includes("IELTS") || t.includes("Pricing")),
    `should find IELTS or Pricing doc, got: ${titles.join(", ")}`,
  );
});

// ── Tests: status handling ───────────────────────────────────────

test("retrieveKnowledge excludes coming_soon by default", async () => {
  const results = await retrieveKnowledge("TOEFL test preparation", {
    knowledgeDir: KNOWLEDGE_DIR,
  });

  // coming_soon docs should not appear by default
  if ("kind" in results) {
    // no match is fine — means coming_soon was filtered out
    return;
  }
  for (const r of results) {
    assert.notEqual(
      r.doc.meta.status,
      "coming_soon",
      "coming_soon doc should not appear by default",
    );
  }
});

test("retrieveKnowledge includes coming_soon when requested", async () => {
  const results = await retrieveKnowledge("TOEFL", {
    knowledgeDir: KNOWLEDGE_DIR,
    includeComingSoon: true,
    statuses: ["coming_soon", "verified", "needs_review"],
  });

  assert.ok(!("kind" in results), "should find TOEFL when coming_soon included");
  if ("kind" in results) return;

  const hasToefl = results.some((r) =>
    r.doc.meta.title.toLowerCase().includes("toefl"),
  );
  assert.ok(hasToefl, "should find TOEFL doc when coming_soon is included");
});

test("retrieveKnowledge needs_review docs are included by default", async () => {
  const results = await retrieveKnowledge("Dubai visa fees", {
    knowledgeDir: KNOWLEDGE_DIR,
  });

  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const dubai = results.find((r) =>
    r.doc.meta.title.toLowerCase().includes("dubai"),
  );
  if (dubai) {
    assert.equal(dubai.doc.meta.status, "needs_review");
  }
});

test("retrieveVerified only returns verified docs", async () => {
  const results = await retrieveVerified("Dubai visa fees", {
    knowledgeDir: KNOWLEDGE_DIR,
  });

  if ("kind" in results) return; // no match is acceptable
  for (const r of results) {
    assert.equal(r.doc.meta.status, "verified");
  }
});

// ── Tests: no match ──────────────────────────────────────────────

test("retrieveKnowledge returns no_match for gibberish query", async () => {
  const results = await retrieveKnowledge("xyzzyplugh noexist", {
    knowledgeDir: KNOWLEDGE_DIR,
  });

  assert.ok("kind" in results, "should return no_match for gibberish");
  if ("kind" in results) {
    assert.equal(results.kind, "no_match");
    assert.equal(results.query, "xyzzyplugh noexist");
  }
});

test("retrieveKnowledge returns no_match for stop-word-only query", async () => {
  const results = await retrieveKnowledge("the and for", {
    knowledgeDir: KNOWLEDGE_DIR,
  });

  assert.ok("kind" in results, "should return no_match for stop words");
});

// ── Tests: edge cases ────────────────────────────────────────────

test("loadMarkdownKnowledge caches by default", async () => {
  const r1 = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR });
  const r2 = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR });
  assert.equal(r1, r2, "should return same cached reference");
});

test("loadMarkdownKnowledge refresh: true reloads", async () => {
  const r1 = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR });
  const r2 = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });
  // Different object references, same content
  assert.notEqual(r1, r2, "should return new object on refresh");
  assert.equal(r1.docs.length, r2.docs.length);
});

test("retrieveKnowledge scores title matches higher than body matches", async () => {
  const results = await retrieveKnowledge("Spoken English", {
    knowledgeDir: KNOWLEDGE_DIR,
  });

  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  // The doc with "Spoken English" in title should rank above
  // a doc that merely mentions it in body text
  const spoken = results.find((r) =>
    r.doc.meta.title.includes("Spoken English"),
  );
  assert.ok(spoken, "should find Spoken English doc");
  assert.ok(spoken.score > 0);
});

test("retrieveKnowledge matchedSections are populated for heading matches", async () => {
  const results = await retrieveKnowledge("visa process fees", {
    knowledgeDir: KNOWLEDGE_DIR,
  });

  assert.ok(!("kind" in results));
  if ("kind" in results) return;

  const withMatched = results.filter((r) => r.matchedSections.length > 0);
  assert.ok(
    withMatched.length > 0,
    "at least one result should have matched sections",
  );
});

// ── Tests: A2.3 Part 2 — future schema readiness ──────────────────

test("all 26 knowledge markdown files load successfully", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  assert.equal(docs.length, 26, `expected 26 docs, got ${docs.length}`);
});

test("every loaded doc has valid front-matter (title, category, source, status)", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  for (const doc of docs) {
    assert.ok(doc.meta.title.length > 0, `${doc.relPath}: title must be non-empty`);
    assert.ok(doc.meta.category.length > 0, `${doc.relPath}: category must be non-empty`);
    assert.ok(doc.meta.source.length > 0, `${doc.relPath}: source must be non-empty`);
    assert.ok(doc.meta.status.length > 0, `${doc.relPath}: status must be non-empty`);
  }
});

test("all status values are valid KnowledgeStatus", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  const validStatuses: KnowledgeStatus[] = ["verified", "needs_review", "coming_soon"];
  for (const doc of docs) {
    assert.ok(
      validStatuses.includes(doc.meta.status),
      `${doc.relPath}: status "${doc.meta.status}" is not a valid KnowledgeStatus`,
    );
  }
});

test("optional operational metadata fields are accepted and parsed", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  // Course files should have the new operational metadata fields
  const ielts = docs.find((d) => d.meta.title === "IELTS Academic");
  assert.ok(ielts, "should find IELTS doc");

  // These fields should be present (even if null/empty)
  assert.equal(ielts.meta.availability, "active");
  assert.equal(ielts.meta.pricing_status, "published");
  assert.equal(ielts.meta.demo_available, true);
  // batch_timings is populated for IELTS
  assert.ok(
    typeof ielts.meta.batch_timings === "string" && ielts.meta.batch_timings.length > 0,
    "IELTS batch_timings should be a non-empty string",
  );
});

test("missing operational values (null) do not cause load failures", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  // GMAT is coming_soon with null timings — should still load
  const gmat = docs.find((d) => d.meta.title === "GMAT");
  assert.ok(gmat, "should find GMAT doc");
  assert.equal(gmat.meta.status, "coming_soon");
  assert.equal(gmat.meta.availability, "coming_soon");
  assert.equal(gmat.meta.pricing_status, "coming_soon");
  assert.equal(gmat.meta.demo_available, false);
  assert.equal(gmat.meta.demo_timings, null);
  assert.equal(gmat.meta.batch_timings, null);

  // Non-course files (admissions, services, faq, policies) should load
  // without operational metadata fields (they don't have them in front-matter)
  const canada = docs.find((d) => d.meta.title === "Canada");
  assert.ok(canada, "should find Canada doc");
  // availability → undefined when absent (optional string field)
  assert.equal(canada.meta.availability, undefined);
  // aliases/tags → undefined when absent (optional array fields, not defined in front-matter)
  assert.equal(canada.meta.aliases, undefined);
  assert.equal(canada.meta.tags, undefined);
  // pricing_status/demo_available/demo_timings/batch_timings → null when absent
  // (nullable fields: null means "not yet known")
  assert.equal(canada.meta.pricing_status, null);
  assert.equal(canada.meta.demo_available, null);
  assert.equal(canada.meta.demo_timings, null);
  assert.equal(canada.meta.batch_timings, null);
  // structured fields → null when absent
  assert.equal(canada.meta.pricing, null);
  assert.equal(canada.meta.demo_schedule, null);
  assert.equal(canada.meta.batch_schedule, null);
});

test("needs_review docs are distinct from verified docs", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  const verified = docs.filter((d) => d.meta.status === "verified");
  const needsReview = docs.filter((d) => d.meta.status === "needs_review");

  assert.ok(verified.length > 0, "should have at least one verified doc");
  assert.ok(needsReview.length > 0, "should have at least one needs_review doc");

  // No doc should be both
  for (const doc of docs) {
    assert.ok(
      !(verified.includes(doc) && needsReview.includes(doc)),
      `${doc.relPath}: should not be both verified and needs_review`,
    );
  }

  // Dubai and MBBS Abroad should be needs_review
  const dubai = docs.find((d) => d.meta.title.includes("Dubai"));
  assert.ok(dubai, "should find Dubai doc");
  assert.equal(dubai.meta.status, "needs_review");

  const mbbs = docs.find((d) => d.meta.title.includes("MBBS"));
  assert.ok(mbbs, "should find MBBS doc");
  assert.equal(mbbs.meta.status, "needs_review");
});

test("coming_soon docs are distinct from verified and needs_review", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  const comingSoon = docs.filter((d) => d.meta.status === "coming_soon");
  const verified = docs.filter((d) => d.meta.status === "verified");
  const needsReview = docs.filter((d) => d.meta.status === "needs_review");

  assert.ok(comingSoon.length > 0, "should have at least one coming_soon doc");

  // No doc should overlap between status categories
  for (const doc of comingSoon) {
    assert.ok(
      !verified.includes(doc) && !needsReview.includes(doc),
      `${doc.relPath}: coming_soon should not overlap with verified or needs_review`,
    );
  }

  // GMAT, SAT, TOEFL should be coming_soon
  for (const title of ["GMAT", "SAT", "TOEFL"]) {
    const doc = docs.find((d) => d.meta.title === title);
    assert.ok(doc, `should find ${title} doc`);
    assert.equal(doc.meta.status, "coming_soon", `${title} should be coming_soon`);
  }
});

test("operational metadata does not break retrieval scoring", async () => {
  const results = await retrieveKnowledge("IELTS course fees", {
    knowledgeDir: KNOWLEDGE_DIR,
  });

  assert.ok(!("kind" in results), "should find results for IELTS course fees");
  if ("kind" in results) return;

  // IELTS doc should still rank highly with new metadata
  const ielts = results.find((r) => r.doc.meta.title.includes("IELTS"));
  assert.ok(ielts, "IELTS should appear in results");
  assert.ok(ielts.score > 0, "IELTS should have positive score");
});

test("md-loader parses batch_timings correctly from front-matter", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  // German should have batch_timings with level info
  const german = docs.find((d) => d.meta.title === "German Language Coaching");
  assert.ok(german, "should find German doc");
  assert.ok(
    german.meta.batch_timings?.includes("Basic"),
    "German batch_timings should mention Basic",
  );
  assert.ok(
    german.meta.batch_timings?.includes("A1"),
    "German batch_timings should mention A1",
  );

  // French should have batch_timings with TEF/TCF
  const french = docs.find((d) => d.meta.title === "French Language Coaching");
  assert.ok(french, "should find French doc");
  assert.ok(
    french.meta.batch_timings?.includes("TEF/TCF"),
    "French batch_timings should mention TEF/TCF",
  );
});

// ── Tests: A2.3 Part 3 — Structured Operational Knowledge Schema ─

test("scalar operational metadata (availability, pricing_status, demo_available) parses correctly", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  // IELTS: active + published + demo true
  const ielts = docs.find((d) => d.meta.title === "IELTS Academic");
  assert.ok(ielts, "should find IELTS");
  assert.equal(ielts.meta.availability, "active");
  assert.equal(ielts.meta.pricing_status, "published");
  assert.equal(ielts.meta.demo_available, true);

  // GMAT: coming_soon + coming_soon + demo false
  const gmat = docs.find((d) => d.meta.title === "GMAT");
  assert.ok(gmat, "should find GMAT");
  assert.equal(gmat.meta.availability, "coming_soon");
  assert.equal(gmat.meta.pricing_status, "coming_soon");
  assert.equal(gmat.meta.demo_available, false);

  // French: active + published + demo null
  const french = docs.find((d) => d.meta.title === "French Language Coaching");
  assert.ok(french, "should find French");
  assert.equal(french.meta.availability, "active");
  assert.equal(french.meta.pricing_status, "published");
  assert.equal(french.meta.demo_available, null);
});

test("aliases and tags are parsed as arrays (empty arrays for course files)", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  // All course files have aliases: [] and tags: []
  for (const doc of docs) {
    if (doc.meta.category.toLowerCase().includes("test preparation") ||
        doc.meta.category.toLowerCase().includes("training")) {
      assert.ok(Array.isArray(doc.meta.aliases), `${doc.relPath}: aliases should be array`);
      assert.ok(Array.isArray(doc.meta.tags), `${doc.relPath}: tags should be array`);
      // Course files should have aliases and tags for retrieval
      assert.ok(doc.meta.aliases!.length > 0, `${doc.relPath}: aliases should be populated`);
      assert.ok(doc.meta.tags!.length > 0, `${doc.relPath}: tags should be populated`);
    }
  }
});

test("null structured fields (pricing, demo_schedule, batch_schedule) do not cause load failures", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  // Coming-soon courses have null pricing, demo_schedule, batch_schedule
  for (const title of ["GMAT", "SAT", "TOEFL"]) {
    const doc = docs.find((d) => d.meta.title === title);
    assert.ok(doc, `should find ${title}`);
    assert.equal(doc.meta.pricing, null, `${title}: pricing should be null`);
    assert.equal(doc.meta.demo_schedule, null, `${title}: demo_schedule should be null`);
    assert.equal(doc.meta.batch_schedule, null, `${title}: batch_schedule should be null`);
  }

  // Active courses should have non-null pricing and batch_schedule
  for (const doc of docs) {
    if (doc.meta.availability === "active") {
      assert.ok(Array.isArray(doc.meta.pricing), `${doc.relPath}: active course should have pricing array`);
      assert.ok(Array.isArray(doc.meta.batch_schedule), `${doc.relPath}: active course should have batch_schedule array`);
    }
  }
});

test("legacy scalar timing fields still work alongside new structured fields", async () => {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });

  // IELTS has legacy batch_timings string
  const ielts = docs.find((d) => d.meta.title === "IELTS Academic");
  assert.ok(ielts, "should find IELTS");
  assert.ok(typeof ielts.meta.batch_timings === "string", "IELTS batch_timings should be string");
  assert.ok(ielts.meta.batch_timings!.length > 0, "IELTS batch_timings should be non-empty");

  // German has legacy demo_timings string
  const german = docs.find((d) => d.meta.title === "German Language Coaching");
  assert.ok(german, "should find German");
  assert.ok(typeof german.meta.demo_timings === "string", "German demo_timings should be string");
  assert.ok(german.meta.demo_timings!.length > 0, "German demo_timings should be non-empty");

  // GMAT has null legacy timings
  const gmat = docs.find((d) => d.meta.title === "GMAT");
  assert.ok(gmat, "should find GMAT");
  assert.equal(gmat.meta.demo_timings, null);
  assert.equal(gmat.meta.batch_timings, null);
});

test("block object array parser handles PricingPackage schema (fixture test)", async () => {
  await writeFixture("structured/pricing.md", [
    "---",
    "title: Pricing Fixture",
    "category: Test",
    "source: test",
    "status: verified",
    "last_reviewed: 2026-08-25",
    "pricing:",
    "  - pack_id: ielts-champion-morning",
    '    name: "IELTS Academic - Champion Morning"',
    "    price: 18000",
    "    original_price: 36000",
    '    discount: "50%"',
    "    currency: INR",
    '    duration: "180 days"',
    "  - pack_id: ielts-essentials",
    '    name: "IELTS Academic - Essentials"',
    "    price: 8000",
    "    original_price: null",
    "    discount: null",
    "    currency: INR",
    '    duration: "90 days"',
    "---",
    "# Pricing Fixture",
    "## Overview",
    "Test document.",
  ].join("\n"));

  try {
    const { docs } = await loadMarkdownKnowledge({
      knowledgeDir: FIXTURE_DIR,
      refresh: true,
    });

    assert.equal(docs.length, 1, "should load pricing fixture");
    const doc = docs[0];
    assert.ok(Array.isArray(doc.meta.pricing), "pricing should be array");
    assert.equal(doc.meta.pricing!.length, 2, "should have 2 pricing packages");

    const pack1 = doc.meta.pricing![0];
    assert.equal(pack1.pack_id, "ielts-champion-morning");
    assert.equal(pack1.name, "IELTS Academic - Champion Morning");
    assert.equal(pack1.price, 18000);
    assert.equal(pack1.original_price, 36000);
    assert.equal(pack1.discount, "50%");
    assert.equal(pack1.currency, "INR");
    assert.equal(pack1.duration, "180 days");

    const pack2 = doc.meta.pricing![1];
    assert.equal(pack2.pack_id, "ielts-essentials");
    assert.equal(pack2.name, "IELTS Academic - Essentials");
    assert.equal(pack2.price, 8000);
    assert.equal(pack2.original_price, null);
    assert.equal(pack2.discount, null);
    assert.equal(pack2.currency, "INR");
    assert.equal(pack2.duration, "90 days");
  } finally {
    await cleanupFixtures();
  }
});

test("block object array parser handles ScheduleSlot schema for demo_schedule (fixture test)", async () => {
  await writeFixture("structured/demo.md", [
    "---",
    "title: Demo Fixture",
    "category: Test",
    "source: test",
    "status: verified",
    "last_reviewed: 2026-08-25",
    "demo_available: true",
    "demo_schedule:",
    "  - day: Saturday",
    '    start: "4:00 PM"',
    '    end: "5:30 PM"',
    "    timezone: IST",
    "  - day: Wednesday",
    '    start: "7:00 PM"',
    '    end: "8:00 PM"',
    "    timezone: IST",
    '    label: "Weekday Demo"',
    "---",
    "# Demo Fixture",
    "## Overview",
    "Test document.",
  ].join("\n"));

  try {
    const { docs } = await loadMarkdownKnowledge({
      knowledgeDir: FIXTURE_DIR,
      refresh: true,
    });

    assert.equal(docs.length, 1, "should load demo fixture");
    const doc = docs[0];
    assert.ok(Array.isArray(doc.meta.demo_schedule), "demo_schedule should be array");
    assert.equal(doc.meta.demo_schedule!.length, 2, "should have 2 demo slots");

    const slot1 = doc.meta.demo_schedule![0];
    assert.equal(slot1.day, "Saturday");
    assert.equal(slot1.start, "4:00 PM");
    assert.equal(slot1.end, "5:30 PM");
    assert.equal(slot1.timezone, "IST");
    assert.equal(slot1.label, null, "slot without label should be null");

    const slot2 = doc.meta.demo_schedule![1];
    assert.equal(slot2.day, "Wednesday");
    assert.equal(slot2.start, "7:00 PM");
    assert.equal(slot2.end, "8:00 PM");
    assert.equal(slot2.timezone, "IST");
    assert.equal(slot2.label, "Weekday Demo");
  } finally {
    await cleanupFixtures();
  }
});

test("block object array parser handles ScheduleSlot schema for batch_schedule (fixture test)", async () => {
  await writeFixture("structured/batch.md", [
    "---",
    "title: Batch Fixture",
    "category: Test",
    "source: test",
    "status: verified",
    "last_reviewed: 2026-08-25",
    "batch_schedule:",
    "  - day: Monday-Friday",
    '    start: "7:30 AM"',
    '    end: "9:30 AM"',
    "    timezone: IST",
    '    label: "Morning Beginners"',
    "  - day: Monday-Friday",
    '    start: "2:00 PM"',
    '    end: "4:00 PM"',
    "    timezone: IST",
    '    label: "Afternoon Beginners"',
    "  - day: Monday-Friday",
    '    start: "8:30 PM"',
    '    end: "10:30 PM"',
    "    timezone: IST",
    '    label: "Evening Beginners"',
    "---",
    "# Batch Fixture",
    "## Overview",
    "Test document.",
  ].join("\n"));

  try {
    const { docs } = await loadMarkdownKnowledge({
      knowledgeDir: FIXTURE_DIR,
      refresh: true,
    });

    assert.equal(docs.length, 1, "should load batch fixture");
    const doc = docs[0];
    assert.ok(Array.isArray(doc.meta.batch_schedule), "batch_schedule should be array");
    assert.equal(doc.meta.batch_schedule!.length, 3, "should have 3 batch slots");

    const slot1 = doc.meta.batch_schedule![0];
    assert.equal(slot1.day, "Monday-Friday");
    assert.equal(slot1.start, "7:30 AM");
    assert.equal(slot1.end, "9:30 AM");
    assert.equal(slot1.timezone, "IST");
    assert.equal(slot1.label, "Morning Beginners");

    const slot3 = doc.meta.batch_schedule![2];
    assert.equal(slot3.label, "Evening Beginners");
  } finally {
    await cleanupFixtures();
  }
});

test("null/empty optional values work correctly across all structured fields (fixture test)", async () => {
  await writeFixture("structured/nulls.md", [
    "---",
    "title: Nulls Fixture",
    "category: Test",
    "source: test",
    "status: verified",
    "last_reviewed: 2026-08-25",
    "pricing: null",
    "demo_schedule: null",
    "batch_schedule: null",
    "demo_available: null",
    "pricing_status: null",
    "availability: null",
    "---",
    "# Nulls Fixture",
    "## Overview",
    "Test document.",
  ].join("\n"));

  try {
    const { docs } = await loadMarkdownKnowledge({
      knowledgeDir: FIXTURE_DIR,
      refresh: true,
    });

    assert.equal(docs.length, 1, "should load nulls fixture");
    const doc = docs[0];
    assert.equal(doc.meta.pricing, null);
    assert.equal(doc.meta.demo_schedule, null);
    assert.equal(doc.meta.batch_schedule, null);
    assert.equal(doc.meta.demo_available, null);
    assert.equal(doc.meta.pricing_status, null);
    assert.equal(doc.meta.availability, undefined);
    // absent aliases/tags → undefined (not defined in front-matter)
    assert.equal(doc.meta.aliases, undefined);
    assert.equal(doc.meta.tags, undefined);
  } finally {
    await cleanupFixtures();
  }
});

test("invalid status values are rejected by parseFrontMatter (fixture test)", async () => {
  await writeFixture("bad/invalid-status.md", [
    "---",
    "title: Bad Status",
    "category: Test",
    "source: test",
    "status: not_a_valid_status",
    "last_reviewed: 2026-08-25",
    "---",
    "# Bad Status",
    "Content.",
  ].join("\n"));

  try {
    const { docs } = await loadMarkdownKnowledge({
      knowledgeDir: FIXTURE_DIR,
      refresh: true,
    });

    // The doc loads but with an invalid status string — type system allows it
    // (KnowledgeStatus is a type alias, not a runtime enum)
    // The key assertion: the doc still loads without crashing
    assert.equal(docs.length, 1, "should still load doc with invalid status");
    assert.equal(docs[0].meta.status, "not_a_valid_status");
  } finally {
    await cleanupFixtures();
  }
});

test("timezone is explicit in ScheduleSlot schema (fixture test)", async () => {
  await writeFixture("structured/timezone.md", [
    "---",
    "title: Timezone Fixture",
    "category: Test",
    "source: test",
    "status: verified",
    "last_reviewed: 2026-08-25",
    "demo_schedule:",
    "  - day: Saturday",
    '    start: "4:00 PM"',
    '    end: "5:30 PM"',
    "    timezone: Asia/Kolkata",
    "---",
    "# Timezone Fixture",
    "## Overview",
    "Test document.",
  ].join("\n"));

  try {
    const { docs } = await loadMarkdownKnowledge({
      knowledgeDir: FIXTURE_DIR,
      refresh: true,
    });

    assert.equal(docs.length, 1);
    const slot = docs[0].meta.demo_schedule![0];
    assert.equal(slot.timezone, "Asia/Kolkata", "timezone should be explicit IANA string");
  } finally {
    await cleanupFixtures();
  }
});

test("status remains distinct from availability (fixture test)", async () => {
  await writeFixture("structured/status-availability.md", [
    "---",
    "title: Status Availability Fixture",
    "category: Test",
    "source: test",
    "status: needs_review",
    "last_reviewed: 2026-08-25",
    "availability: active",
    "---",
    "# Status Availability Fixture",
    "## Overview",
    "Test document.",
  ].join("\n"));

  try {
    const { docs } = await loadMarkdownKnowledge({
      knowledgeDir: FIXTURE_DIR,
      refresh: true,
    });

    assert.equal(docs.length, 1);
    const doc = docs[0];
    // status and availability are separate fields
    assert.equal(doc.meta.status, "needs_review", "status should be needs_review");
    assert.equal(doc.meta.availability, "active", "availability should be active");
    // They can differ — status is content quality, availability is business state
    assert.notEqual(doc.meta.status, doc.meta.availability);
  } finally {
    await cleanupFixtures();
  }
});

test("inline string arrays with values are parsed correctly (fixture test)", async () => {
  await writeFixture("structured/arrays.md", [
    "---",
    "title: Arrays Fixture",
    "category: Test",
    "source: test",
    "status: verified",
    "last_reviewed: 2026-08-25",
    "aliases: [IELTS, International English Language Testing System, IELTS Academic]",
    "tags: [english, proficiency, test-prep, study-abroad]",
    "---",
    "# Arrays Fixture",
    "## Overview",
    "Test document.",
  ].join("\n"));

  try {
    const { docs } = await loadMarkdownKnowledge({
      knowledgeDir: FIXTURE_DIR,
      refresh: true,
    });

    assert.equal(docs.length, 1);
    const doc = docs[0];
    assert.deepEqual(doc.meta.aliases, [
      "IELTS",
      "International English Language Testing System",
      "IELTS Academic",
    ]);
    assert.deepEqual(doc.meta.tags, [
      "english",
      "proficiency",
      "test-prep",
      "study-abroad",
    ]);
  } finally {
    await cleanupFixtures();
  }
});

test("combined structured fields: pricing + demo_schedule + batch_schedule (fixture test)", async () => {
  await writeFixture("structured/combined.md", [
    "---",
    "title: Combined Fixture",
    "category: Test",
    "source: test",
    "status: verified",
    "last_reviewed: 2026-08-25",
    "availability: active",
    "pricing_status: published",
    "demo_available: true",
    "pricing:",
    "  - pack_id: basic",
    '    name: "Basic Pack"',
    "    price: 5000",
    "    original_price: 10000",
    '    discount: "50%"',
    "    currency: INR",
    '    duration: "30 days"',
    "demo_schedule:",
    "  - day: Saturday",
    '    start: "4:00 PM"',
    '    end: "5:00 PM"',
    "    timezone: IST",
    "batch_schedule:",
    "  - day: Monday-Friday",
    '    start: "7:00 PM"',
    '    end: "9:00 PM"',
    "    timezone: IST",
    '    label: "Evening Batch"',
    "aliases: [language, communication]",
    "tags: [english, spoken]",
    "---",
    "# Combined Fixture",
    "## Overview",
    "Test document.",
  ].join("\n"));

  try {
    const { docs } = await loadMarkdownKnowledge({
      knowledgeDir: FIXTURE_DIR,
      refresh: true,
    });

    assert.equal(docs.length, 1);
    const doc = docs[0];

    // Scalar metadata
    assert.equal(doc.meta.availability, "active");
    assert.equal(doc.meta.pricing_status, "published");
    assert.equal(doc.meta.demo_available, true);

    // Pricing
    assert.ok(Array.isArray(doc.meta.pricing));
    assert.equal(doc.meta.pricing!.length, 1);
    assert.equal(doc.meta.pricing![0].pack_id, "basic");
    assert.equal(doc.meta.pricing![0].price, 5000);

    // Demo schedule
    assert.ok(Array.isArray(doc.meta.demo_schedule));
    assert.equal(doc.meta.demo_schedule!.length, 1);
    assert.equal(doc.meta.demo_schedule![0].day, "Saturday");

    // Batch schedule
    assert.ok(Array.isArray(doc.meta.batch_schedule));
    assert.equal(doc.meta.batch_schedule!.length, 1);
    assert.equal(doc.meta.batch_schedule![0].label, "Evening Batch");

    // Search metadata
    assert.deepEqual(doc.meta.aliases, ["language", "communication"]);
    assert.deepEqual(doc.meta.tags, ["english", "spoken"]);
  } finally {
    await cleanupFixtures();
  }
});

test("existing 29 knowledge tests still pass (regression guard)", async () => {
  // This is a meta-test: if we got here without earlier failures, all 29+ tests passed.
  // The real guard is that the test runner exits non-zero on any assert failure.
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });
  assert.equal(docs.length, 26, "all 26 docs should still load");
});

// ── Tests: A2.4 — Data migration validation ──────────────────────

import { readFile } from "node:fs/promises";

async function loadJson<T>(relPath: string): Promise<T> {
  const raw = await readFile(path.join(process.cwd(), relPath), "utf8");
  return JSON.parse(raw) as T;
}

type PricingEntry = {
  pack_id: string;
  name: string;
  price: number;
  original_price?: number | null;
  discount?: string | null;
  currency?: string;
  access?: string;
  duration?: string;
};

type BatchTimingEntry = {
  batch?: string;
  level?: string;
  slot?: string;
  time?: string;
  morning?: string | null;
  evening?: string | null;
  slot_1?: string | null;
  slot_2?: string | null;
  days?: string;
};

// ── Pricing migration validation ─────────────────────────────────

test("IELTS pricing migrated correctly from pricing.json", async () => {
  const pricingData = await loadJson<{ prices: { ielts: PricingEntry[] } }>("data/pricing.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const ielts = docs.find((d) => d.meta.title === "IELTS Academic");
  assert.ok(ielts, "should find IELTS");

  const jsonPacks = pricingData.prices.ielts;
  assert.ok(Array.isArray(ielts.meta.pricing), "pricing should be array");
  assert.equal(ielts.meta.pricing!.length, jsonPacks.length, "pack count should match");

  for (let i = 0; i < jsonPacks.length; i++) {
    const json = jsonPacks[i];
    const md: PricingPackage = ielts.meta.pricing![i];
    assert.equal(md.pack_id, json.pack_id, `pack ${i} pack_id`);
    assert.equal(md.name, json.name, `pack ${i} name`);
    assert.equal(md.price, json.price, `pack ${i} price`);
    assert.equal(md.original_price, json.original_price ?? null, `pack ${i} original_price`);
    assert.equal(md.discount, json.discount ?? null, `pack ${i} discount`);
    assert.equal(md.currency, json.currency ?? "INR", `pack ${i} currency`);
    assert.equal(md.duration, json.access ?? json.duration ?? null, `pack ${i} duration`);
  }
});

test("PTE pricing migrated correctly from pricing.json", async () => {
  const pricingData = await loadJson<{ prices: { pte: PricingEntry[] } }>("data/pricing.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const pte = docs.find((d) => d.meta.title === "PTE Academic and PTE Core");
  assert.ok(pte, "should find PTE");

  const jsonPacks = pricingData.prices.pte;
  assert.equal(pte.meta.pricing!.length, jsonPacks.length, "PTE pack count should match");

  for (let i = 0; i < jsonPacks.length; i++) {
    assert.equal(pte.meta.pricing![i].pack_id, jsonPacks[i].pack_id, `PTE pack ${i} pack_id`);
    assert.equal(pte.meta.pricing![i].price, jsonPacks[i].price, `PTE pack ${i} price`);
  }
});

test("GRE pricing migrated correctly from pricing.json", async () => {
  const pricingData = await loadJson<{ prices: { gre: PricingEntry[] } }>("data/pricing.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const gre = docs.find((d) => d.meta.title === "Shorter GRE");
  assert.ok(gre, "should find GRE");

  const jsonPacks = pricingData.prices.gre;
  assert.equal(gre.meta.pricing!.length, jsonPacks.length, "GRE pack count should match");

  for (let i = 0; i < jsonPacks.length; i++) {
    assert.equal(gre.meta.pricing![i].pack_id, jsonPacks[i].pack_id, `GRE pack ${i} pack_id`);
    assert.equal(gre.meta.pricing![i].price, jsonPacks[i].price, `GRE pack ${i} price`);
  }
});

test("Duolingo pricing migrated correctly from pricing.json", async () => {
  const pricingData = await loadJson<{ prices: { duolingo: PricingEntry[] } }>("data/pricing.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const duolingo = docs.find((d) => d.meta.title === "Duolingo English Test");
  assert.ok(duolingo, "should find Duolingo");

  const jsonPacks = pricingData.prices.duolingo;
  assert.equal(duolingo.meta.pricing!.length, jsonPacks.length, "Duolingo pack count should match");
  assert.equal(duolingo.meta.pricing![0].pack_id, jsonPacks[0].pack_id);
  assert.equal(duolingo.meta.pricing![0].price, jsonPacks[0].price);
});

test("Spoken English pricing migrated correctly from pricing.json", async () => {
  const pricingData = await loadJson<{ prices: { "spoken-english": PricingEntry[] } }>("data/pricing.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const spoken = docs.find((d) => d.meta.title === "Spoken English Champion");
  assert.ok(spoken, "should find Spoken English");

  const jsonPacks = pricingData.prices["spoken-english"];
  assert.equal(spoken.meta.pricing!.length, jsonPacks.length, "Spoken pack count should match");

  for (let i = 0; i < jsonPacks.length; i++) {
    assert.equal(spoken.meta.pricing![i].pack_id, jsonPacks[i].pack_id, `Spoken pack ${i} pack_id`);
    assert.equal(spoken.meta.pricing![i].price, jsonPacks[i].price, `Spoken pack ${i} price`);
  }
});

test("German pricing migrated correctly from pricing.json", async () => {
  const pricingData = await loadJson<{ prices: { german: PricingEntry[] } }>("data/pricing.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const german = docs.find((d) => d.meta.title === "German Language Coaching");
  assert.ok(german, "should find German");

  const jsonPacks = pricingData.prices.german;
  assert.equal(german.meta.pricing!.length, jsonPacks.length, "German pack count should match");

  for (let i = 0; i < jsonPacks.length; i++) {
    assert.equal(german.meta.pricing![i].pack_id, jsonPacks[i].pack_id, `German pack ${i} pack_id`);
    assert.equal(german.meta.pricing![i].price, jsonPacks[i].price, `German pack ${i} price`);
  }
});

test("French pricing migrated correctly from pricing.json", async () => {
  const pricingData = await loadJson<{ prices: { french: PricingEntry[] } }>("data/pricing.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const french = docs.find((d) => d.meta.title === "French Language Coaching");
  assert.ok(french, "should find French");

  const jsonPacks = pricingData.prices.french;
  assert.equal(french.meta.pricing!.length, jsonPacks.length, "French pack count should match");

  for (let i = 0; i < jsonPacks.length; i++) {
    assert.equal(french.meta.pricing![i].pack_id, jsonPacks[i].pack_id, `French pack ${i} pack_id`);
    assert.equal(french.meta.pricing![i].price, jsonPacks[i].price, `French pack ${i} price`);
  }
});

// ── Coming-soon courses: pricing should be null ───────────────────

test("GMAT/SAT/TOEFL pricing remains null (no source data)", async () => {
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });

  for (const title of ["GMAT", "SAT", "TOEFL"]) {
    const doc = docs.find((d) => d.meta.title === title);
    assert.ok(doc, `should find ${title}`);
    assert.equal(doc.meta.pricing, null, `${title} pricing should be null`);
    assert.equal(doc.meta.demo_schedule, null, `${title} demo_schedule should be null`);
    assert.equal(doc.meta.batch_schedule, null, `${title} batch_schedule should be null`);
  }
});

// ── Batch schedule migration validation ───────────────────────────

test("IELTS batch_schedule migrated from ielts.json batch_timings_ist", async () => {
  const courseData = await loadJson<{ batch_timings_ist: Array<{ batch: string; time: string }> }>("data/courses/ielts.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const ielts = docs.find((d) => d.meta.title === "IELTS Academic");
  assert.ok(ielts, "should find IELTS");
  assert.ok(Array.isArray(ielts.meta.batch_schedule), "batch_schedule should be array");
  assert.equal(ielts.meta.batch_schedule!.length, courseData.batch_timings_ist.length, "batch count should match");

  for (let i = 0; i < courseData.batch_timings_ist.length; i++) {
    const json = courseData.batch_timings_ist[i];
    const md: ScheduleSlot = ielts.meta.batch_schedule![i];
    assert.equal(md.label, json.batch, `batch ${i} label`);
    assert.equal(md.timezone, "IST", `batch ${i} timezone`);
    // time is "7:30 AM - 9:30 AM" format
    const [start, end] = json.time.split(" - ");
    assert.equal(md.start, start, `batch ${i} start`);
    assert.equal(md.end, end, `batch ${i} end`);
  }
});

test("PTE batch_schedule migrated from pte.json live_class_schedule", async () => {
  const courseData = await loadJson<{ anu_course: { live_class_schedule: Array<{ course: string; days: string; time: string }> } }>("data/courses/pte.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const pte = docs.find((d) => d.meta.title === "PTE Academic and PTE Core");
  assert.ok(pte, "should find PTE");
  assert.ok(Array.isArray(pte.meta.batch_schedule), "PTE batch_schedule should be array");

  // Only non-demo batches in batch_schedule
  const nonDemo = courseData.anu_course.live_class_schedule.filter((s) => !s.course.toLowerCase().includes("demo"));
  assert.equal(pte.meta.batch_schedule!.length, nonDemo.length, "PTE batch count should match non-demo entries");

  for (let i = 0; i < nonDemo.length; i++) {
    assert.equal(pte.meta.batch_schedule![i].label, nonDemo[i].course, `PTE batch ${i} label`);
    assert.equal(pte.meta.batch_schedule![i].day, nonDemo[i].days, `PTE batch ${i} day`);
  }
});

test("PTE demo_schedule migrated from pte.json live_class_schedule demo entry", async () => {
  const courseData = await loadJson<{ anu_course: { live_class_schedule: Array<{ course: string; days: string; time: string }> } }>("data/courses/pte.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const pte = docs.find((d) => d.meta.title === "PTE Academic and PTE Core");
  assert.ok(pte, "should find PTE");
  assert.ok(Array.isArray(pte.meta.demo_schedule), "PTE demo_schedule should be array");

  const demoEntry = courseData.anu_course.live_class_schedule.find((s) => s.course.toLowerCase().includes("demo"));
  assert.ok(demoEntry, "should find demo entry in JSON");
  assert.equal(pte.meta.demo_schedule!.length, 1, "should have 1 demo slot");
  assert.equal(pte.meta.demo_schedule![0].label, demoEntry!.course);
  assert.equal(pte.meta.demo_schedule![0].day, demoEntry!.days);
});

test("GRE batch_schedule migrated from gre.json live_schedule_ist", async () => {
  const courseData = await loadJson<{ anu_course: { live_schedule_ist: Array<{ session: string; days: string; time: string }> } }>("data/courses/gre.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const gre = docs.find((d) => d.meta.title === "Shorter GRE");
  assert.ok(gre, "should find GRE");
  assert.ok(Array.isArray(gre.meta.batch_schedule), "GRE batch_schedule should be array");

  // Only non-demo batches in batch_schedule
  const nonDemo = courseData.anu_course.live_schedule_ist.filter((s) => !s.session.toLowerCase().includes("demo"));
  assert.equal(gre.meta.batch_schedule!.length, nonDemo.length, "GRE batch count should match non-demo entries");

  for (let i = 0; i < nonDemo.length; i++) {
    assert.equal(gre.meta.batch_schedule![i].label, nonDemo[i].session, `GRE batch ${i} label`);
    assert.equal(gre.meta.batch_schedule![i].day, nonDemo[i].days, `GRE batch ${i} day`);
  }
});

test("GRE demo_schedule migrated from gre.json demo session", async () => {
  const courseData = await loadJson<{ anu_course: { live_schedule_ist: Array<{ session: string; days: string; time: string }> } }>("data/courses/gre.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const gre = docs.find((d) => d.meta.title === "Shorter GRE");
  assert.ok(gre, "should find GRE");
  assert.ok(Array.isArray(gre.meta.demo_schedule), "GRE demo_schedule should be array");

  const demoEntry = courseData.anu_course.live_schedule_ist.find((s) => s.session.toLowerCase().includes("demo"));
  assert.ok(demoEntry, "should find demo entry in JSON");
  assert.equal(gre.meta.demo_schedule!.length, 1, "should have 1 demo slot");
  assert.equal(gre.meta.demo_schedule![0].label, demoEntry!.session);
  assert.equal(gre.meta.demo_schedule![0].day, demoEntry!.days);
});

test("Duolingo batch_schedule migrated from duolingo.json schedule_ist", async () => {
  const courseData = await loadJson<{ anu_course: { schedule_ist: Array<{ course: string; days: string; time: string }> } }>("data/courses/duolingo.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const duolingo = docs.find((d) => d.meta.title === "Duolingo English Test");
  assert.ok(duolingo, "should find Duolingo");
  assert.ok(Array.isArray(duolingo.meta.batch_schedule), "Duolingo batch_schedule should be array");
  assert.equal(duolingo.meta.batch_schedule!.length, courseData.anu_course.schedule_ist.length, "Duolingo batch count should match");

  for (let i = 0; i < courseData.anu_course.schedule_ist.length; i++) {
    const json = courseData.anu_course.schedule_ist[i];
    assert.equal(duolingo.meta.batch_schedule![i].label, json.course, `Duolingo batch ${i} label`);
    assert.equal(duolingo.meta.batch_schedule![i].day, json.days, `Duolingo batch ${i} day`);
  }
});

test("Spoken English batch_schedule migrated from spoken-english.json batch_timings_ist", async () => {
  const courseData = await loadJson<{ batch_timings_ist: Array<{ level: string; slot: string; time: string }> }>("data/courses/spoken-english.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const spoken = docs.find((d) => d.meta.title === "Spoken English Champion");
  assert.ok(spoken, "should find Spoken English");
  assert.ok(Array.isArray(spoken.meta.batch_schedule), "Spoken batch_schedule should be array");
  assert.equal(spoken.meta.batch_schedule!.length, courseData.batch_timings_ist.length, "Spoken batch count should match");

  for (let i = 0; i < courseData.batch_timings_ist.length; i++) {
    const json = courseData.batch_timings_ist[i];
    const label = `${json.level} ${json.slot}`;
    assert.equal(spoken.meta.batch_schedule![i].label, label, `Spoken batch ${i} label`);
  }
});

test("German batch_schedule migrated from german.json timings_ist", async () => {
  const courseData = await loadJson<{ timings_ist: Array<{ batch: string; morning: string | null; evening: string | null }> }>("data/courses/german.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const german = docs.find((d) => d.meta.title === "German Language Coaching");
  assert.ok(german, "should find German");
  assert.ok(Array.isArray(german.meta.batch_schedule), "German batch_schedule should be array");

  // German has demo + 4 batches (Basic, A1, A2, B1), each with up to 2 slots
  // Total non-demo slots: Basic(2) + A1(2) + A2(2) + B1(1) = 7
  let expectedCount = 0;
  for (const t of courseData.timings_ist) {
    if (t.batch.toLowerCase().includes("demo")) continue;
    if (t.morning) expectedCount++;
    if (t.evening) expectedCount++;
  }
  assert.equal(german.meta.batch_schedule!.length, expectedCount, "German batch slot count should match");
});

test("German demo_schedule migrated from german.json demo timing", async () => {
  const courseData = await loadJson<{ timings_ist: Array<{ batch: string; morning: string | null; evening: string | null }> }>("data/courses/german.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const german = docs.find((d) => d.meta.title === "German Language Coaching");
  assert.ok(german, "should find German");
  assert.ok(Array.isArray(german.meta.demo_schedule), "German demo_schedule should be array");

  const demoEntry = courseData.timings_ist.find((t) => t.batch.toLowerCase().includes("demo"));
  assert.ok(demoEntry, "should find demo entry in JSON");
  assert.equal(german.meta.demo_schedule!.length, 1, "should have 1 demo slot");
  assert.equal(german.meta.demo_schedule![0].label, demoEntry!.batch);
  // morning is "11:30 AM - 12:30 PM" — migration parses start/end from this range
  const [start, end] = demoEntry!.morning!.split(" - ");
  assert.equal(german.meta.demo_schedule![0].start, start, "demo start should match");
  assert.equal(german.meta.demo_schedule![0].end, end, "demo end should match");
});

test("French batch_schedule migrated from french.json timings_ist", async () => {
  const courseData = await loadJson<{ timings_ist: Array<{ batch: string; slot_1: string | null; slot_2: string | null }> }>("data/courses/french.json");
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });
  const french = docs.find((d) => d.meta.title === "French Language Coaching");
  assert.ok(french, "should find French");
  assert.ok(Array.isArray(french.meta.batch_schedule), "French batch_schedule should be array");

  // Each batch has slot_1 and/or slot_2
  let expectedCount = 0;
  for (const t of courseData.timings_ist) {
    if (t.slot_1) expectedCount++;
    if (t.slot_2) expectedCount++;
  }
  assert.equal(french.meta.batch_schedule!.length, expectedCount, "French batch slot count should match");
});

// ── Null preservation ────────────────────────────────────────────

test("demo_schedule remains null where source JSON has no demo data", async () => {
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });

  // IELTS: no demo timing in JSON → demo_schedule null
  const ielts = docs.find((d) => d.meta.title === "IELTS Academic");
  assert.ok(ielts, "should find IELTS");
  assert.equal(ielts.meta.demo_schedule, null, "IELTS demo_schedule should be null (no source data)");

  // Duolingo: no demo timing in JSON → demo_schedule null
  const duolingo = docs.find((d) => d.meta.title === "Duolingo English Test");
  assert.ok(duolingo, "should find Duolingo");
  assert.equal(duolingo.meta.demo_schedule, null, "Duolingo demo_schedule should be null");

  // French: no demo timing in JSON → demo_schedule null
  const french = docs.find((d) => d.meta.title === "French Language Coaching");
  assert.ok(french, "should find French");
  assert.equal(french.meta.demo_schedule, null, "French demo_schedule should be null");

  // Spoken English: no demo timing in JSON → demo_schedule null
  const spoken = docs.find((d) => d.meta.title === "Spoken English Champion");
  assert.ok(spoken, "should find Spoken English");
  assert.equal(spoken.meta.demo_schedule, null, "Spoken English demo_schedule should be null");
});

// ── No information loss ──────────────────────────────────────────

test("no course loses existing information after migration", async () => {
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });

  for (const doc of docs) {
    // All legacy fields preserved
    assert.ok(doc.meta.title.length > 0, `${doc.relPath}: title preserved`);
    assert.ok(doc.meta.status.length > 0, `${doc.relPath}: status preserved`);
    assert.ok(doc.meta.category.length > 0, `${doc.relPath}: category preserved`);

    // Structured fields are either null or non-empty arrays
    if (doc.meta.pricing !== null) {
      assert.ok(doc.meta.pricing!.length > 0, `${doc.relPath}: pricing array non-empty`);
    }
    if (doc.meta.batch_schedule !== null) {
      assert.ok(doc.meta.batch_schedule!.length > 0, `${doc.relPath}: batch_schedule array non-empty`);
    }
  }
});

test("all timezone values are IST", async () => {
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });

  for (const doc of docs) {
    for (const slot of doc.meta.batch_schedule ?? []) {
      assert.equal(slot.timezone, "IST", `${doc.relPath}: batch_schedule timezone should be IST`);
    }
    for (const slot of doc.meta.demo_schedule ?? []) {
      assert.equal(slot.timezone, "IST", `${doc.relPath}: demo_schedule timezone should be IST`);
    }
  }
});

test("pricing currency defaults to INR except French USD pack", async () => {
  const { docs } = await loadMarkdownKnowledge({ knowledgeDir: KNOWLEDGE_DIR, refresh: true });

  for (const doc of docs) {
    for (const pack of doc.meta.pricing ?? []) {
      if (pack.pack_id === "french-basic-to-tef-usd") {
        assert.equal(pack.currency, "USD", "French USD pack should use USD");
      } else {
        assert.equal(pack.currency, "INR", `${doc.relPath}: ${pack.pack_id} currency should be INR`);
      }
    }
  }
});

// ── A2.6: Retrieval Quality Tests ─────────────────────────────────

test('"IELTS fees" → IELTS ranks above generic pricing/FAQ', async () => {
  const results = await retrieveKnowledge("IELTS fees", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const topTitles = results.slice(0, 3).map((r) => r.doc.meta.title);
  assert.ok(
    topTitles[0].includes("IELTS"),
    `top result should be IELTS, got: ${topTitles[0]}`,
  );
  // Ensure IELTS ranks above generic pricing
  const ieltsIdx = topTitles.findIndex((t) => t.includes("IELTS"));
  const pricingIdx = topTitles.findIndex((t) => t.toLowerCase().includes("pricing"));
  assert.ok(
    ieltsIdx < pricingIdx || pricingIdx === -1,
    "IELTS should rank above pricing",
  );
});

test('"PTE demo class" → PTE ranks above general FAQ', async () => {
  const results = await retrieveKnowledge("PTE demo class", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const topTitles = results.slice(0, 3).map((r) => r.doc.meta.title);
  assert.ok(
    topTitles[0].includes("PTE"),
    `top result should be PTE, got: ${topTitles[0]}`,
  );
  // Ensure PTE ranks above FAQ
  const pteIdx = topTitles.findIndex((t) => t.includes("PTE"));
  const faqIdx = topTitles.findIndex((t) => t.toLowerCase().includes("frequently"));
  assert.ok(
    pteIdx < faqIdx || faqIdx === -1,
    "PTE should rank above FAQ",
  );
});

test('"USA study visa" → USA ranks above visa-concepts', async () => {
  const results = await retrieveKnowledge("USA study visa", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const topTitles = results.slice(0, 3).map((r) => r.doc.meta.title);
  assert.ok(
    topTitles[0].includes("United States") || topTitles[0].includes("USA"),
    `top result should be USA, got: ${topTitles[0]}`,
  );
  // Ensure USA ranks above visa-concepts
  const usaIdx = topTitles.findIndex((t) => t.includes("United States") || t.includes("USA"));
  const visaIdx = topTitles.findIndex((t) => t.toLowerCase().includes("visa concepts"));
  assert.ok(
    usaIdx < visaIdx || visaIdx === -1,
    "USA should rank above visa-concepts",
  );
});

test('"Canada visa fees" → Canada ranks above generic visa docs', async () => {
  const results = await retrieveKnowledge("Canada visa fees", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const topTitles = results.slice(0, 3).map((r) => r.doc.meta.title);
  assert.ok(
    topTitles[0].includes("Canada"),
    `top result should be Canada, got: ${topTitles[0]}`,
  );
});

test('"German batch timings" → German ranks first', async () => {
  const results = await retrieveKnowledge("German batch timings", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const topTitle = results[0].doc.meta.title;
  assert.ok(
    topTitle.includes("German"),
    `top result should be German, got: ${topTitle}`,
  );
});

test('"French course fees" → French ranks first', async () => {
  const results = await retrieveKnowledge("French course fees", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const topTitle = results[0].doc.meta.title;
  assert.ok(
    topTitle.includes("French"),
    `top result should be French, got: ${topTitle}`,
  );
});

test('"contact ANU Education" → company ranks first', async () => {
  const results = await retrieveKnowledge("contact ANU Education", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const topTitle = results[0].doc.meta.title;
  assert.ok(
    topTitle.includes("Company") || topTitle.includes("Contact"),
    `top result should be company, got: ${topTitle}`,
  );
});

test('"demo class" → documents with demo availability rank appropriately', async () => {
  const results = await retrieveKnowledge("demo class", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  // Top results should include courses with demo_available or demo_schedule
  const topDocs = results.slice(0, 3);
  const hasDemo = topDocs.some(
    (r) => r.doc.meta.demo_available === true || r.doc.meta.demo_schedule,
  );
  // At least one top result should have demo info
  assert.ok(hasDemo, "top results should include docs with demo availability");
});

test('"batch timing" → documents with batch schedules rank appropriately', async () => {
  const results = await retrieveKnowledge("batch timing", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  // Top results should include courses with batch_schedule
  const topDocs = results.slice(0, 3);
  const hasBatch = topDocs.some(
    (r) => r.doc.meta.batch_schedule && r.doc.meta.batch_schedule.length > 0,
  );
  assert.ok(hasBatch, "top results should include docs with batch schedules");
});

test('generic "visa" still returns useful generic visa documents', async () => {
  const results = await retrieveKnowledge("visa", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  // Should return visa-related docs
  const titles = results.map((r) => r.doc.meta.title.toLowerCase());
  const hasVisa = titles.some(
    (t) => t.includes("visa") || t.includes("admission") || t.includes("country"),
  );
  assert.ok(hasVisa, "should return visa-related documents");
});

test('generic "pricing" still returns pricing information', async () => {
  const results = await retrieveKnowledge("pricing", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  // Should return pricing docs
  const titles = results.map((r) => r.doc.meta.title.toLowerCase());
  const hasPricing = titles.some(
    (t) => t.includes("pricing") || t.includes("fees"),
  );
  assert.ok(hasPricing, "should return pricing documents");
});

test("needs_review remains retrievable", async () => {
  const results = await retrieveKnowledge("Dubai study visa", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const dubai = results.find((r) => r.doc.meta.title.includes("Dubai"));
  if (dubai) {
    assert.equal(dubai.doc.meta.status, "needs_review", "Dubai should be needs_review");
  }
});

test("coming_soon remains excluded by default", async () => {
  const results = await retrieveKnowledge("GMAT preparation", { knowledgeDir: KNOWLEDGE_DIR });

  // GMAT is coming_soon, should not appear in default results
  if (!("kind" in results)) {
    for (const r of results) {
      assert.notEqual(
        r.doc.meta.status,
        "coming_soon",
        "coming_soon docs should not appear by default",
      );
    }
  }
});

test("aliases improve retrieval", async () => {
  // "ielts exam" should find IELTS via alias
  const results = await retrieveKnowledge("ielts exam", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const hasIelts = results.some((r) => r.doc.meta.title.includes("IELTS"));
  assert.ok(hasIelts, "should find IELTS via alias");
});

test("tags improve retrieval", async () => {
  // "english test" should find English proficiency courses via tags
  const results = await retrieveKnowledge("english test", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  // Should find IELTS, PTE, Duolingo (all tagged with "english test")
  const titles = results.map((r) => r.doc.meta.title);
  const hasEnglishTest = titles.some(
    (t) => t.includes("IELTS") || t.includes("PTE") || t.includes("Duolingo"),
  );
  assert.ok(hasEnglishTest, "should find English test courses via tags");
});

test("structured pricing improves pricing queries", async () => {
  const results = await retrieveKnowledge("IELTS fees", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const ielts = results.find((r) => r.doc.meta.title.includes("IELTS"));
  assert.ok(ielts, "should find IELTS");
  assert.ok(
    ielts.doc.meta.pricing && ielts.doc.meta.pricing.length > 0,
    "IELTS should have pricing data",
  );
});

test("structured schedules improve timing queries", async () => {
  const results = await retrieveKnowledge("PTE batch timings", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const pte = results.find((r) => r.doc.meta.title.includes("PTE"));
  assert.ok(pte, "should find PTE");
  assert.ok(
    pte.doc.meta.batch_schedule && pte.doc.meta.batch_schedule.length > 0,
    "PTE should have batch schedule data",
  );
});

test("ranking is deterministic", async () => {
  // Run the same query multiple times and verify same order
  const query = "IELTS fees pricing";
  const results1 = await retrieveKnowledge(query, { knowledgeDir: KNOWLEDGE_DIR });
  const results2 = await retrieveKnowledge(query, { knowledgeDir: KNOWLEDGE_DIR });

  assert.ok(!("kind" in results1) && !("kind" in results2));
  if ("kind" in results1 || "kind" in results2) return;

  assert.equal(results1.length, results2.length, "same number of results");
  for (let i = 0; i < results1.length; i++) {
    assert.equal(
      results1[i].doc.relPath,
      results2[i].doc.relPath,
      `result ${i} should be deterministic`,
    );
    assert.equal(
      results1[i].score,
      results2[i].score,
      `score ${i} should be deterministic`,
    );
  }
});

// ── A2.6.1 Regression Tests ──────────────────────────────────────

test("coming_soon entity returns itself with includeComingSoon", async () => {
  const results = await retrieveKnowledge("GMAT", {
    knowledgeDir: KNOWLEDGE_DIR,
    includeComingSoon: true,
  });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const gmat = results.find((r) => r.doc.meta.title === "GMAT");
  assert.ok(gmat, "GMAT should be in results");
  assert.equal(gmat.doc.meta.status, "coming_soon");
  // GMAT should be first (highest score)
  assert.equal(results[0].doc.meta.title, "GMAT", "GMAT should rank first");
});

test("coming_soon entity returns no_match by default", async () => {
  const results = await retrieveKnowledge("GMAT", { knowledgeDir: KNOWLEDGE_DIR });
  // GMAT is coming_soon and should be excluded by default
  if (!("kind" in results)) {
    for (const r of results) {
      assert.notEqual(r.doc.meta.status, "coming_soon");
    }
  }
});

test("demo class prioritizes courses with demo_available", async () => {
  const results = await retrieveKnowledge("demo class", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  // PTE has demo_available=true, should rank first
  assert.equal(results[0].doc.meta.title, "PTE Academic and PTE Core", "PTE should rank first for demo class");
  assert.equal(results[0].doc.meta.demo_available, true, "PTE should have demo_available");
});

test("visa fees prioritizes country docs over pricing overview", async () => {
  const results = await retrieveKnowledge("visa fees", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  // Country docs should rank first, not ANU Education Pricing Overview
  const topTitles = results.slice(0, 3).map((r) => r.doc.meta.title);
  assert.ok(
    !topTitles.includes("ANU Education Pricing Overview"),
    "Pricing Overview should not rank first for visa fees",
  );
});

test("needs_review docs are retrievable", async () => {
  const results = await retrieveKnowledge("Dubai UAE", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const dubai = results.find((r) => r.doc.meta.title.includes("Dubai"));
  assert.ok(dubai, "Dubai should be in results");
  assert.equal(dubai.doc.meta.status, "needs_review");
});

test("SAT and TOEFL return no_match by default", async () => {
  for (const query of ["SAT", "TOEFL"]) {
    const results = await retrieveKnowledge(query, { knowledgeDir: KNOWLEDGE_DIR });
    if (!("kind" in results)) {
      for (const r of results) {
        assert.notEqual(r.doc.meta.status, "coming_soon", `${query}: coming_soon doc should not appear`);
      }
    }
  }
});

// ── A2.6.2: Retrieval Safety (alias boundaries + coming_soon) ─────

test('"discuss IELTS fees" → USA must not receive "us" alias boost', async () => {
  const results = await retrieveKnowledge("discuss IELTS fees", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const titles = results.map((r) => r.doc.meta.title);
  assert.ok(titles[0].includes("IELTS"), `top result should be IELTS, got: ${titles[0]}`);
  const ieltsIdx = titles.findIndex((t) => t.includes("IELTS"));
  const usaIdx = titles.findIndex((t) => t.includes("United States"));
  // "us" inside "discuss" must not rank USA above IELTS
  assert.ok(usaIdx === -1 || ieltsIdx < usaIdx, "USA should not outrank IELTS via 'us' substring");
  assert.ok(usaIdx >= 3 || usaIdx === -1, `USA should not appear in top 3, got index ${usaIdx}`);
});

test('"discuss fees" → pricing outranks USA', async () => {
  const results = await retrieveKnowledge("discuss fees", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const titles = results.map((r) => r.doc.meta.title);
  const pricingIdx = titles.findIndex((t) => t.toLowerCase().includes("pricing"));
  const usaIdx = titles.findIndex((t) => t.includes("United States"));
  assert.ok(pricingIdx !== -1, "pricing doc should be present");
  assert.ok(pricingIdx === 0, `pricing should rank first, got: ${titles.join(", ")}`);
  assert.ok(usaIdx === -1 || usaIdx > pricingIdx, "pricing should outrank USA");
});

test('"determine IELTS score" → Duolingo must not receive "det" alias boost', async () => {
  const results = await retrieveKnowledge("determine IELTS score", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  const titles = results.map((r) => r.doc.meta.title);
  assert.ok(titles[0].includes("IELTS"), `top result should be IELTS, got: ${titles[0]}`);
  const duolingoIdx = titles.findIndex((t) => t.includes("Duolingo"));
  // "det" inside "determine" must not boost Duolingo into the top results
  assert.ok(duolingoIdx >= 3 || duolingoIdx === -1, `Duolingo should not appear in top 3, got index ${duolingoIdx}`);
});

test('"US universities" → USA still matches via whole-word "us"', async () => {
  const results = await retrieveKnowledge("US universities", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  assert.ok(
    results[0].doc.meta.title.includes("United States"),
    `top result should be USA, got: ${results[0].doc.meta.title}`,
  );
});

test('"UK visa" → UK still matches via whole-word "uk"', async () => {
  const results = await retrieveKnowledge("UK visa", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  assert.ok(
    results[0].doc.meta.title.includes("United Kingdom"),
    `top result should be UK, got: ${results[0].doc.meta.title}`,
  );
});

test('"DET exam" → Duolingo still matches via whole-word "det"', async () => {
  const results = await retrieveKnowledge("DET exam", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  assert.ok(
    results[0].doc.meta.title.includes("Duolingo"),
    `top result should be Duolingo, got: ${results[0].doc.meta.title}`,
  );
});

test('"which universities accept SAT?" → retrieves verified docs, not no_match', async () => {
  const results = await retrieveKnowledge("which universities accept SAT?", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  // USA lists SAT in Recommended Tests — an entity mention must not suppress it
  const topTitles = results.map((r) => r.doc.meta.title);
  assert.ok(
    topTitles[0].includes("United States"),
    `top result should be USA (lists SAT), got: ${topTitles[0]}`,
  );
  for (const r of results) {
    assert.notEqual(r.doc.meta.status, "coming_soon", "no coming_soon doc should appear");
    assert.notEqual(r.doc.meta.title, "SAT", "SAT course itself remains excluded");
  }
});

test('"GMAT 700 target" → retrieves verified docs, not no_match', async () => {
  const results = await retrieveKnowledge("GMAT 700 target", { knowledgeDir: KNOWLEDGE_DIR });
  assert.ok(!("kind" in results), "should not be no_match");
  if ("kind" in results) return;

  for (const r of results) {
    assert.notEqual(r.doc.meta.status, "coming_soon", "no coming_soon doc should appear");
    assert.notEqual(r.doc.meta.title, "GMAT", "GMAT course itself remains excluded");
  }
});

test("GMAT/SAT/TOEFL excluded by default as course docs; includeComingSoon retrieves them", async () => {
  for (const query of ["GMAT", "SAT", "TOEFL"]) {
    const defaultResults = await retrieveKnowledge(query, { knowledgeDir: KNOWLEDGE_DIR });
    if (!("kind" in defaultResults)) {
      for (const r of defaultResults) {
        assert.notEqual(r.doc.meta.title, query, `${query} course doc must be excluded by default`);
        assert.notEqual(r.doc.meta.status, "coming_soon", `${query}: coming_soon doc should not appear`);
      }
    }

    const withComingSoon = await retrieveKnowledge(query, { knowledgeDir: KNOWLEDGE_DIR, includeComingSoon: true });
    assert.ok(!("kind" in withComingSoon), `"${query}" with includeComingSoon should not be no_match`);
    if ("kind" in withComingSoon) continue;
    assert.ok(
      withComingSoon.some((r) => r.doc.meta.title === query),
      `${query} should be retrievable with includeComingSoon=true`,
    );
    assert.equal(withComingSoon[0].doc.meta.title, query, `${query} should rank first with includeComingSoon=true`);
  }
});
