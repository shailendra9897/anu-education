import Script from "next/script";
import Link from "next/link";

export const metadata = {
  title: "PTE Coaching in Modasa | Best PTE Classes Near You – ANU Education",
  description:
    "Looking for PTE coaching in Modasa? Join ANU Education for AI-based practice, mock tests, and expert guidance. Trusted by students from Modasa, Himmatnagar, Meghraj, Bayad & nearby areas.",
  keywords:
    "PTE coaching in Modasa, PTE classes near me, PTE institute Modasa, PTE online coaching Meghraj, PTE training Bayad, best PTE coaching in Gujarat",
  openGraph: {
    title: "PTE Coaching in Modasa – ANU Education",
    description:
      "Expert PTE coaching in Modasa with AI mock tests, flexible online classes, and high success rate. Serving Modasa, Himmatnagar, Meghraj, Bayad & nearby towns.",
    url: "https://www.anuedu.in/test-prep/pte-coaching-modasa",
    siteName: "ANU Education",
    images: [
      {
        url: "/images/pte-coaching-modasa.jpg",
        width: 1200,
        height: 630,
        alt: "PTE Coaching in Modasa",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PTE Coaching in Modasa – ANU Education",
    description:
      "Join the best PTE classes in Modasa with AI practice, mock tests, and flexible online options for nearby towns.",
    images: ["/images/pte-coaching-modasa.jpg"],
  },
  alternates: {
    canonical: "https://www.anuedu.in/test-prep/pte-coaching-modasa",
  },
};

export default function PTEModasaPage() {
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
              reviewCount: "28",
            },
          }),
        }}
      />

      {/* Local Business Schema for Modasa */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "ANU Education - PTE Coaching Modasa",
            image: "https://www.anuedu.in/logo.png",
            telephone: "+91 7016497087",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Near Modasa Bus Stand",
              addressLocality: "Modasa",
              addressRegion: "Gujarat",
              postalCode: "383315",
              addressCountry: "IN",
            },
            areaServed: [
              "Modasa",
              "Himmatnagar",
              "Meghraj",
              "Bayad",
              "Dhansura",
              "Malpur",
              "Idar",
            ],
            priceRange: "₹₹",
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
            name: "PTE Coaching in Modasa",
            description:
              "Comprehensive PTE training with AI-based mock tests, speaking practice, and flexible online classes for students in Modasa and nearby towns.",
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
          }),
        }}
      />

      {/* Enhanced FAQ Schema */}
      <Script
        id="faq-schema-pte-modasa"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Which is the best PTE coaching in Modasa?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "ANU Education provides expert PTE coaching in Modasa with AI-based practice, mock tests, and flexible online options for nearby towns.",
                },
              },
              {
                "@type": "Question",
                name: "Is PTE easier than IELTS?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Many students find PTE easier due to its AI-based scoring, faster results, and predictable format.",
                },
              },
              {
                "@type": "Question",
                name: "How long does it take to prepare for PTE?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most students prepare in 2–4 weeks with proper guidance and daily practice.",
                },
              },
              {
                "@type": "Question",
                name: "Do you provide PTE mock tests?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we provide full-length PTE mock tests with performance analysis and personalized feedback.",
                },
              },
              {
                "@type": "Question",
                name: "Do you offer online PTE coaching for students outside Modasa?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we offer live online PTE classes for students in Meghraj, Bayad, Dhansura, Malpur, and other nearby towns.",
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
            🎯 AI-Based Practice | 48-Hour Results | 2-4 Weeks Prep
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700">
            PTE Coaching in Modasa
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join ANU Education for expert PTE training with AI-based mock tests, speaking practice, and flexible online classes. Trusted by students from Modasa, Himmatnagar, Meghraj, Bayad & nearby areas.
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10">
          {[
            { icon: "🤖", value: "AI-Based", label: "Scoring & Practice", color: "from-blue-500 to-cyan-500" },
            { icon: "⏱️", value: "48 Hours", label: "Results Time", color: "from-green-500 to-emerald-500" },
            { icon: "📝", value: "15+", label: "Mock Tests", color: "from-purple-500 to-pink-500" },
            { icon: "🏆", value: "98%", label: "Success Rate", color: "from-orange-500 to-red-500" },
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

        {/* Why PTE Academic */}
        <section className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4">Why Choose PTE Academic?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Computer-based exam with AI scoring (no human bias)</li>
              <li>Results within 48 hours – fastest in the industry</li>
              <li>Accepted in Australia, UK, Canada, New Zealand</li>
              <li>Predictable exam format – easier to prepare</li>
            </ul>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Speaking and writing evaluated by advanced AI</li>
              <li>Score sharing with unlimited institutions</li>
              <li>Shorter test duration (~2 hours)</li>
              <li>Immediate unofficial scores for Reading & Listening</li>
            </ul>
          </div>
          <p className="mt-4 text-gray-600 italic">
            👉 That's why demand for PTE coaching in Modasa is increasing among students planning to study abroad.
          </p>
        </section>

        {/* Features */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">What You Get in Our PTE Coaching</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              "AI-based scoring system",
              "Real exam mock tests",
              "Speaking & writing templates",
              "Daily practice sessions",
              "Personalized feedback",
              "Flexible batch timings",
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm p-3 rounded-lg text-center">
                ✅ {feature}
              </div>
            ))}
          </div>
        </section>

        {/* Local Areas Served – Enhanced with new paragraphs */}
        <section className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4">PTE Coaching Near Modasa – Nearby Areas We Serve</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              In addition to <strong>PTE coaching in Modasa</strong>, ANU Education also supports students from nearby areas like <strong>Meghraj, Bayad, Dhansura, and Malpur</strong>. Many students from these regions join our <strong>PTE online coaching</strong> to prepare effectively without travel.
            </p>
            <p>
              Our <strong>PTE online coaching in Meghraj</strong> helps students build strong English skills with expert guidance and structured practice. Similarly, learners from <strong>Bayad</strong> prefer our flexible online classes for convenient preparation.
            </p>
            <p>
              Students from <strong>Dhansura and Malpur</strong> also benefit from our PTE training programs, including mock tests, daily practice, and performance tracking. With consistent effort and expert support, achieving a high PTE score becomes easier.
            </p>
            <p>
              Whether you are in Modasa or nearby towns, our PTE coaching provides the same quality training, helping you succeed in your study abroad journey.
            </p>
          </div>
        </section>

        {/* Online + Offline Options */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-6 rounded-2xl">
            <div className="text-3xl mb-2">🏫</div>
            <h3 className="text-xl font-bold mb-2">Offline Classes in Modasa</h3>
            <p className="text-gray-700">
              Classroom coaching with face-to-face interaction, doubt clearing, and peer learning at our Modasa center.
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl">
            <div className="text-3xl mb-2">💻</div>
            <h3 className="text-xl font-bold mb-2">Online Live Classes</h3>
            <p className="text-gray-700">
              Live interactive sessions with same expert trainers, flexible timings, and recorded revision. Ideal for students from Meghraj, Bayad, Dhansura, and Malpur.
            </p>
          </div>
        </section>

        {/* Testimonials Short */}
        <section className="bg-gray-50 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">What Our Students Say</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Riya Patel", score: "PTE 79+", text: "Best PTE coaching in Modasa! The mock tests and templates helped me achieve my target in 3 weeks." },
              { name: "Jay Shah", score: "PTE 82", text: "I joined from Meghraj via online classes. The AI scoring and daily practice were game-changers." },
              { name: "Neha Desai", score: "PTE 76", text: "Flexible timings and expert guidance made all the difference. Highly recommended for nearby towns." },
            ].map((t, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-gray-700 italic">“{t.text}”</p>
                <p className="font-bold mt-2">{t.name}</p>
                <p className="text-sm text-green-600">Score: {t.score}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                q: "Which is the best PTE coaching in Modasa?",
                a: "ANU Education provides expert PTE coaching in Modasa with AI-based practice, mock tests, and flexible online options for nearby towns.",
              },
              {
                q: "Is PTE easier than IELTS?",
                a: "Many students find PTE easier due to its AI-based scoring, faster results, and predictable format.",
              },
              {
                q: "How long does it take to prepare for PTE?",
                a: "Most students prepare in 2–4 weeks with proper guidance and daily practice.",
              },
              {
                q: "Do you provide PTE mock tests?",
                a: "Yes, we provide full-length PTE mock tests with performance analysis and personalized feedback.",
              },
              {
                q: "Do you offer online PTE coaching for students outside Modasa?",
                a: "Yes, we offer live online PTE classes for students in Meghraj, Bayad, Dhansura, Malpur, and other nearby towns.",
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
          <h2 className="text-2xl font-bold mb-4">Start Your PTE Preparation Today</h2>
          <p className="text-lg mb-6">Book your free demo class and begin your PTE journey with expert guidance.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/free-demo"
              className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
            >
              🎓 Book Demo Session
            </a>
            <a
              href="https://wa.me/919428186817"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition"
            >
              💬 WhatsApp Now
            </a>
          </div>
          <p className="mt-4 text-sm">📞 Call: +91 7016497087 | 🌐 www.anuedu.in</p>
        </div>

        {/* Internal Links */}
        <div className="text-center text-sm text-gray-600 pt-4">
          <p>
            You can also explore{" "}
            <Link href="/test-prep/pte-coaching-india" className="text-blue-600 underline">
              PTE coaching in India
            </Link>{" "}
            or read our{" "}
            <Link href="/blog/ielts-vs-pte-2026" className="text-blue-600 underline">
              IELTS vs PTE comparison guide
            </Link>.
          </p>
        </div>
      </main>
    </>
  );
}