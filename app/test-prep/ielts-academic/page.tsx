import Script from "next/script";
import Link from "next/link";

export const metadata = {
  title: "IELTS Academic Exam: Complete Guide for 2026 (Syllabus, Format, Time & Cost)",
  description:
    "Learn everything about IELTS Academic exam: syllabus, format, exam time & cost in India. Complete beginner guide to score 7+ band easily.",
  keywords:
    "IELTS academic exam, IELTS academic syllabus, IELTS exam format, IELTS exam time, IELTS cost in India, IELTS preparation",
  openGraph: {
    title: "IELTS Academic Exam: Complete Guide 2026",
    description:
      "Complete beginner guide to IELTS Academic exam – syllabus, format, time, cost in India. Score 7+ band with proven strategies.",
    url: "https://www.anuedu.in/test-prep/ielts-academic",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/ielts-academic-guide.jpg",
        width: 1200,
        height: 630,
        alt: "IELTS Academic Exam Guide 2026",
      },
    ],
    locale: "en_IN",
    type: "article",
    publishedTime: "2026-03-26",
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Academic Exam: Complete Guide 2026",
    description:
      "Syllabus, format, time & cost – everything you need to know about IELTS Academic. Start your prep today!",
    images: ["/images/ielts-academic-guide.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/ielts-academic",
  },
};

export default function IELTSAcademicPage() {
  return (
    <>
      {/* Course Schema */}
      <Script
        id="course-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "IELTS Academic Exam Preparation",
            description:
              "Complete guide to IELTS Academic exam: syllabus, format, time, cost, and preparation strategies for Indian students.",
            provider: {
              "@type": "Organization",
              name: "ANU Education",
              url: "https://www.anuedu.in",
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
              availability: "https://schema.org/OnlineOnly",
              validFrom: "2026-01-01",
            },
          }),
        }}
      />

      {/* FAQ Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is IELTS Academic exam used for?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "It is used for university admissions and student visas in English-speaking countries like Canada, UK, Australia, and USA.",
                },
              },
              {
                "@type": "Question",
                name: "What is the total IELTS exam time?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The total IELTS Academic exam time is around 2 hours 45 minutes (Listening: 30 min, Reading: 60 min, Writing: 60 min, Speaking: 11–14 min).",
                },
              },
              {
                "@type": "Question",
                name: "What is the syllabus of IELTS Academic?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The syllabus includes Listening (4 recordings), Reading (3 academic passages), Writing (Task 1: graph/chart description, Task 2: essay), and Speaking (face‑to‑face interview).",
                },
              },
              {
                "@type": "Question",
                name: "How much does IELTS exam cost in India?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The IELTS Academic exam cost in India is approximately ₹16,250–₹16,500 (varies slightly by city).",
                },
              },
              {
                "@type": "Question",
                name: "Is IELTS difficult?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "It depends on your preparation. With a structured plan, regular practice, and expert guidance, scoring 7+ band is achievable.",
                },
              },
            ],
          }),
        }}
      />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-700">
            IELTS Academic Exam: Complete Guide for 2026
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Syllabus, format, exam time & cost in India – everything you need to know to score 7+ band easily.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="/free-demo"
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              🎓 Book Free Demo Class
            </a>
            <a
              href="https://wa.me/919428186817"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
            >
              💬 WhatsApp for Quick Support
            </a>
          </div>
        </section>

        {/* Key Facts Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🌍", label: "Accepted Worldwide", value: "11,000+", desc: "Universities & institutions" },
            { icon: "⏱️", label: "Exam Duration", value: "2h 45m", desc: "Total test time" },
            { icon: "💰", label: "Exam Cost", value: "₹16,250+", desc: "In India (2026)" },
            { icon: "🎯", label: "Validity", value: "2 Years", desc: "Score valid for 2 years" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 text-center shadow-md hover:shadow-lg transition">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
              <div className="font-semibold">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.desc}</div>
            </div>
          ))}
        </div>

        {/* What is IELTS Academic */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">What is IELTS Academic Exam? 🎯</h2>
          <p className="text-gray-700 leading-relaxed">
            If you're planning to study abroad, understanding the IELTS Academic exam is your first and most important step.
            This exam is required by universities in countries like Canada, UK, Australia, and more.
          </p>
          <p className="mt-3 text-gray-700">
            The IELTS Academic exam (International English Language Testing System) is a standardized test that checks your
            English skills for higher education. It is accepted by <strong>11,000+ institutions worldwide</strong> and
            conducted by British Council, IDP, and Cambridge. Scores are valid for 2 years and are reported on a band scale
            of 0–9.
          </p>
        </section>

        {/* Exam Format */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">IELTS Academic Exam Format 📋</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: "Listening", time: "30 min", tasks: "4 recordings, 40 questions", icon: "🎧" },
              { title: "Reading", time: "60 min", tasks: "3 academic passages, 40 questions", icon: "📖" },
              { title: "Writing", time: "60 min", tasks: "Task 1: Describe graph/chart, Task 2: Essay", icon: "✍️" },
              { title: "Speaking", time: "11–14 min", tasks: "Face-to-face interview, cue card, discussion", icon: "🗣️" },
            ].map((section, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-md border-l-4 border-blue-500">
                <div className="text-2xl mb-2">{section.icon}</div>
                <h3 className="text-xl font-bold">{section.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{section.time}</p>
                <p className="text-gray-700 text-sm mt-2">{section.tasks}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-gray-600 italic">👉 Total IELTS Academic exam time: ~2 hours 45 minutes</p>
        </section>

        {/* Syllabus */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">IELTS Academic Exam Syllabus 📚</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Listening Syllabus", points: ["Daily conversations", "Academic lectures"] },
              { title: "Reading Syllabus", points: ["Research articles", "Journals & reports"] },
              { title: "Writing Syllabus", points: ["Data interpretation (graphs/charts)", "Opinion & argumentative essays"] },
              { title: "Speaking Syllabus", points: ["Personal introduction", "Topic speaking (cue card)", "Follow-up questions"] },
            ].map((section, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-blue-700">{section.title}</h3>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-700">
                  {section.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Cost Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">IELTS Academic Exam Cost in India 💰</h2>
              <p className="text-lg font-semibold">Approx. ₹16,250 – ₹16,500 (2026)</p>
              <p className="mt-2 text-white/90">What’s included: Exam registration, test materials, result processing.</p>
              <p className="mt-1 text-white/80 text-sm">✅ Results available within 3–13 days</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
              <p className="text-3xl font-bold">₹16,250+</p>
              <p className="text-sm">(varies by city)</p>
              <p className="mt-2">Fast results | 11,000+ accepting institutions</p>
            </div>
          </div>
        </section>

        {/* Why IELTS Academic Important */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Why IELTS Academic is Important for Students?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🎓", text: "Required for study abroad admissions" },
              { icon: "📄", text: "Needed for student visa" },
              { icon: "🌍", text: "Improves global career opportunities" },
              { icon: "🏫", text: "Accepted by top universities worldwide" },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-sm font-medium text-gray-800">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Preparation Strategy */}
        <section className="bg-gray-50 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Step-by-Step Preparation Strategy 🚀</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: 1, title: "Understand Exam Format", desc: "Know all sections clearly." },
              { step: 2, title: "Build Basics", desc: "Grammar, vocabulary, pronunciation." },
              { step: 3, title: "Practice Daily", desc: "Listening audios, reading passages, writing essays." },
              { step: 4, title: "Take Mock Tests", desc: "Simulate real exam, improve time management." },
              { step: 5, title: "Get Expert Feedback", desc: "Join coaching or mentorship for faster improvement." },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                  {item.step}
                </div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips to Score 7+ */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Tips to Score 7+ Band 🎯</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Use proper structure in writing (clear intro, body, conclusion)</li>
              <li>Speak confidently – fluency perfection</li>
              <li>Practice time management strictly</li>
            </ul>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Focus on weak areas identified through mock tests</li>
              <li>Avoid memorized answers – be natural</li>
            </ul>
          </div>
        </section>

        {/* Common Mistakes */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Common Mistakes to Avoid ❌</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "Ignoring speaking practice",
              "Poor time management",
              "Lack of vocabulary",
              "Not attempting mock tests",
            ].map((mistake, idx) => (
              <div key={idx} className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                <span className="text-red-500 text-lg">❌</span>
                <p className="text-sm text-gray-800">{mistake}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal link to IELTS Preparation Guide */}
        <section className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Need a detailed study plan?</h3>
          <p className="text-gray-700 mb-4">
            Check out our <strong>IELTS Preparation Guide</strong> for a 30‑day schedule, writing tips, and more.
          </p>
          <Link
            href="/ielts-preparation-guide"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            📘 Read IELTS Preparation Guide →
          </Link>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                q: "What is IELTS Academic exam used for?",
                a: "It is used for university admissions and student visas in English-speaking countries like Canada, UK, Australia, and USA.",
              },
              {
                q: "What is the total IELTS exam time?",
                a: "The total IELTS Academic exam time is around 2 hours 45 minutes (Listening: 30 min, Reading: 60 min, Writing: 60 min, Speaking: 11–14 min).",
              },
              {
                q: "What is the syllabus of IELTS Academic?",
                a: "The syllabus includes Listening (4 recordings), Reading (3 academic passages), Writing (Task 1: graph/chart description, Task 2: essay), and Speaking (face‑to‑face interview).",
              },
              {
                q: "How much does IELTS exam cost in India?",
                a: "The IELTS Academic exam cost in India is approximately ₹16,250–₹16,500 (varies slightly by city).",
              },
              {
                q: "Is IELTS difficult?",
                a: "It depends on your preparation. With a structured plan, regular practice, and expert guidance, scoring 7+ band is achievable.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800">{faq.q}</h3>
                <p className="text-gray-600 mt-2">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Start Your IELTS Journey Today ✈️</h2>
          <p className="text-lg mb-6">
            The IELTS Academic exam is your gateway to studying abroad and building a global future. With the right strategy,
            proper guidance, and consistent practice, scoring high is absolutely possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/free-demo"
              className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
            >
              🎓 Book Free Demo Class
            </a>
            <a
              href="https://wa.me/919428186817"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition"
            >
              💬 WhatsApp for Quick Support
            </a>
          </div>
          <div className="mt-6 text-sm">
            📞 Call: +91 7016497087 | 🌐 www.anuedu.in
          </div>
        </section>
      </main>
    </>
  );
}