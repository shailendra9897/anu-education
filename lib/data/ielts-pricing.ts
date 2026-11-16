// FILE: lib/data/ielts-pricing.ts
//
// IELTS public price view, derived from the authoritative price master at
// lib/data/course-prices.ts (courses `IELTS Academic` and `IELTS General`)
// through the W1 read-model (`toPriceView`).
//
// This module holds NO prices of its own. It only reads the master and
// formats it, so the IELTS pages, their SEO/schema and their price copy can
// never drift from the master the way hardcoded literals did.
//
// ─────────────────────────────────────────────────────────────────
// SCOPE RULES (do not weaken):
//   1. Catalogue prices only. The IELTS Academic Champion "upcoming batch"
//      promotional offer lives in lib/data/offers/ielts-academic-champion-flagship.ts
//      and is a marketing layer that is NOT in this module and must never
//      be added to the price master. Its offer prices and reference fee
//      must not appear here, and nothing here may pair a Champion pack
//      catalogue price with the offer price as a "was/now" claim. The
//      offer is never the catalogue price of any pack.
//   2. The public IELTS surfaces disclose GST as included in the
//      displayed price. The authoritative GST treatment for checkout
//      remains in lib/pricing/gst.ts and is applied by the server quote
//      engine.
//   3. This module does not calculate checkout totals. Checkout uses
//      lib/pricing/quote.ts and COURSE_FEES remains a legacy derivation.
// ─────────────────────────────────────────────────────────────────
//
// It is a pure, environment-agnostic module: safe to import from both
// server components and client components — it imports nothing from next/*.

import { COURSE_PRICES, getCoursePrices } from "@/lib/data/course-prices";
import { toPriceView, type PriceView } from "@/lib/data/price-view";

export const IELTS_GST_RATE_PERCENT = 18;

/** Visible, consistent GST disclosure for IELTS catalogue amounts. */
export const IELTS_GST_LABEL =
  "Prices include GST · 18% GST included";

/** IELTS packs (Academic then General), in price-master order. */
export const IELTS_PACKS = [
  ...getCoursePrices("IELTS Academic"),
  ...getCoursePrices("IELTS General"),
];

if (IELTS_PACKS.length === 0) {
  throw new Error(
    "Price master is missing IELTS packs. Add them to " +
      "lib/data/course-prices.ts rather than hardcoding a price at the call site.",
  );
}

/** The 13 catalogue products IELTS surfaces may display, in master order. */
export const IELTS_PRODUCT_IDS = [
  "ielts-academic-self-prep",
  "ielts-academic-champion-morning",
  "ielts-academic-champion-afternoon",
  "ielts-academic-champion-evening",
  "ielts-academic-champion-all-timings",
  "ielts-academic-reading-marathon",
  "ielts-academic-writing-marathon",
  "ielts-academic-speaking-marathon",
  "ielts-general-self-preparation",
  "ielts-general-champion",
  "ielts-general-reading-marathon",
  "ielts-general-writing-marathon",
  "ielts-general-speaking-marathon",
] as const;

/**
 * PriceView of every IELTS catalogue product (13), derived from the master
 * via the W1 read-model. Holds NO price literal of its own. The promotional
 * offer amounts must never appear in this list.
 */
export const IELTS_VIEWS: PriceView[] = IELTS_PRODUCT_IDS.map((id) => {
  const product = COURSE_PRICES.find((entry) => entry.id === id);
  if (!product) {
    throw new Error(
      `Price master is missing pack \`${id}\`. Add it to ` +
        "lib/data/course-prices.ts rather than hardcoding a price at the call site.",
    );
  }
  return toPriceView(product);
});

/** Make a bare INR price a display string, e.g. 1875 → "₹1,875". */
export function formatIeltsPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

/** Resolve a stable catalogue product id to its master price. */
export function getIeltsCataloguePrice(productId: string): number {
  const view = IELTS_VIEWS.find((entry) => entry.productId === productId);
  if (!view) {
    throw new Error(
      `\`${productId}\` is not an IELTS catalogue product. Use one of ` +
        `IELTS_PRODUCT_IDS (see lib/data/ielts-pricing.ts).`,
    );
  }
  return view.price;
}

/** Lowest IELTS pack price across Academic + General, e.g. 1875. */
export const IELTS_FROM_PRICE = Math.min(...IELTS_PACKS.map((pack) => pack.price));

/** Formatted "from" price for display, e.g. "₹1,875". */
export const IELTS_FROM_PRICE_DISPLAY = formatIeltsPrice(IELTS_FROM_PRICE);

/** Bare numeric string for JSON-LD/metadata, e.g. "1875" (no separators). */
export const IELTS_FROM_PRICE_PLAIN = String(IELTS_FROM_PRICE);

const IELTS_ACADEMIC_CHAMPION_TIMING_IDS = [
  "ielts-academic-champion-morning",
  "ielts-academic-champion-afternoon",
  "ielts-academic-champion-evening",
] as const;

/** Lowest Champion-by-timing pack amount (all three timings = ₹5,499). */
export const IELTS_ACADEMIC_CHAMPION_FROM_PRICE = Math.min(
  ...IELTS_ACADEMIC_CHAMPION_TIMING_IDS.map(getIeltsCataloguePrice),
);

/** "₹5,499" — the only approved way to render the Champion from-price. */
export const IELTS_ACADEMIC_CHAMPION_FROM_PRICE_DISPLAY = formatIeltsPrice(
  IELTS_ACADEMIC_CHAMPION_FROM_PRICE,
);

/** Bare numeric string for JSON-LD/metadata, e.g. "5499". */
export const IELTS_ACADEMIC_CHAMPION_FROM_PRICE_PLAIN = String(
  IELTS_ACADEMIC_CHAMPION_FROM_PRICE,
);

/** Master price of the IELTS Academic Self Preparation pack. */
export const IELTS_ACADEMIC_SELF_PREP_PRICE = getIeltsCataloguePrice("ielts-academic-self-prep");

/** "₹1,999" — the only approved way to render the Self Preparation amount. */
export const IELTS_ACADEMIC_SELF_PREP_PRICE_DISPLAY = formatIeltsPrice(
  IELTS_ACADEMIC_SELF_PREP_PRICE,
);

/** Bare numeric string for JSON-LD/metadata, e.g. "1999". */
export const IELTS_ACADEMIC_SELF_PREP_PRICE_PLAIN = String(IELTS_ACADEMIC_SELF_PREP_PRICE);