'use client';

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

export default function IELTSGandhinagarClient() {
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
            name: "IELTS Coaching in Gandhinagar",
            description:
              "Comprehensive IELTS training with experienced trainers, mock tests, speaking practice, and study abroad support.",
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
              courseMode: "Mixed",
              courseWorkload: "PT4H",
              startDate: "2026-04-15",
            },
          }),
        }}
      />

      {/* FAQ Schema */}
      <Script
        id="faq-schema-ielts-gandhinagar"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What's the duration of your IELTS coaching?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "4–8 weeks, customized to your starting level.",
                },
              },
              {
                "@type": "Question",
                name: "Do you offer mock tests?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, weekly full-length mocks with detailed feedback.",
                },
              },
              {
                "@type": "Question",
                name: "Can beginners join IELTS classes?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Absolutely – we start from basics to advanced.",
                },
              },
              {
                "@type": "Question",
                name: "Is online IELTS coaching available?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, learn from home with live sessions.",
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
                🎓 10+ Years Experience | Online + Offline | Free Demo
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                IELTS Coaching in Gandhinagar
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Best Classes Near You
                </span>
              </h1>
              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Looking for the best IELTS coaching in Gandhinagar? ANU Education delivers expert-led IELTS training 
                with proven strategies to hit your target band score fast. Plan to study abroad in Canada, UK, Australia, or Germany? 
                Our IELTS classes in Gandhinagar build real exam confidence and deliver results – whether you're a beginner or aiming for Band 8+.
              </p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="https://www.anuedu.in/free-demo"
                  target="_blank"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  🔥 Book Free Demo (3 Days)
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
                <span className="flex items-center gap-2">✅ 2000+ Students Trained</span>
                <span className="flex items-center gap-2">✅ 98% Success Rate</span>
                <span className="flex items-center gap-2">✅ Free Mock Test + Band Score</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          
          {/* Why Choose ANU */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center section-title-center">Why Choose ANU Education for IELTS Coaching in Gandhinagar?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "👨‍🏫", title: "Experienced Trainers", desc: "10+ years of proven success" },
                { icon: "📝", title: "Real Exam-Based Prep", desc: "Tailored to latest exam patterns" },
                { icon: "🗣️", title: "Speaking Practice", desc: "Personalised feedback sessions" },
                { icon: "🎯", title: "Customized Study Plans", desc: "Designed for your goals" },
                { icon: "💻", title: "Flexible Classes", desc: "Online + offline options" },
                { icon: "💰", title: "Affordable Fees", desc: "Free demo to try before you buy" },
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
            <h2 className="text-3xl font-bold mb-6 text-center">IELTS Course Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-3 text-gray-700">
                <li>✅ <strong>Full coverage:</strong> Listening, Reading, Writing & Speaking modules</li>
                <li>✅ <strong>Daily practice</strong> for skill-building</li>
                <li>✅ <strong>Weekly full-length mock tests</strong> with analysis</li>
              </ul>
              <ul className="space-y-3 text-gray-700">
                <li>✅ <strong>Proven band score improvement</strong> strategies</li>
                <li>✅ <strong>Time management techniques</strong> for exam day</li>
                <li>✅ <strong>One-to-one doubt clearing</strong> sessions</li>
              </ul>
            </div>
            <div className="text-center mt-6">
              <a href="https://study.anuedu.in/register" target="_blank" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                🔥 Claim Your 3-Day Free Demo
              </a>
            </div>
          </section>

          {/* Study Abroad Support */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">Complete Study Abroad Support in Gandhinagar</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold text-blue-600 mb-3">🇨🇦 🇬🇧 🇦🇺 🇩🇪 Beyond IELTS</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✅ Top university selection matched to your profile</li>
                  <li>✅ SOP writing & visa application help</li>
                  <li>✅ Expert country advice (Canada, UK, Australia, Germany)</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl text-center">
                <p className="text-lg font-semibold">Already have an IELTS score?</p>
                <p className="mb-4">Get free counselling for your study abroad journey.</p>
                <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-700 transition">
                  Talk to Expert →
                </Link>
              </div>
            </div>
          </section>

          {/* Internal Links to Related Pages */}
          <div className="bg-blue-50 p-6 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">📘 Want to explore more?</h3>
            <p className="text-gray-700 mb-4">Check out our detailed IELTS preparation guide or online coaching options.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/ielts-preparation-guide" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">IELTS Preparation Guide</Link>
              <Link href="/test-prep/ielts-online" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">IELTS Online Coaching</Link>
              <Link href="/study-in/canada" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition">Study in Canada</Link>
            </div>
          </div>

          {/* FAQ Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">❓ Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: "What's the duration of your IELTS coaching?", a: "4–8 weeks, customized to your starting level." },
                { q: "Do you offer mock tests?", a: "Yes, weekly full-length mocks with detailed feedback." },
                { q: "Can beginners join IELTS classes?", a: "Absolutely – we start from basics to advanced." },
                { q: "Is online IELTS coaching available?", a: "Yes, learn from home with live sessions." },
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
              <h2 className="text-3xl font-bold mb-4">Book Your Spot – Limited Seats!</h2>
              <p className="text-xl mb-6">Don't miss out on IELTS coaching in Gandhinagar that works. Start with our 3‑day free demo and transform your future today.</p>
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
              Related: <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">IELTS Online Coaching</Link> | 
              <Link href="/ielts-preparation-guide" className="text-blue-600 hover:underline ml-1"> IELTS Preparation Guide</Link> | 
              <Link href="/study-abroad" className="text-blue-600 hover:underline ml-1"> Study Abroad</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}