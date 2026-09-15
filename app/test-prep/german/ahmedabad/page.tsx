import OnlineGermanAhmedabadClient from './AhmedabadClient';
import JsonLd from "@/components/JsonLd";

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
    canonical: "https://www.anuedu.in/test-prep/german/ahmedabad",
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
              name: "What is the fee for German language classes in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The fee for German language classes in Ahmedabad typically ranges from ₹8,000 to ₹30,000 depending on the level (A1 to C1), batch type (regular or intensive), and mode (online or offline). Many institutes also offer EMI options and combo discounts for multiple levels.",
              },
            },
            {
              "@type": "Question",
              name: "Can I learn German online from Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, you can learn German online from Ahmedabad through live interactive classes conducted by certified trainers. Online German classes offer the same curriculum, study materials, and exam preparation as offline classes, with the added convenience of learning from home.",
              },
            },
            {
              "@type": "Question",
              name: "How long does it take to complete German A1 in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A German A1 course in Ahmedabad typically takes 2 to 3 months to complete with regular classes (3-5 sessions per week). Intensive batches can complete A1 in 4-6 weeks with daily classes.",
              },
            },
            {
              "@type": "Question",
              name: "Which is the best German language institute in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The best German language institute in Ahmedabad should have Goethe-certified trainers, a structured CEFR-based curriculum, small batch sizes, flexible timings, exam preparation support, and a strong track record of student success in Goethe exams.",
              },
            },
            {
              "@type": "Question",
              name: "Is German language useful for getting a job in Germany?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Absolutely. German language proficiency (B1 and above) is essential for most jobs in Germany, especially in healthcare, engineering, IT, and vocational training (Ausbildung). Even for English-medium workplaces, knowing German significantly improves your career prospects and integration.",
              },
            },
            {
              "@type": "Question",
              name: "What is the difference between A1, A2, B1, B2, and C1 German levels?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "These are CEFR levels: A1 (Beginner) covers basic phrases; A2 (Elementary) handles routine conversations; B1 (Intermediate) enables independent communication; B2 (Upper Intermediate) allows fluent discussion on complex topics; C1 (Advanced) is near-native proficiency for academic and professional use.",
              },
            },
            {
              "@type": "Question",
              name: "Do you provide Goethe exam preparation in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, we provide comprehensive Goethe exam preparation for all levels (A1 to C1) including mock tests, previous year papers, speaking practice, and individual feedback on all four modules — Reading (Lesen), Listening (Hören), Writing (Schreiben), and Speaking (Sprechen).",
              },
            },
            {
              "@type": "Question",
              name: "Can working professionals join German classes in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, we offer flexible evening and weekend batches specifically designed for working professionals. Our online German classes allow you to learn from anywhere with flexible scheduling that fits your work routine.",
              },
            },
            {
              "@type": "Question",
              name: "Is German required for studying in Germany?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "It depends on your program. Many Master’s programs in Germany are offered in English, but Bachelor’s programs usually require German proficiency (B1 or B2). Even for English-medium programs, learning German helps with daily life, part-time jobs, and post-study employment.",
              },
            },
            {
              "@type": "Question",
              name: "What career options are available after learning German in India?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "After learning German, you can pursue careers in BPO/KPO (German-speaking roles), translation and interpretation, teaching German, tourism and hospitality, international business, and can also apply for jobs, Ausbildung, or higher studies in Germany.",
              },
            },
            {
              "@type": "Question",
              name: "Do you offer German classes for kids in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, we offer specially designed German language courses for kids and teenagers in Ahmedabad. Our young learner programs use interactive, fun-based teaching methods to make language learning engaging and effective.",
              },
            },
            {
              "@type": "Question",
              name: "How can I enroll for online German classes in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "You can enroll by booking a free demo class on our website, calling our helpline, or visiting our center in Ahmedabad. Our counselors will help you choose the right level and batch based on your goals and schedule.",
              },
            },
            {
              "@type": "Question",
              name: "What study materials are provided in the German course?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Our German language course includes comprehensive study materials — textbooks, grammar workbooks, audio-visual resources, practice worksheets, vocabulary lists, and access to our online learning portal with additional exercises and mock tests.",
              },
            },
            {
              "@type": "Question",
              name: "Is there any placement support after completing the German course?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, we provide career guidance and placement support including resume building for German job markets, interview preparation, university application assistance for studying in Germany, and connections with recruitment agencies for Ausbildung and nursing programs.",
              },
            },
            {
              "@type": "Question",
              name: "Can I get a certificate after completing German classes in Ahmedabad?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, you will receive a course completion certificate from our institute. Additionally, we prepare you for internationally recognized Goethe-Zertifikat exams, which are accepted worldwide by universities, employers, and immigration authorities.",
              },
            },
          ],
        }}
      />
      <OnlineGermanAhmedabadClient />
    </>
  );
}