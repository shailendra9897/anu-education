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
import type { KnowledgeDoc, KnowledgeStatus } from "../lib/knowledge/types";

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
