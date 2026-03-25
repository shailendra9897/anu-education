import StudyInUKClient from './StudyInUKClient';

export const metadata = {
  title: "Study in UK for Indian Students | 1-Year Masters | 2-Year PSW Visa – ANU Education",
  description:
    "Study in UK with ANU Education. Expert guidance for 1-year masters, top UK universities, student visa, post-study work visa, and scholarships. Free counseling & IELTS coaching available.",
  keywords: "study in UK, study in UK for Indian students, masters in UK, UK student visa, UK universities, post study work visa UK, study abroad consultant",
  openGraph: {
    title: "Study in UK – Complete Guide for Indian Students | ANU Education",
    description: "Get expert guidance to study in UK. Top universities, 1-year masters, UK student visa, 2-year PSW visa, and scholarships. Book free counseling today!",
    url: "https://www.anuedu.in/study-in/uk",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/study-in-uk-og.jpg",
        width: 1200,
        height: 630,
        alt: "Study in UK with ANU Education"
      }
    ],
    locale: "en_IN",
    type: "website",
    publishedTime: "2026-03-25",
    modifiedTime: "2026-03-25",
  },
  twitter: {
    card: "summary_large_image",
    title: "Study in UK for Indian Students | ANU Education",
    description: "Complete guide to study in UK: 1-year masters, top universities, student visa, and 2-year PSW visa.",
    images: ["/images/study-in-uk-twitter.jpg"],
    site: "@anueducation",
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
    canonical: "https://www.anuedu.in/study-in/uk",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function Page() {
  return <StudyInUKClient />;
}