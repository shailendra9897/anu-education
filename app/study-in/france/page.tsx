// FILE: app/study-in/france/page.tsx

import StudyInFranceClient from "./StudyInFranceClient";
import JsonLd from "@/components/JsonLd";
import { faqs } from "@/lib/data/faq/france";

export const metadata = {
  title: "Study in France 2026 – France Study Abroad Consultant for Indian Students | ANU Education",
  description:
    "ANU Education is a trusted France study abroad consultant for Indian students. Get free guidance on top universities in France, student visa, fees, scholarships, and French language coaching. Free 5-day French demo class included.",
  keywords: [
    "France study abroad consultant",
    "study in France for Indian students",
    "study abroad in France",
    "France student visa from India",
    "study in France 2026",
    "France education consultant India",
    "best universities in France",
    "study in France fees for Indian students",
    "France scholarship for Indian students",
    "French language course for study abroad",
    "study in Paris India",
    "France study visa consultant Gujarat",
  ],
  openGraph: {
    title: "Study in France 2026 – Trusted France Study Abroad Consultant | ANU Education",
    description:
      "Free guidance on studying in France — top universities, visa process, fees, scholarships + free 5-day French language demo. Skill India certified consultants.",
    url: "https://www.anuedu.in/study-in/france",
    type: "website",
  },
};

export default function StudyInFrancePage() {
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
      <StudyInFranceClient />
    </>
  );
}
