import Script from "next/script";

export const metadata = {
title: "IELTS Preparation Guide 2026 | Study Plan, Tips & Mock Tests – ANU Education",
description:
"Complete IELTS preparation guide for 2026 including study plan, writing tips, speaking strategies and mock test practice. Join ANU Education free IELTS demo class.",
};

export default function IELTSPreparationGuide() {
return (
<>
{/* ================= SCHEMA ================= */}

  <Script
    id="article-schema"
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "IELTS Preparation Guide 2026",
        "author": {
          "@type": "Organization",
          "name": "ANU Education"
        },
        "publisher": {
          "@type": "Organization",
          "name": "ANU Education",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.anuedu.in/logo.png"
          }
        }
      })
    }}
  />

  {/* ================= PAGE ================= */}

  <main className="max-w-4xl mx-auto px-4 py-12 space-y-10">

    <h1 className="text-4xl font-bold text-blue-700">
      Complete IELTS Preparation Guide 2026
    </h1>

    <p className="text-gray-700 text-lg">
      IELTS preparation requires structured practice in reading, writing,
      listening and speaking. This guide explains the best strategies,
      study plans and practice methods to achieve Band 7+ or higher in the
      IELTS exam.
    </p>

    {/* CTA */}
    <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center">
      <p className="text-lg font-medium mb-3">
        Want structured IELTS preparation?
      </p>

      <a
        href="/free-demo"
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
      >
        🎓 Strt Free Trial
      </a>
    </div>

    {/* What is IELTS */}
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">
        What is the IELTS Exam?
      </h2>

      <p className="text-gray-700">
        IELTS (International English Language Testing System) is an English
        proficiency exam required for studying, working or migrating to
        countries such as Canada, UK, Australia and Germany.
      </p>
    </section>

    {/* IELTS Exam Pattern */}
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">
        IELTS Exam Pattern
      </h2>

      <ul className="list-disc pl-6 text-gray-700">
        <li>Listening – 30 minutes</li>
        <li>Reading – 60 minutes</li>
        <li>Writing – 60 minutes</li>
        <li>Speaking – 11 to 14 minutes</li>
      </ul>
    </section>

    {/* Study Plan */}
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">
        IELTS Preparation Plan (30 Days)
      </h2>

      <p className="text-gray-700">
        Students preparing for IELTS in 30 days should follow a structured
        study schedule including reading practice, writing essays,
        listening exercises and speaking mock tests.
      </p>

      <ul className="list-disc pl-6 text-gray-700">
        <li>Daily reading passages and vocabulary practice</li>
        <li>Practice writing task 1 and task 2 essays</li>
        <li>Listening exercises using real exam audio</li>
        <li>Speaking practice with feedback</li>
      </ul>
    </section>

    {/* Writing Tips */}
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">
        IELTS Writing Tips
      </h2>

      <p className="text-gray-700">
        To achieve a high band score in IELTS writing, students must focus
        on task response, coherence and vocabulary usage. Writing clear
        paragraphs and supporting ideas with examples is essential.
      </p>
    </section>

    {/* Speaking Tips */}
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">
        IELTS Speaking Tips
      </h2>

      <p className="text-gray-700">
        IELTS speaking requires fluency, pronunciation and confidence.
        Students should practice answering common speaking topics and
        develop structured responses.
      </p>
    </section>

    {/* Mock Tests */}
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">
        Importance of IELTS Mock Tests
      </h2>

      <p className="text-gray-700">
        Mock tests help students understand the real exam environment.
        Practicing full-length tests improves time management and
        confidence.
      </p>
    </section>

    {/* Final CTA */}
    <section className="bg-blue-50 p-6 rounded-xl text-center">
      <h3 className="text-xl font-semibold mb-3">
        Start Your IELTS Preparation with ANU Education
      </h3>

      <p className="text-gray-700 mb-4">
        Join our expert-led IELTS coaching program with mock tests,
        speaking practice and personalized feedback.
      </p>

      <a
        href="/free-demo"
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
      >
        Book Free Demo Class
      </a>
    </section>

  </main>
</>

);
}