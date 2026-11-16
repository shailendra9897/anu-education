// FILE: lib/seo/ielts-page-config.ts
//
// Per-page configuration for the IELTS structured-data graph.
//
// Prices are never written here. Each offer names an approved marketing
// package and the matching catalogue product id; the amount is read from
// lib/data/ielts-pricing.ts, which derives it from the price master.

import {
  getIeltsPackageById,
  type IeltsPackageId,
} from "@/lib/data/ielts-packages";
import { getIeltsCataloguePrice } from "@/lib/data/ielts-pricing";
import { faqs as indiaFaqs } from "@/lib/data/faq/ielts-india";
import { faqs as modasaFaqs } from "@/lib/data/faq/ielts-modasa";
import { faqs as gandhinagarFaqs } from "@/lib/data/faq/ielts-gandhinagar";
import { faqs as onlineFaqs } from "@/lib/data/faq/ielts-online";
import { FAQS as ahmedabadFaqs } from "@/lib/data/faq/ielts-ahmedabad";
import {
  buildIeltsPageGraph,
  IELTS_SITE_URL,
} from "./ielts-schema";
import type { IeltsOfferInput } from "./ielts-schema.types";

/** Marketing package -> authoritative catalogue product id. */
const PACKAGE_CATALOGUE_PRODUCT: Readonly<Record<IeltsPackageId, string>> =
  Object.freeze({
    "ielts-self-prep": "ielts-academic-self-prep",
    "ielts-champion-one-batch": "ielts-academic-champion-morning",
    "ielts-champion-all-timings": "ielts-academic-champion-all-timings",
  });

/** Build one Offer input from the marketing package and the price master. */
export function ieltsOfferFor(packageId: IeltsPackageId): IeltsOfferInput {
  const pkg = getIeltsPackageById(packageId);
  if (!pkg) {
    throw new Error(`Unknown IELTS marketing package \`${packageId}\`.`);
  }

  return {
    packageId,
    name: pkg.title,
    price: getIeltsCataloguePrice(PACKAGE_CATALOGUE_PRODUCT[packageId]),
    currency: "INR",
    description: pkg.subtitle,
  };
}

type IeltsSchemaPage = {
  path: string;
  courseName: string;
  courseDescription: string;
  educationalLevel: string;
  coursePrerequisites: string;
  offerPackageIds: readonly IeltsPackageId[];
  breadcrumb: readonly { name: string; path: string }[];
  faqs: readonly { q: string; a: string }[];
};

const TEST_PREP_CRUMB = { name: "Test Prep", path: "/test-prep" };
const HOME_CRUMB = { name: "Home", path: "/" };

export const IELTS_SCHEMA_PAGES = {
  online: {
    path: "/test-prep/ielts-online",
    courseName: "IELTS Online Coaching in India",
    courseDescription:
      "Online IELTS Academic and General Training preparation with live classes, 15 full-length timed mock tests, 60 sectional practice tests, grammar and vocabulary videos, and weekend test analysis and doubt-solving sessions.",
    educationalLevel: "Beginner to Advanced",
    coursePrerequisites:
      "Basic English literacy. A beginner batch is available for students starting from the fundamentals.",
    offerPackageIds: [
      "ielts-self-prep",
      "ielts-champion-one-batch",
      "ielts-champion-all-timings",
    ],
    breadcrumb: [
      HOME_CRUMB,
      TEST_PREP_CRUMB,
      { name: "IELTS Online Coaching", path: "/test-prep/ielts-online" },
    ],
    faqs: onlineFaqs,
  },
  india: {
    path: "/test-prep/ielts-coaching-india",
    courseName: "IELTS Coaching and Preparation Courses in India",
    courseDescription:
      "An overview of ANU Education's IELTS preparation options for students across India: a self-paced preparation pack and a live-class Champion pack, both delivered online with mock tests and mentor feedback.",
    educationalLevel: "Beginner to Advanced",
    coursePrerequisites:
      "Basic English literacy. Students can start with the self-paced pack or join a live beginner batch.",
    offerPackageIds: ["ielts-self-prep", "ielts-champion-one-batch"],
    breadcrumb: [
      HOME_CRUMB,
      TEST_PREP_CRUMB,
      { name: "IELTS Coaching in India", path: "/test-prep/ielts-coaching-india" },
    ],
    faqs: indiaFaqs,
  },
  modasa: {
    path: "/test-prep/ielts-coaching-modasa",
    courseName: "IELTS Coaching for Modasa Students",
    courseDescription:
      "Online IELTS Academic and General Training coaching for students in Modasa and the surrounding Aravalli and Sabarkantha towns, with live batches, 15 full-length mock tests, sectional practice and weekend analysis sessions.",
    educationalLevel: "Beginner to Advanced",
    coursePrerequisites:
      "No prior IELTS preparation is required. The beginner batch starts from the fundamentals.",
    offerPackageIds: [
      "ielts-self-prep",
      "ielts-champion-one-batch",
      "ielts-champion-all-timings",
    ],
    breadcrumb: [
      HOME_CRUMB,
      TEST_PREP_CRUMB,
      { name: "IELTS Coaching Modasa", path: "/test-prep/ielts-coaching-modasa" },
    ],
    faqs: modasaFaqs,
  },
  gandhinagar: {
    path: "/test-prep/ielts-coaching-gandhinagar",
    courseName: "IELTS Coaching for Gandhinagar Students",
    courseDescription:
      "Online IELTS Academic and General Training coaching for students across Gandhinagar, covering all four modules with full-length mock tests, speaking practice and study abroad counselling.",
    educationalLevel: "All levels",
    coursePrerequisites: "Basic English proficiency.",
    offerPackageIds: [
      "ielts-self-prep",
      "ielts-champion-one-batch",
      "ielts-champion-all-timings",
    ],
    breadcrumb: [
      HOME_CRUMB,
      TEST_PREP_CRUMB,
      {
        name: "IELTS Coaching Gandhinagar",
        path: "/test-prep/ielts-coaching-gandhinagar",
      },
    ],
    faqs: gandhinagarFaqs,
  },
  ahmedabad: {
    path: "/test-prep/ielts/ielts-coaching-ahmedabad",
    courseName: "IELTS Coaching for Ahmedabad Students",
    courseDescription:
      "Online IELTS Academic and General Training coaching for students across Ahmedabad, with live classes, speaking practice, full-length mock tests and a free demo.",
    educationalLevel: "Beginner to Advanced",
    coursePrerequisites:
      "No prior IELTS experience is needed. The free demo includes a diagnostic assessment.",
    offerPackageIds: [
      "ielts-self-prep",
      "ielts-champion-one-batch",
      "ielts-champion-all-timings",
    ],
    breadcrumb: [
      HOME_CRUMB,
      TEST_PREP_CRUMB,
      {
        name: "IELTS Coaching Ahmedabad",
        path: "/test-prep/ielts/ielts-coaching-ahmedabad",
      },
    ],
    faqs: ahmedabadFaqs,
  },
} as const satisfies Record<string, IeltsSchemaPage>;

export type IeltsSchemaPageKey = keyof typeof IELTS_SCHEMA_PAGES;

/**
 * Build the full server-rendered graph for one page.
 * Page metadata stays in the route file and is passed in here so the
 * WebPage node always matches the rendered title and description.
 */
export function buildIeltsSchemaForPage(
  key: IeltsSchemaPageKey,
  pageName: string,
  pageDescription: string,
): Record<string, unknown> {
  const page = IELTS_SCHEMA_PAGES[key];
  return buildIeltsPageGraph({
    path: page.path,
    pageName,
    pageDescription,
    courseName: page.courseName,
    courseDescription: page.courseDescription,
    educationalLevel: page.educationalLevel,
    coursePrerequisites: page.coursePrerequisites,
    offers: page.offerPackageIds.map((id) => ieltsOfferFor(id)),
    breadcrumb: page.breadcrumb,
    faqs: page.faqs,
  });
}

/** Canonical absolute URL for a schema page. */
export function ieltsCanonicalUrl(key: IeltsSchemaPageKey): string {
  return new URL(IELTS_SCHEMA_PAGES[key].path, IELTS_SITE_URL).toString();
}
