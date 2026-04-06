import CanadaClient from './CanadaClient';

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
  return <CanadaClient />;
}