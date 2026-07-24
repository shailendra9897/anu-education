// app/assessment/study-abroad-readiness/page.tsx

import type { Metadata } from "next";
import AssessmentClient from "./AssessmentClient";

const pageUrl =
  "https://www.anuedu.in/assessment/study-abroad-readiness";

export const metadata: Metadata = {
  title: "Free Study Abroad Readiness Assessment | ANU Education",

  description:
    "Take the free Study Abroad Readiness Assessment by ANU Education. Get your readiness score, personalised country recommendations, strengths, areas to improve, and study abroad roadmap.",

  keywords: [
    "study abroad readiness assessment",
    "study abroad assessment",
    "study abroad eligibility test",
    "study abroad eligibility checker",
    "study abroad profile evaluation",
    "study abroad quiz",
    "best country to study abroad",
    "study abroad counselling",
    "ANU Education",
  ],

  alternates: {
    canonical: pageUrl,
  },

  openGraph: {
    title: "Free Study Abroad Readiness Assessment | ANU Education",
    description:
      "Discover how ready you are to study abroad. Get your personalised score, country matches and next-step roadmap.",
    url: pageUrl,
    siteName: "ANU Education",
    type: "website",
    images: [
      {
        url: "https://www.anuedu.in/images/assessment-og.jpg",
        width: 1200,
        height: 630,
        alt: "ANU Study Abroad Readiness Assessment",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Free Study Abroad Readiness Assessment | ANU Education",
    description:
      "Get your personalised study abroad readiness score, country matches and roadmap.",
    images: [
      "https://www.anuedu.in/images/assessment-og.jpg",
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function Page() {
  return <AssessmentClient />;
}