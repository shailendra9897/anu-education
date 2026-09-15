import IELTSCoachingPage from './IELTSCoachingIndiaClient';
import JsonLd from "@/components/JsonLd";

export const metadata = {
  title: "IELTS Coaching in India | Online & Live Classes | ANU Education",
  description:
    "IELTS coaching in India with online and live classes, mock tests, expert trainers, and free demo booking at ANU Education.",
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/ielts-coaching-india",
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
              "name": "Do you provide online IELTS coaching with live classes?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! We offer daily live online classes with expert trainers. All sessions are recorded for revision."
              }
            },
            {
              "@type": "Question",
              "name": "How many mock tests are included?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "All our IELTS batches (Self Preparation and Champion) include 15+ full-length mock tests with detailed performance analysis."
              }
            },
            {
              "@type": "Question",
              "name": "Is there any doubt clearing support?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely! We have daily doubt clearing sessions and one-on-one support for every student."
              }
            },
            {
              "@type": "Question",
              "name": "Do you provide free study abroad counseling?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! All our IELTS students get FREE counseling for study abroad destinations including Germany, UK, Canada, Australia, and more."
              }
            },
            {
              "@type": "Question",
              "name": "Can I get a free demo before enrolling?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! We offer 3 days of free demo classes including mock test access. Book your free demo now!"
              }
            }
          ]
        }}
      />
      <IELTSCoachingPage />
    </>
  );
}