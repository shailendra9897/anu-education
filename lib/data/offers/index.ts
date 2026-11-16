// FILE: lib/data/offers/index.ts
//
// Offer registry (PRICING-ARCH-W2, Phase 3). The ONLY module that knows
// every offer in the repository. It exists so validation and call sites
// can rely on one list instead of importing offers one by one.
//
// The registry itself stores no prices. It re-exports the two offer
// modules and exposes deterministic validation:
//   - offer ids are unique and never collide with catalogue product ids
//   - productId (when present) points at a real catalogue product
//   - lifecycle flags are booleans where the offer declares them
//   - checkout isolation is checked via `validateCheckoutBoundary`

import { COURSE_PRICES, type CoursePrice } from "@/lib/data/course-prices";
import {
  validateCheckoutBoundary,
  type OfferDescriptor,
} from "@/lib/data/pricing-registry";
import { IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER } from "./ielts-academic-champion-flagship";
import { PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER } from "./pte-academic-champion-flagship";

export { IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER } from "./ielts-academic-champion-flagship";
export { PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER } from "./pte-academic-champion-flagship";
export { PTE_CHAMPION_PRODUCT_ID } from "./pte-academic-champion-flagship";

/**
 * Structural offer shape as seen by the registry. `productId` is
 * optional because the IELTS flagship predates it; new offers set it.
 */
export type RegisteredOffer = OfferDescriptor & {
  readonly productId?: string;
};

/** Offers that may be displayed or sold today. G1-14 retired the IELTS offer. */
export const ACTIVE_OFFERS: readonly RegisteredOffer[] = Object.freeze([
  PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER,
]);

/** Historical records retained for audit only. Never rendered or charged. */
export const HISTORICAL_OFFERS: readonly RegisteredOffer[] = Object.freeze([
  IELTS_ACADEMIC_CHAMPION_FLAGSHIP_OFFER,
]);

/** Every known offer, for validation/audit only. */
export const ALL_OFFERS: readonly RegisteredOffer[] = Object.freeze([
  ...ACTIVE_OFFERS,
  ...HISTORICAL_OFFERS,
]);

/** True when an offer may be shown or sold on a public surface. */
export function isOfferActive(offer: RegisteredOffer): boolean {
  return ACTIVE_OFFERS.includes(offer);
}

/** Find an offer by id, or undefined. */
export function getOfferById(
  id: string,
): RegisteredOffer | undefined {
  return ALL_OFFERS.find((offer) => offer.id === id);
}

/**
 * Deterministic registry rules. Returns human-readable violations;
 * callers (tests, build checks) assert it is empty.
 */
export function validateOffers(
  offers: readonly RegisteredOffer[] = ALL_OFFERS,
  catalogue: readonly CoursePrice[] = COURSE_PRICES,
): string[] {
  const violations: string[] = [];
  const catalogueIds = new Set(catalogue.map((entry) => entry.id));
  const seenIds = new Map<string, number>();

  offers.forEach((offer, index) => {
    const where = `offer[${index}] (${offer.id})`;

    const first = seenIds.get(offer.id);
    if (first !== undefined) {
      violations.push(
        `${where}: duplicate offer id (also offer[${first}])`,
      );
    } else {
      seenIds.set(offer.id, index);
    }

    if (catalogueIds.has(offer.id)) {
      violations.push(
        `${where}: offer id collides with a catalogue product id — offers and products must be distinct`,
      );
    }

    if (typeof offer.checkoutEligible !== "boolean") {
      violations.push(`${where}: checkoutEligible must be a boolean`);
    }

    if (offer.productId !== undefined) {
      if (!catalogueIds.has(offer.productId)) {
        violations.push(
          `${where}: productId "${offer.productId}" is not in the price catalogue`,
        );
      }
      if (offer.productId === offer.id) {
        violations.push(
          `${where}: productId must not equal the offer id — the product and the offer are different things`,
        );
      }
    }
  });

  return violations;
}

/**
 * Checkout isolation for the whole registry: offer ids never appear in
 * the price catalogue, CHECKOUT_ALLOW_LIST or COURSE_FEES keys.
 */
export function validateOfferCheckoutIsolation(
  offers: readonly RegisteredOffer[] = ALL_OFFERS,
): string[] {
  return validateCheckoutBoundary({ offers });
}