// FILE: lib/data/offers/pte-academic-champion-flagship.ts
//
// PTE Academic Champion promotional (marketing) offer.
//
// ─────────────────────────────────────────────────────────────────
// BOUNDARIES (do not weaken):
//   1. This module holds offer-owned commercial values ONLY: the
//      ₹5,998 regular reference fee and the ₹2,999 promotional fee.
//      The PTE Champion catalogue price lives solely in the price
//      master and must never be stored or rendered here, and ₹5,998
//      must never be presented as a historical catalogue price.
//   2. checkoutEligible:false — this offer is NOT payable through
//      COURSE_FEES / checkout. Its only allowed surface is pageScope.
//   3. The catalogue master (lib/data/course-prices.ts) remains the
//      single source of truth for catalogue pricing; this offer is a
//      separate promotional layer on top of the `pte-academic-champion`
//      product.
// ─────────────────────────────────────────────────────────────────

import { getProductCurrency, COURSE_PRICES } from "@/lib/data/course-prices";
import { formatAmount } from "@/lib/data/price-view";

/** Catalogue product this offer promotes (must exist in the master). */
export const PTE_CHAMPION_PRODUCT_ID = "pte-academic-champion";

/** Stable offer identifier. */
export const PTE_CHAMPION_OFFER_ID = "pte-academic-champion-50-offer";

/** Regular/reference course fee before GST, in INR. */
const PTE_REGULAR_PRICE = 5998;

/** Promotional course fee before GST, in INR. */
const PTE_PROMOTIONAL_PRICE = 2999;

/**
 * Discount on the course fee before GST, derived from the two prices
 * above so the badge can never drift from them. (5998 - 2999)/5998
 * resolves to exactly 50.
 */
const PTE_DISCOUNT_PERCENT = Math.round(
  ((PTE_REGULAR_PRICE - PTE_PROMOTIONAL_PRICE) / PTE_REGULAR_PRICE) * 100,
);

export type PteAcademicChampionFlagshipOffer = {
  /** Stable offer identifier. */
  id: string;
  /** Catalogue product this offer promotes, e.g. "pte-academic-champion". */
  productId: string;
  /** Display name shown to students. */
  displayName: string;
  /** Regular/reference course fee, GST-exclusive. */
  regularPrice: number;
  /** Promotional course fee, GST-exclusive. */
  promotionalPrice: number;
  /** ISO currency code. */
  currency: string;
  /** Always false: amounts never include GST. */
  gstIncluded: boolean;
  /** Discount on the course fee before GST. */
  discountPercent: number;
  /** Short discount badge, e.g. "50% OFF". */
  offerLabel: string;
  /** True while the offer may be displayed on its page. */
  active: boolean;
  /**
   * False until checkout can price this offer separately from the PTE
   * pack catalogue. While false, no surface may take payment for this
   * offer through COURSE_FEES/checkout.
   */
  checkoutEligible: boolean;
  /** The only page allowed to display this offer. */
  pageScope: string;
};

const pteChampionProduct = COURSE_PRICES.find(
  (entry) => entry.id === PTE_CHAMPION_PRODUCT_ID,
);

if (!pteChampionProduct) {
  throw new Error(
    `Price master is missing product \`${PTE_CHAMPION_PRODUCT_ID}\` (PTE Academic / Champion). ` +
      "Add it to lib/data/course-prices.ts rather than hardcoding a price at the call site.",
  );
}

/** The only place the PTE Champion commercial offer values exist. */
export const PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER: PteAcademicChampionFlagshipOffer = {
  id: PTE_CHAMPION_OFFER_ID,
  productId: PTE_CHAMPION_PRODUCT_ID,
  displayName: "PTE Academic Champion",
  regularPrice: PTE_REGULAR_PRICE,
  promotionalPrice: PTE_PROMOTIONAL_PRICE,
  currency: getProductCurrency(pteChampionProduct),
  gstIncluded: false,
  discountPercent: PTE_DISCOUNT_PERCENT,
  offerLabel: `${PTE_DISCOUNT_PERCENT}% OFF`,
  active: true,
  checkoutEligible: false,
  pageScope: "/test-prep/pte",
};

/** "₹5,998 + GST" — the only approved way to show an offer amount. */
export function formatPteOfferGstPrice(amount: number): string {
  const offer = PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;
  return `${formatAmount(amount, offer.currency)} + GST`;
}

/** Offer headline, e.g. "50% OFF — PTE Academic Champion". */
export function getPteChampionOfferHeadline(): string {
  const offer = PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;
  return `${offer.offerLabel} — ${offer.displayName}`;
}