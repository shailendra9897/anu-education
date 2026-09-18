// FILE: app/test-prep/ielts-coaching-modasa/page.tsx

import IELTSModasaClient from "./IELTSModasaClient";
import JsonLd from "@/components/JsonLd";
import { faqs } from "@/lib/data/faq/ielts-modasa";

export const metadata = {
  title: "IELTS Coaching in Modasa 2026 – Best Institute, Live Classes & Mock Tests | ANU Education",
  description:
    "Best IELTS coaching in Modasa, Gujarat. ANU Education offers live IELTS Academic & General Training classes, 15 full-length mock tests, speaking practice, Saturday analysis, Sunday doubt sessions, and free demo. Trusted by students from Modasa, Himmatnagar, Idar, Shamlaji & Bayad.",
  keywords: [
    "IELTS coaching in Modasa",
    "IELTS coaching Modasa Gujarat",
    "best IELTS institute Modasa",
    "IELTS classes Modasa",
    "IELTS coaching near me Modasa",
    "IELTS training Modasa",
    "IELTS online coaching Modasa",
    "IELTS coaching Himmatnagar",
    "IELTS coaching Idar",
    "IELTS Academic coaching Modasa",
    "ANU Education Modasa",
    "IELTS band 7 Modasa",
  ],
  openGraph: {
    title: "IELTS Coaching in Modasa 2026 – Live Classes, Mock Tests & Free Demo | ANU Education",
    description:
      "ANU Education Modasa: Expert IELTS coaching, live batches, 15 mock tests, speaking practice, Saturday test analysis, Sunday doubt sessions. Free 5-day trial.",
    url: "https://www.anuedu.in/test-prep/ielts-coaching-modasa",
    type: "website",
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/ielts-coaching-modasa",
  },
};

export default function IELTSModasaPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
            { "@type": "ListItem", position: 2, name: "Test Prep", item: "https://www.anuedu.in/test-prep" },
            { "@type": "ListItem", position: 3, name: "IELTS Coaching Modasa", item: "https://www.anuedu.in/test-prep/ielts-coaching-modasa" },
          ],
        }}
      />
      <IELTSModasaClient />
    </>
  );
}
