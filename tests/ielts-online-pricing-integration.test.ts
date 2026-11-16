// FILE: tests/ielts-online-pricing-integration.test.ts
//
// Guards: the IELTS Online page renders the centralized marketing packages
// through the reusable card component. Self Prep, Champion — One Batch and
// Champion — All Timings each open their own fixed PayU payment link. Book
// Free Demo keeps the verified /free-demo destination.
//
// Run: npx tsx --test tests/ielts-online-pricing-integration.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import IELTSPricingCards, {
  type IELTSPricingPackage,
} from "../components/courses/IELTSPricingCards";
import {
  IELTS_PACKAGES,
  withIeltsPackageCta,
} from "../lib/data/ielts-packages";
import { COURSE_PRICES } from "../lib/data/course-prices";
import { COURSE_FEES } from "../lib/data/course-fees";
import { CHECKOUT_ALLOW_LIST } from "../lib/data/pricing-registry";

const ROOT = path.join(__dirname, "..");
const PAGE_FILE = "app/test-prep/ielts-online/IELTSOnlineClient.tsx";
const SELF_PREP_PAYU_URL = "https://u.payu.in/PAYUMN/uIqbwdNTKrTp";
const CHAMPION_ONE_BATCH_PAYU_URL = "https://u.payu.in/PAYUMN/BIInlBUFpA9I";
const CHAMPION_ALL_TIMINGS_PAYU_URL = "https://u.payu.in/PAYUMN/wIuPM83kT5li";

function pageSource(): string {
  return readFileSync(path.join(ROOT, PAGE_FILE), "utf8");
}

function pagePackages(): readonly IELTSPricingPackage[] {
  return IELTS_PACKAGES.map((pkg) =>
    withIeltsPackageCta(
      pkg,
      pkg.packageId === "ielts-self-prep"
        ? {
            label: "Buy Now",
            href: SELF_PREP_PAYU_URL,
            ariaLabel: `Buy ${pkg.title} — open the secure PayU payment page`,
          }
        : pkg.packageId === "ielts-champion-one-batch"
          ? {
              label: "Buy Now",
              href: CHAMPION_ONE_BATCH_PAYU_URL,
              ariaLabel: `Buy ${pkg.title} — open the secure PayU payment page`,
            }
          : {
              label: "Buy Now",
              href: CHAMPION_ALL_TIMINGS_PAYU_URL,
              ariaLabel: `Buy ${pkg.title} — open the secure PayU payment page`,
            },
      {
        label: "Book Free Demo",
        href: "/free-demo",
        ariaLabel: `Book a free demo for ${pkg.title}`,
      },
    ),
  );
}

function cardFor(markup: string, packageId: string): string {
  const marker = `data-package-id="${packageId}"`;
  const start = markup.indexOf(marker);
  assert.notEqual(start, -1, `package card "${packageId}" was not rendered`);
  const articleStart = markup.lastIndexOf("<article", start);
  const articleEnd = markup.indexOf("</article>", start);
  assert.notEqual(articleStart, -1);
  assert.notEqual(articleEnd, -1);
  return markup.slice(articleStart, articleEnd + "</article>".length);
}

// ── Page wiring ──────────────────────────────────────────────────

test("IELTS Online imports and renders the central package data", () => {
  const source = pageSource();
  assert.match(source, /from "@\/lib\/data\/ielts-packages"/);
  assert.match(source, /IELTS_PACKAGES/);
  assert.match(source, /withIeltsPackageCta/);
  assert.match(source, /from "@\/components\/courses\/IELTSPricingCards"/);
  assert.match(source, /<IELTSPricingCards/);
  assert.match(source, /packages=\{IELTS_ONLINE_PRICING_PACKAGES\}/);
});

test("the pricing section sits after the intro and before detailed features", () => {
  const source = pageSource();
  const pricing = source.indexOf("IELTS Online Course Packages");
  const stats = source.indexOf("══ STATS ══");
  const academic = source.indexOf("══ ACADEMIC vs GENERAL ══");
  const highlights = source.indexOf("══ COURSE HIGHLIGHTS ══");
  assert.ok(stats !== -1 && academic !== -1 && highlights !== -1);
  assert.ok(pricing > stats, "pricing must follow the intro stats");
  assert.ok(pricing < academic, "pricing must precede the exam/feature detail");
  assert.ok(pricing < highlights, "pricing must precede course highlights");
});

test("the page does not duplicate package prices or feature lists", () => {
  const source = pageSource();
  for (const literal of [
    "1,999",
    "3,999",
    "5,499",
    "10,999",
    "6,499",
    "12,999",
    "1999",
    "3999",
    "5499",
    "10999",
    "6499",
    "12999",
    "300+ grammar, vocabulary and spelling videos",
    "Sunday live doubt-solving session",
    "Saturday test-analysis sessions",
  ]) {
    assert.ok(!source.includes(literal), `page must not hardcode "${literal}"`);
  }
});

// ── Rendered cards from the central data ────────────────────────

test("all three package cards render with their stable ids and prices", () => {
  const markup = renderToStaticMarkup(
    createElement(IELTSPricingCards, {
      packages: pagePackages(),
      heading: "IELTS Online Course Packages",
    }),
  );
  assert.equal(markup.match(/data-package-id="/g)?.length, 3);
  for (const id of [
    "ielts-self-prep",
    "ielts-champion-one-batch",
    "ielts-champion-all-timings",
  ]) {
    assert.ok(cardFor(markup, id).length > 0);
  }
  for (const price of ["₹1,999", "₹5,499", "₹6,499"]) {
    assert.ok(markup.includes(price), `missing rendered price ${price}`);
  }
  assert.match(cardFor(markup, "ielts-champion-one-batch"), /MOST CHOSEN/);
});

test("each card renders its primary CTA and Book Free Demo", () => {
  const markup = renderToStaticMarkup(
    createElement(IELTSPricingCards, { packages: pagePackages() }),
  );
  for (const id of [
    "ielts-self-prep",
    "ielts-champion-one-batch",
    "ielts-champion-all-timings",
  ]) {
    const card = cardFor(markup, id);
    assert.match(card, />Buy Now</);
    assert.match(card, />Book Free Demo</);
    assert.match(card, /href="\/free-demo"/);
    if (id === "ielts-self-prep") {
      assert.doesNotMatch(card, /aria-disabled="true"/);
      assert.ok(card.includes(`href="${SELF_PREP_PAYU_URL}"`));
      assert.match(card, /inline-flex w-full/);
      assert.doesNotMatch(card, /width:150px/);
    } else if (id === "ielts-champion-one-batch") {
      assert.doesNotMatch(card, /aria-disabled="true"/);
      assert.ok(card.includes(`href="${CHAMPION_ONE_BATCH_PAYU_URL}"`));
      assert.doesNotMatch(card, /#checkout/);
    } else {
      assert.doesNotMatch(card, /aria-disabled="true"/);
      assert.ok(card.includes(`href="${CHAMPION_ALL_TIMINGS_PAYU_URL}"`));
      assert.doesNotMatch(card, /#checkout/);
    }
  }
});

// ── CTA safety ───────────────────────────────────────────────────

test("all three packages open their fixed PayU links", () => {
  const source = pageSource();
  const selfPrepStart = source.indexOf(
    'pkg.packageId === "ielts-self-prep"',
  );
  const demoStart = source.indexOf('label: "Book Free Demo"');
  assert.ok(selfPrepStart !== -1 && demoStart > selfPrepStart);
  const ctaBlock = source.slice(selfPrepStart, demoStart);
  assert.match(ctaBlock, /label: "Buy Now"/);
  assert.match(ctaBlock, /IELTS_SELF_PREP_PAYU_URL/);
  assert.doesNotMatch(ctaBlock, /appearance: "bookNow"/);
  assert.match(ctaBlock, /IELTS_CHAMPION_ONE_BATCH_PAYU_URL/);
  assert.match(ctaBlock, /IELTS_CHAMPION_ALL_TIMINGS_PAYU_URL/);
  assert.doesNotMatch(ctaBlock, /disabled: true as const/);
  assert.ok(source.includes(SELF_PREP_PAYU_URL));
  assert.ok(source.includes(CHAMPION_ONE_BATCH_PAYU_URL));
  assert.ok(source.includes(CHAMPION_ALL_TIMINGS_PAYU_URL));
  assert.doesNotMatch(ctaBlock, /#checkout/);
  assert.doesNotMatch(ctaBlock, /onSelect|razorpay|stripe/i);
  assert.doesNotMatch(source, /IELTSCheckoutPanel/);

  const markup = renderToStaticMarkup(
    createElement(IELTSPricingCards, { packages: pagePackages() }),
  );
  assert.doesNotMatch(markup, /aria-disabled="true"/);
  assert.equal(
    markup.split(`href="${SELF_PREP_PAYU_URL}"`).length - 1,
    1,
  );
  assert.equal(
    markup.split(`href="${CHAMPION_ONE_BATCH_PAYU_URL}"`).length - 1,
    1,
  );
  assert.equal(
    markup.split(`href="${CHAMPION_ALL_TIMINGS_PAYU_URL}"`).length - 1,
    1,
  );
  assert.doesNotMatch(markup, /#checkout/);
  assert.doesNotMatch(markup, /razorpay|stripe|paymentUrl/i);
});

test("Book Free Demo uses the verified /free-demo flow only", () => {
  const source = pageSource();
  const demoStart = source.indexOf('label: "Book Free Demo"');
  assert.ok(demoStart !== -1);
  const demoBlock = source.slice(demoStart, demoStart + 220);
  assert.match(demoBlock, /href: "\/free-demo"/);
  assert.doesNotMatch(
    demoBlock,
    /https?:\/\/|wa\.me|checkout|payu|razorpay/i,
  );

  const markup = renderToStaticMarkup(
    createElement(IELTSPricingCards, { packages: pagePackages() }),
  );
  assert.equal(markup.match(/href="\/free-demo"/g)?.length, 3);
});

test("the only external payment URLs are the fixed Self Prep and Champion PayU links", () => {
  const source = pageSource();
  assert.ok(source.includes(SELF_PREP_PAYU_URL));
  assert.ok(source.includes(CHAMPION_ONE_BATCH_PAYU_URL));
  assert.ok(source.includes(CHAMPION_ALL_TIMINGS_PAYU_URL));
  assert.doesNotMatch(
    source,
    /razorpay|stripe|test\.payu|secure\.payu|paymentUrl|\/api\/pay/i,
  );
  // The retired on-page checkout must not be referenced at all.
  assert.doesNotMatch(source, /#checkout/);
  assert.doesNotMatch(source, /IELTSCheckoutPanel/);
});

// ── Existing content and boundaries ─────────────────────────────

test("existing IELTS Online content remains present", () => {
  const source = pageSource();
  for (const heading of [
    "Online IELTS Coaching in India",
    "IELTS Academic vs General Training",
    "IELTS Academic Exam Format 2026",
    "IELTS Course Highlights",
    "Choose Your IELTS Academic Course Pack",
    "Champion Course — Live Class Schedule",
    "Frequently Asked Questions — IELTS Academic 2026",
  ]) {
    assert.ok(source.includes(heading), `missing existing content: ${heading}`);
  }
});

test("layout uses the responsive card component without custom overflow", () => {
  const source = pageSource();
  assert.match(source, /<IELTSPricingCards/);
  assert.doesNotMatch(source, /IELTSPricingCards[\s\S]{0,200}overflow-x-/);
});

test("catalogue and checkout values use the G1-14 approved prices", () => {
  assert.equal(COURSE_FEES.IELTS, 1999);
  assert.deepEqual(CHECKOUT_ALLOW_LIST.IELTS, ["ielts-academic-self-prep"]);
  assert.equal(
    COURSE_PRICES.find((product) => product.id === "ielts-academic-self-prep")
      ?.price,
    1999,
  );
  assert.equal(
    COURSE_PRICES.find(
      (product) => product.id === "ielts-academic-champion-morning",
    )?.price,
    5499,
  );
});
