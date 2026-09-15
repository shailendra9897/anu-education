import GermanyPage from './GermanyClient';
import JsonLd from "@/components/JsonLd";

export const metadata = {
  title: "Study in Germany | ANU Education",
  description:
    "Guide to studying in Germany: tuition-free universities, APS certificate requirements, student visa process, costs, and free demo classes from ANU Education.",
  alternates: {
    canonical: "https://www.anuedu.in/study-in/germany",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is APS certificate mandatory for Indian students to study in Germany?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, APS certificate is mandatory for most Indian students applying to German universities and for student visa processing. It verifies your academic credentials and is issued by the Academic Evaluation Centre (APS), Germany."
              }
            },
            {
              "@type": "Question",
              "name": "What is a blocked account and how much money is required?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A blocked account (Sperrkonto) is required to prove financial capability for German student visa. Currently, students need approximately €11,208 per year, which is released monthly (around €934) after arrival in Germany."
              }
            },
            {
              "@type": "Question",
              "name": "Is education free in Germany?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most public universities in Germany offer free or very low tuition fees. Students usually pay only a semester contribution of €150-€400, which includes public transport and other student benefits."
              }
            },
            {
              "@type": "Question",
              "name": "Do Indian students need IELTS or German language?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "English-taught programs require IELTS (6.5 overall) or TOEFL. German-taught programs require German language proficiency (A2/B1 for admission, C1 for most universities). ANU Education offers both IELTS and German language preparation."
              }
            },
            {
              "@type": "Question",
              "name": "Can Indian students work and get PR in Germany?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Students can work 120 full days or 240 half days per year. After graduation, get an 18-month job search visa. Permanent Residency is possible after 21-24 months of working post-study. Germany offers excellent PR pathways for skilled professionals."
              }
            },
            {
              "@type": "Question",
              "name": "What are the best courses to study in Germany?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Germany is famous for Engineering (Mechanical, Automobile, Electrical), Computer Science, AI & Data Science, Business Analytics, Renewable Energy, and Robotics. These fields have high job placement rates."
              }
            },
            {
              "@type": "Question",
              "name": "How to apply for German student visa from India?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Visa process requires: APS certificate, admission letter, blocked account proof, health insurance, language certificates, and academic documents. Processing time is 4-8 weeks. ANU Education provides complete visa assistance."
              }
            }
          ]
        }}
      />
      <GermanyPage />
    </>
  );
}