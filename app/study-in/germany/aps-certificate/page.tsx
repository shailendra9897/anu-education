import APSClient from './APSClient';

export const metadata = {
  metadataBase: new URL('https://www.anuedu.in'), // [!] Add this line
  title: "APS Certificate for Germany: Process, Fees & Documents for Indian Students",
  description:
    "Apply for an APS Certificate for Germany. Learn about APS fees, documents, and processing times, along with guidance on how to obtain a German student visa from India.",
  keywords:
    "APS certificate Germany, APS Germany fees, APS documents, German student visa, APS processing time",
  robots: { // [!] Add this block to explicitly control crawling/indexing
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "APS Certificate for Germany – Complete Guide for Indian Students",
    description:
      "Step‑by‑step process, fees (₹18,000), required documents, and processing times. Mandatory for German student visa. Free consultation available.",
    url: "https://www.anuedu.in/study-in/germany/aps-certificate",
    siteName: "ANU Education",
    type: "article",
    locale: "en_IN",
    images: [
      {
        url: "/images/aps-certificate-guide.jpg", // Will be resolved with metadataBase
        width: 1200,
        height: 630,
        alt: "APS Certificate for Germany",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "APS Certificate for Germany – Complete Guide",
    description: "Mandatory document for Indian students applying for German student visa. Fees, documents, processing time.",
    images: ["/images/aps-certificate-guide.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/study-in/germany/aps-certificate",
  },
  other: { // [!] Add this block if you need custom meta tags (e.g., for verification or additional SEO)
    // 'google-site-verification': 'your-verification-code', // Example
  },
};

export default function Page() {
  return <APSClient />;
}