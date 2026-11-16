// FILE: lib/seo/ielts-schema.types.ts
//
// Input contracts for the IELTS structured-data builders.
//
// These types describe data the page already publishes. They carry no
// rating, review, availability, discount or guarantee field, so a caller
// cannot accidentally emit an unsupported claim through the schema layer.

export type IeltsOfferInput = {
  /** Stable marketing package id, used for traceability and tests. */
  packageId: string;
  /** Visible package name, e.g. "Champion — One Batch". */
  name: string;
  /** Final GST-inclusive amount in whole rupees, from the price master. */
  price: number;
  /** ISO 4217 code. The IELTS catalogue is INR only. */
  currency: string;
  /** Short visible description, e.g. the package subtitle. */
  description: string;
};

export type IeltsFaqInput = {
  q: string;
  a: string;
};

export type IeltsBreadcrumbInput = {
  name: string;
  /** Root-relative path, e.g. "/test-prep/ielts-online". */
  path: string;
};

export type IeltsPageSchemaInput = {
  /** Canonical root-relative path for the page. */
  path: string;
  /** Page title used in metadata and WebPage.name. */
  pageName: string;
  /** Page description used in metadata and WebPage.description. */
  pageDescription: string;
  courseName: string;
  courseDescription: string;
  educationalLevel: string;
  coursePrerequisites?: string;
  offers: readonly IeltsOfferInput[];
  breadcrumb: readonly IeltsBreadcrumbInput[];
  faqs?: readonly IeltsFaqInput[];
};
