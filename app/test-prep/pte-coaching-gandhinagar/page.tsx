// FILE: app/test-prep/pte-coaching-gandhinagar/page.tsx

import PTEGandhinagarClient from "./PTEGandhinagarClient";
import JsonLd from "@/components/JsonLd";
import { faqs } from "@/lib/data/faq/pte-gandhinagar";

export const metadata = {
  title: "PTE Classes in Gandhinagar 2026 – Online PTE Coaching | ANU Education",
  description:
    "Best online PTE classes in Gandhinagar. ANU Education offers live PTE Academic coaching with 4 course packs, 14 mock tests, 180+ practice exercises, AI-based scoring, Saturday doubt sessions, and free demo. Score 65+ or 79+. Skill India certified.",
  keywords: [
    "PTE classes Gandhinagar",
    "PTE online classes Gandhinagar",
    "PTE coaching Gandhinagar",
    "best PTE coaching Gandhinagar",
    "online PTE preparation Gandhinagar",
    "PTE Academic online coaching India",
    "PTE coaching near me Gandhinagar",
    "PTE classes online India",
    "PTE mock tests online",
    "PTE score 79 coaching Gujarat",
  ],
  openGraph: {
    title: "PTE Classes in Gandhinagar 2026 – Online Coaching, 14 Mock Tests | ANU Education",
    description:
      "Live online PTE classes for Gandhinagar students. 4 course packs from ₹1,313. 14 mock tests, 180+ exercises, AI scoring, Saturday doubt sessions. Free 3-day demo.",
    url: "https://www.anuedu.in/test-prep/pte-coaching-gandhinagar",
    type: "website",
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/pte-coaching-gandhinagar",
  },
};

export default function PTEGandhinagarPage() {
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
            { "@type": "ListItem", position: 3, name: "PTE Coaching Gandhinagar", item: "https://www.anuedu.in/test-prep/pte-coaching-gandhinagar" },
          ],
        }}
      />
      <PTEGandhinagarClient />
    </>
  );
}
