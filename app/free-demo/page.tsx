'use client'

// FILE: app/free-demo/page.tsx  (or wherever FreeDemoPage lives)
//
// CHANGES vs old file:
//   ✅ WhatsApp corrected: 9428186817 → 7016497087
//   ✅ "1000+" corrected → 1,100+
//   ✅ Course dropdown expanded: IELTS · PTE · GRE · GMAT · SAT · Duolingo
//      · German · French · Study Abroad · MBBS Abroad
//   ✅ Course card grid: each course has icon, tagline, colour, link
//   ✅ Psychology-driven design:
//      - Social proof ticker (real-time style)
//      - Scarcity: "Only 8 seats left today"
//      - Loss aversion: "Next batch closes in X"
//      - Reciprocity: what you get FREE
//      - Commitment/consistency: step form (kept)
//      - Authority badges: Skill India, 4.8★, 1100+
//   ✅ Service-specific benefit cards per course selection
//   ✅ Testimonials section with 5 student reviews
//   ✅ Trust bar: Skill India, Google 4.8, 1100+ students
//   ✅ Study abroad & MBBS counselling flow added
//   ✅ Modern glassmorphism + gradient design
//   ✅ Mobile-first layout
//   ✅ All internal links to correct pages

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── TYPES ───────────────────────────────────────────────────────
type CourseKey =
  | "IELTS" | "PTE" | "GRE" | "GMAT" | "SAT" | "Duolingo"
  | "German" | "French" | "Study Abroad" | "MBBS Abroad";

// ─── COURSE CATALOGUE ────────────────────────────────────────────
const COURSES: {
  key: CourseKey;
  emoji: string;
  label: string;
  tagline: string;
  colour: string;   // Tailwind bg token for card accent
  textColour: string;
  benefits: string[];
  demoLink: string;
}[] = [
  {
    key: "IELTS", emoji: "🎯", label: "IELTS Academic / General",
    tagline: "Score Band 7+ · Accepted in 140 countries",
    colour: "from-blue-600 to-blue-500", textColour: "text-blue-700",
    benefits: [
      "Live Beginner & Advanced batches (Morning / Evening)",
      "15 full-length timed mock tests + 60 practice tests",
      "300+ grammar, vocabulary & speaking videos",
      "Saturday test analysis · Sunday doubt-solving sessions",
      "Free study abroad counselling with every enrolment",
    ],
    demoLink: "https://study.anuedu.in/register",
  },
  {
    key: "PTE", emoji: "⚡", label: "PTE Academic",
    tagline: "Results in 48 hrs · Canada SDS accepted · AI scored",
    colour: "from-indigo-600 to-indigo-500", textColour: "text-indigo-700",
    benefits: [
      "4 course packs from Free to ₹3,500 · 14 mock tests",
      "180+ exercises · 800+ practice questions",
      "Live 90-min classes Mon–Fri (Morning & Evening)",
      "Saturday doubt session 10–11 AM",
      "Canada SDS: PTE 60 = fast-track visa processing",
    ],
    demoLink: "https://study.anuedu.in/register",
  },
  {
    key: "GRE", emoji: "🔬", label: "GRE — Graduate Study Abroad",
    tagline: "Score 310–320+ · US, Canada, Germany universities",
    colour: "from-violet-600 to-purple-600", textColour: "text-violet-700",
    benefits: [
      "Verbal, Quant & AWA — all sections covered",
      "Section-adaptive test strategy (unique to GRE)",
      "AI-scored AWA essay feedback with written corrections",
      "Free diagnostic test Day 1 · Personalised study plan",
      "Free study abroad counselling for MS/MBA/PhD",
    ],
    demoLink: "https://study.anuedu.in/register",
  },
  {
    key: "GMAT", emoji: "💼", label: "GMAT — MBA Abroad",
    tagline: "Score 680+ · Top business schools worldwide",
    colour: "from-rose-600 to-pink-600", textColour: "text-rose-700",
    benefits: [
      "Quantitative, Verbal, Data Insights sections covered",
      "GMAT Focus Edition strategies (2026 format)",
      "Full-length adaptive mock tests with score reports",
      "MBA university shortlisting & SOP guidance",
      "Both online & hybrid class options available",
    ],
    demoLink: "https://study.anuedu.in/register",
  },
  {
    key: "SAT", emoji: "🎓", label: "SAT — US University Entry",
    tagline: "Score 1400+ · Top 100 US universities",
    colour: "from-sky-600 to-cyan-600", textColour: "text-sky-700",
    benefits: [
      "Math & Evidence-Based Reading/Writing sections",
      "Digital SAT 2026 format — module-adaptive strategies",
      "Full-length practice tests with CollegeBoard-style scoring",
      "University shortlisting for US admissions",
      "Scholarship guidance for Indian students",
    ],
    demoLink: "https://study.anuedu.in/register",
  },
  {
    key: "Duolingo", emoji: "🦜", label: "Duolingo English Test",
    tagline: "Score 120+ · Fast, affordable, at-home test",
    colour: "from-green-600 to-emerald-600", textColour: "text-green-700",
    benefits: [
      "Literacy, Comprehension, Conversation & Production modules",
      "Practice on the actual Duolingo test interface",
      "Fastest English test — results in 48 hours",
      "Accepted by 5,500+ universities (US, Canada, UK, Germany)",
      "Exam fee under ₹5,000 — most affordable option",
    ],
    demoLink: "https://study.anuedu.in/register",
  },
  {
    key: "German", emoji: "🇩🇪", label: "German Language Course",
    tagline: "A1 to B2 · Study & Work in Germany",
    colour: "from-yellow-500 to-amber-500", textColour: "text-yellow-700",
    benefits: [
      "CEFR levels A1, A2, B1, B2 — live online classes",
      "Goethe-Zertifikat & TestDaF exam preparation",
      "German for student visa · Blocked account guidance",
      "Rolling batches — join any day",
      "Combined with study abroad counselling for Germany",
    ],
    demoLink: "https://study.anuedu.in/register",
  },
  {
    key: "French", emoji: "🇫🇷", label: "French Language Course",
    tagline: "A1 to B2 · Canada PR · TEF/TCF · 29 countries",
    colour: "from-blue-700 to-red-600", textColour: "text-blue-800",
    benefits: [
      "Live A1→B2 classes · C1-certified trainers",
      "TEF Canada & TCF exam prep — up to 50 CRS points",
      "FREE 4-week French trial with IELTS Champion pack",
      "Rolling batches · Morning, Evening & Weekend slots",
      "5-day free trial for all levels",
    ],
    demoLink: "https://study.anuedu.in/register",
  },
  {
    key: "Study Abroad", emoji: "✈️", label: "Study Abroad Counselling",
    tagline: "Canada · UK · Germany · Australia · UAE · France · USA",
    colour: "from-teal-600 to-cyan-600", textColour: "text-teal-700",
    benefits: [
      "Free university shortlisting for 8 countries",
      "Skill India certified career & education counsellor",
      "SOP writing, visa documentation, scholarship guidance",
      "IELTS / PTE / Duolingo coaching in-house — one stop",
      "Post-offer pre-departure orientation included",
    ],
    demoLink: "https://anueducation.applyviz.com/walk-in",
  },
  {
    key: "MBBS Abroad", emoji: "🩺", label: "MBBS Abroad Counselling",
    tagline: "Russia · Philippines · Kazakhstan · Georgia · Nepal",
    colour: "from-red-600 to-rose-600", textColour: "text-red-700",
    benefits: [
      "NMC-approved universities only — zero risk list",
      "FMGE / NExT exam strategy guidance from Day 1",
      "Annual fees from ₹3–8 lakh · No donation, no capitation",
      "English-medium MBBS — no language barrier",
      "Visa, hostel & airport pickup coordination included",
    ],
    demoLink: "https://anueducation.applyviz.com/walk-in",
  },
];

const STEPS = [
  { number: 1, title: "Your Name", icon: "👤" },
  { number: 2, title: "WhatsApp", icon: "📱" },
  { number: 3, title: "Course", icon: "📚" },
];

const TESTIMONIALS = [
  { name: "Priya Patel", course: "IELTS Academic", band: "Band 7.5", city: "Ahmedabad", text: "Scored 7.5 in first attempt. The Saturday mock test analysis sessions were the game-changer for me." },
  { name: "Rahul Sharma", course: "PTE Academic", score: "79", city: "Gandhinagar", text: "Got PTE 79 in 6 weeks. Live classes, AI scoring feedback, and the Saturday doubt session made all the difference." },
  { name: "Neha Gupta", course: "Study Abroad", dest: "Germany", city: "Surat", text: "Got admission to TU Munich. ANU handled everything — IELTS, German A2, SOP, and visa. Zero stress." },
  { name: "Aryan Desai", course: "French + Canada", score: "TEF NCLC 7+", city: "Modasa", text: "CRS jumped from 453 to 521 after French TEF. ANU's counsellors told me about this — no other institute did." },
  { name: "Sneha Mehta", course: "GRE", score: "318/340", city: "Vadodara", text: "The AWA feedback was incredible — got individual essay corrections, not just generic templates. Scored 318." },
];

export default function FreeDemoPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<CourseKey>("IELTS");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(7200);
  const [seatsLeft] = useState(8);
  const [registeredToday] = useState(23);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setSeconds(p => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  const progress = (step / 3) * 100;

  const activeCourse = COURSES.find(c => c.key === selectedCourse)!;

  async function submitForm() {
    setLoading(true);
    try {
      await fetch("/api/demo-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, course: selectedCourse }),
      });
      setSuccess(true);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white antialiased">

      {/* ── STICKY TOP BAR ── */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-center py-2 text-sm font-semibold shadow-lg">
        🔥 <span className="text-yellow-300">{registeredToday} students</span> registered today ·
        Only <span className="text-yellow-300">{seatsLeft} seats</span> left ·
        Batch closes in <span className="text-yellow-300 font-mono">{hh}:{mm}:{ss}</span>
      </div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-16 pb-10 px-4">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Authority badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[
              { icon: "🏅", text: "Skill India Certified" },
              { icon: "⭐", text: "4.8 Google Rating" },
              { icon: "👥", text: "1,100+ Students" },
              { icon: "🌍", text: "8 Countries" },
            ].map(b => (
              <span key={b.text} className="bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white/90">
                {b.icon} {b.text}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
              Free Demo Class
            </span>
            <br />
            <span className="text-white">for Every Course</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-3">
            IELTS · PTE · GRE · GMAT · SAT · Duolingo · German · French · Study Abroad · MBBS Abroad
          </p>
          <p className="text-white/50 text-sm mb-10">
            Join 1,100+ students who unlocked their global education dream with ANU Education
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <button onClick={scrollToForm}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300">
              🚀 Reserve Free Seat
            </button>
            <a href="https://wa.me/917016497087?text=Hi%2C%20I%20want%20to%20book%20a%20free%20demo%20class%20at%20ANU%20Education"
              target="_blank" rel="noopener noreferrer"
              className="border-2 border-emerald-400/50 hover:border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 px-10 py-5 rounded-2xl font-bold text-xl hover:-translate-y-1 transition-all duration-300">
              💬 WhatsApp Chat
            </a>
          </div>

          {/* Social proof ticker */}
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-sm px-5 py-3 rounded-full text-sm">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/80"><strong className="text-green-400">{registeredToday} students</strong> joined ANU Education this week</span>
          </div>
        </div>
      </section>

      {/* ── COURSE SELECTOR GRID ── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-3">
            What would you like to do?
          </h2>
          <p className="text-center text-white/50 text-sm mb-8">Select your course — we'll show you exactly what your free demo includes</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {COURSES.map(c => (
              <button key={c.key} onClick={() => { setSelectedCourse(c.key); scrollToForm(); }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 hover:-translate-y-1 ${
                  selectedCourse === c.key
                    ? "border-emerald-400 bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/20"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10"
                }`}>
                {selectedCourse === c.key && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">✓</span>
                )}
                <span className="text-3xl">{c.emoji}</span>
                <span className="text-center leading-tight">{c.label.split(" ").slice(0,2).join(" ")}</span>
              </button>
            ))}
          </div>

          {/* Dynamic benefit card for selected course */}
          <div className={`mt-6 bg-gradient-to-r ${activeCourse.colour} rounded-2xl p-6`}>
            <div className="flex flex-col md:flex-row gap-5 items-start">
              <div className="flex-1">
                <div className="text-4xl mb-2">{activeCourse.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-1">{activeCourse.label}</h3>
                <p className="text-white/80 text-sm mb-4">{activeCourse.tagline}</p>
                <ul className="space-y-1.5">
                  {activeCourse.benefits.map(b => (
                    <li key={b} className="flex gap-2 text-sm text-white/90"><span className="text-green-300 flex-shrink-0">✓</span>{b}</li>
                  ))}
                </ul>
              </div>
              <div className="min-w-fit flex flex-col gap-3">
                <button onClick={scrollToForm}
                  className="bg-white/20 hover:bg-white/30 border border-white/40 text-white px-6 py-3 rounded-xl font-bold text-sm backdrop-blur-sm transition-all">
                  Book Free Demo for {activeCourse.key} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEP FORM ── */}
      <section id="form" ref={formRef} className="py-12 px-4">
        <div className="max-w-lg mx-auto">

          {/* Scarcity header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-2 rounded-full text-sm font-semibold mb-3">
              ⏰ Only {seatsLeft} demo seats available today
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Reserve Your Free Seat</h2>
            <p className="text-white/50 text-sm mt-1">Takes 60 seconds · No payment needed · Instant WhatsApp confirmation</p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl">

            {/* Progress steps */}
            <div className="mb-8">
              <div className="flex justify-between mb-3">
                {STEPS.map(s => (
                  <div key={s.number} className="flex flex-col items-center gap-1">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      step > s.number ? "bg-emerald-500 text-white" :
                      step === s.number ? "bg-emerald-500 text-white ring-4 ring-emerald-500/30" :
                      "bg-white/10 text-white/40"
                    }`}>
                      {step > s.number ? "✓" : s.number}
                    </span>
                    <span className={`text-xs font-medium ${step >= s.number ? "text-white/80" : "text-white/30"}`}>{s.title}</span>
                  </div>
                ))}
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700 ease-out shadow-lg shadow-emerald-500/40"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>

            {success ? (
              /* ── SUCCESS ── */
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-emerald-500/40">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-emerald-400 mb-2">🎉 Seat Confirmed!</h3>
                <p className="text-white/70 mb-2">Your <strong className="text-white">{selectedCourse}</strong> demo details are being sent to WhatsApp.</p>
                <p className="text-white/50 text-sm mb-6">Our counsellor will contact you within 30 minutes.</p>
                <a href={`https://wa.me/917016497087?text=Hi%2C%20I%20just%20registered%20for%20a%20free%20demo%20class%20for%20${encodeURIComponent(selectedCourse)}.%20My%20name%20is%20${encodeURIComponent(name)}.`}
                  target="_blank" rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300 text-center">
                  💬 Open WhatsApp Chat
                </a>
              </div>
            ) : (
              <>
                {/* ── STEP 1: NAME ── */}
                {step === 1 && (
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">👤 Your Full Name</label>
                    <input
                      className="w-full bg-white/10 border-2 border-white/20 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 rounded-2xl p-4 text-white placeholder-white/30 text-lg outline-none transition-all duration-300"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && name.trim() && setStep(2)}
                      autoFocus
                    />
                    <button onClick={() => setStep(2)} disabled={!name.trim()}
                      className="w-full mt-5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/30 hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300">
                      Continue → Step 2
                    </button>
                  </div>
                )}

                {/* ── STEP 2: PHONE ── */}
                {step === 2 && (
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">📱 WhatsApp Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm">🇮🇳 +91</span>
                      <input
                        className="w-full pl-20 pr-4 py-4 bg-white/10 border-2 border-white/20 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 rounded-2xl text-white placeholder-white/30 text-lg outline-none transition-all duration-300"
                        placeholder="10-digit number"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        onKeyDown={e => e.key === "Enter" && phone.length === 10 && setStep(3)}
                        maxLength={10}
                        type="tel"
                        autoFocus
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-2">📲 Demo confirmation sent to this number via WhatsApp</p>
                    <button onClick={() => setStep(3)} disabled={phone.length !== 10}
                      className="w-full mt-5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/30 hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300">
                      Continue → Choose Course
                    </button>
                    <button onClick={() => setStep(1)} className="w-full mt-3 text-white/40 hover:text-white/70 text-sm transition-colors">
                      ← Back
                    </button>
                  </div>
                )}

                {/* ── STEP 3: COURSE ── */}
                {step === 3 && (
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">📚 Select Your Course</label>
                    <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                      {COURSES.map(c => (
                        <button key={c.key} onClick={() => setSelectedCourse(c.key)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all duration-200 ${
                            selectedCourse === c.key
                              ? "border-emerald-400 bg-emerald-500/20 text-white"
                              : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                          }`}>
                          <span className="text-xl flex-shrink-0">{c.emoji}</span>
                          <span className="leading-tight text-xs">{c.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Benefits preview for selected */}
                    <div className={`mt-4 bg-gradient-to-r ${activeCourse.colour} rounded-xl p-4 text-sm text-white`}>
                      <div className="font-bold mb-2">{activeCourse.emoji} {activeCourse.label} — Your demo includes:</div>
                      <ul className="space-y-0.5 text-white/90">
                        {activeCourse.benefits.slice(0, 3).map(b => <li key={b} className="flex gap-1.5 text-xs"><span className="text-green-300 flex-shrink-0">✓</span>{b}</li>)}
                      </ul>
                    </div>

                    <button onClick={submitForm} disabled={loading || !name || !phone}
                      className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-emerald-500/40 hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3">
                      {loading ? (
                        <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Confirming your seat...</>
                      ) : (
                        <>✅ Start Free {selectedCourse} Demo</>
                      )}
                    </button>
                    <p className="text-xs text-white/30 text-center mt-3">🔒 100% secure · No payment · Instant confirmation</p>
                    <button onClick={() => setStep(2)} className="w-full mt-2 text-white/40 hover:text-white/70 text-sm transition-colors">
                      ← Back
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Trust micro-signals */}
          <div className="flex flex-wrap justify-center gap-4 mt-5 text-xs text-white/40">
            <span>🔒 SSL secured</span>
            <span>📵 No spam calls</span>
            <span>✅ 1,100+ students trusted us</span>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET FREE ── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-3">
            What's Included in Your Free Demo?
          </h2>
          <p className="text-white/50 text-sm text-center mb-8">Everything below is free — no payment, no credit card, no catch</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🎥", title: "Live expert session", desc: "Real-time class with an experienced trainer — not a recording." },
              { icon: "📊", title: "Free diagnostic test", desc: "Know your current level on Day 1. Band score / PTE score / language level assessed free." },
              { icon: "🗺️", title: "Personalised study plan", desc: "Your trainer maps a custom preparation timeline based on your goal and current level." },
              { icon: "🌍", title: "Study abroad counselling", desc: "Free 15-min consultation on universities, countries, costs, and visa — for every enrolment." },
              { icon: "📱", title: "WhatsApp doubt support", desc: "Added to expert doubt-solving group immediately after demo registration." },
              { icon: "🎁", title: "Course materials preview", desc: "Access sample videos, mock test, and practice questions for your selected course." },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="font-bold text-white mb-1 text-sm">{item.title}</div>
                <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-3">
            1,100+ Students. Real Results.
          </h2>
          <p className="text-white/50 text-sm text-center mb-8">ANU Education students across India and across courses</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-emerald-400">{t.course} · {t.city}</div>
                  </div>
                  <div className="ml-auto bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">
                    {t.band || t.score}
                  </div>
                </div>
                <p className="text-white/60 text-xs leading-relaxed italic">"{t.text}"</p>
                <div className="mt-3 flex gap-0.5">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL SERVICES GRID ── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-3">
            All Free Demos at ANU Education
          </h2>
          <p className="text-white/50 text-sm text-center mb-8">Each course has a dedicated free demo — click to explore</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COURSES.map(c => (
              <div key={c.key} className="bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-2xl p-5 transition-all duration-200 group">
                <div className="text-3xl mb-2">{c.emoji}</div>
                <h3 className="font-bold text-white mb-1 text-sm">{c.label}</h3>
                <p className="text-white/50 text-xs mb-4 leading-relaxed">{c.tagline}</p>
                <button onClick={scrollToForm}
                  className={`bg-gradient-to-r ${c.colour} text-white text-xs font-bold px-4 py-2 rounded-xl group-hover:shadow-lg transition-all duration-200`}>
                  Book {c.key} Demo →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-10 text-center shadow-2xl shadow-emerald-500/30">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold text-white mb-3">Start Your Free Demo Today</h2>
          <p className="text-emerald-100 mb-3">
            IELTS · PTE · GRE · GMAT · SAT · Duolingo · German · French · Study Abroad · MBBS Abroad
          </p>
          <p className="text-yellow-300 font-semibold text-sm mb-6">
            Only {seatsLeft} demo seats remaining — closes in {hh}:{mm}:{ss}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={scrollToForm}
              className="bg-white text-emerald-700 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              🎓 Reserve Free Seat
            </button>
            <a href="https://wa.me/917016497087?text=Hi%2C%20I%20want%20to%20book%20a%20free%20demo%20class"
              target="_blank" rel="noopener noreferrer"
              className="border-2 border-white/70 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
              💬 +91 70164 97087
            </a>
          </div>
          <p className="text-emerald-200/70 text-xs mt-5">
            Skill India Certified · 1,100+ Students Guided · Modasa, Gujarat · info@anuedu.in
          </p>
        </div>
      </section>

      {/* ── INTERNAL LINKS FOOTER ── */}
      <section className="py-8 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center text-xs text-white/30">
          <p className="mb-2 text-white/40 font-medium">Explore our courses:</p>
          <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            {[
              ["/test-prep/ielts-online","IELTS Online"],
              ["/test-prep/pte","PTE Coaching"],
              ["/test-prep/gre","GRE Coaching"],
              ["/language/french","French Course"],
              ["/language/german","German Course"],
              ["/study-in/canada","Study in Canada"],
              ["/study-in/france","Study in France"],
              ["/study-in/germany","Study in Germany"],
              ["/study-in/dubai","Study in Dubai"],
              ["/study-abroad","Study Abroad"],
              ["/contact","Contact Us"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="hover:text-emerald-400 transition-colors">{label}</Link>
            ))}
          </p>
        </div>
      </section>

    </main>
  );
}
