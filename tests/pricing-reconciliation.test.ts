// FILE: tests/pricing-reconciliation.test.ts
//
// ─────────────────────────────────────────────────────────────────
// PHASE 2B PRICING RECONCILIATION GUARD
//
// Proves lib/data/course-prices.ts (the authoritative price master)
// is the single source of truth for every course/package price across:
//   - knowledge/courses/*.md           (structured front-matter pricing)
//   - data/pricing.json                (legacy loader + prompt pricing doc)
//   - app/data/pricing.json            (duplicate copy kept in sync)
//   - knowledge/services/pricing.md    (pricing overview for the AI)
//   - app/pay-course/page.tsx          (base amounts derived from master)
//
// Run: npx tsx tests/pricing-reconciliation.test.ts
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";

import { COURSE_PRICES } from "../lib/data/course-prices";
import { loadMarkdownKnowledge } from "../lib/knowledge/md-loader";
import type { KnowledgeDoc } from "../lib/knowledge/types";
import { COURSE_FEES } from "../lib/data/course-fees";

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const PRICING_JSON_PATH = path.join(process.cwd(), "data", "pricing.json");
const APP_PRICING_JSON_PATH = path.join(process.cwd(), "app", "data", "pricing.json");

// Map of knowledge course doc -> the master course names it must mirror fully.
const DOC_COURSES: Record<string, string[]> = {
  "courses/ielts.md": ["IELTS Academic"],
  "courses/pte.md": ["PTE Academic", "PTE Core"],
  "courses/duolingo.md": ["Duolingo English Test"],
  "courses/gre.md": ["Shorter GRE"],
  "courses/spoken-english.md": ["Spoken English"],
  "courses/french.md": ["French"],
  "courses/german.md": ["German"],
};

// Knowledge course doc -> pricing.json prices.<key>.
const DOC_JSON_KEY: Record<string, string> = {
  "courses/ielts.md": "ielts",
  "courses/pte.md": "pte",
  "courses/duolingo.md": "duolingo",
  "courses/gre.md": "gre",
  "courses/spoken-english.md": "spoken-english",
  "courses/french.md": "french",
  "courses/german.md": "german",
};

// Master courses surfaced through services/pricing.md but without a course doc.
const SERVICES_ONLY_COURSES = [
  "IELTS General",
  "CELPIP",
  "My Career Mentor",
];

// Master courses deliberately NOT priced anywhere (coming_soon course docs).
const COMING_SOON_IDS = [
  "toefl-live-class",
  "digital-sat-live-class-self-prep",
  "digital-sat-champion",
  "gmat-standard",
];

type PricingJson = {
  prices: Record<
    string,
    Array<{
      pack_id: string;
      name: string;
      price: number;
      original_price: number | null;
      discount: string | null;
      currency: string;
      duration: string | null;
    }>
  >;
};

async function loadJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

async function loadDocs(): Promise<KnowledgeDoc[]> {
  const { docs } = await loadMarkdownKnowledge({
    knowledgeDir: KNOWLEDGE_DIR,
    refresh: true,
  });
  return docs;
}

const master = new Map(COURSE_PRICES.map((entry) => [entry.id, entry]));

test("every knowledge course pack maps 1:1 to a master entry with the same price", async () => {
  const docs = await loadDocs();

  for (const doc of docs) {
    if (!doc.meta.pricing || doc.meta.pricing.length === 0) continue;

    for (const pack of doc.meta.pricing) {
      if (!pack.pack_id) {
        assert.fail(`${doc.relPath}: pricing pack is missing pack_id`);
      }

      const masterEntry = master.get(pack.pack_id);
      assert.ok(masterEntry, `${doc.relPath}: pack_id "${pack.pack_id}" has no master entry`);

      assert.equal(
        pack.price,
        masterEntry.price,
        `${doc.relPath}: ${pack.pack_id} price ${pack.price} != master ${masterEntry.price}`,
      );
      assert.equal(
        pack.original_price,
        null,
        `${doc.relPath}: ${pack.pack_id} must carry no original_price`,
      );
      assert.equal(
        pack.discount,
        null,
        `${doc.relPath}: ${pack.pack_id} must carry no discount`,
      );
      assert.equal(
        pack.currency,
        "INR",
        `${doc.relPath}: ${pack.pack_id} must be priced in INR`,
      );
    }
  }
});

test("every master pack of published course docs appears in the matching knowledge doc", async () => {
  const docs = await loadDocs();

  for (const [relPath, courseNames] of Object.entries(DOC_COURSES)) {
    const doc = docs.find((d) => d.relPath === relPath);
    assert.ok(doc, `${relPath} should exist`);
    assert.ok(doc.meta.pricing && doc.meta.pricing.length > 0, `${relPath} should have pricing`);

    const docIds = new Set(doc.meta.pricing.map((p) => p.pack_id));
    const expected = COURSE_PRICES.filter((entry) => courseNames.includes(entry.course));

    for (const entry of expected) {
      assert.ok(docIds.has(entry.id), `${relPath} must list master pack "${entry.id}"`);
    }

    assert.equal(doc.meta.pricing.length, expected.length, `${relPath} pack count`);
  }
});

test("every knowledge course doc keeps data/pricing.json index-aligned and master-aligned", async () => {
  const docs = await loadDocs();
  const pricingJson = await loadJson<PricingJson>(PRICING_JSON_PATH);

  for (const [relPath, jsonKey] of Object.entries(DOC_JSON_KEY)) {
    const doc = docs.find((d) => d.relPath === relPath)!;
    const jsonPacks = pricingJson.prices[jsonKey];

    assert.equal(
      doc.meta.pricing!.length,
      jsonPacks.length,
      `${relPath} vs pricing.json#/prices/${jsonKey} count`,
    );

    jsonPacks.forEach((jsonPack, i) => {
      const mdPack = doc.meta.pricing![i];
      assert.equal(mdPack.pack_id, jsonPack.pack_id, `${relPath} pack ${i} pack_id`);
      assert.equal(mdPack.price, jsonPack.price, `${relPath} pack ${i} price`);

      const masterEntry = master.get(jsonPack.pack_id);
      assert.ok(masterEntry, `pricing.json#/prices/${jsonKey}/${i}: unknown pack_id "${jsonPack.pack_id}"`);
      assert.equal(jsonPack.price, masterEntry.price, `pricing.json#/prices/${jsonKey}/${i} price`);
      assert.equal(jsonPack.original_price, null);
      assert.equal(jsonPack.discount, null);
      assert.equal(jsonPack.currency, "INR");
    });
  }
});

test("pricing.json has no packs for courses without a published price", async () => {
  const pricingJson = await loadJson<PricingJson>(PRICING_JSON_PATH);

  assert.deepEqual(pricingJson.prices.toefl, []);
  assert.deepEqual(pricingJson.prices.gmat, []);
  assert.deepEqual(pricingJson.prices.sat, []);
});

test("app/data/pricing.json stays byte-identical to data/pricing.json", async () => {
  const primary = await readFile(PRICING_JSON_PATH, "utf8");
  const copy = await readFile(APP_PRICING_JSON_PATH, "utf8");
  assert.equal(copy, primary, "app/data/pricing.json must mirror data/pricing.json");
});

test("services/pricing.md keeps its title and lists every master pack with its price", async () => {
  const docs = await loadDocs();
  const servicesDoc = docs.find((d) => d.relPath === "services/pricing.md");
  assert.ok(servicesDoc, "services/pricing.md should exist");
  assert.equal(servicesDoc.meta.title, "ANU Education Pricing Overview");

  const raw = await readFile(
    path.join(KNOWLEDGE_DIR, "services", "pricing.md"),
    "utf8",
  );

  const publishedCourses = [
    ...new Set([...Object.values(DOC_COURSES).flat(), ...SERVICES_ONLY_COURSES]),
  ];
  const expected = COURSE_PRICES.filter((entry) => publishedCourses.includes(entry.course));

  for (const entry of expected) {
    assert.ok(
      raw.includes(entry.id),
      `services/pricing.md must mention master pack "${entry.id}"`,
    );
    assert.ok(
      raw.includes(entry.price.toLocaleString("en-IN")),
      `services/pricing.md must show the price for "${entry.id}"`,
    );
  }

  for (const id of COMING_SOON_IDS) {
    assert.ok(!raw.includes(id), `services/pricing.md must NOT price coming-soon pack "${id}"`);
  }
});

test("pay-course base fees are derived from the master, not hardcoded", async () => {
  const ieltsMin = Math.min(
    ...COURSE_PRICES.filter((e) => e.course === "IELTS Academic").map((e) => e.price),
  );
  const pteMin = Math.min(
    ...COURSE_PRICES.filter((e) => e.course === "PTE Academic").map((e) => e.price),
  );
  const germanA1 = COURSE_PRICES.find((e) => e.course === "German" && e.program === "Basic & A1");
  const frenchA1 = COURSE_PRICES.find(
    (e) => e.course === "French" && e.program === "Basic & A1 (Morning / Evening)",
  );

  assert.ok(germanA1 && frenchA1, "master must contain German Basic & A1 and French Basic & A1");

  assert.equal(COURSE_FEES.IELTS, ieltsMin);
  assert.equal(COURSE_FEES.PTE, pteMin);
  assert.equal(COURSE_FEES["German A1"], germanA1.price);
  assert.equal(COURSE_FEES["French A1"], frenchA1.price);
});