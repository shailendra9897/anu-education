'use client';

import Script from "next/script";
import { useState } from "react";
import Link from "next/link";

export default function PTEClient() {
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
            name: "PTE Online Coaching",
            description:
              "Expert-led PTE online coaching with AI-scored mock tests, live classes, and 7-week study plan. Score 79+ guaranteed.",
            provider: {
              "@type": "Organization",
              name: "ANU Education",
              sameAs: "https://www.anuedu.in",
            },
            offers: {
              "@type": "Offer",
              price: "7999",
              priceCurrency: "INR",
              availability: "https://schema.org/OnlineOnly",
              validFrom: "2026-04-01",
            },
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "Online",
              courseWorkload: "PT4H",
              startDate: "2026-04-15",
            },
          }),
        }}
      />

      {/* FAQ Schema */}
      <Script
        id="faq-schema-pte"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What are the technical requirements for online classes?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You need a stable internet connection, a laptop/desktop with microphone and speakers, and a browser (Chrome/Firefox).",
                },
              },
              {
                "@type": "Question",
                name: "Can I access class recordings if I miss a session?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, all live sessions are recorded and available for 6 weeks. You can watch them anytime.",
                },
              },
              {
                "@type": "Question",
                name: "Do you provide AI-scored mock tests?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, our package includes 5 full AI-scored mock tests and 250+ practice questions with instant scoring and feedback.",
                },
              },
              {
                "@type": "Question",
                name: "What is your refund policy?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We offer a transparent refund policy. Please refer to our Terms & Conditions page for full details.",
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
        .price-card { transition: all 0.3s ease; }
        .price-card:hover { transform: translateY(-10px); box-shadow: 0 25px 40px -12px rgba(0,0,0,0.2); }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                ⭐ Pearson‑Certified Trainers | AI Mock Tests | 4‑Week Plan
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                PTE Coaching From Expert
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Crack the exam in your first attempt
                </span>
              </h1>
              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Unlock your full potential, eliminate weaknesses, and reach your desired PTE score with our expert‑led online coaching. 
                Structured learning, advanced practice tools, and proven strategies – all at your pace.
              </p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="/free-demo"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  🎓 Start Your PTE Journey Now
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a
                  href="https://wa.me/919428186817"
                  target="_blank"
                  className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
                >
                  💬 WhatsApp for Free Demo
                </a>
              </div>
              <div className="animate-up stagger-4 flex flex-wrap justify-center gap-6 mt-8 text-sm">
                <span className="flex items-center gap-2">✅ 6500+ Success Stories</span>
                <span className="flex items-center gap-2">✅ 4.5+ Star Rating</span>
                <span className="flex items-center gap-2">✅ 24/7 Doubt Support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          
          {/* Why Choose Us – Features Grid */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center section-title-center">Why Choose Our PTE Coaching?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "👨‍🏫", title: "Top‑Rated PTE Trainers", desc: "Pearson‑certified mentors with years of experience." },
                { icon: "🎥", title: "Live Interactive Classes", desc: "Small batches, real‑time feedback, and Q&A." },
                { icon: "📹", title: "Recorded Sessions", desc: "6 weeks access to all class recordings." },
                { icon: "📚", title: "Vocabulary & eBooks", desc: "Curated word banks, reading materials, podcasts." },
                { icon: "🤖", title: "AI‑Scored Mock Tests", desc: "5 full tests + 250+ practice questions." },
                { icon: "📝", title: "Expert Practice Materials", desc: "Templates, strategies, and tips for every task." },
                { icon: "⏰", title: "Convenient Class Timings", desc: "Morning, evening & weekend batches." },
                { icon: "💬", title: "24/7 Doubt Support", desc: "WhatsApp, Telegram, Instagram, or email." },
              ].map((item, idx) => (
                <div key={idx} className={`animate-up stagger-${(idx % 5)+1} feature-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg`}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What You’ll Learn – Section Breakdown */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">What You’ll Learn in Our PTE Coaching</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-blue-600 mb-4">🗣️ Speaking</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Improve pronunciation & oral fluency for Read Aloud & Repeat Sentence.</li>
                  <li>Master Describe Image with simple templates (graphs, charts, maps).</li>
                  <li>Build confidence for Retell Lecture & Answer Short Question.</li>
                </ul>
                <h3 className="text-2xl font-bold text-green-600 mt-6 mb-4">✍️ Writing</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Structures for Summarize Written Text & Essay Writing.</li>
                  <li>Grammar, spelling, and coherence through targeted feedback.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-600 mb-4">📖 Reading</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Skimming, scanning, inference for Multiple‑Choice, Reorder Paragraphs, Fill‑in‑the‑Blanks.</li>
                  <li>Time‑saving strategies to complete the section on time.</li>
                </ul>
                <h3 className="text-2xl font-bold text-orange-600 mt-6 mb-4">🎧 Listening</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Comprehension for Summarize Spoken Text, Multiple‑Choice, Fill‑in‑the‑Blanks.</li>
                  <li>Train your ear with real‑exam audio and practical note‑taking.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pricing Plan */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-4">Our PTE 4‑Week Online Coaching Plan</h2>
            <div className="inline-block price-card bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto border-2 border-green-200">
              <div className="text-4xl font-bold text-green-600">₹ 7,999</div>
              <p className="text-gray-500 line-through">₹ 12,999</p>
              <p className="text-sm text-gray-500 mt-1">(or adjust according to your pricing)</p>
              <ul className="mt-6 space-y-2 text-left text-gray-700">
                <li>✅ Structured 4‑Week Study Plan</li>
                <li>✅ One‑to‑One Doubt‑Solving Support</li>
                <li>✅ Expert‑Designed Practice Kit</li>
                <li>✅ Real‑Exam Questions & Exam Memories</li>
                <li>✅ Instant Feedback & Score Analysis</li>
                <li>✅ Test‑Day Guidance</li>
              </ul>
              <a href="/free-demo" className="mt-8 inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition w-full">Enroll Now</a>
            </div>
            <p className="text-sm text-gray-500 mt-4">*Limited seats per batch. Secure your spot today.</p>
          </section>

          {/* How It Works */}
          <section className="grid md:grid-cols-3 gap-6 bg-white rounded-3xl p-8 shadow-md">
            <div className="text-center">
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="font-bold text-xl">Login</h3>
              <p>Create or log in to your account using email or QR code.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎥</div>
              <h3 className="font-bold text-xl">Join Online Coaching</h3>
              <p>Click the Online Group Coaching tab and enter the live class link.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-bold text-xl">Learn & Practice</h3>
              <p>Follow the simplified teaching, complete tasks, and track progress with AI tests.</p>
            </div>
          </section>

          {/* Key Features of Platform */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center section-title-center">Key Features of Our Platform</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Convenient Timings", "AI‑Scored Mock Tests", "Live Interactive Classes", "Resourceful Materials", "Expert Tips & Strategies", "Real‑Exam Questions"].map((feature, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl shadow text-center">
                  <span className="text-green-500 text-xl">✓</span>
                  <p className="font-medium mt-1">{feature}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why Students Trust Us + Achievements */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Why Students Trust Us</h2>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">🏆 <strong>High Success Rate:</strong> Consistently helping students achieve 79+ and many with 90.</li>
                  <li className="flex items-center gap-2">⭐ <strong>4.5+ Star Ratings:</strong> Rated highly for quality teaching and support.</li>
                  <li className="flex items-center gap-2">🎯 <strong>Genuine Results, Not Luck:</strong> Structured coaching + disciplined practice.</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">What You’ll Achieve</h2>
                <ul className="space-y-3">
                  <li>✅ Unleash your potential – fix weaknesses, build confidence.</li>
                  <li>✅ Level up your score with time‑bound techniques.</li>
                  <li>✅ Overcome wrong practices with expert corrections.</li>
                  <li>✅ Stay focused & motivated with multi‑sensory teaching.</li>
                  <li>✅ Build a personal mentor‑student relationship.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Syllabus Covered */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">Syllabus Covered (Course Structure)</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {["Speaking", "Writing", "Reading", "Listening"].map((section) => (
                <div key={section} className="bg-white rounded-xl p-5 shadow text-center">
                  <h3 className="font-bold text-xl mb-2">{section}</h3>
                  <p className="text-gray-600 text-sm">Full coverage of all tasks and question types.</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="https://www.pearsonpte.com/pte-academic" className="text-blue-600 underline">Detailed Syllabus →</Link>
            </div>
          </section>

          {/* Support & Service */}
          <div className="grid md:grid-cols-3 gap-6 text-center bg-white p-8 rounded-3xl shadow">
            <div>
              <div className="text-3xl">💬</div>
              <h3 className="font-bold mt-2">24/7 Doubt Support</h3>
              <p className="text-sm text-gray-600">WhatsApp, Telegram, Instagram, Facebook, Email</p>
            </div>
            <div>
              <div className="text-3xl">🔄</div>
              <h3 className="font-bold mt-2">Refund / Cancellation Policy</h3>
              <p className="text-sm text-gray-600">Transparent terms – see T&C</p>
            </div>
            <div>
              <div className="text-3xl">🔒</div>
              <h3 className="font-bold mt-2">Privacy & Security</h3>
              <p className="text-sm text-gray-600">Encrypted data, secure server</p>
            </div>
          </div>

          {/* Success Stories */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-2">6500+ Success Stories</h2>
            <p className="text-lg mb-4">Thousands of students have cleared PTE with their desired scores – even repeaters succeed with our structured guidance.</p>
            <a href="/success-stories" className="inline-block bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">Read More Stories →</a>
          </section>

          {/* FAQ Accordion */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions (FAQs)</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: "What are the technical requirements for online classes?", a: "You need a stable internet connection, a laptop/desktop with microphone and speakers, and a browser (Chrome/Firefox)." },
                { q: "What if I face a technical issue during a live session?", a: "Our support team is available on WhatsApp and email to assist you immediately." },
                { q: "Can I access class recordings if I miss a session?", a: "Yes, all sessions are recorded and available for 6 weeks." },
                { q: "How do I submit assignments and practice tasks?", a: "You can submit via our learning portal or directly to your mentor on WhatsApp." },
                { q: "Do you provide test series and AI‑scored mocks?", a: "Absolutely – 10 full mock tests and 250+ practice questions with AI scoring." },
                { q: "What is your refund policy?", a: "Please refer to our Terms & Conditions page for full details." },
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
          <section className="cta-banner rounded-3xl p-12 text-center text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #dc2626 50%, #3b82f6 100%)' }}>
            <div className="max-w-3xl mx-auto">
              <div className="text-6xl mb-4 float">🚀</div>
              <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-xl mb-6">PTE 4‑Week Online Coaching – ₹ 7,999 only</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/919428186817" target="_blank" className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition">💬 WhatsApp Us</a>
                <a href="/contact" className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">📞 Call Us</a>
                <a href="mailto:info@anuedu.in" className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">✉️ Email Us</a>
              </div>
              <p className="mt-6 text-sm text-white/80">All payments are processed on a secure server.</p>
            </div>
          </section>

          {/* Internal Links */}
          <div className="text-center text-sm text-gray-500 border-t pt-8">
            <p>
              Related: <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">IELTS Online Coaching</Link> | 
              <Link href="/test-prep/pte-vs-ielts" className="text-blue-600 hover:underline ml-1"> PTE vs IELTS</Link> | 
              <Link href="/study-abroad" className="text-blue-600 hover:underline ml-1"> Study Abroad Guide</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}