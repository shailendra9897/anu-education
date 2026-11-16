// FILE: tests/pte-pricing-schema.test.ts
//
// ─────────────────────────────────────────────────────────────────
// PTE-PRICE-SCHEMA-01 GUARDS
//
// Keeps PTE website-visible prices, Schema.org Offer prices and the
// authoritative PTE price master from contradicting each other.
//
// Guards:
//   1. Every PTE schema Offer price corresponds to an approved
//      authoritative PTE product (price master) or a named free demo.
//   2. The invalid ₹7,999 placeholder (and its ₹12,999 "regular price")
//      cannot return to any PTE surface.
//   3. Existing PTE master prices remain unchanged.
//   4. PTE Academic Champion ₹2,999 / ₹5,998 is not inserted into the
//      generic PTE price master or onto PTE pages.
//   5. Checkout COURSE_FEES remains unchanged.
//   6. Existing Duolingo / IELTS pricing work remains untouched.
//
// Run: npx tsx tests/pte-pricing-schema.test.ts
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import {
  COURSE_PRICES,
  findCoursePrice,
  getCoursePrices,
} from "../lib/data/course-prices";
import { COURSE_FEES } from "../lib/data/course-fees";
import {
  PTE_FROM_PRICE,
  PTE_PACKS,
  getPteJsonLdOffers,
} from "../lib/data/pte-pricing";
import { IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER } from "../lib/data/offers/ielts-academic-champion-flagship";

const ROOT = process.cwd();

/** Every PTE app surface that can render a price or a schema Offer. */
const PTE_SURFACES = [
  "app/test-prep/pte",
  "app/test-prep/pte-coaching-ahmedabad",
  "app/test-prep/pte-coaching-gandhinagar",
  "app/test-prep/pte-coaching-india",
  "app/test-prep/pte-coaching-modasa",
  "lib/data/faq/pte-gandhinagar.ts",
];

function listFiles(target: string): string[] {
  const abs = path.join(ROOT, target);
  if (statSync(abs).isFile()) return [abs];

  const files: string[] = [];
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    const child = path.join(abs, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(path.relative(ROOT, child)));
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(child);
  }
  return files;
}

function pteSourceFiles(): string[] {
  return PTE_SURFACES.flatMap(listFiles);
}

function readAll(): Array<{ file: string; source: string }> {
  return pteSourceFiles().map((file) => ({
    file: path.relative(ROOT, file),
    source: readFileSync(file, "utf8"),
  }));
}

/** Approved PTE Offer prices: master pack prices + a named free demo. */
const MASTER_PTE_PRICES = new Set(
  COURSE_PRICES.filter((p) => p.courseId.startsWith("pte")).map((p) =>
    String(p.price),
  ),
);

// ── 3. Existing PTE master prices remain unchanged ────────────────

test("PTE price master packs are unchanged", () => {
  const expected = [
    {
      id: "pte-academic-live-class",
      course: "PTE Academic",
      program: "Live Class",
      price: 1313,
      validity: "6 Weeks / 90 Days",
    },
    {
      id: "pte-academic-self-prep",
      course: "PTE Academic",
      program: "Self Prep",
      price: 1875,
      validity: "180 Days",
    },
    {
      id: "pte-academic-champion",
      course: "PTE Academic",
      program: "Champion",
      price: 3000,
      validity: "6 Weeks / 180 Days",
    },
    {
      id: "pte-core-mock-tests",
      course: "PTE Core",
      program: "Mock Tests",
      price: 1875,
      validity: "180 Days",
    },
  ];

  const actual = COURSE_PRICES.filter((p) => p.courseId.startsWith("pte")).map(
    ({ id, course, program, price, validity }) => ({
      id,
      course,
      program,
      price,
      validity,
    }),
  );

  assert.deepEqual(actual, expected);
});

// ── 1 + 2. Schema Offer prices and the banned placeholder ─────────

test("no PTE surface carries the invalid ₹7,999 / ₹12,999 placeholder", () => {
  const banned = /(?<!\d)7,?999(?!\d)|(?<!\d)12,?999(?!\d)/;
  for (const { file, source } of readAll()) {
    assert.ok(
      !banned.test(source),
      `${file} must not contain 7,999 / 12,999 — placeholder prices that match no master pack`,
    );
  }
});

test("every PTE schema Offer price is a master pack price or a named free demo", () => {
  // Matches `price: "1313"`, `"price": "0"`, `price: 1875` inside JSON-LD.
  const priceLiteral = /\bprice"?\s*:\s*"?(\d+)(?!\d)/g;

  for (const { file, source } of readAll()) {
    for (const line of source.split("\n")) {
      priceLiteral.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = priceLiteral.exec(line)) !== null) {
        const value = match[1];

        if (value === "0") {
          assert.ok(
            /demo/i.test(line),
            `${file}: Offer price 0 is only allowed for a named free demo offer — "${line.trim()}"`,
          );
          continue;
        }

        assert.ok(
          MASTER_PTE_PRICES.has(value),
          `${file}: Offer price ${value} does not exist in the PTE price master ` +
            `(approved: ${[...MASTER_PTE_PRICES].join(", ")}) — "${line.trim()}"`,
        );
      }
    }
  }
});

// ── 4. PTE Academic Champion promo stays out of the catalogue ─────

test("PTE Academic Champion promo prices are not in the PTE price master", () => {
  const ptePrices = COURSE_PRICES.filter((p) =>
    p.courseId.startsWith("pte"),
  ).map((p) => p.price);

  assert.ok(!ptePrices.includes(2999), "2999 must not become a PTE pack price");
  assert.ok(!ptePrices.includes(5998), "5998 must not become a PTE pack price");
});

test("PTE pages do not advertise the not-yet-built Champion promo prices", () => {
  const promo = /(?<!\d)2,?999(?!\d)|(?<!\d)5,?998(?!\d)/;
  for (const { file, source } of readAll()) {
    assert.ok(
      !promo.test(source),
      `${file} must not carry ₹2,999 / ₹5,998 — the PTE Champion offer has no offer module yet`,
    );
  }
});

// ── Derived PTE view agrees with the master ───────────────────────

test("derived PTE view and its JSON-LD offers are master-derived", () => {
  assert.equal(PTE_FROM_PRICE, 1313);
  assert.deepEqual(
    PTE_PACKS.map((p) => p.price),
    [1313, 1875, 3000],
  );

  const offers = getPteJsonLdOffers();
  assert.equal(offers.length, PTE_PACKS.length);

  offers.forEach((offer, index) => {
    const pack = PTE_PACKS[index];
    assert.equal(offer["@type"], "Offer");
    assert.equal(offer.price, String(pack.price));
    assert.equal(offer.priceCurrency, "INR");
    assert.ok(offer.name.includes(pack.program), "offer names its pack");
    assert.ok(MASTER_PTE_PRICES.has(offer.price));
  });
});

// ── 5. Checkout is unchanged ──────────────────────────────────────

test("COURSE_FEES (checkout) uses the approved IELTS price", () => {
  assert.deepEqual(COURSE_FEES, {
    IELTS: 1999,
    PTE: 1313,
    "German A1": 7500,
    "French A1": 7500,
  });
});

// ── 6. Duolingo / IELTS pricing work is untouched ─────────────────

test("IELTS offer is historical and the approved IELTS/Duolingo prices are intact", () => {
  const offer = IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;
  assert.equal(offer.regularPrice, 9998);
  assert.equal(offer.promotionalPrice, 4999);
  assert.equal(offer.discountPercent, 50);
  assert.equal(offer.offerLabel, "50% OFF");
  assert.equal(offer.gstIncluded, false);
  assert.equal(offer.checkoutEligible, false);
  assert.equal(offer.active, false);
  assert.equal(offer.discontinuedOn, "2026-11-12");

  assert.deepEqual(
    getCoursePrices("IELTS Academic").map((p) => p.price),
    [1999, 5499, 5499, 5499, 6499, 3000, 3000, 3000],
  );
  assert.deepEqual(
    getCoursePrices("IELTS General").map((p) => p.price),
    [1875, 4125, 3000, 3000, 3000],
  );

  const duolingo = findCoursePrice("Duolingo English Test", "Champion");
  assert.ok(duolingo, "Duolingo Champion pack must exist");
  assert.equal(duolingo.price, 1999);
});
