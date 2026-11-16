// FILE: tests/ielts-pricing-cards.test.ts
//
// Focused component tests for components/courses/IELTSPricingCards.tsx.
//
// The component is presentational: these tests supply the approved
// package copy through props and assert what the component renders.
// They deliberately do not import page content, the catalogue, offers,
// checkout, AI knowledge or the WhatsApp layer.
//
// Run: npx tsx --test tests/ielts-pricing-cards.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import IELTSPricingCards, {
  type IELTSPricingPackage,
} from "../components/courses/IELTSPricingCards";

const ROOT = path.join(__dirname, "..");

const SELF_PREP_FEATURES = [
  "English assessment test",
  "300+ grammar, vocabulary and spelling videos",
  "50+ exercises",
  "20 hours of foundation lectures",
  "60 practice tests",
  "15 full-length timed mock tests",
  "Sunday live doubt-solving session",
];

const ONE_BATCH_FEATURES = [
  "Everything in Self Prep",
  "Live lectures with an 8-week teaching cycle",
  "Separate Beginner and Advanced batches",
  "40–60 hours of live teaching",
  "Saturday test-analysis sessions",
  "Free 4-week live French course",
];

const ALL_TIMINGS_FEATURES = [
  "Everything in Champion — One Batch",
  "Switch freely between all three batches",
  "Suitable for changing work or college schedules",
  "Avoid missing classes due to timing clashes",
  "Free 4-week live French course",
];

// Local test fixture only. It is not a pricing registry and is never
// imported by application code; parents supply their own approved data.
const PACKAGES: IELTSPricingPackage[] = [
  {
    packageId: "self-prep",
    title: "Self Prep",
    subtitle: "Study on your own schedule",
    sellingPrice: 1999,
    referencePrice: 3999,
    savingsAmount: 2000,
    validity: "6 months",
    perDayAmount: 11,
    features: SELF_PREP_FEATURES,
    cta: { label: "Start Free Trial", href: "/free-demo" },
  },
  {
    packageId: "champion-one-batch",
    title: "Champion — One Batch",
    subtitle: "Pick Morning, Afternoon or Evening",
    sellingPrice: 5499,
    referencePrice: 10999,
    savingsAmount: 5500,
    validity: "6 months",
    perDayAmount: 31,
    badge: "MOST CHOSEN",
    recommended: true,
    features: ONE_BATCH_FEATURES,
    cta: { label: "Start Free Trial", href: "/free-demo" },
  },
  {
    packageId: "champion-all-timings",
    title: "Champion — All Timings",
    subtitle: "Attend Morning, Afternoon or Evening, any day",
    sellingPrice: 6499,
    referencePrice: 12999,
    savingsAmount: 6500,
    validity: "6 months",
    perDayAmount: 36,
    badge: "CHAMPION · FLEXIBLE",
    features: ALL_TIMINGS_FEATURES,
    cta: { label: "Start Free Trial", href: "/free-demo" },
  },
];

function render(packages: readonly IELTSPricingPackage[] = PACKAGES): string {
  return renderToStaticMarkup(
    createElement(IELTSPricingCards, {
      packages,
      heading: "IELTS course packages",
      intro: "Choose the package that matches your schedule and goals.",
    }),
  );
}

function cardFor(markup: string, packageId: string): string {
  const marker = `data-package-id="${packageId}"`;
  const start = markup.indexOf(marker);
  assert.notEqual(start, -1, `package card "${packageId}" was not rendered`);
  const articleStart = markup.lastIndexOf("<article", start);
  const articleEnd = markup.indexOf("</article>", start);
  assert.notEqual(articleStart, -1, `missing <article> for "${packageId}"`);
  assert.notEqual(articleEnd, -1, `missing </article> for "${packageId}"`);
  return markup.slice(articleStart, articleEnd + "</article>".length);
}

// ── Structure and copy ────────────────────────────────────────────

test("renders exactly one card for each of the three package types", () => {
  const markup = render();
  assert.equal(markup.match(/data-package-id="/g)?.length, 3);
  for (const pkg of PACKAGES) {
    assert.ok(cardFor(markup, pkg.packageId).length > 0);
  }
});

test("renders the approved titles and subtitles", () => {
  const markup = render();
  const expected = [
    ["Self Prep", "Study on your own schedule"],
    ["Champion — One Batch", "Pick Morning, Afternoon or Evening"],
    [
      "Champion — All Timings",
      "Attend Morning, Afternoon or Evening, any day",
    ],
  ];
  for (const [title, subtitle] of expected) {
    assert.ok(markup.includes(`>${title}</h3>`), `missing title ${title}`);
    assert.ok(markup.includes(subtitle), `missing subtitle ${subtitle}`);
  }
});

test("renders selling prices, reference prices and supplied savings", () => {
  const markup = render();
  const expected = [
    "₹1,999",
    "₹3,999",
    "Save ₹2,000",
    "₹5,499",
    "₹10,999",
    "Save ₹5,500",
    "₹6,499",
    "₹12,999",
    "Save ₹6,500",
  ];
  for (const text of expected) {
    assert.ok(markup.includes(text), `missing price/saving text: ${text}`);
  }
  // Reference prices are semantically struck through, not just styled.
  assert.equal(markup.match(/<del class="line-through">/g)?.length, 3);
});

test("renders six-month validity for every package", () => {
  const markup = render();
  assert.equal(markup.match(/6 months validity/g)?.length, 3);
});

test("renders the approximate per-day amount supplied by the parent", () => {
  const markup = render();
  for (const text of [
    "Approximately ₹11/day",
    "Approximately ₹31/day",
    "Approximately ₹36/day",
  ]) {
    assert.ok(markup.includes(text), `missing per-day text: ${text}`);
  }
});

// ── Package-specific inclusions ───────────────────────────────────

test("Self Prep lists only its own inclusions and no French course", () => {
  const card = cardFor(render(), "self-prep");
  for (const feature of SELF_PREP_FEATURES) {
    assert.ok(card.includes(feature), `Self Prep missing: ${feature}`);
  }
  assert.ok(!/French/i.test(card), "Self Prep must not advertise French");
});

test("Champion — One Batch carries its package-specific inclusions", () => {
  const card = cardFor(render(), "champion-one-batch");
  for (const feature of ONE_BATCH_FEATURES) {
    assert.ok(card.includes(feature), `One Batch missing: ${feature}`);
  }
  assert.ok(card.includes("8-week teaching cycle"));
  assert.ok(card.includes("Saturday test-analysis sessions"));
});

test("Champion — All Timings carries its package-specific inclusions", () => {
  const card = cardFor(render(), "champion-all-timings");
  for (const feature of ALL_TIMINGS_FEATURES) {
    assert.ok(card.includes(feature), `All Timings missing: ${feature}`);
  }
  assert.ok(card.includes("Switch freely between all three batches"));
});

test("the French course appears in both Champion packages only", () => {
  const markup = render();
  assert.match(cardFor(markup, "champion-one-batch"), /Free 4-week live French course/);
  assert.match(cardFor(markup, "champion-all-timings"), /Free 4-week live French course/);
  assert.doesNotMatch(cardFor(markup, "self-prep"), /French/i);
});

// ── Badges and emphasis ───────────────────────────────────────────

test("renders the approved badges", () => {
  const markup = render();
  assert.match(cardFor(markup, "champion-one-batch"), />MOST CHOSEN</);
  assert.match(cardFor(markup, "champion-all-timings"), />CHAMPION · FLEXIBLE</);
  assert.doesNotMatch(cardFor(markup, "self-prep"), /MOST CHOSEN|CHAMPION · FLEXIBLE/);
});

test("only Champion — One Batch receives the strongest emphasis", () => {
  const markup = render();
  const oneBatch = cardFor(markup, "champion-one-batch");
  assert.match(oneBatch, /data-recommended="true"/);
  assert.match(oneBatch, /bg-blue-900/);
  assert.match(oneBatch, /ring-4/);

  for (const id of ["self-prep", "champion-all-timings"]) {
    const card = cardFor(markup, id);
    assert.match(card, /data-recommended="false"/);
    assert.doesNotMatch(card, /bg-blue-900/);
    assert.doesNotMatch(card, /ring-4/);
  }
});

// ── CTA configuration ─────────────────────────────────────────────

test("renders the supplied CTA label and approved destination three times", () => {
  const markup = render();
  assert.equal(markup.match(/Start Free Trial/g)?.length, 3);
  assert.equal(markup.match(/href="\/free-demo"/g)?.length, 3);
  assert.doesNotMatch(markup, /checkout|payment|razorpay|stripe/i);
});

test("renders an unavailable CTA as a focusable, non-action button with accessible helper text", () => {
  const packages: IELTSPricingPackage[] = [
    {
      ...PACKAGES[0],
      cta: {
        label: "Buy Now",
        disabled: true,
        helperText: "Online payment coming soon",
        ariaLabel: "Buy Self Prep — online payment coming soon",
      },
      secondaryCta: {
        label: "Book Free Demo",
        href: "/free-demo",
        ariaLabel: "Book a free demo for Self Prep",
      },
    },
  ];
  const markup = render(packages);
  assert.match(markup, /<button[^>]*type="button"[^>]*aria-disabled="true"/);
  assert.match(markup, /aria-describedby="cta-help-/);
  assert.match(markup, /Online payment coming soon/);
  assert.match(markup, /Book Free Demo/);
  assert.match(markup, /href="\/free-demo"/);
  assert.doesNotMatch(markup, /payu|razorpay|stripe|checkout/i);
});

test("supports an approved parent callback instead of an href", () => {
  const callbackPackages: IELTSPricingPackage[] = [
    {
      ...PACKAGES[0],
      cta: {
        label: "Start Free Trial",
        onSelect: () => {
          // Parent-owned action. The component must not perform checkout.
        },
      },
    },
  ];
  const markup = render(callbackPackages);
  assert.match(markup, /<button type="button"/);
  assert.match(markup, />Start Free Trial</);
  assert.doesNotMatch(markup, /href="\/free-demo"/);
});

test("renders the compact Book Now appearance for an approved external link", () => {
  const packages: IELTSPricingPackage[] = [
    {
      ...PACKAGES[0],
      cta: {
        label: "Book Now",
        href: "https://u.payu.in/PAYUMN/uIqbwdNTKrTp",
        appearance: "bookNow",
        ariaLabel: "Book Self Prep — open the secure PayU payment page",
      },
    },
  ];
  const markup = render(packages);
  assert.match(
    markup,
    /<div><a[^>]*href="https:\/\/u\.payu\.in\/PAYUMN\/uIqbwdNTKrTp"/,
  );
  assert.match(markup, />Book Now</);
  assert.match(markup, /width:150px/);
  assert.match(markup, /background-color:#1065b7/);
  assert.match(markup, /display:inline-block/);
  assert.match(markup, /border-radius:3\.229px/);
});

// ── Responsive and accessible structure ──────────────────────────

test("uses a stacked mobile grid with three columns on larger screens", () => {
  const markup = render();
  assert.match(markup, /<ul class="grid gap-5 md:grid-cols-3 md:items-stretch mt-8">/);
  assert.match(markup, /class="h-full"/);
  assert.match(markup, /inline-flex w-full/);
});

test("uses semantic list, article and heading markup with working labels", () => {
  const markup = render();
  assert.match(markup, /<section [^>]*aria-labelledby="/);
  assert.match(markup, /<ul /);
  assert.equal(markup.match(/<article /g)?.length, 3);
  assert.equal(markup.match(/<article [^>]*aria-labelledby="[^"]+"/g)?.length, 3);
  assert.equal(markup.match(/<h3 id="[^"]+"/g)?.length, 3);
  assert.equal(markup.match(/<h3 id="([^"]+)"/g)?.length, 3);

  const labelledBy = [...markup.matchAll(/aria-labelledby="([^"]+)"/g)].map(
    (match) => match[1],
  );
  for (const id of labelledBy) {
    assert.ok(markup.includes(`id="${id}"`), `missing target for aria-labelledby="${id}"`);
  }
});

test("falls back to aria-label when no heading is supplied", () => {
  const markup = renderToStaticMarkup(
    createElement(IELTSPricingCards, {
      packages: PACKAGES,
      intro: "Intro without a heading.",
    }),
  );
  assert.match(markup, /<section [^>]*aria-label="IELTS pricing packages"/);
  assert.doesNotMatch(markup, /aria-labelledby="[^"]*-heading"/);
  assert.match(markup, /Intro without a heading\./);
});

// ── Tax and claims safety ────────────────────────────────────────

test("does not add a tax label when the parent supplies none", () => {
  const markup = render();
  assert.doesNotMatch(markup, /GST/i);
  assert.doesNotMatch(markup, /inclusive/i);
  assert.doesNotMatch(markup, /tax/i);
  assert.doesNotMatch(markup, /\+ GST/);
});

test("can render an optional parent-supplied tax label later", () => {
  const packages: IELTSPricingPackage[] = [
    { ...PACKAGES[0], gstLabel: "GST label supplied by parent" },
  ];
  const markup = render(packages);
  assert.match(markup, /GST label supplied by parent/);
});

test("does not invent expiry, scarcity or extra-discount claims", () => {
  const markup = render();
  assert.doesNotMatch(markup, /expir|limited time|today only|hurry|last chance|only \d+ seats/i);
  assert.doesNotMatch(markup, /extra discount|additional discount|promo code|coupon/i);
});

// ── Component contract guards ────────────────────────────────────

test("component source contains no authoritative price or package literal", () => {
  const source = readFileSync(
    path.join(ROOT, "components", "courses", "IELTSPricingCards.tsx"),
    "utf8",
  );
  for (const literal of [
    "1,999",
    "3,999",
    "5,499",
    "10,999",
    "6,499",
    "12,999",
    "Self Prep",
    "Champion — One Batch",
    "Champion — All Timings",
    "Start Free Trial",
  ]) {
    assert.ok(!source.includes(literal), `component must not hardcode "${literal}"`);
  }
  assert.doesNotMatch(source, /inclusive of GST|\+ GST|tax rate/i);
});
