// FILE: tests/ielts-schema.test.ts
//
// Guards the server-rendered structured data on the five IELTS landing
// pages.
//
// What this suite locks down:
//   1. Every page graph is valid JSON after the hardened serialisation.
//   2. Prices come from the authoritative IELTS price view (INR, whole
//      rupees) — never a literal in the schema layer.
//   3. One Course entity per page, with multiple Offer values.
//   4. No AggregateRating, Review, geo, openingHours, availability,
//      validFrom, priceValidUntil or startDate is emitted.
//   5. Canonical URLs and Open Graph URLs match the route.
//   6. PayU destinations and `Buy Now` labels are unchanged.
//   7. No `#checkout` anchor and no guarantee / success-ratio claim.
//
// Run: npx tsx --test tests/ielts-schema.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { serializeJsonLd } from "../components/JsonLd";
import {
  IELTS_SCHEMA_PAGES,
  buildIeltsSchemaForPage,
  ieltsCanonicalUrl,
  ieltsOfferFor,
  type IeltsSchemaPageKey,
} from "../lib/seo/ielts-page-config";
import {
  IELTS_ORGANIZATION,
  IELTS_SITE_URL,
} from "../lib/seo/ielts-schema";
import { getIeltsCataloguePrice } from "../lib/data/ielts-pricing";

const ROOT = path.resolve(import.meta.dirname, "..");

const PAGE_KEYS: readonly IeltsSchemaPageKey[] = [
  "online",
  "india",
  "modasa",
  "gandhinagar",
  "ahmedabad",
];

const ROUTE_FILES: Record<IeltsSchemaPageKey, string> = {
  online: "app/test-prep/ielts-online",
  india: "app/test-prep/ielts-coaching-india",
  modasa: "app/test-prep/ielts-coaching-modasa",
  gandhinagar: "app/test-prep/ielts-coaching-gandhinagar",
  ahmedabad: "app/test-prep/ielts/ielts-coaching-ahmedabad",
};

const CLIENT_FILES: Record<IeltsSchemaPageKey, string> = {
  online: "app/test-prep/ielts-online/IELTSOnlineClient.tsx",
  india: "app/test-prep/ielts-coaching-india/IELTSCoachingIndiaClient.tsx",
  modasa: "app/test-prep/ielts-coaching-modasa/IELTSModasaClient.tsx",
  gandhinagar:
    "app/test-prep/ielts-coaching-gandhinagar/IELTSGandhinagarClient.tsx",
  ahmedabad:
    "app/test-prep/ielts/ielts-coaching-ahmedabad/IELTSAhmedabadClient.tsx",
};

function read(relativeFile: string): string {
  return readFileSync(path.join(ROOT, relativeFile), "utf8");
}

function graphFor(key: IeltsSchemaPageKey): Record<string, unknown> {
  const page = IELTS_SCHEMA_PAGES[key];
  return buildIeltsSchemaForPage(key, `${page.courseName} | ANU Education`, page.courseDescription);
}

function graphNodes(graph: Record<string, unknown>): Record<string, unknown>[] {
  const nodes = graph["@graph"];
  assert.ok(Array.isArray(nodes), "graph must expose an @graph array");
  return nodes as Record<string, unknown>[];
}

function nodeOfType(
  graph: Record<string, unknown>,
  type: string,
): Record<string, unknown> {
  const node = graphNodes(graph).find((entry) => entry["@type"] === type);
  assert.ok(node, `graph is missing a ${type} node`);
  return node;
}

// ── 1. Serialisation and JSON validity ───────────────────────────

test("every page graph survives hardened serialisation and parses as JSON", () => {
  for (const key of PAGE_KEYS) {
    const serialized = serializeJsonLd(graphFor(key));
    assert.doesNotMatch(serialized, /<\/script/i);
    assert.doesNotMatch(serialized, /[<>&]/);
    const parsed = JSON.parse(serialized) as Record<string, unknown>;
    assert.equal(parsed["@context"], "https://schema.org");
    assert.ok(Array.isArray(parsed["@graph"]));
  }
});

test("the JsonLd component escapes HTML-significant characters", () => {
  const serialized = serializeJsonLd({
    "@type": "Thing",
    name: "</script><img src=x onerror=alert(1)> & more",
  });
  assert.doesNotMatch(serialized, /<\/script/i);
  assert.match(serialized, /\\u003c/);
  assert.match(serialized, /\\u0026/);
});

// ── 2. Entity shape ──────────────────────────────────────────────

test("each page emits the required entity types", () => {
  for (const key of PAGE_KEYS) {
    const graph = graphFor(key);
    for (const type of [
      "EducationalOrganization",
      "WebSite",
      "WebPage",
      "BreadcrumbList",
      "Course",
      "FAQPage",
    ]) {
      nodeOfType(graph, type);
    }
    assert.equal(nodeOfType(graph, "EducationalOrganization"), IELTS_ORGANIZATION);
  }
});

test("each page has exactly one Course with multiple Offers", () => {
  for (const key of PAGE_KEYS) {
    const nodes = graphNodes(graphFor(key));
    const courses = nodes.filter((node) => node["@type"] === "Course");
    assert.equal(courses.length, 1, `${key}: exactly one Course expected`);

    const offers = courses[0].offers;
    assert.ok(Array.isArray(offers), `${key}: Course.offers must be an array`);
    assert.ok(
      (offers as unknown[]).length >= 2,
      `${key}: multiple packages must be modelled as multiple Offers`,
    );
    for (const offer of offers as Record<string, unknown>[]) {
      assert.equal(offer["@type"], "Offer");
      assert.equal(offer.priceCurrency, "INR");
    }
  }
});

test("the Course is described as online and no physical venue is claimed", () => {
  for (const key of PAGE_KEYS) {
    const course = nodeOfType(graphFor(key), "Course");
    const instance = course.hasCourseInstance as Record<string, unknown>;
    assert.equal(instance["@type"], "CourseInstance");
    assert.equal(instance.courseMode, "Online");
    assert.equal((instance.location as Record<string, unknown>)["@type"], "VirtualLocation");
  }
});

test("breadcrumbs point at absolute URLs on the site origin", () => {
  for (const key of PAGE_KEYS) {
    const crumbs = nodeOfType(graphFor(key), "BreadcrumbList")
      .itemListElement as Record<string, unknown>[];
    assert.ok(crumbs.length >= 3, `${key}: breadcrumb is too short`);
    crumbs.forEach((crumb, index) => {
      assert.equal(crumb.position, index + 1);
      assert.ok(String(crumb.item).startsWith(`${IELTS_SITE_URL}/`));
    });
    assert.equal(crumbs[crumbs.length - 1].item, ieltsCanonicalUrl(key));
  }
});

// ── 3. Prices come from the registry ────────────────────────────

test("Offer prices equal the authoritative catalogue price", () => {
  for (const key of PAGE_KEYS) {
    const page = IELTS_SCHEMA_PAGES[key];
    const course = nodeOfType(graphFor(key), "Course");
    const offers = course.offers as Record<string, unknown>[];

    const expected = page.offerPackageIds.map((packageId) =>
      ieltsOfferFor(packageId),
    );
    assert.equal(offers.length, expected.length, `${key}: offer count`);

    offers.forEach((offer, index) => {
      assert.equal(offer.price, expected[index].price, `${key}: offer price`);
      assert.equal(offer.priceCurrency, "INR");
      assert.equal(offer.name, expected[index].name);
    });
  }
});

test("catalogue prices are positive whole rupees from the registry", () => {
  for (const packageId of [
    "ielts-self-prep",
    "ielts-champion-one-batch",
    "ielts-champion-all-timings",
  ] as const) {
    const offer = ieltsOfferFor(packageId);
    assert.equal(offer.currency, "INR");
    assert.ok(Number.isInteger(offer.price) && offer.price > 0);
    assert.ok(
      offer.price === getIeltsCataloguePrice("ielts-academic-self-prep") ||
        offer.price === getIeltsCataloguePrice("ielts-academic-champion-morning") ||
        offer.price ===
          getIeltsCataloguePrice("ielts-academic-champion-all-timings"),
      `${packageId}: price must come from the catalogue`,
    );
  }
});

test("prices are read from the registry, not hardcoded in the schema layer", () => {
  for (const file of [
    "lib/seo/ielts-schema.ts",
    "lib/seo/ielts-page-config.ts",
  ]) {
    const source = read(file);
    assert.doesNotMatch(
      source,
      /\b(1999|5499|6499|12999|9998)\b/,
      `${file} must not contain a price literal`,
    );
  }
});

// ── 4. Forbidden claims and fields ──────────────────────────────

test("no rating, review, availability, date or geo fields are emitted", () => {
  const forbidden = [
    "AggregateRating",
    "Review",
    "ratingValue",
    "reviewCount",
    "availability",
    "validFrom",
    "priceValidUntil",
    "startDate",
    "endDate",
    "GeoCoordinates",
    "openingHours",
    "LocalBusiness",
    "aggregateRating",
  ];
  for (const key of PAGE_KEYS) {
    const serialized = serializeJsonLd(graphFor(key));
    for (const token of forbidden) {
      assert.ok(
        !serialized.includes(`"${token}"`),
        `${key}: graph must not contain ${token}`,
      );
    }
  }
});

test("no guarantee, success-ratio or student-count claim in page source", () => {
  const banned = [
    /guarantee/i,
    /\b98\s*%/,
    /\b1,?100\s*\+/,
    /10,000\s*\+/,
    /Skill India/i,
    /top[- ]rated/i,
    /#1\b/,
  ];
  for (const key of PAGE_KEYS) {
    const source = read(CLIENT_FILES[key]);
    // Ignore the historical audit comment blocks at the top of some files.
    const body = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .filter((line) => !/^\s*\/\//.test(line))
      .join("\n");
    for (const pattern of banned) {
      assert.doesNotMatch(body, pattern, `${key}: banned claim ${pattern}`);
    }
  }
});

// ── 5. Canonical, metadata and server rendering ────────────────

test("canonical and Open Graph URLs match the route", () => {
  for (const key of PAGE_KEYS) {
    const pageSource = read(`${ROUTE_FILES[key]}/page.tsx`);
    const canonical = ieltsCanonicalUrl(key);
    assert.ok(
      pageSource.includes(canonical),
      `${key}: page must declare canonical ${canonical}`,
    );
    assert.match(pageSource, /url: CANONICAL/);
    assert.match(pageSource, /alternates: \{/);
    assert.match(pageSource, /canonical: CANONICAL/);
  }
});

test("structured data is server-rendered, not injected by the client", () => {
  for (const key of PAGE_KEYS) {
    const pageSource = read(`${ROUTE_FILES[key]}/page.tsx`);
    assert.match(pageSource, /import JsonLd from "@\/components\/JsonLd"/);
    assert.match(pageSource, /buildIeltsSchemaForPage\(/);
    assert.match(pageSource, /<JsonLd data=\{graph\} \/>/);

    const clientSource = read(CLIENT_FILES[key]);
    assert.doesNotMatch(clientSource, /next\/script/);
    assert.doesNotMatch(clientSource, /application\/ld\+json/);
    assert.doesNotMatch(clientSource, /"@type": "Course"/);
  }
});

// ── 6. Payment destinations and CTA labels ─────────────────────

test("PayU destinations are preserved on every page", () => {
  const allThree = [
    "https://u.payu.in/PAYUMN/uIqbwdNTKrTp",
    "https://u.payu.in/PAYUMN/BIInlBUFpA9I",
    "https://u.payu.in/PAYUMN/wIuPM83kT5li",
  ];

  for (const key of PAGE_KEYS) {
    const source = read(CLIENT_FILES[key]);
    if (key === "india") {
      // The India page keeps its existing two destinations: Champion — One
      // Batch for the Champion card and Champion — All Timings for Self
      // Preparation. This asymmetry is an unresolved business item.
      assert.ok(source.includes("https://u.payu.in/PAYUMN/BIInlBUFpA9I"));
      assert.ok(source.includes("https://u.payu.in/PAYUMN/wIuPM83kT5li"));
      assert.ok(!source.includes("https://u.payu.in/PAYUMN/uIqbwdNTKrTp"));
    } else {
      for (const url of allThree) {
        assert.ok(source.includes(url), `${key}: missing PayU link ${url}`);
      }
    }
    assert.match(source, /label: "Buy Now"|>\s*Buy Now\s*</);
    assert.doesNotMatch(source, /#checkout/);
  }
});

test("the free demo destination stays /free-demo", () => {
  for (const key of PAGE_KEYS) {
    const source = read(CLIENT_FILES[key]);
    assert.ok(source.includes('"/free-demo"'), `${key}: missing /free-demo`);
  }
});

test("GST messaging is the approved inclusive wording", () => {
  const label = "Prices include GST · 18% GST included.";
  const activation =
    "Course activation and portal access are completed manually after payment verification.";
  const normalize = (value: string) => value.replace(/\s+/g, " ");

  for (const key of PAGE_KEYS) {
    const source = normalize(read(CLIENT_FILES[key]));
    assert.ok(
      source.includes(label) || source.includes("IELTS_GST_LABEL"),
      `${key}: missing GST label`,
    );
    assert.ok(source.includes(activation), `${key}: missing activation notice`);
    assert.doesNotMatch(source, /\+\s*GST/);
  }
});
