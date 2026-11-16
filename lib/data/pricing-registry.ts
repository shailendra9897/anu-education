// FILE: lib/data/pricing-registry.ts
//
// Deterministic, repository-local validation for the course price
// registry (PRICING-ARCH-W1, Phase 3/4). Pure functions only: no DB,
// no network, no I/O, no clock other than what you pass in. Callers
// (tests, build checks) assert that every `validate*` call returns an
// empty array of violations.
//
// Scope guard: this module validates identity, currency, GST state,
// date windows and checkout isolation. It never computes, derives or
// rewrites a price, and it never introduces a tax rate, a date, or a
// SKU that the business did not supply.

import { COURSE_FEES } from "@/lib/data/course-fees";
import {
  COURSE_PRICES,
  CURRENCY,
  getProductCurrency,
  isGstIncluded,
  type CoursePrice,
} from "@/lib/data/course-prices";

/**
 * Minimal structural shape of an offer, so this module does not need
 * to import (or anticipate) the full offer registry.
 */
export type OfferDescriptor = {
  readonly id: string;
  readonly checkoutEligible: boolean;
};

/**
 * Checkout key -> catalogue product ids that may be charged under it.
 *
 * This is an ALLOW-LIST (a guard), not a price source: `COURSE_FEES`
 * still derives every amount from the master. A product id appears
 * here only when it is the pack a generic checkout key actually sells.
 * Amounts are intentionally absent — they must stay derived.
 */
export const CHECKOUT_ALLOW_LIST: Readonly<Record<string, readonly string[]>> =
  Object.freeze({
    IELTS: ["ielts-academic-self-prep"],
    PTE: ["pte-academic-live-class"],
    "German A1": ["german-basic-a1"],
    "French A1": ["french-basic-a1-morning-evening"],
  });

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A real calendar date in strict `YYYY-MM-DD` form. */
function isIsoCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === value;
}

/**
 * Rules 1-7 of the pricing guard matrix, applied to a catalogue.
 *
 * - ids are unique and constructed as `<courseId>-<programId>`
 * - prices are supplied positive whole-rupee INR amounts
 * - currency resolves to INR
 * - GST state is explicit or safely defaulted, and may not claim
 *   tax-inclusive pricing while no tax configuration exists here
 * - `effectiveFrom` / `effectiveUntil` are real ISO dates, from <= until
 * - a declared `checkoutKey` is unique and consistent with the allow-list
 */
export function validateCatalogue(
  prices: readonly CoursePrice[] = COURSE_PRICES,
  allowList: Readonly<Record<string, readonly string[]>> = CHECKOUT_ALLOW_LIST,
): string[] {
  const violations: string[] = [];
  const seenIds = new Map<string, number>();
  const seenPairs = new Map<string, number>();
  const seenCheckoutKeys = new Map<string, string>();

  prices.forEach((entry, index) => {
    const where = `entry[${index}] (${entry.id})`;

    const firstIndex = seenIds.get(entry.id);
    if (firstIndex !== undefined) {
      violations.push(
        `${where}: duplicate product id (also entry[${firstIndex}])`,
      );
    } else {
      seenIds.set(entry.id, index);
    }

    const pair = `${entry.courseId}/${entry.programId}`;
    const pairIndex = seenPairs.get(pair);
    if (pairIndex !== undefined) {
      violations.push(
        `${where}: duplicate courseId/programId pair ${pair} (also entry[${pairIndex}])`,
      );
    } else {
      seenPairs.set(pair, index);
    }

    if (entry.id !== `${entry.courseId}-${entry.programId}`) {
      violations.push(
        `${where}: id must be constructed as \`${entry.courseId}-${entry.programId}\``,
      );
    }

    if (!Number.isInteger(entry.price) || entry.price <= 0) {
      violations.push(
        `${where}: price must be a positive whole-rupee amount, got ${String(entry.price)}`,
      );
    }

    if (getProductCurrency(entry) !== CURRENCY) {
      violations.push(
        `${where}: currency resolves to "${getProductCurrency(entry)}", expected "${CURRENCY}"`,
      );
    }

    if (entry.gstIncluded !== undefined && typeof entry.gstIncluded !== "boolean") {
      violations.push(`${where}: gstIncluded must be a boolean when present`);
    }
    if (entry.gstIncluded === true) {
      violations.push(
        `${where}: sets gstIncluded:true, but no GST/tax configuration exists in this repository — add tax configuration before claiming tax-inclusive prices`,
      );
    }
    if (typeof isGstIncluded(entry) !== "boolean") {
      violations.push(`${where}: GST state does not resolve to a boolean`);
    }

    for (const field of ["effectiveFrom", "effectiveUntil"] as const) {
      const value = entry[field];
      if (value !== undefined && !isIsoCalendarDate(value)) {
        violations.push(
          `${where}: ${field} must be a real YYYY-MM-DD date, got ${JSON.stringify(value)}`,
        );
      }
    }
    if (
      isIsoCalendarDate(entry.effectiveFrom) &&
      isIsoCalendarDate(entry.effectiveUntil) &&
      entry.effectiveUntil < entry.effectiveFrom
    ) {
      violations.push(
        `${where}: effectiveUntil (${entry.effectiveUntil}) precedes effectiveFrom (${entry.effectiveFrom})`,
      );
    }

    if (entry.checkoutKey !== undefined) {
      const key = entry.checkoutKey;
      if (key.trim() === "") {
        violations.push(`${where}: checkoutKey must not be empty`);
      }
      const existing = seenCheckoutKeys.get(key);
      if (existing !== undefined && existing !== entry.id) {
        violations.push(
          `${where}: checkoutKey "${key}" is also declared by product "${existing}"`,
        );
      } else {
        seenCheckoutKeys.set(key, entry.id);
      }
      const listed = allowList[key];
      if (listed === undefined) {
        violations.push(
          `${where}: checkoutKey "${key}" is not a key of CHECKOUT_ALLOW_LIST`,
        );
      } else if (!listed.includes(entry.id)) {
        violations.push(
          `${where}: checkoutKey "${key}" allow-list does not include this product id`,
        );
      }
    }
  });

  return violations;
}

/**
 * Checkout isolation rules:
 *
 * - every allow-list product id exists in the catalogue
 * - every allow-list key is chargeable, and every chargeable key is allow-listed
 * - the derived amount for a key matches the price of the pack it lists
 * - checkout option values rendered by the pay page are allow-listed keys
 * - offer ids are never catalogue ids, allow-list ids or checkout keys;
 *   in particular a `checkoutEligible:false` offer can never be charged
 */
export function validateCheckoutBoundary(options: {
  readonly catalogue?: readonly CoursePrice[];
  readonly allowList?: Readonly<Record<string, readonly string[]>>;
  readonly courseFees?: Readonly<Record<string, number>>;
  /** Checkout option values rendered by the pay page ("" excluded). */
  readonly checkoutOptionKeys?: readonly string[];
  readonly offers?: readonly OfferDescriptor[];
}): string[] {
  const catalogue = options.catalogue ?? COURSE_PRICES;
  const allowList = options.allowList ?? CHECKOUT_ALLOW_LIST;
  const courseFees = options.courseFees ?? COURSE_FEES;

  const violations: string[] = [];
  const priceById = new Map<string, number>(catalogue.map((p) => [p.id, p.price]));
  const catalogueIds = new Set(priceById.keys());
  const allowListIds = Object.values(allowList).flat();

  for (const [key, ids] of Object.entries(allowList)) {
    if (ids.length === 0) {
      violations.push(`CHECKOUT_ALLOW_LIST["${key}"]: no product ids listed`);
      continue;
    }
    const amounts: number[] = [];
    for (const id of ids) {
      const price = priceById.get(id);
      if (price === undefined) {
        violations.push(
          `CHECKOUT_ALLOW_LIST["${key}"]: product id "${id}" is not in the price catalogue`,
        );
        continue;
      }
      amounts.push(price);
    }
    const fee = courseFees[key];
    if (typeof fee !== "number" || !Number.isFinite(fee) || fee <= 0) {
      violations.push(
        `CHECKOUT_ALLOW_LIST["${key}"]: COURSE_FEES["${key}"] is not a positive amount`,
      );
    } else if (amounts.length > 0) {
      const expected = Math.min(...amounts);
      if (fee !== expected) {
        violations.push(
          `CHECKOUT_ALLOW_LIST["${key}"]: COURSE_FEES["${key}"] is ${fee} but the allow-listed pack price is ${expected}`,
        );
      }
    }
  }

  for (const key of Object.keys(courseFees)) {
    if (!(key in allowList)) {
      violations.push(
        `COURSE_FEES["${key}"]: chargeable checkout key has no CHECKOUT_ALLOW_LIST entry`,
      );
    }
  }

  for (const key of options.checkoutOptionKeys ?? []) {
    if (!(key in allowList)) {
      violations.push(
        `checkout option "${key}": not a CHECKOUT_ALLOW_LIST key`,
      );
    } else if (!(key in courseFees)) {
      violations.push(
        `checkout option "${key}": allow-listed but has no COURSE_FEES amount`,
      );
    }
  }

  for (const offer of options.offers ?? []) {
    const places: string[] = [];
    if (catalogueIds.has(offer.id)) places.push("price catalogue");
    if (allowListIds.includes(offer.id)) places.push("CHECKOUT_ALLOW_LIST");
    if (offer.id in allowList) places.push("CHECKOUT_ALLOW_LIST key");
    if (offer.id in courseFees) places.push("COURSE_FEES key");
    for (const place of places) {
      const suffix = offer.checkoutEligible
        ? ""
        : " (offer has checkoutEligible:false)";
      violations.push(
        `offer id "${offer.id}" appears in the ${place} and must never be charged${suffix}`,
      );
    }
  }

  return violations;
}
