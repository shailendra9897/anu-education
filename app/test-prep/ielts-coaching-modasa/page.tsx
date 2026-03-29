import Script from "next/script";
import { 
  BookOpenIcon, 
  ChatBubbleLeftRightIcon, 
  PencilSquareIcon, 
  AcademicCapIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  MapPinIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

export const metadata = {
  title: "IELTS Coaching in Modasa | Best Classes Near You – ANU Education",
  description:
    "Looking for IELTS coaching in Modasa? Join ANU Education for expert training, speaking practice, and mock tests. Trusted by students from Modasa & nearby areas.",
};

export default function IELTSModasaPage() {
  return (
    <>
      {/* FAQ Schema */}
      <Script
        id="faq-schema-ielts-modasa"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Which is the best IELTS coaching in Modasa?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "ANU Education is one of the trusted IELTS coaching centers in Modasa with expert trainers and proven results.",
                },
              },
              {
                "@type": "Question",
                name: "Do you provide IELTS coaching near me in Modasa?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we provide IELTS coaching for students in Modasa and nearby areas like Himmatnagar and Idar.",
                },
              },
              {
                "@type": "Question",
                name: "Do you provide speaking practice and mock tests?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we provide regular speaking practice sessions and full-length mock tests with feedback.",
                },
              },
            ],
          }),
        }}
      />

      {/* LocalBusiness Schema */}
      <Script
        id="localbusiness-schema-ielts-modasa"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "ANU Education",
            description:
              "IELTS coaching center in Modasa offering expert training, speaking practice, and mock tests.",
            url: "https://anueducation.com/ielts-modasa",
            areaServed: ["Modasa", "Himmatnagar", "Idar"],
            address: {
              "@type": "PostalAddress",
              addressLocality: "Modasa",
              addressRegion: "Gujarat",
              addressCountry: "IN",
            },
            offers: {
              "@type": "Course",
              name: "IELTS Coaching Program",
              description: "Complete IELTS preparation including speaking, writing, reading, listening, mock tests.",
            },
          }),
        }}
      />

      <main>
        {/* Hero Section with Gradient Background */}
        <div className="relative bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              IELTS Coaching in Modasa
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Achieve your target band score with expert trainers, mock tests, and personalized guidance.
            </p>
            <div className="mt-8">
              <a
                href="/free-demo"
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition transform hover:scale-105"
              >
                🎯 Book Your Free Demo
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
          
          {/* Intro Text */}
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-lg text-gray-700">
              Looking for the best IELTS coaching in Modasa? ANU Education provides expert guidance, practical training, and proven strategies to help you achieve your target band score.
            </p>
          </div>

          {/* Trusted Local Section with Icon */}
          <div className="bg-blue-50 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <MapPinIcon className="h-8 w-8 text-blue-700" />
              <h2 className="text-2xl font-bold text-gray-800">
                Trusted IELTS Classes in Modasa & Nearby Areas
              </h2>
            </div>
            <p className="text-gray-700 mb-3">
              Students from Modasa, Himmatnagar, Idar, and nearby areas trust ANU Education for IELTS coaching. We focus on improving speaking confidence, writing skills, and overall band score.
            </p>
            <p className="text-gray-700">
              Our coaching includes both classroom training and online IELTS classes for flexible learning.
            </p>
          </div>

          {/* Features Grid */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              What You Get in Our IELTS Coaching
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: AcademicCapIcon, title: "Expert IELTS Trainers", desc: "Certified instructors with years of experience" },
                { icon: ChatBubbleLeftRightIcon, title: "Daily Speaking Practice", desc: "Improve fluency and confidence" },
                { icon: PencilSquareIcon, title: "Writing Correction", desc: "Detailed feedback on essays & letters" },
                { icon: BookOpenIcon, title: "Full-length Mock Tests", desc: "Real exam simulation with analysis" },
                { icon: CheckBadgeIcon, title: "Personalized Attention", desc: "Small batch sizes for better learning" },
                { icon: GlobeAltIcon, title: "Online & Offline Classes", desc: "Flexible learning options" },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
                  <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose */}
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Why Choose ANU Education in Modasa?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Convenient location for Modasa students",
                "Flexible batch timings (morning/evening/weekend)",
                "Friendly and supportive environment",
                "Proven student success results",
                "Affordable fees with EMI options",
                "Free demo class before enrollment",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckBadgeIcon className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Section 1: Complete Preparation Support */}
          <div className="border-l-4 border-blue-600 bg-blue-50/30 p-6 rounded-r-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              IELTS Coaching in Modasa – Complete Preparation Support
            </h2>
            <p className="text-gray-700 mb-3">
              If you are searching for IELTS coaching in Modasa, IELTS institute in Modasa, or IELTS classes in Modasa Gujarat, ANU Education provides complete training with expert guidance.
            </p>
            <p className="text-gray-700 mb-3">
              We offer structured IELTS preparation in Modasa including speaking practice, writing correction, and real exam strategies to help students achieve higher band scores.
            </p>
            <p className="text-gray-700">
              Our institute is trusted by students looking for the best IELTS coaching in Modasa with flexible batches and personalized support.
            </p>
          </div>

          {/* New Section 2: Training & Demo Classes */}
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CalendarDaysIcon className="h-7 w-7 text-blue-600" />
              IELTS Training & Demo Classes in Modasa
            </h2>
            <p className="text-gray-700 mb-3">
              We provide IELTS training in Modasa city center with both offline and online learning options. Students can also join an IELTS demo class in Modasa to understand our teaching approach before starting.
            </p>
            <p className="text-gray-700">
              Our IELTS online coaching in Modasa is ideal for students who prefer learning from home with live classes and flexible timing.
            </p>
          </div>

          {/* New Section 3: Exam & Registration Guidance */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              IELTS Exam & Registration Guidance
            </h2>
            <p className="text-gray-700 mb-3">
              We also guide students for IELTS exam registration in Modasa, including support for booking tests through official partners like British Council IELTS and IDP IELTS.
            </p>
            <p className="text-gray-700">
              Our experts help you choose the right test date and prepare effectively to achieve your target band score.
            </p>
          </div>

          {/* CTA Banner */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-center text-white shadow-xl">
            <h3 className="text-2xl font-bold mb-3">
              🎯 Start Your IELTS Preparation Today
            </h3>
            <p className="text-green-100 mb-6 max-w-lg mx-auto">
              Book your demo session and begin your IELTS journey with expert guidance.
            </p>
            <a
              href="/free-demo"
              className="inline-block bg-white text-green-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
            >
              Book Demo Session →
            </a>
          </div>

          {/* Internal Links */}
          <div className="text-center text-gray-600 border-t pt-6">
            <p>
              You can also explore{" "}
              <a href="/test-prep/ielts-online" className="text-blue-600 font-medium hover:underline">
                IELTS online coaching
              </a>{" "}
              or read our{" "}
              <a href="/ielts-preparation-guide" className="text-blue-600 font-medium hover:underline">
                IELTS preparation guide
              </a>.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}