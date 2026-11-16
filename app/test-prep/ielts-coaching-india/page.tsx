// FILE: app/test-prep/ielts-coaching-india/page.tsx
//
// India-wide IELTS overview and course-comparison page. It is deliberately
// distinct from /test-prep/ielts-online: this page explains the options and
// fees, while the online page is the primary live-class enrolment page.

import IELTSCoachingPage from "./IELTSCoachingIndiaClient";
import JsonLd from "@/components/JsonLd";
import { buildIeltsSchemaForPage } from "@/lib/seo/ielts-page-config";

const PAGE_NAME =
  "IELTS Coaching in India – Course Comparison & Fees | ANU Education";
const PAGE_DESCRIPTION =
  "Compare ANU Education's IELTS preparation options for students across India: a self-paced study pack and a live-class Champion pack, with transparent GST-inclusive pricing, mock tests and a 5-day free demo.";
const CANONICAL = "https://www.anuedu.in/test-prep/ielts-coaching-india";

export const metadata = {
  title: PAGE_NAME,
  description: PAGE_DESCRIPTION,
  keywords: [
    "IELTS coaching in India",
    "IELTS preparation courses India",
    "IELTS coaching fees India",
    "IELTS self preparation course",
    "IELTS live classes India",
    "IELTS Academic and General Training",
  ],
  openGraph: {
    title: "IELTS Coaching in India – Course Comparison & Fees",
    description:
      "Compare self-paced and live-class IELTS preparation options for students across India. Prices include GST.",
    url: CANONICAL,
    siteName: "ANU Education",
    type: "website",
  },
  alternates: {
    canonical: CANONICAL,
  },
};

export default function Page() {
  const graph = buildIeltsSchemaForPage("india", PAGE_NAME, PAGE_DESCRIPTION);

  return (
    <>
      <JsonLd data={graph} />
      <IELTSCoachingPage />
    </>
  );
}
