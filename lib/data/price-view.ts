// FILE: lib/data/price-view.ts
//
// PriceView: the read-model contract for UI / SEO consumers
// (PRICING-ARCH-W1, Phase 5). Every field is DERIVED from a
// CoursePrice. A PriceView carries no independently maintained price
// literal, no discount, no GST rate and no availability the catalogue
// did not supply. If a number appears here, it came from the master.

import {
  COURSE_PRICES,
  getProductCurrency,
  isGstIncluded,
  isProductActive,
  type CoursePrice,
} from "@/lib/data/course-prices";

export type PriceView = {
  /** Catalogue product id, e.g. "pte-academic-champion". */
  productId: string;
  courseId: string;
  programId: string;
  /** Human-readable course name, e.g. "PTE Academic". */
  course: string;
  program: string;
  /** `${course} – ${program}` — stable display identity. */
  displayName: string;
  /** Price exactly as stored in the master. */
  price: number;
  currency: string;
  gstIncluded: boolean;
  /** " + GST" when the amount excludes tax, "" when it includes it. */
  gstLabel: string;
  validity: string;
  /** Lifecycle + date-window state as of `at`. */
  active: boolean;
  /** Checkout key for chargeable packs, null when none is declared. */
  checkoutKey: string | null;
  /** e.g. "PTE Academic – Champion · ₹3,000 + GST". */
  label: string;
};

const CURRENCY_SYMBOLS: Readonly<Record<string, string>> = Object.freeze({
  INR: "₹",
});

/** Format an amount in its currency. Symbols only, never a tax rate. */
export function formatAmount(amount: number, currency: string): string {
  const formatted = amount.toLocaleString("en-IN");
  const symbol = CURRENCY_SYMBOLS[currency];
  return symbol ? `${symbol}${formatted}` : `${currency} ${formatted}`;
}

/** Build the derived view for one catalogue row. */
export function toPriceView(product: CoursePrice, at?: Date): PriceView {
  const currency = getProductCurrency(product);
  const gstIncluded = isGstIncluded(product);
  const gstLabel = gstIncluded ? "" : " + GST";
  const displayName = `${product.course} – ${product.program}`;
  const priceLabel = formatAmount(product.price, currency);

  return {
    productId: product.id,
    courseId: product.courseId,
    programId: product.programId,
    course: product.course,
    program: product.program,
    displayName,
    price: product.price,
    currency,
    gstIncluded,
    gstLabel,
    validity: product.validity,
    active: isProductActive(product, at),
    checkoutKey: product.checkoutKey ?? null,
    label: `${displayName} · ${priceLabel}${gstLabel}`,
  };
}

/**
 * Derived views for one course id, in catalogue order.
 * Order is never re-sorted so consumers keep master ordering.
 */
export function toPriceViewsForCourse(
  courseId: string,
  at?: Date,
): PriceView[] {
  return COURSE_PRICES.filter((product) => product.courseId === courseId).map(
    (product) => toPriceView(product, at),
  );
}

/** Derived views for the whole catalogue, in catalogue order. */
export function toPriceViews(at?: Date): PriceView[] {
  return COURSE_PRICES.map((product) => toPriceView(product, at));
}
