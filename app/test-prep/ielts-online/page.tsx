import Script from "next/script";
import Link from "next/link";

export const metadata = {
  title: "IELTS Online Coaching in Gujarat | Live Classes + Mock Tests – ANU Education",
  description:
    "Join IELTS online coaching in Gujarat with expert trainers, live classes, speaking practice and mock tests. Available in Ahmedabad, Surat, Vadodara & Modasa.",
  keywords:
    "IELTS online coaching Gujarat, IELTS coaching Ahmedabad, IELTS classes Surat, IELTS preparation online, best IELTS coaching in Gujarat",
  openGraph: {
    title: "IELTS Online Coaching in Gujarat | Live Classes & Mock Tests",
    description:
      "Expert IELTS online coaching for students in Ahmedabad, Surat, Vadodara, Rajkot & Modasa. Live classes, speaking practice, mock tests – book free demo!",
    url: "https://www.anuedu.in/test-prep/ielts-online",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/ielts-online-coaching-gujarat.jpg",
        width: 1200,
        height: 630,
        alt: "IELTS Online Coaching in Gujarat",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Online Coaching in Gujarat | ANU Education",
    description: "Join live IELTS classes with speaking practice & mock tests. Available in Ahmedabad, Surat, Vadodara.",
    images: ["/images/ielts-online-coaching-gujarat.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/ielts-online",
  },
};

export default function IELTSOnlinePage() {
  return (
    <>
      {/* Organization Schema */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "ANU Education",
            url: "https://www.anuedu.in",
            logo: "https://www.anuedu.in/logo.png",
            sameAs: [
              "https://www.facebook.com/anueducation",
              "https://www.instagram.com/anueducation",
              "https://www.youtube.com/anueducation",
            ],
            telephone: "+91 7016497087",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Modasa",
              addressRegion: "Gujarat",
              addressCountry: "India",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              reviewCount: "20",
            },
          }),
        }}
      />

      {/* Local Business Schema for Gujarat Presence */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "ANU Education IELTS Online Coaching",
            description: "IELTS online coaching serving students across Gujarat with live classes and mock tests.",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Modasa",
              addressRegion: "Gujarat",
              addressCountry: "India",
            },
            areaServed: [
              "Ahmedabad",
              "Surat",
              "Vadodara",
              "Rajkot",
              "Modasa",
              "Gandhinagar",
              "Bhavnagar",
              "Jamnagar",
            ],
            telephone: "+91 7016497087",
            priceRange: "₹₹",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              reviewCount: "20",
            },
            openingHours: "Mo-Sa 09:00-19:00",
          }),
        }}
      />

      {/* Course Schema */}
      <Script
        id="course-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "IELTS Online Coaching in Gujarat",
            description:
              "Live online IELTS classes for students in Gujarat. Includes speaking practice, writing feedback, AI mock tests, and flexible timings.",
            provider: {
              "@type": "Organization",
              name: "ANU Education",
              sameAs: "https://www.anuedu.in",
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
              availability: "https://schema.org/OnlineOnly",
              validFrom: "2026-01-01",
            },
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "Online",
              courseWorkload: "PT2H",
              startDate: "2026-04-01",
            },
          }),
        }}
      />

      {/* Enhanced FAQ Schema */}
      <Script
        id="faq-schema-ielts-online"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Which is the best IELTS online coaching in Gujarat?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "ANU Education provides expert IELTS online coaching with live classes, speaking practice and mock tests. We have trained thousands of students across Gujarat with a 98% success rate.",
                },
              },
              {
                "@type": "Question",
                name: "Can I prepare IELTS online from Gujarat?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, students across Gujarat can join our live online IELTS classes with flexible timing. We have students from Ahmedabad, Surat, Vadodara, Rajkot, Modasa, and many other cities.",
                },
              },
              {
                "@type": "Question",
                name: "Do you provide speaking practice?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we provide regular speaking sessions with feedback and band improvement strategies. Each student gets personalized speaking practice with expert trainers.",
                },
              },
              {
                "@type": "Question",
                name: "What is the duration of IELTS online coaching?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our IELTS online coaching typically runs for 4–8 weeks, depending on the batch. We offer express courses (4 weeks) and comprehensive courses (8 weeks).",
                },
              },
              {
                "@type": "Question",
                name: "Do you offer mock tests?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we provide 15+ AI-based mock tests with detailed performance analysis to help you track progress and improve your band score.",
                },
              },
            ],
          }),
        }}
      />

      <main className="max-w-6xl mx-auto px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-semibold">
            ⚡ Live Classes | Speaking Practice | Mock Tests
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700">
            IELTS Online Coaching in Gujarat
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join expert-led IELTS online coaching with live classes, speaking practice, and AI mock tests.
            Available for students in Ahmedabad, Surat, Vadodara, Rajkot & Modasa.
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-12">
          {[
            { icon: "👥", value: "10,000+", label: "Students Trained", color: "from-blue-500 to-cyan-500" },
            { icon: "⭐", value: "4.8", label: "Rating (20+ reviews)", color: "from-yellow-500 to-orange-500" },
            { icon: "🎯", value: "98%", label: "Success Rate", color: "from-green-500 to-emerald-500" },
            { icon: "🏆", value: "8+ Years", label: "Experience", color: "from-purple-500 to-pink-500" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.color} text-white rounded-2xl p-5 text-center shadow-lg hover:shadow-xl transition`}
            >
              <div className="text-3xl">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* City Coverage */}
        <section className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4">📌 IELTS Coaching Available In</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "Ahmedabad",
              "Surat",
              "Vadodara",
              "Rajkot",
              "Modasa",
              "Gandhinagar",
              "Bhavnagar",
              "Jamnagar",
              "Anand",
              "Mehsana",
              "Vapi",
              "Bharuch",
            ].map((city) => (
              <div key={city} className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span> {city}
              </div>
            ))}
          </div>
          <p className="mt-4 text-gray-600 text-sm italic">
            🎯 We also support Gujarati-English learning style, making it easier for students to understand concepts and improve speaking confidence.
          </p>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-bold mb-4">✨ Features of Our IELTS Online Coaching</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: "🎥", title: "Live Online Classes", desc: "Interactive sessions with expert trainers, recorded for revision." },
              { icon: "🗣️", title: "Speaking Practice", desc: "One-on-one sessions with feedback to boost fluency." },
              { icon: "✍️", title: "Writing Correction", desc: "Personalized feedback on essays and letters." },
              { icon: "📊", title: "AI-based Mock Tests", desc: "15+ full-length tests with performance analysis." },
              { icon: "⏰", title: "Flexible Batches", desc: "Morning, evening, and weekend batches available." },
              { icon: "📚", title: "Study Material", desc: "Latest Cambridge books and practice sheets." },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="text-2xl">{feature.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Why Gujarat Students Choose ANU Education?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              "✅ Gujarati-Friendly Teaching",
              "✅ Live Classes, Not Recordings",
              "✅ Speaking Practice Every Week",
              "✅ Flexible Timings",
              "✅ Affordable Fees",
              "✅ High Success Rate",
            ].map((point, idx) => (
              <div key={idx} className="text-center bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                {point}
              </div>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <p className="text-gray-700">
            📘 Want to know how to prepare? Read our{" "}
            <Link href="/ielts-preparation-guide" className="text-blue-600 font-semibold underline">
              IELTS Preparation Guide
            </Link>{" "}
            or check our{" "}
            <Link href="/test-prep/ielts-coaching-india" className="text-blue-600 font-semibold underline">
              IELTS Coaching in India
            </Link>{" "}
            for more options.
          </p>
        </div>

        {/* FAQ Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">❓ Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                q: "Which is the best IELTS online coaching in Gujarat?",
                a: "ANU Education provides expert IELTS online coaching with live classes, speaking practice and mock tests. We have trained thousands of students across Gujarat with a 98% success rate.",
              },
              {
                q: "Can I prepare IELTS online from Gujarat?",
                a: "Yes, students across Gujarat can join our live online IELTS classes with flexible timing. We have students from Ahmedabad, Surat, Vadodara, Rajkot, Modasa, and many other cities.",
              },
              {
                q: "Do you provide speaking practice?",
                a: "Yes, we provide regular speaking sessions with feedback and band improvement strategies. Each student gets personalized speaking practice with expert trainers.",
              },
              {
                q: "What is the duration of IELTS online coaching?",
                a: "Our IELTS online coaching typically runs for 4–8 weeks, depending on the batch. We offer express courses (4 weeks) and comprehensive courses (8 weeks).",
              },
              {
                q: "Do you offer mock tests?",
                a: "Yes, we provide 15+ AI-based mock tests with detailed performance analysis to help you track progress and improve your band score.",
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Start Your IELTS Journey Today!</h2>
          <p className="mb-6">Join Gujarat’s most trusted IELTS online coaching and get personalized guidance to achieve your target band score.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/free-demo"
              className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
            >
              🎓 Book Free Demo Session
            </a>
            <a
              href="https://wa.me/919428186817"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition"
            >
              💬 Chat on WhatsApp
            </a>
          </div>
          <p className="mt-4 text-sm">📞 Call: +91 7016497087 | 🌐 www.anuedu.in</p>
        </div>
      </main>
    </>
  );
}