// FILE: lib/seo/ielts-schema.ts
//
// Server-side structured-data builders for the five IELTS landing pages.
//
// ─────────────────────────────────────────────────────────────────
// SCOPE RULES (do not weaken):
//   1. Every price arrives from the caller, which reads it from
//      lib/data/ielts-pricing.ts (the authoritative price master).
//      This module holds no price, currency or discount literal.
//   2. No AggregateRating, Review, availability, validFrom,
//      priceValidUntil, startDate, geo or openingHours is emitted.
//      None of those values is supplied by the registry or verified by
//      the business, so none may be defaulted.
//   3. One Course entity per page. Multiple payment packages are
//      modelled as multiple Offer values on that single Course, never
//      as separate Course entities.
//   4. The graph is plain JSON. It is rendered by components/JsonLd.tsx,
//      which escapes HTML-significant characters before serialising.
// ─────────────────────────────────────────────────────────────────

import type {
  IeltsFaqInput,
  IeltsOfferInput,
  IeltsPageSchemaInput,
} from "./ielts-schema.types";

export const IELTS_SITE_URL = "https://www.anuedu.in";

export const IELTS_ORGANIZATION_ID = `${IELTS_SITE_URL}/#organization`;

export const IELTS_WEBSITE_ID = `${IELTS_SITE_URL}/#website`;

/**
 * Verified, already-published organisation facts.
 *
 * The address is the Modasa office address published in the site's own
 * contact and FAQ content. No geo coordinates or opening hours are
 * included because neither has been verified for structured data.
 */
export const IELTS_ORGANIZATION = Object.freeze({
  "@type": "EducationalOrganization",
  "@id": IELTS_ORGANIZATION_ID,
  name: "ANU Education",
  url: IELTS_SITE_URL,
  logo: `${IELTS_SITE_URL}/logo.png`,
  email: "info@anuedu.in",
  telephone: "+917016497087",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Krishna 137, Dwarkapuri Bunglows, Gitanjali Society",
    addressLocality: "Modasa",
    addressRegion: "Gujarat",
    postalCode: "383315",
    addressCountry: "IN",
  },
});

function absoluteUrl(path: string): string {
  return new URL(path, IELTS_SITE_URL).toString();
}

function offerNode(
  offer: IeltsOfferInput,
  pageUrl: string,
): Record<string, unknown> {
  if (!Number.isInteger(offer.price) || offer.price <= 0) {
    throw new Error(
      `IELTS offer "${offer.packageId}" must carry a positive whole-rupee ` +
        `price from the price master, got ${String(offer.price)}.`,
    );
  }
  if (offer.currency !== "INR") {
    throw new Error(
      `IELTS offer "${offer.packageId}" must be priced in INR, got ` +
        `${JSON.stringify(offer.currency)}.`,
    );
  }

  return {
    "@type": "Offer",
    name: offer.name,
    description: offer.description,
    price: offer.price,
    priceCurrency: offer.currency,
    url: pageUrl,
  };
}

function faqNode(
  faqs: readonly IeltsFaqInput[],
  faqId: string,
): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    "@id": faqId,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

/**
 * Build one `@graph` document for an IELTS page.
 *
 * Entities: EducationalOrganization, WebSite, WebPage, BreadcrumbList,
 * one Course with its Offer list, and an optional FAQPage built from the
 * same data the page renders.
 */
export function buildIeltsPageGraph(
  input: IeltsPageSchemaInput,
): Record<string, unknown> {
  const pageUrl = absoluteUrl(input.path);
  const webPageId = `${pageUrl}#webpage`;
  const courseId = `${pageUrl}#course`;
  const breadcrumbId = `${pageUrl}#breadcrumb`;
  const faqId = `${pageUrl}#faq`;

  const graph: Record<string, unknown>[] = [
    IELTS_ORGANIZATION,
    {
      "@type": "WebSite",
      "@id": IELTS_WEBSITE_ID,
      url: IELTS_SITE_URL,
      name: "ANU Education",
      inLanguage: "en-IN",
      publisher: { "@id": IELTS_ORGANIZATION_ID },
    },
    {
      "@type": "WebPage",
      "@id": webPageId,
      url: pageUrl,
      name: input.pageName,
      description: input.pageDescription,
      inLanguage: "en-IN",
      isPartOf: { "@id": IELTS_WEBSITE_ID },
      about: { "@id": courseId },
      breadcrumb: { "@id": breadcrumbId },
      ...(input.faqs && input.faqs.length > 0
        ? { hasPart: { "@id": faqId } }
        : {}),
    },
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: input.breadcrumb.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    },
    {
      "@type": "Course",
      "@id": courseId,
      name: input.courseName,
      description: input.courseDescription,
      url: pageUrl,
      provider: { "@id": IELTS_ORGANIZATION_ID },
      inLanguage: "en",
      educationalLevel: input.educationalLevel,
      ...(input.coursePrerequisites
        ? { coursePrerequisites: input.coursePrerequisites }
        : {}),
      about: {
        "@type": "Thing",
        name: "International English Language Testing System",
        sameAs: "https://en.wikipedia.org/wiki/IELTS",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "Online",
        location: { "@type": "VirtualLocation", url: pageUrl },
      },
      offers: input.offers.map((offer) => offerNode(offer, pageUrl)),
    },
  ];

  if (input.faqs && input.faqs.length > 0) {
    graph.push(faqNode(input.faqs, faqId));
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
