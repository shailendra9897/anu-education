import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online German, French & Spoken English Classes | ANU Education",
  description:
    "Join online German, French, and Spoken English classes with ANU Education. Live interactive sessions, beginner-friendly training, and expert guidance for study abroad, Canada PR, and career growth.",
  keywords:
    "German classes, French classes, spoken English course, learn languages online, TEF Canada, Goethe",
  alternates: {
    canonical: "https://www.anuedu.in/languages",
  },
  openGraph: {
    title: "Language Classes for Study Abroad & Career Growth | ANU Education",
    description:
      "Learn German, French, and Spoken English online. Live interactive classes with certified trainers. Prepare for study abroad, Canada PR, and global careers.",
    url: "https://www.anuedu.in/languages",
    type: "website",
    images: [
      {
        url: "/images/languages-og.jpg",
        width: 1200,
        height: 630,
        alt: "Online Language Classes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Language Classes | German, French & Spoken English",
    description: "Live, interactive language courses for study abroad and career success.",
    images: ["/images/languages-og.jpg"],
  },
  // Added robots and verification metadata
  robots: "index, follow",
  verification: {
    google: "YOUR_GOOGLE_SITE_VERIFICATION_TOKEN",
  },
};

export default function LanguagesPage() {
  return (
    <>
      {/* EducationalOrganization Schema */}
      <script
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
            email: "info@anuedu.in",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Modasa",
              addressRegion: "Gujarat",
              addressCountry: "India",
            },
          }),
        }}
      />

      {/* BreadcrumbList Schema */}
      <script
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
                item: "https://www.anuedu.in",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Languages",
                item: "https://www.anuedu.in/languages",
              },
            ],
          }),
        }}
      />

      {/* Course Schema (example: German) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "Online German Language Course (A1–C1)",
            description:
              "Live online German classes for A1 to C1 levels with Goethe-certified trainers, exam and study abroad support.",
            provider: {
              "@type": "EducationalOrganization",
              name: "ANU Education",
              sameAs: "https://www.anuedu.in",
            },
            url: "https://www.anuedu.in/test-prep/german",
          }),
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-semibold">
              🌍 Live online classes | Certified trainers | Flexible timings
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Learn German, French & Spoken English Online
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master a new language from home with expert instructors. Whether you're planning to <strong>study abroad, boost your career, or apply for Canada PR</strong> – we have the right course for you.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/free-demo"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition"
              >
                🎓 Book Free Demo
              </a>
              <a
                href="https://wa.me/919428186817"
                target="_blank"
                rel="noreferrer"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition"
              >
                💬 WhatsApp Guidance
              </a>
            </div>
          </div>

          {/* Language Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* German */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition group">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="text-4xl mb-2">🇩🇪</div>
                <h2 className="text-2xl font-bold">German</h2>
                <p className="text-white/90 mt-1">A1 – C1 | Goethe exam prep</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2">✅ Live online classes with certified C1 trainers</li>
                  <li className="flex gap-2">✅ Study in Germany / Ausbildung support</li>
                  <li className="flex gap-2">✅ Flexible morning & evening batches</li>
                </ul>
                <Link
                  href="/test-prep/german"
                  className="mt-6 inline-block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
                >
                  Explore German Classes →
                </Link>
              </div>
            </div>

            {/* French */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition group">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="text-4xl mb-2">🇫🇷</div>
                <h2 className="text-2xl font-bold">French</h2>
                <p className="text-white/90 mt-1">A1 – B2 | TEF/TCF Canada prep</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2">✅ Beginner to advanced levels (A1–B2)</li>
                  <li className="flex gap-2">✅ Specialised TEF Canada & TCF Canada coaching</li>
                  <li className="flex gap-2">✅ Boost CRS points for Canada PR</li>
                </ul>
                <a
                  href="/free-demo"
                  className="mt-6 inline-block w-full text-center bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition"
                >
                  Get French Demo →
                </a>
              </div>
            </div>

            {/* Spoken English */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition group">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                <div className="text-4xl mb-2">🗣️</div>
                <h2 className="text-2xl font-bold">Spoken English</h2>
                <p className="text-white/90 mt-1">Fluency | IELTS | Career</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2">✅ Daily conversation practice with real‑time feedback</li>
                  <li className="flex gap-2">✅ Pronunciation, grammar & vocabulary building</li>
                  <li className="flex gap-2">✅ Ideal for interviews & study abroad</li>
                </ul>
                <a
                  href="/free-demo"
                  className="mt-6 inline-block w-full text-center bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition"
                >
                  Start Spoken English →
                </a>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white p-8 rounded-3xl shadow-md text-center">
            <h2 className="text-3xl font-bold mb-8">Why learn a new language with ANU Education?</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="text-4xl mb-3">🎓</div>
                <h3 className="font-bold text-xl">Study Abroad</h3>
                <p className="text-gray-600 mt-2">Germany, France, Canada, and more – meet admission language requirements.</p>
              </div>
              <div>
                <div className="text-4xl mb-3">💼</div>
                <h3 className="font-bold text-xl">Career Growth</h3>
                <p className="text-gray-600 mt-2">Boost your CV with multilingual skills – MNCs and European employers value it.</p>
              </div>
              <div>
                <div className="text-4xl mb-3">🍁</div>
                <h3 className="font-bold text-xl">Canada PR</h3>
                <p className="text-gray-600 mt-2">TEF/TCF French gives you extra CRS points for Express Entry.</p>
              </div>
              <div>
                <div className="text-4xl mb-3">💬</div>
                <h3 className="font-bold text-xl">Communication Skills</h3>
                <p className="text-gray-600 mt-2">Confidence in speaking, writing, and presenting – essential for global opportunities.</p>
              </div>
            </div>
          </div>

          {/* FAQ Section (visible only) */}
          <div className="bg-white p-8 rounded-3xl shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-center">❓ Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              <details className="group border-b border-gray-200 pb-3">
                <summary className="font-semibold text-gray-800 cursor-pointer list-none flex justify-between items-center">
                  <span>Do you offer live online German classes?</span>
                  <span className="text-blue-600 text-xl group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-2 pl-2">Yes — we offer live interactive German classes from A1 to C1 levels with Goethe‑certified trainers. You can join from anywhere in India.</p>
              </details>
              <details className="group border-b border-gray-200 pb-3">
                <summary className="font-semibold text-gray-800 cursor-pointer list-none flex justify-between items-center">
                  <span>Are French classes available for beginners?</span>
                  <span className="text-blue-600 text-xl group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-2 pl-2">Absolutely. Our French language course starts from A1 (beginner) level and covers A2, B1, and B2, with TEF/TCF exam preparation for Canada PR.</p>
              </details>
              <details className="group border-b border-gray-200 pb-3">
                <summary className="font-semibold text-gray-800 cursor-pointer list-none flex justify-between items-center">
                  <span>Can I join spoken English classes online?</span>
                  <span className="text-blue-600 text-xl group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-2 pl-2">Yes — our spoken English course is 100% online with live sessions, pronunciation training, and daily conversation practice.</p>
              </details>
              <details className="group border-b border-gray-200 pb-3">
                <summary className="font-semibold text-gray-800 cursor-pointer list-none flex justify-between items-center">
                  <span>Which language is best for Canada PR?</span>
                  <span className="text-blue-600 text-xl group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-2 pl-2">French (TEF/TCF) gives you additional CRS points under Express Entry; we offer specialised TEF & TCF coaching.</p>
              </details>
              <details className="group border-b border-gray-200 pb-3">
                <summary className="font-semibold text-gray-800 cursor-pointer list-none flex justify-between items-center">
                  <span>How long does it take to learn German for study abroad?</span>
                  <span className="text-blue-600 text-xl group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-2 pl-2">Typically 3–6 months to reach A2/B1 level with regular classes; many students then apply for study or Ausbildung programmes.</p>
              </details>
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to start your language journey?</h2>
            <p className="text-xl mb-6">Get a free demo class – no commitment, just expert guidance.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/free-demo" className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition">🎓 Book Free Demo</a>
              <a href="https://wa.me/919428186817" target="_blank" rel="noreferrer" className="border-2 border-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition">💬 WhatsApp Guidance</a>
            </div>
            <p className="text-sm text-white/80 mt-6">Limited seats per batch – reserve your spot now.</p>
          </div>

          {/* Footer internal links */}
          <div className="text-center text-sm text-gray-500 border-t pt-6">
            <p>
              Related: <Link href="/study-in/germany" className="text-blue-600 hover:underline">Study in Germany</Link> •{" "}
              <Link href="/study-in/canada" className="text-blue-600 hover:underline ml-1">Study in Canada</Link> •{" "}
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline ml-1">IELTS Online Coaching</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}