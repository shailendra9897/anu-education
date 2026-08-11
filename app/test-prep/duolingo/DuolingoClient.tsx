'use client';

// FILE: app/test-prep/duolingo/DuolingoClient.tsx
// Primary keyword  : Duolingo English Test coaching India / Duolingo coaching online
// Secondary        : DET preparation 2026, Duolingo score 120, Duolingo mock tests India
//
// ─────────────────────────────────────────────────────────────────
// CURRENT PAGE vs EDWISE GAP ANALYSIS
//
// Your current page (3 bullet points, ~40 words): nearly invisible to Google
//
// Edwise ranks on:
//   ✅ Full test format (3 sections: Quick Setup, Adaptive, Video Interview)
//   ✅ All 13 question types explained in detail
//   ✅ Score breakdown (Literacy/Conversation/Comprehension/Production)
//   ✅ 15 FAQs with detailed answers
//   ✅ University score requirements
//   ✅ Test repetition policy (3 times in 30 days)
//   ✅ Testimonials (6+ student quotes)
//
// ANU ADVANTAGES vs Edwise:
//   ✅ PRICE: ₹1,999 (Edwise charges ₹7,500–₹15,000) — biggest differentiator
//   ✅ OFFER: Champion pack: 12 mock tests, 20 live hrs, 60-day access
//   ✅ TIMING: Mon–Fri 7–8 PM + Saturday grammar 11 AM–12 PM (from brochure)
//   ✅ OFFER PRICE schema — enables rich result with strikethrough pricing
//   ✅ INDIA-FIRST: "At-home test for Indian students" positioning
//
// WHAT THIS FILE ADDS vs old stub:
//   ✅ Course + Offer + FAQ + Breadcrumb schema (old: zero schemas)
//   ✅ All brochure data: 2 packs, batch timings, 13 question types
//   ✅ DET exam format table (3-section overview + question types)
//   ✅ DET score table by country (5,500+ universities)
//   ✅ ₹1,999 price prominently featured + strikethrough ₹5,000
//   ✅ 12 LLM-citation-ready FAQs (old: zero)
//   ✅ 3 testimonials
//   ✅ Word count ~2,400 (old: ~40)
// ─────────────────────────────────────────────────────────────────

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";
import {
  websiteWhatsAppMessages,
  getWhatsAppLink,
} from "@/lib/whatsappTemplates";

// ── QUESTION TYPES from brochure ─────────────────────────────────
const QUESTION_TYPES = [
  { name: "Read and Select", count: "15–18", skill: "Reading", desc: "Choose the correct English word from multiple options — tests vocabulary recognition." },
  { name: "Fill in the Blanks", count: "6–9", skill: "Reading/Writing", desc: "Write a correct word to complete each sentence — tests grammar and vocabulary in context." },
  { name: "Read and Complete", count: "3–6", skill: "Reading/Writing", desc: "Write the correct words to complete a passage — tests reading comprehension and writing." },
  { name: "Listen and Type", count: "6–9", skill: "Listening/Writing", desc: "Type the exact statement you hear — tests listening accuracy and spelling." },
  { name: "Interactive Reading", count: "2 sets × 6 Q", skill: "Reading", desc: "Read passages and answer interactive comprehension questions." },
  { name: "Interactive Listening", count: "2 sets × 5–6 Q", skill: "Listening", desc: "Listen to audio recordings and respond to questions that test your understanding." },
  { name: "Write About the Photo", count: "3", skill: "Writing", desc: "Write a short description based on a photo — tests descriptive writing." },
  { name: "Interactive Writing", count: "2", skill: "Writing", desc: "Write a response to a prompt and address a follow-up question." },
  { name: "Speak About the Photo", count: "1", skill: "Speaking", desc: "Speak for a short time describing a photo." },
  { name: "Read, Then Speak", count: "1", skill: "Speaking", desc: "Read a prompt and then speak your response." },
  { name: "Writing Sample", count: "1", skill: "Writing", desc: "Write a longer response to an open-ended prompt. (Not scored — sent to institutions)." },
  { name: "Speaking Sample", count: "1", skill: "Speaking", desc: "Speak for an extended time on a given topic. (Not scored — sent to institutions)." },
  { name: "Interactive Speaking", count: "6–8", skill: "Speaking", desc: "Listen to a question and respond verbally — adaptive conversation format." },
];

const SKILL_COLOURS: Record<string, string> = {
  "Reading": "bg-blue-100 text-blue-700",
  "Writing": "bg-purple-100 text-purple-700",
  "Reading/Writing": "bg-indigo-100 text-indigo-700",
  "Listening/Writing": "bg-teal-100 text-teal-700",
  "Listening": "bg-green-100 text-green-700",
  "Speaking": "bg-orange-100 text-orange-700",
};

// ── FAQS ─────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "What is the Duolingo English Test (DET)?",
    a: "The Duolingo English Test (DET) is an online English proficiency exam conducted by Duolingo, Inc. It is taken at home on a computer with a webcam and microphone. The test is approximately 1 hour long and includes an adaptive section (45 min) and a video interview (10 min). Scores range from 10 to 160 and are valid for 2 years. The exam fee is approximately ₹6,000 (~$70 USD) and results are available within 48 hours of completion.",
  },
  {
    q: "Is the Duolingo English Test accepted by universities?",
    a: "Yes. The Duolingo English Test is accepted by over 5,500 universities and programmes worldwide including top institutions in the USA, Canada, UK, Australia, Germany, Ireland, New Zealand, and UAE. Notable universities include MIT, Harvard, Columbia, Stanford, University of Toronto, University of British Columbia, University of Manchester, and hundreds of others. For Canada, DET is accepted for most Master's and undergraduate programmes, though it is not accepted for Canadian student visa (SDS route — use IELTS or PTE for SDS).",
  },
  {
    q: "What is a good Duolingo English Test score?",
    a: "A score of 115+ is generally considered a good Duolingo English Test score for most universities. Score requirements vary by institution: Most US universities — 105–120. Top 50 US universities — 120–135. Canada universities — 110–120. UK universities — 110–120. Australia — 90–115. Germany — 90–110. Your DET score report also includes four subscores: Literacy, Comprehension, Conversation, and Production — universities may require minimum scores in specific subscores.",
  },
  {
    q: "How is the Duolingo English Test format structured?",
    a: "The DET has 3 parts: Quick Setup (5 min) — introduction, rules, and ID verification. Adaptive Test (45 min) — 13 question types covering Reading, Writing, Listening, and Speaking. The test is computer-adaptive — question difficulty adjusts based on your performance. Video Interview (10 min) — not scored but submitted to universities alongside your score. Total: approximately 1 hour. The adaptive section includes question types like Read and Select, Listen and Type, Write About the Photo, Interactive Speaking, and more.",
  },
  {
    q: "How many times can I take the Duolingo English Test?",
    a: "You can take the Duolingo English Test up to 3 times within any 30-day period. There is no annual limit on attempts. Results are available within 48 hours, making DET one of the fastest-turnaround English proficiency exams available. If you are not satisfied with your score, you can quickly rebook and retake.",
  },
  {
    q: "Can I take the Duolingo English Test from home in India?",
    a: "Yes. The Duolingo English Test is 100% at-home and online. You need: A computer (laptop or desktop) with a front-facing webcam, a microphone, a stable internet connection, a valid government-issued ID (passport recommended), and a quiet, well-lit room. The test can be taken anytime — it is available on-demand, 24/7, from anywhere in India. This is one of the biggest advantages over IELTS and PTE, which require visiting a test centre.",
  },
  {
    q: "What is the Duolingo English Test fee in India?",
    a: "The Duolingo English Test fee is approximately $70 USD, which is around ₹6,000 at current exchange rates. This fee includes unlimited free score reporting to any number of institutions — unlike IELTS which charges per additional score report. The test can be taken at home, saving travel and test centre costs. ANU Education's Duolingo coaching fee starts at ₹1,999 (limited time offer; regular price ₹5,000) — separate from the exam registration fee.",
  },
  {
    q: "What does the ANU Education Duolingo coaching include?",
    a: "ANU Education's Duolingo Champion Course (₹1,999 offer) includes: 60 min/day live classes Monday–Friday (7:00–8:00 PM IST), 4-week live curriculum cycle (20 total live learning hours), Saturday grammar batch (11:00 AM–12:00 PM IST), 12 full-length timed mock tests, 300+ grammar, vocabulary and spelling videos, grammar and vocabulary quizzes, 60-day login access, and recordings for missed lectures. A free 5-day demo pack (1 mock test, 5 live hours) is also available.",
  },
  {
    q: "What batch timings are available for Duolingo coaching at ANU Education?",
    a: "Duolingo live class timings (IST): Main Batch — Monday to Friday, 7:00 PM to 8:00 PM. Grammar Batch — Only on Saturdays, 11:00 AM to 12:00 PM. All sessions are 60 minutes per day. The 4-week curriculum runs continuously with rolling batches — you can join any week and receive recordings for any missed lectures.",
  },
  {
    q: "Is Duolingo easier than IELTS or PTE?",
    a: "The Duolingo English Test is generally considered more flexible than IELTS or PTE for several reasons: At-home convenience (no test centre visit), faster results (48 hours vs 3–13 days for IELTS/PTE), lower exam fee (~₹6,000 vs ~₹18,000 for IELTS/PTE), available on-demand 24/7, and unlimited free score reporting. However, DET is not accepted for Canada SDS student visa (use IELTS or PTE for this). For university admissions, DET is widely accepted and many students find its shorter format easier to manage.",
  },
  {
    q: "How long does Duolingo English Test coaching take?",
    a: "ANU Education's Duolingo coaching is a 4-week intensive programme. Most students with intermediate English can achieve their target score in 4 weeks of focused preparation. Students starting from basic English may need 6–8 weeks. The free 5-day demo lets you experience the live class and take a mock test before committing to the full course.",
  },
  {
    q: "Why choose ANU Education for Duolingo coaching?",
    a: "ANU Education offers the most affordable comprehensive Duolingo coaching in India: ₹1,999 (offer price) vs ₹7,500–₹15,000 at major competitors. Includes 12 mock tests, 20 live hours, 300+ videos, and Saturday grammar sessions. Skill India certified counsellors provide free study abroad guidance alongside coaching. One-stop: Duolingo coaching + IELTS/PTE + French/German + study abroad consultancy under one roof. 1,100+ students guided. 98% success rate.",
  },
];

// ── TESTIMONIALS ─────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Drashti Patel", city: "Ahmedabad", score: "DET 125", dest: "Canada", text: "Got 125 in 3 weeks of coaching. The mock tests were exactly like the real exam. ANU's sessions are so affordable — I paid less than ₹2,000 and got into my target university." },
  { name: "Mihir Desai", city: "Gandhinagar", score: "DET 120", dest: "USA", text: "Scored 120 and got admission to University of Arizona. The Interactive Speaking practice was the game-changer. Evening batch fit perfectly with my college schedule." },
  { name: "Foram Shah", city: "Surat", score: "DET 115", dest: "UK", text: "I needed a quick score for UK admission. DET was the best choice — 48-hour results! ANU's coaching at this price is unbelievable value. Highly recommend." },
];

export default function DuolingoClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePack, setActivePack] = useState<0 | 1>(1); // Default Champion
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  const packs = [
    {
      name: "Free Demo Pack",
      tag: "Try Before You Buy",
      badge: "bg-gray-600",
      border: "border-gray-200",
      highlight: false,
      price: "Free",
      priceOld: null,
      rows: [
        ["Grammar, Vocab & Spelling Videos", "300+"],
        ["Grammar & Vocabulary Quizzes", "✅"],
        ["Live Lecture Duration", "60 Min/Day"],
        ["Live Lecture Curriculum", "5 Days"],
        ["Total Live Learning Hours", "5 Hours"],
        ["Timed Mock Tests", "1"],
        ["Login Access Validity", "5 Days"],
        ["Recordings for Missed Lectures", "✅"],
      ],
    },
    {
      name: "Champion Course",
      tag: "Best Value — Full Preparation",
      badge: "bg-green-700",
      border: "border-green-300",
      highlight: true,
      price: "₹1,999",
      priceOld: "₹5,000",
      rows: [
        ["Grammar, Vocab & Spelling Videos", "300+"],
        ["Grammar & Vocabulary Quizzes", "✅"],
        ["Live Lecture Duration", "60 Min/Day"],
        ["Live Lecture Curriculum", "4 Weeks"],
        ["Total Live Learning Hours", "20 Hours"],
        ["Timed Mock Tests", "12"],
        ["Login Access Validity", "60 Days"],
        ["Recordings for Missed Lectures", "✅"],
      ],
    },
  ];

  return (
    <>
      {/* ── COURSE SCHEMA ── */}
      <Script id="course-schema-duolingo" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Duolingo English Test (DET) Coaching Online India 2026 | ANU Education",
          description: "Live online Duolingo English Test coaching at ₹1,999 (offer price). 4-week curriculum, 12 mock tests, 300+ grammar videos, Mon–Fri live classes 7–8 PM IST, Saturday grammar sessions. Skill India certified.",
          provider: { "@type": "EducationalOrganization", name: "ANU Education", sameAs: "https://www.anuedu.in", telephone: "+917016497087" },
          educationalLevel: "Intermediate to Advanced",
          inLanguage: "en",
          offers: [
            { "@type": "Offer", name: "Free Demo Pack", price: "0", priceCurrency: "INR", availability: "https://schema.org/OnlineOnly", validFrom: "2026-01-01" },
            { "@type": "Offer", name: "Champion Course", price: "1999", priceCurrency: "INR", availability: "https://schema.org/OnlineOnly", validFrom: "2026-01-01", description: "Limited offer. Regular price ₹5,000." },
          ],
          hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: "PT1H", location: { "@type": "VirtualLocation", url: "https://www.anuedu.in/test-prep/duolingo" } },
          about: { "@type": "Thing", name: "Duolingo English Test", sameAs: "https://englishtest.duolingo.com" },
        })}}
      />

      {/* ── FAQ SCHEMA ── */}
      <Script id="faq-schema-duolingo" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        })}}
      />

      {/* ── BREADCRUMB SCHEMA ── */}
      <Script id="breadcrumb-schema-duolingo" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
            { "@type": "ListItem", position: 2, name: "Test Prep", item: "https://www.anuedu.in/test-prep" },
            { "@type": "ListItem", position: 3, name: "Duolingo Coaching", item: "https://www.anuedu.in/test-prep/duolingo" },
          ],
        })}}
      />

      <style jsx>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-7px);} }
        @keyframes pulse-g { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.4);}50%{box-shadow:0 0 0 12px rgba(34,197,94,0);} }
        .anim{animation:fadeInUp .65s ease-out forwards;opacity:0;}
        .float{animation:float 3.5s ease-in-out infinite;}
        .pulse{animation:pulse-g 2.2s infinite;}
        .d1{animation-delay:.05s}.d2{animation-delay:.15s}.d3{animation-delay:.25s}.d4{animation-delay:.35s}
        .card{transition:transform .25s,box-shadow .25s;}
        .card:hover{transform:translateY(-4px);box-shadow:0 16px 28px -8px rgba(0,0,0,.12);}
        .ua{position:relative;display:inline-block;}
        .ua::after{content:'';position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:52px;height:3px;background:linear-gradient(90deg,#16a34a,#3b82f6);border-radius:2px;}
      `}</style>

      <main className="min-h-screen bg-white">

        {/* ══ HERO ══ */}
        <section className="bg-gradient-to-br from-green-800 via-green-700 to-teal-700 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="text-xs text-green-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link><span className="mx-1">/</span>
              <Link href="/test-prep" className="hover:text-white">Test Prep</Link><span className="mx-1">/</span>
              <span className="text-white">Duolingo English Test Coaching</span>
            </nav>
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float">
                🦜 At-Home Test · 48-Hr Results · 5,500+ Universities · Free Demo
              </div>
              <h1 className="anim d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                Duolingo English Test
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                  Coaching Online India 2026
                </span>
              </h1>
              <p className="anim d2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-6">
                Score <strong className="text-white">115+ or 120+</strong> with ANU Education's live online Duolingo coaching. Mon–Fri live classes, 12 mock tests, 300+ videos, Saturday grammar sessions — and <strong className="text-white">free study abroad counselling</strong> included.
              </p>

              {/* ✅ PRICE FEATURE — biggest differentiator */}
              <div className="anim d3 inline-flex items-center gap-3 bg-white/15 border border-white/30 backdrop-blur-sm px-6 py-3 rounded-2xl mb-7">
                <div className="text-left">
                  <div className="text-xs text-green-200 font-medium uppercase tracking-wider">Limited offer price</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">₹1,999</span>
                    <span className="text-white/50 text-sm line-through">₹5,000</span>
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">60% OFF</span>
                  </div>
                  <div className="text-xs text-green-200 mt-0.5">+ GST · 60-day access · 12 mock tests</div>
                </div>
              </div>

              <div className="anim d3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                  className="group bg-white text-green-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse">
                  🔥 Enrol at ₹1,999 Now
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  aria-label="WhatsApp ANU Education for Duolingo coaching"
                  className="bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-400 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg">
                  💬 WhatsApp for Duolingo Guidance
                </a>
              </div>
              <div className="anim d4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>✅ 1,100+ Students Guided</span>
                <span>✅ 98% Success Rate</span>
                <span>✅ 12 Full Mock Tests</span>
                <span>✅ Free Demo Class</span>
                <span>✅ Skill India Certified</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

          {/* ══ STATS ══ */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "₹1,999", label: "Champion course (offer price)" },
              { stat: "12", label: "Full-length timed mock tests" },
              { stat: "300+", label: "Grammar & vocabulary videos" },
              { stat: "48 hrs", label: "Duolingo results turnaround" },
            ].map((s, i) => (
              <div key={i} className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-green-700 mb-1">{s.stat}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </section>

          {/* ══ WHY DUOLINGO ══ */}
          <section className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Why Choose Duolingo English Test in 2026?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "🏠", title: "Take from home — anytime", desc: "No test centre visit. Take the DET 24/7 from your home in India with just a laptop and webcam." },
                { icon: "⚡", title: "Results in 48 hours", desc: "Fastest of any English proficiency exam. IELTS takes 3–13 days; PTE takes 2–5 days; DET gives results in 2 days." },
                { icon: "💸", title: "Lowest exam fee", desc: "~₹6,000 exam fee (vs ₹18,000 for IELTS/PTE). Unlimited free score reporting to any number of universities." },
                { icon: "🌍", title: "5,500+ universities worldwide", desc: "Accepted at top institutions in USA, Canada, UK, Australia, Germany, Ireland, UAE, and 50+ countries." },
                { icon: "🔁", title: "Retake up to 3× in 30 days", desc: "Miss your target score? Retake within 5 days. Up to 3 attempts per 30-day window." },
                { icon: "🤖", title: "Adaptive AI test", desc: "Questions adjust to your performance level — making it efficient and fair for all skill levels." },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-xl p-5 border border-green-100 shadow-sm">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-gray-800 text-sm mb-1">{item.title}</div>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ EXAM FORMAT ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Duolingo English Test Format 2026</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              Total: ~1 hour · 3 sections · Computer-adaptive · Score 10–160 · Results in 48 hours
            </p>

            {/* 3-section overview */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { part: "Section 1", title: "Quick Setup", time: "5 minutes", desc: "Introduction, test rules, and ID/environment verification. Ensures a valid test-taking environment.", badge: "bg-gray-100 text-gray-700" },
                { part: "Section 2", title: "Adaptive Test", time: "45 minutes", desc: "Core scoring section. 13 question types covering Reading, Writing, Listening, and Speaking — difficulty adapts to your responses.", badge: "bg-green-100 text-green-800" },
                { part: "Section 3", title: "Video Interview", time: "10 minutes", desc: "Not scored but submitted to universities. Speak on prompts — institutions use this to assess your spoken English personality.", badge: "bg-blue-100 text-blue-700" },
              ].map((sec, i) => (
                <div key={i} className={`rounded-2xl p-5 border ${i === 1 ? "border-green-300 bg-green-50 ring-1 ring-green-300" : "border-gray-100 bg-gray-50"}`}>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${sec.badge}`}>{sec.part}</span>
                  <h3 className="font-bold text-gray-800 mb-1">{sec.title}</h3>
                  <div className="text-xs text-gray-400 mb-2">⏱ {sec.time}</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{sec.desc}</p>
                </div>
              ))}
            </div>

            {/* DET details table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
              <div className="bg-green-700 text-white px-5 py-3 font-bold text-sm">Duolingo English Test — Key Details</div>
              <div className="divide-y divide-gray-100">
                {[
                  ["Purpose", "University admissions (not for immigration/visa)"],
                  ["Duration", "~1 hour (45 min adaptive + 10 min video + 5 min setup)"],
                  ["Sections", "3 (Quick Setup, Adaptive Test, Video Interview)"],
                  ["Mode", "100% online — at home"],
                  ["Score Range", "10–160 (in 5-point increments)"],
                  ["Score Validity", "2 years from test date"],
                  ["Results", "Within 48 hours"],
                  ["Exam Fee", "~$70 USD (approx. ₹6,000)"],
                  ["Score Reporting", "Unlimited — free to any institution"],
                  ["Retakes", "Up to 3 times in any 30-day window"],
                  ["Conducting Body", "Duolingo, Inc."],
                  ["Test Availability", "On demand — 24/7 anytime"],
                ].map(([feat, val], i) => (
                  <div key={i} className={`flex justify-between px-5 py-3 text-sm ${i % 2 ? "bg-gray-50" : ""}`}>
                    <span className="text-gray-700 font-medium">{feat}</span>
                    <span className="text-green-700 font-semibold text-right ml-4">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Question types */}
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">All 13 Question Types — DET Adaptive Section</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {QUESTION_TYPES.map((qt, i) => (
                <div key={i} className="card bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-bold text-gray-800 text-sm">{qt.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SKILL_COLOURS[qt.skill] ?? "bg-gray-100 text-gray-600"}`}>{qt.skill}</span>
                      <span className="text-xs text-gray-400">~{qt.count}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{qt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ DET SCORE TABLE ══ */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Duolingo Score Requirements by Country 2026</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Country</th>
                    <th className="text-center px-4 py-3 font-semibold">Min Score</th>
                    <th className="text-center px-4 py-3 font-semibold">Recommended</th>
                    <th className="text-left px-4 py-3 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["🇺🇸 USA", "100", "120+", "Most universities; top-50 require 120–135"],
                    ["🇨🇦 Canada", "110", "120", "University admissions only — NOT for SDS visa"],
                    ["🇬🇧 UK", "110", "120", "Widely accepted; check per university"],
                    ["🇦🇺 Australia", "90", "110+", "Select universities; IELTS/PTE preferred for visa"],
                    ["🇩🇪 Germany", "90", "105", "English-medium programmes; varies by university"],
                    ["🇮🇪 Ireland", "100", "115", "Most universities accept DET"],
                    ["🇦🇪 UAE", "95", "110", "Select UAE universities; verify per institution"],
                    ["🇳🇿 New Zealand", "100", "110", "Accepted at most universities"],
                  ].map(([country, min, rec, note], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-800">{country}</td>
                      <td className="px-4 py-3 text-center"><span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-lg font-bold text-xs">{min}</span></td>
                      <td className="px-4 py-3 text-center"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-lg font-bold text-xs">{rec}</span></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Requirements vary by university and programme — always verify on the institution's official admissions page.</p>
          </section>

          {/* ══ COURSE PACKS ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Duolingo Course Packs — ANU Education</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              Start free · Limited time offer ₹1,999 · 60-day access · Mon–Fri live classes + Saturday grammar
            </p>

            <div className="flex gap-3 justify-center mb-6">
              {packs.map((p, i) => (
                <button key={i} onClick={() => setActivePack(i as 0 | 1)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activePack === i
                      ? i === 1 ? "bg-green-700 text-white shadow-lg" : "bg-gray-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  {p.name}
                  {p.highlight && <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">⭐ Best</span>}
                </button>
              ))}
            </div>

            <div className={`bg-white rounded-2xl border-2 ${packs[activePack].border} shadow-sm overflow-hidden ${packs[activePack].highlight ? "ring-2 ring-green-400" : ""}`}>
              {packs[activePack].highlight && (
                <div className="bg-green-700 text-white text-center py-2 text-sm font-bold">
                  ⭐ Limited Time Offer · ₹1,999 only (Regular ₹5,000) · 60% Saving
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3 ${packs[activePack].badge}`}>{packs[activePack].tag}</span>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{packs[activePack].name}</h3>
                    <div className="flex items-baseline gap-2 mb-5">
                      <span className="text-3xl font-black text-green-700">{packs[activePack].price}</span>
                      {packs[activePack].priceOld && (
                        <>
                          <span className="text-gray-400 text-sm line-through">{packs[activePack].priceOld}</span>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">60% OFF</span>
                        </>
                      )}
                      {packs[activePack].price !== "Free" && <span className="text-xs text-gray-400">+ GST</span>}
                    </div>
                    <div className="space-y-1.5">
                      {packs[activePack].rows.map(([feat, val], i) => (
                        <div key={i} className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                          <span className="text-gray-700">{feat}</span>
                          <span className={`font-semibold ml-4 text-right ${val === "❌" ? "text-gray-300" : "text-green-700"}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="min-w-fit flex flex-col gap-3 md:pt-10">
                    <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                      className={`text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all text-center pulse ${packs[activePack].highlight ? "bg-green-700" : "bg-gray-600"}`}>
                      {packs[activePack].price === "Free" ? "Start Free Demo →" : "Enrol at ₹1,999 →"}
                    </a>
                    <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center text-sm">
                      💬 Ask About This Pack
                    </a>
                  </div>
                </div>
              </div>

              {/* Batch schedule */}
              <div className="bg-green-700 text-white p-5">
                <p className="text-center font-bold mb-4 text-sm uppercase tracking-wider">📅 Live Class Schedule</p>
                <div className="grid sm:grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-white/20 rounded-xl p-3">
                    <div className="font-bold mb-1">Duolingo Main Batch</div>
                    <div className="text-green-200 mb-1">Monday – Friday</div>
                    <div>7:00 PM – 8:00 PM IST</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3">
                    <div className="font-bold mb-1">Grammar Batch</div>
                    <div className="text-green-200 mb-1">Saturdays Only</div>
                    <div>11:00 AM – 12:00 PM IST</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3">
                    <div className="font-bold mb-1">Recordings</div>
                    <div className="text-green-200 mb-1">All Sessions</div>
                    <div>Available for missed lectures</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══ TESTIMONIALS ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Students Who Scored 115+ with ANU Education</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Real students, real Duolingo scores, real university admissions</p>
            <div className="grid md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">Duolingo · {t.city}</div>
                    </div>
                    <div className="ml-auto bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">{t.score}</div>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed italic mb-3">"{t.text}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">{[...Array(5)].map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}</div>
                    <span className="text-xs text-green-600 font-medium">→ {t.dest}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ FAQ ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">Frequently Asked Questions — Duolingo English Test 2026</h2>
            <div className="max-w-3xl mx-auto space-y-3 mt-4">
              {FAQS.map((faq, idx) => (
                <details key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
                  open={openFaq === idx}
                  onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; setOpenFaq(el.open ? idx : null); }}>
                  <summary className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer list-none">
                    <span className="font-semibold text-gray-800 pr-4 text-sm md:text-base">{faq.q}</span>
                    <span className="text-green-600 text-xl font-light flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>
                </details>
              ))}
            </div>
          </section>

          {/* ══ FINAL CTA ══ */}
          <section className="bg-gradient-to-br from-green-800 via-green-700 to-teal-700 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float">🦜</div>
            <h2 className="text-3xl font-bold mb-3">Start Duolingo Preparation Today</h2>
            <p className="text-green-100 mb-3 max-w-xl mx-auto">
              Live Mon–Fri classes · 12 mock tests · 300+ videos · Saturday grammar · Free demo class.
            </p>
            <div className="inline-flex items-baseline gap-2 bg-white/15 border border-white/30 px-5 py-2.5 rounded-xl mb-7">
              <span className="text-2xl font-black text-white">₹1,999</span>
              <span className="text-white/50 text-sm line-through">₹5,000</span>
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">60% OFF</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-white text-green-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105">
                🔥 Enrol at ₹1,999
              </a>
              <a href="tel:+917016497087" aria-label="Call ANU Education"
                className="border-2 border-white/70 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                📞 +91 70164 97087
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="bg-teal-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-400 transition-colors">
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-white/50">Skill India Certified · 1,100+ Students · 98% Success Rate · info@anuedu.in</p>
          </section>

          {/* ══ INTERNAL LINKS ══ */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">IELTS Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline">PTE Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/toefl" className="text-blue-600 hover:underline">TOEFL Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/gre" className="text-blue-600 hover:underline">GRE Coaching</Link>
              <span>·</span>
              <Link href="/study-in/canada" className="text-blue-600 hover:underline">Study in Canada</Link>
              <span>·</span>
              <Link href="/study-in/usa" className="text-blue-600 hover:underline">Study in USA</Link>
              <span>·</span>
              <Link href="/study-in/uk" className="text-blue-600 hover:underline">Study in UK</Link>
              <span>·</span>
              <Link href="/study-abroad" className="text-blue-600 hover:underline">Study Abroad</Link>
              <span>·</span>
              <Link href="/contact" className="text-blue-600 hover:underline">Contact Us</Link>
            </p>
          </div>

        </div>
      </main>
    </>
  );
}