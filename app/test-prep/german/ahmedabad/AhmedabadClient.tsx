'use client';

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

export default function OnlineGermanAhmedabadClient() {
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
            name: "Online German Classes in Ahmedabad (A1 to C1)",
            description:
              "Live online German language course for Ahmedabad students – CEFR levels A1 to C1, Goethe-certified trainers, flexible batches, free 4‑day demo.",
            provider: {
              "@type": "Organization",
              name: "ANU Education",
              sameAs: "https://www.anuedu.in",
            },
            hasCourseInstance: [
              {
                "@type": "CourseInstance",
                courseMode: "Online",
                courseWorkload: "PT90H",
                offers: { "@type": "Offer", price: "8000", priceCurrency: "INR", name: "German A1" },
              },
              {
                "@type": "CourseInstance",
                courseMode: "Online",
                courseWorkload: "PT90H",
                offers: { "@type": "Offer", price: "10000", priceCurrency: "INR", name: "German A2" },
              },
              {
                "@type": "CourseInstance",
                courseMode: "Online",
                courseWorkload: "PT120H",
                offers: { "@type": "Offer", price: "12000", priceCurrency: "INR", name: "German B1" },
              },
              {
                "@type": "CourseInstance",
                courseMode: "Online",
                courseWorkload: "PT120H",
                offers: { "@type": "Offer", price: "15000", priceCurrency: "INR", name: "German B2" },
              },
              {
                "@type": "CourseInstance",
                courseMode: "Online",
                courseWorkload: "PT160H",
                offers: { "@type": "Offer", price: "18000", priceCurrency: "INR", name: "German C1" },
              },
            ],
          }),
        }}
      />

      {/* FAQ Schema – 15 questions */}
      <Script
        id="faq-schema-german-ahmedabad"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is the fee for German language classes in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The fee for German language classes in Ahmedabad typically ranges from ₹8,000 to ₹30,000 depending on the level (A1 to C1), batch type (regular or intensive), and mode (online or offline). Many institutes also offer EMI options and combo discounts for multiple levels.",
                },
              },
              {
                "@type": "Question",
                name: "Can I learn German online from Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, you can learn German online from Ahmedabad through live interactive classes conducted by certified trainers. Online German classes offer the same curriculum, study materials, and exam preparation as offline classes, with the added convenience of learning from home.",
                },
              },
              {
                "@type": "Question",
                name: "How long does it take to complete German A1 in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A German A1 course in Ahmedabad typically takes 2 to 3 months to complete with regular classes (3-5 sessions per week). Intensive batches can complete A1 in 4-6 weeks with daily classes.",
                },
              },
              {
                "@type": "Question",
                name: "Which is the best German language institute in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The best German language institute in Ahmedabad should have Goethe-certified trainers, a structured CEFR-based curriculum, small batch sizes, flexible timings, exam preparation support, and a strong track record of student success in Goethe exams.",
                },
              },
              {
                "@type": "Question",
                name: "Is German language useful for getting a job in Germany?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Absolutely. German language proficiency (B1 and above) is essential for most jobs in Germany, especially in healthcare, engineering, IT, and vocational training (Ausbildung). Even for English-medium workplaces, knowing German significantly improves your career prospects and integration.",
                },
              },
              {
                "@type": "Question",
                name: "What is the difference between A1, A2, B1, B2, and C1 German levels?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "These are CEFR levels: A1 (Beginner) covers basic phrases; A2 (Elementary) handles routine conversations; B1 (Intermediate) enables independent communication; B2 (Upper Intermediate) allows fluent discussion on complex topics; C1 (Advanced) is near-native proficiency for academic and professional use.",
                },
              },
              {
                "@type": "Question",
                name: "Do you provide Goethe exam preparation in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we provide comprehensive Goethe exam preparation for all levels (A1 to C1) including mock tests, previous year papers, speaking practice, and individual feedback on all four modules — Reading (Lesen), Listening (Hören), Writing (Schreiben), and Speaking (Sprechen).",
                },
              },
              {
                "@type": "Question",
                name: "Can working professionals join German classes in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we offer flexible evening and weekend batches specifically designed for working professionals. Our online German classes allow you to learn from anywhere with flexible scheduling that fits your work routine.",
                },
              },
              {
                "@type": "Question",
                name: "Is German required for studying in Germany?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "It depends on your program. Many Master’s programs in Germany are offered in English, but Bachelor’s programs usually require German proficiency (B1 or B2). Even for English-medium programs, learning German helps with daily life, part-time jobs, and post-study employment.",
                },
              },
              {
                "@type": "Question",
                name: "What career options are available after learning German in India?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "After learning German, you can pursue careers in BPO/KPO (German-speaking roles), translation and interpretation, teaching German, tourism and hospitality, international business, and can also apply for jobs, Ausbildung, or higher studies in Germany.",
                },
              },
              {
                "@type": "Question",
                name: "Do you offer German classes for kids in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we offer specially designed German language courses for kids and teenagers in Ahmedabad. Our young learner programs use interactive, fun-based teaching methods to make language learning engaging and effective.",
                },
              },
              {
                "@type": "Question",
                name: "How can I enroll for online German classes in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You can enroll by booking a free demo class on our website, calling our helpline, or visiting our center in Ahmedabad. Our counselors will help you choose the right level and batch based on your goals and schedule.",
                },
              },
              {
                "@type": "Question",
                name: "What study materials are provided in the German course?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our German language course includes comprehensive study materials — textbooks, grammar workbooks, audio-visual resources, practice worksheets, vocabulary lists, and access to our online learning portal with additional exercises and mock tests.",
                },
              },
              {
                "@type": "Question",
                name: "Is there any placement support after completing the German course?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we provide career guidance and placement support including resume building for German job markets, interview preparation, university application assistance for studying in Germany, and connections with recruitment agencies for Ausbildung and nursing programs.",
                },
              },
              {
                "@type": "Question",
                name: "Can I get a certificate after completing German classes in Ahmedabad?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, you will receive a course completion certificate from our institute. Additionally, we prepare you for internationally recognized Goethe-Zertifikat exams, which are accepted worldwide by universities, employers, and immigration authorities.",
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
        .fee-table th, .fee-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; vertical-align: top; }
        .fee-table th { background-color: #f1f5f9; font-weight: 600; }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                🇩🇪 Live Online | A1‑C1 | Free 4‑Day Demo
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Online German Classes in Ahmedabad
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Learn German from A1 to C1 with Certified Trainers
                </span>
              </h1>
              <div className="max-w-3xl mx-auto mb-6 text-lg bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-left text-white/95">
                <p>
                  Are you looking for the <strong>best online German classes in Ahmedabad</strong>? 
                  Whether you're a student planning to study in Germany, a working professional seeking career growth in Europe, 
                  or a healthcare worker preparing for German language certification — our <strong>German language course in Ahmedabad</strong> 
                  is designed to help you achieve fluency from the comfort of your home.
                </p>
                <p className="mt-2">
                  We offer <strong>live online German classes</strong> covering all CEFR levels — 
                  <strong>A1, A2, B1, B2, and C1</strong> — taught by Goethe-certified trainers with real-world experience.
                </p>
              </div>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="/free-demo"
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
                  💬 WhatsApp for Details
                </a>
              </div>
              <div className="animate-up stagger-4 flex flex-wrap justify-center gap-6 mt-8 text-sm">
                <span className="flex items-center gap-2">✅ Goethe‑Certified Faculty</span>
                <span className="flex items-center gap-2">✅ Flexible Timings</span>
                <span className="flex items-center gap-2">✅ Free Study Material</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">

          {/* Why Choose Us */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center section-title-center">Why Choose Our Online German Language Course in Ahmedabad?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Goethe-Certified Faculty – C1/C2 level trainers with teaching experience",
                "Live Interactive Online Classes – small batch sizes, real‑time sessions",
                "All CEFR Levels (A1 to C1) – structured curriculum",
                "Flexible Timings – morning, evening, and weekend batches",
                "Goethe Exam Preparation – mock tests and practice materials",
                "Affordable Course Fees – EMI options & combo discounts",
                "Placement & Career Support – study, Ausbildung, nursing, IT jobs in Germany",
                "Free Demo Class – try before you enrol",
              ].map((point, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
                  <p className="text-gray-800">✅ {point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Course Levels */}
          <section className="bg-white p-8 rounded-3xl shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-center section-title-center">German Language Course Levels We Offer in Ahmedabad</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { level: "A1 (Beginner)", desc: "Perfect for absolute beginners. Learn basic vocabulary, greetings, everyday phrases, and simple sentence structures." },
                { level: "A2 (Elementary)", desc: "Learn to communicate in routine tasks, describe your background, and handle simple conversations." },
                { level: "B1 (Intermediate)", desc: "Achieve independent communication – discuss familiar topics, write essays, prepare for Goethe B1 exam." },
                { level: "B2 (Upper Intermediate)", desc: "Communicate fluently on complex topics, understand technical texts, prepare for university admission." },
                { level: "C1 (Advanced)", desc: "Master advanced German for academic and professional purposes, prepare for Goethe C1." },
              ].map((item, idx) => (
                <div key={idx} className="bg-blue-50 p-5 rounded-xl">
                  <h3 className="text-xl font-bold text-blue-800">{item.level}</h3>
                  <p className="text-gray-700 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Fee Table */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center section-title-center">German Language Course Fees in Ahmedabad</h2>
            <div className="overflow-x-auto">
              <table className="w-full fee-table bg-white rounded-2xl shadow-md">
                <thead>
                  <tr><th>Level</th><th>Duration</th><th>Mode</th><th>Fee Range (INR)</th></tr>
                </thead>
                <tbody>
                  <tr><td>German A1</td><td>2-3 Months</td><td>Online / Offline</td><td>₹8,000 – ₹15,000</td></tr>
                  <tr><td>German A2</td><td>2-3 Months</td><td>Online / Offline</td><td>₹10,000 – ₹18,000</td></tr>
                  <tr><td>German B1</td><td>3-4 Months</td><td>Online / Offline</td><td>₹12,000 – ₹22,000</td></tr>
                  <tr><td>German B2</td><td>3-4 Months</td><td>Online / Offline</td><td>₹15,000 – ₹25,000</td></tr>
                  <tr><td>German C1</td><td>4-5 Months</td><td>Online / Offline</td><td>₹18,000 – ₹30,000</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">* EMI options, combo discounts for multiple levels, and group discounts available. Free study material included.</p>
          </section>

          {/* Course Highlights (Packages, Batch Timings, etc.) */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">📚 Course Highlights (Ahmedabad Batches)</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-3">🎯 Packages</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>German Basic + A1: ₹10,000</li>
                  <li>German Basic + A1 + A2: ₹16,000</li>
                </ul>
                <h3 className="text-xl font-bold mt-6 mb-3">🕒 Batch Timings</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Basic: 7:30 PM</li>
                  <li>A1: 9:00 PM</li>
                  <li>A2: 9:00 PM</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">⏱️ Class Duration & Frequency</h3>
                <p>90 minutes per session · Monday to Friday</p>
                <h3 className="text-xl font-bold mt-6 mb-3">👨‍🏫 Trainer</h3>
                <p>C1 Certified German Trainer</p>
                <h3 className="text-xl font-bold mt-6 mb-3">💻 Mode</h3>
                <p>100% Live Online Classes</p>
                <h3 className="text-xl font-bold mt-6 mb-3">📦 Includes</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Study materials</li>
                  <li>Speaking practice</li>
                  <li>Mock test preparation</li>
                  <li>Goethe exam guidance</li>
                </ul>
              </div>
            </div>
            <p className="text-center mt-6 text-blue-700 font-semibold">🔥 Flexible batches for Ahmedabad students & working professionals.</p>
          </section>

          {/* Free 4‑Day Demo Offer */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">🔥 Free 4‑Day Demo Classes – Try Before You Enrol</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Experience our teaching style with a live 4‑day demo. No payment needed. No commitment.
              Get a feel for our trainers, curriculum, and platform – risk‑free.
            </p>
            <a href="/free-demo" className="mt-6 inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition pulse">
              👉 Book Your Free Demo Now
            </a>
          </section>

          {/* Career Opportunities */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center section-title-center">Career Opportunities After Learning German</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Study in Germany (tuition-free education)",
                "Ausbildung (paid vocational training)",
                "Nursing jobs in Germany",
                "IT & Engineering jobs",
                "Translation & Interpretation",
                "BPO/KPO German-speaking roles",
                "Tourism & Hospitality",
                "Teaching German",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-xl shadow-sm">
                  <span className="text-green-600 text-xl">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Internal Links – avoid cannibalisation */}
          <div className="bg-blue-50 p-6 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">🇩🇪 Related Resources</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/study-in/germany" className="text-blue-700 hover:underline">Study in Germany</Link>
              <span>•</span>
              <Link href="/test-prep/german" className="text-blue-700 hover:underline">German Language Course (General)</Link>
              <span>•</span>
              <Link href="/test-prep/ielts/ielts-coaching-ahmedabad" className="text-blue-700 hover:underline">Ielts Ahemdabad</Link>
            </div>
          </div>

          {/* FAQ Section (15 questions) */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">❓ Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: "What is the fee for German language classes in Ahmedabad?", a: "The fee for German language classes in Ahmedabad typically ranges from ₹8,000 to ₹30,000 depending on the level (A1 to C1), batch type (regular or intensive), and mode (online or offline). Many institutes also offer EMI options and combo discounts for multiple levels." },
                { q: "Can I learn German online from Ahmedabad?", a: "Yes, you can learn German online from Ahmedabad through live interactive classes conducted by certified trainers. Online German classes offer the same curriculum, study materials, and exam preparation as offline classes, with the added convenience of learning from home." },
                { q: "How long does it take to complete German A1 in Ahmedabad?", a: "A German A1 course in Ahmedabad typically takes 2 to 3 months to complete with regular classes (3-5 sessions per week). Intensive batches can complete A1 in 4-6 weeks with daily classes." },
                { q: "Which is the best German language institute in Ahmedabad?", a: "The best German language institute in Ahmedabad should have Goethe-certified trainers, a structured CEFR-based curriculum, small batch sizes, flexible timings, exam preparation support, and a strong track record of student success in Goethe exams." },
                { q: "Is German language useful for getting a job in Germany?", a: "Absolutely. German language proficiency (B1 and above) is essential for most jobs in Germany, especially in healthcare, engineering, IT, and vocational training (Ausbildung). Even for English-medium workplaces, knowing German significantly improves your career prospects and integration." },
                { q: "What is the difference between A1, A2, B1, B2, and C1 German levels?", a: "These are CEFR levels: A1 (Beginner) covers basic phrases; A2 (Elementary) handles routine conversations; B1 (Intermediate) enables independent communication; B2 (Upper Intermediate) allows fluent discussion on complex topics; C1 (Advanced) is near-native proficiency for academic and professional use." },
                { q: "Do you provide Goethe exam preparation in Ahmedabad?", a: "Yes, we provide comprehensive Goethe exam preparation for all levels (A1 to C1) including mock tests, previous year papers, speaking practice, and individual feedback on all four modules — Reading (Lesen), Listening (Hören), Writing (Schreiben), and Speaking (Sprechen)." },
                { q: "Can working professionals join German classes in Ahmedabad?", a: "Yes, we offer flexible evening and weekend batches specifically designed for working professionals. Our online German classes allow you to learn from anywhere with flexible scheduling that fits your work routine." },
                { q: "Is German required for studying in Germany?", a: "It depends on your program. Many Master’s programs in Germany are offered in English, but Bachelor’s programs usually require German proficiency (B1 or B2). Even for English-medium programs, learning German helps with daily life, part-time jobs, and post-study employment." },
                { q: "What career options are available after learning German in India?", a: "After learning German, you can pursue careers in BPO/KPO (German-speaking roles), translation and interpretation, teaching German, tourism and hospitality, international business, and can also apply for jobs, Ausbildung, or higher studies in Germany." },
                { q: "Do you offer German classes for kids in Ahmedabad?", a: "Yes, we offer specially designed German language courses for kids and teenagers in Ahmedabad. Our young learner programs use interactive, fun-based teaching methods to make language learning engaging and effective." },
                { q: "How can I enroll for online German classes in Ahmedabad?", a: "You can enroll by booking a free demo class on our website, calling our helpline, or visiting our center in Ahmedabad. Our counselors will help you choose the right level and batch based on your goals and schedule." },
                { q: "What study materials are provided in the German course?", a: "Our German language course includes comprehensive study materials — textbooks, grammar workbooks, audio-visual resources, practice worksheets, vocabulary lists, and access to our online learning portal with additional exercises and mock tests." },
                { q: "Is there any placement support after completing the German course?", a: "Yes, we provide career guidance and placement support including resume building for German job markets, interview preparation, university application assistance for studying in Germany, and connections with recruitment agencies for Ausbildung and nursing programs." },
                { q: "Can I get a certificate after completing German classes in Ahmedabad?", a: "Yes, you will receive a course completion certificate from our institute. Additionally, we prepare you for internationally recognized Goethe-Zertifikat exams, which are accepted worldwide by universities, employers, and immigration authorities." },
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
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your German Journey in Ahmedabad?</h2>
            <p className="text-xl mb-6">Join the most trusted online German classes. Free 4‑day demo – no commitment.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/free-demo" className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition">🎓 Claim Free Demo</a>
              <a href="https://wa.me/919428186817" target="_blank" className="border-2 border-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition">💬 WhatsApp Now</a>
            </div>
            <p className="mt-6 text-sm text-white/80">*Limited seats per batch – reserve your spot early.</p>
          </section>

          {/* Footer Internal Links */}
          <div className="text-center text-sm text-gray-500 border-t pt-8">
            <p>
              Related: <Link href="/study-in/germany" className="text-blue-600 hover:underline">Study in Germany</Link> | 
              <Link href="/test-prep/german" className="text-blue-600 hover:underline ml-1"> German Language Course (General)</Link> | 
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline ml-1"> PTE Coaching</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}