import IELTSBandCalculatorClient from './IELTSBandCalculatorClient';

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
  return <IELTSBandCalculatorClient />;
}