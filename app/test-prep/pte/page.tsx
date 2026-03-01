import Script from "next/script";

export const metadata = {
  title: "PTE Online Coaching in India | Score 79+ with AI Mock Tests – ANU Education",
  description:
    "Join ANU Education PTE Online Coaching in India. Score 65+ or 79+ with 15 full-length mock tests, instant AI scoring, expert trainers & 3-day free demo.",
  keywords:
    "PTE online coaching India, PTE 79+ course, PTE mock test with AI scoring, best PTE coaching online, PTE free demo class",
};

export default function PTEPage() {
  return (
    <>
      {/* ================= COURSE SCHEMA ================= */}
      <Script
        id="pte-course-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "PTE Online Coaching – Score 79+",
            description:
              "PTE Online Coaching with 15 full-length mock tests, AI scoring, live lessons and expert guidance by ANU Education.",
            provider: {
              "@type": "Organization",
              name: "ANU Education",
              url: "https://www.anuedu.in",
            },
            offers: {
              "@type": "Offer",
              price: "7200",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              url: "https://study.anuedu.in/register",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              reviewCount: "200",
            },
          }),
        }}
      />

      {/* ================= FAQ SCHEMA ================= */}
      <Script
        id="pte-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is PTE online coaching effective?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Yes. With AI-based mock tests, structured lessons and expert feedback, PTE online coaching is highly effective for scoring 65+ and 79+.",
                },
              },
              {
                "@type": "Question",
                name: "How many mock tests are included?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "The course includes 15 full-length PTE mock tests with instant AI scoring and detailed performance reports.",
                },
              },
              {
                "@type": "Question",
                name: "Do you provide free demo classes?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Yes. We provide 3 days of free live demo classes before enrollment.",
                },
              },
            ],
          }),
        }}
      />

      <main className="bg-white text-gray-900">

        {/* HERO */}
        <section className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            PTE Online Coaching in India – Score 79+ with AI Mock Tests
          </h1>

          <p className="text-lg text-gray-600 mb-4">
            Achieve <strong>PTE 65+ or 79+</strong> with live classes,
            real-exam mock tests and AI-powered evaluation.
          </p>

          <p className="text-sm text-gray-600 mb-4">
            Trusted by students from Delhi, Mumbai, Bangalore, Hyderabad,
            Ahmedabad and across India.
          </p>

          <div className="text-2xl font-semibold mb-3">
            ₹7200{" "}
            <span className="line-through text-gray-400">₹8000</span>{" "}
            <span className="text-green-600 text-base">(Limited Offer)</span>
          </div>

          <p className="text-sm font-medium text-green-700 mb-6">
            🎁 3 Days Free Live Demo Classes
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="https://study.anuedu.in/register"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium text-center"
            >
              Book Free PTE Demo
            </a>

            <a
              href="/contact"
              className="border border-green-600 text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg font-medium text-center"
            >
              Free Study Abroad Counselling
            </a>
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className="bg-gray-50 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              What You’ll Get in This PTE Online Course
            </h2>

            <ul className="grid md:grid-cols-2 gap-4 text-gray-700">
              <li>✅ 3 Days Free Live Demo</li>
              <li>✅ 200+ Practice Questions</li>
              <li>✅ 15 Full-Length PTE Mock Tests</li>
              <li>✅ Instant AI Scoring (Section-wise)</li>
              <li>✅ Detailed Score Improvement Report</li>
              <li>✅ Live + Recorded Sessions</li>
            </ul>
          </div>
        </section>

        {/* WHO IS THIS FOR */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Who Is This PTE Course For?
          </h2>

          <ul className="grid md:grid-cols-2 gap-4 text-gray-700">
            <li>✔ Students applying for Australia PR</li>
            <li>✔ Canada visa & study applicants</li>
            <li>✔ Working professionals preparing from home</li>
            <li>✔ Students targeting 65+ or 79+ score</li>
          </ul>
        </section>

        {/* SECTION TABLE */}
        <section className="bg-gray-50 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Section-wise PTE Preparation
            </h2>

            <table className="w-full border text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 border">Section</th>
                  <th className="p-3 border">Practice</th>
                  <th className="p-3 border">Evaluation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border">Reading</td>
                  <td className="p-3 border">MCQs, FIB, Re-order</td>
                  <td className="p-3 border">AI Accuracy Analysis</td>
                </tr>
                <tr>
                  <td className="p-3 border">Listening</td>
                  <td className="p-3 border">WFD, SST, MCQs</td>
                  <td className="p-3 border">AI Listening Score</td>
                </tr>
                <tr>
                  <td className="p-3 border">Writing</td>
                  <td className="p-3 border">Essay & SWT</td>
                  <td className="p-3 border">AI + Trainer Feedback</td>
                </tr>
                <tr>
                  <td className="p-3 border">Speaking</td>
                  <td className="p-3 border">RA, RS, DI</td>
                  <td className="p-3 border">Fluency & Pronunciation Score</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* INTERNAL LINK */}
        <section className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600">
            Preparing for IELTS instead? Explore our{" "}
            <a
              href="/test-prep/ielts-online"
              className="text-green-600 font-medium"
            >
              IELTS Online Coaching
            </a>{" "}
            program.
          </p>
        </section>

        {/* FINAL CTA */}
        <section className="bg-green-600 text-white py-10 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Start Your PTE 79+ Journey Today
          </h2>
          <p className="mb-6">
            3-Day Free Demo • 15 Mock Tests • AI Scoring • Pan India Online
          </p>

          <a
            href="https://study.anuedu.in/register"
            className="bg-white text-green-700 px-6 py-3 rounded-lg font-medium"
          >
            Book Free Demo Now
          </a>
        </section>
      </main>
    </>
  );
}