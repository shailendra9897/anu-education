// FILE: tests/ielts-release-readiness.test.ts
//
// Final pre-deployment guards for the five IELTS commercial landing pages.
//
// Covers the confirmed 5-day demo policy, the P0 factual corrections, the
// safe Header schema consolidation, city-to-city internal linking, and the
// claim/payment boundaries that must survive the release.
//
// Run: npx tsx --test tests/ielts-release-readiness.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

type Page = {
  key: string;
  route: string;
  pageFile: string;
  clientFile: string;
  canonical: string;
  faqFile?: string;
};

const PAGES: readonly Page[] = [
  {
    key: "online",
    route: "/test-prep/ielts-online",
    pageFile: "app/test-prep/ielts-online/page.tsx",
    clientFile: "app/test-prep/ielts-online/IELTSOnlineClient.tsx",
    canonical: "https://www.anuedu.in/test-prep/ielts-online",
    faqFile: "lib/data/faq/ielts-online.ts",
  },
  {
    key: "india",
    route: "/test-prep/ielts-coaching-india",
    pageFile: "app/test-prep/ielts-coaching-india/page.tsx",
    clientFile: "app/test-prep/ielts-coaching-india/IELTSCoachingIndiaClient.tsx",
    canonical: "https://www.anuedu.in/test-prep/ielts-coaching-india",
    faqFile: "lib/data/faq/ielts-india.ts",
  },
  {
    key: "modasa",
    route: "/test-prep/ielts-coaching-modasa",
    pageFile: "app/test-prep/ielts-coaching-modasa/page.tsx",
    clientFile: "app/test-prep/ielts-coaching-modasa/IELTSModasaClient.tsx",
    canonical: "https://www.anuedu.in/test-prep/ielts-coaching-modasa",
    faqFile: "lib/data/faq/ielts-modasa.ts",
  },
  {
    key: "gandhinagar",
    route: "/test-prep/ielts-coaching-gandhinagar",
    pageFile: "app/test-prep/ielts-coaching-gandhinagar/page.tsx",
    clientFile: "app/test-prep/ielts-coaching-gandhinagar/IELTSGandhinagarClient.tsx",
    canonical: "https://www.anuedu.in/test-prep/ielts-coaching-gandhinagar",
    faqFile: "lib/data/faq/ielts-gandhinagar.ts",
  },
  {
    key: "ahmedabad",
    route: "/test-prep/ielts/ielts-coaching-ahmedabad",
    pageFile: "app/test-prep/ielts/ielts-coaching-ahmedabad/page.tsx",
    clientFile: "app/test-prep/ielts/ielts-coaching-ahmedabad/IELTSAhmedabadClient.tsx",
    canonical: "https://www.anuedu.in/test-prep/ielts/ielts-coaching-ahmedabad",
    faqFile: "lib/data/faq/ielts-ahmedabad.ts",
  },
];

function read(relativeFile: string): string {
  return readFileSync(path.join(ROOT, relativeFile), "utf8");
}

// ── 1. Routes, files and canonicals ─────────────────────────────

test("all five IELTS routes and files exist", () => {
  for (const page of PAGES) {
    assert.ok(existsSync(path.join(ROOT, page.pageFile)), `${page.key}: page file`);
    assert.ok(
      existsSync(path.join(ROOT, page.clientFile)),
      `${page.key}: client file`,
    );
  }
});

test("all five canonical URLs are unchanged", () => {
  for (const page of PAGES) {
    const source = read(page.pageFile);
    assert.ok(
      source.includes(page.canonical),
      `${page.key}: canonical ${page.canonical}`,
    );
    assert.match(source, /alternates:\s*\{/);
    assert.match(source, /canonical:\s*CANONICAL/);
  }
});

// ── 2. Five-day demo policy ────────────────────────────────────

test("every page advertises the confirmed 5-day demo", () => {
  for (const page of PAGES) {
    const client = read(page.clientFile);
    const meta = read(page.pageFile);
    assert.match(client, /5[- ]?Day/i, `${page.key}: client demo duration`);
    assert.match(meta, /5[- ]?day/i, `${page.key}: metadata demo duration`);
  }
});

test("no 3-day or 4-day IELTS demo claim remains", () => {
  const files = [
    ...PAGES.flatMap((page) => [page.clientFile, page.pageFile]),
    ...PAGES.map((page) => page.faqFile).filter((file): file is string => Boolean(file)),
  ];
  const outdated = /\b(?:3|4)[- ]?days?\b/i;
  for (const file of files) {
    const source = read(file);
    // "3–5 days" (result time) uses an en dash and is not a demo claim.
    const withoutResultTime = source.replace(/3\s*[–-]\s*5\s*days/gi, "");
    assert.doesNotMatch(
      withoutResultTime,
      outdated,
      `${file}: outdated demo duration`,
    );
  }
});

// ── 3. P0 factual corrections ─────────────────────────────────

test("Modasa is described with Aravalli district, not as Sabarkantha-only", () => {
  const client = read("app/test-prep/ielts-coaching-modasa/IELTSModasaClient.tsx");
  const meta = read("app/test-prep/ielts-coaching-modasa/page.tsx");
  const schema = read("lib/seo/ielts-page-config.ts");

  assert.match(client, /Aravalli/, "client must name Aravalli district");
  assert.match(meta, /Aravalli/, "metadata must name Aravalli district");
  assert.match(schema, /Aravalli/, "schema description must name Aravalli district");
  assert.doesNotMatch(
    client,
    /Serving All of Sabarkantha District/,
    "old Sabarkantha-only heading must be gone",
  );
});

test("Gandhinagar does not place IITRAM or Nirma University in the city", () => {
  const client = read("app/test-prep/ielts-coaching-gandhinagar/IELTSGandhinagarClient.tsx");
  assert.doesNotMatch(client, /IITRAM/);
  assert.doesNotMatch(client, /Nirma University/);
  assert.match(client, /DA-IICT/);
});

test("no unverified test-centre distances or drive times remain", () => {
  for (const page of PAGES) {
    const client = read(page.clientFile);
    assert.doesNotMatch(client, /~\s*\d+\s*km/i, `${page.key}: distance estimate`);
    assert.doesNotMatch(client, /\b\d+\s*hr\s*drive\b/i, `${page.key}: drive time`);
    assert.doesNotMatch(client, /\b\d+\s*hours?\s*drive\b/i, `${page.key}: drive time`);
  }
});

test("Ahmedabad has no duplicated demo H2", () => {
  const client = read("app/test-prep/ielts/ielts-coaching-ahmedabad/IELTSAhmedabadClient.tsx");
  const matches = client.match(/Start your FREE 5-Day IELTS Demo today/g) ?? [];
  assert.equal(matches.length, 1);
});

// ── 4. Header schema consolidation ────────────────────────────

test("Header reuses the stable organization @id and emits no Course nodes", () => {
  const header = read("components/Header.tsx");
  assert.match(
    header,
    /"@id":\s*"https:\/\/www\.anuedu\.in\/#organization"/,
    "Header org must carry the stable @id",
  );
  assert.doesNotMatch(
    header,
    /"@type":\s*"Course"/,
    "Header must not emit duplicate Course entities",
  );
  assert.match(
    header,
    /"@type":\s*"Service"/,
    "Header catalogue entries must be Services",
  );
});

test("page-level Course schema still exists on all five pages", () => {
  for (const page of PAGES) {
    const pageSource = read(page.pageFile);
    assert.match(pageSource, /buildIeltsSchemaForPage\(/, `${page.key}: builder`);
    assert.match(pageSource, /<JsonLd data=\{graph\} \/>/, `${page.key}: JsonLd`);
  }
});

// ── 5. City-to-city internal linking ──────────────────────────

test("every page links to the other four IELTS pages", () => {
  for (const page of PAGES) {
    const client = read(page.clientFile);
    for (const other of PAGES) {
      if (other.key === page.key) continue;
      assert.ok(
        client.includes(`href="${other.route}"`),
        `${page.key}: missing link to ${other.route}`,
      );
    }
  }
});

// ── 6. Unsupported claims stay out ────────────────────────────

test("no unsupported marketing claim returns", () => {
  const banned = [
    /guarantee/i,
    /\b98\s*%/,
    /\b1,?100\s*\+/,
    /10,000\s*\+/,
    /Skill India/i,
    /top[- ]rated/i,
    /#1\b/,
    /Best Price/i,
    /100%\s*band/i,
    /limited seats/i,
  ];
  for (const page of PAGES) {
    const source = read(page.clientFile);
    const body = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .filter((line) => !/^\s*\/\//.test(line))
      .join("\n");
    for (const pattern of banned) {
      assert.doesNotMatch(body, pattern, `${page.key}: banned ${pattern}`);
    }
  }
});

// ── 7. Payment and pricing boundaries ─────────────────────────

test("PayU destinations and Buy Now labels are preserved", () => {
  const allThree = [
    "https://u.payu.in/PAYUMN/uIqbwdNTKrTp",
    "https://u.payu.in/PAYUMN/BIInlBUFpA9I",
    "https://u.payu.in/PAYUMN/wIuPM83kT5li",
  ];
  for (const page of PAGES) {
    const source = read(page.clientFile);
    if (page.key === "india") {
      assert.ok(source.includes("https://u.payu.in/PAYUMN/BIInlBUFpA9I"));
      assert.ok(source.includes("https://u.payu.in/PAYUMN/wIuPM83kT5li"));
      assert.ok(!source.includes("https://u.payu.in/PAYUMN/uIqbwdNTKrTp"));
    } else {
      for (const url of allThree) {
        assert.ok(source.includes(url), `${page.key}: ${url}`);
      }
    }
    assert.match(source, /Buy Now|label:\s*"Buy Now"/);
    assert.doesNotMatch(source, /#checkout/);
  }
});

test("GST messaging is unchanged on every page", () => {
  const activation =
    "Course activation and portal access are completed manually after payment verification.";
  for (const page of PAGES) {
    const source = read(page.clientFile);
    assert.ok(source.includes("IELTS_GST_LABEL"), `${page.key}: GST label`);
    assert.ok(source.includes(activation), `${page.key}: activation notice`);
    assert.doesNotMatch(source, /\+\s*GST/);
  }
});
