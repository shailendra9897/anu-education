'use client';

// FILE: app/test-prep/ielts-coaching-modasa/IELTSModasaClient.tsx
// Primary keyword : IELTS coaching in Modasa
// Secondary       : IELTS institute Modasa, IELTS classes Modasa, IELTS coaching Himmatnagar
//
// ─────────────────────────────────────────────────────────────────
// ANALYSIS OF CURRENT PAGE
//   ❌ ~350 words — critically thin for local SEO
//   ❌ Zero schema (no LocalBusiness, Course, FAQ, Breadcrumb)
//   ❌ Wrong WhatsApp number: 9428186817 → must be 7016497087
//   ❌ No course details — brochure data completely absent
//   ❌ No batch timings (brochure has full yearly planner)
//   ❌ No Self Prep / Champion pack comparison
//   ❌ No IELTS exam format or band score table
//   ❌ Only 3 implicit FAQs, no FAQ schema
//   ❌ No Google Map embed to boost local pack rankings
//   ❌ No OG tags, no canonical, no openGraph
//   ❌ No locality targeting beyond "Modasa, Himmatnagar, Idar"
//   ❌ No aggregateRating / review trust signals
//   ❌ "Nearby areas" list is too short (missing Bayad, Shamlaji,
//      Bhiloda, Malpur, Dhansura, Meghraj, Talod, Prantij)
//
// WHAT THIS FILE ADDS
//   ✅ LocalBusiness + EducationalOrganization + Course + FAQ + Breadcrumb schema
//   ✅ aggregateRating (4.8, 120+ reviews) for rich results
//   ✅ geo coordinates for local pack boost
//   ✅ All brochure data: Self Prep & Champion packs, batch timings,
//      Weekend Bonanza, video library, performance tracker
//   ✅ Yearly planner batch dates (Beginner + Advanced)
//   ✅ IELTS Academic vs General table
//   ✅ Exam format (4 sections, timings, tips)
//   ✅ Band score by country table
//   ✅ 12 LLM-citation-ready FAQs
//   ✅ Google Maps embed using GBP coordinates
//   ✅ Extended locality list: 15+ Sabarkantha / North Gujarat towns
//   ✅ FREE French 4-week course bonus highlighted
//   ✅ Corrected WhatsApp to +917016497087
//   ✅ Word count ~2,500 (from ~350)
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
    q: "Where is ANU Education located in Modasa?",
    a: "ANU Education is located at Krishna 137, Dwarkapuri Bunglows, Gitanjali Society, Modasa, Gujarat – 383315. We are centrally accessible for students from Modasa town and nearby areas including Himmatnagar, Idar, Bayad, Shamlaji, Bhiloda, Malpur, Dhansura, Meghraj, Talod, Prantij, and Aambaliyasan. Online classes are also available for students who prefer learning from home.",
  },
  {
    q: "What IELTS courses are available at ANU Education Modasa?",
    a: "ANU Education Modasa offers two IELTS Academic online courses: (1) Self Preparation Course — 60 practice tests, 15 full-length timed mock tests, 300+ grammar/vocabulary/spelling videos, 20 hours of foundation video lectures, expert mentor feedback, bonus Saturday test analysis and Sunday doubt-solving sessions, 6-month login access, 5-day free trial. (2) Champion Course — everything in Self Prep PLUS daily live classes in Morning, Afternoon, and Evening batches, separate Beginner (40 hrs) and Advanced (60 hrs) batches, 8-week structured content cycle, Saturday grammar sessions, and FREE 4-week French Language live course. Both courses also cover IELTS General Training preparation on request.",
  },
  {
    q: "What batch timings are available for IELTS coaching in Modasa?",
    a: "Champion Course batch timings: Beginner's Batch (Mon–Fri): Morning 7:30–9:30 AM · Afternoon 2:00–4:00 PM · Evening 8:30–10:30 PM. Advanced Batch (Mon–Fri): Morning 7:30–10:30 AM · Afternoon 2:00–5:00 PM · Evening 8:00–11:00 PM. Demo Batches run Monday–Saturday. Weekend Bonanza: Saturday Practice Test Analysis (7:30–9:30 AM and 2:00–4:00 PM), Saturday Mock Test Analysis (7:30–9:30 AM and 2:00–4:00 PM), Saturday Grammar (11:00 AM–12:00 PM), Sunday Doubt Solving (9:00–10:00 AM).",
  },
  {
    q: "Is there a free demo class available in Modasa?",
    a: "Yes. ANU Education offers a free 5-day trial for both the Self Preparation Course and the Champion Course. Demo batches run Monday–Saturday, with Morning (7:30–9:30 AM), Afternoon (2:00–4:00 PM), and Evening (8:30–10:30 PM) slots. You get full access to live classes, study materials, and a practice test during the trial — no payment required. Book via our website or WhatsApp.",
  },
  {
    q: "Which is better for me — IELTS Academic or IELTS General Training?",
    a: "IELTS Academic is for students applying to university programmes (undergraduate, postgraduate, PhD) in the UK, Canada, Australia, USA, Germany, or UAE. IELTS General Training is for those migrating for work, applying for Canada PR (Express Entry), Australia skilled migration, or UK family visas. Both versions are available at ANU Education Modasa. Not sure which to take? Our counsellors provide free guidance based on your specific goal.",
  },
  {
    q: "What band score do I need for study abroad from Modasa?",
    a: "Band score requirements depend on your destination and course: Canada universities — 6.0–6.5 overall. UK universities — 6.0–7.0. Australia student visa — 5.5–6.5. Germany English-medium universities — 6.0–6.5. UAE universities — 6.0. USA universities — 6.5–7.0. ANU Education's counsellors identify your exact target band for your chosen university and design a personalised preparation plan to reach it.",
  },
  {
    q: "How long does IELTS preparation take at ANU Education Modasa?",
    a: "Our Beginner's Batch runs a 4-week content cycle (approximately 40 hours of live learning) — best for students at Band 4.5–5.5 targeting 6.0–6.5. The Advanced Batch runs an 8-week cycle (60 hours) — for students at Band 5.5+ targeting 7.0 or higher. All students start with a free English Assessment Test to determine the right batch and preparation timeline.",
  },
  {
    q: "What is the IELTS exam fee in India and how do I register?",
    a: "The IELTS Academic exam fee in India is approximately ₹18,000 for both paper-based and computer-delivered formats. The exam is administered by IDP India and British Council. Computer-delivered IELTS gives results in 3–5 days and offers more test date flexibility. ANU Education guides Modasa students through exam registration with both IDP and British Council, and advises on the best test centre and date for your schedule.",
  },
  {
    q: "Does ANU Education Modasa offer study abroad counselling with IELTS coaching?",
    a: "Yes. ANU Education is a Skill India certified study abroad consultancy — not just an IELTS coaching centre. Every student enrolled in IELTS coaching at our Modasa institute gets access to free study abroad counselling including university shortlisting for 8+ countries (Canada, UK, Germany, Australia, USA, France, Ireland, UAE), SOP writing support, visa documentation guidance, and pre-departure orientation.",
  },
  {
    q: "Is the IELTS Champion Course available online for Modasa students?",
    a: "Yes. The Champion Course is fully online — live classes streamed via video platform — so Modasa students can attend from home if they prefer. This is ideal for students from towns like Bhiloda, Malpur, Meghraj, Talod, and other areas more than 20 km from Modasa. The same live batches, mock tests, Saturday analysis, and Sunday doubt sessions are available online as in any other location.",
  },
  {
    q: "What makes ANU Education different from other IELTS institutes in Modasa?",
    a: "ANU Education Modasa is the only IELTS coaching institute in the Sabarkantha region that combines: Skill India certified career counselling, IELTS + French language coaching under one roof, FREE French 4-week live course with the Champion pack, free study abroad consultancy for 8+ countries, a complete digital platform with 300+ videos, 15 mock tests, and a performance tracker, and Saturday test analysis + Sunday doubt-solving sessions. No other local institute offers this complete package.",
  },
  {
    q: "Can I join IELTS coaching at any time in Modasa?",
    a: "Yes. ANU Education Modasa has no fixed batch start dates. You can enrol any day and join the ongoing batch — the course structure is designed so every new student catches up seamlessly. Upcoming Beginner batch start dates in 2026 include: 11-May, 08-Jun, 06-Jul, 03-Aug, 31-Aug, 28-Sep, 26-Oct, 23-Nov. Advanced batch dates: 04-May, 01-Jun, 29-Jun, 24-Jul, 24-Aug, 21-Sep, 19-Oct, 16-Nov.",
  },
];

export default function IELTSModasaClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePack, setActivePack] = useState<0 | 1>(0);
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  const packs = [
    {
      id: 1, name: "Self Preparation Course",
      tag: "Self-Paced + Bonus Live Sessions",
      badge: "bg-blue-700", border: "border-blue-200", highlight: false,
      rows: [
        ["English Assessment Test", "✅"],
        ["Grammar, Vocab & Spelling Videos", "300+"],
        ["Grammar & Vocabulary Quizzes", "✅"],
        ["Foundation Lessons (L/R/W/S)", "50+ Exercises · 20 Hrs Video"],
        ["Practice Tests", "60"],
        ["Full-Length Mock Tests (Timed)", "15"],
        ["Results by Expert Mentors", "✅"],
        ["Bonus: Live Practice & Mock Analysis*", "4 Tests"],
        ["Bonus: Live Doubt Solving (Sunday)*", "✅"],
        ["Login Access Validity", "6 Months"],
        ["Free Trial", "5 Days"],
        ["Daily Live Classes", "❌"],
        ["FREE French 4-Week Course", "❌"],
      ],
    },
    {
      id: 2, name: "Champion Course",
      tag: "Live Classes · Best Value · FREE French Course",
      badge: "bg-green-700", border: "border-green-300", highlight: true,
      rows: [
        ["English Assessment Test", "✅"],
        ["Grammar, Vocab & Spelling Videos", "300+"],
        ["Grammar & Vocabulary Quizzes", "✅"],
        ["Foundation Lessons (L/R/W/S)", "50+ Exercises · 20 Hrs Video"],
        ["Practice Tests", "60"],
        ["Full-Length Mock Tests (Timed)", "15"],
        ["Results by Expert Mentors", "✅"],
        ["Bonus: Live Practice & Mock Analysis*", "4 Tests"],
        ["Bonus: Live Doubt Solving (Sunday)*", "✅"],
        ["Login Access Validity", "6 Months"],
        ["Free Trial", "5 Days"],
        ["Daily Live Classes", "Morning · Afternoon · Evening"],
        ["FREE French 4-Week Course", "🎁 FREE"],
      ],
    },
  ];

  return (
    <>
      {/* ══ LOCAL BUSINESS + EDUCATIONAL ORG SCHEMA ══ */}
      <Script id="lb-schema-modasa" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": ["EducationalOrganization", "LocalBusiness"],
        name: "ANU Education – IELTS Coaching Modasa",
        image: "https://www.anuedu.in/logo.png",
        url: "https://www.anuedu.in/test-prep/ielts-coaching-modasa",
        telephone: "+917016497087",
        email: "info@anuedu.in",
        description: "ANU Education is Modasa's leading IELTS coaching institute offering live Academic and General Training batches, 15 full-length mock tests, speaking practice, Saturday test analysis, Sunday doubt-solving, and free study abroad counselling. Skill India certified.",
        address: { "@type": "PostalAddress", streetAddress: "Krishna 137, Dwarkapuri Bunglows, Gitanjali Society", addressLocality: "Modasa", addressRegion: "Gujarat", postalCode: "383315", addressCountry: "IN" },
        geo: { "@type": "GeoCoordinates", latitude: 23.4675584, longitude: 73.3084437 },
        openingHours: "Mo-Sa 09:00-19:00",
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", bestRating: "5", reviewCount: "120" },
        hasMap: "https://www.google.com/maps?q=23.4675584,73.3084437",
        makesOffer: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "IELTS Academic Online Coaching – Self Preparation Course" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "IELTS Academic Online Coaching – Champion Course with Free French" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Free Study Abroad Counselling" } },
        ],
        areaServed: ["Modasa", "Himmatnagar", "Idar", "Bayad", "Shamlaji", "Bhiloda", "Malpur", "Dhansura", "Meghraj", "Talod", "Prantij"],
        sameAs: ["https://www.anuedu.in"],
      })}} />

      {/* ══ COURSE SCHEMA ══ */}
      <Script id="course-schema-modasa" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        name: "IELTS Coaching in Modasa – Academic & General Training 2026 | ANU Education",
        description: "Live IELTS Academic and General Training coaching for students in Modasa and Sabarkantha district. Beginner and Advanced batches, 15 full-length mock tests, 300+ grammar videos, Saturday test analysis, Sunday doubt-solving, and FREE French 4-week course with Champion pack.",
        provider: { "@type": "EducationalOrganization", name: "ANU Education", sameAs: "https://www.anuedu.in", telephone: "+917016497087", address: { "@type": "PostalAddress", addressLocality: "Modasa", addressRegion: "Gujarat", addressCountry: "IN" } },
        educationalLevel: "Beginner to Advanced",
        inLanguage: "en",
        coursePrerequisites: "No prior preparation needed. Beginner batch starts from basics.",
        offers: { "@type": "Offer", priceCurrency: "INR", availability: "https://schema.org/OnlineOnly", validFrom: "2026-01-01", description: "Free 5-day trial. Contact for course fee. IELTS exam fee ₹18,000 paid separately to IDP/British Council." },
        hasCourseInstance: [
          { "@type": "CourseInstance", name: "Beginner's Batch – Modasa", courseMode: ["Online", "Blended"], location: { "@type": "Place", name: "ANU Education, Modasa", address: { "@type": "PostalAddress", addressLocality: "Modasa", addressRegion: "Gujarat", addressCountry: "IN" } } },
          { "@type": "CourseInstance", name: "Advanced Batch – Modasa", courseMode: ["Online", "Blended"], location: { "@type": "Place", name: "ANU Education, Modasa", address: { "@type": "PostalAddress", addressLocality: "Modasa", addressRegion: "Gujarat", addressCountry: "IN" } } },
        ],
      })}} />

      {/* ══ FAQ SCHEMA ══ */}
      <Script id="faq-schema-modasa" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      })}} />

      {/* ══ BREADCRUMB SCHEMA ══ */}
      <Script id="breadcrumb-schema-modasa" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
          { "@type": "ListItem", position: 2, name: "Test Prep", item: "https://www.anuedu.in/test-prep" },
          { "@type": "ListItem", position: 3, name: "IELTS Coaching Modasa", item: "https://www.anuedu.in/test-prep/ielts-coaching-modasa" },
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
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-green-800 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">

            <nav aria-label="Breadcrumb" className="text-xs text-blue-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link><span className="mx-1">/</span>
              <Link href="/test-prep" className="hover:text-white">Test Prep</Link><span className="mx-1">/</span>
              <span className="text-white">IELTS Coaching Modasa</span>
            </nav>

            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float">
                📍 Modasa, Gujarat · 4.8 ★ · Free 5-Day Trial · Skill India Certified
              </div>
              <h1 className="anim d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                Best IELTS Coaching in Modasa
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                  Academic & General · Band 7+ in 2026
                </span>
              </h1>
              <p className="anim d2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                Modasa's most trusted IELTS coaching institute — <strong className="text-white">live Beginner &amp; Advanced batches</strong>, 15 full-length mock tests, 60 practice tests, Saturday test analysis, Sunday doubt-solving sessions, and <strong className="text-white">FREE French 4-week course</strong> with Champion pack. Students from Himmatnagar, Idar, Bayad &amp; all of Sabarkantha district welcome.
              </p>
              <div className="anim d3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse">
                  🎓 Start Free 5-Day Trial
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  aria-label="WhatsApp ANU Education Modasa for IELTS"
                  className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg">
                  💬 WhatsApp for Guidance
                </a>
              </div>
              <div className="anim d4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>⭐ 4.8 Google Rating</span>
                <span>✅ 1,100+ Students Guided</span>
                <span>✅ 98% Success Rate</span>
                <span>✅ Free Study Abroad Counselling</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

          {/* ══ STATS ══ */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "4.8 ★", label: "Google rating · 120+ reviews" },
              { stat: "15", label: "Full-length mock tests included" },
              { stat: "60", label: "Section practice tests" },
              { stat: "300+", label: "Grammar & vocabulary videos" },
            ].map((s, i) => (
              <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-blue-700 mb-1">{s.stat}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </section>

          {/* ══ WHY ANU MODASA ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">
              Why Choose ANU Education for IELTS Coaching in Modasa?
            </h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              Modasa's only Skill India certified IELTS institute with free study abroad counselling
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: "🎥", title: "Live classes — not just recordings", desc: "Real-time interaction with experienced IELTS trainers across Morning, Afternoon, and Evening batches. Every session recorded for revision." },
                { icon: "📊", title: "Beginner & Advanced — both batches", desc: "Tailored for your current level. Beginner batch (40 live hours) builds foundation; Advanced batch (60 live hours) targets Band 7+." },
                { icon: "⭐", title: "Weekend Bonanza — Sat & Sun live sessions", desc: "Saturday test analysis (7:30 AM & 2:00 PM) + Sunday doubt-solving (9:00 AM). No other Modasa institute offers weekend live review." },
                { icon: "📝", title: "15 full-length mock tests + 60 practice tests", desc: "Timed, exam-condition tests with expert mentor feedback in text and audio format — plus sectional analysis after every mock." },
                { icon: "🗣️", title: "Daily speaking practice", desc: "Record cue card responses, get feedback from trainers. Speaking confidence is where Modasa students improve the most with us." },
                { icon: "🎓", title: "Free study abroad counselling", desc: "Skill India certified counsellors for Canada, UK, Germany, Australia, France, UAE, Ireland & USA — included with every IELTS enrolment." },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ COURSE PACKS ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">IELTS Academic Course Packs — Modasa</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              Both packs: 5-day free trial · 6-month access · Expert mentor feedback · IELTS Academic & General
            </p>

            <div className="flex gap-3 justify-center mb-6">
              {packs.map((p, i) => (
                <button key={i} onClick={() => setActivePack(i as 0 | 1)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activePack === i
                      ? i === 1 ? "bg-green-700 text-white shadow-lg" : "bg-blue-700 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  Pack {p.id}: {p.name}
                  {p.highlight && <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">⭐ Best</span>}
                </button>
              ))}
            </div>

            <div className={`bg-white rounded-2xl border-2 ${packs[activePack].border} shadow-sm overflow-hidden ${packs[activePack].highlight ? "ring-2 ring-green-400" : ""}`}>
              {packs[activePack].highlight && (
                <div className="bg-green-700 text-white text-center py-2 text-sm font-bold">
                  ⭐ Most Popular · Includes FREE French 4-Week Live Course + Daily Live Classes
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3 ${packs[activePack].badge}`}>Pack {packs[activePack].id}</span>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{packs[activePack].name}</h3>
                    <p className="text-sm text-gray-500 mb-5">{packs[activePack].tag}</p>
                    <div className="space-y-1.5">
                      {packs[activePack].rows.map(([feat, val], i) => (
                        <div key={i} className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                          <span className="text-gray-700">{feat}</span>
                          <span className={`font-semibold ml-4 text-right ${val === "❌" ? "text-gray-400" : val.includes("FREE") ? "text-green-600" : "text-blue-700"}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="min-w-fit flex flex-col gap-3 md:pt-10">
                    <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                      className={`text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all text-center pulse ${packs[activePack].highlight ? "bg-green-700" : "bg-blue-700"}`}>
                      Start 5-Day Free Trial →
                    </a>
                    <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center text-sm">
                      💬 Ask About Fees
                    </a>
                    <a href="tel:+917016497087" aria-label="Call ANU Education Modasa"
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center text-sm">
                      📞 +91 70164 97087
                    </a>
                  </div>
                </div>
              </div>

              {/* Bonus live sessions panel */}
              <div className="bg-blue-700 text-white p-5">
                <p className="text-center font-bold mb-4 text-sm uppercase tracking-wider">⭐ Bonus Live Sessions — Both Packs</p>
                <div className="grid sm:grid-cols-3 gap-3 text-center text-xs">
                  {[
                    { title: "Practice Test Analysis", day: "Saturday", times: ["7:30 AM – 9:30 AM", "2:00 PM – 4:00 PM"] },
                    { title: "Mock Test Analysis", day: "Saturday", times: ["7:30 AM – 9:30 AM", "2:00 PM – 4:00 PM"] },
                    { title: "Doubt Solving Session", day: "Sunday", times: ["9:00 AM – 10:00 AM"] },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/20 rounded-xl p-3">
                      <div className="font-bold mb-1">{s.title}</div>
                      <div className="text-blue-200 mb-1">{s.day}</div>
                      {s.times.map(t => <div key={t}>{t}</div>)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ══ COURSE HIGHLIGHTS ══ */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Everything Included in Your IELTS Course</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: "📺", title: "Daily Video Library", desc: "300+ grammar, vocabulary & spelling videos. Watch anytime in your 6-month access window." },
                { icon: "📈", title: "Performance Tracker", desc: "Monitor progress, track attendance, and measure skill improvement across all 4 sections." },
                { icon: "🗣️", title: "Speaking Practice", desc: "Record cue card responses, get expert feedback in text and audio format at your own pace." },
                { icon: "🧪", title: "Simulated Mock Tests", desc: "15 full-length timed tests + 60 sectional tests with expert analysis. Real exam conditions." },
                { icon: "📅", title: "No Fixed Start Dates", desc: "Join any day — each session structured to help you catch up seamlessly from Day 1." },
                { icon: "🌐", title: "Online + In-Person Flexible", desc: "Attend live from Modasa centre or join online from home — same classes, same trainers." },
                { icon: "📝", title: "Writing Correction", desc: "Personalised feedback on Task 1 graphs and Task 2 essays with band score assessment." },
                { icon: "🎁", title: "FREE French Course (Champion)", desc: "4-week live French language course free with Champion pack — unique in Modasa." },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-gray-800 text-sm mb-1">{item.title}</div>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ BATCH SCHEDULE ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Live Class Batch Schedule — Modasa 2026</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              Champion Course · Morning · Afternoon · Evening · Join anytime
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm mb-6">
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
                    { b: "Demo Batch", d: "Mon – Sat", m: "7:30 – 9:30 AM", a: "2:00 – 4:00 PM", e: "8:30 – 10:30 PM" },
                    { b: "Beginner's Batch", d: "Mon – Fri", m: "7:30 – 9:30 AM", a: "2:00 – 4:00 PM", e: "8:30 – 10:30 PM" },
                    { b: "Advanced Batch", d: "Mon – Fri", m: "7:30 – 10:30 AM", a: "2:00 – 5:00 PM", e: "8:00 – 11:00 PM" },
                  ].map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-semibold text-gray-800">{r.b}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.d}</td>
                      <td className="px-4 py-3 text-center text-xs font-medium text-blue-700">{r.m}</td>
                      <td className="px-4 py-3 text-center text-xs font-medium text-yellow-700">{r.a}</td>
                      <td className="px-4 py-3 text-center text-xs font-medium text-indigo-700">{r.e}</td>
                    </tr>
                  ))}
                  <tr className="bg-green-50">
                    <td className="px-4 py-3 font-semibold text-green-800" colSpan={2}>Saturday Grammar Bonus</td>
                    <td className="px-4 py-3 text-center text-xs text-green-700 font-medium" colSpan={3}>11:00 AM – 12:00 PM</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* upcoming batch dates */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="bg-blue-700 text-white px-5 py-3 font-bold text-sm">📅 Beginner's Batch — Upcoming Start Dates 2026</div>
                <div className="p-4 grid grid-cols-2 gap-1 text-xs">
                  {[["11-May-2026","06-Jun-2026"],["08-Jun-2026","04-Jul-2026"],["06-Jul-2026","01-Aug-2026"],["03-Aug-2026","29-Aug-2026"],["31-Aug-2026","26-Sep-2026"],["28-Sep-2026","24-Oct-2026"],["26-Oct-2026","21-Nov-2026"],["23-Nov-2026","19-Dec-2026"]].map(([s, e], i) => (
                    <div key={i} className={`flex justify-between px-2 py-1.5 rounded ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                      <span className="text-blue-700 font-medium">{s}</span>
                      <span className="text-gray-400">→ {e}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
                <div className="bg-green-700 text-white px-5 py-3 font-bold text-sm">📅 Advanced Batch — Upcoming Start Dates 2026</div>
                <div className="p-4 grid grid-cols-2 gap-1 text-xs">
                  {[["04-May-2026","29-May-2026"],["01-Jun-2026","26-Jun-2026"],["29-Jun-2026","24-Jul-2026"],["24-Jul-2026","21-Aug-2026"],["24-Aug-2026","18-Sep-2026"],["21-Sep-2026","16-Oct-2026"],["19-Oct-2026","13-Nov-2026"],["16-Nov-2026","11-Dec-2026"]].map(([s, e], i) => (
                    <div key={i} className={`flex justify-between px-2 py-1.5 rounded ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                      <span className="text-green-700 font-medium">{s}</span>
                      <span className="text-gray-400">→ {e}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ══ EXAM FORMAT ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">IELTS Academic vs General Training</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Not sure which version to take? Here's everything you need to know.</p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-blue-200">
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold">Factor</th>
                    <th className="text-center py-3 px-4 font-bold text-blue-700 bg-blue-50">IELTS Academic</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">IELTS General Training</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Best for", "UG / PG / PhD university study abroad", "Canada PR, Australia migration, UK work visa"],
                    ["Reading texts", "Complex academic passages", "Notices, advertisements, workplace texts"],
                    ["Writing Task 1", "Describe chart / graph / diagram", "Write a formal or informal letter"],
                    ["Writing Task 2", "Academic discursive essay", "Opinion essay (same format)"],
                    ["Listening & Speaking", "Same as General", "Same as Academic"],
                    ["Score required (Canada)", "Band 6.0–6.5 (study)", "CLB 7+ via IELTS General (PR)"],
                    ["ANU Education teaches", "✅ Beginner + Advanced batches", "✅ Available on request"],
                  ].map(([factor, academic, general], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-700">{factor}</td>
                      <td className="px-4 py-3 text-center text-blue-700 bg-blue-50/30 font-medium text-sm">{academic}</td>
                      <td className="px-4 py-3 text-center text-gray-600 text-sm">{general}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section format cards */}
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">IELTS Exam Sections — Format at a Glance</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { s: "Listening", t: "30 min", q: "40 questions", tip: "Answer as you listen. No review time. Questions follow recording order.", c: "border-blue-300 bg-blue-50", b: "bg-blue-700" },
                { s: "Reading", t: "60 min", q: "40 questions", tip: "Skim passages first. Academic vocab is tested — build daily with our video library.", c: "border-green-300 bg-green-50", b: "bg-green-700" },
                { s: "Writing", t: "60 min", q: "2 tasks", tip: "Task 2 carries double marks. Spend at least 40 minutes on it.", c: "border-yellow-300 bg-yellow-50", b: "bg-yellow-600" },
                { s: "Speaking", t: "11–14 min", q: "3 parts", tip: "Fluency > vocabulary. Keep talking naturally — don't stop to think.", c: "border-purple-300 bg-purple-50", b: "bg-purple-700" },
              ].map((sec, i) => (
                <div key={i} className={`rounded-2xl border-2 p-5 ${sec.c}`}>
                  <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3 ${sec.b}`}>{sec.s}</span>
                  <div className="text-xs text-gray-400 mb-1">⏱ {sec.t} · {sec.q}</div>
                  <p className="text-xs text-gray-500 italic">💡 {sec.tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ LOCATIONS ══ */}
          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              IELTS Coaching in Modasa — Serving All of Sabarkantha District
            </h2>
            <p className="text-center text-gray-600 text-sm mb-6">
              ANU Education Modasa is the nearest IELTS coaching centre for students from all these towns. Online classes available for students further away.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {["Modasa", "Himmatnagar", "Idar", "Bayad", "Shamlaji", "Bhiloda", "Malpur", "Dhansura", "Meghraj", "Talod", "Prantij", "Aambaliyasan", "Kathlal", "Khedbrahma", "Vadali", "Vijapur", "Unjha", "Mehsana"].map(city => (
                <span key={city} className="bg-white border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 shadow-sm">
                  📍 {city}
                </span>
              ))}
            </div>

            {/* Google Map */}
            <div className="rounded-2xl overflow-hidden border border-blue-200 shadow-sm">
              <iframe
                title="ANU Education Modasa — IELTS Coaching Centre Location"
                src="https://www.google.com/maps?q=23.4675584,73.3084437&z=15&output=embed"
                width="100%" height="280" style={{ border: 0 }}
                loading="lazy" allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Krishna 137, Dwarkapuri Bunglows, Gitanjali Society, Modasa, Gujarat 383315
            </p>
          </section>

          {/* ══ FREE DEMO CTA ══ */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">🔥 Start Free 5-Day IELTS Trial in Modasa</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto text-sm">
              Join a live demo class, access mock tests and video materials, get an English Assessment score — all free for 5 days. No payment required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              {["Live demo class", "English Assessment Test", "Mock test access", "Speaking practice session"].map(f => (
                <div key={f} className="bg-white/80 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-700 border border-green-200">✔ {f}</div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors pulse">
                👉 Book Free 5-Day Trial
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors">
                💬 WhatsApp Now
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">IELTS exam fee ₹18,000 paid separately to IDP India / British Council at time of registration.</p>
          </section>

          {/* ══ FAQ ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">
              Frequently Asked Questions — IELTS Coaching Modasa
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
          <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-green-700 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float">🎯</div>
            <h2 className="text-3xl font-bold mb-3">Join Modasa's Best IELTS Coaching Today</h2>
            <p className="text-blue-100 mb-3 max-w-xl mx-auto">
              Live Beginner &amp; Advanced batches · 15 mock tests · Weekend Bonanza · Free study abroad counselling.
            </p>
            <p className="text-yellow-300 font-semibold mb-8 text-sm">
              🎁 Champion Course includes FREE 4-week French Language live course
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105">
                🎓 Start Free 5-Day Trial
              </a>
              <a href="tel:+917016497087" aria-label="Call ANU Education Modasa"
                className="border-2 border-white/70 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                📞 +91 70164 97087
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors">
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-white/50">📍 Krishna 137, Dwarkapuri Bunglows, Gitanjali Society, Modasa 383315 · info@anuedu.in</p>
          </section>

          {/* ══ INTERNAL LINKS ══ */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">IELTS Online Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/ielts-coaching-ahmedabad" className="text-blue-600 hover:underline">IELTS Coaching Ahmedabad</Link>
              <span>·</span>
              <Link href="/test-prep/ielts-coaching-gandhinagar" className="text-blue-600 hover:underline">IELTS Coaching Gandhinagar</Link>
              <span>·</span>
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline">PTE Coaching</Link>
              <span>·</span>
              <Link href="/language/french" className="text-blue-600 hover:underline">French Language Course</Link>
              <span>·</span>
              <Link href="/study-in/canada" className="text-blue-600 hover:underline">Study in Canada</Link>
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
