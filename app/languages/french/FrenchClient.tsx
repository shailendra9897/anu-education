'use client';

// FILE: app/language/french/FrenchClient.tsx
// Keywords: French classes · French language course · French language classes
// ─────────────────────────────────────────────────────────────────────────────
// COMPETITOR GAP ANALYSIS vs Kochiva / Henry Harvin / IIFL / École French / FrenchTree
//
// What ranking competitors have that ANU's old page was missing:
// ✅ A1–B2 level breakdown with duration & what you'll learn per level
// ✅ TEF Canada & TCF explained with exam format tables
// ✅ Canada PR CRS points benefit (up to 50 points!) — HUGE differentiator
// ✅ DELF exam structure table
// ✅ Who can join — segment-specific targeting
// ✅ Course comparison table (3 packs from brochure)
// ✅ Batch timings + rolling batches info
// ✅ Canadian PR journey timeline (Mukesh story from brochure)
// ✅ CRS comparison table (Profile A 521 vs Profile B 453)
// ✅ Holistic benefits: freelance tutor income, MNCs, UN language, career
// ✅ 10 detailed FAQs (competitors rank on FAQ-rich pages)
// ✅ Free 5-day trial mentioned prominently (from brochure)
// ✅ Course + FAQ + Breadcrumb schema
// ✅ Internal links to study-in/canada, contact, IELTS, study-abroad
// ✅ Word count ~1,800 (massive gap vs old page)
// ─────────────────────────────────────────────────────────────────────────────

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";
import {
  websiteWhatsAppMessages,
  getWhatsAppLink,
} from "@/lib/whatsappTemplates";

const faqs = [
  {
    q: "Why should I learn French in 2026?",
    a: "French is the official language of 29 countries and spoken by over 300 million people across 5 continents. For Indian students and professionals, French has two high-value use cases in 2026: (1) Canada PR — French proficiency adds up to 50 extra CRS points in Express Entry, dramatically improving your chances for Permanent Residency. (2) Career advantage — Bilingual (English + French) candidates are preferred in Canadian government jobs, MNCs, KPO/BPO, hospitality, and import-export sectors. French is also the official language of the UN, UNESCO, NATO, and the EU.",
  },
  {
    q: "What are the French CEFR levels and which one do I need?",
    a: "French is structured into 6 levels under the CEFR (Common European Framework of Reference): A1 (Beginner), A2 (Elementary), B1 (Intermediate), B2 (Upper Intermediate), C1 (Advanced), C2 (Mastery). For Canada Express Entry immigration, NCLC 7 in all 4 skills (equivalent to B2) earns you up to 50 CRS points. For study in France, most universities require at least B1–B2. ANU Education offers coaching from A1 through B2 with TEF/TCF exam prep.",
  },
  {
    q: "What is the TEF Canada exam and how does it help with Canada PR?",
    a: "TEF (Test d'Évaluation de Français) Canada is a French proficiency test awarded by the CCIP (Paris Chamber of Commerce) and recognised by the Canadian Federal Government. For Canada Express Entry, if you achieve NCLC 7 in all 4 sections (Speaking: 310+, Listening: 249+, Reading: 207+, Writing: 310+), you earn up to 50 additional CRS points — the difference between Profile A scoring 521 and Profile B scoring just 453. ANU Education's TEF coaching covers all 4 sections with dedicated mock tests.",
  },
  {
    q: "What is TCF Canada and how is it different from TEF?",
    a: "TCF (Test de Connaissance du Français) is a French language proficiency test for international students for immigration and university admission. It is accepted for Quebec-Canada, France, and Francophone countries. TCF has 2 compulsory sections (Listening: 39 questions, 35 min; Reading: 39 questions, 60 min) and 2 optional sections (Speaking: 12 min; Writing: 60 min). TEF is more commonly required for Canada immigration; TCF is widely used for Quebec and French university admissions. Our counsellors help you choose the right exam based on your goal.",
  },
  {
    q: "How many CRS points does French add to my Canada Express Entry profile?",
    a: "French proficiency can add up to 50 CRS points: Up to 25 points if you score NCLC 7+ in all 4 French skills and CLB 4 or lower in English. Up to 50 points if you score NCLC 7+ in French and CLB 5+ in English. This is a massive advantage — in our CRS comparison, Profile A (with French TEF NCLC 7+) scored 521 vs Profile B (without French) scoring 453 — a 68-point difference with identical English and education profiles.",
  },
  {
    q: "What French courses does ANU Education offer?",
    a: "ANU Education offers 3 online course packs: (1) Basic, A1 & A2 Pack — 16-week cycle, 120+ live hours, 1,200+ grammar questions, 10 reading + 10 listening tests. (2) TEF Pack (B1 onwards) — 16-week cycle, 120+ live hours, 300+ grammar questions, full TEF mock tests. (3) Basic to TEF Master Pack — 32-week cycle, 240+ live hours, 1,500+ grammar questions, 20 reading + 20 listening tests, 64-week login access. All packs: 90-minute batch sessions, C1-certified trainers, 5-day free trial, weekly tests, speaking practice.",
  },
  {
    q: "How long does it take to learn French from scratch to B2 level?",
    a: "From absolute beginner (no French) to B2 (TEF-ready): Basic level — 4 weeks; A1 — 6 weeks; A2 — 6 weeks; B1 — 6 weeks; B2 / TEF prep — 4–6 weeks. Total: approximately 26–32 weeks (6–8 months) with consistent daily practice. ANU Education's rolling batch system means you can join any level at any time — no waiting for a new batch.",
  },
  {
    q: "What is the DELF exam and is it different from TEF/TCF?",
    a: "DELF (Diplôme d'études en langue française) is an official diploma issued by the French Ministry of National Education. It is a lifetime-valid certification (unlike TEF/TCF scores which have limited validity). DELF A1 exam: 4 sections (Listening 20 min/25 marks, Reading 30 min/25 marks, Writing 30 min/25 marks, Speaking 5–7 min/25 marks). Total: 1h 20 min, 100 marks, pass at 50/100. DELF is ideal for students who want a permanent French certification for career or academic purposes.",
  },
  {
    q: "Can I earn income by learning French?",
    a: "Yes. Teaching French as a freelance tutor can earn ₹600–₹2,000 per lecture, adding ₹25,000–₹50,000 monthly for just 1 hour of teaching per day. Beyond tutoring, bilingual (English + French) professionals are hired by L'Oreal, Airbus, Louis Vuitton, Michelin, Bombardier, Air Canada, Renault, and hundreds of MNCs operating in francophone markets. French is also a gateway to jobs in KPO, BPO, import-export, hospitality, and tourism in Canada and France.",
  },
  {
    q: "What batch timings are available for French classes?",
    a: "ANU Education offers multiple batch slots: Slot 1 (Morning): Basic 6:00–7:30 AM, A1/A2 7:30–9:00 AM, B1 9:00–10:30 AM. Slot 2 (Evening): Basic 8:00–9:30 PM, A1/A2/B1 9:30–11:00 PM, TEF 9:30–11:00 PM. Weekend batches: Basic/A1 Friday–Saturday 8:00–9:30 PM; TEF Orientation every Saturday 7:30–9:00 AM. Rolling batches — join anytime, any day. Missed lectures covered by recordings.",
  },
  {
    q: "Is there a free trial before I enrol?",
    a: "Yes. ANU Education offers a 5-day free trial for all French course packs. You get full access to live classes, course materials, and trainer interaction during the trial period — no payment required. Book your free French demo class through our website or WhatsApp to get started.",
  },
];

export default function FrenchClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);
  const [activeLevel, setActiveLevel] = useState(0);

  const levels = [
    { level: "Basic", cefr: "Pre-A1", dur: "4 weeks", hours: "30+", desc: "Alphabet, phonetics, greetings, accents, basic sentences. Perfect if you have zero French background.", skills: ["French alphabet & pronunciation", "Phonetics & accent basics", "Greetings and introductions", "Numbers, colors, days", "Simple sentences"] },
    { level: "A1", cefr: "Beginner", dur: "6 weeks", hours: "45+", desc: "Introduce yourself, talk about hobbies, family, daily routine. Basic present-tense conversations.", skills: ["Self-introduction", "Talking about family & friends", "Present tense grammar", "Everyday vocabulary", "Simple listening comprehension"] },
    { level: "A2", cefr: "Elementary", dur: "6 weeks", hours: "45+", desc: "Past and future tense, shopping, travel, work topics. Ready for DELF A2.", skills: ["Past & future tenses", "Shopping and travel phrases", "Work and profession vocabulary", "DELF A2 exam prep", "Reading comprehension"] },
    { level: "B1", cefr: "Intermediate", dur: "6 weeks", hours: "45+", desc: "Complex grammar, opinions, arguments, cultural topics. Ready for DELF B1 and TEF preparation begins.", skills: ["Complex grammar structures", "Expressing opinions & arguments", "DELF B1 preparation", "Formal & informal writing", "TEF orientation"] },
    { level: "B2", cefr: "Upper Intermediate", dur: "6 weeks", hours: "45+", desc: "TEF/TCF exam ready. Fluent discussion, NCLC 7 target. Required for Canada PR Express Entry advantage.", skills: ["TEF Canada full preparation", "NCLC 7 target strategies", "Advanced writing tasks", "Speaking exam simulation", "Canada PR CRS points pathway"] },
  ];

  return (
    <>
      {/* ── Course Schema ── */}
      <Script id="course-schema-french" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        name: "French Language Course Online India – A1 to B2, TEF & TCF 2026",
        description: "Live online French classes in India from Basic to B2 level. TEF Canada & TCF exam preparation, Canada PR CRS points advantage, C1-certified trainers, 5-day free trial, rolling batches. Offered by ANU Education, Skill India certified institute.",
        provider: { "@type": "EducationalOrganization", name: "ANU Education", sameAs: "https://www.anuedu.in", telephone: "+917016497087", address: { "@type": "PostalAddress", addressLocality: "Modasa", addressRegion: "Gujarat", addressCountry: "IN" } },
        educationalLevel: "Beginner to Upper Intermediate (A1–B2)",
        inLanguage: "fr",
        coursePrerequisites: "No prior French knowledge required for A1 level",
        offers: { "@type": "Offer", priceCurrency: "INR", availability: "https://schema.org/OnlineOnly", validFrom: "2026-01-01", description: "5-day free trial available. Contact for course fees." },
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: "PT1H30M", location: { "@type": "VirtualLocation", url: "https://www.anuedu.in/language/french" } },
      })}} />

      {/* ── FAQ Schema ── */}
      <Script id="faq-schema-french" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      })}} />

      {/* ── Breadcrumb Schema ── */}
      <Script id="breadcrumb-schema-french" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
          { "@type": "ListItem", position: 2, name: "Languages", item: "https://www.anuedu.in/language" },
          { "@type": "ListItem", position: 3, name: "French Language Course", item: "https://www.anuedu.in/language/french" },
        ],
      })}} />

      <style jsx>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes pulse-g { 0%,100% { box-shadow:0 0 0 0 rgba(34,197,94,.45); } 50% { box-shadow:0 0 0 12px rgba(34,197,94,0); } }
        .anim { animation: fadeInUp .7s ease-out forwards; opacity:0; }
        .float { animation: float 3.5s ease-in-out infinite; }
        .pulse { animation: pulse-g 2.2s infinite; }
        .d1{animation-delay:.05s} .d2{animation-delay:.15s} .d3{animation-delay:.25s} .d4{animation-delay:.35s}
        .card { transition: transform .25s ease, box-shadow .25s ease; }
        .card:hover { transform:translateY(-4px); box-shadow:0 16px 28px -8px rgba(0,0,0,.12); }
        .ua { position:relative; display:inline-block; }
        .ua::after { content:''; position:absolute; bottom:-8px; left:50%; transform:translateX(-50%); width:52px; height:3px; background:linear-gradient(90deg,#1d4ed8,#16a34a); border-radius:2px; }
        .fr-flag { background: linear-gradient(to right, #002395 33%, #fff 33%, #fff 66%, #ED2939 66%); }
      `}</style>

      <main className="min-h-screen bg-white">

        {/* ── HERO ── */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 text-white relative overflow-hidden">
          {/* subtle French flag stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 fr-flag opacity-80" />
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="text-xs text-blue-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link><span className="mx-1">/</span>
              <Link href="/language" className="hover:text-white">Languages</Link><span className="mx-1">/</span>
              <span className="text-white">French Language Course</span>
            </nav>
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float">
                🇫🇷 Bonjour! · A1 to B2 · TEF & TCF · Free 5-Day Trial · Rolling Batches
              </div>
              <h1 className="anim d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                Best French Language Course
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                  Online Classes India 2026
                </span>
              </h1>
              <p className="anim d2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                Learn French online with <strong className="text-white">C1-certified trainers</strong> for Canada PR, study abroad in France, TEF/TCF exam preparation, or a global career. Levels A1, A2, B1, B2 — live 90-minute classes, rolling batches, <strong className="text-white">join any day</strong>.
              </p>
              <div className="anim d3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a href="https://www.anuedu.in/free-demo" target="_blank" rel="noopener noreferrer"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse">
                  🎓 Start Free 5-Day Trial
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  aria-label="Chat with ANU Education on WhatsApp for French course"
                  className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg">
                  💬 WhatsApp for French Guidance
                </a>
              </div>
              <div className="anim d4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>✅ 1,100+ Students Guided</span>
                <span>✅ C1 Certified Trainers</span>
                <span>✅ TEF & TCF Prep Included</span>
                <span>✅ Rolling Batches — Join Anytime</span>
                <span>✅ Skill India Certified Institute</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

          {/* ── CANADA PR HOOK — unique selling point ── */}
          <section className="bg-gradient-to-r from-red-50 via-white to-blue-50 border border-red-100 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <span className="inline-block bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                  🇨🇦 Canada PR Advantage
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  French Adds Up to <span className="text-red-700">50 Extra CRS Points</span> for Canada PR
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  In Canada's Express Entry system, French language proficiency is the fastest legal way to boost your CRS score. Our data shows the real impact:
                </p>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-red-700 text-white">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold">Profile</th>
                        <th className="text-center px-3 py-2">Age</th>
                        <th className="text-center px-3 py-2">IELTS</th>
                        <th className="text-center px-3 py-2">French (TEF)</th>
                        <th className="text-center px-3 py-2 font-bold">CRS Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-green-50">
                        <td className="px-3 py-2 font-semibold text-green-800">Mukesh (With French)</td>
                        <td className="px-3 py-2 text-center">21</td>
                        <td className="px-3 py-2 text-center">6.5+</td>
                        <td className="px-3 py-2 text-center text-green-700 font-bold">NCLC 7+ ✅</td>
                        <td className="px-3 py-2 text-center font-bold text-green-700 text-lg">521</td>
                      </tr>
                      <tr className="bg-orange-50">
                        <td className="px-3 py-2 font-semibold text-orange-800">Harsh (Without French)</td>
                        <td className="px-3 py-2 text-center">21</td>
                        <td className="px-3 py-2 text-center">6.5+</td>
                        <td className="px-3 py-2 text-center text-gray-400">None ❌</td>
                        <td className="px-3 py-2 text-center font-bold text-orange-700 text-lg">453</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">Same age, same education, same English score — French makes a <strong>68-point difference</strong>. Canada's 2026-29 Immigration Plan targets 11,40,000 permanent residents.</p>
              </div>
              <div className="min-w-fit flex flex-col gap-3 text-center">
                <div className="bg-red-700 text-white rounded-2xl p-6">
                  <div className="text-4xl font-black mb-1">+50</div>
                  <div className="text-sm font-semibold">Max CRS points</div>
                  <div className="text-xs text-red-200 mt-1">from French proficiency</div>
                </div>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  className="bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm">
                  Ask about Canada PR →
                </a>
              </div>
            </div>
          </section>

          {/* ── LEVEL EXPLORER ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">French Course Levels — A1 to B2</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Click a level to see what you'll learn — all levels available with rolling batches</p>
            {/* Tab selector */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {levels.map((l, i) => (
                <button key={i} onClick={() => setActiveLevel(i)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeLevel === i ? "bg-blue-700 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-blue-50"}`}>
                  {l.level} <span className="text-xs opacity-75">({l.cefr})</span>
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-blue-700 text-white text-sm font-bold px-3 py-1 rounded-full">{levels[activeLevel].level}</span>
                    <span className="text-gray-400 text-sm">CEFR: {levels[activeLevel].cefr}</span>
                    <span className="text-gray-400 text-sm">· {levels[activeLevel].dur} · {levels[activeLevel].hours} live hours</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">{levels[activeLevel].desc}</p>
                  <ul className="space-y-2">
                    {levels[activeLevel].skills.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-blue-600 font-bold">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="min-w-fit flex flex-col gap-3">
                  <a href="https://www.anuedu.in/free-demo" target="_blank" rel="noopener noreferrer"
                    className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors text-center">
                    Start Free at {levels[activeLevel].level} →
                  </a>
                  <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                    className="border border-blue-300 text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-center">
                    💬 Ask a Trainer
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ── COURSE PACKS ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Online French Course Packs</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">All packs: C1 certified trainers · 90-min live classes · 5-day free trial · Recordings for missed lectures</p>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { name: "Basic, A1 & A2", tag: "Beginner", color: "border-blue-200", badge: "bg-blue-700", cycle: "16 Weeks", hours: "120+ Hours", grammar: "1,200+", reading: "10", listening: "10", access: "32 Weeks", highlight: false },
                { name: "TEF Pack", tag: "B1 Onwards", color: "border-green-300", badge: "bg-green-700", cycle: "16 Weeks", hours: "120+ Hours", grammar: "300+", reading: "10", listening: "10", access: "32 Weeks", highlight: false },
                { name: "Basic to TEF Master", tag: "Complete Pack", color: "border-yellow-300", badge: "bg-yellow-600", cycle: "32 Weeks", hours: "240+ Hours", grammar: "1,500+", reading: "20", listening: "20", access: "64 Weeks", highlight: true },
              ].map((pack, i) => (
                <div key={i} className={`card bg-white rounded-2xl border-2 p-6 ${pack.color} ${pack.highlight ? "ring-2 ring-yellow-400 shadow-lg" : "shadow-sm"} relative`}>
                  {pack.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-4 py-1 rounded-full">⭐ Best Value</div>}
                  <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3 ${pack.badge}`}>{pack.tag}</span>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">{pack.name}</h3>
                  <ul className="space-y-2 text-sm text-gray-700 mb-5">
                    <li>📅 <strong>Cycle:</strong> {pack.cycle}</li>
                    <li>⏱ <strong>Live Hours:</strong> {pack.hours}</li>
                    <li>📝 <strong>Grammar Questions:</strong> {pack.grammar}</li>
                    <li>📖 <strong>Reading Tests:</strong> {pack.reading}</li>
                    <li>🎧 <strong>Listening Tests:</strong> {pack.listening}</li>
                    <li>🔑 <strong>Login Access:</strong> {pack.access}</li>
                    <li>✅ Vocabulary Quizzes</li>
                    <li>✅ Speaking Practice</li>
                    <li>✅ Weekly Tests</li>
                    <li>✅ 5-Day Free Trial</li>
                  </ul>
                  <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${pack.highlight ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-blue-700 text-white hover:bg-blue-800"}`}>
                    Get Fee Details →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* ── TEF & TCF EXAM FORMAT ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">TEF Canada & TCF Exam Format</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Both exams accepted for French proficiency under Canada's Express Entry and Quebec immigration</p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* TEF */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-blue-700 text-white px-5 py-3 font-bold">TEF Canada — Test d'Évaluation de Français</div>
                <div className="p-5 text-sm text-gray-700 mb-3">Awarded by CCIP (Paris Chamber of Commerce) · Recognised by Canadian Federal Government for immigration · Required for NCLC scoring in Express Entry</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50"><tr>
                      <th className="text-left px-4 py-2 text-gray-500">Section</th>
                      <th className="text-center px-4 py-2 text-gray-500">Questions</th>
                      <th className="text-center px-4 py-2 text-gray-500">Duration</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr><td className="px-4 py-2 font-medium">Oral Comprehension</td><td className="px-4 py-2 text-center">60</td><td className="px-4 py-2 text-center">40 min</td></tr>
                      <tr className="bg-gray-50"><td className="px-4 py-2 font-medium">Written Comprehension</td><td className="px-4 py-2 text-center">50</td><td className="px-4 py-2 text-center">60 min</td></tr>
                      <tr><td className="px-4 py-2 font-medium">Oral Expression</td><td className="px-4 py-2 text-center">2 topics</td><td className="px-4 py-2 text-center">15 min</td></tr>
                      <tr className="bg-gray-50"><td className="px-4 py-2 font-medium">Written Expression</td><td className="px-4 py-2 text-center">2 topics</td><td className="px-4 py-2 text-center">60 min</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-blue-50 text-xs text-blue-800">
                  <strong>For NCLC 7 (Canada PR):</strong> Speaking 310+ · Listening 249+ · Reading 207+ · Writing 310+
                </div>
              </div>
              {/* TCF */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-green-700 text-white px-5 py-3 font-bold">TCF Canada — Test de Connaissance du Français</div>
                <div className="p-5 text-sm text-gray-700 mb-3">For immigration & university admissions · Accepted for Quebec-Canada, France, and Francophone countries · 78 compulsory questions (~1.5 hours)</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50"><tr>
                      <th className="text-left px-4 py-2 text-gray-500">Section</th>
                      <th className="text-center px-4 py-2 text-gray-500">Questions</th>
                      <th className="text-center px-4 py-2 text-gray-500">Duration</th>
                      <th className="text-center px-4 py-2 text-gray-500">Type</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr><td className="px-4 py-2 font-medium">Listening</td><td className="px-4 py-2 text-center">39</td><td className="px-4 py-2 text-center">35 min</td><td className="px-4 py-2 text-center text-blue-700">Compulsory</td></tr>
                      <tr className="bg-gray-50"><td className="px-4 py-2 font-medium">Reading</td><td className="px-4 py-2 text-center">39</td><td className="px-4 py-2 text-center">60 min</td><td className="px-4 py-2 text-center text-blue-700">Compulsory</td></tr>
                      <tr><td className="px-4 py-2 font-medium">Speaking</td><td className="px-4 py-2 text-center">3-part interview</td><td className="px-4 py-2 text-center">12 min</td><td className="px-4 py-2 text-center text-gray-400">Optional</td></tr>
                      <tr className="bg-gray-50"><td className="px-4 py-2 font-medium">Writing</td><td className="px-4 py-2 text-center">3 tasks</td><td className="px-4 py-2 text-center">60 min</td><td className="px-4 py-2 text-center text-gray-400">Optional</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-green-50 text-xs text-green-800">
                  <strong>Accepted for:</strong> Quebec immigration (QSWP), France university admissions, Francophone country visas
                </div>
              </div>
            </div>
          </section>

          {/* ── WHY LEARN FRENCH ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Why Learn French in 2026?</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Official language in 29 countries · 300 million speakers worldwide · Ranked 4th most spoken globally</p>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-lg">🌍 Global & Career Benefits</h3>
                <div className="space-y-3">
                  {[
                    { icon: "💼", title: "MNC career advantage", desc: "Bilingual (English + French) professionals hired by L'Oreal, Airbus, Louis Vuitton, Michelin, Bombardier, Air Canada, Renault, and 600+ French companies in India." },
                    { icon: "🏛️", title: "Language of international relations", desc: "French is the official language of the UN, UNESCO, NATO, the EU, IMF, and ICJ — essential for diplomacy, research, and international careers." },
                    { icon: "💰", title: "Freelance tutor income", desc: "Teach French part-time and earn ₹600–₹2,000 per lecture — ₹25,000–₹50,000 extra per month for just 1 hour of teaching daily." },
                    { icon: "🏨", title: "Hospitality & tourism jobs", desc: "French opens jobs in KPO, BPO, hospitality, and tourism industries in France, Canada, Belgium, Luxembourg, and Francophone countries." },
                  ].map((item, i) => (
                    <div key={i} className="card flex gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <span className="text-2xl flex-shrink-0">{item.icon}</span>
                      <div><div className="font-semibold text-gray-800 text-sm mb-0.5">{item.title}</div><div className="text-gray-600 text-xs leading-relaxed">{item.desc}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-lg">🇨🇦 Canada Immigration Benefits</h3>
                <div className="space-y-3">
                  {[
                    { icon: "📈", title: "Up to 50 CRS points", desc: "French proficiency adds up to 50 extra CRS points in Express Entry — the single biggest legal boost available to most Indian applicants." },
                    { icon: "🏙️", title: "Francophone provinces preference", desc: "Ontario, Manitoba, and New Brunswick prioritise French-speaking immigrants through Provincial Nominee Programs (PNPs) — faster pathways." },
                    { icon: "🎓", title: "Scholarships & incentives", desc: "Some Canadian provinces offer scholarships or immigration incentives to students demonstrating French proficiency." },
                    { icon: "💼", title: "Quebec job & internship advantage", desc: "French is essential for part-time jobs, internships, and integration in Quebec — Canada's Immigration Plan targets 45,000 Quebec residents in 2026." },
                  ].map((item, i) => (
                    <div key={i} className="card flex gap-3 bg-white rounded-xl p-4 border border-red-100 shadow-sm">
                      <span className="text-2xl flex-shrink-0">{item.icon}</span>
                      <div><div className="font-semibold text-gray-800 text-sm mb-0.5">{item.title}</div><div className="text-gray-600 text-xs leading-relaxed">{item.desc}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── WHO CAN JOIN ── */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Who Can Join French Classes?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { who: "Students from any board", desc: "CBSE, ICSE, State Board, Cambridge IB, or university/college students at any level." },
                { who: "Canada PR aspirants", desc: "Anyone planning Express Entry immigration to Canada who wants up to 50 extra CRS points via French TEF/TCF." },
                { who: "Study abroad applicants", desc: "Students applying to universities in France, Canada, Belgium, Luxembourg, or other Francophone countries." },
                { who: "Working professionals", desc: "MNC employees, KPO/BPO staff, import-export professionals, or anyone seeking a French-based career in India." },
                { who: "Hospitality & tourism students", desc: "Those targeting French-speaking markets for work in hotels, airlines, and tourism in France, Canada, and Europe." },
                { who: "Already in Canada", desc: "International students studying or working in Canada who need French for PR or Quebec-specific opportunities." },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="font-semibold text-blue-700 mb-1 text-sm">✅ {item.who}</div>
                  <div className="text-gray-600 text-xs leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── BATCH TIMINGS ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Batch Timings — Join Anytime</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Rolling batches — no waiting. Missed a class? Recordings available.</p>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-blue-700 text-white px-5 py-3 font-bold text-sm">🌅 Slot 1 — Morning (Mon–Fri)</div>
                <div className="divide-y divide-gray-100 text-sm">
                  {[["Basic","6:00 AM – 7:30 AM"],["A1 / A2","7:30 AM – 9:00 AM"],["B1","9:00 AM – 10:30 AM"],["B2","6:00 AM – 7:30 AM"]].map(([lvl, time]) => (
                    <div key={lvl} className="flex justify-between px-5 py-3 text-gray-700">
                      <span className="font-medium">{lvl}</span><span className="text-gray-500">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-green-700 text-white px-5 py-3 font-bold text-sm">🌙 Slot 2 — Evening (Mon–Fri)</div>
                <div className="divide-y divide-gray-100 text-sm">
                  {[["Basic","8:00 PM – 9:30 PM"],["A1 / A2","9:30 PM – 11:00 PM"],["B1","8:00 PM – 9:30 PM"],["TEF","9:30 PM – 11:00 PM"]].map(([lvl, time]) => (
                    <div key={lvl} className="flex justify-between px-5 py-3 text-gray-700">
                      <span className="font-medium">{lvl}</span><span className="text-gray-500">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-gray-700">
              <strong>Weekend & Extra Batches:</strong> Basic/A1 every Friday–Saturday 8:00–9:30 PM · TEF Orientation every Saturday 7:30 AM · Demo classes: Sun/Tue/Thu 11:30 PM and Tue/Thu/Sat 9:00 AM
            </div>
          </section>

          {/* ── FREE DEMO ── */}
          <section className="bg-gradient-to-r from-blue-50 via-white to-green-50 border border-blue-100 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">🎓 Start with a Free 5-Day Trial</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Join any live class, experience our trainer, complete your first module, and get a placement diagnostic — all free for 5 days. No payment required to start.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              {["Live class experience","C1 trainer interaction","Course material access","Level placement guidance"].map(f => (
                <div key={f} className="bg-white/80 px-4 py-3 rounded-xl text-xs font-medium text-gray-700 border border-blue-200">✔ {f}</div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://www.anuedu.in/free-demo" target="_blank" rel="noopener noreferrer"
                className="inline-block bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors pulse">
                👉 Book Free French Demo Class
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="inline-block bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors">
                💬 WhatsApp: +91 70164 97087
              </a>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">Frequently Asked Questions</h2>
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

          {/* ── FINAL CTA ── */}
          <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-green-700 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float">🇫🇷</div>
            <h2 className="text-3xl font-bold mb-3">Start Learning French Today — Bonjour Begins Here!</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Rolling batches · C1 trainers · TEF & TCF prep · Canada PR advantage · Free 5-day trial · Join any day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="https://www.anuedu.in/free-demo" target="_blank" rel="noopener noreferrer"
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105">
                🎓 Book Free 5-Day Trial
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
            <p className="text-xs text-white/60">Rolling batches — join anytime, any day. Missed classes covered by recordings.</p>
          </section>

          {/* ── INTERNAL LINKS ── */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/language/german" className="text-blue-600 hover:underline">German Language Course</Link>
              <span>·</span>
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">IELTS Online Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline">PTE Coaching</Link>
              <span>·</span>
              <Link href="/study-in/canada" className="text-blue-600 hover:underline">Study in Canada</Link>
              <span>·</span>
              <Link href="/study-in/france" className="text-blue-600 hover:underline">Study in France</Link>
              <span>·</span>
              <Link href="/study-abroad" className="text-blue-600 hover:underline">Study Abroad Consultancy</Link>
              <span>·</span>
              <Link href="/contact" className="text-blue-600 hover:underline">Contact ANU Education</Link>
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
