// FILE: tests/german-pricing.test.ts
//
// PRICING-ARCH-W5B GUARDS: German + cross-reference PriceView migration.
//
// Guards that the German pricing surfaces — and the pages that quote a
// catalogue price belonging to another module (PTE packs on the IELTS
// Modasa comparison table, the Free Demo PTE card, the German A1 blog) —
// derive their amounts from the shared read-models and stay honest:
//   1. All 3 German catalogue packs live in the master and each PriceView
//      equals its master price (no drift, no fabricated packs).
//   2. ₹7,500 stays the From / Basic & A1 price; ₹9,750 the A2 price;
//      ₹12,000 the Basic, A1 & A2 price.
//   3. Checkout boundary unchanged: COURSE_FEES["German A1"] = 7,500.
//   4. Migrated consumers import from lib/data/german-pricing.ts and carry
//      no hardcoded German catalogue or JSON-LD price literal.
//   5. Cross-module consumers quote PTE amounts only through the PTE
//      read-model (₹1,313 from-price, ₹3,000 top pack), never a literal.
//
// Run: npx tsx --test tests/german-pricing.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { COURSE_PRICES } from "../lib/data/course-prices";
import { COURSE_FEES } from "../lib/data/course-fees";
import { CHECKOUT_ALLOW_LIST, validateCatalogue } from "../lib/data/pricing-registry";
import {
  GERMAN_VIEWS,
  GERMAN_FROM_PRICE,
  GERMAN_FROM_PRICE_DISPLAY,
  GERMAN_FROM_PRICE_PLAIN,
  GERMAN_BASIC_A1_PRICE,
  GERMAN_BASIC_A1_PRICE_DISPLAY,
  GERMAN_BASIC_A1_PRICE_PLAIN,
  GERMAN_BASIC_A1_A2_PRICE,
  GERMAN_BASIC_A1_A2_PRICE_DISPLAY,
  GERMAN_BASIC_A1_A2_PRICE_PLAIN,
  GERMAN_A2_PRICE,
  GERMAN_A2_PRICE_DISPLAY,
  GERMAN_A2_PRICE_PLAIN,
  formatGermanPrice,
} from "../lib/data/german-pricing";
import {
  PTE_FROM_PRICE_DISPLAY,
  PTE_TOP_PRICE,
  PTE_TOP_PRICE_DISPLAY,
} from "../lib/data/pte-pricing";

const ROOT = path.join(__dirname, "..");

function read(rel: string): string {
  return readFileSync(path.join(ROOT, rel), "utf8");
}

// ── Expected catalogue (mirrors the price master) ────────────────

const EXPECTED_GERMAN_PACKS: Record<string, number> = {
  "german-basic-a1": 7500,
  "german-basic-a1-a2": 12000,
  "german-a2": 9750,
};

// ── 1. All 3 German packs are master products at master prices ───

test("German views are exactly the 3 master packs at master prices", () => {
  const master = new Map(COURSE_PRICES.map((p) => [p.id, p.price]));
  assert.equal(GERMAN_VIEWS.length, 3);
  for (const view of GERMAN_VIEWS) {
    assert.equal(view.price, EXPECTED_GERMAN_PACKS[view.productId], view.productId);
    assert.equal(master.get(view.productId), view.price, `${view.productId} drifted from master`);
  }
});

test("Inventory of German packs is unchanged", () => {
  assert.deepEqual(
    GERMAN_VIEWS.map((v) => v.productId).sort(),
    Object.keys(EXPECTED_GERMAN_PACKS).sort(),
  );
});

// ── 2. Prices stay put ───────────────────────────────────────────

test("German prices remain ₹7,500 / ₹9,750 / ₹12,000", () => {
  assert.equal(GERMAN_FROM_PRICE, 7500);
  assert.equal(GERMAN_FROM_PRICE_DISPLAY, "₹7,500");
  assert.equal(GERMAN_FROM_PRICE_PLAIN, "7500");
  assert.equal(formatGermanPrice(7500), "₹7,500");

  assert.equal(GERMAN_BASIC_A1_PRICE, 7500);
  assert.equal(GERMAN_BASIC_A1_PRICE_DISPLAY, "₹7,500");
  assert.equal(GERMAN_BASIC_A1_PRICE_PLAIN, "7500");

  assert.equal(GERMAN_A2_PRICE, 9750);
  assert.equal(GERMAN_A2_PRICE_DISPLAY, "₹9,750");
  assert.equal(GERMAN_A2_PRICE_PLAIN, "9750");

  assert.equal(GERMAN_BASIC_A1_A2_PRICE, 12000);
  assert.equal(GERMAN_BASIC_A1_A2_PRICE_DISPLAY, "₹12,000");
  assert.equal(GERMAN_BASIC_A1_A2_PRICE_PLAIN, "12000");
});

// ── 3. Checkout boundary is untouched ────────────────────────────

test("catalogue validation is clean", () => {
  assert.deepEqual(validateCatalogue(), []);
});

test("COURSE_FEES['German A1'] stays ₹7,500 and allow-list is unchanged", () => {
  assert.equal(COURSE_FEES["German A1"], 7500);
  assert.deepEqual(CHECKOUT_ALLOW_LIST["German A1"], ["german-basic-a1"]);
});

// ── 4. Migrated German surfaces derive prices, no literals remain ─

const GERMAN_CONSUMER_SOURCES = [
  "app/test-prep/german/GermanClient.tsx",
  "app/test-prep/german/ahmedabad/AhmedabadClient.tsx",
  "app/blog/german-a1-course-duration-fees-syllabus-india/page.tsx",
];

test("migrated German consumers import prices from the read-model", () => {
  for (const file of GERMAN_CONSUMER_SOURCES) {
    assert.ok(
      /lib\/data\/german-pricing/.test(read(file)),
      `${file} must import prices from lib/data/german-pricing.ts`,
    );
  }
});

test("no German consumer hardcodes a JSON-LD price literal", () => {
  const jsonLiteral = /price:\s*"(7500|9750|12000)"/;
  for (const file of GERMAN_CONSUMER_SOURCES) {
    assert.ok(!jsonLiteral.test(read(file)), `${file} must not hardcode a JSON-LD price`);
  }
});

test("no German consumer hardcodes the ₹7,500 / ₹9,750 display literals", () => {
  for (const file of GERMAN_CONSUMER_SOURCES) {
    const source = read(file);
    assert.ok(!source.includes("₹7,500"), `${file} must not hardcode ₹7,500`);
    assert.ok(!source.includes("₹9,750"), `${file} must not hardcode ₹9,750`);
  }
});

test("GermanClient derives its schema price and packages from constants", () => {
  const source = read("app/test-prep/german/GermanClient.tsx");
  assert.ok(/price:\s*GERMAN_BASIC_A1_PRICE_PLAIN/.test(source));
  assert.ok(source.includes("{GERMAN_BASIC_A1_PRICE_DISPLAY}"));
  assert.ok(source.includes("{GERMAN_BASIC_A1_A2_PRICE_DISPLAY}"));
});

test("Ahmedabad client derives both offers and package prices", () => {
  const source = read("app/test-prep/german/ahmedabad/AhmedabadClient.tsx");
  assert.ok(/price:\s*GERMAN_BASIC_A1_PRICE_PLAIN/.test(source), "German A1 offer");
  assert.ok(/price:\s*GERMAN_A2_PRICE_PLAIN/.test(source), "German A2 offer");
  assert.ok(source.includes("{GERMAN_BASIC_A1_PRICE_DISPLAY}"));
  assert.ok(source.includes("{GERMAN_BASIC_A1_A2_PRICE_DISPLAY}"));
});

// ── 5. Cross-module consumers quote PTE through the read-model ───

test("PTE read-model exposes the top pack price as ₹3,000", () => {
  assert.equal(PTE_TOP_PRICE, 3000);
  assert.equal(PTE_TOP_PRICE_DISPLAY, "₹3,000");
  assert.equal(PTE_FROM_PRICE_DISPLAY, "₹1,313");
});

test("IELTS Modasa comparison table derives the PTE from-price", () => {
  const source = read("app/test-prep/ielts-coaching-modasa/IELTSModasaClient.tsx");
  assert.ok(source.includes("PTE_FROM_PRICE_DISPLAY"), "must derive the PTE from-price");
  assert.ok(!source.includes("₹1,313"), "must not hardcode the PTE from-price");
});

test("Free Demo PTE card derives the top pack price", () => {
  const source = read("app/free-demo/FreeDemoPageClient.tsx");
  assert.ok(source.includes("PTE_TOP_PRICE_DISPLAY"), "must derive the PTE top price");
  assert.ok(!source.includes("₹3,000"), "must not hardcode the PTE top price");
});

test("German A1 blog derives its starting price", () => {
  const source = read("app/blog/german-a1-course-duration-fees-syllabus-india/page.tsx");
  assert.ok(source.includes("GERMAN_FROM_PRICE_DISPLAY"), "must derive the German from-price");
  assert.ok(!source.includes("₹7,500"), "must not hardcode the German from-price");
});
