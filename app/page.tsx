import HomeClient from '@/components/HomeClient';

export const metadata = {
  title: "IELTS Coaching | PTE Classes & Study Abroad Consultant – ANU Education",
  description:
    "Join ANU Education for IELTS coaching, PTE classes and study abroad guidance. Free demo classes available for Germany, UK, Canada & Europe.",
  keywords: "IELTS coaching, PTE classes, study abroad consultant, Germany study visa, UK education",
  openGraph: {
    title: "ANU Education - IELTS Coaching & Study Abroad Consultant",
    description: "Best IELTS coaching and PTE classes with study abroad guidance for Germany, UK, Canada & Europe.",
    url: "https://www.anuedu.in",
    siteName: "ANU Education",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ANU Education - Study Abroad Consultant",
    description: "IELTS coaching, PTE classes & study abroad guidance",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.anuedu.in",
  },
};

export default function Page() {
  return <HomeClient />;
}