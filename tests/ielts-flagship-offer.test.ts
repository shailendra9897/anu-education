// FILE: tests/ielts-flagship-offer.test.ts
//
// ─────────────────────────────────────────────────────────────────
// IELTS ACADEMIC CHAMPION FLAGSHIP OFFER TESTS
//
// Guards the HISTORICAL IELTS acquisition-offer record (discontinued
// on 2026-11-12 by G1-14) while proving the approved 13-pack IELTS
// pricing architecture is intact:
//   - historical offer values (9998 / 4999 / 50% / GST-excluded)
//   - the offer is inactive, non-checkout and never a catalogue price
//   - approved price master + COURSE_FEES.IELTS values
//   - public surfaces never render the discontinued offer
//
// Run: npx tsx tests/ielts-flagship-offer.test.ts
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER as offer,
  formatGstPrice,
  getFlagshipOfferJsonLd,
  getFlagshipOfferWhatsAppMessage,
  getOfferHeadline,
} from "../lib/data/offers/ielts-academic-champion-flagship";
import { COURSE_PRICES, getCoursePrices } from "../lib/data/course-prices";
import { COURSE_FEES } from "../lib/data/course-fees";

// ── Flagship offer structure ─────────────────────────────────────

test("flagship offer carries the approved commercial values", () => {
  assert.equal(offer.courseType, "IELTS Academic");
  assert.equal(offer.packFamily, "Champion");
  assert.equal(offer.displayName, "IELTS Academic Champion");
  assert.deepEqual([...offer.timings], ["Morning", "Afternoon", "Evening"]);
  assert.equal(offer.regularPrice, 9998);
  assert.equal(offer.promotionalPrice, 4999);
  assert.equal(offer.currency, "INR");
  assert.equal(offer.gstIncluded, false);
  assert.equal(offer.discountPercent, 50);
  assert.equal(offer.offerLabel, "50% OFF");
  assert.equal(offer.offerContext, "Upcoming Confirmed Batch");
  assert.equal(offer.checkoutEligible, false);
  assert.equal(offer.active, false);
  assert.equal(offer.discontinuedOn, "2026-11-12");
  assert.match(offer.discontinuedReason, /Discontinued/);
});

test("the discontinued offer is never an active or checkout-eligible offer", async () => {
  const registry = await import("../lib/data/offers/index");
  assert.ok(registry.HISTORICAL_OFFERS.includes(offer));
  assert.ok(!registry.ACTIVE_OFFERS.includes(offer));
  assert.equal(registry.isOfferActive(offer), false);
});

test("50% discount is computed from the course fee before GST", () => {
  assert.equal(Math.round(((9998 - 4999) / 9998) * 100), 50);
  assert.equal(offer.discountPercent, Math.round(((offer.regularPrice - offer.promotionalPrice) / offer.regularPrice) * 100));
});

test("all offer amounts are rendered as '₹X + GST'", () => {
  assert.equal(formatGstPrice(offer.promotionalPrice), "₹4,999 + GST");
  assert.equal(formatGstPrice(offer.regularPrice), "₹9,998 + GST");
});

test("offer headline is truthful urgency, not a fabricated deadline", () => {
  assert.equal(getOfferHeadline(offer), "50% OFF — Upcoming Confirmed Batch");
  assert.match(offer.urgency, /Limited seats for the upcoming batch/i);
  for (const phrase of ["today only", "last chance", "expires", "hurry", "only 3 seats"]) {
    assert.ok(!offer.urgency.toLowerCase().includes(phrase), `urgency must not say "${phrase}"`);
  }
});

test("WhatsApp CTA names the offer, GST-excluded price and chosen timing", () => {
  const message = getFlagshipOfferWhatsAppMessage("Afternoon");
  assert.match(message, /IELTS Academic Champion/);
  assert.match(message, /₹4,999 \+ GST/);
  assert.match(message, /Preferred batch timing: Afternoon/);
  assert.match(message, /including GST/);
});

test("product/offer JSON-LD uses the numeric GST-exclusive promo price", () => {
  const jsonLd = getFlagshipOfferJsonLd({ url: "https://www.anuedu.in/test-prep/ielts-online" });
  const productOffer = jsonLd.offers as Record<string, unknown>;
  assert.equal(jsonLd["@type"], "Product");
  assert.equal(productOffer["@type"], "Offer");
  assert.equal(productOffer.price, 4999);
  assert.equal(typeof productOffer.price, "number");
  assert.equal(productOffer.priceCurrency, "INR");
  const spec = productOffer.priceSpecification as Record<string, unknown>;
  assert.equal(spec.valueAddedTaxIncluded, false);
  assert.equal(spec.price, 4999);
});

// ── Existing IELTS pack architecture must stay intact ────────────

const EXPECTED_IELTS_PACKS: Record<string, number> = {
  "ielts-academic-self-prep": 1999,
  "ielts-academic-champion-morning": 5499,
  "ielts-academic-champion-afternoon": 5499,
  "ielts-academic-champion-evening": 5499,
  "ielts-academic-champion-all-timings": 6499,
  "ielts-academic-reading-marathon": 3000,
  "ielts-academic-writing-marathon": 3000,
  "ielts-academic-speaking-marathon": 3000,
  "ielts-general-self-preparation": 1875,
  "ielts-general-champion": 4125,
  "ielts-general-reading-marathon": 3000,
  "ielts-general-writing-marathon": 3000,
  "ielts-general-speaking-marathon": 3000,
};

test("all 13 IELTS packs keep their approved prices", () => {
  const ielts = COURSE_PRICES.filter((p) => p.courseId.startsWith("ielts-"));
  assert.equal(ielts.length, 13);
  for (const [id, price] of Object.entries(EXPECTED_IELTS_PACKS)) {
    const pack = COURSE_PRICES.find((p) => p.id === id);
    assert.ok(pack, `missing pack ${id}`);
    assert.equal(pack.price, price, `${id} price changed`);
  }
});

test("the flagship offer is not stored as an IELTS pack", () => {
  const match = COURSE_PRICES.filter(
    (p) => p.price === 4999 || p.price === 9998 || p.id.includes("flagship") || p.id.includes("upcoming-batch"),
  );
  assert.deepEqual(match, []);
  assert.equal(getCoursePrices("IELTS Academic").length, 8);
  assert.equal(getCoursePrices("IELTS General").length, 5);
});

test("COURSE_FEES.IELTS did not silently change", () => {
  assert.equal(COURSE_FEES.IELTS, 1999);
});

test("IELTS Academic catalogue in data/pricing.json is untouched by the offer", async () => {
  const raw = await readFile(path.join(process.cwd(), "data", "pricing.json"), "utf8");
  const json = JSON.parse(raw) as {
    prices: { ielts: Array<{ pack_id: string; price: number }> };
  };
  assert.equal(json.prices.ielts.length, 8);
  for (const pack of json.prices.ielts) {
    assert.equal(pack.price, EXPECTED_IELTS_PACKS[pack.pack_id], `${pack.pack_id} price changed`);
    assert.notEqual(pack.price, 4999);
    assert.notEqual(pack.price, 9998);
  }
});

test("knowledge pricing overview records the offer as discontinued, not as a pack price", async () => {
  const raw = await readFile(path.join(process.cwd(), "knowledge", "services", "pricing.md"), "utf8");
  assert.match(raw, /Discontinued offer/);
  assert.match(raw, /must not be quoted, displayed or sold/);
  assert.doesNotMatch(raw, /4,999 \+ GST/);
  assert.doesNotMatch(raw, /9,998 \+ GST/);
  assert.doesNotMatch(raw, /IELTS Academic Champion — Upcoming Batch Offer/);
  for (const phrase of [
    "₹4,999 inclusive of GST",
    "₹4,999 final price",
    "4,999 all inclusive",
    "4,999 is the final",
    "4,999 is the price",
  ]) {
    assert.ok(!raw.includes(phrase), `pricing knowledge must not claim "${phrase}"`);
  }
});
