'use client';

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

export default function PTECoachingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <>
      {/* ================= SEO METADATA ================= */}
      <Script
        id="seo-metadata"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "PTE Academic Online Coaching",
            "description": "Best PTE online coaching in India with AI-based mock tests, expert trainers, and 65+ score guarantee. Join free demo class today!",
            "provider": {
              "@type": "Organization",
              "name": "ANU Education",
              "url": "https://www.anuedu.in"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR",
              "availability": "https://schema.org/OnlineOnly"
            },
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": "Online",
              "courseWorkload": "PT2H",
              "startDate": "2026-03-25"
            }
          })
        }}
      />

      {/* ================= FAQ SCHEMA ================= */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Which is the best PTE online coaching in India?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The best coaching offers expert trainers, AI mock tests, and personalized feedback. Always check reviews and demo classes before joining."
                }
              },
              {
                "@type": "Question",
                "name": "How long does it take to prepare for PTE?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most students prepare in 2–4 weeks with proper PTE course online and daily practice."
                }
              },
              {
                "@type": "Question",
                "name": "Is PTE easier than IELTS?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PTE is considered easier by many because of AI-based scoring, faster results, and predictable format."
                }
              },
              {
                "@type": "Question",
                "name": "Can I prepare for PTE at home?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! With PTE academic online coaching, you can easily prepare from home with structured guidance."
                }
              },
              {
                "@type": "Question",
                "name": "What score is required for PTE?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Generally: 50–58 for Diploma, 58–65 for Bachelor, 65+ for Master / PR applications."
                }
              }
            ]
          })
        }}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(34, 197, 94, 0);
          }
        }

        .animate-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-left {
          animation: fadeInLeft 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-right {
          animation: fadeInRight 0.8s ease-out forwards;
          opacity: 0;
        }

        .float {
          animation: float 3s ease-in-out infinite;
        }

        .pulse {
          animation: pulse 2s infinite;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }

        .feature-card {
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.15);
        }

        .section-title {
          position: relative;
          display: inline-block;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #22c55e);
          border-radius: 2px;
        }

        .step-card {
          transition: all 0.3s ease;
        }

        .step-card:hover {
          transform: translateX(5px);
        }

        .faq-question {
          transition: all 0.2s ease;
        }

        .faq-question:hover {
          background-color: #f3f4f6;
        }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* ================= HERO SECTION ================= */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                ⭐ AI-Based Scoring | Results in 48 Hours
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Best PTE Online Coaching in India
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Score 65+ in 2-4 Weeks
                </span>
              </h1>
              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
Master PTE with AI-powered practice, real exam simulations, and expert trainers. 
Join India’s best PTE online coaching and book your FREE demo class today.
</p>

<p className="text-center max-w-3xl mx-auto text-lg mb-10">
Looking for the best PTE coaching in India? ANU Education offers top-rated PTE classes in Gujarat and across India with live sessions, AI mock tests, and personalized strategies. Achieve 65+ score in just 2–4 weeks.
</p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="/free-demo"
                  className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  <span>🎓</span> Book Free Demo Class
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a
                  href="https://wa.me/919428186817"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>💬</span> WhatsApp for Quick Support
                </a>
              </div>
              <div className="animate-up stagger-4 flex flex-wrap justify-center gap-6 mt-8 text-sm">
                <span className="flex items-center gap-2">✅ 3,500+ Universities Accept PTE</span>
                <span className="flex items-center gap-2">✅ Results in 48 Hours</span>
                <span className="flex items-center gap-2">✅ Fully AI-Based Scoring</span>
                <span className="flex items-center gap-2">✅ Accepted in Australia, UK, Canada</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          
          {/* ================= WHAT IS PTE? ================= */}
                    <section className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="animate-left stagger-1">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">What is PTE Academic & Why It Matters?</h2>
                <p className="text-gray-600 text-lg mb-4">
                  The <strong className="text-blue-600">Pearson Test of English (PTE Academic)</strong> is a computer-based English proficiency exam accepted by <strong className="text-green-600">3,500+ universities worldwide</strong>.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">✅ <strong>Results within 48 hours</strong> – Fastest turnaround</li>
                  <li className="flex items-center gap-2">✅ <strong>Fully AI-based scoring</strong> – No human bias</li>
                  <li className="flex items-center gap-2">✅ <strong>Accepted in Australia, UK, Canada, New Zealand</strong></li>
                  <li className="flex items-center gap-2">✅ <strong>Preferred for student visa & PR applications</strong></li>
                </ul>
                <p className="text-gray-600 mt-4 italic">👉 That's why demand for <strong>PTE academic online coaching</strong> is growing rapidly in India.</p>
              </div>
              <div className="animate-right stagger-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center">
                <div className="text-6xl mb-4">📊</div>
                <div className="text-3xl font-bold text-blue-600">3,500+</div>
                <p className="text-gray-600">Universities Accept PTE</p>
                <div className="mt-4 text-2xl font-bold text-green-600">48 Hours</div>
                <p className="text-gray-600">Results Time</p>
              </div>
            </div>
          </section>

          {/* ================= WHY ONLINE VS OFFLINE ================= */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12 section-title">Why Choose PTE Online Coaching Instead of Offline?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "🏠", title: "Learn Anytime, Anywhere", desc: "No need to search \"pte institute near me\" — now you can study from home." },
                { icon: "🤖", title: "AI-Based Practice", desc: "Real exam simulations, instant scoring, and performance tracking." },
                { icon: "💰", title: "Cost-Effective", desc: "Online coaching is usually 30–50% cheaper than offline classes." },
                { icon: "⏰", title: "Flexible Schedule", desc: "Perfect for college students and working professionals." }
              ].map((item, index) => (
                <div key={index} className={`animate-up stagger-${index + 1} feature-card bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl`}>
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ================= FEATURES ================= */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8">Features of the Best PTE Online Coaching</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: "👨‍🏫", title: "Expert Trainers", desc: "Certified PTE trainers with real exam experience" },
                { icon: "📚", title: "Full Course Coverage", desc: "Speaking, Writing, Reading, Listening" },
                { icon: "📝", title: "Mock Tests & Prediction Files", desc: "Full-length mock exams with frequently asked questions" },
                { icon: "💬", title: "Personal Feedback", desc: "Speaking & writing evaluation with score improvement tips" }
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg">{feature.title}</h3>
                    <p className="text-white/80 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================= STEP-BY-STEP PREPARATION ================= */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12 section-title">Step-by-Step: How to Prepare with PTE Online Coaching</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { step: 1, title: "Diagnostic Test", desc: "Understand your current level" },
                { step: 2, title: "Learn Concepts", desc: "Templates, time management, vocabulary" },
                { step: 3, title: "Daily Practice", desc: "1–2 hours daily, section-wise" },
                { step: 4, title: "Mock Tests", desc: "10–15 full mocks, analyze mistakes" },
                { step: 5, title: "Final Revision", desc: "Focus on high-scoring question types" }
              ].map((item, index) => (
                <div key={index} className={`animate-up stagger-${index + 1} step-card bg-white rounded-2xl p-4 text-center shadow-lg border border-gray-100`}>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ================= REAL STRATEGY ================= */}
          <section className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Real Strategy to Score 65+ in PTE</h2>
                <p className="text-white/90 text-lg mb-4">Here's what successful students in India are doing:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">✅ Using templates for writing & speaking</li>
                  <li className="flex items-center gap-2">✅ Practicing repeat sentence & read aloud daily</li>
                  <li className="flex items-center gap-2">✅ Taking AI mock tests regularly</li>
                  <li className="flex items-center gap-2">✅ Following exam pattern strictly</li>
                </ul>
                <p className="mt-4 font-bold">👉 Most students achieve 65+ score within 2–4 weeks with proper PTE online coaching</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-5xl mb-2">🎯</div>
                <div className="text-4xl font-bold">65+</div>
                <p>Target Score</p>
                <div className="mt-3 text-sm">2-4 Weeks Preparation</div>
              </div>
            </div>
          </section>

          {/* ================= COMMON MISTAKES ================= */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12 section-title">Common Mistakes to Avoid ❌</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                "Ignoring mock tests",
                "Not following time limits",
                "Choosing random PTE institute without research",
                "Lack of speaking practice"
              ].map((mistake, index) => (
                <div key={index} className={`animate-up stagger-${index + 1} bg-white rounded-xl p-4 text-center shadow-md border-l-4 border-red-400`}>
                  <span className="text-2xl block mb-2">❌</span>
                  <p className="text-gray-700 font-medium">{mistake}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ================= OFFLINE VS ONLINE COMPARISON ================= */}
          <section className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Why Students Prefer Online Over "PTE Institute Near Me"</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-red-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-red-600 text-center mb-4">Offline Coaching</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between"><span>Fixed timings</span><span className="text-red-500">❌</span></li>
                  <li className="flex justify-between"><span>Limited practice</span><span className="text-red-500">❌</span></li>
                  <li className="flex justify-between"><span>Higher cost</span><span className="text-red-500">❌</span></li>
                  <li className="flex justify-between"><span>Manual checking</span><span className="text-red-500">❌</span></li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-green-600 text-center mb-4">Online Coaching</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between"><span>Flexible timing</span><span className="text-green-500">✅</span></li>
                  <li className="flex justify-between"><span>Unlimited practice</span><span className="text-green-500">✅</span></li>
                  <li className="flex justify-between"><span>Affordable</span><span className="text-green-500">✅</span></li>
                  <li className="flex justify-between"><span>AI evaluation</span><span className="text-green-500">✅</span></li>
                </ul>
              </div>
            </div>
            <p className="text-center mt-6 text-gray-600 italic">👉 That's why PTE best coaching is now shifting online.</p>
          </section>

          {/* ================= FAQ SECTION ================= */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12 section-title">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                {
                  q: "Which is the best PTE online coaching in India?",
                  a: "The best coaching offers expert trainers, AI mock tests, and personalized feedback. Always check reviews and demo classes before joining."
                },
                {
                  q: "How long does it take to prepare for PTE?",
                  a: "Most students prepare in 2–4 weeks with proper PTE course online and daily practice."
                },
                {
                  q: "Is PTE easier than IELTS?",
                  a: "PTE is considered easier by many because of AI-based scoring, faster results, and predictable format."
                },
                {
                  q: "Can I prepare for PTE at home?",
                  a: "Yes! With PTE academic online coaching, you can easily prepare from home with structured guidance."
                },
                {
                  q: "What score is required for PTE?",
                  a: "Generally: 50–58 for Diploma, 58–65 for Bachelor, 65+ for Master / PR applications."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="faq-question w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-800">{faq.q}</span>
                    <span className="text-blue-600 text-xl">{activeFaq === index ? '−' : '+'}</span>
                  </button>
                  {activeFaq === index && (
                    <div className="px-6 pb-4 text-gray-600 border-t border-gray-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ================= CONCLUSION & CTA ================= */}
          <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl p-12 text-center">
            <div className="text-6xl mb-4 float">🎯</div>
            <h2 className="text-3xl font-bold mb-4">Start Your PTE Journey Today</h2>
            <p className="text-xl mb-6 text-white/90 max-w-2xl mx-auto">
              If you're serious about studying abroad, choosing the right PTE online coaching is your first step toward success.<br/>
              With the right strategy, expert guidance, and consistent practice, scoring high in PTE is not difficult.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/free-demo"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
              >
                🎓 Book Free Demo Class
                <span>→</span>
              </a>
              <a
                href="https://wa.me/919428186817"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
              >
                💬 WhatsApp for Quick Support
              </a>
            </div>
            <p className="mt-6 text-sm text-white/80">🌐 Visit: www.anuedu.in | 📞 +91 7016497087</p>
          </section>
        </div>
      </main>
    </>
  );
}