// FILE: lib/data/course-prices.ts
//
// ANU Education course/package price master.
// Authoritative ONLY for course/package prices. The brochure-based
// knowledge base (knowledge/**, data/**) remains authoritative for
// course details, batch timings, demo timings and curriculum/features.
//
// Prices here are the business-approved current prices and are the
// single source of truth for every surface (pages, SEO/schema, FAQ,
// AI knowledge). They are supplied values, never invented or
// reverse-engineered by this code, and discounts/promotions must not be
// silently derived unless explicitly supplied as a separate pack.
// GST/other taxes are not applied here.

export const CURRENCY = "INR";

export type CoursePrice = {
  /** Stable unique identifier: `<courseId>-<programId>`. */
  id: string;
  /** Human-readable course name, e.g. "IELTS Academic". */
  course: string;
  /** Stable course identifier, e.g. "ielts-academic". */
  courseId: string;
  /** Human-readable program/package name, e.g. "Champion (Morning)". */
  program: string;
  /** Stable program identifier, e.g. "champion-morning". */
  programId: string;
  /** Optional curriculum/level descriptor. null where not part of the price master. */
  curriculum: string | null;
  /** Access/validity descriptor, e.g. "8 Weeks / 180 Days". */
  validity: string;
  /** Price in INR, preserved exactly as supplied. */
  price: number;

  // ── Additive registry fields (PRICING-ARCH-W1) ───────────────────
  // Every field below is OPTIONAL for backward compatibility. An
  // omitted field resolves to the explicit deterministic default
  // exported next to the lookup helpers — never to an invented value,
  // never to a GST rate, never to a date that was not supplied.
  // Adding a value to a row is a business decision; leaving it out is
  // always safe and is what all existing rows do.

  /** ISO 4217 code. Omitted ⇒ `CURRENCY` ("INR"). */
  currency?: string;
  /**
   * True only when `price` already includes GST. Omitted ⇒ `false`:
   * this master never applies tax (see header) and no GST rate is
   * configured anywhere in this repository.
   */
  gstIncluded?: boolean;
  /** false retires the row without deleting it. Omitted ⇒ `true`. */
  active?: boolean;
  /** First day this price applies, `YYYY-MM-DD`. Absent ⇒ no lower bound. */
  effectiveFrom?: string;
  /** Last day this price applies, `YYYY-MM-DD`. Absent ⇒ no upper bound. */
  effectiveUntil?: string;
  /** Checkout key this pack is sold under, e.g. "PTE". Must match `CHECKOUT_ALLOW_LIST`. */
  checkoutKey?: string;
  /** Optional non-price metadata. Never read as a price. */
  meta?: Readonly<Record<string, string>>;
};

export const COURSE_PRICES: CoursePrice[] = [
  // ── IELTS Academic ───────────────────────────────────────────────
  // G1-14 approved commercial prices (GST-exclusive). The 18% GST rate
  // lives in lib/pricing/gst.ts and is applied by the server checkout.
  { id: "ielts-academic-self-prep", course: "IELTS Academic", courseId: "ielts-academic", program: "Self Prep", programId: "self-prep", curriculum: null, validity: "180 Days", price: 1999 },
  { id: "ielts-academic-champion-morning", course: "IELTS Academic", courseId: "ielts-academic", program: "Champion (Morning)", programId: "champion-morning", curriculum: null, validity: "8 Weeks / 180 Days", price: 5499 },
  { id: "ielts-academic-champion-afternoon", course: "IELTS Academic", courseId: "ielts-academic", program: "Champion (Afternoon)", programId: "champion-afternoon", curriculum: null, validity: "8 Weeks / 180 Days", price: 5499 },
  { id: "ielts-academic-champion-evening", course: "IELTS Academic", courseId: "ielts-academic", program: "Champion (Evening)", programId: "champion-evening", curriculum: null, validity: "8 Weeks / 180 Days", price: 5499 },
  { id: "ielts-academic-champion-all-timings", course: "IELTS Academic", courseId: "ielts-academic", program: "Champion (All Timings)", programId: "champion-all-timings", curriculum: null, validity: "8 Weeks / 180 Days", price: 6499 },
  { id: "ielts-academic-reading-marathon", course: "IELTS Academic", courseId: "ielts-academic", program: "Reading Marathon", programId: "reading-marathon", curriculum: null, validity: "4 Weeks / 45 Days", price: 3000 },
  { id: "ielts-academic-writing-marathon", course: "IELTS Academic", courseId: "ielts-academic", program: "Writing Marathon", programId: "writing-marathon", curriculum: null, validity: "4 Weeks / 45 Days", price: 3000 },
  { id: "ielts-academic-speaking-marathon", course: "IELTS Academic", courseId: "ielts-academic", program: "Speaking Marathon", programId: "speaking-marathon", curriculum: null, validity: "4 Weeks / 45 Days", price: 3000 },

  // ── IELTS General ────────────────────────────────────────────────
  { id: "ielts-general-self-preparation", course: "IELTS General", courseId: "ielts-general", program: "Self Preparation", programId: "self-preparation", curriculum: null, validity: "180 Days", price: 1875 },
  { id: "ielts-general-champion", course: "IELTS General", courseId: "ielts-general", program: "Champion", programId: "champion", curriculum: null, validity: "6 Weeks / 180 Days", price: 4125 },
  { id: "ielts-general-reading-marathon", course: "IELTS General", courseId: "ielts-general", program: "Reading Marathon", programId: "reading-marathon", curriculum: null, validity: "4 Weeks / 45 Days", price: 3000 },
  { id: "ielts-general-writing-marathon", course: "IELTS General", courseId: "ielts-general", program: "Writing Marathon", programId: "writing-marathon", curriculum: null, validity: "4 Weeks / 45 Days", price: 3000 },
  { id: "ielts-general-speaking-marathon", course: "IELTS General", courseId: "ielts-general", program: "Speaking Marathon", programId: "speaking-marathon", curriculum: null, validity: "4 Weeks / 45 Days", price: 3000 },

  // ── My Career Mentor ─────────────────────────────────────────────
  { id: "my-career-mentor-online", course: "My Career Mentor", courseId: "my-career-mentor", program: "Online", programId: "online", curriculum: null, validity: "6 Weeks / 45 Days", price: 5250 },

  // ── PTE Academic ─────────────────────────────────────────────────
  { id: "pte-academic-live-class", course: "PTE Academic", courseId: "pte-academic", program: "Live Class", programId: "live-class", curriculum: null, validity: "6 Weeks / 90 Days", price: 1313 },
  { id: "pte-academic-self-prep", course: "PTE Academic", courseId: "pte-academic", program: "Self Prep", programId: "self-prep", curriculum: null, validity: "180 Days", price: 1875 },
  { id: "pte-academic-champion", course: "PTE Academic", courseId: "pte-academic", program: "Champion", programId: "champion", curriculum: null, validity: "6 Weeks / 180 Days", price: 3000 },

  // ── PTE Core ─────────────────────────────────────────────────────
  { id: "pte-core-mock-tests", course: "PTE Core", courseId: "pte-core", program: "Mock Tests", programId: "mock-tests", curriculum: null, validity: "180 Days", price: 1875 },

  // ── Duolingo English Test ────────────────────────────────────────
  { id: "duolingo-champion", course: "Duolingo English Test", courseId: "duolingo", program: "Champion", programId: "champion", curriculum: null, validity: "4 Weeks / 60 Days", price: 1999 },

  // ── TOEFL iBT ────────────────────────────────────────────────────
  { id: "toefl-live-class", course: "TOEFL iBT", courseId: "toefl", program: "Live Class", programId: "live-class", curriculum: null, validity: "12 Weeks / 180 Days", price: 1875 },

  // ── CELPIP ───────────────────────────────────────────────────────
  { id: "celpip-self-prep", course: "CELPIP", courseId: "celpip", program: "Self Prep", programId: "self-prep", curriculum: null, validity: "180 Days", price: 3000 },
  { id: "celpip-champion", course: "CELPIP", courseId: "celpip", program: "Champion", programId: "champion", curriculum: null, validity: "6 Weeks / 180 Days", price: 5250 },

  // ── French ───────────────────────────────────────────────────────
  { id: "french-basic-a1-morning-evening", course: "French", courseId: "french", program: "Basic & A1 (Morning / Evening)", programId: "basic-a1-morning-evening", curriculum: null, validity: "11 Weeks / 150 Days", price: 7500 },
  { id: "french-basic-a1-all-timings", course: "French", courseId: "french", program: "Basic & A1 (All Timings)", programId: "basic-a1-all-timings", curriculum: null, validity: "11 Weeks / 150 Days", price: 9750 },
  { id: "french-basic-a1-a2-morning-evening", course: "French", courseId: "french", program: "Basic, A1 & A2 (Morning / Evening)", programId: "basic-a1-a2-morning-evening", curriculum: null, validity: "18 Weeks / 210 Days", price: 12000 },
  { id: "french-basic-a1-a2-all-timings", course: "French", courseId: "french", program: "Basic, A1 & A2 (All Timings)", programId: "basic-a1-a2-all-timings", curriculum: null, validity: "18 Weeks / 210 Days", price: 14250 },
  { id: "french-basic-a1-b2", course: "French", courseId: "french", program: "Basic, A1-B2", programId: "basic-a1-b2", curriculum: null, validity: "32 Weeks / 42 Weeks", price: 28750 },
  { id: "french-a2-b1-b2", course: "French", courseId: "french", program: "A2 / B1 / B2", programId: "a2-b1-b2", curriculum: null, validity: "7 Weeks / 180 Days", price: 9750 },

  // ── German ───────────────────────────────────────────────────────
  { id: "german-basic-a1", course: "German", courseId: "german", program: "Basic & A1", programId: "basic-a1", curriculum: null, validity: "11 Weeks / 150 Days", price: 7500 },
  { id: "german-basic-a1-a2", course: "German", courseId: "german", program: "Basic, A1 & A2", programId: "basic-a1-a2", curriculum: null, validity: "18 Weeks / 210 Days", price: 12000 },
  { id: "german-a2", course: "German", courseId: "german", program: "A2", programId: "a2", curriculum: null, validity: "7 Weeks / 180 Days", price: 9750 },

  // ── Spoken English ───────────────────────────────────────────────
  { id: "spoken-english-champion", course: "Spoken English", courseId: "spoken-english", program: "Champion", programId: "champion", curriculum: null, validity: "10 Weeks / 180 Days", price: 3000 },

  // ── Digital SAT ──────────────────────────────────────────────────
  { id: "digital-sat-live-class-self-prep", course: "Digital SAT", courseId: "digital-sat", program: "Live Class / Self Prep", programId: "live-class-self-prep", curriculum: null, validity: "12 Weeks / Self / 90 / 180 Days", price: 7500 },
  { id: "digital-sat-champion", course: "Digital SAT", courseId: "digital-sat", program: "Champion", programId: "champion", curriculum: null, validity: "12 Weeks / 180 Days", price: 13125 },

  // ── Shorter GRE ──────────────────────────────────────────────────
  { id: "shorter-gre-live-class-self-prep", course: "Shorter GRE", courseId: "shorter-gre", program: "Live Class / Self Prep", programId: "live-class-self-prep", curriculum: null, validity: "12 Weeks / Self / 90 / 180 Days", price: 7500 },
  { id: "shorter-gre-champion", course: "Shorter GRE", courseId: "shorter-gre", program: "Champion", programId: "champion", curriculum: null, validity: "12 Weeks / 180 Days", price: 13125 },

  // ── GMAT ─────────────────────────────────────────────────────────
  { id: "gmat-standard", course: "GMAT", courseId: "gmat", program: "Standard", programId: "standard", curriculum: null, validity: "8 Weeks / 90 Days", price: 13125 },
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** All price entries for a course (exact human-readable course name). */
export function getCoursePrices(course: string): CoursePrice[] {
  const key = normalize(course);
  return COURSE_PRICES.filter((entry) => normalize(entry.course) === key);
}

/** The price entry for a course + program, or undefined when not found. */
export function findCoursePrice(
  course: string,
  program: string,
): CoursePrice | undefined {
  const courseKey = normalize(course);
  const programKey = normalize(program);
  return COURSE_PRICES.find(
    (entry) =>
      normalize(entry.course) === courseKey &&
      normalize(entry.program) === programKey,
  );
}

/** Unique course names present in the price master. */
export function getCourseNames(): string[] {
  return Array.from(new Set(COURSE_PRICES.map((entry) => entry.course)));
}

/** Price entries grouped by course name. */
export function getCoursePriceGroups(): Record<string, CoursePrice[]> {
  const groups: Record<string, CoursePrice[]> = {};
  for (const entry of COURSE_PRICES) {
    (groups[entry.course] ??= []).push(entry);
  }
  return groups;
}

// ── Additive-field defaults and resolvers (PRICING-ARCH-W1) ───────
//
// These are the ONLY places the defaults for the optional registry
// fields are defined. Read them instead of reaching for `?? value`
// inline, so a future default change happens in exactly one place.

/** Default currency for rows that omit `currency`. */
export const DEFAULT_CURRENCY: string = CURRENCY;
/** Default GST state: prices exclude tax (no GST rate exists in this repo). */
export const DEFAULT_GST_INCLUDED = false;
/** Default lifecycle state: rows are active unless explicitly retired. */
export const DEFAULT_ACTIVE = true;

/** Resolved currency for a row (`"INR"` unless explicitly overridden). */
export function getProductCurrency(product: CoursePrice): string {
  return product.currency ?? DEFAULT_CURRENCY;
}

/** Resolved GST state for a row (false unless explicitly set to true). */
export function isGstIncluded(product: CoursePrice): boolean {
  return product.gstIncluded ?? DEFAULT_GST_INCLUDED;
}

/**
 * Is this row sellable on the given day?
 *
 * Deterministic: evaluates the optional `active` flag and the optional
 * `effectiveFrom` / `effectiveUntil` window (compared as `YYYY-MM-DD`
 * strings in UTC). Rows without a window are always in-window.
 */
export function isProductActive(
  product: CoursePrice,
  at: Date = new Date(),
): boolean {
  if ((product.active ?? DEFAULT_ACTIVE) === false) return false;
  const day = at.toISOString().slice(0, 10);
  if (product.effectiveFrom && day < product.effectiveFrom) return false;
  if (product.effectiveUntil && day > product.effectiveUntil) return false;
  return true;
}