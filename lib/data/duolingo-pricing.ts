// FILE: lib/data/duolingo-pricing.ts
//
// Duolingo public pricing, derived from the authoritative price master at
// lib/data/course-prices.ts (pack `duolingo-champion`) through the W1
// PriceView read-model, and its schema via the W1 JSON-LD foundation
// (PRICING-ARCH-W3).
//
// This module holds NO catalogue price of its own: every displayed amount,
// currency, GST state and validity string comes either from the master
// (via toPriceView) or from the single explicit, business-supplied list
// price below. The Duolingo page, its SEO/schema and its FAQ can never
// drift from the master the way hardcoded literals did.
//
// ─────────────────────────────────────────────────────────────────
// SCOPE RULES (do not weaken):
//   1. The catalogue price is the Duolingo Champion price in the master
//      (pack `duolingo-champion`). The list/regular price below is a
//      legitimate business marketing rule — a struck-through reference,
//      NOT a pack price and NOT a promotion, so no promotional offer
//      object exists or will exist for Duolingo.
//   2. Amounts are GST-EXCLUSIVE. Surfaces must say "+ GST" next to them
//      (via DUO_GST_LABEL); no GST rate is configured here.
//   3. This module does not feed COURSE_FEES / checkout. Checkout keeps
//      deriving every amount from the master inside lib/data/course-fees.ts.
// ─────────────────────────────────────────────────────────────────
//
// It is a pure, environment-agnostic module: safe to import from both
// server components (app/test-prep/duolingo/page.tsx) and client
// components (DuolingoClient.tsx) — it imports nothing from next/*.

import { findCoursePrice, type CoursePrice } from "@/lib/data/course-prices";
import { toPriceView, formatAmount, type PriceView } from "@/lib/data/price-view";
import { courseOfferJsonLd } from "@/lib/seo/jsonld";

/** Throw when the price master has no Duolingo Champion pack. */
function requireDuolingoPack(
  value: CoursePrice | undefined,
): CoursePrice {
  if (!value) {
    throw new Error(
      "Price master is missing pack `duolingo-champion` (Duolingo English Test / Champion). " +
        "Add it to lib/data/course-prices.ts rather than hardcoding a price at the call site.",
    );
  }
  return value;
}

const pack: CoursePrice = requireDuolingoPack(
  findCoursePrice("Duolingo English Test", "Champion"),
);

/**
 * Business-supplied list/regular price shown struck through beside the
 * catalogue price. Explicitly declared here (it is not a master pack
 * price) and preserved exactly as supplied: not inferred, not derived.
 */
const LIST_PRICE = 5000;

/**
 * PriceView of the Duolingo Champion pack, derived from the price master
 * via the W1 read-model. Every field (price, currency, GST state,
 * validity) resolves from lib/data/course-prices.ts.
 */
export const DUO_VIEW: PriceView = toPriceView(pack);

/** Authoritative current public price in INR, read straight from the master. */
export const DUO_PRICE = DUO_VIEW.price;

/** Formatted for display, derived via the shared currency formatter. */
export const DUO_PRICE_DISPLAY = formatAmount(
  DUO_VIEW.price,
  DUO_VIEW.currency,
);

/** Bare numeric string for JSON-LD/metadata (no separators). */
export const DUO_PRICE_PLAIN = String(DUO_VIEW.price);

/** Resolved GST state for the pack: false — prices exclude GST. */
export const DUO_GST_INCLUDED = DUO_VIEW.gstIncluded;

/** " + GST" when the amount excludes tax, "" when it includes it. */
export const DUO_GST_LABEL = DUO_VIEW.gstLabel;

/** Access/validity from the master, e.g. "4 Weeks / 60 Days". */
export const DUO_VALIDITY = DUO_VIEW.validity;

/** Business-supplied regular/list price in INR, e.g. 5000. */
export const DUO_LIST_PRICE = LIST_PRICE;

/** Formatted for display, e.g. "₹5,000". */
export const DUO_LIST_PRICE_DISPLAY = formatAmount(
  LIST_PRICE,
  DUO_VIEW.currency,
);

/**
 * Saving against the list price, rounded to the nearest whole percent.
 * Rendered wherever the page claims a discount, so the visible claim
 * stays truthful if the price master changes.
 */
export const DUO_SAVINGS_PERCENT = Math.round(
  ((LIST_PRICE - DUO_VIEW.price) / LIST_PRICE) * 100,
);

/** e.g. "60% OFF" for badges, "60% Saving" for prose. */
export const DUO_SAVINGS_BADGE = `${DUO_SAVINGS_PERCENT}% OFF`;

/**
 * JSON-LD Offer objects for the Duolingo page, derived from the W1 JSON-LD
 * foundation on top of the price master so schema prices can never
 * contradict it. The Champion offer price is the catalogue price; the
 * Free Demo Pack is a genuinely free, non-master pack. Contains no
 * invented availability state or date — availability is only declared
 * because the course is online and no validFrom/validThrough is fabricated.
 */
export function getDuoJsonLdOffers(): Array<Record<string, string>> {
  const champion = courseOfferJsonLd(pack);
  return [
    {
      "@type": "Offer",
      name: "Free Demo Pack",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/OnlineOnly",
    },
    {
      "@type": "Offer",
      name: String(champion.name),
      sku: String(champion.sku),
      price: String(champion.price),
      priceCurrency: String(champion.priceCurrency),
      availability: "https://schema.org/OnlineOnly",
      description: `Limited offer. Regular price ${DUO_LIST_PRICE_DISPLAY}.`,
    },
  ];
}