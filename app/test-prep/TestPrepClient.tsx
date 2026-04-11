'use client';

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

export default function TestPrepClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      {/* FAQ Schema */}
      <Script
        id="faq-schema-test-prep"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Which test should I take for study abroad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "It depends on your destination. IELTS/PTE for English proficiency, German for Germany, GRE/GMAT for graduate programs, SAT for undergraduate, TOEFL/Duolingo as alternatives.",
                },
              },
              {
                "@type": "Question",
                name: "Do you offer free demo classes?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we offer a 3‑day free demo for most courses. Register on our website to book your slot.",
                },
              },
              {
                "@type": "Question",
                name: "What is the duration of your courses?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Courses range from 4 to 12 weeks depending on the exam and your target score.",
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
        .animate-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
        .animate-left { animation: fadeInLeft 0.8s ease-out forwards; opacity: 0; }
        .animate-right { animation: fadeInRight 0.8s ease-out forwards; opacity: 0; }
        .float { animation: float 3s ease-in-out infinite; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .course-card { transition: all 0.3s ease; }
        .course-card:hover { transform: translateY(-5px); box-shadow: 0 20px 30px -10px rgba(0,0,0,0.15); }
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
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                🎯 Live Classes | Mock Tests | Expert Trainers
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Test Preparation Courses
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  at ANU Education
                </span>
              </h1>
              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Prepare for IELTS, PTE, German, GRE, GMAT, SAT, TOEFL, and Duolingo with expert trainers, 
                mock tests, and personalized score improvement strategies.
              </p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="https://www.anuedu.in/free-demo"
                  target="_blank"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  🎓 Book Free Demo
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
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          
          {/* Main Course Grid */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center section-title-center">Our Test Preparation Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* IELTS Online */}
              <div className="course-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg">
                <div className="text-3xl mb-3">📘</div>
                <h3 className="text-2xl font-bold mb-2">IELTS Online Coaching</h3>
                <p className="text-gray-600 mb-4">Live interactive classes, 15+ mock tests, AI‑based performance analysis.</p>
                <Link href="/test-prep/ielts-online" className="text-green-600 font-semibold hover:underline">View Details →</Link>
              </div>

              {/* IELTS Academic */}
              <div className="course-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg">
                <div className="text-3xl mb-3">📚</div>
                <h3 className="text-2xl font-bold mb-2">IELTS Academic</h3>
                <p className="text-gray-600 mb-4">Comprehensive training for students planning to study abroad.</p>
                <Link href="/test-prep/ielts-academic" className="text-green-600 font-semibold hover:underline">View Details →</Link>
              </div>

              {/* PTE */}
              <div className="course-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-2xl font-bold mb-2">PTE Coaching</h3>
                <p className="text-gray-600 mb-4">AI‑scored mock tests, live classes, achieve 65+ and 79+ scores.</p>
                <Link href="/test-prep/pte" className="text-green-600 font-semibold hover:underline">View Details →</Link>
              </div>

              {/* German */}
              <div className="course-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg">
                <div className="text-3xl mb-3">🇩🇪</div>
                <h3 className="text-2xl font-bold mb-2">German Language</h3>
                <p className="text-gray-600 mb-4">A1 to B2 classes for students planning to study/work in Germany.</p>
                <Link href="/test-prep/german" className="text-green-600 font-semibold hover:underline">View Details →</Link>
              </div>

              {/* GRE */}
              <div className="course-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-2xl font-bold mb-2">GRE Coaching</h3>
                <p className="text-gray-600 mb-4">Quant, Verbal, AWA training for MS admissions abroad.</p>
                <Link href="/test-prep/gre" className="text-green-600 font-semibold hover:underline">View Details →</Link>
              </div>

              {/* GMAT */}
              <div className="course-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg">
                <div className="text-3xl mb-3">💼</div>
                <h3 className="text-2xl font-bold mb-2">GMAT Coaching</h3>
                <p className="text-gray-600 mb-4">Expert training for MBA aspirants with mock tests and analysis.</p>
                <Link href="/test-prep/gmat" className="text-green-600 font-semibold hover:underline">View Details →</Link>
              </div>

              {/* SAT */}
              <div className="course-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg">
                <div className="text-3xl mb-3">🎓</div>
                <h3 className="text-2xl font-bold mb-2">SAT Coaching</h3>
                <p className="text-gray-600 mb-4">Undergraduate admissions – Math & Evidence‑Based Reading.</p>
                <Link href="/test-prep/sat" className="text-green-600 font-semibold hover:underline">View Details →</Link>
              </div>

              {/* TOEFL */}
              <div className="course-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg">
                <div className="text-3xl mb-3">🌍</div>
                <h3 className="text-2xl font-bold mb-2">TOEFL Coaching</h3>
                <p className="text-gray-600 mb-4">Reading, Listening, Speaking, Writing – structured online prep.</p>
                <Link href="/test-prep/toefl" className="text-green-600 font-semibold hover:underline">View Details →</Link>
              </div>

              {/* Duolingo */}
              <div className="course-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg">
                <div className="text-3xl mb-3">🦉</div>
                <h3 className="text-2xl font-bold mb-2">Duolingo English Test</h3>
                <p className="text-gray-600 mb-4">Adaptive practice questions and mock test simulations.</p>
                <Link href="/test-prep/duolingo" className="text-green-600 font-semibold hover:underline">View Details →</Link>
              </div>
            </div>
          </section>

          {/* City‑Specific IELTS/PTE Coaching */}
          <section className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-center section-title-center">Coaching Locations in Gujarat & India</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/test-prep/ielts-coaching-modasa" className="bg-blue-50 p-4 rounded-xl text-center hover:bg-blue-100 transition">
                <span className="font-bold block">📍 Modasa</span>
                <span className="text-sm text-gray-600">IELTS Coaching</span>
              </Link>
              <Link href="/test-prep/ielts-coaching-gandhinagar" className="bg-blue-50 p-4 rounded-xl text-center hover:bg-blue-100 transition">
                <span className="font-bold block">📍 Gandhinagar</span>
                <span className="text-sm text-gray-600">IELTS Coaching</span>
              </Link>
              <Link href="/test-prep/ielts-coaching-india" className="bg-blue-50 p-4 rounded-xl text-center hover:bg-blue-100 transition">
                <span className="font-bold block">🇮🇳 India</span>
                <span className="text-sm text-gray-600">IELTS Online</span>
              </Link>
              <Link href="/test-prep/pte-coaching-india" className="bg-green-50 p-4 rounded-xl text-center hover:bg-green-100 transition">
                <span className="font-bold block">🇮🇳 India</span>
                <span className="text-sm text-gray-600">PTE Coaching</span>
              </Link>
            </div>
            <div className="text-center mt-6">
              <p className="text-gray-600">📌 Also serving: Ahmedabad, Surat, Vadodara, Rajkot – online & offline.</p>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">❓ Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: "Which test should I take for study abroad?", a: "It depends on your destination. IELTS/PTE for English proficiency, German for Germany, GRE/GMAT for graduate programs, SAT for undergraduate, TOEFL/Duolingo as alternatives." },
                { q: "Do you offer free demo classes?", a: "Yes, we offer a 3‑day free demo for most courses. Register on our website to book your slot." },
                { q: "What is the duration of your courses?", a: "Courses range from 4 to 12 weeks depending on the exam and your target score." },
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
          <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-3xl p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="text-5xl mb-4 float">🚀</div>
              <h2 className="text-3xl font-bold mb-4">Not Sure Which Test Is Right for You?</h2>
              <p className="text-xl mb-6">Book a free counselling session and get expert guidance.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://study.anuedu.in/register" target="_blank" className="bg-white text-green-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition">Book Free Counselling</a>
                <a href="https://wa.me/919428186817" target="_blank" className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">💬 WhatsApp Now</a>
              </div>
            </div>
          </section>

          {/* Footer Internal Links */}
          <div className="text-center text-sm text-gray-500 border-t pt-8">
            <p>
              Related: <Link href="/study-abroad" className="text-blue-600 hover:underline">Study Abroad</Link> | 
              <Link href="/ielts-preparation-guide" className="text-blue-600 hover:underline ml-1"> IELTS Preparation Guide</Link> | 
              <Link href="/contact" className="text-blue-600 hover:underline ml-1"> Contact Us</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}