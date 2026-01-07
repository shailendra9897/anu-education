import Script from "next/script";

export const metadata = {
  title: "Study in Germany | Free Education & PR Opportunities – ANU Education",
  description:
    "Study in Germany for Indian students. Free public universities, top engineering & IT courses, low cost education, work while studying, and PR opportunities. Apply with ANU Education.",
};

export default function GermanyPage() {
  return (
    <>
      {/* FAQ SCHEMA */}
      <Script
        id="faq-schema-germany"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is APS certificate mandatory for Indian students to study in Germany?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Yes, APS certificate is mandatory for most Indian students applying to German universities and for student visa processing."
                }
              },
              {
                "@type": "Question",
                "name": "What is a blocked account and how much money is required?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "A blocked account is required to prove financial capability. Currently, students need approximately €11,208 per year, released monthly after arrival in Germany."
                }
              },
              {
                "@type": "Question",
                "name": "Is education free in Germany?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Most public universities in Germany offer free or very low tuition fees. Students usually pay only a semester contribution."
                }
              },
              {
                "@type": "Question",
                "name": "Do Indian students need IELTS or German language?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "English-taught programs require IELTS, while German-taught programs require German language proficiency such as A2 or B1 level."
                }
              },
              {
                "@type": "Question",
                "name": "Can Indian students work and get PR in Germany?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Yes, students can work part-time during studies and get an 18-month job search visa after graduation. Permanent Residency is possible after working for a few years."
                }
              }
            ]
          }),
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* Hero */}
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
          Study in Germany for Indian Students
        </h1>
        <p className="text-gray-700 text-lg">
          Germany is one of the top destinations for Indian students due to its
          <strong> free public universities, world-class education, and strong job market</strong>.
          Study Engineering, IT, Data Science, Business, and more with excellent post-study opportunities.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <a
            href="/contact"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-center hover:bg-blue-700"
          >
            Apply for Germany Counselling
          </a>

          <a
            href="https://study.anuedu.in/register"
            target="_blank"
            className="bg-green-600 text-white px-6 py-3 rounded-xl text-center hover:bg-green-700"
          >
            Book Your FREE IELTS / German Class
          </a>
        </div>

        {/* Why Germany */}
        <h2 className="text-2xl font-semibold">Why Study in Germany?</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Public universities with <strong>no or very low tuition fees</strong></li>
          <li>Globally ranked universities and research institutes</li>
          <li>High demand for engineers, IT & technical professionals</li>
          <li>Work part-time (20 hours/week) while studying</li>
          <li>Strong pathway to <strong>Permanent Residency (PR)</strong></li>
        </ul>

        {/* Popular Courses */}
        <h2 className="text-2xl font-semibold">Popular Courses in Germany</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Mechanical, Automobile & Electrical Engineering</li>
          <li>Computer Science, AI & Data Science</li>
          <li>Business Analytics & Management</li>
          <li>Renewable Energy & Environmental Engineering</li>
          <li>Robotics & Industry 4.0</li>
        </ul>

        {/* Cost */}
        <h2 className="text-2xl font-semibold">Cost of Study & Living</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Tuition Fees: <strong>€0 – €1,500 per year</strong> (public universities)</li>
          <li>Living Cost: €850 – €1,000 per month</li>
          <li>Blocked Account: Approx. €11,208 per year</li>
        </ul>

        {/* APS Certificate */}
        <h2 className="text-2xl font-semibold">APS Certificate (Mandatory for Indian Students)</h2>
        <p className="text-gray-700">
          The APS Certificate is an academic verification required for Indian students applying to German universities
          and for student visa processing. Without APS, applications may be rejected.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Mandatory for most Bachelor’s & Master’s applicants</li>
          <li>Issued by Academic Evaluation Centre (APS), Germany</li>
          <li>Processing time: 4–8 weeks</li>
        </ul>

        {/* Blocked Account */}
        <h2 className="text-2xl font-semibold">Blocked Account (Sperrkonto)</h2>
        <p className="text-gray-700">
          A blocked account is financial proof required for the German student visa. The deposited amount
          is released monthly after arrival in Germany.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Required amount: approx. €11,208</li>
          <li>Monthly allowance: around €934</li>
          <li>Mandatory for visa approval</li>
        </ul>

        {/* Work & PR */}
        <h2 className="text-2xl font-semibold">Work Opportunities & PR</h2>
        <p className="text-gray-700">
          Students can work <strong>120 full days or 240 half days</strong> per year.
          After graduation, students receive an <strong>18-month job search visa</strong>.
          Permanent Residency is possible after working for a few years.
        </p>

        {/* Final CTA */}
        <div className="bg-blue-50 p-6 rounded-xl text-center space-y-4">
          <h3 className="text-xl font-semibold text-blue-700">
            Start Your Germany Study Journey with ANU Education
          </h3>
          <p className="text-gray-700">
            Get expert guidance on universities, APS, blocked account, visa, and language preparation.
          </p>
          <a
            href="https://study.anuedu.in/register"
            target="_blank"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700"
          >
            Book Your FREE IELTS / German Class
          </a>
        </div>

      </div>
    </>
  );
}