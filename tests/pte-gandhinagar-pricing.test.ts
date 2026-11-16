// FILE: tests/pte-gandhinagar-pricing.test.ts
//
// PRICING-ARCH-W3G GUARDS: PTE Gandhinagar price view migration.
//
// Guards that the Gandhinagar pricing surfaces derive from the shared
// PTE PriceView master and stay honest:
//   1. Gandhinagar catalogue prices belong to the PTE master.
//   2. ₹1,313 remains the From price.
//   3. ₹3,000 remains the catalogue Champion price.
//   4. ₹2,999 / ₹5,998 do not appear as Gandhinagar pricing.
//   5. JSON-LD matches the catalogue.
//   6. Existing PTE flagship tests remain green (run separately).
//
// Run: npx tsx --test tests/pte-gandhinagar-pricing.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { COURSE_PRICES } from "../lib/data/course-prices";
import {
  PTE_FROM_PRICE_DISPLAY,
  PTE_VIEWS,
  formatPtePrice,
} from "../lib/data/pte-pricing";

const ROOT = path.join(__dirname, "..");

const GANDHINAGAR_SOURCES = [
  "app/test-prep/pte-coaching-gandhinagar/PTEGandhinagarClient.tsx",
  "app/test-prep/pte-coaching-gandhinagar/page.tsx",
  "lib/data/faq/pte-gandhinagar.ts",
];

function readGandhinagarSources(): Array<{ file: string; source: string }> {
  return GANDHINAGAR_SOURCES.map((file) => ({
    file,
    source: readFileSync(path.join(ROOT, file), "utf8"),
  }));
}

// ── 1. Gandhinagar catalogue prices belong to the PTE master ──────

test("PTE Gandhinagar views are master products and prices", () => {
  const master = new Map(COURSE_PRICES.map((p) => [p.id, p.price]));
  for (const view of PTE_VIEWS) {
    assert.ok(master.has(view.productId), `${view.productId} must be a master pack`);
    assert.equal(view.price, master.get(view.productId), view.productId);
  }
});

test("Gandhinagar surfaces derive prices from the PriceView module", () => {
  for (const { file, source } of readGandhinagarSources()) {
    assert.ok(
      /lib\/data\/pte-pricing/.test(source),
      `${file} must import prices from lib/data/pte-pricing.ts`,
    );
  }
});

// ── 2. ₹1,313 remains the From price ──────────────────────────────

test("From price remains ₹1,313", () => {
  const liveClass = PTE_VIEWS.find((v) => v.productId === "pte-academic-live-class");
  assert.ok(liveClass);
  assert.equal(liveClass.price, 1313);
  assert.equal(formatPtePrice(liveClass.price), "₹1,313");
  assert.equal(PTE_FROM_PRICE_DISPLAY, "₹1,313");
});

// ── 3. ₹3,000 remains the catalogue Champion price ────────────────

test("catalogue Champion price remains ₹3,000", () => {
  const champion = PTE_VIEWS.find((v) => v.productId === "pte-academic-champion");
  assert.ok(champion);
  assert.equal(champion.price, 3000);
  assert.equal(formatPtePrice(champion.price), "₹3,000");
});

// ── 4. No promo / placeholder prices on Gandhinagar surfaces ──────

test("₹2,999 and ₹5,998 never appear as Gandhinagar pricing", () => {
  const banned = /(?<!\d)2,?999(?!\d)|(?<!\d)5,?998(?!\d)|(?<!\d)7,?999(?!\d)|(?<!\d)12,?999(?!\d)/;
  for (const { file, source } of readGandhinagarSources()) {
    assert.ok(
      !banned.test(source),
      `${file} must not carry ₹2,999 / ₹5,998 / ₹7,999 / ₹12,999`,
    );
    assert.ok(
      !/₹2,999|₹5,998/.test(source),
      `${file} must not render the PTE Champion offer prices`,
    );
  }
});

test("no Gandhinagar source hardcodes a PTE catalogue price literal", () => {
  const literals = /₹1,313|₹1,875|₹3,000|1,313|1,875|3,000/;
  for (const { file, source } of readGandhinagarSources()) {
    for (const line of source.split("\n")) {
      assert.ok(
        !literals.test(line),
        `${file} must not hardcode a PTE catalogue price: "${line.trim()}"`,
      );
    }
  }
});

// ── 5. JSON-LD matches the catalogue ──────────────────────────────

test("Gandhinagar JSON-LD derives prices from PriceView (no price literals)", () => {
  const client = readFileSync(
    path.join(ROOT, "app/test-prep/pte-coaching-gandhinagar/PTEGandhinagarClient.tsx"),
    "utf8",
  );
  const schemaBlock = client.slice(
    client.indexOf("price: \""),
    client.indexOf("hasCourseInstance"),
  );
  assert.ok(/String\(selfPrepPrice\)/.test(schemaBlock));
  assert.ok(/String\(liveClassPrice\)/.test(schemaBlock));
  assert.ok(/String\(championPrice\)/.test(schemaBlock));
  assert.ok(/price: "0"/.test(client), "free Demo offer stays at ₹0");
});