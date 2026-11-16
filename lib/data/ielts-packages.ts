// FILE: lib/data/ielts-packages.ts
//
// Centralized IELTS marketing-package read model.
//
// ─────────────────────────────────────────────────────────────────
// SCOPE RULES (do not weaken):
//   1. These are marketing packages, not the authoritative course
//      catalogue. lib/data/course-prices.ts stays the price master and
//      lib/data/course-fees.ts stays the checkout source.
//   2. This module stores no CTA destination, no GST label, no GST rate,
//      no checkout/payment field and no historical catalogue claim.
//      Pages attach their own approved CTA with `withIeltsPackageCta`.
//   3. G1-14 removed the unsupported reference-price / savings claims.
//      Only the approved selling price is published; the price master and
//      server checkout remain authoritative for the chargeable amount.
//   4. The module imports types only from the neutral
//      lib/data/ielts-package-types.ts contract; it never imports a React
//      component or a page.
// ─────────────────────────────────────────────────────────────────

import type {
  IELTSPackageData,
  IELTSPricingCta,
  IELTSPricingPackage,
} from "./ielts-package-types";

export type {
  IELTSPackageData,
  IELTSPricingCta,
  IELTSPricingPackage,
} from "./ielts-package-types";

/** Exactly the three approved marketing package ids. */
export const IELTS_PACKAGE_IDS = Object.freeze([
  "ielts-self-prep",
  "ielts-champion-one-batch",
  "ielts-champion-all-timings",
] as const);

export type IeltsPackageId = (typeof IELTS_PACKAGE_IDS)[number];

const SIX_MONTHS = "6 months";
const FRENCH_COURSE_FEATURE = "Free 4-week live French course";

/** Approved approximate daily display amounts, in whole rupees. */
const APPROVED_DAILY_AMOUNTS: Readonly<Record<IeltsPackageId, number>> =
  Object.freeze({
    "ielts-self-prep": 11,
    "ielts-champion-one-batch": 31,
    "ielts-champion-all-timings": 36,
  });

/** Every feature the business supplied for each approved package. */
const REQUIRED_FEATURES: Readonly<
  Record<IeltsPackageId, readonly string[]>
> = Object.freeze({
  "ielts-self-prep": Object.freeze([
    "English assessment test",
    "300+ grammar, vocabulary and spelling videos",
    "50+ exercises",
    "20 hours of foundation lectures",
    "60 practice tests",
    "15 full-length timed mock tests",
    "Sunday live doubt-solving session",
  ]),
  "ielts-champion-one-batch": Object.freeze([
    "Everything in Self Prep",
    "Live lectures with an 8-week teaching cycle",
    "Separate Beginner and Advanced batches",
    "40–60 hours of live teaching",
    "Saturday test-analysis sessions",
    FRENCH_COURSE_FEATURE,
  ]),
  "ielts-champion-all-timings": Object.freeze([
    "Everything in Champion — One Batch",
    "Switch freely between all three batches",
    "Suitable for changing work or college schedules",
    "Avoid missing classes because of timing clashes",
    // All Timings includes everything in One Batch, whose French course
    // is therefore included here as well. Restated for clear display.
    FRENCH_COURSE_FEATURE,
  ]),
});

/**
 * Runtime-immutable package data: frozen package objects and frozen
 * feature arrays, no CTA and no tax/checkout fields.
 */
export const IELTS_PACKAGES: readonly IELTSPackageData[] = Object.freeze([
  Object.freeze({
    packageId: "ielts-self-prep",
    title: "Self Prep",
    subtitle: "Study on your own schedule",
    sellingPrice: 1999,
    validity: SIX_MONTHS,
    perDayAmount: APPROVED_DAILY_AMOUNTS["ielts-self-prep"],
    features: REQUIRED_FEATURES["ielts-self-prep"],
  }),
  Object.freeze({
    packageId: "ielts-champion-one-batch",
    title: "Champion — One Batch",
    subtitle: "Pick Morning, Afternoon or Evening",
    sellingPrice: 5499,
    validity: SIX_MONTHS,
    perDayAmount: APPROVED_DAILY_AMOUNTS["ielts-champion-one-batch"],
    badge: "MOST CHOSEN",
    recommended: true,
    features: REQUIRED_FEATURES["ielts-champion-one-batch"],
  }),
  Object.freeze({
    packageId: "ielts-champion-all-timings",
    title: "Champion — All Timings",
    subtitle: "Attend Morning, Afternoon or Evening, any day",
    sellingPrice: 6499,
    validity: SIX_MONTHS,
    perDayAmount: APPROVED_DAILY_AMOUNTS["ielts-champion-all-timings"],
    badge: "CHAMPION · FLEXIBLE",
    features: REQUIRED_FEATURES["ielts-champion-all-timings"],
  }),
]);

/** Find one approved package by its stable id. */
export function getIeltsPackageById(
  packageId: string,
): IELTSPackageData | undefined {
  return IELTS_PACKAGES.find((pkg) => pkg.packageId === packageId);
}

/**
 * Pure mapping helper: attach a page-owned, approved CTA to package data
 * without mutating the centralized package module. A page that needs a
 * second action (e.g. Buy Now plus Book Free Demo) may pass it as
 * `secondaryCta`; existing one-CTA consumers are unchanged.
 */
export function withIeltsPackageCta(
  packageData: IELTSPackageData,
  cta: IELTSPricingCta,
  secondaryCta?: IELTSPricingCta,
): IELTSPricingPackage {
  return Object.freeze({
    ...packageData,
    features: Object.freeze([...packageData.features]),
    cta,
    ...(secondaryCta ? { secondaryCta } : {}),
  });
}

const APPROVED_ID_SET = new Set<string>(IELTS_PACKAGE_IDS);

const FORBIDDEN_FIELDS = [
  "cta",
  "gstLabel",
  "gstIncluded",
  "gstRate",
  "tax",
  "checkoutEligible",
  "checkoutKey",
  "checkoutUrl",
  "paymentUrl",
  "payu",
] as const;

const TAX_OR_CHECKOUT_TEXT =
  /\b(GST|tax(?:es)?|checkout|payment|payu)\b/i;

function packageText(pkg: IELTSPackageData): string {
  const features = Array.isArray(pkg.features) ? pkg.features : [];
  return [pkg.title, pkg.subtitle, pkg.badge, ...features]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
}

function includesFrenchCourse(pkg: IELTSPackageData): boolean {
  return Array.isArray(pkg.features)
    ? pkg.features.some((feature) => /french/i.test(feature))
    : false;
}

/**
 * Deterministic validation for the IELTS marketing-package read model.
 *
 * Returns human-readable violations. Callers assert it is empty.
 * This function never rewrites, rounds or derives a price.
 */
export function validateIeltsPackages(
  packages: readonly IELTSPackageData[] = IELTS_PACKAGES,
): string[] {
  const violations: string[] = [];

  if (packages.length !== IELTS_PACKAGE_IDS.length) {
    violations.push(
      `Expected exactly ${IELTS_PACKAGE_IDS.length} IELTS packages, got ${packages.length}`,
    );
  }

  const seenIds = new Map<string, number>();
  const byId = new Map<string, IELTSPackageData>();

  packages.forEach((pkg, index) => {
    const where = `package[${index}] (${pkg.packageId})`;

    const firstIndex = seenIds.get(pkg.packageId);
    if (firstIndex !== undefined) {
      violations.push(
        `${where}: duplicate package id (also package[${firstIndex}])`,
      );
    } else {
      seenIds.set(pkg.packageId, index);
    }
    byId.set(pkg.packageId, pkg);

    if (!APPROVED_ID_SET.has(pkg.packageId)) {
      violations.push(
        `${where}: package id is not one of ${IELTS_PACKAGE_IDS.join(", ")}`,
      );
    }

    if (!Number.isInteger(pkg.sellingPrice) || pkg.sellingPrice <= 0) {
      violations.push(
        `${where}: sellingPrice must be a positive whole-rupee amount, got ${String(pkg.sellingPrice)}`,
      );
    }

    if (pkg.validity !== SIX_MONTHS) {
      violations.push(
        `${where}: validity must be "${SIX_MONTHS}", got ${JSON.stringify(pkg.validity)}`,
      );
    }

    const approvedDaily =
      APPROVED_DAILY_AMOUNTS[pkg.packageId as IeltsPackageId];
    if (
      approvedDaily !== undefined &&
      pkg.perDayAmount !== approvedDaily
    ) {
      violations.push(
        `${where}: perDayAmount must be ${approvedDaily}, got ${String(pkg.perDayAmount)}`,
      );
    }

    if (!Array.isArray(pkg.features) || pkg.features.length === 0) {
      violations.push(`${where}: features must be a non-empty list`);
    }
    const requiredFeatures =
      REQUIRED_FEATURES[pkg.packageId as IeltsPackageId];
    if (requiredFeatures && Array.isArray(pkg.features)) {
      for (const feature of requiredFeatures) {
        if (!pkg.features.includes(feature)) {
          violations.push(`${where}: missing feature "${feature}"`);
        }
      }
    }

    if (TAX_OR_CHECKOUT_TEXT.test(packageText(pkg))) {
      violations.push(
        `${where}: package copy must not assert a GST/tax or checkout/payment assumption`,
      );
    }

    for (const field of FORBIDDEN_FIELDS) {
      if (field in pkg) {
        violations.push(
          `${where}: forbidden field "${field}" — package data carries no CTA, tax or checkout state`,
        );
      }
    }
  });

  const actualIds = packages.map((pkg) => pkg.packageId).sort();
  const expectedIds = [...IELTS_PACKAGE_IDS].sort();
  if (
    actualIds.length !== expectedIds.length ||
    actualIds.some((id, index) => id !== expectedIds[index])
  ) {
    violations.push(
      `Package ids must be exactly ${IELTS_PACKAGE_IDS.join(", ")}; got ${
        packages.map((pkg) => pkg.packageId).join(", ") || "(none)"
      }`,
    );
  }

  const recommended = packages.filter((pkg) => pkg.recommended === true);
  if (recommended.length !== 1) {
    violations.push(
      `Exactly one package must be recommended, got ${recommended.length}`,
    );
  } else if (recommended[0].packageId !== "ielts-champion-one-batch") {
    violations.push(
      `Only ielts-champion-one-batch may be recommended, got ${recommended[0].packageId}`,
    );
  }

  const selfPrep = byId.get("ielts-self-prep");
  if (selfPrep && includesFrenchCourse(selfPrep)) {
    violations.push(
      "ielts-self-prep must not advertise the French course",
    );
  }

  for (const championId of [
    "ielts-champion-one-batch",
    "ielts-champion-all-timings",
  ] as const) {
    const champion = byId.get(championId);
    if (champion && !includesFrenchCourse(champion)) {
      violations.push(`${championId} must include the French course`);
    }
  }

  return violations;
}
