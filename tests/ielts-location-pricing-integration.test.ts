// FILE: tests/ielts-location-pricing-integration.test.ts
//
// Guards: the Modasa, Gandhinagar and Ahmedabad IELTS pages render the
// centralized marketing packages through the reusable card component.
// Self Prep, Champion — One Batch and Champion — All Timings each open their
// own fixed PayU payment link. Book Free Demo keeps the verified /free-demo
// destination.
//
// Run: npx tsx --test tests/ielts-location-pricing-integration.test.ts

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
const SELF_PREP_PAYU_URL = "https://u.payu.in/PAYUMN/uIqbwdNTKrTp";
const CHAMPION_ONE_BATCH_PAYU_URL = "https://u.payu.in/PAYUMN/BIInlBUFpA9I";
const CHAMPION_ALL_TIMINGS_PAYU_URL = "https://u.payu.in/PAYUMN/wIuPM83kT5li";

type LocationPage = {
  name: string;
  route: string;
  pageFile: string;
  clientFile: string;
  packagesConst: string;
  heading: string;
  canonical: string;
  title: string;
  beforeMarker: string;
  afterMarker: string;
  existingHeadings: readonly string[];
  existingCtaMarkers: readonly string[];
};

const PAGES: readonly LocationPage[] = [
  {
    name: "Modasa",
    route: "/test-prep/ielts-coaching-modasa",
    pageFile: "app/test-prep/ielts-coaching-modasa/page.tsx",
    clientFile: "app/test-prep/ielts-coaching-modasa/IELTSModasaClient.tsx",
    packagesConst: "IELTS_MODASA_PRICING_PACKAGES",
    heading: "IELTS Course Packages in Modasa",
    canonical: "https://www.anuedu.in/test-prep/ielts-coaching-modasa",
    title:
      "IELTS Coaching in Modasa – Online Live Batches & Mock Tests | ANU Education",
    beforeMarker: "══ HERO ══",
    afterMarker: "══ WHY ANU MODASA ══",
    existingHeadings: [
      "Why Choose ANU Education for IELTS Coaching in Modasa?",
      "IELTS Academic Course Packs — Modasa",
      "Frequently Asked Questions — IELTS Coaching Modasa",
    ],
    existingCtaMarkers: [
      "https://study.anuedu.in/register",
      "getWhatsAppLink(websiteWhatsAppMessages.home)",
      "tel:+917016497087",
    ],
  },
  {
    name: "Gandhinagar",
    route: "/test-prep/ielts-coaching-gandhinagar",
    pageFile: "app/test-prep/ielts-coaching-gandhinagar/page.tsx",
    clientFile:
      "app/test-prep/ielts-coaching-gandhinagar/IELTSGandhinagarClient.tsx",
    packagesConst: "IELTS_GANDHINAGAR_PRICING_PACKAGES",
    heading: "IELTS Course Packages in Gandhinagar",
    canonical:
      "https://www.anuedu.in/test-prep/ielts-coaching-gandhinagar",
    title:
      "IELTS Coaching in Gandhinagar – Online Classes & Mock Tests | ANU Education",
    beforeMarker: "── HERO ──",
    afterMarker: "── IELTS BAND SCORE TABLE ──",
    existingHeadings: [
      "IELTS Band Score Requirements by Country — 2026",
      "Why Gandhinagar Students Choose ANU Education for IELTS",
      "Frequently Asked Questions",
    ],
    existingCtaMarkers: [
      "https://www.anuedu.in/free-demo",
      "getWhatsAppLink(websiteWhatsAppMessages.ieltsGandhinagar)",
      "tel:+917016497087",
    ],
  },
  {
    name: "Ahmedabad",
    route: "/test-prep/ielts/ielts-coaching-ahmedabad",
    pageFile: "app/test-prep/ielts/ielts-coaching-ahmedabad/page.tsx",
    clientFile:
      "app/test-prep/ielts/ielts-coaching-ahmedabad/IELTSAhmedabadClient.tsx",
    packagesConst: "IELTS_AHMEDABAD_PRICING_PACKAGES",
    heading: "IELTS Course Packages in Ahmedabad",
    canonical:
      "https://www.anuedu.in/test-prep/ielts/ielts-coaching-ahmedabad",
    title:
      "IELTS Coaching in Ahmedabad – Online Classes & Free Demo | ANU Education",
    beforeMarker: "Location stops being a factor in how good your",
    afterMarker: "IELTS Coaching in Ahmedabad — Why Students Choose ANU Education",
    existingHeadings: [
      "Who Should Join Our IELTS Coaching?",
      "Your IELTS Preparation Path",
      "Batch Timings",
    ],
    existingCtaMarkers: [
      "https://study.anuedu.in/register",
      "waLink(",
      "tel:+917016497087",
    ],
  },
];

const PACKAGE_IDS = [
  "ielts-self-prep",
  "ielts-champion-one-batch",
  "ielts-champion-all-timings",
] as const;

function source(relativeFile: string): string {
  return readFileSync(path.join(ROOT, relativeFile), "utf8");
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

// ── Per-page wiring ──────────────────────────────────────────────

for (const page of PAGES) {
  test(`${page.name}: route and page component exist`, () => {
    const pageSource = source(page.pageFile);
    const clientSource = source(page.clientFile);
    assert.match(pageSource, /export const metadata = \{/);
    assert.match(clientSource, /export default function /);
    assert.ok(pageSource.includes(page.canonical));
  });

  test(`${page.name}: renders the centralized packages through the card component`, () => {
    const clientSource = source(page.clientFile);
    assert.match(
      clientSource,
      /from "@\/lib\/data\/ielts-packages"/,
    );
    assert.match(clientSource, /IELTS_PACKAGES/);
    assert.match(clientSource, /withIeltsPackageCta/);
    assert.match(
      clientSource,
      /from "@\/components\/courses\/IELTSPricingCards"/,
    );
    assert.match(clientSource, /<IELTSPricingCards/);
    assert.ok(
      clientSource.includes(`packages={${page.packagesConst}}`),
      "pricing cards must receive the page's mapped package constant",
    );
    const mappingStart = clientSource.indexOf(
      `const ${page.packagesConst} = IELTS_PACKAGES.map`,
    );
    assert.notEqual(mappingStart, -1, "mapping constant must be built from IELTS_PACKAGES");
    assert.ok(
      clientSource
        .slice(mappingStart, mappingStart + 900)
        .includes("withIeltsPackageCta("),
      "mapping constant must use withIeltsPackageCta",
    );
  });

  test(`${page.name}: pricing section follows the intro and precedes features`, () => {
    const clientSource = source(page.clientFile);
    const pricing = clientSource.indexOf(page.heading);
    const before = clientSource.indexOf(page.beforeMarker);
    const after = clientSource.indexOf(page.afterMarker);
    assert.ok(before !== -1 && after !== -1 && pricing !== -1);
    assert.ok(pricing > before, "pricing must follow the hero/intro");
    assert.ok(pricing < after, "pricing must precede the next content section");
  });

  test(`${page.name}: does not duplicate package data or prices`, () => {
    const clientSource = source(page.clientFile);
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
      "MOST CHOSEN",
      "CHAMPION · FLEXIBLE",
      "300+ grammar, vocabulary and spelling videos",
    ]) {
      assert.ok(
        !clientSource.includes(literal),
        `${page.name} must not hardcode "${literal}"`,
      );
    }
  });

  test(`${page.name}: all three packages open their fixed PayU links`, () => {
    const clientSource = source(page.clientFile);
    const selfPrep = clientSource.indexOf(
      'pkg.packageId === "ielts-self-prep"',
    );
    const demo = clientSource.indexOf('label: "Book Free Demo"');
    assert.ok(selfPrep !== -1 && demo > selfPrep);
    const ctaBlock = clientSource.slice(selfPrep, demo);
    assert.match(ctaBlock, /label: "Buy Now"/);
    assert.match(ctaBlock, /IELTS_SELF_PREP_PAYU_URL/);
    assert.doesNotMatch(ctaBlock, /appearance: "bookNow"/);
    assert.match(ctaBlock, /IELTS_CHAMPION_ONE_BATCH_PAYU_URL/);
    assert.match(ctaBlock, /IELTS_CHAMPION_ALL_TIMINGS_PAYU_URL/);
    assert.doesNotMatch(ctaBlock, /disabled: true as const/);
    assert.ok(clientSource.includes(SELF_PREP_PAYU_URL));
    assert.ok(clientSource.includes(CHAMPION_ONE_BATCH_PAYU_URL));
    assert.ok(clientSource.includes(CHAMPION_ALL_TIMINGS_PAYU_URL));
    assert.doesNotMatch(ctaBlock, /#checkout/);
    assert.doesNotMatch(clientSource, /IELTSCheckoutPanel/);
    assert.doesNotMatch(ctaBlock, /onSelect|razorpay|stripe/i);
    assert.doesNotMatch(
      clientSource,
      /razorpay|stripe|test\.payu|secure\.payu|paymentUrl|\/api\/pay/i,
    );
  });

  test(`${page.name}: Book Free Demo uses /free-demo only`, () => {
    const clientSource = source(page.clientFile);
    const demo = clientSource.indexOf('label: "Book Free Demo"');
    assert.ok(demo !== -1);
    const demoBlock = clientSource.slice(demo, demo + 220);
    assert.match(demoBlock, /href: "\/free-demo"/);
    assert.doesNotMatch(
      demoBlock,
      /https?:\/\/|wa\.me|checkout|payu|razorpay/i,
    );
  });

  test(`${page.name}: existing local content and CTAs remain`, () => {
    const clientSource = source(page.clientFile);
    for (const heading of page.existingHeadings) {
      assert.ok(
        clientSource.includes(heading),
        `${page.name} lost existing content: ${heading}`,
      );
    }
    for (const cta of page.existingCtaMarkers) {
      assert.ok(
        clientSource.includes(cta),
        `${page.name} lost existing CTA: ${cta}`,
      );
    }
    assert.match(clientSource, /<h1\b/);
  });

  test(`${page.name}: SEO metadata and canonical URL are unchanged`, () => {
    const pageSource = source(page.pageFile);
    assert.ok(pageSource.includes(page.title));
    assert.ok(pageSource.includes(page.canonical));
    assert.match(pageSource, /alternates: \{/);
    assert.match(pageSource, /canonical:/);
    assert.match(pageSource, /buildIeltsSchemaForPage\(/);
    assert.match(pageSource, /<JsonLd data=\{graph\} \/>/);
  });

  test(`${page.name}: rendered cards show all packages and both CTAs`, () => {
    const markup = renderToStaticMarkup(
      createElement(IELTSPricingCards, {
        packages: pagePackages(),
        heading: page.heading,
      }),
    );
    assert.equal(markup.match(/data-package-id="/g)?.length, 3);
    for (const id of PACKAGE_IDS) {
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
    for (const price of ["₹1,999", "₹5,499", "₹6,499"]) {
      assert.ok(markup.includes(price), `missing rendered price ${price}`);
    }
    for (const reference of ["₹3,999", "₹10,999", "₹12,999"]) {
      assert.ok(
        !markup.includes(reference),
        `unsupported reference price ${reference} must not be rendered`,
      );
    }
    assert.match(cardFor(markup, "ielts-champion-one-batch"), /MOST CHOSEN/);
  });
}

// ── Shared component safety ─────────────────────────────────────

test("one-column mobile and three-column desktop layout, no custom overflow", () => {
  const markup = renderToStaticMarkup(
    createElement(IELTSPricingCards, {
      packages: pagePackages(),
      heading: "IELTS Course Packages",
    }),
  );
  assert.match(markup, /grid gap-5 md:grid-cols-3/);
  assert.doesNotMatch(markup, /overflow-x-/);
});

test("the only external payment URLs on any location page are the fixed Self Prep and Champion PayU links", () => {
  for (const page of PAGES) {
    const clientSource = source(page.clientFile);
    assert.ok(clientSource.includes(SELF_PREP_PAYU_URL), page.name);
    assert.ok(clientSource.includes(CHAMPION_ONE_BATCH_PAYU_URL), page.name);
    assert.ok(clientSource.includes(CHAMPION_ALL_TIMINGS_PAYU_URL), page.name);
    assert.doesNotMatch(
      clientSource,
      /razorpay|stripe|test\.payu|secure\.payu|paymentUrl|\/api\/pay/i,
      page.name,
    );
    // The retired on-page checkout must not be referenced at all.
    assert.doesNotMatch(clientSource, /#checkout/, page.name);
    assert.doesNotMatch(clientSource, /IELTSCheckoutPanel/, page.name);
  }
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

test("IELTS Online reference page was not modified by this task", () => {
  const onlineSource = source(
    "app/test-prep/ielts-online/IELTSOnlineClient.tsx",
  );
  assert.match(onlineSource, /IELTS_ONLINE_PRICING_PACKAGES/);
  assert.match(onlineSource, /heading="IELTS Online Course Packages"/);
});
