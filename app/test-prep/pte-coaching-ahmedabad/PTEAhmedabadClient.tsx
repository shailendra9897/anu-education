'use client';

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

export default function PTEAhmedabadClient() {
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
            name: "PTE Coaching in Ahmedabad",
            description:
              "Online PTE coaching for Ahmedabad students with AI-based scoring, mock tests, speaking practice, and study abroad support.",
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
              startDate: "2026-05-01",
            },
          }),
        }}
      />

      {/* FAQ Schema */}
      <Script
        id="faq-schema-pte-ahmedabad"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is the minimum score required in PTE for study abroad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most universities require 50–65 score depending on country and course.",
                },
              },
              {
                "@type": "Question",
                name: "How many attempts are allowed for PTE exam?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "There is no fixed limit. You can retake the exam after 5 days.",
                },
              },
              {
                "@type": "Question",
                name: "Can I prepare for PTE without coaching?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, but expert guidance helps you improve faster and avoid mistakes.",
                },
              },
              {
                "@type": "Question",
                name: "What is the validity of PTE score?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "PTE score is valid for 2 years from the exam date.",
                },
              },
              {
                "@type": "Question",
                name: "Do you provide flexible timings for working students?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we offer flexible batches suitable for students and working professionals.",
                },
              },
              {
                "@type": "Question",
                name: "Is PTE accepted in Canada and UK?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, PTE is accepted by most universities in Canada, UK, and Australia.",
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
                Best PTE Coaching in Ahmedabad
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Online Classes for Fast Results
                </span>
              </h1>
              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Ahmedabad has become a major hub for students planning to study abroad, and PTE is now one of the fastest‑growing English proficiency tests.
                With ANU Education, students in Ahmedabad can prepare for PTE from home through live online classes, expert guidance, and real exam strategies 
                designed to help you achieve your target score quickly.
              </p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="https://www.anuedu.in/free-demo"
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
                <span className="flex items-center gap-2">✅ 1500+ Students Trained</span>
                <span className="flex items-center gap-2">✅ 94% Success Rate</span>
                <span className="flex items-center gap-2">✅ Free Mock Test + Score Report</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          
          {/* Why Choose Us */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center section-title-center">Why Choose ANU Education for PTE Coaching in Ahmedabad?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "💻", title: "Live online classes from home", desc: "Join from any area – Satellite, Maninagar, Navrangpura, or Gota." },
                { icon: "🤖", title: "AI-based scoring system", desc: "Instant feedback on speaking and writing tasks." },
                { icon: "🗣️", title: "Daily speaking practice", desc: "Improve fluency with real‑time practice sessions." },
                { icon: "📝", title: "Real exam mock tests", desc: "Full‑length tests with detailed analysis." },
                { icon: "⏰", title: "Flexible timing", desc: "Morning, evening & weekend batches." },
                { icon: "🚀", title: "Fast-track preparation", desc: "Proven strategies to achieve 65+ or 79+ quickly." },
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
                <li>✅ Time management strategies</li>
              </ul>
              <ul className="space-y-3 text-gray-700">
                <li>✅ Personalized feedback</li>
                <li>✅ Practice portal access</li>
                <li>✅ Doubt‑solving sessions</li>
              </ul>
            </div>
          </section>

          {/* Local Touch */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-3">📍 Local Touch – Ahmedabad Students</h2>
            <p className="text-gray-700">
              Students from areas like <strong>Satellite, Maninagar, Navrangpura, and Gota</strong> prefer online PTE coaching to save travel time and get flexible learning options. 
              Our online platform allows you to learn anytime, anywhere with full support from expert trainers, right from the comfort of your home.
            </p>
          </div>

          {/* Demo Offer */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">🔥 Start with FREE 4 Days Classes</h2>
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
              <div className="bg-white/70 p-3 rounded-xl">✔ Live class experience</div>
              <div className="bg-white/70 p-3 rounded-xl">✔ Expert guidance</div>
              <div className="bg-white/70 p-3 rounded-xl">✔ Free mock test</div>
            </div>
            <a
              href="https://www.anuedu.in/free-demo"
              target="_blank"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition pulse"
            >
              👉 Book now
            </a>
          </section>

          {/* Internal Link to Gandhinagar Page */}
          <div className="bg-blue-50 p-6 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">📍 Also serving nearby cities</h3>
            <p className="text-gray-700 mb-4">If you're in Gandhinagar, explore our dedicated PTE coaching there.</p>
            <Link href="/test-prep/pte-coaching-gandhinagar" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition">
              View PTE Coaching in Gandhinagar →
            </Link>
          </div>

          {/* FAQ Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">❓ Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: "What is the minimum score required in PTE for study abroad?", a: "Most universities require 50–65 score depending on country and course." },
                { q: "How many attempts are allowed for PTE exam?", a: "There is no fixed limit. You can retake the exam after 5 days." },
                { q: "Can I prepare for PTE without coaching?", a: "Yes, but expert guidance helps you improve faster and avoid mistakes." },
                { q: "What is the validity of PTE score?", a: "PTE score is valid for 2 years from the exam date." },
                { q: "Do you provide flexible timings for working students?", a: "Yes, we offer flexible batches suitable for students and working professionals." },
                { q: "Is PTE accepted in Canada and UK?", a: "Yes, PTE is accepted by most universities in Canada, UK, and Australia." },
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
              <h2 className="text-3xl font-bold mb-4">Join Best PTE Coaching in Ahmedabad Today</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://www.anuedu.in/free-demo" target="_blank" className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition">👉 Enroll Now</a>
                <a href="tel:+917016497087" className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">📞 Call: 7016497087</a>
                <a href="https://wa.me/919428186817" target="_blank" className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">💬 WhatsApp</a>
              </div>
              <p className="mt-6 text-sm text-white/80">Limited seats per batch – secure your spot now.</p>
            </div>
          </section>

          {/* Footer Internal Links */}
          <div className="text-center text-sm text-gray-500 border-t pt-8">
            <p>
              Related: <Link href="/test-prep/pte-coaching-gandhinagar" className="text-blue-600 hover:underline">PTE Coaching in Gandhinagar</Link> | 
              <Link href="/test-prep/ielts-coaching-ahmedabad" className="text-blue-600 hover:underline ml-1"> IELTS Coaching Ahmedabad</Link> | 
              <Link href="/study-abroad" className="text-blue-600 hover:underline ml-1"> Study Abroad</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}