// FILE: tests/pte-flagship-offer.test.ts
//
// ─────────────────────────────────────────────────────────────────
// PTE ACADEMIC CHAMPION OFFER TESTS (PRICING-ARCH-W2)
//
// Guards the PTE Champion promotional offer, its separation from the
// PTE catalogue, the offer registry, and checkout isolation.
//
// The catalogue is NOT a previous price of the offer: ₹3,000 is the
// catalogue price, ₹2,999 is the offer price, ₹5,998 is the offer's
// reference fee. No surface may ever pair ₹3,000 with ₹2,999.
//
// Run: npx tsx --test tests/pte-flagship-offer.test.ts
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { COURSE_PRICES, findCoursePrice } from "../lib/data/course-prices";
import { COURSE_FEES } from "../lib/data/course-fees";
import { CHECKOUT_ALLOW_LIST, validateCatalogue } from "../lib/data/pricing-registry";
import { PTE_VIEWS, getPteJsonLdOffers } from "../lib/data/pte-pricing";
import {
  ALL_OFFERS,
  getOfferById,
  validateOfferCheckoutIsolation,
  validateOffers,
} from "../lib/data/offers";
import { IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER } from "../lib/data/offers/ielts-academic-champion-flagship";
import {
  PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER,
  PTE_CHAMPION_PRODUCT_ID,
} from "../lib/data/offers/pte-academic-champion-flagship";

const ROOT = path.join(__dirname, "..");

/** Runtime surfaces that could render a PTE price or pair prices wrongly. */
const PTE_RUNTIME_SOURCES = [
  "lib/data/pte-pricing.ts",
  "lib/data/offers/pte-academic-champion-flagship.ts",
  "components/offers/PteAcademicChampionOfferCard.tsx",
  "app/test-prep/pte/PTEClient.tsx",
  "app/test-prep/pte/page.tsx",
];

function readSources(): Array<{ file: string; source: string }> {
  return PTE_RUNTIME_SOURCES.map((file) => ({
    file,
    source: readFileSync(path.join(ROOT, file), "utf8"),
  }));
}

// ── 1. Product reference ──────────────────────────────────────────

test("PTE offer references an existing catalogue product, Champion at ₹3,000", () => {
  const product = COURSE_PRICES.find((p) => p.id === PTE_CHAMPION_PRODUCT_ID);
  assert.ok(product, `productId ${PTE_CHAMPION_PRODUCT_ID} must exist`);
  assert.equal(product.course, "PTE Academic");
  assert.equal(product.program, "Champion");
  assert.equal(product.price, 3000);
});

// ── 2. Offer ID uniqueness ────────────────────────────────────────

test("PTE offer ID is unique across the registry and never collides with a catalogue id", () => {
  const offer = PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;
  const ids = ALL_OFFERS.map((o) => o.id);
  assert.equal(new Set(ids).size, ids.length, "offer ids must be unique");
  assert.equal(getOfferById(offer.id), offer);

  const catalogueIds = new Set(COURSE_PRICES.map((p) => p.id));
  assert.ok(!catalogueIds.has(offer.id), "offer id must not be a catalogue id");
  assert.deepEqual(validateOffers(), []);
});

// ── 3/4/5. Offer commercial values ────────────────────────────────

test("PTE offer carries the approved commercial values", () => {
  const offer = PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;
  assert.equal(offer.id, "pte-academic-champion-50-offer");
  assert.equal(offer.productId, "pte-academic-champion");
  assert.equal(offer.displayName, "PTE Academic Champion");
  assert.equal(offer.regularPrice, 5998);
  assert.equal(offer.promotionalPrice, 2999);
  assert.equal(offer.discountPercent, 50);
  assert.equal(offer.offerLabel, "50% OFF");
  assert.equal(offer.currency, "INR");
  assert.equal(offer.gstIncluded, false);
  assert.equal(offer.checkoutEligible, false);
  assert.equal(offer.active, true);
  assert.equal(offer.pageScope, "/test-prep/pte");
});

test("discount percent is derived from the two prices, not independently hardcoded", () => {
  const offer = PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;
  const derived = Math.round(
    ((offer.regularPrice - offer.promotionalPrice) / offer.regularPrice) * 100,
  );
  assert.equal(offer.discountPercent, derived);
  assert.equal(derived, 50);
  assert.equal(offer.offerLabel, `${derived}% OFF`);
});

// ── 9/10. Checkout separation ─────────────────────────────────────

test("PTE offer is NOT in COURSE_FEES and NOT in the checkout allow-list", () => {
  const offer = PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;
  assert.ok(!(offer.id in COURSE_FEES), "offer id must not be a fee key");

  const allowIds = Object.values(CHECKOUT_ALLOW_LIST).flat();
  assert.ok(!(offer.id in CHECKOUT_ALLOW_LIST), "offer id must not be a key");
  assert.ok(!allowIds.includes(offer.id), "offer id must not be an allow-listed product");
});

test("checkout isolation holds for the whole offer registry", () => {
  assert.deepEqual(validateOfferCheckoutIsolation(), []);
  assert.deepEqual(validateCatalogue(), []);
});

// ── 11. Catalogue unchanged ───────────────────────────────────────

test("PTE catalogue price values remain exactly unchanged", () => {
  const expected: Record<string, number> = {
    "pte-academic-live-class": 1313,
    "pte-academic-self-prep": 1875,
    "pte-academic-champion": 3000,
    "pte-core-mock-tests": 1875,
  };
  for (const [id, price] of Object.entries(expected)) {
    const entry = COURSE_PRICES.find((p) => p.id === id);
    assert.ok(entry, id);
    assert.equal(entry!.price, price, id);
  }
  const ptePrices = COURSE_PRICES.filter((p) => p.courseId.startsWith("pte")).map((p) => p.price);
  assert.deepEqual(ptePrices, [1313, 1875, 3000, 1875]);
});

// ── Separation ────────────────────────────────────────────────────

test("catalogue and offer stay separated: Champion ₹3,000 never meets ₹2,999/₹5,998", () => {
  const offer = PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;

  const catalogueChampion = PTE_VIEWS.find((v) => v.productId === "pte-academic-champion");
  assert.ok(catalogueChampion);
  assert.equal(catalogueChampion.price, 3000);

  // Catalogue Champion view carries no offer values.
  assert.ok(!PTE_VIEWS.some((v) => v.price === 2999), "PTE_VIEWS must not contain the offer price");
  assert.ok(!PTE_VIEWS.some((v) => v.price === 5998), "PTE_VIEWS must not contain the reference fee");

  // Offer carries no catalogue price.
  assert.ok(!Object.values(offer).includes(3000), "offer must never hold the ₹3,000 catalogue price");
});

// ── Honesty: no surface pairs ₹3,000 with ₹2,999 ─────────────────

test("no runtime surface pairs the ₹3,000 catalogue price with the ₹2,999 offer price", () => {
  for (const { file, source } of readSources()) {
    for (const line of source.split("\n")) {
      const hasCatalogue = /(3,000|3000)/.test(line);
      const hasOffer = /(2,999|2999)/.test(line);
      assert.ok(
        !(hasCatalogue && hasOffer),
        `${file}: a line must not pair the ₹3,000 catalogue price with the ₹2,999 offer price — the catalogue price is not the offer's previous price`,
      );
    }
  }
});

test("the offer price never leaks into the catalogue module and vice versa", () => {
  for (const { file, source } of readSources()) {
    const isCatalogueModule = file.endsWith("pte-pricing.ts");
    const isOfferLayer = file.includes("offers/") || file.includes("PteAcademicChampionOfferCard");
    if (isCatalogueModule) {
      assert.ok(
        !/(2,999|2999|5,998|5998)/.test(source),
        `${file} (catalogue) must contain no offer price literals`,
      );
    }
    if (isOfferLayer) {
      assert.ok(
        !/(3,000|3000)/.test(source),
        `${file} (offer layer) must contain no catalogue price literal`,
      );
    }
  }
});

// ── JSON-LD (Phase 7 contract) ────────────────────────────────────

test("PTE JSON-LD offers derive only from catalogue master prices", () => {
  const masterPrices = new Set(
    COURSE_PRICES.filter((p) => p.courseId.startsWith("pte")).map((p) => String(p.price)),
  );
  const offers = getPteJsonLdOffers();

  assert.equal(offers.length, 3);
  for (const offer of offers) {
    assert.equal(offer["@type"], "Offer");
    assert.ok(masterPrices.has(offer.price), `price ${offer.price} must be a master pack price`);
    assert.ok(!["2999", "5998"].includes(offer.price), "offer price must not be the promo values");
    assert.equal(offer.priceCurrency, "INR");
    assert.match(offer.sku, /^pte-/, "sku is the stable catalogue product id");
  }
});

// ── G. IELTS and Duolingo remain unchanged ────────────────────────

test("IELTS flagship and Duolingo remain unchanged", () => {
  const offer = IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;
  assert.equal(offer.regularPrice, 9998);
  assert.equal(offer.promotionalPrice, 4999);
  assert.equal(offer.discountPercent, 50);
  assert.equal(offer.gstIncluded, false);
  assert.equal(offer.checkoutEligible, false);

  const duolingo = findCoursePrice("Duolingo English Test", "Champion");
  assert.ok(duolingo);
  assert.equal(duolingo.price, 1999);
});