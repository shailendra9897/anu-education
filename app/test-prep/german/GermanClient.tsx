'use client';

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

export default function GermanClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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
            name: "German Language Course (A1 to B2)",
            description:
              "CEFR‑aligned online German classes with live interactive sessions, Goethe exam preparation, and flexible timings for students in Gujarat.",
            provider: {
              "@type": "Organization",
              name: "ANU Education",
              sameAs: "https://www.anuedu.in",
            },
            offers: {
              "@type": "Offer",
              price: "7500",
              priceCurrency: "INR",
              availability: "https://schema.org/OnlineOnly",
              validFrom: "2026-04-01",
            },
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "Online",
              courseWorkload: "PT60H",
              startDate: "2026-04-15",
            },
          }),
        }}
      />

      {/* FAQ Schema */}
      <Script
        id="faq-schema-german"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What makes ANU the best for “learn German” in Gujarat?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our Gujarat-centric scheduling, proven results (2000+ students trained), and live interactive classes stand out.",
                },
              },
              {
                "@type": "Question",
                name: "How do “German classes near me” work online?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Fully virtual – join from Ahmedabad, Vadodara, or Surat via our app. Live video chats make it feel like in‑person.",
                },
              },
              {
                "@type": "Question",
                name: "Details on “online German classes free 3 day classes”?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Three live 1‑hour sessions (Mon‑Wed) covering A1 introduction. Register at anuedu.in – spots fill fast!",
                },
              },
              {
                "@type": "Question",
                name: "Certification and job support?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we prepare you for Goethe‑Zertifikat exams and provide guidance for visas and jobs in Germany.",
                },
              },
              {
                "@type": "Question",
                name: "Batch timings for Vadodara/Surat?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Evening batches (IST): 7–8 PM or 8–9 PM; weekend options available.",
                },
              },
            ],
          }),
        }}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50% { box-shadow: 0 0 0 15px rgba(34,197,94,0); }
        }
        .animate-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
        .animate-left { animation: fadeInLeft 0.8s ease-out forwards; opacity: 0; }
        .animate-right { animation: fadeInRight 0.8s ease-out forwards; opacity: 0; }
        .float { animation: float 3s ease-in-out infinite; }
        .pulse { animation: pulse 2s infinite; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .feature-card { transition: all 0.3s ease; }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 20px 30px -10px rgba(0,0,0,0.15); }
        .section-title { position: relative; display: inline-block; }
        .section-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #2563eb, #22c55e);
          border-radius: 2px;
        }
        .section-title-center::after {
          left: 50%;
          transform: translateX(-50%);
        }
        .price-card { transition: all 0.3s ease; }
        .price-card:hover { transform: translateY(-10px); box-shadow: 0 25px 40px -12px rgba(0,0,0,0.2); }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                🇩🇪 CEFR A1‑B2 | Live Classes | Free 3‑Day Demo
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Learn German with ANU Education
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Gujarat’s Top Choice
                </span>
              </h1>
              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                ANU Education offers <strong>top‑rated online German classes</strong> tailored for students and professionals in 
                Ahmedabad, Vadodara, and Surat. Flexible, expert‑led courses that fit your schedule – including a free 3‑day demo.
              </p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="/free-demo"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  🎓 Register for Free Demo
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a
                  href="https://wa.me/919428186817"
                  target="_blank"
                  className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
                >
                  💬 WhatsApp for Details
                </a>
              </div>
              <div className="animate-up stagger-4 flex flex-wrap justify-center gap-6 mt-8 text-sm">
                <span className="flex items-center gap-2">✅ 2000+ Students Trained</span>
                <span className="flex items-center gap-2">✅ Goethe‑Aligned Certification</span>
                <span className="flex items-center gap-2">✅ 24/7 Doubt Support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          
          {/* Why Choose ANU */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center section-title-center">Why Choose ANU for Learning German?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "📚", title: "CEFR‑Aligned Levels (A1–B2)", desc: "Structured curriculum covering speaking, reading, writing, and listening." },
                { icon: "🎥", title: "Interactive Live Classes", desc: "Small batches with native‑trained instructors for personalised attention." },
                { icon: "💼", title: "Practical Skills", desc: "Focus on study abroad, jobs in Germany, or travel." },
                { icon: "📱", title: "Better Than Apps", desc: "Real‑time practice and feedback, not just recorded videos." },
              ].map((item, idx) => (
                <div key={idx} className={`animate-up stagger-${idx+1} feature-card bg-white rounded-2xl p-6 shadow-md border border-gray-100`}>
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Free Demo Details */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">✨ Free 3‑Day Demo Classes</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Experience our teaching style with <strong>three live sessions (Mon–Wed, 1 hour each)</strong>. 
              Learn greetings, numbers, and simple conversations – no prior knowledge needed.
            </p>
            <a href="/free-demo" className="mt-6 inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition">
              👉 Register at anuedu.in
            </a>
          </section>

          {/* Course Highlights */}
          <section>
            <h2 className="text-3xl font-bold mb-6 section-title">📚 Course Highlights</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-3 text-gray-700">
                <li>✅ <strong>Levels & Duration:</strong> A1 (60 hours) up to B2. Weekly live Zoom classes + recordings.</li>
                <li>✅ <strong>Pricing:</strong> Affordable packages starting at <strong>₹7,500</strong> (includes materials + certification prep).</li>
                <li>✅ <strong>Locations Served:</strong> Optimised for Gujarat (Ahmedabad, Vadodara, Surat) with timezone‑friendly timings.</li>
                <li>✅ <strong>Extras:</strong> Job guidance for Germany, mock Goethe exams, and 24/7 doubt support.</li>
              </ul>
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold mb-3">🎯 Upcoming Batches</h3>
                <p><strong>Weekday batch:</strong> Mon–Wed, 7–8 PM IST</p>
                <p className="mt-2"><strong>Weekend batch:</strong> Sat–Sun, 10–11 AM IST</p>
                <p className="mt-2"><strong>Free Demo:</strong> Every Monday (3 days)</p>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="overflow-x-auto">
            <h2 className="text-3xl font-bold mb-6 text-center section-title-center">🔎 Comparison</h2>
            <table className="w-full border-collapse shadow-lg rounded-2xl overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="p-4 text-left">Feature</th>
                  <th className="p-4 text-left">ANU Education</th>
                  <th className="p-4 text-left">Typical Competitors</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                <tr><td className="p-4 font-semibold">Free Trial</td><td className="p-4">3 full days live</td><td className="p-4">1 session or none</td></tr>
                <tr><td className="p-4 font-semibold">Gujarat Focus</td><td className="p-4">Ahmedabad/Vadodara/Surat</td><td className="p-4">Generic national batches</td></tr>
                <tr><td className="p-4 font-semibold">Live Interaction</td><td className="p-4">Daily practice + feedback</td><td className="p-4">Mostly self‑paced</td></tr>
                <tr><td className="p-4 font-semibold">Certification</td><td className="p-4">Goethe‑aligned</td><td className="p-4">Varies</td></tr>
              </tbody>
            </table>
          </section>

          {/* Internal Link to Study in Germany */}
          <div className="bg-blue-50 p-6 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">🇩🇪 Planning to study or work in Germany?</h3>
            <p className="text-gray-700 mb-4">German language skills are your first step. Combine our course with expert study abroad guidance.</p>
            <Link href="/study-in/germany" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
              Explore Study in Germany →
            </Link>
          </div>

          {/* FAQ Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">❓ Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: "What makes ANU the best for “learn German” in Gujarat?", a: "Our Gujarat‑centric scheduling and proven results (2000+ students trained) stand out, unlike metro‑only institutes." },
                { q: "How do “German classes near me” work online?", a: "Fully virtual – no travel needed. Join from Ahmedabad or Surat via app; feels like in‑person with video chats." },
                { q: "Details on “online German classes free 3 day classes”?", a: "Three live 1‑hour sessions (Mon‑Wed) covering A1 intro. Register at anuedu.in – spots fill fast!" },
                { q: "Certification and job support?", a: "Yes, we prepare you for Goethe‑Zertifikat and guide visas/jobs in Germany." },
                { q: "Batch timings for Vadodara/Surat?", a: "Evenings (IST): 7–8 PM or 8–9 PM; weekend options available." },
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-gray-800">{faq.q}</span>
                    <span className="text-blue-600 text-xl">{openFaq === idx ? '−' : '+'}</span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-4 text-gray-600 border-t border-gray-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your German Journey?</h2>
            <p className="text-xl mb-6">Join Gujarat’s most trusted online German classes. Free 3‑day demo – no commitment.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/free-demo" className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition">Claim Free Demo</a>
              <a href="https://wa.me/919428186817" target="_blank" className="border-2 border-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition">💬 WhatsApp Now</a>
            </div>
            <p className="mt-6 text-sm text-white/80">*Limited seats per batch. Register early to secure your spot.</p>
          </section>

          {/* Footer Internal Links */}
          <div className="text-center text-sm text-gray-500 border-t pt-8">
            <p>
              Related: <Link href="/study-in/germany" className="text-blue-600 hover:underline">Study in Germany</Link> | 
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline ml-1"> IELTS Coaching</Link> | 
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline ml-1"> PTE Coaching</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}