import TestPrepClient from './TestPrepClient';

export const metadata = {
  metadataBase: new URL('https://www.anuedu.in'),
  title: "Test Preparation Courses | IELTS, PTE, German & More – ANU Education",
  description:
    "Explore IELTS, PTE, German, GRE, GMAT, SAT, TOEFL, Duolingo test prep courses. Live classes, mock tests, expert trainers. Free demo available.",
  keywords:
    "IELTS coaching, PTE coaching, German classes, GRE coaching, GMAT coaching, SAT coaching, TOEFL coaching, Duolingo test",
  openGraph: {
    title: "Test Preparation Courses | IELTS, PTE, German & More – ANU Education",
    description:
      "Expert-led test prep for study abroad. IELTS, PTE, German, GRE, GMAT, SAT, TOEFL, Duolingo. Free demo & counselling.",
    url: "https://www.anuedu.in/test-prep",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/test-prep-og.jpg",
        width: 1200,
        height: 630,
        alt: "Test Preparation Courses",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Test Preparation Courses | ANU Education",
    description: "IELTS, PTE, German, GRE, GMAT, SAT, TOEFL, Duolingo – live classes, mock tests, expert trainers.",
    images: ["/images/test-prep-og.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep",
  },
};

export default function Page() {
  return <TestPrepClient />;
}