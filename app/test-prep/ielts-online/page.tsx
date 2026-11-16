// FILE: app/test-prep/ielts-online/page.tsx
//
// Primary commercial IELTS landing page (online coaching across India).
// Structured data is built server-side from the price master and rendered
// by <JsonLd>, so Googlebot and AI crawlers receive it in the HTML.

import IELTSOnlineClient from "./IELTSOnlineClient";
import JsonLd from "@/components/JsonLd";
import { buildIeltsSchemaForPage } from "@/lib/seo/ielts-page-config";

const PAGE_NAME =
  "Online IELTS Coaching in India – Live Classes & Mock Tests | ANU Education";
const PAGE_DESCRIPTION =
  "Online IELTS coaching in India with live classes, 15 full-length mock tests, 60 practice tests, speaking practice and a 5-day free trial. Self-preparation and live Champion packs with GST-inclusive prices.";
const CANONICAL = "https://www.anuedu.in/test-prep/ielts-online";

export const metadata = {
  title: PAGE_NAME,
  description: PAGE_DESCRIPTION,
  keywords: [
    "IELTS online coaching in India",
    "IELTS online classes",
    "IELTS online preparation",
    "IELTS self preparation",
    "IELTS online coaching fees",
    "IELTS live classes online",
    "IELTS mock tests online India",
    "IELTS Academic coaching online",
    "IELTS General Training coaching online",
  ],
  openGraph: {
    title: "IELTS Online Coaching in India – Live Classes & Mock Tests",
    description:
      "Live online IELTS classes, 15 full-length mock tests, weekend analysis sessions and a 5-day free trial. Prices include GST.",
    url: CANONICAL,
    siteName: "ANU Education",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Online Coaching in India – Live Classes & Mock Tests",
    description:
      "Live online IELTS classes, full-length mock tests and a 5-day free trial.",
  },
  alternates: {
    canonical: CANONICAL,
  },
};

export default function IELTSOnlinePage() {
  const graph = buildIeltsSchemaForPage("online", PAGE_NAME, PAGE_DESCRIPTION);

  return (
    <>
      <JsonLd data={graph} />
      <IELTSOnlineClient />
    </>
  );
}
