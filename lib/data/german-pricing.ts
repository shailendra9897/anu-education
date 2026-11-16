// FILE: lib/data/german-pricing.ts
//
// German public price view, derived from the authoritative price master at
// lib/data/course-prices.ts (course `German`) through the W1 read-model
// (`toPriceView`).
//
// This module holds NO prices of its own. It only reads the master and
// formats it, so the German pages, their SEO/schema and their price copy can
// never drift from the master the way hardcoded literals did.
//
// ─────────────────────────────────────────────────────────────────
// SCOPE RULES (do not weaken):
//   1. Catalogue prices only. There is no German promotional offer, so
//      nothing here may invent a discount, an original price or a
//      "was/now" claim.
//   2. Amounts are GST-EXCLUSIVE. Surfaces must say "+ GST" (or "prices
//      exclude GST") next to them; no GST rate is configured here.
//   3. This module does not feed COURSE_FEES / checkout. Checkout keeps
//      deriving German from the price master inside lib/data/course-fees.ts.
// ─────────────────────────────────────────────────────────────────
//
// It is a pure, environment-agnostic module: safe to import from both
// server components and client components — it imports nothing from next/*.

import { COURSE_PRICES, getCoursePrices } from "@/lib/data/course-prices";
import { toPriceView, type PriceView } from "@/lib/data/price-view";

/** German packs, in price-master order. */
export const GERMAN_PACKS = getCoursePrices("German");

if (GERMAN_PACKS.length === 0) {
  throw new Error(
    "Price master is missing German packs. Add them to " +
      "lib/data/course-prices.ts rather than hardcoding a price at the call site.",
  );
}

/** The three catalogue products the German surfaces may display. */
export const GERMAN_PRODUCT_IDS = [
  "german-basic-a1",
  "german-basic-a1-a2",
  "german-a2",
] as const;

/**
 * PriceView of every German catalogue product, derived from the master
 * via the W1 read-model. Holds NO price literal of its own.
 */
export const GERMAN_VIEWS: PriceView[] = GERMAN_PRODUCT_IDS.map((id) => {
  const product = COURSE_PRICES.find((entry) => entry.id === id);
  if (!product) {
    throw new Error(
      `Price master is missing pack \`${id}\`. Add it to ` +
        "lib/data/course-prices.ts rather than hardcoding a price at the call site.",
    );
  }
  return toPriceView(product);
});

/** Make a bare INR price a display string, e.g. 7500 → "₹7,500". */
export function formatGermanPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

/** Resolve a stable catalogue product id to its master price. */
export function getGermanCataloguePrice(productId: string): number {
  const view = GERMAN_VIEWS.find((entry) => entry.productId === productId);
  if (!view) {
    throw new Error(
      `\`${productId}\` is not a German catalogue product. Use one of ` +
        `GERMAN_PRODUCT_IDS (see lib/data/german-pricing.ts).`,
    );
  }
  return view.price;
}

/** Lowest German pack price, e.g. 7500. */
export const GERMAN_FROM_PRICE = Math.min(...GERMAN_PACKS.map((pack) => pack.price));

/** Formatted "from" price for display, e.g. "₹7,500". */
export const GERMAN_FROM_PRICE_DISPLAY = formatGermanPrice(GERMAN_FROM_PRICE);

/** Bare numeric string for JSON-LD/metadata, e.g. "7500" (no separators). */
export const GERMAN_FROM_PRICE_PLAIN = String(GERMAN_FROM_PRICE);

/** Master price of the German Basic & A1 pack. */
export const GERMAN_BASIC_A1_PRICE = getGermanCataloguePrice("german-basic-a1");

/** "₹7,500" — the only approved way to render the Basic & A1 amount. */
export const GERMAN_BASIC_A1_PRICE_DISPLAY = formatGermanPrice(GERMAN_BASIC_A1_PRICE);

/** Bare numeric string for JSON-LD/metadata, e.g. "7500". */
export const GERMAN_BASIC_A1_PRICE_PLAIN = String(GERMAN_BASIC_A1_PRICE);

/** Master price of the German Basic, A1 & A2 pack. */
export const GERMAN_BASIC_A1_A2_PRICE = getGermanCataloguePrice("german-basic-a1-a2");

/** "₹12,000" — the only approved way to render the Basic, A1 & A2 amount. */
export const GERMAN_BASIC_A1_A2_PRICE_DISPLAY = formatGermanPrice(GERMAN_BASIC_A1_A2_PRICE);

/** Bare numeric string for JSON-LD/metadata, e.g. "12000". */
export const GERMAN_BASIC_A1_A2_PRICE_PLAIN = String(GERMAN_BASIC_A1_A2_PRICE);

/** Master price of the German A2 pack. */
export const GERMAN_A2_PRICE = getGermanCataloguePrice("german-a2");

/** "₹9,750" — the only approved way to render the A2 amount. */
export const GERMAN_A2_PRICE_DISPLAY = formatGermanPrice(GERMAN_A2_PRICE);

/** Bare numeric string for JSON-LD/metadata, e.g. "9750". */
export const GERMAN_A2_PRICE_PLAIN = String(GERMAN_A2_PRICE);
