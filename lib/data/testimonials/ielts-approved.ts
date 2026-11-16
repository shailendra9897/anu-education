// FILE: lib/data/testimonials/ielts-approved.ts
//
// The only testimonials that may be rendered on the IELTS pages.
//
// A testimonial enters this list only when the business has supplied:
//   - the student's written consent to publish their name and words, and
//   - a reference to the stored evidence (score report, message thread or
//     signed release) that can be produced on request.
//
// The list is intentionally EMPTY. Do not add a testimonial to make a page
// look busier: an empty list renders nothing, which is the correct state
// until consent and evidence exist. Historical, unverified testimonial copy
// is preserved in ./ielts-unverified-archive.ts for later review.

export type ApprovedIeltsTestimonial = {
  /** Stable id used as the React key. */
  id: string;
  /** Name as the student consented to publish it. */
  name: string;
  /** Optional city, only if the student consented to it. */
  city?: string;
  /** Course the student took, e.g. "IELTS Academic". */
  course: string;
  /** Optional reported band score, only if a score report is on file. */
  bandScore?: string;
  /** The student's words, quoted verbatim. */
  quote: string;
  /** Must be true before the component renders the entry. */
  consentVerified: boolean;
  /** Where the consent and score evidence is stored. */
  evidenceReference: string;
};

export const IELTS_APPROVED_TESTIMONIALS: readonly ApprovedIeltsTestimonial[] =
  Object.freeze([]);

/** True only when an entry has consent and an evidence reference on file. */
export function isPublishableIeltsTestimonial(
  testimonial: ApprovedIeltsTestimonial,
): boolean {
  return (
    testimonial.consentVerified === true &&
    testimonial.evidenceReference.trim().length > 0 &&
    testimonial.quote.trim().length > 0
  );
}
