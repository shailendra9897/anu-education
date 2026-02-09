import Script from "next/script";

export const metadata = {
  title: "PTE Score 80 Course | 15 Mock Tests + AI Scoring – ANU Education",
  description:
    "Join ANU Education PTE Score 80 Course. Get 15 full-length mock tests, instant AI scoring, live classes, and 3 days free demo. Trusted by 1000+ students.",
};

export default function PTEPage() {
  return (
    <>
      {/* ================= SCHEMA ================= */}
      <Script
        id="pte-course-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "PTE Score 80 Course",
            "description":
              "PTE Score 80 course with 15 full-length mock tests, AI scoring, live lessons and expert guidance by ANU Education.",
            "provider": {
              "@type": "Organization",
              "name": "ANU Education",
              "url": "https://www.anuedu.in",
            },
            "offers": {
              "@type": "Offer",
              "price": "7200",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
            },
          }),
        }}
      />

      <Script
        id="pte-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is PTE Academic?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "PTE Academic is a computer-based English proficiency test accepted worldwide for study abroad, work and visa purposes.",
                },
              },
              {
                "@type": "Question",
                "name": "Is this PTE course suitable for beginners?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Yes. The course is beginner-friendly and covers basics to advanced strategies for all PTE sections.",
                },
              },
              {
                "@type": "Question",
                "name": "Do you provide free demo classes?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Yes. ANU Education offers 3 days of free live demo classes so students can experience our teaching style before enrolling.",
                },
              },
              {
                "@type": "Question",
                "name": "How many mock tests are included?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "The PTE Score 80 course includes 15 full-length mock tests with instant AI scoring and detailed feedback.",
                },
              },
            ],
          }),
        }}
      />

      {/* ================= PAGE CONTENT ================= */}
      <main className="bg-white text-gray-900">
        {/* HERO */}
        <section className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            PTE Score 80 Course – Mock Tests + Instant AI Scoring
          </h1>

          <p className="text-lg text-gray-600 mb-4">
            Achieve <strong>PTE Score 79–80+</strong> with expert guidance,
            real-exam mock tests and AI-powered evaluation.
          </p>

          <p className="text-sm text-gray-600 mb-3">
            ❤️ Trusted by 1000+ Students | 🚀 50+ students enrolled last week
          </p>

          <div className="text-2xl font-semibold mb-3">
            ₹7200 <span className="line-through text-gray-400">₹8000</span>{" "}
            <span className="text-green-600 text-base">(10% OFF)</span>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            180 Days Full Access | Limited Time Offer
          </p>

          <p className="text-sm font-medium text-green-700 mb-6">
            🎁 Book <strong>3 Days Free Demo Classes</strong> (Live)
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="https://study.anuedu.in/register"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium text-center"
            >
              Free PTE Demo (3days)
            </a>

            <a
              href="/contact"
              className="border border-green-600 text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg font-medium text-center"
            >
              Book Free Counselling for Study Abroad
            </a>
          </div>
        </section>
          {/* ADS CONFIRMATION */}
<section className="max-w-6xl mx-auto px-4 py-4 text-center">
  <p className="text-sm text-gray-600">
    Looking for <strong>PTE Coaching Online</strong> or
    <strong> PTE Mock Tests with AI Scoring</strong>?  
    You’re in the right place.
  </p>
</section>
        {/* WHAT YOU GET */}
        <section className="bg-gray-50 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              What You’ll Get in This Course
            </h2>

            <ul className="grid md:grid-cols-2 gap-4 text-gray-700">
              <li>✅ 3 Days Free Live Demo Classes</li>
              <li>✅ 200+ PTE Practice Questions</li>
              <li>✅ 15 Full-Length PTE Mock Tests</li>
              <li>✅ Instant AI Scoring (Section-wise)</li>
              <li>✅ Detailed Score Improvement Report</li>
              <li>✅ Live & Recorded Video Lessons</li>
            </ul>
          </div>
        </section>
{/* TRUST SIGNALS */}
<section className="max-w-6xl mx-auto px-4 py-6">
  <div className="grid md:grid-cols-3 gap-4 text-center text-sm text-gray-700">
    <div>✔ Pearson Exam–Style Mock Tests</div>
    <div>✔ Certified PTE Trainer</div>
    <div>✔ 1000+ Students Guided</div>
  </div>
</section>
        {/* TRAINER */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-semibold mb-4">
            Learn from Expert PTE Trainer
          </h2>
          <p className="text-gray-700">
            <strong>Nidhi Shah</strong> – Pearson Certified PTE Trainer with
            5+ years of experience and 1000+ students mentored.
          </p>
        </section>

        {/* SECTION TABLE */}
        <section className="bg-gray-50 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              PTE Section-wise Preparation
            </h2>

            <table className="w-full border text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 border">Section</th>
                  <th className="p-3 border">Practice Included</th>
                  <th className="p-3 border">Evaluation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border">Reading</td>
                  <td className="p-3 border">
                    MCQs, Re-order Paragraphs, Fill in the Blanks
                  </td>
                  <td className="p-3 border">AI Accuracy & Speed Analysis</td>
                </tr>
                <tr>
                  <td className="p-3 border">Listening</td>
                  <td className="p-3 border">
                    Summarize Spoken Text, WFD, Audio MCQs
                  </td>
                  <td className="p-3 border">AI Listening Score</td>
                </tr>
                <tr>
                  <td className="p-3 border">Writing</td>
                  <td className="p-3 border">
                    Essay Writing, Summarize Written Text
                  </td>
                  <td className="p-3 border">AI + Expert Review</td>
                </tr>
                <tr>
                  <td className="p-3 border">Speaking</td>
                  <td className="p-3 border">
                    Read Aloud, Repeat Sentence, Describe Image
                  </td>
                  <td className="p-3 border">
                    AI Fluency & Pronunciation Score
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        {/* TESTIMONIALS */}
<section className="max-w-6xl mx-auto px-4 py-10">
  <h2 className="text-2xl font-semibold mb-6 text-center">
    Student Success Stories
  </h2>

  <div className="grid md:grid-cols-2 gap-6">
    <div className="border rounded-xl p-5 shadow-sm">
      <p className="text-gray-700 mb-3">
        “ANU Education’s PTE course completely changed my preparation.
        Mock tests and AI feedback helped me score 81.”
      </p>
      <p className="font-medium">
        – Udaya Kumar <span className="text-sm text-gray-500">(PTE Score: 81)</span>
      </p>
    </div>

    <div className="border rounded-xl p-5 shadow-sm">
      <p className="text-gray-700 mb-3">
        “Daily practice, live classes, and expert strategies helped me reach
        79. Highly recommended for serious PTE aspirants.”
      </p>
      <p className="font-medium">
        – Sangeetha <span className="text-sm text-gray-500">(PTE Score: 79)</span>
      </p>
    </div>
  </div>
</section>
          {/* FAQ */}
<section className="bg-gray-50 py-10">
  <div className="max-w-4xl mx-auto px-4">
    <h2 className="text-2xl font-semibold mb-6 text-center">
      Frequently Asked Questions
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="font-medium">
          What is PTE Academic?
        </h3>
        <p className="text-gray-600 text-sm">
          PTE Academic is a computer-based English proficiency test accepted
          worldwide for study abroad, work, and visa purposes.
        </p>
      </div>

      <div>
        <h3 className="font-medium">
          Is this course suitable for beginners?
        </h3>
        <p className="text-gray-600 text-sm">
          Yes, this course is beginner-friendly and covers basics to advanced
          strategies for all PTE sections.
        </p>
      </div>

      <div>
        <h3 className="font-medium">
          Do you provide free demo classes?
        </h3>
        <p className="text-gray-600 text-sm">
          Yes, we offer 3 days of free live demo classes so you can experience
          our teaching style before enrolling.
        </p>
      </div>

      <div>
        <h3 className="font-medium">
          How many mock tests are included?
        </h3>
        <p className="text-gray-600 text-sm">
          This course includes 15 full-length mock tests with instant AI scoring
          and detailed performance analysis.
        </p>
      </div>
    </div>
  </div>
</section>
        {/* FINAL CTA */}
        <section className="bg-green-600 text-white py-10 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Start Your PTE Score 80 Journey with ANU Education
          </h2>
          <p className="mb-6">
            3 Days Free Demo • 15 Mock Tests • AI Scoring • Expert Guidance
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="https://study.anuedu.in/register"
              className="bg-white text-green-700 px-6 py-3 rounded-lg font-medium"
            >
              Book Free Demo Classes
            </a>

            <a
              href="/contact"
              className="border border-white px-6 py-3 rounded-lg font-medium"
            >
              Free Study Abroad Counselling
            </a>
          </div>
        </section>
      </main>
    </>
  );
}