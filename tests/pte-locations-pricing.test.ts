// FILE: tests/pte-locations-pricing.test.ts
//
// PRICING-ARCH-W5A GUARDS: PTE location-page catalogue-price migration.
//
// W5A audited every PTE surface and found the migration already complete:
// all five location routes derive their catalogue amounts from
// lib/data/pte-pricing.ts (which reads the master lib/data/course-prices.ts).
// These tests pin that state so no page can silently fall back to a hardcoded
// PTE catalogue literal, leak the Champion promotional offer, or drift from
// checkout.
//
//   1. Every PTE location route exists and imports the PTE read-model.
//   2. No PTE surface hardcodes a catalogue price literal.
//   3. PTE catalogue prices (incl. ₹1,313 From / ₹3,000 Champion) are unchanged.
//   4. Paid JSON-LD derives from the master; free Demo is the only ₹0.
//   5. The Champion promo offer stays isolated (pageScope + checkoutEligible:false).
//   6. PTE metadata / canonical SEO intent is preserved.
//   7. Gandhinagar FAQ prices derive from the master (₹18,000 exam fee editorial).
//   8. Checkout boundary for PTE is unchanged.
//
// Run: npx tsx --test tests/pte-locations-pricing.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { COURSE_PRICES } from "../lib/data/course-prices";
import { COURSE_FEES } from "../lib/data/course-fees";
import {
  CHECKOUT_ALLOW_LIST,
  validateCatalogue,
  validateCheckoutBoundary,
} from "../lib/data/pricing-registry";
import {
  PTE_FROM_PRICE,
  PTE_FROM_PRICE_DISPLAY,
  PTE_TOP_PRICE,
  PTE_TOP_PRICE_DISPLAY,
  PTE_VIEWS,
  formatPtePrice,
  getPteJsonLdOffers,
} from "../lib/data/pte-pricing";
import {
  PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER,
  formatPteOfferGstPrice,
} from "../lib/data/offers/pte-academic-champion-flagship";
import { faqs } from "../lib/data/faq/pte-gandhinagar";

const ROOT = path.join(__dirname, "..");

/** Every PTE route page + its client (and the shared FAQ module). */
const ROUTE_FILES = [
  "app/test-prep/pte/page.tsx",
  "app/test-prep/pte/PTEClient.tsx",
  "app/test-prep/pte-coaching-ahmedabad/page.tsx",
  "app/test-prep/pte-coaching-ahmedabad/PTEAhmedabadClient.tsx",
  "app/test-prep/pte-coaching-gandhinagar/page.tsx",
  "app/test-prep/pte-coaching-gandhinagar/PTEGandhinagarClient.tsx",
  "app/test-prep/pte-coaching-india/page.tsx",
  "app/test-prep/pte-coaching-india/PTECoachingIndiaClient.tsx",
  "app/test-prep/pte-coaching-modasa/page.tsx",
];

/** Files that must actually derive their amounts from the read-model. */
const PRICE_SURFACES = [
  "app/test-prep/pte/page.tsx",
  "app/test-prep/pte/PTEClient.tsx",
  "app/test-prep/pte-coaching-ahmedabad/PTEAhmedabadClient.tsx",
  "app/test-prep/pte-coaching-gandhinagar/page.tsx",
  "app/test-prep/pte-coaching-gandhinagar/PTEGandhinagarClient.tsx",
  "app/test-prep/pte-coaching-india/PTECoachingIndiaClient.tsx",
  "app/test-prep/pte-coaching-modasa/page.tsx",
  "lib/data/faq/pte-gandhinagar.ts",
];

/** Every surface that must be free of hardcoded catalogue literals. */
const NO_LITERAL_SURFACES = [...ROUTE_FILES, "lib/data/faq/pte-gandhinagar.ts"];

function read(rel: string): string {
  return readFileSync(path.join(ROOT, rel), "utf8");
}

// ── 1. Routes present + derive from the read-model ────────────────

test("all five PTE location routes are present", () => {
  for (const file of ROUTE_FILES) {
    assert.ok(existsSync(path.join(ROOT, file)), `${file} must exist`);
  }
});

test("every PTE price surface imports the PTE read-model", () => {
  for (const file of PRICE_SURFACES) {
    assert.ok(
      /lib\/data\/pte-pricing/.test(read(file)),
      `${file} must import prices from lib/data/pte-pricing.ts`,
    );
  }
});

// ── 2. No hardcoded catalogue literals on any surface ─────────────

test("no PTE location surface hardcodes a catalogue price literal", () => {
  const literals = /₹1,313|₹1,875|₹3,000|1,313|1,875|3,000/;
  for (const file of NO_LITERAL_SURFACES) {
    for (const line of read(file).split("\n")) {
      assert.ok(
        !literals.test(line),
        `${file} must not hardcode a PTE catalogue price: "${line.trim()}"`,
      );
    }
  }
});

// ── 3. Catalogue prices unchanged ─────────────────────────────────

test("PTE catalogue prices are unchanged", () => {
  const byId = new Map(PTE_VIEWS.map((v) => [v.productId, v.price]));
  assert.equal(byId.get("pte-academic-live-class"), 1313);
  assert.equal(byId.get("pte-academic-self-prep"), 1875);
  assert.equal(byId.get("pte-academic-champion"), 3000);
  assert.equal(byId.get("pte-core-mock-tests"), 1875);

  assert.equal(PTE_FROM_PRICE, 1313);
  assert.equal(PTE_FROM_PRICE_DISPLAY, "₹1,313");
  assert.equal(PTE_TOP_PRICE, 3000);
  assert.equal(PTE_TOP_PRICE_DISPLAY, "₹3,000");
  assert.equal(formatPtePrice(3000), "₹3,000");
});

// ── 4. JSON-LD derives from the master; free Demo is the only ₹0 ──

test("paid JSON-LD offers derive from the master", () => {
  const offers = getPteJsonLdOffers();
  const master = new Map(COURSE_PRICES.map((p) => [p.id, p.price]));
  for (const offer of offers) {
    assert.equal(
      offer.price,
      String(master.get(offer.sku)),
      `JSON-LD price for ${offer.sku} must match the master`,
    );
  }
  assert.ok(
    !offers.some((o) => o.price === "0"),
    "no paid pack may advertise ₹0",
  );

  for (const file of [
    "app/test-prep/pte/PTEClient.tsx",
    "app/test-prep/pte-coaching-ahmedabad/PTEAhmedabadClient.tsx",
    "app/test-prep/pte-coaching-india/PTECoachingIndiaClient.tsx",
    "app/test-prep/pte-coaching-modasa/page.tsx",
  ]) {
    assert.ok(
      /getPteJsonLdOffers\(\)/.test(read(file)),
      `${file} must build its Course JSON-LD from getPteJsonLdOffers()`,
    );
  }
});

test("the free Demo pack is the only ₹0 PTE price", () => {
  const gandhinagar = read(
    "app/test-prep/pte-coaching-gandhinagar/PTEGandhinagarClient.tsx",
  );
  assert.ok(/price: "0"/.test(gandhinagar), "free Demo offer stays at ₹0");
});

// ── 5. Champion promo offer stays isolated ────────────────────────

test("Champion promo offer is a separate, non-chargeable layer", () => {
  const offer = PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;
  assert.equal(offer.productId, "pte-academic-champion");
  assert.equal(offer.checkoutEligible, false);
  assert.equal(offer.pageScope, "/test-prep/pte");
  assert.equal(offer.regularPrice, 5998);
  assert.equal(offer.promotionalPrice, 2999);
  assert.equal(offer.discountPercent, 50);
  assert.equal(offer.gstIncluded, false);
  assert.equal(formatPteOfferGstPrice(offer.promotionalPrice), "₹2,999 + GST");

  const championCatalogue = COURSE_PRICES.find(
    (p) => p.id === "pte-academic-champion",
  );
  assert.equal(championCatalogue?.price, 3000);
  assert.notEqual(offer.promotionalPrice, championCatalogue?.price);
});

test("offer prices never leak into PTE catalogue surfaces", () => {
  const banned = /(?<!\d)2,?999(?!\d)|(?<!\d)5,?998(?!\d)|₹2,999|₹5,998/;
  for (const file of NO_LITERAL_SURFACES) {
    assert.ok(
      !banned.test(read(file)),
      `${file} must not carry the PTE Champion offer amounts`,
    );
  }
});

test("the promo offer card is mounted only on its pageScope", () => {
  const importers = ROUTE_FILES.filter((file) =>
    /PteAcademicChampionOfferCard/.test(read(file)),
  );
  assert.deepEqual(importers, ["app/test-prep/pte/PTEClient.tsx"]);
});

test("checkout boundary rejects the non-chargeable offer", () => {
  const violations = validateCheckoutBoundary({
    offers: [
      {
        id: PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER.id,
        checkoutEligible: PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER.checkoutEligible,
      },
    ],
  });
  assert.deepEqual(violations, []);
});

// ── 6. Metadata / canonical SEO intent preserved ──────────────────

test("PTE canonical URLs are unchanged", () => {
  const expected: Record<string, string> = {
    "app/test-prep/pte/page.tsx": "https://www.anuedu.in/test-prep/pte",
    "app/test-prep/pte-coaching-ahmedabad/page.tsx":
      "https://www.anuedu.in/test-prep/pte-coaching-ahmedabad",
    "app/test-prep/pte-coaching-gandhinagar/page.tsx":
      "https://www.anuedu.in/test-prep/pte-coaching-gandhinagar",
    "app/test-prep/pte-coaching-india/page.tsx":
      "https://www.anuedu.in/test-prep/pte-coaching-india",
    "app/test-prep/pte-coaching-modasa/page.tsx":
      "https://www.anuedu.in/test-prep/pte-coaching-modasa",
  };
  for (const [file, canonical] of Object.entries(expected)) {
    assert.ok(
      read(file).includes(canonical),
      `${file} must keep canonical ${canonical}`,
    );
  }
});

test("starting-price metadata derives from the master", () => {
  assert.ok(
    /PTE_FROM_PRICE_DISPLAY/.test(read("app/test-prep/pte/page.tsx")),
    "main PTE metadata must derive its starting price",
  );
  assert.ok(
    /PTE_FROM_PRICE_DISPLAY/.test(
      read("app/test-prep/pte-coaching-gandhinagar/page.tsx"),
    ),
    "Gandhinagar metadata must derive its starting price",
  );
});

// ── 7. Gandhinagar FAQ derives from the master ────────────────────

test("Gandhinagar FAQ prices derive from the master", () => {
  const fees = faqs.find((f) => /course fees/i.test(f.q));
  assert.ok(fees, "PTE fees FAQ must exist");
  assert.ok(fees.a.includes(formatPtePrice(1313)), "Live Class ₹1,313");
  assert.ok(fees.a.includes(formatPtePrice(1875)), "Self Prep ₹1,875");
  assert.ok(fees.a.includes(formatPtePrice(3000)), "Champion ₹3,000");

  const examFee = faqs.find((f) => /exam fee/i.test(f.q));
  assert.ok(examFee, "PTE exam-fee FAQ must exist");
  assert.ok(
    examFee.a.includes("₹18,000"),
    "the external Pearson exam fee stays editorial",
  );
});

// ── 8. Checkout boundary for PTE unchanged ────────────────────────

test("PTE checkout boundary is unchanged", () => {
  assert.equal(COURSE_FEES.PTE, 1313);
  assert.deepEqual(CHECKOUT_ALLOW_LIST.PTE, ["pte-academic-live-class"]);
  assert.deepEqual(validateCatalogue(), []);
  assert.deepEqual(validateCheckoutBoundary({ checkoutOptionKeys: ["PTE"] }), []);
});
