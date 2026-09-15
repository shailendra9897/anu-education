import IELTSBandCalculatorClient from './IELTSBandCalculatorClient';
import JsonLd from "@/components/JsonLd";

export const metadata = {
  title: "IELTS Band Score Calculator (Academic & General) | ANU Education",
  description:
    "Free IELTS Band Calculator for Academic & General Training. Calculate your overall IELTS score instantly and explore UK, Germany & Canada study options.",
  keywords:
    "IELTS band calculator, IELTS score calculator, IELTS overall band, academic IELTS, general training IELTS",
  openGraph: {
    title: "IELTS Band Score Calculator – Academic & General | ANU Education",
    description:
      "Instant IELTS overall band estimation. Understand your score for UK, Germany, Canada. Free demo available.",
    url: "https://www.anuedu.in/tools/ielts-band-calculator",
    siteName: "ANU Education",
    type: "website",
    images: [
      {
        url: "/images/ielts-calculator-og.jpg",
        width: 1200,
        height: 630,
        alt: "IELTS Band Score Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Band Score Calculator",
    description: "Estimate your IELTS overall band for Academic or General Training.",
    images: ["/images/ielts-calculator-og.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/tools/ielts-band-calculator",
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
              name: "How is IELTS overall band calculated?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The IELTS overall band score is calculated by averaging Listening, Reading, Writing, and Speaking scores and rounding to the nearest 0.5 or whole band.",
              },
            },
            {
              "@type": "Question",
              name: "Is Band 6 enough for UK study?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, many UK universities accept IELTS Band 6 or 6.5 depending on the course and university.",
              },
            },
            {
              "@type": "Question",
              name: "What IELTS score is required for Canada?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Most Canadian colleges and universities prefer IELTS scores between 6 and 7 bands.",
              },
            },
          ],
        }}
      />
      <IELTSBandCalculatorClient />
    </>
  );
}