'use client';

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

export default function PTEGandhinagarClient() {
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
            name: "PTE Coaching in Gandhinagar",
            description:
              "Online PTE coaching for Gandhinagar students with AI-based scoring, mock tests, speaking practice, and study abroad support.",
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
              validFrom: "2026-04-01",
            },
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "Online",
              courseWorkload: "PT2H",
              startDate: "2026-04-15",
            },
          }),
        }}
      />

      {/* FAQ Schema */}
      <Script
        id="faq-schema-pte-gandhinagar"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is PTE coaching available online for Gandhinagar students?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, live interactive classes are available online for students across Gandhinagar, including Sector 21, Kudasan, and nearby areas.",
                },
              },
              {
                "@type": "Question",
                name: "How long does PTE preparation take?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Usually 2–4 weeks with our structured online program.",
                },
              },
              {
                "@type": "Question",
                name: "Do you provide mock tests?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, full-length AI‑scored mock tests included with detailed feedback.",
                },
              },
              {
                "@type": "Question",
                name: "Is PTE better than IELTS?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Many students prefer PTE due to faster results (48 hours), AI‑based scoring, and predictable format.",
                },
              },
              {
                "@type": "Question",
                name: "What is the class timing for PTE coaching in Gandhinagar?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Flexible timings – morning, evening, and weekend batches available. You can choose as per your schedule.",
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
          background: linear-gradient(90deg, #3b82f6, #22c55e);
          border-radius: 2px;
        }
        .section-title-center::after {
          left: 50%;
          transform: translateX(-50%);
        }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                🎯 Online | AI Scoring | Free 4‑Day Demo
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Best PTE Coaching in Gandhinagar
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Online Classes for Fast Score
                </span>
              </h1>
              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Students in Gandhinagar who are planning to study abroad are increasingly choosing PTE as a faster and more flexible English test.
                With ANU Education, you can now prepare for PTE from the comfort of your home. Our online PTE coaching program is designed 
                to help students in Gandhinagar improve their scores with real exam strategies, speaking practice, and expert guidance.
              </p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="https://study.anuedu.in/register"
                  target="_blank"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  🔥 Start Free 4‑Day Demo
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a
                  href="https://wa.me/919428186817"
                  target="_blank"
                  className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
                >
                  💬 WhatsApp for Guidance
                </a>
              </div>
              <div className="animate-up stagger-4 flex flex-wrap justify-center gap-6 mt-8 text-sm">
                <span className="flex items-center gap-2">✅ 1000+ Students Trained</span>
                <span className="flex items-center gap-2">✅ 92% Success Rate</span>
                <span className="flex items-center gap-2">✅ Free Mock Test + Score Report</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          
          {/* Why Choose Us */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center section-title-center">Why ANU Education is Best for PTE Coaching in Gandhinagar?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "💻", title: "Live online classes from home", desc: "Join from anywhere – Sector 21, Kudasan, or any part of Gandhinagar." },
                { icon: "🤖", title: "AI‑based scoring & practice", desc: "Instant feedback on speaking and writing tasks." },
                { icon: "🗣️", title: "Daily speaking sessions", desc: "Improve fluency with real‑time practice." },
                { icon: "📝", title: "Full mock tests with feedback", desc: "Real exam simulation and detailed analysis." },
                { icon: "⏰", title: "Flexible timing for students", desc: "Morning, evening & weekend batches." },
                { icon: "🚀", title: "Fast‑track score improvement", desc: "Proven strategies to achieve 65+ or 79+ quickly." },
              ].map((item, idx) => (
                <div key={idx} className={`animate-up stagger-${idx+1} feature-card bg-white rounded-2xl p-6 shadow-md border border-gray-100`}>
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Course Details */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Our PTE Coaching Includes:</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-3 text-gray-700">
                <li>✅ Speaking, Writing, Reading & Listening modules</li>
                <li>✅ Real exam simulation</li>
                <li>✅ Score improvement techniques</li>
              </ul>
              <ul className="space-y-3 text-gray-700">
                <li>✅ Time management strategies</li>
                <li>✅ Personal feedback on performance</li>
                <li>✅ Practice portal access</li>
              </ul>
            </div>
          </section>

          {/* Demo Offer */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">🔥 Start with Free 4‑Day Demo Class</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Before joining, experience our teaching style. Live demo session, expert guidance, and a free mock test.
            </p>
            <a
              href="https://study.anuedu.in/register"
              target="_blank"
              className="mt-6 inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition pulse"
            >
              👉 Book Your Demo Now
            </a>
          </section>

          {/* Local Touch */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-3">📍 Local Touch – Gandhinagar Students</h2>
            <p className="text-gray-700">
              Many students from Gandhinagar sectors like <strong>Sector 21, Kudasan, and nearby areas</strong> prefer online PTE coaching to save time and travel.
              Our online platform allows you to learn anytime, anywhere with full support from expert trainers.
            </p>
          </div>

          {/* Study Abroad Support */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-4 text-center">🌍 Study Abroad Support</h2>
            <p className="text-center text-lg mb-6">Along with PTE coaching, we provide:</p>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">✅ University selection guidance</div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">✅ SOP & visa support</div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">✅ Country selection (Canada, UK, Australia, Germany)</div>
            </div>
          </section>

          {/* Internal Links to Related Pages */}
          <div className="bg-blue-50 p-6 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">📘 Explore More Options</h3>
            <p className="text-gray-700 mb-4">Check our IELTS coaching or PTE coaching in other cities.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/test-prep/ielts-coaching-gandhinagar" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">IELTS Coaching Gandhinagar</Link>
              <Link href="/test-prep/pte-coaching-india" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">PTE Coaching India</Link>
              <Link href="/test-prep/ielts-online" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition">IELTS Online Coaching</Link>
            </div>
          </div>

          {/* FAQ Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">❓ Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: "Is PTE coaching available online for Gandhinagar students?", a: "Yes, live interactive classes are available online for students across Gandhinagar, including Sector 21, Kudasan, and nearby areas." },
                { q: "How long does PTE preparation take?", a: "Usually 2–4 weeks with our structured online program." },
                { q: "Do you provide mock tests?", a: "Yes, full-length AI‑scored mock tests included with detailed feedback." },
                { q: "Is PTE better than IELTS?", a: "Many students prefer PTE due to faster results (48 hours), AI‑based scoring, and predictable format." },
                { q: "What is the class timing for PTE coaching in Gandhinagar?", a: "Flexible timings – morning, evening, and weekend batches available. You can choose as per your schedule." },
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
            <div className="max-w-3xl mx-auto">
              <div className="text-6xl mb-4 float">🎯</div>
              <h2 className="text-3xl font-bold mb-4">Ready to Score High in PTE?</h2>
              <p className="text-xl mb-6">Join Gandhinagar's most trusted online PTE coaching. Free 4‑day demo – no commitment.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://study.anuedu.in/register" target="_blank" className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition">👉 Enroll Now</a>
                <a href="tel:+917016497087" className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">📞 Call: 7016497087</a>
                <a href="https://wa.me/919428186817" target="_blank" className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">💬 WhatsApp</a>
              </div>
              <p className="mt-6 text-sm text-white/80">Limited seats per batch – secure your spot now.</p>
            </div>
          </section>

          {/* Footer Internal Links */}
          <div className="text-center text-sm text-gray-500 border-t pt-8">
            <p>
              Related: <Link href="/test-prep/ielts-coaching-gandhinagar" className="text-blue-600 hover:underline">IELTS Coaching Gandhinagar</Link> | 
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline ml-1"> PTE Coaching India</Link> | 
              <Link href="/study-abroad" className="text-blue-600 hover:underline ml-1"> Study Abroad</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}