// FILE: app/test-prep/gre/page.tsx
// This is a SERVER component for metadata + it renders the CLIENT component below.
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO USE:
//   1. Save this file at:  app/test-prep/gre/page.tsx
//   2. Save GREClient.tsx at: app/test-prep/gre/GREClient.tsx
//   3. Import and render <GREClient /> from this file (shown below).
// ─────────────────────────────────────────────────────────────────────────────

import GREClient from "./GREClient";

export const metadata = {
  title: "GRE Coaching Online India 2026 – Score 320+ | ANU Education",
  description:
    "Best online GRE coaching in India 2026. Expert-led live classes for Verbal, Quant & AWA. Free demo class, mock tests, AI scoring, and study abroad counselling. Join ANU Education — Skill India certified institute.",
  keywords: [
    "GRE coaching online India",
    "best GRE coaching 2026",
    "GRE preparation Gujarat",
    "GRE coaching Ahmedabad",
    "GRE online classes India",
    "score 320 GRE",
    "GRE verbal quant AWA coaching",
  ],
  openGraph: {
    title: "GRE Coaching Online India 2026 – Score 320+ | ANU Education",
    description:
      "Live online GRE coaching with expert trainers. Free demo · Mock tests · AWA feedback · Study abroad counselling. Enrol at ANU Education.",
    url: "https://www.anuedu.in/test-prep/gre",
    type: "website",
  },
};

export default function GREPage() {
  return <GREClient />;
}
