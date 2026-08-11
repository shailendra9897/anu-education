'use client';

// FILE: app/test-prep/pte-coaching-gandhinagar/PTEGandhinagarClient.tsx
// Keywords: PTE classes Gandhinagar · PTE online classes · PTE coaching Gandhinagar
//
// ─────────────────────────────────────────────────────────────────
// CURRENT PAGE ISSUES (live audit)
//   ❌ Wrong WhatsApp: 9428186817 → must be 7016497087
//   ❌ Wrong stats: "1000+ students / 92% success" → 1,100+ / 98%
//   ❌ No course pack details (brochure has 4 packs with fees)
//   ❌ No batch timings from brochure (Morning 9–10:30AM, Eve 8–9:30PM)
//   ❌ No yearly planner dates
//   ❌ No PTE exam format / 3-section breakdown (missing vs competitors)
//   ❌ No PTE score band table by country
//   ❌ No Canada SDS PTE 60 requirement (unique selling point from brochure)
//   ❌ No "Get started free" link to study.anuedu.in/register (requested)
//   ❌ No schema: Course, FAQ, Breadcrumb
//   ❌ Only ~400 words — extremely thin
//   ❌ FAQs have no content (collapsible but empty)
//   ❌ No pricing transparency (brochure shows ₹2000/₹2500/₹3500)
//   ❌ No Eduvantage PTE features listed (concept builders, simulated engine, etc.)
//
// COMPETITOR GAPS vs E2Language / EEC / Vision Language Experts
//   ✅ E2Language ranks on: all 20 item types explained, AI feedback, WFD bank
//   ✅ EEC ranks on: price transparency (₹7,500), 3 modes, WFD bank 500+
//   ✅ Vision ranks on: personalised study plan, mock test scores, unlimited practice
//
// WHAT THIS FILE ADDS
//   ✅ 4-pack comparison table (Demo/Self Prep/Live Class/Champion) with fees
//   ✅ Full exam format: 3 sections, 23 task types, timings
//   ✅ PTE score band table by country
//   ✅ Canada SDS PTE 60 section — unique hook
//   ✅ Eduvantage PTE platform features
//   ✅ Live class schedule + yearly planner (Morning & Evening)
//   ✅ Saturday doubt-solving session
//   ✅ Course schema + FAQ schema + Breadcrumb schema
//   ✅ 12 LLM-citation-ready FAQs (from brochure FAQs + expanded)
//   ✅ All CTAs point to study.anuedu.in/register
//   ✅ WhatsApp corrected to 7016497087
//   ✅ Stats corrected: 1,100+ · 98%
//   ✅ Word count ~2,400
// ─────────────────────────────────────────────────────────────────

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";
import {
  websiteWhatsAppMessages,
  getWhatsAppLink,
} from "@/lib/whatsappTemplates";

// ── COURSE PACKS from brochure screenshot ────────────────────────
const packs = [
  {
    id: "demo", name: "Demo Pack", tag: "Try Before You Buy",
    badge: "bg-gray-600", border: "border-gray-200", highlight: false,
    price: "Free", validity: "3 Days",
    rows: [
      ["English Assessment Test", "✅"],
      ["Vocab, Grammar Videos", "300+"],
      ["LIVE Lectures Duration", "90 Min/Day"],
      ["Live Lecture Curriculum", "6 Weeks (preview)"],
      ["Timed Mock Tests", "1"],
      ["Practice Exercises", "✅"],
      ["Results by Expert Mentors", "❌"],
      ["Login Validity", "3 Days"],
      ["Price (GST extra)", "Free"],
    ],
  },
  {
    id: "selfprep", name: "Self Prep Pack", tag: "Best for Self-Starters",
    badge: "bg-blue-700", border: "border-blue-200", highlight: false,
    price: "₹2,000", validity: "180 Days",
    rows: [
      ["English Assessment Test", "✅"],
      ["Vocab, Grammar Videos", "300+"],
      ["LIVE Lectures Duration", "❌"],
      ["Live Lecture Curriculum", "❌"],
      ["Timed Mock Tests", "14"],
      ["Practice Exercises", "180+ (800+ Questions)"],
      ["Results by Expert Mentors", "✅"],
      ["Login Validity", "180 Days"],
      ["Price (GST extra)", "₹2,000"],
    ],
  },
  {
    id: "liveclass", name: "Live Class Pack", tag: "Live Classes + Mentors",
    badge: "bg-indigo-700", border: "border-indigo-200", highlight: false,
    price: "₹2,500", validity: "180 Days",
    rows: [
      ["English Assessment Test", "✅"],
      ["Vocab, Grammar Videos", "300+"],
      ["LIVE Lectures Duration", "90 Min/Day"],
      ["Live Lecture Curriculum", "6 Weeks"],
      ["Timed Mock Tests", "❌"],
      ["Practice Exercises", "❌"],
      ["Results by Expert Mentors", "✅"],
      ["Login Validity", "180 Days"],
      ["Price (GST extra)", "₹2,500"],
    ],
  },
  {
    id: "champion", name: "Champion Pack", tag: "Everything Included",
    badge: "bg-green-700", border: "border-green-300", highlight: true,
    price: "₹3,500", validity: "180 Days",
    rows: [
      ["English Assessment Test", "✅"],
      ["Vocab, Grammar Videos", "300+"],
      ["LIVE Lectures Duration", "90 Min/Day"],
      ["Live Lecture Curriculum", "6 Weeks"],
      ["Timed Mock Tests", "14"],
      ["Practice Exercises", "180+ (800+ Questions)"],
      ["Results by Expert Mentors", "✅"],
      ["Login Validity", "180 Days"],
      ["Price (GST extra)", "₹3,500"],
    ],
  },
];

const faqs = [
  {
    q: "Is PTE coaching in Gandhinagar available fully online?",
    a: "Yes. ANU Education's PTE coaching for Gandhinagar students is 100% online. Live classes are streamed via video platform, so students from Kudasan, Sector 21, Infocity, Raysan, Sargasan, Adalaj, and all other Gandhinagar areas can join from home without commuting. All 4 course packs — Demo, Self Prep, Live Class, and Champion — are available online.",
  },
  {
    q: "What are the PTE course fees at ANU Education?",
    a: "ANU Education offers 4 PTE Academic course packs: Demo Pack — Free (3-day access, 1 mock test). Self Prep Pack — ₹2,000 (180 days, 14 mock tests, 180+ exercises, no live classes). Live Class Pack — ₹2,500 (180 days, 90 min/day live classes, 6-week curriculum, expert mentor results). Champion Pack — ₹3,500 (180 days, everything in Self Prep + Live Class together — 14 mock tests, 800+ practice questions, 90 min/day live classes). All prices exclude GST.",
  },
  {
    q: "What is the PTE live class schedule for Gandhinagar students?",
    a: "Live Class and Champion Pack batches run Monday to Friday: Morning batch — 9:00 AM to 10:30 AM (IST). Evening batch — 8:00 PM to 9:30 PM (IST). PTE Demo Batch runs daily 6:00 PM to 7:00 PM. Grammar Batch: Morning 10:00 AM–11:00 AM and 11:00 AM–12:00 PM. Saturday Doubt Solving Session: 10:00 AM to 11:00 AM. 6-week live curriculum · 45 total live learning hours · 90 min per session.",
  },
  {
    q: "What is the PTE exam format in 2026?",
    a: "PTE Academic is a computer-based test lasting approximately 2 hours with 3 sections: Part 1 — Speaking & Writing (54–67 minutes): 10 task types, ~36 questions. Tasks include Read Aloud, Repeat Sentence, Describe Image, Retell Lecture, Answer Short Question, Summarize Group Discussion, Respond to a Situation, Summarize Written Text, Essay. Part 2 — Reading (29–30 minutes): 5 task types, ~18 questions. Part 3 — Listening (30–43 minutes): 8 task types, ~20 questions including Write From Dictation and Highlight Incorrect Words. Total: 23 task types across 3 sections, all AI-scored.",
  },
  {
    q: "What PTE score do I need for Canada, Australia, UK, and USA?",
    a: "PTE score requirements by country: Canada student visa (SDS) — PTE Academic 60 overall (from August 2023). Canada university admissions — typically 58–65. Australia student visa — 50+ (varies by course; STEM usually 65+). Australia PR — 65 (Competent English) or 79 (Proficient). UK universities — 59–65. USA universities — 53–68 (varies). New Zealand — 50+. ANU Education coaches students to specific band targets, not just generic preparation.",
  },
  {
    q: "Is PTE Academic accepted for the Canada SDS visa category?",
    a: "Yes. Beginning 10th August 2023, PTE Academic is officially accepted as a valid language proficiency score under Canada's Student Direct Stream (SDS) visa category. For SDS eligibility, students need an overall PTE Academic score of 60. Important: only scores from tests conducted at authorised PTE test centres are valid — home-based PTE scores are not accepted for SDS. ANU Education's coaching specifically targets SDS requirements.",
  },
  {
    q: "What is the PTE exam fee in India in 2026?",
    a: "The PTE Academic exam fee in India is approximately ₹18,000. Results are available within 5 working days. The exam can be taken on over 360 days per year at 35+ test locations across India. The ANU Education course fee (₹2,000–₹3,500) is separate from the PTE exam registration fee, which is paid directly to Pearson through the myPTE account.",
  },
  {
    q: "Is PTE computer-based or paper-based?",
    a: "PTE is available ONLY in computer-based format — there is no paper-based PTE Academic. All 23 task types, including speaking tasks (which are recorded by microphone), are completed on a computer. This makes online coaching with a computer practice environment especially valuable, as it mirrors the exact test interface.",
  },
  {
    q: "How many times can I take the PTE exam?",
    a: "There is no limit on PTE exam attempts. Candidates can retake the exam as many times as they want, with a minimum gap of 5 days between attempts. This flexibility is one reason PTE is popular — if one attempt doesn't meet your target score, you can quickly rebook and retake. ANU Education's mock tests are designed to help you reach your target score as quickly as possible.",
  },
  {
    q: "What is the validity of a PTE score?",
    a: "PTE Academic scores are valid for 2 years from the date of the test. After 2 years, the score will no longer be visible in your myPTE account. Most universities, immigration bodies, and visa authorities require scores within this 2-year window. Plan your test date to ensure your score remains valid for your application deadlines.",
  },
  {
    q: "Can I send my PTE score to multiple universities?",
    a: "Yes. PTE allows candidates to send their score to an unlimited number of institutions at no additional charge. This is a significant advantage over IELTS, which charges a fee for each additional score report beyond the initial 5 free sends. The score can be sent via your myPTE account immediately after results are available.",
  },
  {
    q: "What makes ANU Education's PTE coaching different in Gandhinagar?",
    a: "ANU Education offers the most complete PTE coaching package available for Gandhinagar students: 4 course packs from free to ₹3,500 (GST extra), 14 full-length timed mock tests, 180+ practice exercises with 800+ questions, 300+ vocab and grammar videos, live Morning and Evening batches (90 min/day, Mon–Fri), Saturday doubt-solving sessions, AI-based scoring and feedback, free English Assessment Test, Eduvantage PTE platform with simulated test engine, concept builders, and mentor support, and free study abroad counselling. Skill India certified. 1,100+ students guided. 98% success rate.",
  },
];

export default function PTEGandhinagarClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePack, setActivePack] = useState(3); // Champion default
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  return (
    <>
      {/* ══ COURSE SCHEMA ══ */}
      <Script id="course-schema-pte-gandhinagar" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        name: "PTE Online Classes in Gandhinagar – PTE Academic Coaching 2026 | ANU Education",
        description: "Live online PTE Academic coaching for Gandhinagar students. 4 course packs (Demo/Self Prep/Live Class/Champion), 14 mock tests, 180+ practice exercises, 300+ vocab videos, Morning & Evening live batches, Saturday doubt-solving, AI scoring. Skill India certified.",
        provider: { "@type": "EducationalOrganization", name: "ANU Education", sameAs: "https://www.anuedu.in", telephone: "+917016497087", address: { "@type": "PostalAddress", addressLocality: "Modasa", addressRegion: "Gujarat", addressCountry: "IN" } },
        educationalLevel: "All levels — PTE 40 to 90",
        inLanguage: "en",
        coursePrerequisites: "Basic English. No prior PTE experience needed.",
        offers: [
          { "@type": "Offer", name: "Demo Pack", priceCurrency: "INR", price: "0", description: "3-day free trial, 1 mock test" },
          { "@type": "Offer", name: "Self Prep Pack", priceCurrency: "INR", price: "2000", description: "180 days, 14 mock tests, 800+ questions" },
          { "@type": "Offer", name: "Live Class Pack", priceCurrency: "INR", price: "2500", description: "180 days, live 90 min/day classes" },
          { "@type": "Offer", name: "Champion Pack", priceCurrency: "INR", price: "3500", description: "180 days, live classes + 14 mocks + 800+ exercises" },
        ],
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: "PT1H30M", startDate: "2026-06-01", location: { "@type": "VirtualLocation", url: "https://www.anuedu.in/test-prep/pte-coaching-gandhinagar" } },
        about: { "@type": "Thing", name: "Pearson Test of English Academic", sameAs: "https://en.wikipedia.org/wiki/Pearson_Test_of_English" },
      })}} />

      {/* ══ FAQ SCHEMA ══ */}
      <Script id="faq-schema-pte-gandhinagar" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      })}} />

      {/* ══ BREADCRUMB SCHEMA ══ */}
      <Script id="breadcrumb-schema-pte-gandhinagar" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
          { "@type": "ListItem", position: 2, name: "Test Prep", item: "https://www.anuedu.in/test-prep" },
          { "@type": "ListItem", position: 3, name: "PTE Coaching Gandhinagar", item: "https://www.anuedu.in/test-prep/pte-coaching-gandhinagar" },
        ],
      })}} />

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
        .ua::after{content:'';position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:52px;height:3px;background:linear-gradient(90deg,#1d4ed8,#16a34a);border-radius:2px;}
      `}</style>

      <main className="min-h-screen bg-white">

        {/* ══ HERO ══ */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-800 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="text-xs text-blue-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link><span className="mx-1">/</span>
              <Link href="/test-prep" className="hover:text-white">Test Prep</Link><span className="mx-1">/</span>
              <span className="text-white">PTE Classes Gandhinagar</span>
            </nav>
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float">
                🎯 100% Online · 4 Course Packs · Free Demo · From ₹2,000
              </div>
              <h1 className="anim d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                PTE Classes in Gandhinagar
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                  Online Coaching · Score 65+ or 79+
                </span>
              </h1>
              <p className="anim d2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                ANU Education offers the most complete <strong className="text-white">online PTE classes</strong> for Gandhinagar students — 4 course packs from free to ₹3,500, <strong className="text-white">14 full-length mock tests</strong>, 800+ practice questions, live Morning &amp; Evening batches, Saturday doubt sessions, and AI-based scoring. Join from Kudasan, Sector 21, Infocity, Sargasan, or anywhere in Gandhinagar.
              </p>
              <div className="anim d3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse">
                  🔥 Get Started Free
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.pteAhmedabad)} target="_blank" rel="noopener noreferrer"
                  aria-label="WhatsApp ANU Education for PTE classes Gandhinagar"
                  className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg">
                  💬 WhatsApp for PTE Guidance
                </a>
              </div>
              <div className="anim d4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>✅ 1,100+ Students Guided</span>
                <span>✅ 98% Success Rate</span>
                <span>✅ 14 Full Mock Tests</span>
                <span>✅ Free Demo Class</span>
                <span>✅ Canada SDS 60 Coaching</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

          {/* ══ STATS ══ */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "14", label: "Full-length timed mock tests" },
              { stat: "800+", label: "Practice questions (Champion)" },
              { stat: "300+", label: "Vocab & grammar videos" },
              { stat: "₹2,000", label: "Self Prep Pack starting price" },
            ].map((s, i) => (
              <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-blue-700 mb-1">{s.stat}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </section>

          {/* ══ CANADA SDS HOOK ══ */}
          <section className="bg-gradient-to-r from-red-50 via-white to-blue-50 border border-red-100 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="text-6xl float flex-shrink-0">🇨🇦</div>
              <div className="flex-1">
                <span className="inline-block bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">Canada SDS Update</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">PTE Score 60 = Canada SDS Student Visa</h2>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  Since <strong>10th August 2023</strong>, PTE Academic is officially accepted under Canada's <strong>Student Direct Stream (SDS)</strong> visa category. Students with a PTE overall score of 60+ get faster visa processing — typically within 20 days instead of regular processing time.
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ PTE 60 overall = SDS eligible (authorised test centre only)</li>
                  <li>✅ Accepted by IRCC (Immigration, Refugees & Citizenship Canada)</li>
                  <li>✅ Home-based PTE scores are <strong>NOT</strong> valid for SDS</li>
                  <li>✅ ANU Education's Champion Pack specifically targets SDS score</li>
                </ul>
              </div>
              <div className="min-w-fit flex flex-col gap-3">
                <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                  className="bg-red-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-800 transition-colors text-center text-sm pulse">
                  Start SDS Preparation →
                </a>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors text-center text-sm">
                  💬 Ask on WhatsApp
                </a>
              </div>
            </div>
          </section>

          {/* ══ COURSE PACKS ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">PTE Academic Course Packs — Gandhinagar</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              4 packs for every need · Start free with Demo · All prices GST extra · 180-day access
            </p>

            {/* Pack selector tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {packs.map((p, i) => (
                <button key={i} onClick={() => setActivePack(i)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                    activePack === i
                      ? `${p.badge} text-white shadow-lg`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  {p.name}
                  {p.highlight && <span className="ml-1 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full">⭐</span>}
                </button>
              ))}
            </div>

            <div className={`bg-white rounded-2xl border-2 ${packs[activePack].border} shadow-sm overflow-hidden ${packs[activePack].highlight ? "ring-2 ring-green-400" : ""}`}>
              {packs[activePack].highlight && (
                <div className="bg-green-700 text-white text-center py-2 text-sm font-bold">
                  ⭐ Most Complete — Live Classes + 14 Mock Tests + 800+ Questions
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3 ${packs[activePack].badge}`}>
                      {packs[activePack].tag}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{packs[activePack].name}</h3>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-3xl font-black text-blue-700">{packs[activePack].price}</span>
                      {packs[activePack].price !== "Free" && <span className="text-xs text-gray-400">+GST · {packs[activePack].validity} access</span>}
                    </div>
                    <div className="space-y-1.5">
                      {packs[activePack].rows.map(([feat, val], i) => (
                        <div key={i} className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                          <span className="text-gray-700">{feat}</span>
                          <span className={`font-semibold ml-4 text-right ${val === "❌" ? "text-gray-300" : "text-blue-700"}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="min-w-fit flex flex-col gap-3 md:pt-10">
                    <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                      className={`text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all text-center pulse ${packs[activePack].badge}`}>
                      {packs[activePack].price === "Free" ? "Start Free Demo →" : "Get Started →"}
                    </a>
                    <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center text-sm">
                      💬 Ask About This Pack
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* All 4 packs comparison mini-table */}
            <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-xs">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="text-left px-3 py-3">Feature</th>
                    <th className="text-center px-3 py-3">Demo</th>
                    <th className="text-center px-3 py-3">Self Prep<br/>₹2,000</th>
                    <th className="text-center px-3 py-3">Live Class<br/>₹2,500</th>
                    <th className="text-center px-3 py-3 bg-green-700">Champion ⭐<br/>₹3,500</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["English Assessment Test", "✅", "✅", "✅", "✅"],
                    ["Vocab & Grammar Videos", "300+", "300+", "300+", "300+"],
                    ["Live 90-Min Daily Classes", "✅ (preview)", "❌", "✅ 6 weeks", "✅ 6 weeks"],
                    ["Timed Mock Tests", "1", "14", "❌", "14"],
                    ["Practice Exercises", "✅", "800+", "❌", "800+"],
                    ["Expert Mentor Results", "❌", "✅", "✅", "✅"],
                    ["Validity", "3 Days", "180 Days", "180 Days", "180 Days"],
                  ].map(([feat, d, sp, lc, ch], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 font-medium text-gray-700">{feat}</td>
                      <td className="px-3 py-2 text-center text-gray-500">{d}</td>
                      <td className="px-3 py-2 text-center text-blue-700 font-medium">{sp}</td>
                      <td className="px-3 py-2 text-center text-indigo-700 font-medium">{lc}</td>
                      <td className="px-3 py-2 text-center text-green-700 font-bold bg-green-50">{ch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ══ EDUVANTAGE FEATURES ══ */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What You Get — Eduvantage PTE Platform</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "🎥", f: "Live Classes", d: "Real-time expert interaction. Morning 9–10:30 AM & Evening 8–9:30 PM slots." },
                { icon: "🧱", f: "Concept Builders", d: "Task-by-task strategy modules for all 23 PTE question types." },
                { icon: "📖", f: "Vocab & Grammar Lessons", d: "300+ videos covering high-frequency vocabulary and grammar for PTE." },
                { icon: "🧪", f: "Simulated Test Engine", d: "Exact PTE test environment — same interface, timing, and task sequence as the real exam." },
                { icon: "📝", f: "Full-Length Mock Tests", d: "14 timed mocks with AI scoring and detailed section-wise analysis." },
                { icon: "✍️", f: "Speaking & Writing Evaluation", d: "Submit responses and receive expert mentor feedback in text and audio." },
                { icon: "🔧", f: "Authentic Practice Material", d: "180+ exercises with 800+ questions — fresh, updated, non-recycled content." },
                { icon: "💡", f: "Video Tips & Strategies", d: "Targeted tips for scoring well in Write From Dictation, Retell Lecture, and other high-value tasks." },
                { icon: "🆓", f: "Free English Assessment", d: "Diagnostic test on Day 1 — know your baseline PTE score before you start coaching." },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-3">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="font-bold text-gray-800 text-sm mb-0.5">{item.f}</div>
                    <div className="text-gray-500 text-xs leading-relaxed">{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ EXAM FORMAT ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">PTE Academic Exam Format 2026</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              3 sections · 23 task types · ~2 hours · 100% AI-scored · Results in 5 working days
            </p>
            <div className="grid md:grid-cols-3 gap-5 mb-6">
              {[
                {
                  part: "Part 1", title: "Speaking & Writing", time: "54–67 Minutes",
                  tasks: 10, questions: "~36", color: "border-blue-300 bg-blue-50", badge: "bg-blue-700",
                  types: ["Personal Introduction", "Read Aloud", "Repeat Sentence", "Describe Image", "Re-tell Lecture", "Answer Short Question", "Summarize Group Discussion", "Respond to a Situation", "Summarize Written Text", "Essay (20 min)"],
                },
                {
                  part: "Part 2", title: "Reading", time: "29–30 Minutes",
                  tasks: 5, questions: "~18", color: "border-green-300 bg-green-50", badge: "bg-green-700",
                  types: ["Reading & Writing Fill in the Blanks", "Multiple Choice (Multiple Answer)", "Re-order Paragraphs", "Reading Fill in the Blanks", "Multiple Choice (Single Answer)"],
                },
                {
                  part: "Part 3", title: "Listening", time: "30–43 Minutes",
                  tasks: 8, questions: "~20", color: "border-purple-300 bg-purple-50", badge: "bg-purple-700",
                  types: ["Summarize Spoken Text", "Multiple Choice (Multiple Answer)", "Fill in the Blanks", "Highlight Correct Summary", "Multiple Choice (Single Answer)", "Select Missing Word", "Highlight Incorrect Words", "Write From Dictation"],
                },
              ].map((sec, i) => (
                <div key={i} className={`rounded-2xl border-2 ${sec.color} p-5`}>
                  <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3 ${sec.badge}`}>{sec.part}</span>
                  <h3 className="font-bold text-gray-800 mb-1">{sec.title}</h3>
                  <div className="text-xs text-gray-400 mb-3">⏱ {sec.time} · {sec.tasks} task types · {sec.questions} questions</div>
                  <ul className="space-y-1">
                    {sec.types.map((t, j) => <li key={j} className="text-xs text-gray-600 flex gap-1.5"><span className="text-gray-400 flex-shrink-0">{j + 1}.</span>{t}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {/* Score band table */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 text-center text-lg">PTE Score Requirements by Country 2026</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-blue-700 text-white"><tr>
                    <th className="text-left px-3 py-2">Country / Purpose</th>
                    <th className="text-center px-3 py-2">Minimum</th>
                    <th className="text-center px-3 py-2">Recommended</th>
                    <th className="text-left px-3 py-2">Notes</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ["🇨🇦 Canada — SDS Student Visa", "60", "65", "Must be from authorised test centre"],
                      ["🇨🇦 Canada — Universities", "58–65", "65+", "Varies by institution"],
                      ["🇦🇺 Australia — Student Visa", "50+", "65", "Writing & Speaking min 54 from Aug 2026"],
                      ["🇦🇺 Australia — PR (Competent)", "50", "65", "65 = Competent; 79 = Proficient (immigration)"],
                      ["🇬🇧 UK — Universities", "59", "65", "Varies by university and course"],
                      ["🇺🇸 USA — Universities", "53–68", "65+", "Varies significantly by institution"],
                      ["🇳🇿 New Zealand", "50+", "58+", "Accepted for student & work visas"],
                    ].map(([dest, min, rec, note], i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 font-medium text-gray-800">{dest}</td>
                        <td className="px-3 py-2 text-center"><span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-bold">{min}</span></td>
                        <td className="px-3 py-2 text-center"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">{rec}</span></td>
                        <td className="px-3 py-2 text-gray-500">{note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ══ BATCH SCHEDULE ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">PTE Live Class Schedule — Gandhinagar 2026</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              Mon–Fri live classes · Saturday doubt sessions · 6-week curriculum · 45 total live hours
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm mb-5">
              <table className="w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="text-left px-4 py-3">Course / Batch</th>
                    <th className="text-left px-4 py-3">Days</th>
                    <th className="text-center px-4 py-3">🌅 Morning</th>
                    <th className="text-center px-4 py-3">🌙 Evening</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-white">
                    <td className="px-4 py-3 font-semibold text-gray-800">PTE Academic (English)</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">Mon – Fri</td>
                    <td className="px-4 py-3 text-center text-blue-700 font-medium text-xs">9:00 AM – 10:30 AM</td>
                    <td className="px-4 py-3 text-center text-indigo-700 font-medium text-xs">8:00 PM – 9:30 PM</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">Grammar Batch</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">Mon – Fri</td>
                    <td className="px-4 py-3 text-center text-blue-700 font-medium text-xs">10:00 AM – 11:00 AM<br/><span className="text-gray-400">or 11:00 AM – 12:00 PM</span></td>
                    <td className="px-4 py-3 text-center text-gray-400 text-xs">—</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3 font-semibold text-blue-700">PTE Demo Batch</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">Daily (3 days)</td>
                    <td className="px-4 py-3 text-center text-gray-400 text-xs">—</td>
                    <td className="px-4 py-3 text-center text-green-700 font-medium text-xs">6:00 PM – 7:00 PM</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-4 py-3 font-semibold text-green-800">🔔 Doubt Solving Session</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">Saturday only</td>
                    <td className="px-4 py-3 text-center text-green-700 font-bold text-xs" colSpan={2}>10:00 AM – 11:00 AM</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Yearly planner */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="bg-blue-700 text-white px-5 py-3 font-bold text-sm">🌅 Morning Batch (9:00–10:30 AM IST)</div>
                <div className="p-3 grid grid-cols-2 gap-1 text-xs">
                  {[["05-Jan-2026","13-Feb-2026"],["16-Feb-2026","27-Mar-2026"],["30-Mar-2026","08-May-2026"],["11-May-2026","19-Jun-2026"],["22-Jun-2026","31-Jul-2026"],["03-Aug-2026","11-Sep-2026"],["14-Sep-2026","23-Oct-2026"],["26-Oct-2026","04-Dec-2026"],["07-Dec-2026","15-Jan-2027"]].map(([s,e], i) => (
                    <div key={i} className={`flex justify-between px-2 py-1.5 rounded ${i%2===0?"bg-gray-50":"bg-white"}`}>
                      <span className="text-blue-700 font-medium">{s}</span>
                      <span className="text-gray-400">→ {e}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
                <div className="bg-indigo-700 text-white px-5 py-3 font-bold text-sm">🌙 Evening Batch (8:00–9:30 PM IST)</div>
                <div className="p-3 grid grid-cols-2 gap-1 text-xs">
                  {[["15-Dec-2025","23-Jan-2026"],["26-Jan-2026","06-Mar-2026"],["09-Mar-2026","17-Apr-2026"],["20-Apr-2026","29-May-2026"],["01-Jun-2026","10-Jul-2026"],["13-Jul-2026","21-Aug-2026"],["24-Aug-2026","02-Oct-2026"],["05-Oct-2026","13-Nov-2026"],["16-Nov-2026","25-Dec-2026"]].map(([s,e], i) => (
                    <div key={i} className={`flex justify-between px-2 py-1.5 rounded ${i%2===0?"bg-gray-50":"bg-white"}`}>
                      <span className="text-indigo-700 font-medium">{s}</span>
                      <span className="text-gray-400">→ {e}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ══ LOCAL AREAS ══ */}
          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              PTE Online Classes for All Areas of Gandhinagar
            </h2>
            <p className="text-center text-gray-600 text-sm mb-5">
              100% online — join from home, no commute. Serving every part of Gandhinagar and Ahmedabad.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Kudasan","Sargasan","Sector 21","Sector 6","Infocity","Adalaj","Pethapur","Raysan","Chandkheda","Motera","Sabarmati","Ranip","Gota","Bopal","Thaltej","Ahmedabad","Mehsana","Kalol"].map(city => (
                <span key={city} className="bg-white border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700">📍 {city}</span>
              ))}
            </div>
          </section>

          {/* ══ FREE DEMO CTA ══ */}
          <section className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">🔥 Get Started Free — 3-Day PTE Demo</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto text-sm">
              Join the demo batch (daily 6–7 PM), take 1 full mock test, and get a free English Assessment score. No payment, no commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
              {["Daily demo class (6–7 PM)","Free English Assessment","1 mock test","Expert feedback preview"].map(f => (
                <div key={f} className="bg-white/80 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-700 border border-blue-200">✔ {f}</div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors pulse">
                👉 Get Started Free
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors">
                💬 +91 70164 97087
              </a>
            </div>
          </section>

          {/* ══ FAQ ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">
              Frequently Asked Questions — PTE Classes Gandhinagar
            </h2>
            <div className="max-w-3xl mx-auto space-y-3 mt-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button onClick={() => toggleFaq(idx)} aria-expanded={openFaq === idx}
                    className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <span className="font-semibold text-gray-800 pr-4 text-sm md:text-base">{faq.q}</span>
                    <span className="text-blue-600 text-xl font-light flex-shrink-0">{openFaq === idx ? "−" : "+"}</span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ══ FINAL CTA ══ */}
          <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float">🎯</div>
            <h2 className="text-3xl font-bold mb-3">Start PTE Preparation in Gandhinagar Today</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              4 packs from free · 14 mock tests · 800+ questions · Live Morning &amp; Evening classes · Saturday doubt sessions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105">
                🔥 Get Started Free
              </a>
              <a href="tel:+917016497087" aria-label="Call ANU Education"
                className="border-2 border-white/70 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                📞 +91 70164 97087
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.pteAhmedabad)} target="_blank" rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors">
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-white/50">Skill India Certified · 1,100+ Students · 98% Success Rate · info@anuedu.in</p>
          </section>

          {/* ══ INTERNAL LINKS ══ */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/test-prep/pte-coaching-ahmedabad" className="text-blue-600 hover:underline">PTE Coaching Ahmedabad</Link>
              <span>·</span>
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline">PTE Coaching India</Link>
              <span>·</span>
              <Link href="/test-prep/ielts-coaching-gandhinagar" className="text-blue-600 hover:underline">IELTS Coaching Gandhinagar</Link>
              <span>·</span>
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">IELTS Online Coaching</Link>
              <span>·</span>
              <Link href="/study-in/canada" className="text-blue-600 hover:underline">Study in Canada</Link>
              <span>·</span>
              <Link href="/study-in/australia" className="text-blue-600 hover:underline">Study in Australia</Link>
              <span>·</span>
              <Link href="/study-abroad" className="text-blue-600 hover:underline">Study Abroad</Link>
              <span>·</span>
              <Link href="/contact" className="text-blue-600 hover:underline">Contact ANU Education</Link>
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
