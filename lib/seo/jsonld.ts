// FILE: lib/seo/jsonld.ts
//
// Foundation helpers for structured data (PRICING-ARCH-W1, Phase 6).
// Every emitted value is derived from the price registry or from data
// already on the page. This module never invents a price, a currency,
// an availability state, a date, a rating or a review, and it emits
// no GST rate (none is configured in this repository).

import { getProductCurrency, type CoursePrice } from "@/lib/data/course-prices";

/**
 * Schema.org `Offer` for one catalogue product.
 *
 * Deliberately minimal: product identity, price and priceCurrency.
 * Availability, validFrom / validThrough, itemCondition,
 * priceSpecification and seller are NOT emitted because no such value
 * exists in the registry — add them only when they come from supplied
 * data, never as defaults.
 */
export function courseOfferJsonLd(
  product: CoursePrice,
): Record<string, unknown> {
  return {
    "@type": "Offer",
    name: `${product.course} – ${product.program}`,
    sku: product.id,
    price: product.price,
    priceCurrency: getProductCurrency(product),
  };
}
