import GermanClient from './GermanClient';
import JsonLd from "@/components/JsonLd";

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
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Is German required for studying in Germany?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Many public universities and some job roles in Germany require proof of German language proficiency (usually B1/B2 or higher). For English‑taught programs, basic German is still helpful for daily life and part‑time jobs.",
              },
            },
            {
              "@type": "Question",
              name: "Can I learn German online in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, our online German classes are designed for Gujarat students in Ahmedabad, Gandhinagar, Vadodara, and nearby cities. You can attend live sessions from home and access recorded lessons anytime.",
              },
            },
            {
              "@type": "Question",
              name: "How long does German A1 take in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "German A1 usually takes 4–6 weeks with regular practice, depending on your schedule and prior language exposure. Our structured online course in Ahmedabad keeps you on track for faster progress.",
              },
            },
            {
              "@type": "Question",
              name: "Do you provide certification support for German exams?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. We prepare students for internationally recognized German exams like Goethe‑Zertifikat A1, A2, B1, B2 and can help with exam strategy, mock tests, and application guidance.",
              },
            },
            {
              "@type": "Question",
              name: "Can I go to Germany for study after learning German in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. After reaching B1/B2 level, you can apply to German universities, vocational programs, or language‑integrated courses. We also guide Ahmedabad students on admission pathways, documents, and language requirements.",
              },
            },
            {
              "@type": "Question",
              name: "Which German level is needed for jobs in Germany?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "For most jobs in Germany, at least B1 basic communication skills are expected; many roles require B2 or higher. We design our courses for Ahmedabad students to reach job‑ready conversational and professional German.",
              },
            },
            {
              "@type": "Question",
              name: "Do you offer German classes for beginners in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. We offer German A1 starters’ batches for complete beginners from Ahmedabad and Gujarat. Our online classes focus on speaking, listening, grammar, and daily‑use vocabulary.",
              },
            },
            {
              "@type": "Question",
              name: "Are your online German classes batch‑based or 1‑to‑1?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "We offer both group batches (for better practice and affordability) and 1‑to‑1 private classes for focused attention. Students from Ahmedabad, Gandhinagar, and nearby cities can choose the best fit.",
              },
            },
            {
              "@type": "Question",
              name: "How are online German classes conducted in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Classes are held live via Zoom or our learning platform. You get interactive sessions, homework, speech practice, and weekly tests. All materials are shared digitally, so you can study from anywhere in Gujarat.",
              },
            },
            {
              "@type": "Question",
              name: "Germany study visa vs. language requirement – what do Ahmedabad students need to know?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Most German student visas require either an English‑taught program acceptance or proof of German language level (B1/B2). We help Ahmedabad students plan their language path early so they meet visa and university deadlines.",
              },
            },
            {
              "@type": "Question",
              name: "Can working professionals in Ahmedabad learn German online?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Our evening and weekend batches are designed for working professionals in Ahmedabad who want to improve German for career growth, study in Germany, or migration plans.",
              },
            },
            {
              "@type": "Question",
              name: "How do online German classes help with Germany ranking and LLP/Germany‑focused search queries?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Our structured, exam‑oriented online German classes in Ahmedabad are optimised for long‑tail queries like “German classes in Ahmedabad,” “learn German online for Germany,” and “German course for study in Germany.” Clear metadata, local keywords, and FAQ‑rich content help Gujarati students find the right course.",
              },
            },
          ],
        }}
      />
      <GermanClient />
    </>
  );
}