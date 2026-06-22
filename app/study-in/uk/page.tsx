// FILE: app/study-in/uk/page.tsx

import StudyInUKClient from "./StudyInUKClient";

export const metadata = {
  title: "Study in UK 2026 for Indian Students | 1-Year Masters, Graduate Route Visa, B2 English | ANU Education",
  description:
    "Complete 2026 guide to study in UK: updated Graduate Route deadline (31 Dec 2026), new B2 English requirement (from 8 Jan 2026), visa fees (£558 + IHS), top universities, costs & scholarships. Free counselling + IELTS/PTE UKVI coaching with ANU Education.",
  keywords: [
    "study in UK 2026",
    "study in UK for Indian students",
    "UK student visa 2026",
    "UK Graduate Route visa",
    "masters in UK 1 year",
    "UK student visa B2 English requirement",
    "IELTS for UKVI",
    "UK universities for Indian students",
    "post study work visa UK",
    "study abroad consultant UK",
  ],
  openGraph: {
    title: "Study in UK 2026 – Graduate Route Deadline, B2 English Rules, Visa Costs | ANU Education",
    description:
      "Updated for 2026: Graduate Route 31 Dec deadline, new B2 English requirement, visa fee £558 + IHS £776/year. Free counselling, IELTS/PTE UKVI coaching, and 100% visa support.",
    url: "https://www.anuedu.in/study-in/uk",
    type: "website",
    images: [{ url: "https://www.anuedu.in/images/study-in-uk-og.jpg", width: 1200, height: 630, alt: "Study in UK with ANU Education" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Study in UK 2026 for Indian Students | ANU Education",
    description: "Updated 2026 guide: Graduate Route deadline, B2 English rules, visa costs, top universities.",
  },
  alternates: {
    canonical: "https://www.anuedu.in/study-in/uk",
  },
};

export default function StudyInUKPage() {
  return <StudyInUKClient />;
}