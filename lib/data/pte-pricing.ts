// FILE: lib/data/pte-pricing.ts
//
// PTE public price view, derived from the authoritative price master at
// lib/data/course-prices.ts (course `PTE Academic`).
//
// This module holds NO prices of its own. It only reads the master and
// formats it, so the PTE pages, their SEO/schema and their price copy can
// never drift from the master the way hardcoded literals did.
//
// ─────────────────────────────────────────────────────────────────
// SCOPE RULES (do not weaken):
//   1. Catalogue prices only. The PTE Academic Champion promotional offer
//      lives in lib/data/offers/pte-academic-champion-flagship.ts and is
//      a marketing layer that is NOT in this module and must never be
//      added to the price master. Its offer prices and reference fee
//      must not appear here, and nothing here may pair the ₹3,000
//      catalogue price with the offer price.
//   2. Amounts are GST-EXCLUSIVE. Surfaces must say "+ GST" (or "prices
//      exclude GST") next to them; no GST rate is configured here.
//   3. This module does not feed COURSE_FEES / checkout. Checkout keeps
//      deriving PTE from the price master inside lib/data/course-fees.ts.
// ─────────────────────────────────────────────────────────────────
//
// It is a pure, environment-agnostic module: safe to import from both
// server components (app/test-prep/pte/page.tsx) and client components
// (PTEClient.tsx) — it imports nothing from next/*.

import { COURSE_PRICES, getCoursePrices } from "@/lib/data/course-prices";
import { toPriceView, type PriceView } from "@/lib/data/price-view";
import { courseOfferJsonLd } from "@/lib/seo/jsonld";

/** PTE Academic packs, in price-master order. */
export const PTE_PACKS = getCoursePrices("PTE Academic");

if (PTE_PACKS.length === 0) {
  throw new Error(
    "Price master is missing PTE Academic packs. Add them to " +
      "lib/data/course-prices.ts rather than hardcoding a price at the call site.",
  );
}

/**
 * The four PTE catalogue products the PTE surfaces may display, in
 * price-master order. Every entry MUST exist in the master.
 */
export const PTE_PRODUCT_IDS = [
  "pte-academic-live-class",
  "pte-academic-self-prep",
  "pte-academic-champion",
  "pte-core-mock-tests",
] as const;

/**
 * PriceView of every PTE catalogue product, derived from the master
 * via the W1 read-model. Holds NO price literal of its own; the
 * Champion catalogue price shown here stays exactly ₹3,000 and the
 * Champion offer price must never appear in this list.
 */
export const PTE_VIEWS: PriceView[] = PTE_PRODUCT_IDS.map((id) => {
  const product = COURSE_PRICES.find((entry) => entry.id === id);
  if (!product) {
    throw new Error(
      `Price master is missing pack \`${id}\`. Add it to ` +
        "lib/data/course-prices.ts rather than hardcoding a price at the call site.",
    );
  }
  return toPriceView(product);
});

/** ISO currency code for every PTE amount, taken from the master. */
export const PTE_CURRENCY = "INR";

/** Lowest PTE Academic pack price in INR, e.g. 1313. */
export const PTE_FROM_PRICE = Math.min(...PTE_PACKS.map((pack) => pack.price));

/** Formatted "from" price for display, e.g. "₹1,313". */
export const PTE_FROM_PRICE_DISPLAY = `₹${PTE_FROM_PRICE.toLocaleString("en-IN")}`;

/** Bare numeric string for JSON-LD/metadata, e.g. "1313" (no separators). */
export const PTE_FROM_PRICE_PLAIN = String(PTE_FROM_PRICE);

/** "₹1,313" — the only approved way to render a PTE pack amount. */
export function formatPtePrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

/** Highest PTE catalogue pack price across the four PTE products, e.g. 3000. */
export const PTE_TOP_PRICE = Math.max(...PTE_VIEWS.map((view) => view.price));

/** Formatted highest PTE pack price for display, e.g. "₹3,000". */
export const PTE_TOP_PRICE_DISPLAY = formatPtePrice(PTE_TOP_PRICE);

/**
 * JSON-LD Offer objects for every PTE Academic pack, derived from the
 * W1 JSON-LD foundation on top of the price master so schema prices can
 * never contradict it.
 *
 * Contains no availability, rating or review data — those must be
 * supplied by the calling page if they are genuinely known. `sku` is
 * the stable catalogue product id (never fabricated).
 */
export function getPteJsonLdOffers(): Array<Record<string, string>> {
  return PTE_PACKS.map((pack) => {
    const offer = courseOfferJsonLd(pack);
    return {
      "@type": "Offer",
      name: String(offer.name),
      sku: String(offer.sku),
      price: String(pack.price),
      priceCurrency: String(offer.priceCurrency),
      description: `${pack.program} pack — ${pack.validity} access, prices exclude GST`,
    };
  });
}
