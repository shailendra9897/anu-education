import PTECoachingPage from './PTECoachingIndiaClient';
import JsonLd from "@/components/JsonLd";

export const metadata = {
  title: "PTE Coaching in India | Online & Live Classes | ANU Education",
  description:
    "PTE coaching in India with online classes, AI-based mock tests, and expert trainers. Score 65+ with guided preparation at ANU Education.",
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/pte-coaching-india",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Which is the best PTE online coaching in India?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The best coaching offers expert trainers, AI mock tests, and personalized feedback. Always check reviews and demo classes before joining."
              }
            },
            {
              "@type": "Question",
              "name": "How long does it take to prepare for PTE?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most students prepare in 2–4 weeks with proper PTE course online and daily practice."
              }
            },
            {
              "@type": "Question",
              "name": "Is PTE easier than IELTS?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "PTE is considered easier by many because of AI-based scoring, faster results, and predictable format."
              }
            },
            {
              "@type": "Question",
              "name": "Can I prepare for PTE at home?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! With PTE academic online coaching, you can easily prepare from home with structured guidance."
              }
            },
            {
              "@type": "Question",
              "name": "What score is required for PTE?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Generally: 50–58 for Diploma, 58–65 for Bachelor, 65+ for Master / PR applications."
              }
            }
          ]
        }}
      />
      <PTECoachingPage />
    </>
  );
}