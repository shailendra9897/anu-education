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
            name: "German Language Course (A1 to B2) – India",
            description:
              "Live online German classes from A1 to B2 levels with Goethe‑aligned curriculum, expert trainers, and free 3‑day demo. For students in Ahmedabad, Gandhinagar, Vadodara, Surat and across Gujarat.",
            provider: {
              "@type": "Organization",
              name: "ANU Education",
              sameAs: "https://www.anuedu.in",
            },
            offers: {
              "@type": "Offer",
              price: "10000",
              priceCurrency: "INR",
              availability: "https://schema.org/OnlineOnly",
              validFrom: "2026-04-01",
            },
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "Online",
              courseWorkload: "PT90H",
              startDate: "2026-05-10",
            },
          }),
        }}
      />

      {/* Updated FAQ Schema (new Q&A) */}
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
                name: "Is German required for studying in Germany?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Many public universities and some job roles in Germany require proof of German language proficiency (usually B1/B2 or higher). For English‑taught programs, basic German is still helpful for daily life and part‑time jobs.",
                },
              },
              {
                "@type": "Question",
                name: "Can I learn German online in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, our online German classes are designed for Gujarat students in Ahmedabad, Gandhinagar, Vadodara, and nearby cities. You can attend live sessions from home and access recorded lessons anytime.",
                },
              },
              {
                "@type": "Question",
                name: "How long does German A1 take in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "German A1 usually takes 4–6 weeks with regular practice, depending on your schedule and prior language exposure. Our structured online course in Ahmedabad keeps you on track for faster progress.",
                },
              },
              {
                "@type": "Question",
                name: "Do you provide certification support for German exams?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. We prepare students for internationally recognized German exams like Goethe‑Zertifikat A1, A2, B1, B2 and can help with exam strategy, mock tests, and application guidance.",
                },
              },
              {
                "@type": "Question",
                name: "Can I go to Germany for study after learning German in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. After reaching B1/B2 level, you can apply to German universities, vocational programs, or language‑integrated courses. We also guide Ahmedabad students on admission pathways, documents, and language requirements.",
                },
              },
              {
                "@type": "Question",
                name: "Which German level is needed for jobs in Germany?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "For most jobs in Germany, at least B1 basic communication skills are expected; many roles require B2 or higher. We design our courses for Ahmedabad students to reach job‑ready conversational and professional German.",
                },
              },
              {
                "@type": "Question",
                name: "Do you offer German classes for beginners in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. We offer German A1 starters’ batches for complete beginners from Ahmedabad and Gujarat. Our online classes focus on speaking, listening, grammar, and daily‑use vocabulary.",
                },
              },
              {
                "@type": "Question",
                name: "Are your online German classes batch‑based or 1‑to‑1?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We offer both group batches (for better practice and affordability) and 1‑to‑1 private classes for focused attention. Students from Ahmedabad, Gandhinagar, and nearby cities can choose the best fit.",
                },
              },
              {
                "@type": "Question",
                name: "How are online German classes conducted in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Classes are held live via Zoom or our learning platform. You get interactive sessions, homework, speech practice, and weekly tests. All materials are shared digitally, so you can study from anywhere in Gujarat.",
                },
              },
              {
                "@type": "Question",
                name: "Germany study visa vs. language requirement – what do Ahmedabad students need to know?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most German student visas require either an English‑taught program acceptance or proof of German language level (B1/B2). We help Ahmedabad students plan their language path early so they meet visa and university deadlines.",
                },
              },
              {
                "@type": "Question",
                name: "Can working professionals in Ahmedabad learn German online?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Our evening and weekend batches are designed for working professionals in Ahmedabad who want to improve German for career growth, study in Germany, or migration plans.",
                },
              },
              {
                "@type": "Question",
                name: "How do online German classes help with Germany ranking and LLP/Germany‑focused search queries?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our structured, exam‑oriented online German classes in Ahmedabad are optimised for long‑tail queries like “German classes in Ahmedabad,” “learn German online for Germany,” and “German course for study in Germany.” Clear metadata, local keywords, and FAQ‑rich content help Gujarati students find the right course.",
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
        .course-highlight { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* Hero Section - Updated H1 and intro */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                🇩🇪 Live Online | A1‑B2 | Free 3‑Day Demo
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                German Language Course in India – A1 to B2 Online Classes 🇩🇪
              </h1>
              <h2 className="text-3xl font-bold mb-4 section-title">
               Join live online German classes from anywhere in India, including Ahmedabad, Vadodara, Surat, and across Gujarat. 
              </h2>
              {/* Executive Intro */}
              <div className="voice-answer max-w-3xl mx-auto mb-6 text-lg bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-left text-white/95">
                <p>
                  Looking for the best German language course in Ahmedabad or Gujarat? ANU Education offers live online German classes from A1 to B2 levels with expert trainers, Goethe‑aligned curriculum, and free 3‑day demo classes.
                  Students from Ahmedabad, Vadodara, Surat, Gandhinagar, and across Gujarat can join from home and prepare for study, jobs, or migration to Germany.
                </p>
              </div>
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
          
          {/* Why Learn German */}
          <section className="bg-white p-8 rounded-3xl shadow-md">
            <h2 className="text-3xl font-bold mb-4 section-title">🇩🇪 Why Learn German?</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Germany is one of the top destinations for higher education and job opportunities. Many public universities offer low-cost or free education, making Germany a popular choice for Indian students.
              Learning German improves your chances of admission, part-time jobs, and long-term career opportunities in Germany.
            </p>
          </section>

          {/* German Course Levels */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center section-title-center">📚 German Course Levels (A1 to B2)</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {["A1 – Beginner (basic communication)", "A2 – Elementary level", "B1 – Intermediate level", "B2 – Advanced level"].map((level, idx) => (
                <div key={idx} className="bg-white rounded-xl p-5 text-center shadow-md hover:shadow-lg transition">
                  <p className="font-semibold text-gray-800">{level}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-4">Each level includes speaking, reading, writing, and listening training with real-life practice.</p>
          </section>

          {/* Why Choose ANU (Features) */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center section-title-center">Why Choose ANU Education?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "✅ Live interactive classes",
                "✅ Goethe-aligned curriculum",
                "✅ Small batch size",
                "✅ Daily speaking practice",
                "✅ Mock exams",
                "✅ 24/7 doubt support",
                "✅ Study abroad guidance",
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl shadow-md text-center">
                  <span className="text-green-600 text-xl">✔</span> {feature.replace("✅ ", "")}
                </div>
              ))}
            </div>
          </section>

          {/* Course Highlights (Detailed Pricing, Timings, etc.) */}
          <section className="course-highlight rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">📚 Course Highlights</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-3">🎯 Packages & Pricing</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>German Basic + A1:</strong> ₹10,000</li>
                  <li><strong>German Basic + A1 + A2:</strong> ₹16,000</li>
                </ul>
                <h3 className="text-xl font-bold mt-6 mb-3">🕒 Batch Timings</h3>
                <ul className="space-y-1 text-gray-700">
                  <li><strong>Basic:</strong> 7:30 PM</li>
                  <li><strong>A1:</strong> 9:00 PM</li>
                  <li><strong>A2:</strong> 9:00 PM</li>
                </ul>
                <h3 className="text-xl font-bold mt-6 mb-3">⏱️ Class Duration</h3>
                <p>90 minutes per session &nbsp;|&nbsp; Monday to Friday (5 days/week)</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">👨‍🏫 Trainer Qualification</h3>
                <p>Certified C1 Level German Trainer</p>
                <h3 className="text-xl font-bold mt-6 mb-3">💻 Mode</h3>
                <p>100% Live Online Classes with recordings</p>
                <h3 className="text-xl font-bold mt-6 mb-3">📦 Includes</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Study materials</li>
                  <li>Speaking practice</li>
                  <li>Mock test preparation</li>
                  <li>Goethe exam guidance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Internal Link to Study in Germany (unchanged) */}
          <div className="bg-blue-50 p-6 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">🇩🇪 Planning to study or work in Germany?</h3>
            <p className="text-gray-700 mb-4">German language skills are your first step. Combine our course with expert study abroad guidance.</p>
            <Link href="/study-in/germany" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
              Explore Study in Germany →
            </Link>
          </div>

          {/* FAQ Section (fully updated) */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">❓ Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: "Is German required for studying in Germany?", a: "Yes. Many public universities and some job roles in Germany require proof of German language proficiency (usually B1/B2 or higher). For English‑taught programs, basic German is still helpful for daily life and part‑time jobs." },
                { q: "Can I learn German online in Ahmedabad?", a: "Yes, our online German classes are designed for Gujarat students in Ahmedabad, Gandhinagar, Vadodara, and nearby cities. You can attend live sessions from home and access recorded lessons anytime." },
                { q: "How long does German A1 take in Ahmedabad?", a: "German A1 usually takes 4–6 weeks with regular practice, depending on your schedule and prior language exposure. Our structured online course in Ahmedabad keeps you on track for faster progress." },
                { q: "Do you provide certification support for German exams?", a: "Yes. We prepare students for internationally recognized German exams like Goethe‑Zertifikat A1, A2, B1, B2 and can help with exam strategy, mock tests, and application guidance." },
                { q: "Can I go to Germany for study after learning German in Ahmedabad?", a: "Yes. After reaching B1/B2 level, you can apply to German universities, vocational programs, or language‑integrated courses. We also guide Ahmedabad students on admission pathways, documents, and language requirements." },
                { q: "Which German level is needed for jobs in Germany?", a: "For most jobs in Germany, at least B1 basic communication skills are expected; many roles require B2 or higher. We design our courses for Ahmedabad students to reach job‑ready conversational and professional German." },
                { q: "Do you offer German classes for beginners in Ahmedabad?", a: "Yes. We offer German A1 starters’ batches for complete beginners from Ahmedabad and Gujarat. Our online classes focus on speaking, listening, grammar, and daily‑use vocabulary." },
                { q: "Are your online German classes batch‑based or 1‑to‑1?", a: "We offer both group batches (for better practice and affordability) and 1‑to‑1 private classes for focused attention. Students from Ahmedabad, Gandhinagar, and nearby cities can choose the best fit." },
                { q: "How are online German classes conducted in Ahmedabad?", a: "Classes are held live via Zoom or our learning platform. You get interactive sessions, homework, speech practice, and weekly tests. All materials are shared digitally, so you can study from anywhere in Gujarat." },
                { q: "Germany study visa vs. language requirement – what do Ahmedabad students need to know?", a: "Most German student visas require either an English‑taught program acceptance or proof of German language level (B1/B2). We help Ahmedabad students plan their language path early so they meet visa and university deadlines." },
                { q: "Can working professionals in Ahmedabad learn German online?", a: "Yes. Our evening and weekend batches are designed for working professionals in Ahmedabad who want to improve German for career growth, study in Germany, or migration plans." },
                { q: "How do online German classes help with Germany ranking and LLP/Germany‑focused search queries?", a: "Our structured, exam‑oriented online German classes in Ahmedabad are optimised for long‑tail queries like “German classes in Ahmedabad,” “learn German online for Germany,” and “German course for study in Germany.” Clear metadata, local keywords, and FAQ‑rich content help Gujarati students find the right course." },
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