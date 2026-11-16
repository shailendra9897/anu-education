'use client';

import Link from "next/link";
import {
  websiteWhatsAppMessages,
  getWhatsAppLink,
} from "@/lib/whatsappTemplates";

/* ─────────────────────────────────────────────────────────────
   COMPETITOR GAP ANALYSIS — what ranking pages have that old file didn't:
   
   MOS Education / JJ Immigration / Orbit / VerbalHub rank because:
   ✅ IELTS Academic vs General Training explained (old file: missing)
   ✅ Band score table with country requirements (old file: missing)
   ✅ Exam format details: 4 sections, 2h 45m, 9-band scale (old file: missing)
   ✅ Locality targeting: Kudasan, Sargasan, Sector 6, Infocity (old file: missing)
   ✅ Study plan timeline — 1 month, 8-10 week prep (old file: missing)
   ✅ IELTS Academic vs General comparison (old file: missing)
   ✅ FAQ expanded — only 4 FAQs in old file vs 8-10 in competitors
   ✅ WhatsApp number: 9428186817 (approved; 7016497087 is call-only)
   ✅ "2000+ students" claim corrected to match homepage (1100+)
   ✅ BreadcrumbList schema for rich results (old file: missing)
   ✅ Stats were inconsistent — hero said 2000+ vs homepage 1100+
   ✅ Old file had no getWhatsAppLink import — raw WA link used instead
   ✅ Word count ~350 → now ~1,400 (thin content was a key ranking gap)
   ─────────────────────────────────────────────────────────────── */

import { faqs } from "@/lib/data/faq/ielts-gandhinagar";
import IELTSPricingCards from "@/components/courses/IELTSPricingCards";
import { IELTS_GST_LABEL } from "@/lib/data/ielts-pricing";
import {
  IELTS_PACKAGES,
  withIeltsPackageCta,
} from "@/lib/data/ielts-packages";

// Marketing package cards. Prices, features and badges come from the
// centralized IELTS package module; only the page-owned CTAs live here.
// Self Prep, Champion — One Batch and Champion — All Timings are each sold
// through their own fixed PayU payment link. The retired on-page checkout is
// never used.
const IELTS_SELF_PREP_PAYU_URL = "https://u.payu.in/PAYUMN/uIqbwdNTKrTp";
const IELTS_CHAMPION_ONE_BATCH_PAYU_URL =
  "https://u.payu.in/PAYUMN/BIInlBUFpA9I";
const IELTS_CHAMPION_ALL_TIMINGS_PAYU_URL =
  "https://u.payu.in/PAYUMN/wIuPM83kT5li";

const IELTS_GANDHINAGAR_PRICING_PACKAGES = IELTS_PACKAGES.map((pkg) => ({
  ...withIeltsPackageCta(
    pkg,
    pkg.packageId === "ielts-self-prep"
      ? {
          label: "Buy Now",
          href: IELTS_SELF_PREP_PAYU_URL,
          ariaLabel: `Buy ${pkg.title} — open the secure PayU payment page`,
        }
      : pkg.packageId === "ielts-champion-one-batch"
        ? {
            label: "Buy Now",
            href: IELTS_CHAMPION_ONE_BATCH_PAYU_URL,
            ariaLabel: `Buy ${pkg.title} — open the secure PayU payment page`,
          }
        : {
            label: "Buy Now",
            href: IELTS_CHAMPION_ALL_TIMINGS_PAYU_URL,
            ariaLabel: `Buy ${pkg.title} — open the secure PayU payment page`,
          },
    {
      label: "Book Free Demo",
      href: "/free-demo",
      ariaLabel: `Book a free demo for ${pkg.title}`,
    },
  ),
  gstLabel: IELTS_GST_LABEL,
}));

export default function IELTSGandhinagarClient() {
  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
          50%       { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
        }
        .animate-up { animation: fadeInUp 0.7s ease-out forwards; opacity: 0; }
        .float       { animation: float 3.5s ease-in-out infinite; }
        .pulse       { animation: pulse-green 2.2s infinite; }
        .s1 { animation-delay: 0.05s; }
        .s2 { animation-delay: 0.15s; }
        .s3 { animation-delay: 0.25s; }
        .s4 { animation-delay: 0.35s; }
        .s5 { animation-delay: 0.45s; }
        .s6 { animation-delay: 0.55s; }
        .feature-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 28px -8px rgba(0,0,0,0.12); }
        .underline-accent {
          position: relative; display: inline-block;
        }
        .underline-accent::after {
          content: '';
          position: absolute;
          bottom: -8px; left: 50%; transform: translateX(-50%);
          width: 52px; height: 3px;
          background: linear-gradient(90deg, #3b82f6, #22c55e);
          border-radius: 2px;
        }
      `}</style>

      <main className="min-h-screen bg-white">

        {/* ── HERO ── */}
        <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-700 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-xs text-blue-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-1">/</span>
              <Link href="/test-prep" className="hover:text-white">Test Prep</Link>
              <span className="mx-1">/</span>
              <span className="text-white">IELTS Coaching Gandhinagar</span>
            </nav>

            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float">
                🎓 Academic & General Training · Online · Free 5-Day Demo · 2026
              </div>

              <h1 className="animate-up s1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                IELTS Coaching in Gandhinagar
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Online Classes · Academic &amp; General Training
                </span>
              </h1>

              <p className="animate-up s2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                Students across Gandhinagar — from <strong className="text-white">Kudasan, Sargasan, Infocity, Sector 6, Sector 21, and Adalaj</strong> — prepare for IELTS Academic and General Training with ANU Education. Live online coaching, full-length mock tests, personalised feedback, and study abroad counselling — all from home.
              </p>

              <div className="animate-up s3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a
                  href="https://www.anuedu.in/free-demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  🔥 Start Free 5-Day Demo
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a
                  href={getWhatsAppLink(websiteWhatsAppMessages.ieltsGandhinagar)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with ANU Education on WhatsApp for IELTS guidance"
                  className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg"
                >
                  💬 WhatsApp for IELTS Guidance
                </a>
              </div>

              <div className="animate-up s4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>✅ 15 full-length mock tests</span>
                <span>✅ 60 sectional practice tests</span>
                <span>✅ Free Mock Test + Band Score Report</span>
                <span>✅ Study abroad counselling</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

          {/* ── IELTS COURSE PRICING ── */}
          <IELTSPricingCards
            packages={IELTS_GANDHINAGAR_PRICING_PACKAGES}
            heading="IELTS Course Packages in Gandhinagar"
            intro="Choose the package that matches your schedule and goals. All packages include 6-month access and a free demo class."
            footnote="Prices include GST · 18% GST included. Course activation and portal access are completed manually after payment verification."
          />

          {/* ── IELTS BAND SCORE TABLE ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 underline-accent">
              IELTS Band Score Requirements by Country — 2026
            </h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              Know your target band before you start — plan the right preparation timeline
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Destination</th>
                    <th className="text-center px-4 py-3 font-semibold">Minimum Band</th>
                    <th className="text-center px-4 py-3 font-semibold">Recommended</th>
                    <th className="text-left px-4 py-3 font-semibold">Test Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { dest: "🇨🇦 Canada", min: "6.0", rec: "6.5+", type: "Academic (study) / General (PR)" },
                    { dest: "🇬🇧 UK", min: "6.0", rec: "6.5–7.0", type: "Academic (universities)" },
                    { dest: "🇦🇺 Australia", min: "5.5", rec: "6.5+", type: "Academic (study) / General (migration)" },
                    { dest: "🇩🇪 Germany", min: "6.0", rec: "6.5+", type: "Academic (English-medium universities)" },
                    { dest: "🇮🇪 Ireland", min: "6.0", rec: "6.5+", type: "Academic" },
                    { dest: "🇺🇸 USA", min: "6.0", rec: "6.5–7.0", type: "Academic (varies by university)" },
                    { dest: "🇳🇿 New Zealand", min: "5.5", rec: "6.5+", type: "Academic / General" },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-800">{row.dest}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-lg font-semibold text-xs">{row.min}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-lg font-semibold text-xs">{row.rec}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Requirements vary by institution — always confirm with the university or immigration authority.
            </p>
          </section>

          {/* ── ACADEMIC vs GENERAL ── */}
          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
              IELTS Academic vs General Training — Which Do You Need?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-blue-200">
                <div className="text-3xl mb-2">🎓</div>
                <h3 className="text-lg font-bold text-blue-700 mb-3">IELTS Academic</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✅ For students applying to <strong>undergraduate or postgraduate programmes</strong> abroad</li>
                  <li>✅ Required for university admissions in UK, Canada, Australia, Germany, USA</li>
                  <li>✅ Higher reading & writing difficulty — tests academic language use</li>
                  <li>✅ Also required for some professional registration (nursing, medicine)</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6 border border-green-200">
                <div className="text-3xl mb-2">✈️</div>
                <h3 className="text-lg font-bold text-green-700 mb-3">IELTS General Training</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✅ For those <strong>migrating for work or permanent residency</strong> (Canada PR, Australia immigration)</li>
                  <li>✅ Suitable for secondary education and work experience programmes</li>
                  <li>✅ Reading focuses on everyday texts — generally considered less complex</li>
                  <li>✅ Required for UK family visa, Canada Express Entry, Australia skilled migration</li>
                </ul>
              </div>
            </div>
            <p className="text-center mt-5 text-sm text-gray-600">
              Not sure which type to take?{" "}
              <a
                href={getWhatsAppLink(websiteWhatsAppMessages.ieltsGandhinagar)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold hover:underline"
              >
                Ask our counsellors on WhatsApp →
              </a>
            </p>
          </section>

          {/* ── WHY ANU ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 underline-accent">
              Why Gandhinagar Students Choose ANU Education for IELTS
            </h2>
            <p className="text-center text-gray-500 text-sm mt-4 mb-8 max-w-2xl mx-auto">
              Live online IELTS preparation for students across Gandhinagar and Gujarat
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: "👨‍🏫", title: "IELTS-specialist trainers", desc: "Our trainers specialise in IELTS Academic and General Training — not just general English. Real exam strategies, not textbook teaching." },
                { icon: "📝", title: "Full-length mock tests weekly", desc: "Timed, exam-condition mocks for all four sections with section-wise analysis and a personalised improvement plan after each test." },
                { icon: "🗣️", title: "Daily speaking practice", desc: "Speaking is where most Gujarati students lose marks. We run dedicated daily sessions with individual cue card, part 2, and part 3 practice." },
                { icon: "🎯", title: "Personalised study plan", desc: "Every student starts with a free diagnostic test. Your study plan is built around your current band and target score — not a generic syllabus." },
                { icon: "⏰", title: "Flexible morning, evening & weekend batches", desc: "Classes designed for college students and working professionals in Gandhinagar who can't attend regular daytime sessions." },
                { icon: "🎓", title: "Free study abroad counselling", desc: "Our counsellors help you choose the right university, destination, and visa pathway — no extra charge." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`animate-up s${Math.min(idx + 1, 6)} feature-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100`}
                >
                  <div className="text-4xl mb-3" aria-hidden="true">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── IELTS EXAM FORMAT ── */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              IELTS Exam Format — What to Expect
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              The IELTS exam tests four skills across two sessions (Listening, Reading, Writing on one day; Speaking separately). Total test time: approximately <strong>2 hours 45 minutes</strong>. Scores are reported on a 1–9 band scale in 0.5 increments.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { section: "Listening", duration: "30 min", tasks: "4 recordings, 40 questions", tip: "Questions appear in order — no going back. Answer as you listen." },
                { section: "Reading", duration: "60 min", tasks: "3 passages, 40 questions (Academic) / Everyday texts (General)", tip: "Skim for structure first. Answers appear in text order for most question types." },
                { section: "Writing", duration: "60 min", tasks: "Task 1 (150 words) + Task 2 Essay (250 words)", tip: "Task 2 carries more marks. Never skip it or rush it." },
                { section: "Speaking", duration: "11–14 min", tasks: "3 parts: Introduction, Cue Card, Discussion", tip: "Fluency matters more than vocabulary. Keep talking naturally." },
              ].map((sec, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="inline-block bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {sec.section}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">⏱ {sec.duration}</div>
                  <p className="text-sm text-gray-700 font-medium mb-2">{sec.tasks}</p>
                  <p className="text-xs text-gray-500 italic">💡 {sec.tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── COURSE DETAILS ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 underline-accent">
              What's Included in Our IELTS Course
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">📚 Course Coverage</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>✅ Listening — Note completion, MCQ, matching, map labelling</li>
                  <li>✅ Reading — True/False/Not Given, headings, sentence completion, MCQ</li>
                  <li>✅ Writing — Task 1 (graphs, charts, letters) + Task 2 essays with templates</li>
                  <li>✅ Speaking — Cue card strategies, Part 3 discussion techniques</li>
                  <li>✅ Vocabulary & grammar for high band scores</li>
                  <li>✅ Time management strategies for each section</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">🎯 What You Get</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>✅ Weekly full-length mock tests with section-wise analysis</li>
                  <li>✅ Personalised feedback after every practice session</li>
                  <li>✅ One-to-one doubt clearing sessions</li>
                  <li>✅ Band score improvement roadmap</li>
                  <li>✅ Practice materials and study resources</li>
                  <li>✅ Morning / evening / weekend batch options</li>
                  <li>✅ Free study abroad counselling included</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── STUDY PLAN ── */}
          <section className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📅 How Long Does IELTS Preparation Take?
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  plan: "2–3 Weeks",
                  ideal: "Retakers at Band 5.5–6.5",
                  goal: "Quick 0.5–1.0 band boost",
                  color: "border-green-300 bg-green-50",
                  badge: "bg-green-700",
                },
                {
                  plan: "4–6 Weeks",
                  ideal: "Most students (Band 4.5–5.5)",
                  goal: "Reach Band 6.0–7.0 target",
                  color: "border-blue-300 bg-blue-50",
                  badge: "bg-blue-700",
                },
                {
                  plan: "6–8 Weeks",
                  ideal: "Beginners or Band 8+ target",
                  goal: "Full preparation from basics",
                  color: "border-indigo-300 bg-indigo-50",
                  badge: "bg-indigo-700",
                },
              ].map((p, i) => (
                <div key={i} className={`rounded-xl border p-5 ${p.color}`}>
                  <div className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3 ${p.badge}`}>
                    {p.plan}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">{p.ideal}</p>
                  <p className="text-sm text-gray-600">{p.goal}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-5">
              Not sure which plan suits you? Book a free demo — we do a diagnostic test in the first class and tell you exactly what band you're at and how long you need.{" "}
              <a href="https://www.anuedu.in/free-demo" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">
                Book free demo →
              </a>
            </p>
          </section>

          {/* ── FREE DEMO ── */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              🔥 Try Free for 5 Days — No Commitment
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Join a live class, experience mock test feedback, and get your diagnostic band score — completely free. Available for all Gandhinagar students online.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <div className="bg-white/80 px-5 py-3 rounded-xl text-sm font-medium text-gray-700 border border-green-200">✔ Live class experience</div>
              <div className="bg-white/80 px-5 py-3 rounded-xl text-sm font-medium text-gray-700 border border-green-200">✔ Free diagnostic band score</div>
              <div className="bg-white/80 px-5 py-3 rounded-xl text-sm font-medium text-gray-700 border border-green-200">✔ Expert trainer interaction</div>
            </div>
            <a
              href="https://www.anuedu.in/free-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors pulse"
            >
              👉 Book Your Free 5-Day Demo
            </a>
          </section>

          {/* ── LOCAL TOUCH ── */}
          <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              📍 Serving All Areas of Gandhinagar — Online
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Gandhinagar, Gujarat's capital city, is a growing hub for students planning to study abroad or migrate to English-speaking countries. The city and its surrounding region are home to institutions such as <strong>DA-IICT</strong> and several universities and colleges, and thousands of Gandhinagar students prepare for IELTS every year.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              ANU Education's fully online classes reach students across every part of Gandhinagar including <strong>Kudasan, Sargasan, Infocity, Sector 1, Sector 6, Sector 21, Adalaj and Pethapur</strong>, as well as nearby areas such as Chandkheda — no travel required. Morning, afternoon and evening batches, plus weekend test-analysis and doubt-solving sessions, mean you can prepare without disrupting college or work schedules.
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-800 mb-1">Batch timings and test centres</p>
              <p>
                Champion live batches run in morning, afternoon and evening slots.
                IELTS is delivered by IDP and the British Council; confirm current
                test dates and centre availability with the official booking
                provider before planning your exam date.
              </p>
            </div>
          </section>

          {/* ── STUDY ABROAD SUPPORT ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 underline-accent">
              Beyond IELTS — Complete Study Abroad Support
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-blue-700 mb-4">🇨🇦 🇬🇧 🇦🇺 🇩🇪 What we help with after IELTS</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>✅ University shortlisting matched to your IELTS score and profile</li>
                  <li>✅ SOP (Statement of Purpose) writing guidance</li>
                  <li>✅ Student visa application support</li>
                  <li>✅ Country-specific advice: Canada, UK, Australia, Germany, Ireland</li>
                  <li>✅ Education loan guidance</li>
                  <li>✅ Pre-departure orientation</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 text-center flex flex-col justify-center gap-4">
                <div className="text-4xl" aria-hidden="true">🎓</div>
                <p className="text-lg font-semibold text-gray-800">Already have an IELTS score?</p>
                <p className="text-gray-600 text-sm">Get free counselling for your university and visa application.</p>
                <Link
                  href="/contact"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Talk to a Counsellor →
                </Link>
              </div>
            </div>
          </section>

          {/* ── NEARBY CITIES ── */}
          <section className="bg-blue-50 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">📍 Also Serving Nearby Cities</h3>
            <p className="text-gray-600 mb-4 text-sm">Online coaching available across Gujarat — join from anywhere.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/test-prep/ielts-online" className="bg-white text-blue-700 border border-blue-200 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 hover:text-white transition-colors">
                Join live from anywhere in India →
              </Link>
              <Link href="/test-prep/ielts-coaching-india" className="bg-white text-blue-700 border border-blue-200 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 hover:text-white transition-colors">
                Compare course options across India →
              </Link>
              <Link href="/test-prep/ielts/ielts-coaching-ahmedabad" className="bg-white text-blue-700 border border-blue-200 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 hover:text-white transition-colors">
                Students in Ahmedabad →
              </Link>
              <Link href="/test-prep/ielts-coaching-modasa" className="bg-white text-blue-700 border border-blue-200 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 hover:text-white transition-colors">
                Students in Modasa and Aravalli district →
              </Link>
              <Link href="/test-prep/pte-coaching-gandhinagar" className="bg-white text-blue-700 border border-blue-200 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 hover:text-white transition-colors">
                PTE Coaching Gandhinagar →
              </Link>
              <Link href="/services/visa-assistance" className="bg-white text-blue-700 border border-blue-200 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 hover:text-white transition-colors">
                Visa Assistance →
              </Link>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 underline-accent">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-3 mt-4">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <summary className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer list-none">
                    <span className="font-semibold text-gray-800 pr-4 text-sm md:text-base">{faq.q}</span>
                    <span className="text-blue-600 text-xl font-light flex-shrink-0" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float" aria-hidden="true">🎯</div>
            <h2 className="text-3xl font-bold mb-3">
              Start Your IELTS Preparation in Gandhinagar Today
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Live online classes, weekly mock tests, personalised feedback, and free study abroad counselling — all from home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a
                href="https://www.anuedu.in/free-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105"
              >
                👉 Book Free 5-Day Demo
              </a>
              <a
                href="tel:+917016497087"
                aria-label="Call ANU Education"
                className="border-2 border-white/70 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors"
              >
                📞 Call: +91 70164 97087
              </a>
              <a
                href={getWhatsAppLink(websiteWhatsAppMessages.ieltsGandhinagar)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp for IELTS guidance"
                className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors"
              >
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-white/60">Prices include GST. Course activation and portal access are completed manually after payment verification.</p>
          </section>

          {/* ── FOOTER INTERNAL LINKS ── */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">Live online batches</Link>
              <span aria-hidden="true">·</span>
              <Link href="/test-prep/ielts-coaching-india" className="text-blue-600 hover:underline">Compare course options</Link>
              <span aria-hidden="true">·</span>
              <Link href="/test-prep/ielts/ielts-coaching-ahmedabad" className="text-blue-600 hover:underline">Ahmedabad students</Link>
              <span aria-hidden="true">·</span>
              <Link href="/test-prep/pte-coaching-gandhinagar" className="text-blue-600 hover:underline">PTE Coaching Gandhinagar</Link>
              <span aria-hidden="true">·</span>
              <Link href="/test-prep/pte-coaching-ahmedabad" className="text-blue-600 hover:underline">PTE Coaching Ahmedabad</Link>
              <span aria-hidden="true">·</span>
              <Link href="/services/visa-assistance" className="text-blue-600 hover:underline">Visa Assistance</Link>
              <span aria-hidden="true">·</span>
              <Link href="/study-in/canada" className="text-blue-600 hover:underline">Study in Canada</Link>
              <span aria-hidden="true">·</span>
              <Link href="/contact" className="text-blue-600 hover:underline">Contact ANU Education</Link>
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
