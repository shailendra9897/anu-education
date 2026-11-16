// FILE: lib/data/offers/ielts-academic-champion-flagship.ts
//
// HISTORICAL RECORD ONLY — DISCONTINUED 2026-11-12 (G1-14).
//
// The IELTS Academic Champion "Upcoming Batch" offer is no longer
// displayed, sold or accepted at checkout. This module is retained so
// historical orders/invoices that referenced the offer remain
// explainable. Every active surface must use the IELTS pack master and
// the server checkout instead.
//
// ─────────────────────────────────────────────────────────────────
// SCOPE RULES (do not weaken):
//   1. This is a marketing offer, NOT a pack in the price master.
//      lib/data/course-prices.ts and its 13 IELTS packs are untouched.
//   2. Every amount below is GST-EXCLUSIVE. Public surfaces must render
//      "₹4,999 + GST" / "₹9,998 + GST" via the helpers in this file.
//   3. Never render 4999 as "GST included", "final price" or
//      "all inclusive", and never hardcode a GST-inclusive total here
//      (no GST rate is configured in this repository).
//   4. This file does NOT feed COURSE_FEES / checkout. Payment amounts
//      stay on the price master until the checkout can distinguish this
//      offer (IELTS Academic Champion + selected timing + offer) from the
//      existing IELTS packs.
//   5. The offer applies only to IELTS Academic Champion (Morning /
//      Afternoon / Evening). It is never the price of Self Prep, Champion
//      (All Timings), IELTS General or any Marathon pack.
// ─────────────────────────────────────────────────────────────────

/** Currency for every amount in this offer. */
export const OFFER_CURRENCY = "INR";

/** Batch timings the flagship offer is available for. */
export type IeltsChampionTiming = "Morning" | "Afternoon" | "Evening";

/** A clean, explicit commercial-offer representation. */
export type FlagshipOffer = {
  /** Stable product identifier. */
  id: string;
  /** Display name shown to students. */
  displayName: string;
  /** Course type this offer belongs to. */
  courseType: string;
  /** Pack family this offer maps to. */
  packFamily: string;
  /** Selectable batch timings. */
  timings: readonly IeltsChampionTiming[];
  /** Regular/list course price, GST-exclusive. */
  regularPrice: number;
  /** Promotional price for the upcoming confirmed batch, GST-exclusive. */
  promotionalPrice: number;
  /** ISO currency code. */
  currency: string;
  /** Always false: amounts never include GST. */
  gstIncluded: boolean;
  /** Discount on the course fee before GST. */
  discountPercent: number;
  /** Short discount badge, e.g. "50% OFF". */
  offerLabel: string;
  /** Offer context, e.g. "Upcoming Confirmed Batch". */
  offerContext: string;
  /** Truthful urgency wording — never a fabricated deadline or seat count. */
  urgency: string;
  /** Prompt shown next to the timing selector. */
  timingPrompt: string;
  /** Primary CTA label. */
  ctaLabel: string;
  /**
   * False until checkout can price this offer separately from the
   * IELTS pack master. While false, surfaces must not take payment
   * for this offer through COURSE_FEES/checkout.
   */
  checkoutEligible: boolean;
  /** Lifecycle state. Historical records keep their values; active sales do not. */
  active: boolean;
  /** Date the business discontinued the offer (ISO YYYY-MM-DD). */
  discontinuedOn: string;
  /** Human-readable audit note; never rendered as an active offer. */
  discontinuedReason: string;
};

/** Regular course price (course fee before GST), in INR. */
const REGULAR_PRICE = 9998;

/** Upcoming confirmed batch promotional price (course fee before GST), in INR. */
const PROMOTIONAL_PRICE = 4999;

/**
 * Discount on the course fee before GST:
 * (9998 - 4999) / 9998 = 50% (rounded to the nearest whole percent).
 * Derived from the two prices above so the badge can never drift from them.
 */
const DISCOUNT_PERCENT = Math.round(
  ((REGULAR_PRICE - PROMOTIONAL_PRICE) / REGULAR_PRICE) * 100,
);

/** The flagship offer. The only place these commercial values exist. */
export const IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER: FlagshipOffer = {
  id: "ielts-academic-champion-upcoming-batch-offer",
  displayName: "IELTS Academic Champion",
  courseType: "IELTS Academic",
  packFamily: "Champion",
  timings: ["Morning", "Afternoon", "Evening"],
  regularPrice: REGULAR_PRICE,
  promotionalPrice: PROMOTIONAL_PRICE,
  currency: OFFER_CURRENCY,
  gstIncluded: false,
  discountPercent: DISCOUNT_PERCENT,
  offerLabel: `${DISCOUNT_PERCENT}% OFF`,
  offerContext: "Upcoming Confirmed Batch",
  urgency: "Limited seats for the upcoming batch",
  timingPrompt: "Choose your preferred batch timing",
  ctaLabel: "Enrol for the Upcoming Batch",
  checkoutEligible: false,
  active: false,
  discontinuedOn: "2026-11-12",
  discontinuedReason:
    "Discontinued by the business on 2026-11-12. Active IELTS checkout uses the approved pack prices and GST only.",
};

/** "₹4,999 + GST" — the only approved way to show an offer amount. */
export function formatGstPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")} + GST`;
}

/** Offer headline: "50% OFF — Upcoming Confirmed Batch". */
export function getOfferHeadline(
  offer: FlagshipOffer = IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER,
): string {
  return `${offer.offerLabel} — ${offer.offerContext}`;
}

/** WhatsApp CTA message for a chosen batch timing. */
export function getFlagshipOfferWhatsAppMessage(
  timing: IeltsChampionTiming,
  offer: FlagshipOffer = IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER,
): string {
  return [
    `Hi, I want to join the ${offer.displayName} ${offer.offerContext} offer`,
    `(${offer.offerLabel}, ${formatGstPrice(offer.promotionalPrice)}).`,
    `Preferred batch timing: ${timing}.`,
    "Please share demo class details and the total payable amount including GST.",
  ].join(" ");
}

/**
 * Product + Offer JSON-LD for the flagship offer.
 * Offer.price is the GST-exclusive numeric promotional price (4999).
 */
export function getFlagshipOfferJsonLd(options: {
  url: string;
  image?: string;
}): Record<string, unknown> {
  const offer = IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${offer.displayName} — ${offer.offerContext}`,
    description: `${offer.courseType} ${offer.packFamily} coaching with Morning, Afternoon and Evening batches. ${getOfferHeadline(offer)}: ${formatGstPrice(offer.regularPrice)} reduced to ${formatGstPrice(offer.promotionalPrice)}. GST is charged extra; the amounts exclude GST.`,
    sku: offer.id,
    brand: { "@type": "Brand", name: "ANU Education" },
    ...(options.image ? { image: options.image } : {}),
    url: options.url,
    offers: {
      "@type": "Offer",
      priceCurrency: offer.currency,
      price: offer.promotionalPrice,
      availability: "https://schema.org/LimitedAvailability",
      url: options.url,
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: offer.currency,
        price: offer.promotionalPrice,
        valueAddedTaxIncluded: false,
      },
    },
  };
}
