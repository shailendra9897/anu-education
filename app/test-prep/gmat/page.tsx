// FILE: app/test-prep/gmat/page.tsx

import GMATClient from "./GMATClient";

export const metadata = {
  title: "GMAT Coaching 2026 – Focus Edition Prep, Live Classes & Mock Tests | ANU Education",
  description:
    "GMAT Focus Edition coaching for MBA aspirants. Live classes for Quant, Verbal & Data Insights, adaptive mock tests, section-wise strategy, and free demo. Score 705+. Skill India certified.",
  keywords: [
    "GMAT coaching 2026",
    "GMAT Focus Edition coaching",
    "GMAT preparation India",
    "GMAT coaching online",
    "GMAT classes for MBA",
    "GMAT mock tests online",
    "GMAT coaching Gujarat",
    "GMAT Data Insights coaching",
    "GMAT score 705",
    "best GMAT coaching India",
  ],
  openGraph: {
    title: "GMAT Coaching 2026 – Focus Edition Live Classes & Mock Tests | ANU Education",
    description:
      "Live GMAT Focus Edition coaching — Quant, Verbal, Data Insights. Adaptive mock tests, free demo class. Score 705+ for top MBA programs.",
    url: "https://www.anuedu.in/test-prep/gmat",
    type: "website",
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/gmat",
  },
};

export default function GMATPage() {
  return <GMATClient />;
}
