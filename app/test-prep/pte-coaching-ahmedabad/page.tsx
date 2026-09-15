import PTEAhmedabadClient from './PTEAhmedabadClient';
import JsonLd from "@/components/JsonLd";

export const metadata = {
  metadataBase: new URL('https://www.anuedu.in'),
  title: "Best PTE Coaching in Ahmedabad | Online Classes | ANU Education",
  description:
    "Looking for PTE coaching in Ahmedabad? Join ANU Education’s online PTE classes with expert trainers, mock tests & fast results. Book free demo today.",
  keywords:
    "PTE coaching Ahmedabad, best PTE classes Ahmedabad, online PTE preparation Ahmedabad, PTE mock tests Ahmedabad",
  openGraph: {
    title: "Best PTE Coaching in Ahmedabad – Online Classes for Fast Results",
    description:
      "Join expert online PTE coaching in Ahmedabad. Live classes, AI scoring, mock tests, flexible timing. Free 4‑day demo. Score 79+.",
    url: "https://www.anuedu.in/test-prep/pte-coaching-ahmedabad",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/pte-ahmedabad.jpg",
        width: 1200,
        height: 630,
        alt: "PTE Coaching in Ahmedabad",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PTE Coaching in Ahmedabad – Online Classes for Fast Results",
    description: "Live online PTE classes, AI mock tests, daily speaking practice. Free demo. Enroll now.",
    images: ["/images/pte-ahmedabad.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/pte-coaching-ahmedabad",
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
              name: "What is the minimum score required in PTE for study abroad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Most universities require 50–65 score depending on country and course.",
              },
            },
            {
              "@type": "Question",
              name: "How many attempts are allowed for PTE exam?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "There is no fixed limit. You can retake the exam after 5 days.",
              },
            },
            {
              "@type": "Question",
              name: "Can I prepare for PTE without coaching?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, but expert guidance helps you improve faster and avoid mistakes.",
              },
            },
            {
              "@type": "Question",
              name: "What is the validity of PTE score?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "PTE score is valid for 2 years from the exam date.",
              },
            },
            {
              "@type": "Question",
              name: "Do you provide flexible timings for working students?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, we offer flexible batches suitable for students and working professionals.",
              },
            },
            {
              "@type": "Question",
              name: "Is PTE accepted in Canada and UK?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, PTE is accepted by most universities in Canada, UK, and Australia.",
              },
            },
          ],
        }}
      />
      <PTEAhmedabadClient />
    </>
  );
}