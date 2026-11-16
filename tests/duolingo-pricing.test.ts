// FILE: tests/duolingo-pricing.test.ts
//
// ─────────────────────────────────────────────────────────────────
// DUOLINGO PRICEVIEW STANDARDIZATION TESTS (PRICING-ARCH-W3)
//
// Proves the Duolingo pricing surfaces conform to the W1 PriceView /
// W1 JSON-LD architecture:
//
//   ₹1,999            catalogue price, derived from the master
//   ₹5,000            explicit list/regular-price business rule
//   60%               mathematically derived saving, not hardcoded
//
// Duolingo deliberately has NO promotional offer for architectural
// symmetry; this suite guards that none is invented.
//
// Run: npx tsx --test tests/duolingo-pricing.test.ts
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { findCoursePrice } from "../lib/data/course-prices";
import { COURSE_FEES } from "../lib/data/course-fees";
import {
  CHECKOUT_ALLOW_LIST,
  validateCatalogue,
  validateCheckoutBoundary,
} from "../lib/data/pricing-registry";
import {
  ALL_OFFERS,
  getOfferById,
  validateOfferCheckoutIsolation,
  validateOffers,
} from "../lib/data/offers";
import { IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER } from "../lib/data/offers/ielts-academic-champion-flagship";
import { PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER } from "../lib/data/offers/pte-academic-champion-flagship";
import {
  DUO_GST_INCLUDED,
  DUO_GST_LABEL,
  DUO_LIST_PRICE,
  DUO_LIST_PRICE_DISPLAY,
  DUO_PRICE,
  DUO_PRICE_DISPLAY,
  DUO_PRICE_PLAIN,
  DUO_SAVINGS_BADGE,
  DUO_SAVINGS_PERCENT,
  DUO_VIEW,
  getDuoJsonLdOffers,
} from "../lib/data/duolingo-pricing";

const ROOT = path.join(__dirname, "..");

// ── 1. Authoritative catalogue price ─────────────────────────────
test("Duolingo catalogue price is exactly ₹1,999", () => {
  const pack = findCoursePrice("Duolingo English Test", "Champion");
  assert.ok(pack, "Duolingo Champion pack must exist in the master");
  assert.equal(pack.id, "duolingo-champion");
  assert.equal(pack.price, 1999);
  assert.equal(DUO_PRICE, 1999);
  assert.equal(DUO_VIEW.price, 1999);
  assert.equal(DUO_PRICE_DISPLAY, "₹1,999");
  assert.equal(DUO_PRICE_PLAIN, "1999");
});

// ── 2. Derivation from the master ────────────────────────────────
test("₹1,999 derives from the price master, never a local literal", () => {
  const src = readFileSync(
    path.join(ROOT, "lib/data/duolingo-pricing.ts"),
    "utf8",
  );
  assert.equal(src.includes("1999"), false, "must not contain a 1999 literal");
  assert.equal(src.includes("1,999"), false, "must not contain a ₹1,999 literal");
  const pack = findCoursePrice("Duolingo English Test", "Champion");
  assert.ok(pack);
  assert.equal(DUO_PRICE, pack.price, "DUO_PRICE must equal the pack price");
  assert.equal(DUO_VIEW.productId, "duolingo-champion");
  assert.equal(DUO_VIEW.currency, "INR");
  assert.equal(DUO_VIEW.gstIncluded, false);
  assert.equal(DUO_VIEW.validity, "4 Weeks / 60 Days");
  assert.equal(
    DUO_VIEW.label,
    "Duolingo English Test – Champion · ₹1,999 + GST",
  );
});

// ── 3. List-price business rule ──────────────────────────────────
test("₹5,000 list-price business rule remains intact", () => {
  assert.equal(DUO_LIST_PRICE, 5000);
  assert.equal(DUO_LIST_PRICE_DISPLAY, "₹5,000");
  const src = readFileSync(
    path.join(ROOT, "lib/data/duolingo-pricing.ts"),
    "utf8",
  );
  assert.equal(
    src.includes("5000"),
    true,
    "the list price must be declared explicitly in duolingo-pricing.ts",
  );
});

// ── 4. Derived saving stays honest ───────────────────────────────
test("60% displayed saving remains mathematically valid", () => {
  const recomputed = Math.round(((5000 - 1999) / 5000) * 100);
  assert.equal(recomputed, 60);
  assert.equal(DUO_SAVINGS_PERCENT, recomputed);
  assert.equal(DUO_SAVINGS_PERCENT, 60);
  assert.equal(DUO_SAVINGS_BADGE, "60% OFF");
  assert.ok(
    ((5000 - 1999) / 5000) * 100 > 60,
    "the raw saving must still round to 60 (guard against a silent drift)",
  );
});

// ── 5. No invented promotional offer ─────────────────────────────
test("no invented Duolingo promotional offer exists", () => {
  assert.equal(getOfferById("duolingo-champion"), undefined);
  assert.equal(
    ALL_OFFERS.some((offer) => offer.id.toLowerCase().includes("duolingo")),
    false,
  );
  assert.equal(
    ALL_OFFERS.some((offer) => offer.productId === "duolingo-champion"),
    false,
  );
  assert.deepEqual(
    ALL_OFFERS.map((offer) => offer.id).sort(),
    [
      "ielts-academic-champion-upcoming-batch-offer",
      "pte-academic-champion-50-offer",
    ],
    "the offer registry must still contain exactly the IELTS and PTE offers",
  );
  assert.deepEqual(validateOffers(), []);
  assert.equal(DUO_GST_INCLUDED, false);
});

// ── 6. JSON-LD price matches the catalogue ───────────────────────
test("Duolingo JSON-LD prices match the catalogue", () => {
  const offers = getDuoJsonLdOffers();
  const pack = findCoursePrice("Duolingo English Test", "Champion");
  assert.ok(pack);

  const champion = offers.find((offer) => offer.sku === "duolingo-champion");
  assert.ok(champion, "Champion offer must carry the catalogue sku");
  assert.equal(champion.name, "Duolingo English Test – Champion");
  assert.equal(champion.price, "1999");
  assert.equal(champion.price, DUO_PRICE_PLAIN);
  assert.equal(champion.priceCurrency, "INR");

  const free = offers.find((offer) => offer.name === "Free Demo Pack");
  assert.ok(free, "the genuine free demo pack offer must remain");
  assert.equal(free.price, "0");

  for (const offer of offers) {
    assert.equal(
      "validFrom" in offer,
      false,
      "schema must not invent a validFrom date",
    );
    assert.equal(
      "validThrough" in offer,
      false,
      "schema must not invent a validThrough date",
    );
    assert.equal(offer.availability, "https://schema.org/OnlineOnly");
    if (offer.price !== "0") {
      assert.equal(
        offer.price,
        String(pack.price),
        "every priced schema offer must equal the master pack price",
      );
    }
  }
});

// ── 7. Checkout unchanged ────────────────────────────────────────
test("checkout stays unchanged: Duolingo is never chargeable", () => {
  assert.equal("Duolingo" in COURSE_FEES, false);
  assert.deepEqual(
    Object.keys(COURSE_FEES).filter((key) => /duolingo/i.test(key)),
    [],
  );
  assert.equal(
    Object.values(CHECKOUT_ALLOW_LIST)
      .flat()
      .includes("duolingo-champion"),
    false,
  );
  assert.deepEqual(
    Object.keys(CHECKOUT_ALLOW_LIST).sort(),
    ["French A1", "German A1", "IELTS", "PTE"],
  );
  assert.equal(DUO_VIEW.checkoutKey, null);
  assert.deepEqual(validateCatalogue(), []);
  assert.deepEqual(validateCheckoutBoundary({}), []);
  assert.deepEqual(validateOfferCheckoutIsolation(), []);
  assert.equal(COURSE_FEES.PTE, 1313, "PTE checkout amount unchanged");
});

// ── 8. IELTS and PTE remain untouched ────────────────────────────
test("IELTS and PTE offers remain untouched", () => {
  assert.equal(IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER.regularPrice, 9998);
  assert.equal(IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER.promotionalPrice, 4999);
  assert.equal(IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER.offerLabel, "50% OFF");
  assert.equal(
    getOfferById("ielts-academic-champion-upcoming-batch-offer")?.checkoutEligible,
    false,
  );
  assert.equal(PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER.regularPrice, 5998);
  assert.equal(PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER.promotionalPrice, 2999);
  assert.equal(PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER.offerLabel, "50% OFF");
  assert.equal(
    getOfferById("pte-academic-champion-50-offer")?.productId,
    "pte-academic-champion",
  );
  assert.deepEqual(validateOffers(), []);
});

// ── Surface honesty: no independent price literals ───────────────
test("Duolingo page surfaces hold no independent price literals", () => {
  for (const file of [
    "app/test-prep/duolingo/DuolingoClient.tsx",
    "app/test-prep/duolingo/page.tsx",
  ]) {
    const src = readFileSync(path.join(ROOT, file), "utf8");
    for (const token of [
      "1,999",
      "₹1,999",
      "1999",
      "₹5,000",
      "5000",
      "60% OFF",
    ]) {
      assert.equal(
        src.includes(token),
        false,
        `${file} must not contain the literal "${token}"`,
      );
    }
  }
});