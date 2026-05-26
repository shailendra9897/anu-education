'use client';

// FILE: app/test-prep/ielts-online/IELTSOnlineClient.tsx
// Primary keyword: IELTS Academic online coaching India
// Secondary: IELTS online coaching 2026, IELTS coaching Gujarat, IELTS band 7
//
// ─────────────────────────────────────────────────────────────────
// ANALYSIS OF CURRENT PAGE (anuedu.in/test-prep/ielts-online):
//   ❌ No schema at all (no Course, FAQ, Breadcrumb)
//   ❌ WhatsApp number wrong (9428186817 instead of 7016497087)
//   ❌ "10,000+ students" — inconsistent with homepage 1,100+
//   ❌ ~300 words total — far too thin to rank
//   ❌ No Academic vs General Training explanation
//   ❌ No IELTS exam format details (4 sections, timings, band scale)
//   ❌ No course pack comparison table (brochure has 2 packs)
//   ❌ No batch timings shown (brochure has full yearly planner)
//   ❌ No IELTS exam fee (₹18,000) — competitor EEC ranks for this
//   ❌ No "Weekend Bonanza" / Saturday-Sunday sessions highlighted
//   ❌ Only 5 short FAQs — competitors have 10-14 detailed FAQs
//   ❌ No internal links to Ahmedabad, Gandhinagar location pages
//   ❌ Social links still "#" (from earlier audit)
//   ❌ Free French 4-week course bonus (Champion pack) not mentioned
//
// COMPETITOR GAPS vs E2Language & StudiesOverseas:
//   ✅ E2Language ranks on: practice tests free, mock test count, IELTS Speaking AI
//   ✅ StudiesOverseas ranks on: exam format tables, band score breakdown
//   ✅ EEC ranks on: flat fee ₹7,500 transparency, free study abroad counselling
//   ✅ Henry Harvin ranks on: IELTS Academic vs General, course duration
//   ✅ PW ranks on: flexible schedule, recorded + live combo
//
// WHAT WE ADD:
//   ✅ Course schema with educationalLevel, coursePrerequisites, inLanguage
//   ✅ FAQ schema — 12 LLM-citation-ready answers
//   ✅ Breadcrumb schema
//   ✅ IELTS Academic vs General table (competitor gap)
//   ✅ IELTS exam format — 4 sections with exact timings, band scale
//   ✅ 2 course pack comparison table (from brochure — Self Prep + Champion)
//   ✅ Full batch schedule from brochure (Morning/Afternoon/Evening)
//   ✅ Weekend Bonanza: Saturday analysis + Sunday doubt sessions
//   ✅ 5-day free trial prominently featured
//   ✅ FREE French 4-week course bonus on Champion pack
//   ✅ IELTS exam fee ₹18,000 mentioned
//   ✅ Band score requirements by country
//   ✅ Performance tracker + Daily video library from brochure
//   ✅ Corrected WhatsApp to +917016497087
//   ✅ Consistent stats: 1,100+ students
//   ✅ Word count ~2,200 (from ~300)
// ─────────────────────────────────────────────────────────────────

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";
import {
  websiteWhatsAppMessages,
  getWhatsAppLink,
} from "@/lib/whatsappTemplates";

const faqs = [
  {
    q: "What is IELTS Academic and who should take it?",
    a: "IELTS Academic is the version of IELTS required for students applying to undergraduate or postgraduate university programmes abroad (UK, Canada, Australia, USA, Germany, etc.), and for professional registration in fields like nursing and medicine. IELTS General Training is for those migrating for work, PR (Canada Express Entry, Australia immigration), or below-degree study. Both versions test the same 4 skills (Listening, Reading, Writing, Speaking) but the Reading and Writing tasks differ in difficulty and content type.",
  },
  {
    q: "What is the IELTS Academic exam format in 2026?",
    a: "IELTS Academic consists of 4 sections: Listening (30 min, 40 questions — 4 recordings of increasing difficulty), Reading (60 min, 40 questions — 3 academic passages), Writing (60 min — Task 1: describe a graph/chart/diagram in 150+ words; Task 2: academic essay in 250+ words), Speaking (11–14 min — 3 parts: Introduction, Cue Card, Discussion). Total duration: approximately 2 hours 45 minutes. Scores reported on a 9-band scale (0.5 increments). Results available in 3–5 days (computer-based) or 13 days (paper-based).",
  },
  {
    q: "What IELTS band score do I need for study abroad?",
    a: "Band score requirements vary by destination and course: UK universities — typically 6.0–7.0 overall. Canada universities — 6.0–6.5. Australia student visa — 5.5–6.5. Germany (English-medium) — 6.0–6.5. USA universities — 6.5–7.0. Most Master's programmes require no individual section below 6.0. ANU Education's counsellors help you identify the exact band requirement for your target university and design a preparation plan to match it.",
  },
  {
    q: "What is the IELTS exam fee in India in 2026?",
    a: "The IELTS Academic exam fee in India is approximately ₹18,000 for both paper-based and computer-delivered formats. The exam is conducted by IDP India and British Council. Computer-delivered IELTS gives results in 3–5 days and has more test date options than paper-based. The coaching fee at ANU Education is separate from and in addition to the exam registration fee. Contact us for current coaching fee details.",
  },
  {
    q: "What courses does ANU Education offer for IELTS Academic?",
    a: "ANU Education offers two IELTS Academic online courses: (1) Self Preparation Course — 60 practice tests, 15 full-length mock tests, 300+ grammar/vocabulary/spelling videos, 20 hours of video lectures, 50+ exercises, 6-month login access, bonus Saturday test analysis and Sunday doubt-solving sessions, 5-day free trial. (2) Champion Course — everything in Self Prep PLUS live classes (Morning, Afternoon, Evening batches), separate Beginner and Advanced batches, 8-week live content cycle, 40 hours live learning (Beginners) or 60 hours (Advanced), FREE 4-week French Language live course, Saturday grammar sessions, 5-day free trial.",
  },
  {
    q: "What is the 'Weekend Bonanza' in ANU Education's IELTS coaching?",
    a: "Weekend Bonanza is a special Saturday–Sunday feature available with both ANU Education IELTS courses: Saturday Practice Test Analysis (7:30–9:30 AM or 2:00–4:00 PM) — expert review of your latest practice test with section-wise strategy. Saturday Mock Test Analysis (7:30–9:30 AM or 2:00–4:00 PM) — deep analysis of your full-length mock test performance. Sunday Doubt Solving Session (9:00–10:00 AM) — dedicated 1-hour live session to clear any doubts from the week's study. This is one of ANU Education's strongest features vs self-paced competitors who offer no live review.",
  },
  {
    q: "What is the difference between the Self Prep Course and Champion Course?",
    a: "Self Prep Course: Best for self-disciplined learners. Includes 60 practice tests, 15 mock tests, 300+ grammar videos, expert mentor results review, bonus live Saturday analysis and Sunday doubt sessions, 6-month access. No daily live classes. Champion Course: Best for students who want daily live expert interaction. Everything in Self Prep PLUS: daily live classes in Morning/Afternoon/Evening slots, separate Beginner (40 hrs) and Advanced (60 hrs) batches, 8-week structured content cycle, Saturday grammar sessions, FREE French 4-week live course. Choose Self Prep if you're disciplined and time-flexible. Choose Champion if you want structured live daily coaching.",
  },
  {
    q: "Is there a free trial available for ANU Education's IELTS course?",
    a: "Yes. Both the Self Preparation Course and the Champion Course come with a 5-day free trial. You get full access to live classes (Champion) or self-study materials (Self Prep), practice tests, and video lessons during the trial — no payment required. Book your free trial through our website or WhatsApp.",
  },
  {
    q: "What batch timings are available for IELTS Academic online coaching?",
    a: "Champion Course batch timings: Demo Batches (Mon–Sat): Morning 7:30–9:30 AM · Afternoon 2:00–4:00 PM · Evening 8:30–10:30 PM. Beginner's Batch (Mon–Fri): Morning 7:30–9:30 AM · Afternoon 2:00–4:00 PM · Evening 8:30–10:30 PM. Advanced Batch (Mon–Fri): Morning 7:30–10:30 AM · Afternoon 2:00–5:00 PM · Evening 8:00–11:00 PM. Weekend Bonus Sessions: Saturday test analysis 7:30–9:30 AM and 2:00–4:00 PM · Saturday grammar 11:00 AM–12:00 PM · Sunday doubt solving 9:00–10:00 AM.",
  },
  {
    q: "How long does IELTS Academic preparation take?",
    a: "Preparation time depends on your starting level and target band: Band 5.0 → 6.5 target: 4–6 weeks of focused preparation. Band 5.5 → 7.0 target: 6–8 weeks. Band 6.0 → 7.5+ target: 8–12 weeks. ANU Education's Beginner batch runs a 4-week content cycle; Advanced batch runs an 8-week cycle. Both start with a free English Assessment Test to place you in the right batch. The Champion Course's structured 8-week cycle is designed to take a student from their current band to their target band in one cycle.",
  },
  {
    q: "Can I prepare for IELTS Academic online from anywhere in India?",
    a: "Yes. ANU Education's IELTS Academic online coaching is available to students across all of India. We have students from Gujarat (Ahmedabad, Surat, Vadodara, Rajkot, Modasa, Gandhinagar, Mehsana, Bhavnagar, Jamnagar, Anand, Vapi, Bharuch), and from cities across Maharashtra, Karnataka, Delhi, Punjab, Rajasthan, and beyond. All live classes, mock tests, and doubt sessions are conducted online via live video platform.",
  },
  {
    q: "What is included in the Daily Video Library?",
    a: "The Daily Video Library in ANU Education's IELTS Academic courses includes 300+ videos on: Grammar fundamentals, Advanced vocabulary building, Spelling and word formation, IELTS Writing Task 1 graph and chart strategies, IELTS Writing Task 2 essay structures, IELTS Speaking cue card techniques, IELTS Reading question-type strategies, IELTS Listening strategies by recording type. New videos are added regularly. Students can access the library at any time within their 6-month login validity.",
  },
  {
    q: "Does the Champion Course include French language classes?",
    a: "Yes — the ANU Education IELTS Academic Champion Course includes a FREE 4-week live French Language course. This is unique: no other IELTS coaching platform in India bundles a free French course with IELTS preparation. This is especially valuable for students planning to study in France or Canada — where French proficiency adds up to 50 CRS points for Express Entry. French classes run in a dedicated batch alongside your IELTS coaching.",
  },
];

export default function IELTSOnlineClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePack, setActivePack] = useState<0 | 1>(0);
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  const packs = [
    {
      id: 1,
      name: "Self Preparation Course",
      tag: "Self-Paced + Bonus Live",
      badge: "bg-blue-700",
      border: "border-blue-200",
      highlight: false,
      features: [
        { f: "English Assessment Test", v: "✅" },
        { f: "Grammar, Vocab & Spelling Videos", v: "300+" },
        { f: "Grammar & Vocabulary Quizzes", v: "✅" },
        { f: "Foundation Building Lessons (L/R/W/S)", v: "50+ Exercises · 20 Hrs Video" },
        { f: "Practice Tests", v: "60" },
        { f: "Full-Length Mock Tests (Timed)", v: "15" },
        { f: "Results by Expert Mentors", v: "✅" },
        { f: "Live Practice & Mock Test Analysis*", v: "4 Tests" },
        { f: "Live Doubt Solving (Sunday)*", v: "✅" },
        { f: "Login Access Validity", v: "6 Months" },
        { f: "Free Trial", v: "5 Days" },
        { f: "Live Daily Classes", v: "❌" },
        { f: "Free French 4-Week Course", v: "❌" },
      ],
    },
    {
      id: 2,
      name: "Champion Course",
      tag: "Live Classes + Everything",
      badge: "bg-green-700",
      border: "border-green-300",
      highlight: true,
      features: [
        { f: "English Assessment Test", v: "✅" },
        { f: "Grammar, Vocab & Spelling Videos", v: "300+" },
        { f: "Grammar & Vocabulary Quizzes", v: "✅" },
        { f: "Foundation Building Lessons (L/R/W/S)", v: "50+ Exercises · 20 Hrs Video" },
        { f: "Practice Tests", v: "60" },
        { f: "Full-Length Mock Tests (Timed)", v: "15" },
        { f: "Results by Expert Mentors", v: "✅" },
        { f: "Live Practice & Mock Test Analysis*", v: "4 Tests" },
        { f: "Live Doubt Solving (Sunday)*", v: "✅" },
        { f: "Login Access Validity", v: "6 Months" },
        { f: "Free Trial", v: "5 Days" },
        { f: "Live Daily Classes", v: "Morning · Afternoon · Evening" },
        { f: "Free French 4-Week Course", v: "🎁 FREE" },
      ],
    },
  ];

  return (
    <>
      {/* ══ COURSE SCHEMA ══ */}
      <Script id="course-schema-ielts" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        name: "IELTS Academic Online Coaching 2026 – Band 7+ | ANU Education",
        description: "Live online IELTS Academic coaching with Beginner and Advanced batches, 15 full-length mock tests, 60 practice tests, 300+ grammar videos, Saturday test analysis, Sunday doubt-solving, and FREE French 4-week course. Skill India certified institute.",
        provider: { "@type": "EducationalOrganization", name: "ANU Education", sameAs: "https://www.anuedu.in", telephone: "+917016497087", address: { "@type": "PostalAddress", addressLocality: "Modasa", addressRegion: "Gujarat", addressCountry: "IN" } },
        educationalLevel: "Beginner to Advanced",
        inLanguage: "en",
        coursePrerequisites: "Basic English literacy. Beginner batch available for absolute starters.",
        offers: { "@type": "Offer", priceCurrency: "INR", availability: "https://schema.org/OnlineOnly", validFrom: "2026-01-01", description: "5-day free trial. Contact for course fee. IELTS exam registration (₹18,000) is separate." },
        hasCourseInstance: [
          { "@type": "CourseInstance", name: "Beginner's Batch", courseMode: "Online", courseWorkload: "PT2H", location: { "@type": "VirtualLocation", url: "https://www.anuedu.in/test-prep/ielts-online" } },
          { "@type": "CourseInstance", name: "Advanced Batch", courseMode: "Online", courseWorkload: "PT3H", location: { "@type": "VirtualLocation", url: "https://www.anuedu.in/test-prep/ielts-online" } },
        ],
        about: { "@type": "Thing", name: "International English Language Testing System", sameAs: "https://en.wikipedia.org/wiki/IELTS" },
      })}} />

      {/* ══ FAQ SCHEMA ══ */}
      <Script id="faq-schema-ielts" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      })}} />

      {/* ══ BREADCRUMB SCHEMA ══ */}
      <Script id="breadcrumb-schema-ielts" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
          { "@type": "ListItem", position: 2, name: "Test Prep", item: "https://www.anuedu.in/test-prep" },
          { "@type": "ListItem", position: 3, name: "IELTS Academic Online Coaching", item: "https://www.anuedu.in/test-prep/ielts-online" },
        ],
      })}} />

      <style jsx>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-7px); } }
        @keyframes pulse-g { 0%,100% { box-shadow:0 0 0 0 rgba(34,197,94,.4); } 50% { box-shadow:0 0 0 12px rgba(34,197,94,0); } }
        .anim  { animation: fadeInUp .65s ease-out forwards; opacity:0; }
        .float { animation: float 3.5s ease-in-out infinite; }
        .pulse { animation: pulse-g 2.2s infinite; }
        .d1{animation-delay:.05s} .d2{animation-delay:.15s} .d3{animation-delay:.25s} .d4{animation-delay:.35s}
        .card  { transition: transform .25s, box-shadow .25s; }
        .card:hover { transform:translateY(-4px); box-shadow:0 16px 28px -8px rgba(0,0,0,.12); }
        .ua { position:relative; display:inline-block; }
        .ua::after { content:''; position:absolute; bottom:-8px; left:50%; transform:translateX(-50%); width:52px; height:3px; background:linear-gradient(90deg,#1d4ed8,#16a34a); border-radius:2px; }
      `}</style>

      <main className="min-h-screen bg-white">

        {/* ══ HERO ══ */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-green-800 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="text-xs text-blue-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link><span className="mx-1">/</span>
              <Link href="/test-prep" className="hover:text-white">Test Prep</Link><span className="mx-1">/</span>
              <span className="text-white">IELTS Academic Online Coaching</span>
            </nav>
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float">
                🎯 Academic & General · Live Classes · 5-Day Free Trial · Skill India Certified
              </div>
              <h1 className="anim d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                IELTS Academic Online Coaching
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                  Score Band 7+ in 2026
                </span>
              </h1>
              <p className="anim d2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                Live Beginner &amp; Advanced batches · <strong className="text-white">15 full-length mock tests</strong> · 60 practice tests · Saturday test analysis · Sunday doubt-solving · <strong className="text-white">FREE French 4-week course</strong> with Champion pack · Learn Anytime, Anywhere.
              </p>
              <div className="anim d3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse">
                  🎓 Start Free 5-Day Trial
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  aria-label="WhatsApp ANU Education for IELTS guidance"
                  className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg">
                  💬 WhatsApp for IELTS Guidance
                </a>
              </div>
              <div className="anim d4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>✅ 1,100+ Students Guided</span>
                <span>✅ 98% Success Rate</span>
                <span>✅ Free Mock Test Included</span>
                <span>✅ Beginner &amp; Advanced Batches</span>
                <span>✅ Skill India Certified</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

          {/* ══ STATS ══ */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "15", label: "Full-length timed mock tests" },
              { stat: "60", label: "Section practice tests" },
              { stat: "300+", label: "Grammar & vocabulary videos" },
              { stat: "5 Days", label: "Free trial — no payment needed" },
            ].map((s, i) => (
              <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-blue-700 mb-1">{s.stat}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </section>

          {/* ══ ACADEMIC vs GENERAL ══ */}
          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">IELTS Academic vs General Training — Which Do You Need?</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-blue-200">
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold">Factor</th>
                    <th className="text-center py-3 px-4 font-bold text-blue-700 bg-blue-100 rounded-t-lg">IELTS Academic ✅</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">IELTS General Training</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Purpose", "University study (UG/PG/PhD)", "Work, PR, migration, vocational training"],
                    ["Reading content", "Complex academic texts", "Everyday notices, ads, workplace texts"],
                    ["Writing Task 1", "Describe chart/graph/diagram", "Write a formal/informal letter"],
                    ["Writing Task 2", "Academic discursive essay", "General opinion essay (same format)"],
                    ["Listening & Speaking", "Same for both versions", "Same for both versions"],
                    ["Accepted for", "UK, Canada, Australia, USA, Germany universities", "Canada PR, Australia immigration, UK work visa"],
                    ["ANU Education teaches", "✅ Beginner + Advanced batches", "✅ Available on request"],
                  ].map(([factor, academic, general], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-700">{factor}</td>
                      <td className="px-4 py-3 text-center text-blue-700 font-medium bg-blue-50/40">{academic}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{general}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ══ EXAM FORMAT ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">IELTS Academic Exam Format 2026</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Total duration ~2 hours 45 minutes · 9-band scale · Computer-based results in 3–5 days</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { section: "Listening", time: "30 min", q: "40 questions", format: "4 recordings of increasing difficulty. Multiple choice, map labelling, note completion.", tip: "Questions follow recording order. Write as you listen — no review time.", color: "border-blue-300 bg-blue-50", badge: "bg-blue-700" },
                { section: "Reading", time: "60 min", q: "40 questions", format: "3 long academic passages. True/False/NG, headings, sentence completion, MCQ.", tip: "Skim for structure first. Academic vocabulary is tested — build it daily.", color: "border-green-300 bg-green-50", badge: "bg-green-700" },
                { section: "Writing", time: "60 min", q: "2 tasks", format: "Task 1: Describe chart/graph/map (150 words). Task 2: Academic essay (250 words).", tip: "Task 2 carries 2x the marks of Task 1. Never rush or skip Task 2.", color: "border-yellow-300 bg-yellow-50", badge: "bg-yellow-600" },
                { section: "Speaking", time: "11–14 min", q: "3 parts", format: "Part 1: Personal questions. Part 2: Cue card (1-min prep). Part 3: Abstract discussion.", tip: "Fluency and coherence matter most. Keep talking — don't pause for too long.", color: "border-purple-300 bg-purple-50", badge: "bg-purple-700" },
              ].map((sec, i) => (
                <div key={i} className={`card rounded-2xl p-5 border-2 ${sec.color} shadow-sm`}>
                  <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3 ${sec.badge}`}>{sec.section}</span>
                  <div className="text-xs text-gray-400 mb-1">⏱ {sec.time} · {sec.q}</div>
                  <p className="text-sm text-gray-700 mb-3">{sec.format}</p>
                  <p className="text-xs text-gray-500 italic border-t border-gray-200 pt-2">💡 {sec.tip}</p>
                </div>
              ))}
            </div>

            {/* Band score table */}
            <div className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 text-center">IELTS Band Score Requirements by Destination</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-blue-700 text-white"><tr>
                    <th className="text-left px-3 py-2">Country / Purpose</th>
                    <th className="text-center px-3 py-2">Min Overall</th>
                    <th className="text-center px-3 py-2">Recommended</th>
                    <th className="text-left px-3 py-2">Notes</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ["🇨🇦 Canada — universities", "6.0", "6.5", "No section below 5.5 typically"],
                      ["🇬🇧 UK — universities", "6.0", "6.5–7.0", "Some courses require 7.0+ Writing"],
                      ["🇦🇺 Australia — student visa", "5.5", "6.5", "Aug 2026: Writing & Speaking 54+ (PTE equivalent)"],
                      ["🇩🇪 Germany — English-medium", "6.0", "6.5", "Varies by university; some accept 5.5"],
                      ["🇺🇸 USA — universities", "6.5", "7.0", "Varies widely by institution"],
                      ["🇦🇪 UAE — universities", "6.0", "6.5", "Many UAE unis accept 5.5–6.0"],
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

          {/* ══ COURSE HIGHLIGHTS ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">IELTS Course Highlights</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Everything from your brochure — built into every course pack</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: "🎥", title: "Live Classes & Mock Tests", desc: "Real-time interaction with experienced instructors and realistic test simulation across Morning, Afternoon, and Evening slots." },
                { icon: "📊", title: "Beginner & Advanced Batches", desc: "Tailored content for all levels. Beginner batch (40 hrs) builds foundation; Advanced batch (60 hrs) targets Band 7+." },
                { icon: "📅", title: "No Fixed Start Dates", desc: "Enrol anytime. Each session is structured to help you catch up seamlessly — no waiting for a new batch cycle." },
                { icon: "⭐", title: "Weekend Bonanza", desc: "Saturday test analysis (7:30 AM & 2:00 PM) + Sunday doubt-solving (9:00 AM). Dedicated live review every weekend." },
                { icon: "📝", title: "Simulated Mock Tests", desc: "15 full-length timed mock tests + 60 sectional practice tests. Expert feedback in text and audio format." },
                { icon: "📈", title: "Performance Tracker", desc: "Monitor your progress, track attendance, and measure skill improvement across all 4 IELTS sections." },
                { icon: "📺", title: "Daily Video Library", desc: "300+ engaging videos on Grammar, Vocabulary, and Spellings improvement. Access anytime within 6-month validity." },
                { icon: "🗣️", title: "Speaking Practice", desc: "Record your responses to cue cards and discussions. Practice and improve at your own pace with expert feedback." },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-gray-800 text-sm mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ COURSE PACKS ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Choose Your IELTS Academic Course Pack</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Both packs include 5-day free trial · 6-month login access · Expert mentor feedback</p>

            {/* Tab selector */}
            <div className="flex gap-3 justify-center mb-6">
              {packs.map((p, i) => (
                <button key={i} onClick={() => setActivePack(i as 0 | 1)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${activePack === i ? (i === 1 ? "bg-green-700 text-white shadow-lg" : "bg-blue-700 text-white shadow-lg") : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  Pack {p.id}: {p.name}
                  {p.highlight && <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">⭐ Best</span>}
                </button>
              ))}
            </div>

            <div className={`bg-white rounded-2xl border-2 ${packs[activePack].border} shadow-sm overflow-hidden ${packs[activePack].highlight ? "ring-2 ring-green-400" : ""}`}>
              {packs[activePack].highlight && (
                <div className="bg-green-700 text-white text-center py-2 text-sm font-bold">
                  ⭐ Most Popular — Champion Course includes FREE French 4-Week Live Course
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3 ${packs[activePack].badge}`}>
                      Pack {packs[activePack].id}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{packs[activePack].name}</h3>
                    <p className="text-sm text-gray-500 mb-5">{packs[activePack].tag}</p>
                    <div className="space-y-2">
                      {packs[activePack].features.map((feat, i) => (
                        <div key={i} className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                          <span className="text-gray-700">{feat.f}</span>
                          <span className={`font-semibold text-right ml-4 ${feat.v === "❌" ? "text-gray-400" : feat.v.includes("FREE") ? "text-green-600" : "text-blue-700"}`}>{feat.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="min-w-fit flex flex-col gap-3 md:pt-12">
                    <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                      className={`text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all text-center pulse ${packs[activePack].highlight ? "bg-green-700" : "bg-blue-700"}`}>
                      Start 5-Day Free Trial →
                    </a>
                    <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center text-sm">
                      💬 Ask About Fees
                    </a>
                  </div>
                </div>
              </div>

              {/* Bonus live sessions */}
              <div className="bg-blue-700 text-white p-5">
                <div className="text-center font-bold mb-4 text-sm uppercase tracking-wider">⭐ Bonus Live Sessions (Both Packs)</div>
                <div className="grid sm:grid-cols-3 gap-3 text-center text-xs">
                  {[
                    { title: "Practice Test Analysis", day: "Saturday", times: ["7:30 AM – 9:30 AM", "2:00 PM – 4:00 PM"] },
                    { title: "Mock Test Analysis", day: "Saturday", times: ["7:30 AM – 9:30 AM", "2:00 PM – 4:00 PM"] },
                    { title: "Doubt Solving Session", day: "Sunday", times: ["9:00 AM – 10:00 AM"] },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/20 rounded-xl p-3">
                      <div className="font-bold mb-1">{s.title}</div>
                      <div className="text-blue-200 mb-1">{s.day}</div>
                      {s.times.map(t => <div key={t} className="text-white">{t}</div>)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ══ BATCH SCHEDULE ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Champion Course — Live Class Schedule</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Morning · Afternoon · Evening · Demo batches Mon–Sat · Roll in anytime</p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Batch</th>
                    <th className="text-left px-4 py-3 font-semibold">Days</th>
                    <th className="text-center px-4 py-3 font-semibold">🌅 Morning</th>
                    <th className="text-center px-4 py-3 font-semibold">☀️ Afternoon</th>
                    <th className="text-center px-4 py-3 font-semibold">🌙 Evening</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { batch: "Demo Batch", days: "Mon – Sat", m: "7:30 – 9:30 AM", a: "2:00 – 4:00 PM", e: "8:30 – 10:30 PM" },
                    { batch: "Beginner's Batch", days: "Mon – Fri", m: "7:30 – 9:30 AM", a: "2:00 – 4:00 PM", e: "8:30 – 10:30 PM" },
                    { batch: "Advanced Batch", days: "Mon – Fri", m: "7:30 – 10:30 AM", a: "2:00 – 5:00 PM", e: "8:00 – 11:00 PM" },
                  ].map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-semibold text-gray-800">{r.batch}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.days}</td>
                      <td className="px-4 py-3 text-center text-xs font-medium text-blue-700">{r.m}</td>
                      <td className="px-4 py-3 text-center text-xs font-medium text-yellow-700">{r.a}</td>
                      <td className="px-4 py-3 text-center text-xs font-medium text-indigo-700">{r.e}</td>
                    </tr>
                  ))}
                  <tr className="bg-green-50">
                    <td className="px-4 py-3 font-semibold text-green-800" colSpan={2}>Weekend Bonus Sessions</td>
                    <td className="px-4 py-3 text-center text-xs text-green-700 font-medium" colSpan={3}>
                      Sat Test Analysis: 7:30–9:30 AM &amp; 2:00–4:00 PM · Sat Grammar: 11:00 AM–12:00 PM · Sun Doubt: 9:00–10:00 AM
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ══ FREE TRIAL CTA ══ */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">🔥 Start Your Free 5-Day IELTS Trial</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto text-sm">
              Join a live class (Champion) or access all self-study materials (Self Prep) — completely free for 5 days. No payment. No commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              {["Live class experience", "Free mock test access", "Expert mentor feedback", "English Assessment Test"].map(f => (
                <div key={f} className="bg-white/80 px-4 py-3 rounded-xl text-xs font-medium text-gray-700 border border-green-200">✔ {f}</div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors pulse">
                👉 Book Free 5-Day Trial
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors">
                💬 WhatsApp: +91 70164 97087
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">IELTS exam registration fee (₹18,000) is separate from coaching and paid directly to IDP India / British Council.</p>
          </section>

          {/* ══ LOCATIONS ══ */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">IELTS Academic Online Coaching Available Across India</h2>
            <p className="text-center text-gray-600 text-sm mb-5">All online — join from any city. Gujarati-friendly teaching style.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Modasa", "Gandhinagar", "Bhavnagar", "Jamnagar", "Anand", "Mehsana", "Vapi", "Bharuch", "Navsari", "Morbi", "Mumbai", "Pune", "Delhi", "Bangalore", "Hyderabad", "Chennai"].map(city => (
                <span key={city} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 shadow-sm">
                  📍 {city}
                </span>
              ))}
            </div>
            <div className="mt-6 grid sm:grid-cols-3 gap-4 text-center text-sm">
              <Link href="/test-prep/ielts-coaching-ahmedabad" className="bg-white rounded-xl p-4 border border-blue-100 text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-sm">
                IELTS Coaching Ahmedabad →
              </Link>
              <Link href="/test-prep/ielts-coaching-gandhinagar" className="bg-white rounded-xl p-4 border border-blue-100 text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-sm">
                IELTS Coaching Gandhinagar →
              </Link>
              <Link href="/test-prep/ielts-coaching-modasa" className="bg-white rounded-xl p-4 border border-blue-100 text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-sm">
                IELTS Coaching Modasa →
              </Link>
            </div>
          </section>

          {/* ══ FAQ ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">Frequently Asked Questions — IELTS Academic 2026</h2>
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
          <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-green-700 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float">🎯</div>
            <h2 className="text-3xl font-bold mb-3">Start Your IELTS Academic Journey Today</h2>
            <p className="text-blue-100 mb-3 max-w-xl mx-auto">
              Live classes · 15 mock tests · Saturday analysis · Sunday doubt sessions · 5-day free trial.
            </p>
            <p className="text-yellow-300 font-semibold mb-8 text-sm">
              🎁 Champion Course includes FREE 4-week French Language live course
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105">
                🎓 Start Free 5-Day Trial
              </a>
              <a href="tel:+917016497087" aria-label="Call ANU Education"
                className="border-2 border-white/70 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                📞 +91 70164 97087
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors">
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-white/50">Skill India Certified · Modasa, Gujarat · info@anuedu.in</p>
          </section>

          {/* ══ INTERNAL LINKS ══ */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/test-prep/ielts-coaching-ahmedabad" className="text-blue-600 hover:underline">IELTS Coaching Ahmedabad</Link>
              <span>·</span>
              <Link href="/test-prep/ielts-coaching-gandhinagar" className="text-blue-600 hover:underline">IELTS Coaching Gandhinagar</Link>
              <span>·</span>
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline">PTE Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/toefl" className="text-blue-600 hover:underline">TOEFL Coaching</Link>
              <span>·</span>
              <Link href="/language/french" className="text-blue-600 hover:underline">French Language Course</Link>
              <span>·</span>
              <Link href="/study-in/canada" className="text-blue-600 hover:underline">Study in Canada</Link>
              <span>·</span>
              <Link href="/study-in/uk" className="text-blue-600 hover:underline">Study in UK</Link>
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
