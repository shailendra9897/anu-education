import Script from "next/script";

export const metadata = {
  title: "IELTS Writing Task 2 Samples (Band 7–9 Essays) – 2026 Guide",
  description:
    "Learn how to write Band 7–9 IELTS Writing Task 2 essays with real examples, structure tips, and practice topics. Improve your IELTS writing score with ANU Education.",
  keywords:
    "IELTS writing task 2 samples, IELTS essay band 9 sample, IELTS writing tips, IELTS writing task 2 examples",
};

export default function IELTSWritingSamples() {
  return (
    <>
      {/* Article Schema */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "IELTS Writing Task 2 Samples – Band 7 to Band 9 Guide",
            description:
              "Examples of Band 7–9 IELTS Writing Task 2 essays with strategies and practice topics for 2026.",
            author: {
              "@type": "Organization",
              name: "ANU Education",
            },
            publisher: {
              "@type": "Organization",
              name: "ANU Education",
              url: "https://www.anuedu.in",
            },
            datePublished: "2026-03-01",
          }),
        }}
      />

      <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">

        {/* TITLE */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          IELTS Writing Task 2 Samples: Band 9 Guide for 2026
        </h1>

        <p className="text-gray-600 mb-6">
          IELTS Writing Task 2 tests your ability to write a clear, persuasive essay
          of at least 250 words in 40 minutes. Topics usually include education,
          technology, health, environment, and society. To achieve a high band score,
          you must demonstrate strong task response, logical structure, vocabulary,
          and grammar.
        </p>

        {/* CORE STRATEGIES */}
        <h2 className="text-2xl font-semibold mt-10 mb-4">
          Core Strategies for Band 8+
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Structure:</strong> Introduction → 2–3 Body Paragraphs →
            Conclusion.
          </li>
          <li>
            <strong>Word Count:</strong> Aim for 260–280 words.
          </li>
          <li>
            <strong>Vocabulary:</strong> Use collocations like “foster critical
            thinking”.
          </li>
          <li>
            <strong>Timing:</strong> Plan (5 min) → Write (30 min) → Review (5 min).
          </li>
        </ul>

        {/* SAMPLE 1 */}
        <h2 className="text-2xl font-semibold mt-12 mb-4">
          Sample Essay 1 – Education & Technology (Band 9)
        </h2>

        <p className="font-semibold mb-2">
          Question:
        </p>

        <p className="italic mb-4">
          Some people believe that online learning will replace classroom learning.
          To what extent do you agree or disagree?
        </p>

        <p className="mb-4">
          <strong>Introduction:</strong> While online learning platforms have
          revolutionized education through accessibility, I believe they cannot
          fully replace traditional classrooms because face-to-face interaction
          remains essential for effective learning.
        </p>

        <p className="mb-4">
          <strong>Body Paragraph 1:</strong> Online education provides flexibility
          and global reach. Platforms like Coursera allow students worldwide to
          access top university courses at low cost, which promotes lifelong
          learning opportunities.
        </p>

        <p className="mb-4">
          <strong>Body Paragraph 2:</strong> However, traditional classrooms
          encourage teamwork, discussion, and immediate teacher feedback.
          These factors build communication skills and deeper understanding.
        </p>

        <p className="mb-4">
          <strong>Conclusion:</strong> A hybrid system combining online platforms
          with classroom interaction provides the most effective educational model.
        </p>

        {/* SAMPLE 2 */}
        <h2 className="text-2xl font-semibold mt-12 mb-4">
          Sample Essay 2 – Health & Lifestyle (Band 8)
        </h2>

        <p className="italic mb-4">
          Governments should ban fast food to improve public health. Do you agree or disagree?
        </p>

        <p className="mb-4">
          Although fast food contributes to obesity and other health problems,
          banning it entirely would not be the best solution. Instead, governments
          should focus on education and regulation.
        </p>

        <p className="mb-4">
          Fast food consumption is strongly linked to health issues such as diabetes
          and heart disease. Therefore, policies like sugar taxes and nutritional
          labeling can help reduce unhealthy consumption.
        </p>

        <p className="mb-4">
          However, banning fast food could limit personal freedom and create
          economic challenges for low-income families who rely on affordable food
          options.
        </p>

        <p className="mb-4">
          In conclusion, governments should promote healthier lifestyles through
          education rather than strict bans.
        </p>

        {/* SAMPLE 3 */}
        <h2 className="text-2xl font-semibold mt-12 mb-4">
          Sample Essay 3 – Environment (Band 7)
        </h2>

        <p className="italic mb-4">
          Individuals cannot improve the environment; only governments and large
          companies can make a difference. Do you agree?
        </p>

        <p className="mb-4">
          Governments and large organizations certainly play a major role in
          environmental protection, but individuals also contribute significantly
          through daily choices and social influence.
        </p>

        <p className="mb-4">
          Governments can introduce environmental policies, while corporations
          can implement sustainable production methods.
        </p>

        <p className="mb-4">
          Nevertheless, individual actions such as reducing plastic use,
          recycling, and supporting eco-friendly businesses create meaningful
          long-term change.
        </p>

        <p className="mb-4">
          Therefore, cooperation between governments, businesses, and individuals
          is necessary for effective environmental protection.
        </p>

        {/* PRACTICE TOPIC */}
        <h2 className="text-2xl font-semibold mt-12 mb-4">
          2026 Practice Topic
        </h2>

        <p className="italic mb-6">
          Social media influencers negatively impact young people more than they
          benefit society. Discuss both views.
        </p>

        {/* CTA */}
        <div className="bg-green-50 border border-green-200 p-6 rounded-xl mt-10 text-center">
          <h3 className="text-xl font-semibold mb-3">
            Improve Your IELTS Writing Score
          </h3>

          <p className="mb-4 text-gray-700">
            Practice with real IELTS mock tests and get expert feedback on your
            essays.
          </p>

          <a
            href="https://study.anuedu.in/register"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Book Free IELTS Demo Class
          </a>
        </div>

        <p className="text-sm text-gray-500 mt-10">
          Last Updated: March 2026 | ANU Education IELTS Coaching
        </p>

      </main>
    </>
  );
}