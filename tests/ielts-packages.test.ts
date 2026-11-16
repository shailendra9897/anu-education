// FILE: tests/ielts-packages.test.ts
//
// Guards the centralized IELTS marketing-package read model.
//
// Run: npx tsx --test tests/ielts-packages.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  IELTS_PACKAGES,
  IELTS_PACKAGE_IDS,
  getIeltsPackageById,
  validateIeltsPackages,
  withIeltsPackageCta,
  type IELTSPackageData,
} from "../lib/data/ielts-packages";
import { COURSE_PRICES } from "../lib/data/course-prices";
import { COURSE_FEES } from "../lib/data/course-fees";
import { CHECKOUT_ALLOW_LIST } from "../lib/data/pricing-registry";
import type { IELTSPricingPackage as CardPackage } from "../components/courses/IELTSPricingCards";

const ROOT = path.join(__dirname, "..");

const EXPECTED_IDS = [
  "ielts-self-prep",
  "ielts-champion-one-batch",
  "ielts-champion-all-timings",
] as const;

const EXPECTED_FEATURES: Record<(typeof EXPECTED_IDS)[number], readonly string[]> =
  {
    "ielts-self-prep": [
      "English assessment test",
      "300+ grammar, vocabulary and spelling videos",
      "50+ exercises",
      "20 hours of foundation lectures",
      "60 practice tests",
      "15 full-length timed mock tests",
      "Sunday live doubt-solving session",
    ],
    "ielts-champion-one-batch": [
      "Everything in Self Prep",
      "Live lectures with an 8-week teaching cycle",
      "Separate Beginner and Advanced batches",
      "40–60 hours of live teaching",
      "Saturday test-analysis sessions",
      "Free 4-week live French course",
    ],
    "ielts-champion-all-timings": [
      "Everything in Champion — One Batch",
      "Switch freely between all three batches",
      "Suitable for changing work or college schedules",
      "Avoid missing classes because of timing clashes",
      "Free 4-week live French course",
    ],
  };

const EXPECTED_PRICES: Record<
  (typeof EXPECTED_IDS)[number],
  { selling: number; daily: number }
> = {
  "ielts-self-prep": {
    selling: 1999,
    daily: 11,
  },
  "ielts-champion-one-batch": {
    selling: 5499,
    daily: 31,
  },
  "ielts-champion-all-timings": {
    selling: 6499,
    daily: 36,
  },
};

// ── Inventory and identity ───────────────────────────────────────

test("exports exactly three packages with stable ids", () => {
  assert.equal(IELTS_PACKAGES.length, 3);
  assert.deepEqual([...IELTS_PACKAGE_IDS], [...EXPECTED_IDS]);
  assert.deepEqual(
    IELTS_PACKAGES.map((pkg) => pkg.packageId),
    [...EXPECTED_IDS],
  );
  for (const id of EXPECTED_IDS) {
    assert.equal(getIeltsPackageById(id)?.packageId, id);
  }
  assert.equal(getIeltsPackageById("not-a-real-package"), undefined);
});

test("the package module is runtime-immutable", () => {
  assert.ok(Object.isFrozen(IELTS_PACKAGES));
  for (const pkg of IELTS_PACKAGES) {
    assert.ok(Object.isFrozen(pkg), `${pkg.packageId} must be frozen`);
    assert.ok(
      Object.isFrozen(pkg.features),
      `${pkg.packageId} features must be frozen`,
    );
  }
});

test("titles and subtitles are the approved copy", () => {
  const expected = {
    "ielts-self-prep": {
      title: "Self Prep",
      subtitle: "Study on your own schedule",
    },
    "ielts-champion-one-batch": {
      title: "Champion — One Batch",
      subtitle: "Pick Morning, Afternoon or Evening",
    },
    "ielts-champion-all-timings": {
      title: "Champion — All Timings",
      subtitle: "Attend Morning, Afternoon or Evening, any day",
    },
  } as const;

  for (const id of EXPECTED_IDS) {
    const pkg = getIeltsPackageById(id)!;
    assert.equal(pkg.title, expected[id].title);
    assert.equal(pkg.subtitle, expected[id].subtitle);
  }
});

// ── Commercial values ────────────────────────────────────────────

test("selling prices are exact and unsupported reference/savings claims are absent", () => {
  for (const id of EXPECTED_IDS) {
    const pkg = getIeltsPackageById(id)!;
    const expected = EXPECTED_PRICES[id];
    assert.equal(pkg.sellingPrice, expected.selling, `${id} selling price`);
    // G1-14 removed unsupported reference-price and savings claims.
    assert.equal(pkg.referencePrice, undefined, `${id} must not claim a reference price`);
    assert.equal(pkg.savingsAmount, undefined, `${id} must not claim a saving`);
  }
});

test("every package has six-month validity and the approved daily amount", () => {
  for (const id of EXPECTED_IDS) {
    const pkg = getIeltsPackageById(id)!;
    assert.equal(pkg.validity, "6 months");
    assert.equal(pkg.perDayAmount, EXPECTED_PRICES[id].daily);
  }
});

// ── Features and recommendation ──────────────────────────────────

test("each package contains its complete approved feature list", () => {
  for (const id of EXPECTED_IDS) {
    const pkg = getIeltsPackageById(id)!;
    assert.deepEqual([...pkg.features], [...EXPECTED_FEATURES[id]], id);
    for (const feature of EXPECTED_FEATURES[id]) {
      assert.ok(pkg.features.includes(feature), `${id} missing ${feature}`);
    }
  }
});

test("only Champion — One Batch is recommended and badges are exact", () => {
  const recommended = IELTS_PACKAGES.filter((pkg) => pkg.recommended === true);
  assert.deepEqual(
    recommended.map((pkg) => pkg.packageId),
    ["ielts-champion-one-batch"],
  );
  assert.equal(getIeltsPackageById("ielts-self-prep")?.badge, undefined);
  assert.equal(
    getIeltsPackageById("ielts-champion-one-batch")?.badge,
    "MOST CHOSEN",
  );
  assert.equal(
    getIeltsPackageById("ielts-champion-all-timings")?.badge,
    "CHAMPION · FLEXIBLE",
  );
});

test("French course appears in both Champion packages but never Self Prep", () => {
  for (const id of [
    "ielts-champion-one-batch",
    "ielts-champion-all-timings",
  ] as const) {
    const pkg = getIeltsPackageById(id)!;
    assert.ok(
      pkg.features.some((feature) => /french/i.test(feature)),
      `${id} must include French`,
    );
  }
  assert.ok(
    !getIeltsPackageById("ielts-self-prep")!.features.some((feature) =>
      /french/i.test(feature),
    ),
    "Self Prep must not advertise French",
  );
});

// ── CTA boundary ─────────────────────────────────────────────────

test("package data contains no CTA, tax label or checkout/payment field", () => {
  for (const pkg of IELTS_PACKAGES) {
    assert.ok(!("cta" in pkg), `${pkg.packageId} must not embed a CTA`);
    assert.ok(
      !("gstLabel" in pkg),
      `${pkg.packageId} must not embed a GST label`,
    );
    for (const field of [
      "checkoutEligible",
      "checkoutKey",
      "paymentUrl",
      "payu",
    ]) {
      assert.ok(!(field in pkg), `${pkg.packageId} must not have ${field}`);
    }
  }
});

test("withIeltsPackageCta attaches a parent-owned CTA without mutation", () => {
  const base = getIeltsPackageById("ielts-champion-one-batch")!;
  const before = JSON.stringify(base);

  const withHref = withIeltsPackageCta(base, {
    label: "Start Free Trial",
    href: "/free-demo",
  });
  assert.equal(withHref.packageId, base.packageId);
  assert.equal(withHref.cta.label, "Start Free Trial");
  assert.deepEqual(withHref.cta, {
    label: "Start Free Trial",
    href: "/free-demo",
  });
  assert.equal(JSON.stringify(base), before, "base package must not mutate");
  assert.ok(!("cta" in base));

  const withCallback = withIeltsPackageCta(base, {
    label: "Start Free Trial",
    onSelect: () => {
      // Parent-owned action.
    },
  });
  assert.equal(typeof (withCallback.cta as { onSelect: unknown }).onSelect, "function");
});

test("mapped packages satisfy the existing card component contract", () => {
  const cards: readonly CardPackage[] = IELTS_PACKAGES.map((pkg) =>
    withIeltsPackageCta(
      pkg,
      {
        label: "Buy Now",
        disabled: true,
        helperText: "Online payment coming soon",
      },
      {
        label: "Book Free Demo",
        href: "/free-demo",
      },
    ),
  );
  assert.equal(cards.length, 3);
  assert.ok(
    cards.every(
      (card) =>
        card.cta &&
        card.secondaryCta &&
        card.features.length > 0,
    ),
  );
});

test("the package module does not import a React component or page", () => {
  const source = readFileSync(
    path.join(ROOT, "lib", "data", "ielts-packages.ts"),
    "utf8",
  );
  assert.doesNotMatch(source, /components\/courses|components\/offers|app\/test-prep/);
});

// ── GST and claims safety ────────────────────────────────────────

test("package data makes no GST, tax or checkout assumption", () => {
  const serialized = JSON.stringify(IELTS_PACKAGES);
  assert.doesNotMatch(serialized, /GST|gst|tax|taxes|checkout|payment|payu/i);

  for (const pkg of IELTS_PACKAGES) {
    const text = [pkg.title, pkg.subtitle, pkg.badge, ...pkg.features].join(" ");
    assert.doesNotMatch(text, /GST|\btax\b|checkout|payment/i);
  }
  assert.deepEqual(validateIeltsPackages(), []);
});

test("reference prices are marketing references, not historical claims", () => {
  for (const pkg of IELTS_PACKAGES) {
    const text = [pkg.title, pkg.subtitle, pkg.badge, ...pkg.features].join(" ");
    assert.doesNotMatch(
      text,
      /historical|catalogue price|was price|original price|expires|limited time/i,
    );
  }
});

// ── Validator behaviour ──────────────────────────────────────────

test("validator catches duplicate ids and missing approved ids", () => {
  const duplicated: IELTSPackageData[] = [
    IELTS_PACKAGES[0],
    { ...IELTS_PACKAGES[1], packageId: "ielts-self-prep" },
    IELTS_PACKAGES[2],
  ];
  const violations = validateIeltsPackages(duplicated);
  assert.ok(
    violations.some((message) => message.includes("duplicate package id")),
    violations.join("\n"),
  );
  assert.ok(
    violations.some((message) => message.includes("Package ids must be exactly")),
    violations.join("\n"),
  );
});

test("validator catches an invalid selling price and daily amount", () => {
  const invalid: IELTSPackageData[] = [
    { ...IELTS_PACKAGES[0], sellingPrice: 0 },
    { ...IELTS_PACKAGES[1], perDayAmount: -1 },
    IELTS_PACKAGES[2],
  ];
  const violations = validateIeltsPackages(invalid);
  assert.ok(
    violations.some((message) =>
      message.includes("sellingPrice must be a positive whole-rupee amount"),
    ),
    violations.join("\n"),
  );
  assert.ok(
    violations.some((message) =>
      message.includes("perDayAmount must be 31"),
    ),
    violations.join("\n"),
  );
});

test("validator catches wrong validity, daily amount, recommendation and French rules", () => {
  const invalid: IELTSPackageData[] = [
    {
      ...IELTS_PACKAGES[0],
      validity: "12 months",
      perDayAmount: 99,
      features: [
        ...IELTS_PACKAGES[0].features,
        "Free 4-week live French course",
      ],
    },
    { ...IELTS_PACKAGES[1], recommended: false },
    {
      ...IELTS_PACKAGES[2],
      recommended: true,
      features: IELTS_PACKAGES[2].features.filter(
        (feature) => !/french/i.test(feature),
      ),
    },
  ];
  const violations = validateIeltsPackages(invalid);
  assert.ok(violations.some((message) => message.includes('validity must be "6 months"')));
  assert.ok(violations.some((message) => message.includes("perDayAmount must be 11")));
  assert.ok(
    violations.some((message) => message.includes("ielts-self-prep must not advertise the French course")),
  );
  assert.ok(
    violations.some((message) =>
      message.includes("Only ielts-champion-one-batch may be recommended"),
    ),
  );
  assert.ok(
    violations.some((message) =>
      message.includes("ielts-champion-all-timings must include the French course"),
    ),
  );
});

test("validator rejects embedded GST/checkout fields", () => {
  const withForbiddenFields = {
    ...IELTS_PACKAGES[0],
    gstLabel: "GST included",
    checkoutEligible: true,
  } as IELTSPackageData;
  const violations = validateIeltsPackages([
    withForbiddenFields,
    IELTS_PACKAGES[1],
    IELTS_PACKAGES[2],
  ]);
  assert.ok(
    violations.some((message) => message.includes('forbidden field "gstLabel"')),
    violations.join("\n"),
  );
  assert.ok(
    violations.some((message) =>
      message.includes('forbidden field "checkoutEligible"'),
    ),
    violations.join("\n"),
  );
});

// ── Protected boundaries ────────────────────────────────────────

test("package module does not alter catalogue or checkout values", () => {
  assert.equal(COURSE_FEES.IELTS, 1999);
  assert.deepEqual(CHECKOUT_ALLOW_LIST.IELTS, ["ielts-academic-self-prep"]);

  const selfPrepCatalogue = COURSE_PRICES.find(
    (product) => product.id === "ielts-academic-self-prep",
  );
  const championCatalogue = COURSE_PRICES.find(
    (product) => product.id === "ielts-academic-champion-morning",
  );
  assert.equal(selfPrepCatalogue?.price, 1999);
  assert.equal(championCatalogue?.price, 5499);

  const catalogueIds = new Set(COURSE_PRICES.map((product) => product.id));
  for (const pkg of IELTS_PACKAGES) {
    assert.ok(
      !catalogueIds.has(pkg.packageId),
      `${pkg.packageId} must not become a catalogue product id`,
    );
  }
});
