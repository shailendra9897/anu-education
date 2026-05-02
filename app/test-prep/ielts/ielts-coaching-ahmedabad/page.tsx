import IELTSAhmedabadClient from './IELTSAhmedabadClient';

export const metadata = {
  metadataBase: new URL('https://www.anuedu.in'),
  title: "Best IELTS Coaching in Ahmedabad (Free 4-Day Demo Classes) | ANU Education",
  description:
    "Looking for IELTS coaching in Ahmedabad? Join ANU Education’s expert-led online IELTS classes with mock tests, speaking practice & free 4-day demo.",
  keywords:
    "IELTS coaching Ahmedabad, best IELTS classes Ahmedabad, online IELTS preparation Ahmedabad, IELTS mock tests Ahmedabad",
  openGraph: {
    title: "Best IELTS Coaching in Ahmedabad – Online Classes with Free 4-Day Demo",
    description:
      "Expert online IELTS training for Ahmedabad students. Live classes, speaking practice, mock tests, free 4‑day demo. Achieve Band 6.5+.",
    url: "https://www.anuedu.in/test-prep/ielts-coaching-ahmedabad",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/ielts-ahmedabad.jpg",
        width: 1200,
        height: 630,
        alt: "IELTS Coaching in Ahmedabad",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Coaching in Ahmedabad – Free 4-Day Demo",
    description: "Live online IELTS classes, speaking practice, mock tests. Free demo. Enroll now.",
    images: ["/images/ielts-ahmedabad.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/ielts-coaching-ahmedabad",
  },
};

export default function Page() {
  return <IELTSAhmedabadClient />;
}