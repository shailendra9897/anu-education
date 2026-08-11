import Script from "next/script";

export const metadata = {
  title:
    "Study Abroad Prep 2026: IELTS, PTE, German & French Courses Compared | ANU Education",
  description:
    "Compare IELTS, PTE, German & French courses for study abroad 2026. Daily routines, success stories, common mistakes & a 12-week study plan for Germany, UK, Canada & Europe.",
};

export default function StudyAbroadPrep2026() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

      {/* HERO */}
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
          Study Abroad Prep 2026: IELTS, PTE, German & French Courses Compared
        </h1>
        <p className="text-gray-700 text-lg">
          Preparing for study abroad in 2026? Choosing the right language or test
          preparation course can decide your <strong>visa approval, university
          admission, and long-term success</strong>.
        </p>
      </section>

      {/* DAILY ROUTINE */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          Daily 30-Minute Study Routines for Success
        </h2>

        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>IELTS Reading:</strong> 30 minutes of skimming & scanning
            practice daily. Ideal for UK & Canada.
          </li>
          <li>
            <strong>PTE Speaking:</strong> Record answers daily to improve
            fluency and pronunciation.
          </li>
          <li>
            <strong>German Vocabulary:</strong> Learn 10 new words daily focusing
            on gender and sentence structure.
          </li>
          <li>
            <strong>French Listening:</strong> Short podcasts or YouTube clips to
            improve comprehension.
          </li>
        </ul>
      </section>

      {/* COMPARISON */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          IELTS vs PTE vs German vs French (2026)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">Goal</th>
                <th className="border px-3 py-2">IELTS</th>
                <th className="border px-3 py-2">PTE</th>
                <th className="border px-3 py-2">German</th>
                <th className="border px-3 py-2">French</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2">Visa Use</td>
                <td className="border px-3 py-2">UK, Canada</td>
                <td className="border px-3 py-2">Australia</td>
                <td className="border px-3 py-2">Germany</td>
                <td className="border px-3 py-2">France</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">University Admission</td>
                <td className="border px-3 py-2">Strong</td>
                <td className="border px-3 py-2">Widely Accepted</td>
                <td className="border px-3 py-2">Mandatory</td>
                <td className="border px-3 py-2">Mandatory</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">Long-term Fluency</td>
                <td className="border px-3 py-2">Moderate</td>
                <td className="border px-3 py-2">Moderate</td>
                <td className="border px-3 py-2">High</td>
                <td className="border px-3 py-2">High</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SUCCESS */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Student Success Stories</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>PTE score improved from 50 to 79 in 3 months</li>
          <li>German A1 learner secured job opportunity in Berlin</li>
          <li>IELTS band improved from 6.0 to 7.5</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="bg-blue-50 p-6 rounded-xl text-center space-y-4">
        <h3 className="text-xl font-semibold text-blue-700">
          Ready for Study Abroad in 2026?
        </h3>
        <p className="text-gray-700">
          Get expert guidance for IELTS, PTE, German & French preparation with
          free counselling.
        </p>
        <a
          href="https://study.anuedu.in/register"
          target="_blank"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700"
        >
          Book FREE Guidance
        </a>
      </section>

      {/* FAQ SCHEMA */}
      <Script
        id="faq-study-abroad-prep"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Which exam is better for study abroad in 2026: IELTS or PTE?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "IELTS is widely accepted for the UK and Canada, while PTE is popular for Australia. Choice depends on destination and university requirements."
                }
              },
              {
                "@type": "Question",
                "name": "Is German language mandatory for studying in Germany?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Yes, German language proficiency is mandatory for most public universities in Germany, especially for German-taught programs."
                }
              },
              {
                "@type": "Question",
                "name": "Can I study abroad without IELTS?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Some universities accept PTE or German/French language proficiency depending on the country and program."
                }
              }
            ]
          })
        }}
      />

      {/* BREADCRUMB SCHEMA */}
      <Script
        id="breadcrumb-study-abroad-prep"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.anuedu.in/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://www.anuedu.in/blog"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Study Abroad Prep 2026",
                "item":
                  "https://www.anuedu.in/blog/study-abroad-prep-2026"
              }
            ]
          })
        }}
      />
    </div>
  );
}