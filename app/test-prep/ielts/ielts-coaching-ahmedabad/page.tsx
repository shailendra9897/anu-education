// FILE: app/test-prep/ielts/ielts-coaching-ahmedabad/page.tsx

import IELTSAhmedabadClient from "./IELTSAhmedabadClient";
import JsonLd from "@/components/JsonLd";
import { buildIeltsSchemaForPage } from "@/lib/seo/ielts-page-config";

const PAGE_NAME =
  "IELTS Coaching in Ahmedabad – Online Classes & Free Demo | ANU Education";
const PAGE_DESCRIPTION =
  "Online IELTS coaching for Ahmedabad students with live classes, daily speaking practice, mock tests and a free 5-day demo. Covers IELTS Academic and General Training.";
const CANONICAL =
  "https://www.anuedu.in/test-prep/ielts/ielts-coaching-ahmedabad";

export const metadata = {
  title: PAGE_NAME,
  description: PAGE_DESCRIPTION,
  keywords: [
    "IELTS coaching Ahmedabad",
    "IELTS classes Ahmedabad",
    "online IELTS preparation Ahmedabad",
    "IELTS mock tests Ahmedabad",
    "IELTS coaching Satellite Ahmedabad",
    "IELTS coaching Maninagar",
    "IELTS coaching Navrangpura",
    "IELTS coaching Bopal",
    "IELTS Canada PR Ahmedabad",
    "IELTS coaching for nurses Ahmedabad",
  ],
  openGraph: {
    title: "IELTS Coaching in Ahmedabad – Online Classes & Free Demo",
    description:
      "Expert online IELTS training for Ahmedabad students. Live classes, speaking practice, mock tests and a free 5-day demo.",
    url: CANONICAL,
    siteName: "ANU Education",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Coaching in Ahmedabad – Online Classes & Free Demo",
    description:
      "Live online IELTS classes, speaking practice and mock tests. Free demo available.",
  },
  alternates: {
    canonical: CANONICAL,
  },
};

export default function IELTSAhmedabadPage() {
  const graph = buildIeltsSchemaForPage(
    "ahmedabad",
    PAGE_NAME,
    PAGE_DESCRIPTION,
  );

  return (
    <>
      <JsonLd data={graph} />
      <IELTSAhmedabadClient />
    </>
  );
}
