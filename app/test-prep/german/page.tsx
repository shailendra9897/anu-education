import GermanClient from './GermanClient';

export const metadata = {
  metadataBase: new URL('https://www.anuedu.in'),
  title: "Learn German Online – A1 to B2 | Free 3‑Day Demo | ANU Education",
  description:
    "Best online German classes for students in Ahmedabad, Vadodara, Surat. CEFR‑aligned A1‑B2, live interactive sessions, Goethe certification prep. Free 3‑day demo available.",
  keywords:
    "learn German, German classes online, German language course, Goethe exam preparation, German for study in Germany",
  openGraph: {
    title: "Learn German with ANU Education – Gujarat’s Top Choice",
    description:
      "CEFR‑aligned A1‑B2, live online classes, free 3‑day demo. Tailored for students & professionals in Gujarat. Start your German journey today.",
    url: "https://www.anuedu.in/test-prep/german",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/german-course.jpg",
        width: 1200,
        height: 630,
        alt: "Learn German Online",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn German A1‑B2 | Free 3‑Day Demo | ANU Education",
    description: "Live online German classes for Gujarat students. Goethe exam prep, flexible timings.",
    images: ["/images/german-course.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/german",
  },
};

export default function Page() {
  return <GermanClient />;
}