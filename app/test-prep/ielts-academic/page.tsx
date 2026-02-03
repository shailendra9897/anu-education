import Script from "next/script";

export const metadata = {
  title: "IELTS Coaching in Modasa | Achieve 8+ Band – ANU Education",
  description:
    "Achieve Band 7 to 8+ with expert IELTS coaching at ANU Education, Modasa. Live online & classroom IELTS Academic, General & UKVI coaching with mock tests, speaking practice & IELTS test booking support.",
};

export default function IELTSPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* HERO */}
      <section className="space-y-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
          Achieve 8+ Band in IELTS Exam – Modasa's Trusted Coaching Centre
        </h1>
        <p className="text-lg text-gray-700">
          Live IELTS online & classroom coaching for{" "}
          <strong>IELTS Academic, IELTS General Training, and UKVI IELTS</strong>.
        </p>
        <p className="text-gray-600">
          ✔ Free Demo Class • ✔ IELTS Test Registration Support • ✔ Study Abroad Guidance
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <a
            href="https://study.anuedu.in/register"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-all font-medium"
          >
            🎓 Book Free Demo Class
          </a>
          <a
            href="https://wa.me/917016497087"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-blue-600 text-blue-600 px-8 py-3 rounded-xl hover:bg-blue-50 transition-all font-medium"
          >
            💬 WhatsApp IELTS Support
          </a>
        </div>
      </section>

      {/* WHY ANU */}
      <section>
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800">
          Why Choose ANU Education for IELTS Coaching?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <ul className="list-disc pl-6 space-y-3 text-lg text-gray-700">
            <li>Expert IELTS Trainers (IDP & British Council trained)</li>
            <li>Complete IELTS test booking assistance (IDP & British Council)</li>
            <li>Flexible batches for students & working professionals</li>
            <li>500+ practice videos, 100+ quizzes & IELTS mock tests</li>
          </ul>
          <ul className="list-disc pl-6 space-y-3 text-lg text-gray-700">
            <li>Dedicated speaking & writing feedback with band prediction</li>
            <li>Live doubt-clearing sessions</li>
            <li>Personalized study plans</li>
            <li>Guaranteed band improvement</li>
          </ul>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center text-gray-800">
          IELTS Success Stories from Modasa & Gujarat
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
                RP
              </div>
              <div>
                <p className="font-semibold text-gray-800">Ravi Patel</p>
                <p className="text-sm text-green-600 font-bold">Band 7.0</p>
              </div>
            </div>
            <p>"Booked my IELTS test and scored Band 7.0 with ANU's structured coaching!"</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
                PS
              </div>
              <div>
                <p className="font-semibold text-gray-800">Priya Shah</p>
                <p className="text-sm text-green-600 font-bold">Band 7.5</p>
              </div>
            </div>
            <p>"Scored 7.5 overall with 9.0 in Reading. Perfect for UK university!"</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
                AD
              </div>
              <div>
                <p className="font-semibold text-gray-800">Amit Desai</p>
                <p className="text-sm text-green-600 font-bold">Band 8.0</p>
              </div>
            </div>
            <p>"Working professional friendly batches. Achieved my dream score!"</p>
          </div>
        </div>
      </section>

      {/* COURSE FEATURES */}
      <section>
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800">
          Complete IELTS Course Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🎤</span>
            </div>
            <h3 className="font-semibold mb-2">IELTS Speaking Mastery</h3>
            <p>1:1 practice with certified trainers + cue card strategies</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">✍️</span>
            </div>
            <h3 className="font-semibold mb-2">IELTS Writing Correction</h3>
            <p>Task 1 & 2 band-level feedback + vocabulary booster</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold mb-2">Mock Tests & Analytics</h3>
            <p>20+ full-length tests with detailed performance reports</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="font-semibold mb-2">Study Abroad Support</h3>
            <p>SOP guidance + university shortlisting for Canada/UK/Australia</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="font-semibold mb-2">24/7 Support</h3>
            <p>WhatsApp doubt clearing + weekly progress tracking</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold mb-2">Band Guarantee</h3>
            <p>Structured 6-week program for 2+ band improvement</p>
          </div>
        </div>
      </section>

      {/* TRAINERS */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center text-gray-800">
            Meet Our Expert IELTS Trainers
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
                AS
              </div>
              <h3 className="font-semibold mb-2">Anu Sharma</h3>
              <p className="text-sm text-gray-600 mb-2">Senior IELTS Trainer</p>
              <p className="text-xs text-blue-600">18+ years experience</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
                AP
              </div>
              <h3 className="font-semibold mb-2">Ambrish Patel</h3>
              <p className="text-sm text-gray-600 mb-2">IELTS Online Specialist</p>
              <p className="text-xs text-blue-600">Ahmedabad Lead Trainer</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
                RD
              </div>
              <h3 className="font-semibold mb-2">Rupal Desai</h3>
              <p className="text-sm text-gray-600 mb-2">IELTS & PTE Expert</p>
              <p className="text-xs text-blue-600">Writing Specialist</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
                NT
              </div>
              <h3 className="font-semibold mb-2">Navin Trivedi</h3>
              <p className="text-sm text-gray-600 mb-2">Study Abroad Mentor</p>
              <p className="text-xs text-blue-600">Visa Consultant</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section>
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800">
          ANU Education vs Other IELTS Coaching
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 bg-white rounded-xl shadow-lg">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <th className="border border-gray-300 p-4 text-left font-semibold">Feature</th>
                <th className="border border-gray-300 p-4 text-center font-semibold">ANU Education</th>
                <th className="border border-gray-300 p-4 text-center font-semibold">Others</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">IELTS Test Booking Support</td>
                <td className="border border-gray-300 p-4 text-center">✅ Complete Assistance</td>
                <td className="border border-gray-300 p-4 text-center">❌ DIY</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">UKVI IELTS Coaching</td>
                <td className="border border-gray-300 p-4 text-center">✅ Full Coverage</td>
                <td className="border border-gray-300 p-4 text-center">❌ Limited</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">Mock Tests & Analytics</td>
                <td className="border border-gray-300 p-4 text-center">✅ 20+ with Reports</td>
                <td className="border border-gray-300 p-4 text-center">⚠️ Basic</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">Study Abroad Counselling</td>
                <td className="border border-gray-300 p-4 text-center">✅ Free SOP + Visa</td>
                <td className="border border-gray-300 p-4 text-center">❌ Extra Cost</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">Batch Size</td>
                <td className="border border-gray-300 p-4 text-center">✅ Max 5 Students</td>
                <td className="border border-gray-300 p-4 text-center">❌ 20-30 Students</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16 px-8 rounded-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Score 8+ Band in IELTS?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Join 5,000+ students who've achieved their dream scores with ANU Education's proven IELTS coaching methodology.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <a
            href="https://study.anuedu.in/register"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-green-600 px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all inline-block"
          >
            🎓 Book FREE Demo Class Now
          </a>
          <a
            href="https://wa.me/917016497087?text=Hi%2C%20I'm%20interested%20in%20IELTS%20coaching%20in%20Modasa"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-green-600 transition-all inline-block"
          >
            💬 Chat on WhatsApp
          </a>
        </div>
        <p className="text-green-100">📅 Flexible batches | 🎯 6-week program | ✅ Modasa & Online</p>
      </section>
    </div>
  );
}

// Schema Markup - Fixed JSON
<Script
  id="ielts-schema-markup"
  type="application/ld+json"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How many bands can I score with IELTS coaching at ANU Education?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Students regularly achieve Band 7.0 to 8.0+ through structured coaching, mock tests, and expert feedback."
              }
            },
            {
              "@type": "Question",
              "name": "Do you provide IELTS test booking assistance?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Complete support for IDP IELTS and British Council IELTS test booking."
              }
            },
            {
              "@type": "Question",
              "name": "Is IELTS coaching available online?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Live online coaching with speaking practice, writing evaluation, and full mock test access."
              }
            },
            {
              "@type": "Question",
              "name": "Which IELTS modules do you cover?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "IELTS Academic, IELTS General Training, and UKVI IELTS modules."
              }
            }
          ]
        },
        {
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
              "name": "Test Preparation",
              "item": "https://www.anuedu.in/test-prep"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "IELTS Coaching Modasa",
              "item": "https://www.anuedu.in/test-prep/ielts-academic"
            }
          ]
        },
        {
          "@type": "EducationalOrganization",
          "name": "ANU Education",
          "url": "https://www.anuedu.in",
          "logo": "https://www.anuedu.in/logo.png",
          "description": "Leading IELTS coaching and study abroad consultancy in Modasa, Gujarat",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Modasa",
            "addressRegion": "Gujarat",
            "addressCountry": "IN"
          },
          "offers": {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Course",
              "name": "IELTS Coaching",
              "description": "Live IELTS Academic, General & UKVI coaching with guaranteed band improvement"
            }
          }
        }
      ]
    })
  }}
/>