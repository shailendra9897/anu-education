import IELTSWritingSamples from './IELTSWritingClient';
import JsonLd from "@/components/JsonLd";

export const metadata = {
  title: "IELTS Writing Task 2 Samples | Band 7-9 Guide 2026 | ANU Education",
  description:
    "Band 7\u20139 IELTS Writing Task 2 sample essays with strategies, paragraph structure, vocabulary tips, and 2026 practice topics from ANU Education.",
  alternates: {
    canonical: "https://www.anuedu.in/blog/ielts-writing-task-2-samples",
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
              "name": "How many paragraphs should I write for IELTS Writing Task 2?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Aim for 4-5 paragraphs: Introduction, 2-3 body paragraphs, and a conclusion. Each body paragraph should focus on one main idea with examples. This structure helps examiners follow your argument clearly."
              }
            },
            {
              "@type": "Question",
              "name": "Can I use personal examples in IELTS essays?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Personal examples are acceptable and can make your essay more authentic. However, for higher band scores (8+), mix personal examples with broader societal evidence to demonstrate wider perspective."
              }
            },
            {
              "@type": "Question",
              "name": "What's the difference between Band 7 and Band 9 essays?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Band 9 essays demonstrate sophisticated vocabulary, complex sentence structures, and fully developed arguments with seamless coherence. Band 7 essays are competent but may have less flexibility or precision in language use."
              }
            },
            {
              "@type": "Question",
              "name": "How important is the conclusion?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Very important! A strong conclusion summarizes your main points and restates your position. It's your last chance to impress the examiner. Avoid introducing new ideas here."
              }
            },
            {
              "@type": "Question",
              "name": "Should I write more than 250 words?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, aim for 260-280 words. Writing exactly 250 words might limit your ability to fully develop arguments. However, don't exceed 300 words as you might run out of time or become repetitive."
              }
            }
          ]
        }}
      />
      <IELTSWritingSamples />
    </>
  );
}