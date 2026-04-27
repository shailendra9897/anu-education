import PTEAhmedabadClient from './PTEAhmedabadClient';

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
  return <PTEAhmedabadClient />;
}