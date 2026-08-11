import OnlineGermanAhmedabadClient from './AhmedabadClient';

export const metadata = {
  metadataBase: new URL('https://www.anuedu.in'),
  title: "Online German Classes in Ahmedabad | A1 to C1 | Certified Trainers",
  description:
    "Join the best online German classes in Ahmedabad. Learn German A1 to C1 with Goethe-certified trainers. Flexible timings, affordable fees, free 4‑day demo, and exam preparation.",
  keywords:
    "online German classes Ahmedabad, German language course Ahmedabad, learn German online Ahmedabad, German classes near me Ahmedabad, German A1 course Ahmedabad, German B1 course Ahmedabad",
  openGraph: {
    title: "Online German Classes in Ahmedabad – A1 to C1 | Certified Trainers",
    description:
      "Goethe-certified faculty, live online classes, flexible batches, affordable fees. Free 4‑day demo. Prepare for study, work, or migration to Germany.",
    url: "https://www.anuedu.in/test-prep/german/online-german-classes-ahmedabad",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/german-ahmedabad.jpg",
        width: 1200,
        height: 630,
        alt: "Online German Classes in Ahmedabad",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online German Classes in Ahmedabad – A1 to C1",
    description: "Live online German course with free demo. Goethe exam prep. Enroll now.",
    images: ["/images/german-ahmedabad.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/german/online-german-classes-ahmedabad",
  },
};

export default function Page() {
  return <OnlineGermanAhmedabadClient />;
}