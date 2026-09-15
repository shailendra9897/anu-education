import CanadaClient from './CanadaClient';
import JsonLd from "@/components/JsonLd";

export const metadata = {
  title: "Study in Canada 2026 for Indian Students | PGWP, PR & Free Counseling – ANU Education",
  description:
    "Complete guide to study in Canada for Indian students: top universities, PGWP up to 3 years, intakes, visa process, and PR pathways. Book free expert counseling with ANU Education.",
  keywords:
    "study in Canada, Canada student visa, PGWP Canada, Canada PR, Canadian universities, study abroad Canada, Canada intakes 2026",
  openGraph: {
    title: "Study in Canada 2026 for Indian Students | ANU Education",
    description:
      "World-class education, post‑graduation work permit (PGWP) up to 3 years, and permanent residency pathways. Free counseling with 95%+ visa success rate.",
    url: "https://www.anuedu.in/study-in/canada",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/study-in-canada.jpg",
        width: 1200,
        height: 630,
        alt: "Study in Canada 2026",
      },
    ],
    locale: "en_IN",
    type: "website",
    publishedTime: "2026-04-06",
    modifiedTime: "2026-04-06",
  },
  twitter: {
    card: "summary_large_image",
    title: "Study in Canada for Indian Students – Complete Guide 2026",
    description:
      "Top universities, PGWP, intakes, visa & PR. Free expert counseling by ANU Education.",
    images: ["/images/study-in-canada.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/study-in/canada",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How much does it cost to study in Canada for Indian students?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Tuition fees range from CAD 15,000–38,000 per year (₹10–25 lakhs). Living costs average CAD 10,000–15,000 per year. Many universities offer scholarships for Indian students.",
              },
            },
            {
              "@type": "Question",
              name: "What is PGWP in Canada?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The Post‑Graduation Work Permit (PGWP) allows students to work for up to 3 years after completing their studies. This is a major pathway to Canadian Permanent Residency.",
              },
            },
            {
              "@type": "Question",
              name: "What are the main intakes in Canada?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The main intakes are September (Fall) – the largest intake, January (Winter) – second major, and May (Summer) – limited programs. We recommend applying 8–12 months in advance.",
              },
            },
            {
              "@type": "Question",
              name: "Is IELTS required for Canada student visa?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, most universities require IELTS 6.0–6.5 overall (no band less than 5.5). PTE, TOEFL, and Duolingo are also accepted by many institutions.",
              },
            },
            {
              "@type": "Question",
              name: "What is the Canada student visa success rate?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "With proper documentation and financial proof, the success rate is high (90%+). ANU Education has a 95%+ visa success rate for genuine students.",
              },
            },
            {
              "@type": "Question",
              name: "Can I get PR after studying in Canada?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, after completing a 2‑year program and 1 year of skilled work experience, you can apply for Permanent Residency through Express Entry or Provincial Nominee Programs (PNP).",
              },
            },
          ],
        }}
      />
      <CanadaClient />
    </>
  );
}