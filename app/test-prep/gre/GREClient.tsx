'use client';

// FILE: app/test-prep/gre/GREClient.tsx
// Keyword cluster: GRE coaching online India / Shorter GRE 2026 / GRE for MS abroad
//
// ─────────────────────────────────────────────────────────────────
// WHY THIS PAGE NEEDED A FULL REBUILD
//
// GRE format changed permanently on 22 Sept 2023 (the "Shorter GRE")
// and most Indian coaching pages — including older ANU drafts — still
// describe the OLD 3h45m format with 2 unscored sections and an
// "Analyze an Argument" essay. Both of those no longer exist. A
// prospective student researching GRE in 2026 who lands on an
// outdated-format page will immediately distrust the institute.
//
// 2026-ACCURATE FACTS USED ON THIS PAGE (verified via search):
//   - Total duration: 1 hour 58 minutes (NOT 3h45m)
//   - 55 questions total: 27 Verbal + 27 Quant + 1 AWA essay
//   - AWA = "Analyze an Issue" ONLY (Analyze an Argument was removed)
//   - No unscored/research sections - every section is scored
//   - No 10-minute break (test centre allows a break but timer runs;
//     GRE at Home has no break option at all)
//   - Section-level adaptive: 2nd Verbal/Quant section difficulty
//     depends on performance in the 1st
//   - Score scale: 130-170 per section (Verbal/Quant), 0-6 (AWA),
//     composite 260-340
//   - Score validity: 5 years
//   - Results: unofficial Verbal/Quant scores immediately after the
//     test; official scores (incl. AWA) in 8-10 days
//   - Retakes: up to 5 times per rolling 12 months, 21-day gap
//     between attempts (NOT "5 days" - that's a PTE/IELTS figure,
//     a common cross-contamination error on competitor pages)
//   - Fee: $220 USD (~Rs 18,300, fluctuates with exchange rate)
//   - GRE at Home available, same format as test centre
//
// COMPETITOR LANDSCAPE (Jamboree, Manhattan Prep, Career Launcher,
// PrepGuru, Magoosh) - what they rank on:
//   - Jamboree: 48-60 hrs live classes, 7 full mocks, unlimited doubt
//     sessions 7am-midnight, 4 books
//   - Manhattan Prep: adaptive mocks WITH unscored experimental
//     section (closest to real test), score guarantee
//   - Career Launcher: 58 hrs live, 1200+ questions, 7+ mocks
//   - Magoosh: AI essay scoring + AI tutor, official ETS questions
//
// WHAT THIS PAGE ADDS (vs all of the above + old ANU draft):
//   - Course + FAQ + Breadcrumb schema
//   - Full 2026 Shorter GRE format explainer (most pages still wrong)
//   - Old vs New GRE comparison table - directly resolves the
//     single most common confusion for returning searchers
//   - Section-adaptive scoring strategy explained (unique value-add)
//   - GRE retake/attempt rules corrected (21-day gap, not 5)
//   - Score validity + score-sending policy (ScoreSelect)
//   - Country/programme acceptance section (MS, MBA, PhD)
//   - 12 FAQs targeting "GRE format 2026", "GRE retake rules" etc.
// ─────────────────────────────────────────────────────────────────

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";
import {
  websiteWhatsAppMessages,
  getWhatsAppLink,
} from "@/lib/whatsappTemplates";

const FAQS = [
  {
    q: "What is the GRE exam format in 2026?",
    a: "The GRE General Test follows the 'Shorter GRE' format introduced on 22 September 2023, which continues unchanged in 2026. Total duration is 1 hour 58 minutes with 55 questions across 3 sections: Analytical Writing (1 'Analyze an Issue' essay, 30 minutes), Verbal Reasoning (27 questions across 2 sections, 41 minutes total), and Quantitative Reasoning (27 questions across 2 sections, 47 minutes total). There are no unscored or experimental sections and no scheduled break — every question counts toward your final score.",
  },
  {
    q: "How is the new Shorter GRE different from the old GRE format?",
    a: "The old GRE (before September 2023) took nearly 3 hours 45 minutes, included an extra unscored or research section that didn't count toward your score, had a 10-minute break, and required two AWA essays ('Analyze an Issue' and 'Analyze an Argument'). The new Shorter GRE takes under 2 hours, has no unscored sections (every section is scored), has no scheduled break, and requires only the 'Analyze an Issue' essay. The score scale (130–170 per section, 260–340 composite) and the underlying skills tested have not changed.",
  },
  {
    q: "How many questions are on the GRE and how is it scored?",
    a: "The GRE has 55 questions total: 27 Verbal Reasoning questions (split across 2 sections), 27 Quantitative Reasoning questions (split across 2 sections), and 1 Analytical Writing essay. Verbal and Quantitative Reasoning are each scored on a 130–170 scale in 1-point increments, giving a composite score range of 260–340. Analytical Writing is scored separately on a 0–6 scale. There is no negative marking, so you should attempt every question.",
  },
  {
    q: "What does 'section-level adaptive' mean for the GRE?",
    a: "The GRE's Verbal and Quantitative Reasoning sections are each split into two parts. Your performance on the first Verbal section determines the difficulty level of your second Verbal section — and the same applies to Quant. Score well on the first section and you unlock a harder (and higher-scoring-potential) second section. This means the first section of each subject deserves your most careful, accurate attempt, since it directly shapes your scoring ceiling for the rest of that subject.",
  },
  {
    q: "How many times can I retake the GRE, and what is the gap between attempts?",
    a: "You can take the GRE General Test up to 5 times within any rolling 12-month period, with a minimum gap of 21 days between attempts. This applies whether you test at an official centre or via GRE at Home. You can use ETS's ScoreSelect feature to choose which of your scores from the last 5 years to send to universities — so a lower attempt never has to be reported if you don't want it to be.",
  },
  {
    q: "How long is a GRE score valid?",
    a: "GRE scores are valid for 5 years from your test date. This gives you flexibility to take the test well before you finalise your university list, and even to apply across multiple admission cycles using the same score if needed.",
  },
  {
    q: "What is the GRE exam fee in India in 2026?",
    a: "The GRE General Test fee is $220 USD, which is approximately ₹18,300 at current exchange rates (this fluctuates, so always check the live rate at ets.org before paying). This fee is the same whether you test at an official Prometric centre or take the GRE at Home. ANU Education's coaching fee is separate from this exam registration fee.",
  },
  {
    q: "Can I take the GRE from home in India?",
    a: "Yes. ETS continues to offer the GRE at Home option in 2026, allowing you to take the exact same exam remotely with secure online proctoring. The format, timing, and question types are identical to the test-centre version. One key difference: GRE at Home has no break option at all, whereas a test-centre attempt technically allows a short break (though the exam timer keeps running during it).",
  },
  {
    q: "Is the GRE required for MBA programmes, or only MS and PhD?",
    a: "The GRE is most strongly associated with MS and PhD admissions, but a growing number of MBA programmes now accept GRE scores as an alternative to the GMAT — including many top business schools. If you're unsure whether your target MBA programme prefers GRE or GMAT, ANU Education's counsellors can help you check the specific requirement and, where it's genuinely flexible, advise which test is likely to suit your strengths better.",
  },
  {
    q: "Which countries and universities accept the GRE?",
    a: "The GRE is accepted by graduate programmes across the USA, Canada, UK, Australia, Germany, and most other major study-abroad destinations, for MS, PhD, and an increasing number of MBA programmes. Acceptance and minimum score expectations vary significantly by university and specific programme, so it's important to check your target programme's published GRE expectations rather than relying on a generic 'good score' benchmark.",
  },
  {
    q: "What is a good GRE score in 2026?",
    a: "There's no single 'good' GRE score — it depends entirely on your target programme's typical accepted range. As a general reference point, scores above 320 (combined Verbal + Quant) are considered strong for competitive programmes, while many programmes admit students with scores in the 300–315 range alongside a strong overall profile. Quant-heavy programmes (engineering, data science) often weight the Quantitative score more heavily; humanities and social science programmes often weight Verbal more heavily.",
  },
  {
    q: "What does ANU Education's GRE coaching include?",
    a: "ANU Education's GRE course includes: 230+ vocabulary videos (medium and hard difficulty), 500+ vocabulary quiz questions, 45+ hours of Verbal video lessons, 45+ hours of Quantitative video lessons, 10 full-length timed mock tests on an adaptive test engine that mirrors the real GRE's section-adaptive scoring, instant results with detailed performance analysis, and a live Saturday doubt-solving session. A free demo class is available before you enrol.",
  },
];

const SECTIONS = [
  {
    name: "Analytical Writing",
    time: "30 min",
    questions: "1 essay",
    detail: "'Analyze an Issue' task only. The 'Analyze an Argument' essay was permanently removed in the 2023 format change.",
    color: "border-purple-300 bg-purple-50",
    badge: "bg-purple-700",
  },
  {
    name: "Verbal Reasoning",
    time: "41 min",
    questions: "27 (2 sections)",
    detail: "Reading Comprehension, Text Completion, Sentence Equivalence. Second section's difficulty depends on your first-section performance.",
    color: "border-blue-300 bg-blue-50",
    badge: "bg-blue-700",
  },
  {
    name: "Quantitative Reasoning",
    time: "47 min",
    questions: "27 (2 sections)",
    detail: "Arithmetic, Algebra, Geometry, Data Analysis. On-screen calculator provided. Second section adapts based on your first-section score.",
    color: "border-green-300 bg-green-50",
    badge: "bg-green-700",
  },
];

export default function GREClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  return (
    <>
      {/* COURSE SCHEMA */}
      <Script id="course-schema-gre" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          name: "GRE Coaching Online India 2026 — Shorter GRE Format | ANU Education",
          description: "Live online GRE coaching for the Shorter GRE (1h58m, 55 questions). 230+ vocabulary videos, 45+ hours Verbal and Quant video lessons, 10 full-length adaptive mock tests, Saturday doubt-solving sessions. For MS, MBA and PhD applicants. Skill India certified.",
          provider: { "@type": "EducationalOrganization", name: "ANU Education", sameAs: "https://www.anuedu.in", telephone: "+917016497087" },
          educationalLevel: "Intermediate to Advanced",
          inLanguage: "en",
          coursePrerequisites: "Basic English and quantitative aptitude. Beginner-friendly Verbal and Quant lessons included.",
          offers: { "@type": "Offer", priceCurrency: "INR", availability: "https://schema.org/OnlineOnly", validFrom: "2026-01-01", description: "Free demo class. Contact for course fee. GRE exam fee ($220 USD) paid separately to ETS." },
          hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: "PT1H", location: { "@type": "VirtualLocation", url: "https://www.anuedu.in/test-prep/gre" } },
          about: { "@type": "Thing", name: "Graduate Record Examination", sameAs: "https://en.wikipedia.org/wiki/Graduate_Record_Examinations" },
        })}}
      />

      {/* FAQ SCHEMA */}
      <Script id="faq-schema-gre" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        })}}
      />

      {/* BREADCRUMB SCHEMA */}
      <Script id="breadcrumb-schema-gre" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
            { "@type": "ListItem", position: 2, name: "Test Prep", item: "https://www.anuedu.in/test-prep" },
            { "@type": "ListItem", position: 3, name: "GRE Coaching", item: "https://www.anuedu.in/test-prep/gre" },
          ],
        })}}
      />

      <style jsx>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-7px);} }
        @keyframes pulse-g { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.4);}50%{box-shadow:0 0 0 12px rgba(124,58,237,0);} }
        .anim{animation:fadeInUp .65s ease-out forwards;opacity:0;}
        .float{animation:float 3.5s ease-in-out infinite;}
        .pulse{animation:pulse-g 2.2s infinite;}
        .d1{animation-delay:.05s}.d2{animation-delay:.15s}.d3{animation-delay:.25s}.d4{animation-delay:.35s}
        .card{transition:transform .25s,box-shadow .25s;}
        .card:hover{transform:translateY(-4px);box-shadow:0 16px 28px -8px rgba(0,0,0,.12);}
        .ua{position:relative;display:inline-block;}
        .ua::after{content:'';position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:52px;height:3px;background:linear-gradient(90deg,#7c3aed,#2563eb);border-radius:2px;}
      `}</style>

      <main className="min-h-screen bg-white">

        {/* HERO */}
        <section className="bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-800 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="text-xs text-violet-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link><span className="mx-1">/</span>
              <Link href="/test-prep" className="hover:text-white">Test Prep</Link><span className="mx-1">/</span>
              <span className="text-white">GRE Coaching</span>
            </nav>
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float">
                🔬 New Shorter GRE · 1h58m · 55 Questions · Free Demo
              </div>
              <h1 className="anim d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                GRE Coaching Online India
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Score 320+ for MS, MBA & PhD
                </span>
              </h1>
              <p className="anim d2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                Coaching built for the <strong className="text-white">new Shorter GRE format</strong> (under 2 hours, no unscored sections) — live Verbal &amp; Quant classes, 230+ vocabulary videos, and <strong className="text-white">10 section-adaptive mock tests</strong> that mirror the real exam.
              </p>
              <div className="anim d3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                  className="group bg-white text-violet-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse">
                  🎓 Start Free Demo Class
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  className="bg-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-pink-600 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg">
                  💬 WhatsApp for GRE Guidance
                </a>
              </div>
              <div className="anim d4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>✅ 1,100+ Students Guided</span>
                <span>✅ 98% Success Rate</span>
                <span>✅ 10 Adaptive Mock Tests</span>
                <span>✅ Skill India Certified</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

          {/* STATS */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "1h 58m", label: "Total exam duration (2026 format)" },
              { stat: "10", label: "Full-length adaptive mock tests" },
              { stat: "230+", label: "Vocabulary videos" },
              { stat: "5 Yrs", label: "Score validity" },
            ].map((s, i) => (
              <div key={i} className="bg-violet-50 border border-violet-100 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-violet-700 mb-1">{s.stat}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </section>

          {/* FORMAT CHANGE ALERT */}
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              ⚠️ Still Prepping With the Old GRE Format? Read This First.
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Since <strong>22 September 2023</strong>, the GRE has used a permanently shorter format. If your study material mentions a <strong>3-hour 45-minute test</strong>, an <strong>unscored section</strong>, a <strong>10-minute break</strong>, or an <strong>"Analyze an Argument" essay</strong> — it's outdated. None of those exist in the current exam.
            </p>
            <div className="overflow-x-auto rounded-xl border border-amber-200">
              <table className="w-full text-sm bg-white">
                <thead className="bg-amber-600 text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Factor</th>
                    <th className="text-center px-4 py-3 font-semibold">Old GRE (pre-Sept 2023)</th>
                    <th className="text-center px-4 py-3 font-semibold bg-green-600">New Shorter GRE (2026)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {[
                    ["Total duration", "~3 hours 45 minutes", "1 hour 58 minutes"],
                    ["Total questions", "~80+", "55"],
                    ["Unscored section", "Yes — extra section, didn't count", "None — every section is scored"],
                    ["Scheduled break", "Yes, 10 minutes", "None"],
                    ["AWA essays", "2 (Issue + Argument)", "1 (Issue only)"],
                    ["Official score in", "~10–15 days", "8–10 days"],
                  ].map(([factor, old, current], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/40"}>
                      <td className="px-4 py-3 font-medium text-gray-700">{factor}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{old}</td>
                      <td className="px-4 py-3 text-center text-green-700 font-semibold bg-green-50/50">{current}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">Score scale (130–170 per section, 260–340 composite) and the underlying skills tested have NOT changed — only the length and structure.</p>
          </section>

          {/* EXAM FORMAT */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">GRE Exam Format 2026 — Section by Section</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              55 questions total · 1h 58m · Section-level adaptive · No negative marking
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {SECTIONS.map((sec, i) => (
                <div key={i} className={`rounded-2xl border-2 p-5 ${sec.color}`}>
                  <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3 ${sec.badge}`}>{sec.name}</span>
                  <div className="text-xs text-gray-400 mb-2">⏱ {sec.time} · {sec.questions}</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{sec.detail}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3 text-center">🎯 How Section-Level Adaptive Scoring Works</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-semibold text-green-700">Score well on Section 1 →</span>
                  <p className="mt-1 text-xs">Section 2 of that subject becomes harder — but you unlock a higher possible composite score.</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <span className="font-semibold text-amber-700">Struggle on Section 1 →</span>
                  <p className="mt-1 text-xs">Section 2 becomes easier, but your maximum possible score for that subject is capped lower.</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">This is why our mock tests use a genuine adaptive engine — not a static practice set — to train you for the real scoring mechanics.</p>
            </div>
          </section>

          {/* SCORE & RETAKE RULES */}
          <section className="bg-violet-50 border border-violet-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">GRE Scoring, Retakes & Validity — Quick Reference</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: "📊", title: "Score Scale", desc: "130–170 per section (Verbal/Quant) · 0–6 (AWA) · 260–340 composite" },
                { icon: "🔁", title: "Retake Limit", desc: "Up to 5 times per rolling 12 months, with a 21-day gap between attempts" },
                { icon: "📅", title: "Score Validity", desc: "5 years from your test date" },
                { icon: "📨", title: "Score Reporting", desc: "ScoreSelect lets you choose which attempt(s) to send to universities" },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-xl p-4 border border-violet-100 shadow-sm text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-gray-800 text-sm mb-1">{item.title}</div>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* WHO ACCEPTS GRE */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Who Accepts the GRE?</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">MS, PhD, and a growing number of MBA programmes — across major study-abroad destinations</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "🇺🇸", title: "USA", desc: "Standard requirement for most MS, PhD, and many MBA programmes." },
                { icon: "🇨🇦", title: "Canada", desc: "Widely accepted for graduate programmes; check per-university policy." },
                { icon: "🇬🇧", title: "UK", desc: "Accepted by many universities for MSc and research programmes." },
                { icon: "🇦🇺", title: "Australia", desc: "Accepted at several universities for graduate research and coursework degrees." },
                { icon: "🇩🇪", title: "Germany", desc: "Increasingly accepted, especially for English-taught MS programmes." },
                { icon: "💼", title: "MBA Programmes", desc: "A growing number of top business schools now accept GRE as an alternative to GMAT." },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-gray-800 text-sm mb-1">{item.title}</div>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Always verify your specific programme's current GRE policy — acceptance and score expectations vary by university.</p>
          </section>

          {/* COURSE FEATURES */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What's Included in ANU Education's GRE Course</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: "📖", title: "230+ Vocabulary Videos", desc: "Medium and hard-difficulty vocabulary, built for GRE Verbal's contextual word usage." },
                { icon: "🧩", title: "500+ Vocab Quiz Questions", desc: "Reinforce vocabulary retention with structured practice quizzes." },
                { icon: "🎥", title: "45+ Hours Verbal Lessons", desc: "Reading Comprehension, Text Completion, Sentence Equivalence — strategy and practice." },
                { icon: "🔢", title: "45+ Hours Quant Lessons", desc: "Arithmetic, Algebra, Geometry, Data Analysis — from fundamentals to advanced." },
                { icon: "🧪", title: "10 Adaptive Mock Tests", desc: "Genuine section-adaptive engine — practice the real scoring mechanics, not a static test." },
                { icon: "📈", title: "Instant Performance Analysis", desc: "Detailed section-wise breakdown after every mock test." },
                { icon: "🗣️", title: "Saturday Doubt Solving", desc: "Live weekly session to clear concept and strategy doubts with mentors." },
                { icon: "🎓", title: "Free Study Abroad Counselling", desc: "Skill India certified guidance for MS/MBA/PhD university selection alongside your GRE prep." },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-gray-800 text-sm mb-1">{item.title}</div>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FREE DEMO CTA */}
          <section className="bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">🔬 Start Your Free GRE Demo Class</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto text-sm">
              Experience a live class, try an adaptive mock test, and get a free diagnostic score — before you commit to the full course.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              {["Live demo class", "Free diagnostic test", "Adaptive mock preview", "Expert mentor Q&A"].map(f => (
                <div key={f} className="bg-white/80 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-700 border border-violet-200">✔ {f}</div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-violet-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-violet-800 transition-colors pulse">
                👉 Book Free Demo
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="bg-pink-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-pink-700 transition-colors">
                💬 WhatsApp Now
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">GRE exam fee ($220 USD, ~₹18,300) is paid separately to ETS — not part of our coaching fee.</p>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">Frequently Asked Questions — GRE 2026</h2>
            <div className="max-w-3xl mx-auto space-y-3 mt-4">
              {FAQS.map((faq, idx) => (
                <details key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
                  open={openFaq === idx}
                  onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; setOpenFaq(el.open ? idx : null); }}>
                  <summary className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer list-none">
                    <span className="font-semibold text-gray-800 pr-4 text-sm md:text-base">{faq.q}</span>
                    <span className="text-violet-600 text-xl font-light flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>
                </details>
              ))}
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="bg-gradient-to-br from-violet-800 via-purple-700 to-indigo-800 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float">🔬</div>
            <h2 className="text-3xl font-bold mb-3">Prepare for the Shorter GRE — The Right Way</h2>
            <p className="text-violet-100 mb-8 max-w-xl mx-auto">
              Live classes · 10 adaptive mock tests · 230+ vocab videos · Saturday doubt sessions · Free demo class.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-white text-violet-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105">
                🎓 Start Free Demo
              </a>
              <a href="tel:+917016497087"
                className="border-2 border-white/70 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                📞 +91 70164 97087
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="bg-pink-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-pink-600 transition-colors">
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-white/50">Skill India Certified · 1,100+ Students · 98% Success Rate · info@anuedu.in</p>
          </section>

          {/* INTERNAL LINKS */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/test-prep/gmat" className="text-blue-600 hover:underline">GMAT Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">IELTS Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline">PTE Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/toefl" className="text-blue-600 hover:underline">TOEFL Coaching</Link>
              <span>·</span>
              <Link href="/study-in/usa" className="text-blue-600 hover:underline">Study in USA</Link>
              <span>·</span>
              <Link href="/study-in/canada" className="text-blue-600 hover:underline">Study in Canada</Link>
              <span>·</span>
              <Link href="/study-in/germany" className="text-blue-600 hover:underline">Study in Germany</Link>
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