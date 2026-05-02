'use client';

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

export default function IELTSAhmedabadClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      {/* ================= SCHEMA: Course ================= */}
      <Script
        id="course-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "IELTS Coaching in Ahmedabad",
            description:
              "Online IELTS coaching for Ahmedabad students with expert trainers, speaking practice, mock tests, and study abroad support. Free 4‑day demo.",
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
              courseWorkload: "PT3H",
              startDate: "2026-05-01",
            },
          }),
        }}
      />

      {/* ================= SCHEMA: FAQ (10 questions) ================= */}
      <Script
        id="faq-schema-ielts-ahmedabad"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is IELTS coaching in Ahmedabad available fully online?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, students in Ahmedabad can join live IELTS classes from home with full support. You can attend sessions from Satellite, Maninagar, Vastrapur, SG Highway, Bopal, Prahlad Nagar, and all other areas without any travel.",
                },
              },
              {
                "@type": "Question",
                name: "How long does IELTS preparation take in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "IELTS preparation usually takes 3–6 weeks, depending on your current English level and target band. Our structured online course helps Ahmedabad students improve faster with daily practice and personalized feedback.",
                },
              },
              {
                "@type": "Question",
                name: "What band score can I achieve with IELTS coaching in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "With regular practice and expert guidance, most Ahmedabad students achieve Band 6.5 to 7.5+. Our coaching focuses on improving all four modules—Listening, Reading, Writing, and Speaking—to help you reach your goal band.",
                },
              },
              {
                "@type": "Question",
                name: "Do you provide speaking practice for IELTS in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we include daily speaking practice sessions with one‑on‑one or small‑group feedback. Ahmedabad students get real‑time corrections, mock interviews, and cue card practice to boost fluency and confidence.",
                },
              },
              {
                "@type": "Question",
                name: "Is IELTS required for Canada, UK, and Australia from Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, IELTS is widely accepted for student visas, work visas, and PR in Canada, the UK, Australia, and many other countries. Our Ahmedabad IELTS coaching prepares you specifically for study‑abroad and immigration requirements.",
                },
              },
              {
                "@type": "Question",
                name: "Do you offer free IELTS trial classes in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we provide 4‑day free trial classes for Ahmedabad students. You can experience live online classes, sample materials, and a short speaking or writing session before joining the full course.",
                },
              },
              {
                "@type": "Question",
                name: "Which areas in Ahmedabad do you cover for online IELTS coaching?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We cover all areas of Ahmedabad, including Satellite, Maninagar, Vastrapur, SG Highway, Bopal, Prahlad Nagar, Gota, Ambawadi, and nearby suburbs. Since classes are online, location does not affect your access.",
                },
              },
              {
                "@type": "Question",
                name: "IELTS coaching fees in Ahmedabad (online)?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our online IELTS coaching fees are ₹5,000–₹9,000 for group batches (4–8 weeks), with 1:1 coaching starting at ₹18,000. The fee includes the 4‑day free trial, full‑length mock tests, study material, and band‑improvement support.",
                },
              },
              {
                "@type": "Question",
                name: "How to join IELTS online classes from Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Fill out the free enquiry form or WhatsApp us. Book your 4‑day free trial and choose a convenient batch. Join live classes from your home in Ahmedabad and start practicing for your target band.",
                },
              },
              {
                "@type": "Question",
                name: "Do you provide mock tests and score analysis for IELTS in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we provide full‑length IELTS mock tests with detailed score analysis and band prediction. Ahmedabad students receive personalized feedback for Writing and Speaking, plus improvement plans to target Band 6.5 or higher.",
                },
              },
            ],
          }),
        }}
      />

      {/* ================= NEW: HowTo Schema (Free Demo) – FIXED SYNTAX ================= */}
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Join IELTS Free 4‑Day Demo in Ahmedabad",
            description: "Simple steps to start your free IELTS demo classes with ANU Education.",
            step: [
              {
                "@type": "HowToStep",
                name: "Step 1: Click the free demo button",
                text: "Click the 'Start Free 4‑Day Classes' button on this page.",
              },
              {
                "@type": "HowToStep",
                name: "Step 2: Fill your details",
                text: "Enter your name, phone number, and preferred batch timing.",
              },
              {
                "@type": "HowToStep",
                name: "Step 3: Receive confirmation",
                text: "Get your batch schedule and login details via WhatsApp.",
              },
              {
                "@type": "HowToStep",
                name: "Step 4: Attend live classes",
                text: "Join live online sessions from home in Ahmedabad.",
              },
            ],
          }),
        }}
      />

      {/* ================= NEW: AggregateRating Schema ================= */}
      <Script
        id="rating-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "IELTS Coaching in Ahmedabad",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              reviewCount: "347",
              bestRating: "5",
              worstRating: "1",
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
              availability: "https://schema.org/OnlineOnly",
            },
          }),
        }}
      />

      {/* ================= NEW: Speakable Schema ================= */}
      <Script
        id="speakable-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SpeakableSpecification",
            cssSelector: [".voice-answer", ".faq-question-highlight"],
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
        .comparison-table th, .comparison-table td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
        }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* HERO SECTION */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                🎯 Online | Free 4‑Day Demo | Speaking Practice
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Best IELTS Coaching in Ahmedabad
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Online Classes with Free 4‑Day Demo
                </span>
              </h1>
              
              {/* Executive Summary (voice‑answer class for Speakable) */}
              <div className="voice-answer max-w-3xl mx-auto mb-6 text-lg bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-left">
                <p className="font-bold text-xl mb-3">📌 Executive summary – what you get here:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>✅ <strong>What is this page?</strong> – Online IELTS coaching specially for Ahmedabad students.</li>
                  <li>✅ <strong>Who is it for?</strong> – Students in Satellite, Maninagar, Navrangpura, Gota, Vastrapur & all Ahmedabad areas.</li>
                  <li>✅ <strong>What makes us unique?</strong> – Free 4‑day live demo, daily speaking practice, unlimited mock tests.</li>
                  <li>✅ <strong>What is the offer?</strong> – No‑risk 4‑day free demo, no payment needed upfront.</li>
                  <li>✅ <strong>Success proof?</strong> – 96% Band 6.5+ success rate, 2000+ students trained.</li>
                </ul>
              </div>

              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Looking for the best IELTS coaching in Ahmedabad? ANU Education offers expert-led online IELTS classes designed for students who want to prepare from home.
                Students from areas like <strong>Satellite, Maninagar, Navrangpura, and Gota</strong> can join our live online IELTS coaching and improve their band score with structured lessons, speaking practice, and real exam strategies.
                Start your preparation with our <strong>free 4-day IELTS demo classes</strong> and experience how our training works before you enroll.
              </p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="https://study.anuedu.in/register"
                  target="_blank"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  🔥 Start Free 4‑Day Classes
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
                <span className="flex items-center gap-2">✅ 96% Success Rate</span>
                <span className="flex items-center gap-2">✅ Free Mock Test + Band Score</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          
          {/* WHY CHOOSE US */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center section-title-center">Why ANU Education is Best for IELTS Coaching in Ahmedabad?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "💻", title: "Live online classes from home", desc: "Join from Satellite, Maninagar, or any part of Ahmedabad without travel." },
                { icon: "🗣️", title: "Daily speaking practice", desc: "Real‑time feedback and cue card practice." },
                { icon: "📝", title: "Full mock tests with analysis", desc: "Real exam simulation and band prediction." },
                { icon: "⏰", title: "Flexible timings", desc: "Morning, evening & weekend batches for working students." },
                { icon: "🎯", title: "Band score improvement", desc: "Proven strategies to achieve 6.5–7.5+ bands." },
                { icon: "🔥", title: "Free 4‑Day Demo", desc: "Experience our classes risk‑free before enrolling." },
              ].map((item, idx) => (
                <div key={idx} className={`animate-up stagger-${idx+1} feature-card bg-white rounded-2xl p-6 shadow-md border border-gray-100`}>
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* COURSE DETAILS */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Our IELTS Coaching Includes:</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-3 text-gray-700">
                <li>✅ Listening, Reading, Writing & Speaking modules</li>
                <li>✅ Real exam simulation</li>
                <li>✅ Band score improvement techniques</li>
              </ul>
              <ul className="space-y-3 text-gray-700">
                <li>✅ Time management strategies</li>
                <li>✅ Personal feedback on writing & speaking</li>
                <li>✅ Practice portal access</li>
              </ul>
            </div>
          </section>

          {/* FREE DEMO OFFER */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">🔥 Start Your Free 4-Day IELTS Classes</h2>
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
              <div className="bg-white/70 p-3 rounded-xl">✔ Live class experience</div>
              <div className="bg-white/70 p-3 rounded-xl">✔ Speaking practice</div>
              <div className="bg-white/70 p-3 rounded-xl">✔ Free mock test</div>
            </div>
            <a
              href="https://www.anuedu.in/free-demo"
              target="_blank"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition pulse"
            >
              👉 Book Your Free Demo Now
            </a>
          </section>

          {/* LOCAL TOUCH */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-3">📍 Local Touch – Ahmedabad Students</h2>
            <p className="text-gray-700">
              Students from <strong>Satellite, Maninagar, Navrangpura, Vastrapur, SG Highway, Bopal, Prahlad Nagar, Gota, and Ambawadi</strong> prefer online IELTS coaching to save travel time and get flexible learning options. 
              Our online platform allows you to learn anytime, anywhere with full support from expert trainers – right from the comfort of your home.
            </p>
          </div>

          {/* COMPARISON TABLE (ANU vs Others) */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 section-title">📊 How ANU Education Compares with Others</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse comparison-table text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="p-3">Feature</th>
                    <th className="p-3">ANU Education (Ahmedabad)</th>
                    <th className="p-3">Typical Others</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-3 font-bold">Free demo</td><td className="p-3">4 full days live</td><td className="p-3">1 session or none</td></tr>
                  <tr><td className="p-3 font-bold">Class format</td><td className="p-3">Live online Zoom</td><td className="p-3">Recorded / offline</td></tr>
                  <tr><td className="p-3 font-bold">Speaking practice</td><td className="p-3">Daily with feedback</td><td className="p-3">Occasional</td></tr>
                  <tr><td className="p-3 font-bold">Mock tests</td><td className="p-3">Unlimited + band analysis</td><td className="p-3">1–2 fixed tests</td></tr>
                  <tr><td className="p-3 font-bold">Batch timings</td><td className="p-3">Morning, evening, weekend</td><td className="p-3">Fixed only</td></tr>
                  <tr><td className="p-3 font-bold">Study abroad support</td><td className="p-3">Visa, SOP, university selection</td><td className="p-3">Limited or extra cost</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* NEARBY CITIES INTERNAL LINKS */}
          <div className="bg-blue-50 p-6 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-3">📍 IELTS Coaching in Nearby Cities (Gujarat)</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/test-prep/ielts-coaching-gandhinagar" className="text-blue-700 hover:underline">Gandhinagar</Link>
              <span>•</span>
              <Link href="/test-prep/ielts-coaching-vadodara" className="text-blue-700 hover:underline">Vadodara</Link>
              <span>•</span>
              <Link href="/test-prep/ielts-coaching-surat" className="text-blue-700 hover:underline">Surat</Link>
              <span>•</span>
              <Link href="/test-prep/ielts-coaching-rajkot" className="text-blue-700 hover:underline">Rajkot</Link>
            </div>
            <p className="text-sm text-gray-600 mt-3">Fully online – same quality for all Gujarat students.</p>
          </div>

          {/* STUDY ABROAD SUPPORT */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-4 text-center">🌍 Study Abroad Support</h2>
            <p className="text-center text-lg mb-6">Along with IELTS coaching, we provide:</p>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">✅ University selection guidance</div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">✅ SOP & visa support</div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">✅ Country selection (Canada, UK, Australia, Germany)</div>
            </div>
          </section>

          {/* FAQ ACCORDION */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">❓ Frequently Asked Questions – IELTS Coaching in Ahmedabad</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: "Is IELTS coaching in Ahmedabad available fully online?", a: "Yes, students in Ahmedabad can join live IELTS classes from home with full support. You can attend sessions from Satellite, Maninagar, Vastrapur, SG Highway, Bopal, Prahlad Nagar, and all other areas without any travel." },
                { q: "How long does IELTS preparation take in Ahmedabad?", a: "IELTS preparation usually takes 3–6 weeks, depending on your current English level and target band. Our structured online course helps Ahmedabad students improve faster with daily practice and personalized feedback." },
                { q: "What band score can I achieve with IELTS coaching in Ahmedabad?", a: "With regular practice and expert guidance, most Ahmedabad students achieve Band 6.5 to 7.5+. Our coaching focuses on improving all four modules—Listening, Reading, Writing, and Speaking—to help you reach your goal band." },
                { q: "Do you provide speaking practice for IELTS in Ahmedabad?", a: "Yes, we include daily speaking practice sessions with one‑on‑one or small‑group feedback. Ahmedabad students get real‑time corrections, mock interviews, and cue card practice to boost fluency and confidence." },
                { q: "Is IELTS required for Canada, UK, and Australia from Ahmedabad?", a: "Yes, IELTS is widely accepted for student visas, work visas, and PR in Canada, the UK, Australia, and many other countries. Our Ahmedabad IELTS coaching prepares you specifically for study‑abroad and immigration requirements." },
                { q: "Do you offer free IELTS trial classes in Ahmedabad?", a: "Yes, we provide 4‑day free trial classes for Ahmedabad students. You can experience live online classes, sample materials, and a short speaking or writing session before joining the full course." },
                { q: "Which areas in Ahmedabad do you cover for online IELTS coaching?", a: "We cover all areas of Ahmedabad, including Satellite, Maninagar, Vastrapur, SG Highway, Bopal, Prahlad Nagar, Gota, Ambawadi, and nearby suburbs. Since classes are online, location does not affect your access." },
                { q: "IELTS coaching fees in Ahmedabad (online)?", a: "Our online IELTS coaching fees are ₹5,000–₹9,000 for group batches (4–8 weeks), with 1:1 coaching starting at ₹18,000. The fee includes the 4‑day free trial, full‑length mock tests, study material, and band‑improvement support." },
                { q: "How to join IELTS online classes from Ahmedabad?", a: "Fill out the free enquiry form or WhatsApp us. Book your 4‑day free trial and choose a convenient batch. Join live classes from your home in Ahmedabad and start practicing for your target band." },
                { q: "Do you provide mock tests and score analysis for IELTS in Ahmedabad?", a: "Yes, we provide full‑length IELTS mock tests with detailed score analysis and band prediction. Ahmedabad students receive personalized feedback for Writing and Speaking, plus improvement plans to target Band 6.5 or higher." },
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

          {/* FINAL CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="text-6xl mb-4 float">🎯</div>
              <h2 className="text-3xl font-bold mb-4">Start Your Free 4-Day IELTS Classes Today</h2>
              <p className="text-xl mb-6">Join Ahmedabad's most trusted online IELTS coaching. No commitment – just results.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://study.anuedu.in/register" target="_blank" className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition">✅ Book Free Demo Class</a>
                <a href="tel:+917016497087" className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">📞 Call: 7016497087</a>
                <a href="https://wa.me/919428186817" target="_blank" className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">💬 WhatsApp</a>
              </div>
              <p className="mt-6 text-sm text-white/80">Improve your IELTS band score faster from Ahmedabad – limited seats.</p>
            </div>
          </section>

          {/* FOOTER INTERNAL LINKS */}
          <div className="text-center text-sm text-gray-500 border-t pt-8">
            <p>
              Related: <Link href="/test-prep/ielts-coaching-gandhinagar" className="text-blue-600 hover:underline">IELTS Coaching Gandhinagar</Link> | 
              <Link href="/test-prep/pte-coaching-ahmedabad" className="text-blue-600 hover:underline ml-1"> PTE Coaching Ahmedabad</Link> | 
              <Link href="/" className="text-blue-600 hover:underline ml-1"> Study Abroad</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}