import IELTSGandhinagarClient from './IELTSGandhinagarClient';
import JsonLd from '@/components/JsonLd';
import { faqs } from '@/lib/data/faq/ielts-gandhinagar';

export const metadata = {
  metadataBase: new URL('https://www.anuedu.in'),
  title: "IELTS Coaching in Gandhinagar | Best Classes Near You – ANU Education",
  description:
    "Join expert IELTS coaching in Gandhinagar with 10+ years experienced trainers. Full modules, mock tests, speaking practice & study abroad support. Free demo available.",
  keywords:
    "IELTS coaching Gandhinagar, best IELTS classes Gandhinagar, IELTS preparation Gandhinagar, study abroad Gandhinagar",
  openGraph: {
    title: "IELTS Coaching in Gandhinagar – Best Classes Near You | ANU Education",
    description:
      "Expert-led IELTS training with real exam strategies, weekly mock tests, and flexible online/offline classes. Free 3‑day demo. Book your spot.",
    url: "https://www.anuedu.in/test-prep/ielts-coaching-gandhinagar",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/ielts-gandhinagar.jpg",
        width: 1200,
        height: 630,
        alt: "IELTS Coaching in Gandhinagar",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Coaching in Gandhinagar – Best Classes Near You",
    description: "4‑8 weeks training, mock tests, speaking practice. Free demo. Enroll now.",
    images: ["/images/ielts-gandhinagar.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/ielts-coaching-gandhinagar",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
            { "@type": "ListItem", position: 2, name: "Test Prep", item: "https://www.anuedu.in/test-prep" },
            { "@type": "ListItem", position: 3, name: "IELTS Coaching Gandhinagar", item: "https://www.anuedu.in/test-prep/ielts-coaching-gandhinagar" },
          ],
        }}
      />
      <IELTSGandhinagarClient />
    </>
  );
}