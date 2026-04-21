import PTEGandhinagarClient from './PTEGandhinagarClient';

export const metadata = {
  metadataBase: new URL('https://www.anuedu.in'),
  title: "Best PTE Coaching in Gandhinagar – Online Classes for Fast Score | ANU Education",
  description:
    "Join online PTE coaching in Gandhinagar with AI‑based scoring, daily speaking sessions, full mock tests, and flexible timing. Free 4‑day demo. Score 79+.",
  keywords:
    "PTE coaching Gandhinagar, best PTE classes Gandhinagar, online PTE preparation Gandhinagar, PTE mock tests Gandhinagar",
  openGraph: {
    title: "Best PTE Coaching in Gandhinagar – Online Classes for Fast Score | ANU Education",
    description:
      "Expert online PTE training for Gandhinagar students. Live classes, AI scoring, mock tests, free demo. Achieve 65+ or 79+ fast.",
    url: "https://www.anuedu.in/test-prep/pte-coaching-gandhinagar",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/pte-gandhinagar.jpg",
        width: 1200,
        height: 630,
        alt: "PTE Coaching in Gandhinagar",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PTE Coaching in Gandhinagar – Online Classes for Fast Score",
    description: "Live online classes, AI mock tests, daily speaking practice. Free 4‑day demo. Enroll now.",
    images: ["/images/pte-gandhinagar.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/pte-coaching-gandhinagar",
  },
};

export default function Page() {
  return <PTEGandhinagarClient />;
}