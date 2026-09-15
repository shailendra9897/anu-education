import IELTSSpeakingPage from './IELTSSpeakingClient';
import JsonLd from "@/components/JsonLd";

export const metadata = {
  title: "IELTS Speaking Topics 2026 | Cue Cards + Sample Answers | ANU Education",
  description:
    "IELTS Speaking Topics 2026: latest cue cards, sample answers for Band 7+, test format guide, and speaking tips from ANU Education.",
  alternates: {
    canonical: "https://www.anuedu.in/blog/ielts-speaking-topics-2026",
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
              name: "What topics are asked in IELTS Speaking?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Common topics include hobbies, education, work, travel, technology, and daily life experiences. Part 2 cue cards often ask you to describe a person, place, event, or object.",
              },
            },
            {
              "@type": "Question",
              name: "How to score Band 7 in IELTS Speaking?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Speak fluently without long pauses, use advanced vocabulary appropriately, avoid repetition, give structured answers with examples, and maintain good pronunciation.",
              },
            },
            {
              "@type": "Question",
              name: "Is IELTS Speaking difficult?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No, it is a simple conversation test. With regular practice, confidence building, and proper guidance from experts, you can easily score high.",
              },
            },
            {
              "@type": "Question",
              name: "How long is the Speaking test?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The test lasts 11-14 minutes. Part 1 (4-5 min), Part 2 (3-4 min), Part 3 (4-5 min).",
              },
            },
          ],
        }}
      />
      <IELTSSpeakingPage />
    </>
  );
}