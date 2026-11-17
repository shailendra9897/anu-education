// FILE: tests/ielts-pricing.test.ts
//
// PRICING-ARCH-W4 GUARDS: IELTS PriceView migration.
//
// Guards that the IELTS pricing surfaces derive from the shared
// IELTS PriceView module and stay honest:
//   1. All 13 IELTS catalogue packs live in the master and each
//      PriceView equals its master price (no drift, no fabricated packs).
//   2. ₹1,999 is the From price; ₹5,499 is the Champion from price.
//   3. The discontinued promotional offer (and its values) never appears
//      as a catalogue price and no surface pairs a catalogue price with
//      the offer price (no ₹5,499 → ₹4,999 "was/now").
//   4. Checkout boundary: COURSE_FEES.IELTS = 1,999 and the allow-list
//      remains exactly ["ielts-academic-self-prep"].
//   5. Migrated consumer surfaces import from lib/data/ielts-pricing.ts
//      and carry no hardcoded catalogue or offer price literals.
//   6. The IELTS Online FAQ no longer advertises the discontinued offer.
//   7. No IELTS JSON-LD surface emits a zero Offer price for a paid
//      product; zero is only ever allowed on a named free demo. The India
//      course schema derives its catalogue prices from the PriceView module
//      and the Academic exam guide emits no fabricated price.
//
// Run: npx tsx --test tests/ielts-pricing.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { COURSE_PRICES } from "../lib/data/course-prices";
import { COURSE_FEES } from "../lib/data/course-fees";
import { CHECKOUT_ALLOW_LIST, validateCatalogue, validateCheckoutBoundary } from "../lib/data/pricing-registry";
import {
  IELTS_FROM_PRICE,
  IELTS_FROM_PRICE_DISPLAY,
  IELTS_VIEWS,
  IELTS_ACADEMIC_SELF_PREP_PRICE,
  IELTS_ACADEMIC_SELF_PREP_PRICE_DISPLAY,
  IELTS_ACADEMIC_CHAMPION_FROM_PRICE,
  IELTS_ACADEMIC_CHAMPION_FROM_PRICE_DISPLAY,
  IELTS_GST_LABEL,
  formatIeltsPrice,
} from "../lib/data/ielts-pricing";
import { IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER } from "../lib/data/offers/ielts-academic-champion-flagship";
import { faqs as modasaFaqs } from "../lib/data/faq/ielts-modasa";
import { faqs as onlineFaqs } from "../lib/data/faq/ielts-online";

const ROOT = path.join(__dirname, "..");

const IELTS_CONSUMER_SOURCES = [
  "app/test-prep/ielts-coaching-modasa/IELTSModasaClient.tsx",
  "app/test-prep/ielts-coaching-india/IELTSCoachingIndiaClient.tsx",
  "lib/data/faq/ielts-modasa.ts",
];

function readIeltsConsumers(): Array<{ file: string; source: string }> {
  return IELTS_CONSUMER_SOURCES.map((file) => ({
    file,
    source: readFileSync(path.join(ROOT, file), "utf8"),
  }));
}

// ── Expected catalogue (mirrors the price master) ─────────────────

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

// ── 1. All 13 IELTS packs are master products at master prices ────

test("IELTS views are exactly the 13 master packs at master prices", () => {
  const master = new Map(COURSE_PRICES.map((p) => [p.id, p.price]));
  assert.equal(IELTS_VIEWS.length, 13);
  for (const view of IELTS_VIEWS) {
    assert.equal(view.price, EXPECTED_IELTS_PACKS[view.productId], view.productId);
    assert.equal(master.get(view.productId), view.price, `${view.productId} drifted from master`);
  }
});

test("Inventory of IELTS packs is unchanged (8 Academic + 5 General)", () => {
  const ids = IELTS_VIEWS.map((v) => v.productId).sort();
  assert.deepEqual(ids, Object.keys(EXPECTED_IELTS_PACKS).sort());
});

// ── 2. From and Champion-from prices stay put ─────────────────────

test("Global From price stays ₹1,875 (General) and Champion-from is ₹5,499", () => {
  assert.equal(IELTS_FROM_PRICE, 1875);
  assert.equal(IELTS_FROM_PRICE_DISPLAY, "₹1,875");
  assert.equal(IELTS_ACADEMIC_SELF_PREP_PRICE, 1999);
  assert.equal(IELTS_ACADEMIC_SELF_PREP_PRICE_DISPLAY, "₹1,999");
  assert.equal(formatIeltsPrice(1999), "₹1,999");

  assert.equal(IELTS_ACADEMIC_CHAMPION_FROM_PRICE, 5499);
  assert.equal(IELTS_ACADEMIC_CHAMPION_FROM_PRICE_DISPLAY, "₹5,499");
  assert.equal(formatIeltsPrice(5499), "₹5,499");
});

test("other catalogue prices remain as master renders them", () => {
  assert.equal(formatIeltsPrice(6499), "₹6,499"); // Champion all timings
  assert.equal(formatIeltsPrice(4125), "₹4,125"); // IELTS General Champion
  assert.equal(formatIeltsPrice(3000), "₹3,000"); // Marathon packs
  assert.equal(formatIeltsPrice(4999), "₹4,999"); // formatting is neutral
  assert.equal(formatIeltsPrice(9998), "₹9,998");
});

// ── 3. Offer never masquerades as a catalogue price ────────────────

test("promotional offer values are not IELTS catalogue prices", () => {
  const viewPrices = IELTS_VIEWS.map((v) => v.price);
  assert.ok(!viewPrices.includes(4999), "₹4,999 must not be a catalogue price");
  assert.ok(!viewPrices.includes(9998), "₹9,998 must not be a catalogue price");
  assert.ok(!viewPrices.includes(0), "no zero-valued catalogue prices");
});

test("flagship offer keeps its approved values and checkout-isolation", () => {
  const offer = IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;
  assert.equal(offer.displayName, "IELTS Academic Champion");
  assert.equal(offer.promotionalPrice, 4999);
  assert.equal(offer.regularPrice, 9998);
  assert.equal(offer.discountPercent, 50);
  assert.equal(offer.checkoutEligible, false);
  assert.equal(offer.active, false);
  assert.equal(offer.discontinuedOn, "2026-11-12");
  assert.deepEqual(validateCheckoutBoundary({ offers: [offer] as const }), []);
});

// ── 4. Checkout boundary is untouched ──────────────────────────────

test("catalogue validation is clean", () => {
  assert.deepEqual(validateCatalogue(), []);
});

test("COURSE_FEES.IELTS is ₹1,999 and allow-list stays self-prep only", () => {
  assert.equal(COURSE_FEES.IELTS, 1999);
  assert.deepEqual(CHECKOUT_ALLOW_LIST.IELTS, ["ielts-academic-self-prep"]);
  assert.deepEqual(
    validateCheckoutBoundary({
      offers: [IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER as { id: string; checkoutEligible: boolean }],
    }),
    [],
  );
});

// ── 5. Migrated surfaces derive prices, no literals remain ─────────

test("migrated IELTS consumers import prices from the PriceView module", () => {
  for (const { file, source } of readIeltsConsumers()) {
    assert.ok(
      /lib\/data\/ielts-pricing/.test(source),
      `${file} must import prices from lib/data/ielts-pricing.ts`,
    );
  }
});

test("no migrated consumer hardcodes a catalogue or offer price literal", () => {
  const banned =
    /₹1,875|₹5,250|₹6,375|₹1,999|₹5,499|₹6,499|₹4,125|₹3,000|₹4,999|₹9,998|"1875"|"5250"|"6375"|"1999"|"5499"|"6499"|1,875|5,250|6,375|1,999|5,499|6,499|4,125|4,999|9,998/;
  for (const { file, source } of readIeltsConsumers()) {
    for (const line of source.split("\n")) {
      assert.ok(
        !banned.test(line),
        `${file} must not hardcode an IELTS price literal: "${line.trim()}"`,
      );
    }
  }
});

test("no consumer pairs a catalogue price with the offer price", () => {
  const wasNow =
    /(5,250|6,375|5,499|6,499)[^\n]{0,80}(4,999|9,998)|(4,999|9,998)[^\n]{0,80}(5,250|6,375|5,499|6,499)/;
  for (const { file, source } of readIeltsConsumers()) {
    assert.ok(!wasNow.test(source), `${file} must not claim a catalogue-to-offer discount`);
  }
});

test("Modasa client cards derive from PriceView constants", () => {
  const client = readFileSync(
    path.join(ROOT, "app/test-prep/ielts-coaching-modasa/IELTSModasaClient.tsx"),
    "utf8",
  );
  assert.ok(/IELTS_ACADEMIC_SELF_PREP_PRICE_DISPLAY/.test(client));
  assert.ok(/IELTS_ACADEMIC_CHAMPION_FROM_PRICE_DISPLAY/.test(client));
  assert.ok(!/IELTS_ACADEMIC_SELF_PREP_PRICE_PLAIN/.test(client));
  assert.ok(!/IELTS_ACADEMIC_CHAMPION_FROM_PRICE_PLAIN/.test(client));
});

test("Modasa schema is server-rendered from the price registry", () => {
  const page = readFileSync(
    path.join(ROOT, "app/test-prep/ielts-coaching-modasa/page.tsx"),
    "utf8",
  );
  assert.match(page, /buildIeltsSchemaForPage\(\s*"modasa"/);
  assert.match(page, /<JsonLd data=\{graph\} \/>/);
});

test("India client pricing cards derive from PriceView constants", () => {
  const client = readFileSync(
    path.join(ROOT, "app/test-prep/ielts-coaching-india/IELTSCoachingIndiaClient.tsx"),
    "utf8",
  );
  assert.ok(/IELTS_ACADEMIC_SELF_PREP_PRICE_DISPLAY/.test(client));
  assert.ok(/IELTS_ACADEMIC_CHAMPION_FROM_PRICE_DISPLAY/.test(client));
  assert.ok(/price: "₹0"/.test(client), "FREE Demo card stays at ₹0");
});

test("India client routes Self Preparation to the Self Prep PayU link and Champion to One Batch PayU", () => {
  const client = readFileSync(
    path.join(ROOT, "app/test-prep/ielts-coaching-india/IELTSCoachingIndiaClient.tsx"),
    "utf8",
  );
  const oneBatchPayuUrl = "https://u.payu.in/PAYUMN/BIInlBUFpA9I";
  const selfPrepPayuUrl = "https://u.payu.in/PAYUMN/uIqbwdNTKrTp";
  assert.ok(
    client.includes(oneBatchPayuUrl),
    "India page must use the Champion — One Batch PayU link for the Champion card",
  );
  assert.ok(
    client.includes(selfPrepPayuUrl),
    "India page must use the ₹1,999 Self Prep PayU link for the Self Preparation card",
  );
  assert.ok(
    !client.includes("https://u.payu.in/PAYUMN/wIuPM83kT5li"),
    "India page must not use the Champion — All Timings PayU link",
  );
  assert.equal(
    client.split("IELTS_CHAMPION_ONE_BATCH_PAYU_URL").length - 1,
    2,
    "the One Batch constant is declared once and used by the Champion CTA",
  );
  assert.equal(
    client.split("IELTS_SELF_PREP_PAYU_URL").length - 1,
    2,
    "the Self Prep constant is declared once and used by the Self Preparation CTA",
  );
  assert.doesNotMatch(client, /#checkout/);
  assert.doesNotMatch(client, /IELTSCheckoutPanel/);
  assert.doesNotMatch(client, /Enrolment Opening Soon/);
  assert.doesNotMatch(
    client,
    />\s*Book Now\s*</,
    "Self Preparation CTA must read Buy Now",
  );
  assert.match(client, /inline-flex w-full/);
  assert.doesNotMatch(client, /width: "150px"/);
  assert.ok(
    client.includes("IELTS_GST_LABEL"),
    "India page must render the shared GST disclosure",
  );
  assert.ok(
    client.includes('href="/free-demo"'),
    "Book Free Demo must remain on the free-demo card",
  );
});

test("IELTS GST label discloses GST as included", () => {
  assert.equal(IELTS_GST_LABEL, "Prices include GST · 18% GST included");
});

test("Modasa FAQ renders derived catalogue prices, offer never mentioned", () => {
  const coursesAnswer = modasaFaqs.find((f) => f.q.includes("What IELTS courses are available"))!.a;
  assert.match(coursesAnswer, /starting ₹1,999, GST included/);
  assert.match(coursesAnswer, /from ₹5,499, GST included/);
  assert.ok(!coursesAnswer.includes("4,999") && !coursesAnswer.includes("9,998"));
  const examAnswer = modasaFaqs.find((f) => f.q.includes("exam fee"))!.a;
  assert.match(examAnswer, /₹18,000/, "external exam fee is unchanged");
});

// ── 6. IELTS Online FAQ derives the flagship offer, never hardcodes ─

test("IELTS Online FAQ does not advertise the discontinued offer", () => {
  const source = readFileSync(
    path.join(ROOT, "lib/data/faq/ielts-online.ts"),
    "utf8",
  );
  assert.ok(
    !/lib\/data\/offers\/ielts-academic-champion-flagship/.test(source),
    "ielts-online FAQ must not import the discontinued offer module",
  );
  const rendered = onlineFaqs.map((f) => `${f.q} ${f.a}`).join("\n");
  for (const literal of ["4,999", "9,998", "50% OFF", "upcoming batch"]) {
    assert.ok(
      !rendered.toLowerCase().includes(literal.toLowerCase()),
      `ielts-online FAQ must not mention the discontinued offer: "${literal}"`,
    );
  }
});

// ── 7. IELTS JSON-LD never claims a zero price for a paid product ──

const IELTS_JSONLD_SURFACES = [
  "app/test-prep/ielts-coaching-india/IELTSCoachingIndiaClient.tsx",
  "app/test-prep/ielts-coaching-modasa/IELTSModasaClient.tsx",
  "app/test-prep/ielts-online/IELTSOnlineClient.tsx",
  "app/test-prep/ielts-coaching-gandhinagar/IELTSGandhinagarClient.tsx",
  "app/test-prep/ielts/ielts-coaching-ahmedabad/IELTSAhmedabadClient.tsx",
  "app/test-prep/ielts-academic/page.tsx",
];

test("IELTS JSON-LD emits price 0 only for a named free demo", () => {
  const zeroPrice = /price"?\s*:\s*"?0"?(?![\d.])/;
  for (const file of IELTS_JSONLD_SURFACES) {
    const source = readFileSync(path.join(ROOT, file), "utf8");
    for (const line of source.split("\n")) {
      if (zeroPrice.test(line)) {
        assert.ok(
          /demo/i.test(line),
          `${file}: a zero Offer price is only allowed on a named free demo — "${line.trim()}"`,
        );
      }
    }
  }
});

test("India page schema is server-rendered from the price registry", () => {
  const pageSrc = readFileSync(
    path.join(ROOT, "app/test-prep/ielts-coaching-india/page.tsx"),
    "utf8",
  );
  assert.match(pageSrc, /buildIeltsSchemaForPage\(\s*"india"/);
  assert.match(pageSrc, /<JsonLd data=\{graph\} \/>/);

  const clientSrc = readFileSync(
    path.join(ROOT, "app/test-prep/ielts-coaching-india/IELTSCoachingIndiaClient.tsx"),
    "utf8",
  );
  assert.doesNotMatch(clientSrc, /id="course-schema"/);
  assert.doesNotMatch(clientSrc, /"@type": "Course"/);
});

test("IELTS Academic guide schema emits no fabricated catalogue price", () => {
  const src = readFileSync(
    path.join(ROOT, "app/test-prep/ielts-academic/page.tsx"),
    "utf8",
  );
  const schema = src.slice(
    src.indexOf('"@type": "Course"'),
    src.indexOf("<main"),
  );
  assert.ok(
    !/price\s*:\s*"?\d/.test(schema.replace(/priceCurrency/g, "")),
    "the IELTS Academic exam guide must not emit a fabricated price",
  );
});