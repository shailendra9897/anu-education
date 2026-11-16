// FILE: app/test-prep/ielts-coaching-modasa/page.tsx

import IELTSModasaClient from "./IELTSModasaClient";
import JsonLd from "@/components/JsonLd";
import { buildIeltsSchemaForPage } from "@/lib/seo/ielts-page-config";

const PAGE_NAME =
  "IELTS Coaching in Modasa – Online Live Batches & Mock Tests | ANU Education";
const PAGE_DESCRIPTION =
  "Online IELTS Academic and General Training coaching for students in Modasa and across Aravalli and nearby districts: live batches, 15 full-length mock tests, sectional practice, weekend analysis and a 5-day free trial.";
const CANONICAL = "https://www.anuedu.in/test-prep/ielts-coaching-modasa";

export const metadata = {
  title: PAGE_NAME,
  description: PAGE_DESCRIPTION,
  keywords: [
    "IELTS coaching in Modasa",
    "IELTS coaching Modasa Gujarat",
    "IELTS classes Modasa",
    "IELTS coaching near me Modasa",
    "IELTS online coaching Modasa",
    "IELTS coaching Himmatnagar",
    "IELTS coaching Idar",
    "IELTS Academic coaching Modasa",
    "ANU Education Modasa",
  ],
  openGraph: {
    title: "IELTS Coaching in Modasa – Online Live Batches & Mock Tests",
    description:
      "Online IELTS coaching for Modasa and Aravalli district students: live batches, 15 mock tests, weekend analysis and a 5-day free trial. Prices include GST.",
    url: CANONICAL,
    siteName: "ANU Education",
    type: "website",
  },
  alternates: {
    canonical: CANONICAL,
  },
};

export default function IELTSModasaPage() {
  const graph = buildIeltsSchemaForPage("modasa", PAGE_NAME, PAGE_DESCRIPTION);

  return (
    <>
      <JsonLd data={graph} />
      <IELTSModasaClient />
    </>
  );
}
