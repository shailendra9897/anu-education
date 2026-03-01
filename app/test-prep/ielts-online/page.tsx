import Script from "next/script";

export const metadata = {
  title: "Best IELTS Online Coaching in India | Free 3-Day Demo – ANU Education",
  description:
    "Join ANU Education's IELTS Online Coaching with live classes, 15 mock tests, AI scoring & expert trainers. Book your FREE 3-day demo today.",
  keywords:
    "IELTS online coaching, IELTS online classes India, best IELTS coaching online, IELTS mock test online, IELTS preparation online",
};

export default function IELTSOnlinePage() {
  return (
    <>
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
                name: "Is IELTS online coaching effective?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, IELTS online coaching is highly effective when it includes live classes, mock tests, and expert feedback like ANU Education provides.",
                },
              },
              {
                "@type": "Question",
                name: "How many mock tests are included?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our IELTS online course includes 15 full-length mock tests with performance analysis.",
                },
              },
              {
                "@type": "Question",
                name: "Is there a free demo class?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we provide a free 3-day IELTS demo class before enrollment.",
                },
              },
            ],
          }),
        }}
      />

      <Script
  id="course-schema"
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Course",
      name: "IELTS Online Coaching – ANU Education",
      description:
        "Comprehensive IELTS online coaching with live classes, 15 full-length mock tests, AI-based scoring, writing & speaking assessments, and free 3-day demo.",
      provider: {
        "@type": "Organization",
        name: "ANU Education",
        url: "https://www.anuedu.in",
        sameAs: [
          "https://www.instagram.com/anueducation",
          "https://www.facebook.com/anueducation"
        ]
      },
      offers: {
        "@type": "Offer",
        price: "7200",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: "https://study.anuedu.in/register"
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "23"
      }
    })
  }}
/>

<Script
  id="breadcrumb-schema"
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.anuedu.in"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Test Prep",
          item: "https://www.anuedu.in/test-prep"
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "IELTS Online Coaching",
          item: "https://www.anuedu.in/test-prep/ielts-online"
        }
      ]
    })
  }}
/>

      <main className="bg-white text-gray-800">

        {/* HERO SECTION */}
        <section className="py-14 bg-gradient-to-r from-green-50 to-white">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-6">
              Best IELTS Online Coaching in India – Live Classes + 15 Mock Tests
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Join ANU Education's expert-led IELTS online classes with AI-based scoring, 
              personalized feedback, and real exam mock tests.
            </p>

            <a
              href="https://study.anuedu.in/register"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition"
            >
              Book Free 3-Day Demo
            </a>
          </div>
        </section>

        {/* PREMIUM FEATURE GRID */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">
              Everything You Need to Improve Your IELTS Band Score
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {[
                {
                  title: "100+ Expert-Led Video Tutorials",
                  desc: "Structured live and recorded IELTS sessions covering Reading, Listening, Writing & Speaking.",
                },
                {
                  title: "Grammar & Vocabulary Mastery",
                  desc: "Improve language skills required for Band 7+ performance.",
                },
                {
                  title: "Hundreds of Practice Questions",
                  desc: "Practice real IELTS-style questions with expert solutions.",
                },
                {
                  title: "Writing Assessments",
                  desc: "Task 1 & Task 2 feedback with model Band 8+ responses.",
                },
                {
                  title: "Speaking Mock Tests",
                  desc: "1-on-1 speaking practice with band score evaluation.",
                },
                {
                  title: "15 Full-Length Mock Tests",
                  desc: "Real exam simulation with detailed performance report.",
                },
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-md">
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IELTS SECTION TABLE */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Comprehensive IELTS Module Training
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-left">
                <thead className="bg-green-100">
                  <tr>
                    <th className="p-3">Reading</th>
                    <th className="p-3">Listening</th>
                    <th className="p-3">Writing</th>
                    <th className="p-3">Speaking</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">50+ Passage Practice</td>
                    <td className="p-3">Real Audio Tests</td>
                    <td className="p-3">Task 1 & Task 2 Training</td>
                    <td className="p-3">Live Mock Interviews</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL SECTION */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">
              Trusted by 1000+ IELTS Students
            </h2>

            <p className="italic text-gray-600 mb-4">
              "ANU Education helped me achieve Band 7.5 with structured mock tests and expert feedback."
            </p>
            <p className="italic text-gray-600">
              "The 3-day demo convinced me. The best IELTS online coaching experience!"
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-14 bg-green-600 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Your IELTS Preparation Today
          </h2>
          <p className="mb-6">
            Join our FREE 3-day IELTS online demo class and boost your band score.
          </p>
          <a
            href="https://study.anuedu.in/register"
            className="bg-white text-green-700 px-8 py-3 rounded-xl font-semibold"
          >
            Start Free Demo Now
          </a>
        </section>

      </main>
    </>
  );
}