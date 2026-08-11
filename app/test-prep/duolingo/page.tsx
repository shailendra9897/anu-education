// FILE: app/test-prep/duolingo/page.tsx

import DuolingoClient from "./DuolingoClient";

export const metadata = {
  title: "Duolingo English Test Coaching Online India 2026 – Score 120+ | ANU Education",
  description:
    "Best Duolingo English Test (DET) coaching online in India at just ₹1,999. Live classes Mon–Fri 7–8 PM, 12 mock tests, 300+ grammar videos, Saturday grammar batch. Accepted by 5,500+ universities worldwide. Skill India certified. Free demo class.",
  keywords: [
    "Duolingo English Test coaching India",
    "Duolingo coaching online India",
    "DET preparation course India",
    "Duolingo test preparation",
    "Duolingo coaching Gujarat",
    "Duolingo online classes India",
    "Duolingo exam preparation 2026",
    "Duolingo coaching Ahmedabad",
    "Duolingo mock tests online",
    "Duolingo score 120 coaching",
  ],
  openGraph: {
    title: "Duolingo Coaching Online India 2026 – ₹1,999 Only | ANU Education",
    description:
      "Duolingo English Test coaching at ₹1,999 (regular ₹5,000). Live classes, 12 mock tests, 300+ videos, free demo. Accepted by 5,500+ universities. Skill India certified.",
    url: "https://www.anuedu.in/test-prep/duolingo",
    type: "website",
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/duolingo",
  },
};

export default function DuolingoPage() {
  return <DuolingoClient />;
}