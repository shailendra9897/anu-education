'use client';

// FILE: app/test-prep/gmat/GMATClient.tsx
// Keyword cluster: GMAT coaching 2026 / GMAT Focus Edition / GMAT preparation India
//
// ─────────────────────────────────────────────────────────────────
// AUDIT — your live page vs Jamboree (jamboreeindia.com/gmat)
//
// YOUR CURRENT PAGE:
//   ❌ ~30 words total, 3 bullet points — critically thin
//   ❌ No schema at all
//   ❌ Still calls it "Integrated Reasoning Mastery" — IR was REMOVED
//      from the GMAT in Feb 2024. This is now factually wrong and a
//      credibility risk for an exam-prep page in 2026.
//   ❌ No mention of "GMAT Focus Edition" or that it's now just
//      called "GMAT" (GMAC dropped the "Focus Edition" name July 2024)
//   ❌ No score scale, no section breakdown, no fee, no FAQ
//   ❌ No exam format table competitors have
//
// JAMBOREE: page is JS-rendered shell on fetch — title tag confirms
// target keyword "GMAT Preparation Coaching 2026" but static content
// wasn't visible, meaning their content may carry its own indexing risk.
//
// WHAT THIS PAGE ADDS (2026-verified facts):
//   ✅ Correct 3-section format: Quant (21Q) · Verbal (23Q) · Data
//      Insights (20Q) — 45 min each, 2h15m total
//   ✅ Correct score scale: 205–805 total, 60–90 per section
//      (NOT the old 200–800 scale — a common outdated-content trap)
//   ✅ Confirms AWA and Integrated Reasoning were REMOVED — corrects
//      the wrong claim on your live page
//   ✅ Percentile context: 705+ ≈ 98th percentile, 655+ = top 10%
//   ✅ Section-adaptive format, Question Review & Edit Tool, flexible
//      section order — genuine 2026 differentiators vs old GMAT
//   ✅ Fee ~$275, free score reports (5) within 48 hrs
//   ✅ Course + FAQ + Breadcrumb schema (zero before)
//   ✅ 12 LLM-citation-ready FAQs
//   ✅ Word count ~2,300 (from ~30)
// ─────────────────────────────────────────────────────────────────

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

const FAQS = [
  {
    q: "Is the GMAT Focus Edition the same as the GMAT?",
    a: "Yes — as of July 2024, GMAC (the test maker) dropped the name 'Focus Edition' and simply calls it 'the GMAT,' since the older classic format was fully retired on 31 January 2024. If you register for the GMAT in 2026, you are taking what was previously called the Focus Edition. There is no other version available. Any study materials referring to Integrated Reasoning (IR) or the Analytical Writing Assessment (AWA) are outdated — both were removed.",
  },
  {
    q: "What is the GMAT exam format in 2026?",
    a: "The current GMAT has 3 equally-weighted sections, each 45 minutes: Quantitative Reasoning (21 questions — arithmetic, algebra, word problems, number properties, statistics; geometry was removed), Verbal Reasoning (23 questions — Reading Comprehension and Critical Reasoning; Sentence Correction was removed), and Data Insights (20 questions — Data Sufficiency, Multi-Source Reasoning, Table Analysis, Graphics Interpretation, Two-Part Analysis, with an on-screen calculator). Total exam time is 2 hours 15 minutes for 64 questions. There is no Analytical Writing Assessment (AWA) or separate Integrated Reasoning section — Data Insights replaced and absorbed those skills.",
  },
  {
    q: "What is the GMAT score scale in 2026?",
    a: "The GMAT total score ranges from 205 to 805, in 10-point increments — this replaced the older 200–800 scale used before February 2024. Each of the three sections (Quant, Verbal, Data Insights) is individually scored from 60 to 90. All three sections contribute equally to your total score. Important: a 705 on the current GMAT is not equivalent to a 705 on the old scale — the two scales are not directly comparable, and admissions committees evaluate current scores on their own terms.",
  },
  {
    q: "What is a good GMAT score for top business schools?",
    a: "A score of 705+ places you in approximately the 98th percentile of all test-takers — considered excellent for top-tier MBA programs. A score of 715+ corresponds to roughly the 99th percentile. Scoring 655 or above already puts you in the top 10% of candidates globally. Target scores vary by school: top-10 global MBA programs typically expect 700+, while many strong regional and mid-tier programs accept 600–650+.",
  },
  {
    q: "What is the GMAT exam fee in 2026?",
    a: "The GMAT exam fee is approximately $275 USD (subject to change — verify the current fee on mba.com before registering). This includes your official score report. Within 48 hours of receiving your score, you can send it free to up to 5 programs of your choice. Additional score reports beyond the first 5, or requests for reports older than 5 years, incur extra fees and may require special GMAC approval.",
  },
  {
    q: "Is the GMAT computer-adaptive?",
    a: "Yes. The GMAT is a Computer Adaptive Test (CAT) — question difficulty adjusts in real time based on your performance within each section. The current format also introduces Section-Adaptive scoring (each of the 3 sections adapts independently), a Question Review & Edit Tool (allowing limited review and answer changes within a section — a feature the old GMAT did not have), and Flexible Section Order (you choose which of the 3 sections to attempt first, second, and third on test day).",
  },
  {
    q: "How is the GMAT different from CAT (for Indian B-schools)?",
    a: "The GMAT is more structured and predictable, with a clearly defined syllabus and consistent question patterns each year — useful for students who prefer a stable target to prepare against. CAT (used for IIMs and Indian B-schools) has tougher, less predictable quantitative sections and no official published syllabus, with difficulty varying year to year. Students planning both Indian and international MBA applications often start with GMAT preparation since its structure transfers well, then adapt separately for CAT's specific quant intensity.",
  },
  {
    q: "How long should I prepare for the GMAT?",
    a: "Most students need 2 to 4 months of consistent preparation to reach a competitive score, depending on their starting math and verbal proficiency. Since Geometry, Sentence Correction, and AWA were removed from the syllabus, students transitioning from older study materials should specifically re-focus on Data Insights, which is entirely new and often underprepared for. A free diagnostic test helps identify your actual starting point before committing to a timeline.",
  },
  {
    q: "Does ANU Education's GMAT coaching cover Data Insights?",
    a: "Yes. Since Data Insights is the newest and most unfamiliar section for most students (it replaced the old Integrated Reasoning section and absorbed some Data Sufficiency content), our coaching gives it dedicated focus — covering Multi-Source Reasoning, Table Analysis, Graphics Interpretation, Two-Part Analysis, and Data Sufficiency with the on-screen calculator tool students will actually use on test day.",
  },
  {
    q: "Can I retake the GMAT if I don't get my target score?",
    a: "Yes. You can retake the GMAT, though GMAC enforces a waiting period between attempts and a maximum number of attempts within a rolling 12-month period and lifetime cap (verify current limits on mba.com, as GMAC updates these periodically). Many students improve their score by 30–50+ points on a second attempt after targeted section-specific practice, particularly in Data Insights where familiarity with question formats matters significantly.",
  },
  {
    q: "What GMAT score do I need for an MBA in Canada, UK, or Australia?",
    a: "Typical competitive GMAT ranges: Canada — 550–650+ for most programs, 650+ for top schools (Rotman, Ivey). UK — 600–650+ for most programs, 680+ for London Business School and Oxford Saïd. Australia — 550–600+ for most programs, higher for AGSM and Melbourne Business School. USA — varies widely, from 550 for many state programs to 720+ for top-10 schools. ANU Education's counsellors help match your target score to realistic university shortlists based on your profile.",
  },
  {
    q: "Does ANU Education provide MBA university counselling along with GMAT coaching?",
    a: "Yes. ANU Education is a Skill India certified study abroad consultancy — GMAT coaching is paired with free MBA university shortlisting, SOP writing support, and visa guidance for Canada, UK, USA, Australia, and other destinations, so your GMAT preparation is directly connected to your actual application strategy rather than studied in isolation.",
  },
];

const SECTIONS = [
  {
    name: "Quantitative Reasoning",
    short: "Quant",
    questions: 21,
    time: "45 min",
    topics: ["Arithmetic", "Algebra", "Word Problems", "Number Properties", "Statistics", "Rates, Ratios & Percentages"],
    note: "Geometry was removed from this section in the current format.",
    colour: "border-blue-300 bg-blue-50",
    badge: "bg-blue-700",
  },
  {
    name: "Verbal Reasoning",
    short: "Verbal",
    questions: 23,
    time: "45 min",
    topics: ["Reading Comprehension", "Critical Reasoning"],
    note: "Sentence Correction was removed from this section.",
    colour: "border-green-300 bg-green-50",
    badge: "bg-green-700",
  },
  {
    name: "Data Insights",
    short: "Data Insights",
    questions: 20,
    time: "45 min",
    topics: ["Data Sufficiency", "Multi-Source Reasoning", "Table Analysis", "Graphics Interpretation", "Two-Part Analysis"],
    note: "New section — includes an on-screen calculator. Replaced Integrated Reasoning.",
    colour: "border-purple-300 bg-purple-50",
    badge: "bg-purple-700",
  },
];

export default function GMATClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  return (
    <>
      {/* ══ COURSE SCHEMA ══ */}
      <Script id="course-schema-gmat" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          name: "GMAT Coaching 2026 – Focus Edition Preparation | ANU Education",
          description: "Live online GMAT coaching for MBA aspirants covering Quantitative Reasoning, Verbal Reasoning, and Data Insights. Adaptive mock tests, section-wise strategy sessions, and free demo class. Skill India certified.",
          provider: { "@type": "EducationalOrganization", name: "ANU Education", url: "https://www.anuedu.in", telephone: "+917016497087", address: { "@type": "PostalAddress", addressLocality: "Modasa", addressRegion: "Gujarat", addressCountry: "IN" } },
          educationalLevel: "Intermediate to Advanced",
          inLanguage: "en",
          coursePrerequisites: "Basic quantitative and verbal aptitude. Suitable for MBA aspirants at any starting level.",
          offers: { "@type": "Offer", priceCurrency: "INR", availability: "https://schema.org/OnlineOnly", validFrom: "2026-01-01", description: "Free demo class available. Contact for course fee." },
          hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", location: { "@type": "VirtualLocation", url: "https://www.anuedu.in/test-prep/gmat" } },
          about: { "@type": "Thing", name: "Graduate Management Admission Test", sameAs: "https://en.wikipedia.org/wiki/Graduate_Management_Admission_Test" },
        })}}
      />

      {/* ══ FAQ SCHEMA ══ */}
      <Script id="faq-schema-gmat" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        })}}
      />

      {/* ══ BREADCRUMB SCHEMA ══ */}
      <Script id="breadcrumb-schema-gmat" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
            { "@type": "ListItem", position: 2, name: "Test Prep", item: "https://www.anuedu.in/test-prep" },
            { "@type": "ListItem", position: 3, name: "GMAT Coaching", item: "https://www.anuedu.in/test-prep/gmat" },
          ],
        })}}
      />

      <style jsx>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-7px);} }
        @keyframes pulse-g { 0%,100%{box-shadow:0 0 0 0 rgba(219,39,119,.4);}50%{box-shadow:0 0 0 12px rgba(219,39,119,0);} }
        .anim{animation:fadeInUp .65s ease-out forwards;opacity:0;}
        .float{animation:float 3.5s ease-in-out infinite;}
        .pulse{animation:pulse-g 2.2s infinite;}
        .d1{animation-delay:.05s}.d2{animation-delay:.15s}.d3{animation-delay:.25s}.d4{animation-delay:.35s}
        .card{transition:transform .25s,box-shadow .25s;}
        .card:hover{transform:translateY(-4px);box-shadow:0 16px 28px -8px rgba(0,0,0,.12);}
        .ua{position:relative;display:inline-block;}
        .ua::after{content:'';position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:52px;height:3px;background:linear-gradient(90deg,#be185d,#7c3aed);border-radius:2px;}
      `}</style>

      <main className="min-h-screen bg-white">

        {/* ══ HERO ══ */}
        <section className="bg-gradient-to-br from-rose-900 via-pink-800 to-purple-900 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="text-xs text-pink-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link><span className="mx-1">/</span>
              <Link href="/test-prep" className="hover:text-white">Test Prep</Link><span className="mx-1">/</span>
              <span className="text-white">GMAT Coaching</span>
            </nav>
            <div className="text-center">
              <div className="inline-block bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float">
                💼 Updated for 2026 · GMAT Format · Free Demo Class
              </div>
              <h1 className="anim d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                GMAT Coaching for MBA Abroad
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Score 705+ in 2026
                </span>
              </h1>
              <p className="anim d2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                Live coaching for the current GMAT — <strong className="text-white">Quant, Verbal &amp; Data Insights</strong>. Section-adaptive strategy, timed mock tests, and free MBA university counselling included.
              </p>
              <div className="anim d3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                  className="group bg-white text-pink-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse">
                  🎓 Book Free Demo Class
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a href="https://wa.me/919428186817?text=Hi%2C%20I%20want%20GMAT%20coaching%20details%20from%20ANU%20Education" target="_blank" rel="noopener noreferrer"
                  className="bg-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-400 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg">
                  💬 WhatsApp for GMAT Guidance
                </a>
              </div>
              <div className="anim d4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>✅ 1,100+ Students Guided</span>
                <span>✅ 98% Success Rate</span>
                <span>✅ Free MBA University Shortlisting</span>
                <span>✅ Skill India Certified</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

          {/* ══ 2026 NAME CHANGE NOTICE ══ */}
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex gap-4 items-start">
              <span className="text-3xl flex-shrink-0">📢</span>
              <div>
                <h2 className="font-bold text-gray-900 text-sm mb-1">Important: "GMAT Focus Edition" is now just "the GMAT"</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Since July 2024, GMAC dropped the "Focus Edition" name — the old classic GMAT format was fully retired on 31 January 2024. If you're studying now, you're preparing for what was previously branded the Focus Edition. <strong>There is no other version.</strong> Watch out for outdated prep materials that still mention Integrated Reasoning (IR) or the Analytical Writing Assessment (AWA) — both were removed from the exam.
                </p>
              </div>
            </div>
          </section>

          {/* ══ STATS ══ */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "2h 15m", label: "Total exam duration" },
              { stat: "205–805", label: "Score range (10-pt increments)" },
              { stat: "3", label: "Sections — Quant, Verbal, Data Insights" },
              { stat: "705+", label: "≈ 98th percentile score" },
            ].map((s, i) => (
              <div key={i} className="bg-pink-50 border border-pink-100 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-pink-700 mb-1">{s.stat}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </section>

          {/* ══ EXAM FORMAT ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">GMAT Exam Format 2026 — 3 Sections</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              64 questions total · 45 minutes per section · Section-adaptive · No AWA, no separate IR
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {SECTIONS.map((sec, i) => (
                <div key={i} className={`rounded-2xl border-2 ${sec.colour} p-6`}>
                  <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3 ${sec.badge}`}>{sec.short}</span>
                  <h3 className="font-bold text-gray-800 mb-1">{sec.name}</h3>
                  <div className="text-xs text-gray-400 mb-4">⏱ {sec.time} · {sec.questions} questions</div>
                  <ul className="space-y-1.5 mb-4">
                    {sec.topics.map((t, j) => <li key={j} className="text-xs text-gray-600 flex gap-1.5"><span className="text-green-600 flex-shrink-0">✓</span>{t}</li>)}
                  </ul>
                  <p className="text-xs text-gray-500 italic border-t border-gray-200 pt-3">⚠️ {sec.note}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ SCORE SCALE ══ */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">GMAT Score Scale 2026</h2>
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 text-center">
                <div className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-2">Total Score</div>
                <div className="text-3xl font-black text-gray-900 mb-1">205–805</div>
                <p className="text-xs text-gray-500">10-point increments · combines all 3 sections equally</p>
              </div>
              <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 text-center">
                <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Per Section</div>
                <div className="text-3xl font-black text-gray-900 mb-1">60–90</div>
                <p className="text-xs text-gray-500">Quant, Verbal, and Data Insights each scored individually</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-5">
              <p className="text-sm text-gray-700"><strong>⚠️ Important:</strong> This is a new scale (replaced the old 200–800 scale in Feb 2024). A 705 today is <strong>not</strong> equivalent to a 705 on the old GMAT — the scales aren't directly comparable, so ignore old benchmark scores you may have seen referenced elsewhere.</p>
            </div>
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-sm">
                <thead className="bg-pink-700 text-white"><tr>
                  <th className="text-left px-4 py-2">Score</th>
                  <th className="text-center px-4 py-2">Percentile</th>
                  <th className="text-left px-4 py-2">What it means</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["715+", "~99th", "Elite — top-5 global MBA competitive range"],
                    ["705+", "~98th", "Excellent — strong for top-10 global MBA programs"],
                    ["655+", "Top 10%", "Very competitive for most reputed international programs"],
                    ["600–650", "Top 25–30%", "Solid for mid-tier and many regional MBA programs"],
                  ].map(([score, pct, meaning], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 font-bold text-pink-700">{score}</td>
                      <td className="px-4 py-2 text-center text-gray-600">{pct}</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ══ WHAT'S NEW / WHAT CHANGED ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">What Changed From the Old GMAT</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">If you've seen old GMAT prep material, here's exactly what's different now</p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-pink-200">
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold">Element</th>
                    <th className="text-center py-3 px-4 font-bold text-red-600 bg-red-50">Old GMAT (retired)</th>
                    <th className="text-center py-3 px-4 font-bold text-green-700 bg-green-50">Current GMAT (2026)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Sections", "4 (Quant, Verbal, IR, AWA)", "3 (Quant, Verbal, Data Insights)"],
                    ["Duration", "~3 hours 7 minutes", "2 hours 15 minutes"],
                    ["Score scale", "200–800", "205–805"],
                    ["AWA Essay", "Required", "❌ Removed"],
                    ["Integrated Reasoning", "Separate section", "❌ Removed — merged into Data Insights"],
                    ["Geometry", "In Quant", "❌ Removed"],
                    ["Sentence Correction", "In Verbal", "❌ Removed"],
                    ["Section order", "Fixed", "✅ Student's choice"],
                    ["Answer review/edit", "Not allowed", "✅ Limited review tool available"],
                  ].map(([el, old, current], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-700">{el}</td>
                      <td className="px-4 py-3 text-center text-red-600 text-xs bg-red-50/40">{old}</td>
                      <td className="px-4 py-3 text-center text-green-700 text-xs font-medium bg-green-50/40">{current}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ══ WHY ANU FOR GMAT ══ */}
          <section className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose ANU Education for GMAT Coaching?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "🎯", title: "Current-format coaching only", desc: "No outdated AWA or IR content — every session covers the exact 3-section format you'll face on test day." },
                { icon: "📊", title: "Dedicated Data Insights focus", desc: "The newest, most underprepared section for most students — we give it structured, hands-on practice with the calculator tool." },
                { icon: "🧪", title: "Section-adaptive mock tests", desc: "Practice with the same section-adaptive scoring and flexible section-order options as the real exam." },
                { icon: "👨‍🏫", title: "Live expert-led classes", desc: "Real-time doubt solving, not just pre-recorded content — ask questions as you learn." },
                { icon: "🎓", title: "Free MBA counselling included", desc: "Skill India certified counsellors help shortlist universities in Canada, UK, USA, Australia based on your target GMAT score." },
                { icon: "🆓", title: "Free demo class", desc: "Experience our teaching style and take a diagnostic test before enrolling." },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-xl p-5 border border-pink-100 shadow-sm">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-gray-800 text-sm mb-1">{item.title}</div>
                  <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ GMAT vs CAT ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">GMAT vs CAT — Which Should You Prepare For?</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Planning both Indian and international MBA applications? Here's how they compare</p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-pink-200">
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold">Factor</th>
                    <th className="text-center py-3 px-4 font-bold text-pink-700 bg-pink-50">GMAT</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">CAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Used for", "Global MBA programs (Canada, UK, USA, Australia, Europe)", "IIMs and Indian B-schools"],
                    ["Syllabus", "Clearly defined, published by GMAC", "No official syllabus — varies yearly"],
                    ["Difficulty pattern", "Predictable, structured", "Unpredictable, can shift year to year"],
                    ["Retake flexibility", "Multiple attempts allowed (with waiting periods)", "Once per year only"],
                    ["Best for", "Students targeting study abroad MBA", "Students targeting IIMs / Indian B-schools"],
                  ].map(([factor, gmat, cat], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-700">{factor}</td>
                      <td className="px-4 py-3 text-center text-pink-700 bg-pink-50/30 text-xs">{gmat}</td>
                      <td className="px-4 py-3 text-center text-gray-600 text-xs">{cat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ══ FREE DEMO CTA ══ */}
          <section className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">🔥 Start Free GMAT Demo Class</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto text-sm">
              Experience our teaching style, take a diagnostic mock test, and get a personalised prep timeline — free, no commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-pink-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-pink-800 transition-colors pulse">
                👉 Book Free Demo Class
              </a>
              <a href="https://wa.me/919428186817?text=Hi%2C%20I%20want%20GMAT%20coaching%20details" target="_blank" rel="noopener noreferrer"
                className="bg-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors">
                💬 WhatsApp Now
              </a>
            </div>
          </section>

          {/* ══ FAQ ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">Frequently Asked Questions — GMAT 2026</h2>
            <div className="max-w-3xl mx-auto space-y-3 mt-4">
              {FAQS.map((faq, idx) => (
                <details key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
                  open={openFaq === idx}
                  onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; setOpenFaq(el.open ? idx : null); }}>
                  <summary className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer list-none">
                    <span className="font-semibold text-gray-800 pr-4 text-sm md:text-base">{faq.q}</span>
                    <span className="text-pink-600 text-xl font-light flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>
                </details>
              ))}
            </div>
          </section>

          {/* ══ FINAL CTA ══ */}
          <section className="bg-gradient-to-br from-rose-900 via-pink-800 to-purple-900 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float">💼</div>
            <h2 className="text-3xl font-bold mb-3">Start Your GMAT Journey Today</h2>
            <p className="text-pink-100 mb-8 max-w-xl mx-auto">
              Current-format coaching · Section-adaptive mock tests · Free MBA counselling included.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-white text-pink-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105">
                🎓 Book Free Demo Class
              </a>
              <a href="tel:+917016497087" className="border-2 border-white/70 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                📞 +91 70164 97087
              </a>
              <a href="https://wa.me/919428186817?text=Hi%2C%20I%20want%20GMAT%20coaching%20details" target="_blank" rel="noopener noreferrer"
                className="bg-purple-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-purple-400 transition-colors">
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-white/50">Skill India Certified · 1,100+ Students · 98% Success Rate · info@anuedu.in</p>
          </section>

          {/* ══ INTERNAL LINKS ══ */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/test-prep/gre" className="text-blue-600 hover:underline">GRE Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">IELTS Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline">PTE Coaching</Link>
              <span>·</span>
              <Link href="/services/sop-writing" className="text-blue-600 hover:underline">SOP Writing</Link>
              <span>·</span>
              <Link href="/services/scholarship" className="text-blue-600 hover:underline">Scholarships</Link>
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
