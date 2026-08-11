'use client';

// FILE: app/test-prep/dmat/DMATClient.tsx
// Keyword cluster: dMAT coaching / Digital Master Test / dMAT Germany / dMAT 2026
//
// ─────────────────────────────────────────────────────────────────
// AUDIT — competitor (studies-overseas.com/coaching/dmat, KC Overseas)
//
// Competitor page is genuinely thin for a brand-new, high-stakes exam:
//   ❌ Only 2 short paragraphs describing what dMAT is
//   ❌ No schema at all (no Course, FAQ, Event for the test date)
//   ❌ No test date timeline — the single most valuable, urgent piece
//      of information for this exam (registration deadline 15 Sept
//      2026, test date 26 Sept 2026) is completely absent
//   ❌ No mention of who actually needs to take it (only Engineering/
//      Commerce/Business degree holders in the 2026 intro phase)
//   ❌ No Core vs Subject Module distinction
//   ❌ No test centre list
//   ❌ No fee information
//   ❌ City-locked targeting ("dMAT coaching in Nagpur" only)
//
// THIS IS A GENUINE FIRST-MOVER OPPORTUNITY: dMAT's first India
// administration is 26 September 2026 — almost no comprehensive
// content exists yet anywhere. Building accurate, complete content
// now (from the official course brochure) has real potential to
// establish topical authority before competitors catch up.
//
// WHAT THIS PAGE ADDS:
//   ✅ Course + FAQ + Breadcrumb + Event schema (Event schema is
//      genuinely earned here — there's a real, dated exam event)
//   ✅ Full 2026 test date timeline (registration → deadline → test
//      → results) as a visual urgency-driven timeline
//   ✅ "Who needs to take it" eligibility section — degree-specific,
//      not generic, directly from the brochure
//   ✅ Core Module vs Subject Module explainer, with explicit
//      transparency that THIS course covers Core Module only
//      (matches the brochure's own honesty disclaimer — builds trust
//      rather than overselling)
//   ✅ Free Trial vs dMAT Core pack comparison
//   ✅ Batch schedule (Core classes + Demo Orientation slots)
//   ✅ Test centre list (11 cities incl. Kathmandu)
//   ✅ Certificate & APS documentation explainer
//   ✅ Clear disclaimer: registration/booking/certification handled
//      directly by g.a.s.t., not by ANU Education — avoids confused
//      expectations and mirrors the brochure's own honesty
//   ✅ 12 FAQs targeting long-tail dMAT search queries
//   ✅ Word count ~2,200 (from ~80)
// ─────────────────────────────────────────────────────────────────

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

const FAQS = [
  {
    q: "What is the dMAT (Digital Master Test)?",
    a: "The dMAT — also referred to as the Digital Master Admission Test — is a standardised computer-based aptitude test introduced by APS India in collaboration with ITB Consulting, designed to evaluate the academic aptitude of students applying for Master's programmes in Germany. It assesses logical reasoning, mathematical aptitude, and analytical thinking, helping German universities identify applicants with the required academic potential. The official certificate is issued by g.a.s.t. and must be enclosed with your APS application documents.",
  },
  {
    q: "Who needs to take the dMAT in 2026?",
    a: "In its introductory phase in 2026, the dMAT requirement applies exclusively to applicants whose undergraduate degree is in Engineering, Commerce/Accounting/Finance/Economics, or Business/Management. If your degree falls within one of these fields and you're aiming to start a graduate programme in Germany in summer semester 2027 or thereafter, you are required to take the dMAT with the General Academic (Subject) Module as part of your APS documentation process. Students outside these three degree categories are not currently required to take it.",
  },
  {
    q: "What is the difference between the dMAT Core Module and Subject Module?",
    a: "The dMAT has two modules. The Core Module measures general cognitive and analytical skills through three subtests — this is the foundational, general-reasoning portion of the exam. The Subject Module (General Academic Module) tests your ability to apply those cognitive and analytical skills to academic problem-solving — tasks combine a typical academic problem with related questions, requiring developed transfer and application skills rather than memorised factual knowledge. Both modules together make up your complete dMAT result for APS purposes.",
  },
  {
    q: "Does ANU Education's dMAT course cover both the Core and Subject Modules?",
    a: "Currently, ANU Education's dMAT course covers the Core Module only. The Subject (General Academic) Module is not yet taught as part of this programme — we will announce Subject Module coaching sessions once they launch. This is worth knowing upfront: if your APS documentation requires the full dMAT result (both modules), you will need Subject Module preparation from another source until we launch our own, or self-study using official g.a.s.t. materials.",
  },
  {
    q: "When is the first dMAT test date in India?",
    a: "The first dMAT administration in India follows this timeline: registration opens 29 June 2026, the registration deadline is 15 September 2026, the test date is 26 September 2026, and results are published with certificates issued via the g.a.s.t. portal on 12 October 2026. These are the confirmed dates for the inaugural India administration — future test cycles may follow a similar or different schedule, so always verify current dates on the official g.a.s.t. site before planning.",
  },
  {
    q: "Where can I take the dMAT in India?",
    a: "The dMAT is currently planned to be offered at selected g.a.s.t. test centres including Ahmedabad, Bengaluru, Bhopal, Chandigarh, Chennai, Kolkata, Mananthavady, Mumbai, New Delhi, and Pune, as well as Kathmandu in Nepal. The final confirmed list of test centres becomes available during the official registration process on the g.a.s.t. platform.",
  },
  {
    q: "Who registers me for the dMAT — ANU Education or someone else?",
    a: "Registration, test centre booking, technical support, certificate issuance, and payment for the dMAT exam itself are all managed directly by g.a.s.t. — not by ANU Education or any coaching provider. ANU Education's role is exam preparation and coaching only. You register for the actual exam yourself at www.d-mat.de/en/registration. We're transparent about this distinction so there's no confusion about who handles what.",
  },
  {
    q: "What does ANU Education's dMAT Core course include?",
    a: "The dMAT Core course includes: a 4-week live curriculum, 20 hours of total live learning (60 minutes/day, Monday to Friday, 9:30–10:30 PM IST), 5 in-class tests, and 60 days of portal access. A free trial pack is also available: 5 days of access, 60 minutes/day, 1 in-class test, for students who want to experience the teaching style before enrolling. Sessions are live, instructor-led, and delivered online — recordings are available for any missed lectures.",
  },
  {
    q: "Is there a free demo class for dMAT coaching?",
    a: "Yes. ANU Education offers a Demo Orientation session on Tuesdays, Thursdays, and Saturdays from 9:00–10:00 AM IST, alongside a 5-day free trial pack that includes 60 minutes of live daily instruction and 1 in-class test — giving you a genuine sense of the course before committing.",
  },
  {
    q: "How is the dMAT certificate used in my Germany application?",
    a: "The official dMAT certificate is issued by g.a.s.t. and must be enclosed with your APS application documents. It will also be referenced directly on your APS certificate, which German universities require as part of your application for graduate programmes. Without a valid dMAT certificate (where applicable to your degree background), your APS documentation may be considered incomplete.",
  },
  {
    q: "Is the dMAT the same as the GMAT or GRE?",
    a: "No. The dMAT is a distinct exam specifically created for the German APS documentation process, administered by g.a.s.t. in collaboration with ITB Consulting, and currently required only for Engineering, Commerce, and Business/Management graduates applying to German Master's programmes starting summer semester 2027 onward. GMAT and GRE are separate, globally-used graduate admissions tests not tied to the APS process. Some German universities may still request GMAT/GRE independently of dMAT requirements — always check your specific target university's admission criteria.",
  },
  {
    q: "What score do I need on the dMAT?",
    a: "As of the exam's introductory phase in 2026, official minimum score thresholds for German universities are still being established, since this is the first administration in India. We recommend checking directly with your target German university's admissions office for their specific dMAT score expectations, and monitoring official g.a.s.t. communications as the programme matures.",
  },
  {
    q: "How long should I prepare for the dMAT Core Module?",
    a: "ANU Education's dMAT Core course is structured as a 4-week programme with 20 hours of live instruction — designed to build the general cognitive and analytical skills tested in the Core Module's three subtests within that window. Students with strong existing quantitative and logical reasoning skills may need less time; those building these skills from scratch should allow the full 4 weeks plus additional self-practice using the 60-day portal access.",
  },
];

const TEST_TIMELINE = [
  { date: "29 June 2026", milestone: "Registration Opens", desc: "Students can begin registering for the first dMAT administration in India." },
  { date: "15 September 2026", milestone: "Registration Deadline", desc: "Last date to register for the 26 September 2026 test date.", urgent: true },
  { date: "26 September 2026", milestone: "dMAT Test Date", desc: "The exam is conducted at selected g.a.s.t. test centres across India.", urgent: true },
  { date: "12 October 2026", milestone: "Results & Certificate", desc: "Results published and certificates issued via the g.a.s.t. portal." },
];

const TEST_CENTRES = ["Ahmedabad", "Bengaluru", "Bhopal", "Chandigarh", "Chennai", "Kathmandu (Nepal)", "Kolkata", "Mananthavady", "Mumbai", "New Delhi", "Pune"];

export default function DMATClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  return (
    <>
      {/* ══ COURSE SCHEMA ══ */}
      <Script id="course-schema-dmat" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          name: "dMAT Core Module Coaching 2026 – Digital Master Test for Germany | ANU Education",
          description: "Live online coaching for the dMAT (Digital Master Test) Core Module — required for Engineering, Commerce, and Business/Management graduates applying to German Master's programmes from summer semester 2027 onward. 4-week curriculum, 20 hours live learning, 60-day portal access.",
          provider: { "@type": "EducationalOrganization", name: "ANU Education", url: "https://www.anuedu.in", telephone: "+917016497087", address: { "@type": "PostalAddress", addressLocality: "Modasa", addressRegion: "Gujarat", addressCountry: "IN" } },
          educationalLevel: "Undergraduate to Graduate",
          inLanguage: "en",
          coursePrerequisites: "Undergraduate degree in Engineering, Commerce/Accounting/Finance/Economics, or Business/Management, applying for German Master's programmes.",
          offers: [
            { "@type": "Offer", name: "Free Trial Pack", description: "5-day access, 60 min/day live, 1 in-class test" },
            { "@type": "Offer", name: "dMAT Core Course", description: "4-week curriculum, 20 hours live learning, 5 in-class tests, 60-day portal access" },
          ],
          hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseSchedule: { "@type": "Schedule", byDay: ["Monday","Tuesday","Wednesday","Thursday","Friday"], startTime: "21:30", endTime: "22:30" }, location: { "@type": "VirtualLocation", url: "https://www.anuedu.in/test-prep/dmat" } },
          about: { "@type": "Thing", name: "Digital Master Test", sameAs: "https://www.d-mat.de/en" },
        })}}
      />

      {/* ══ EVENT SCHEMA — the actual dMAT test date ══ */}
      <Script id="event-schema-dmat" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ExamEvent",
          name: "dMAT — First India Administration 2026",
          description: "The first Digital Master Test (dMAT) administration in India, required for APS documentation for Engineering, Commerce, and Business/Management graduates applying to German Master's programmes.",
          startDate: "2026-09-26",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: TEST_CENTRES.map(city => ({ "@type": "Place", name: `dMAT Test Centre – ${city}`, address: { "@type": "PostalAddress", addressLocality: city.replace(" (Nepal)", ""), addressCountry: city.includes("Nepal") ? "NP" : "IN" } })),
          organizer: { "@type": "Organization", name: "g.a.s.t.", url: "https://www.d-mat.de/en/registration" },
        })}}
      />

      {/* ══ FAQ SCHEMA ══ */}
      <Script id="faq-schema-dmat" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        })}}
      />

      {/* ══ BREADCRUMB SCHEMA ══ */}
      <Script id="breadcrumb-schema-dmat" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
            { "@type": "ListItem", position: 2, name: "Test Prep", item: "https://www.anuedu.in/test-prep" },
            { "@type": "ListItem", position: 3, name: "dMAT Coaching", item: "https://www.anuedu.in/test-prep/dmat" },
          ],
        })}}
      />

      <style jsx>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-7px);} }
        @keyframes pulse-g { 0%,100%{box-shadow:0 0 0 0 rgba(234,179,8,.4);}50%{box-shadow:0 0 0 12px rgba(234,179,8,0);} }
        .anim{animation:fadeInUp .65s ease-out forwards;opacity:0;}
        .float{animation:float 3.5s ease-in-out infinite;}
        .pulse{animation:pulse-g 2.2s infinite;}
        .d1{animation-delay:.05s}.d2{animation-delay:.15s}.d3{animation-delay:.25s}.d4{animation-delay:.35s}
        .card{transition:transform .25s,box-shadow .25s;}
        .card:hover{transform:translateY(-4px);box-shadow:0 16px 28px -8px rgba(0,0,0,.12);}
        .ua{position:relative;display:inline-block;}
        .ua::after{content:'';position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:52px;height:3px;background:linear-gradient(90deg,#4338ca,#eab308);border-radius:2px;}
      `}</style>

      <main className="min-h-screen bg-white">

        {/* ══ HERO ══ */}
        <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="text-xs text-indigo-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link><span className="mx-1">/</span>
              <Link href="/test-prep" className="hover:text-white">Test Prep</Link><span className="mx-1">/</span>
              <span className="text-white">dMAT Coaching</span>
            </nav>
            <div className="text-center">
              <div className="inline-block bg-yellow-400/20 border border-yellow-400/40 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float text-yellow-200">
                🆕 First dMAT Administration in India · 26 September 2026
              </div>
              <h1 className="anim d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                dMAT Coaching for
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Study in Germany 2026
                </span>
              </h1>
              <p className="anim d2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                Live Core Module coaching for the new <strong className="text-white">Digital Master Test</strong> — required for Engineering, Commerce &amp; Business graduates applying to German Master's programmes from summer semester 2027 onward.
              </p>
              <div className="anim d3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                  className="group bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse">
                  🎓 Book Free Demo Orientation
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a href="https://wa.me/919428186817?text=Hi%2C%20I%20want%20dMAT%20coaching%20details%20from%20ANU%20Education" target="_blank" rel="noopener noreferrer"
                  className="bg-yellow-500 text-indigo-950 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg">
                  💬 WhatsApp for dMAT Guidance
                </a>
              </div>
              <div className="anim d4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>✅ 4-Week Live Curriculum</span>
                <span>✅ 20 Hours Live Learning</span>
                <span>✅ Free Trial Pack Available</span>
                <span>✅ Skill India Certified</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

          {/* ══ QUICK STATS ══ */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "4 Weeks", label: "Live curriculum" },
              { stat: "20 Hrs", label: "Total live learning" },
              { stat: "60 Days", label: "Portal access" },
              { stat: "5", label: "In-class tests" },
            ].map((s, i) => (
              <div key={i} className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-indigo-800 mb-1">{s.stat}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </section>

          {/* ══ WHAT IS dMAT ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">What is the dMAT?</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">A new requirement for German Master's applications — here's exactly what it is</p>
            <div className="bg-gray-50 rounded-2xl p-7 text-gray-700 leading-relaxed text-sm space-y-3">
              <p>
                The <strong>dMAT (Digital Master Test)</strong> — also referred to as the Digital Master Admission Test — is a standardised, computer-based aptitude test introduced by <strong>APS India</strong> in collaboration with <strong>ITB Consulting</strong>. It evaluates the academic aptitude of students applying for Master's programmes in Germany, assessing logical reasoning, mathematical aptitude, and analytical thinking.
              </p>
              <p>
                The exam is conducted in a computer-based format at designated test centres across India. The official certificate is issued by <strong>g.a.s.t.</strong> and must be enclosed with your <strong>APS application documents</strong> — it will also be referenced directly on your APS certificate.
              </p>
            </div>
          </section>

          {/* ══ WHO NEEDS TO TAKE IT ══ */}
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Who Needs to Take the dMAT?</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              In its introductory phase in 2026, the dMAT requirement applies <strong>exclusively</strong> to applicants whose undergraduate degree is in one of these three fields:
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {["Engineering", "Commerce, Accounting, Finance, Economics", "Business / Management"].map((f, i) => (
                <div key={i} className="bg-white rounded-xl border-l-4 border-amber-500 p-4 text-sm font-semibold text-gray-800">{f}</div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-5 text-sm text-gray-700">
              Applicants whose degree falls within one of these areas, aiming to start a graduate programme in Germany in <strong>summer semester 2027 or thereafter</strong>, are required to take the dMAT with the <strong>General Academic Module</strong> as part of the APS documentation process.
            </div>
          </section>

          {/* ══ CORE VS SUBJECT MODULE ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">How is the dMAT Structured?</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Two modules make up your complete dMAT result</p>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-6">
                <span className="inline-block bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">Core Module</span>
                <h3 className="font-bold text-gray-800 mb-2">General Cognitive Skills</h3>
                <p className="text-sm text-gray-600 mb-3">Measures general cognitive and analytical skills through three subtests.</p>
                <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-2 rounded-lg inline-block">✅ Covered by ANU Education's course</div>
              </div>
              <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-6">
                <span className="inline-block bg-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">Subject Module</span>
                <h3 className="font-bold text-gray-800 mb-2">General Academic Module</h3>
                <p className="text-sm text-gray-600 mb-3">Applies cognitive skills to academic problem-solving — requires transfer and application skills rather than memorised knowledge.</p>
                <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-2 rounded-lg inline-block">⏳ Coming soon — not yet taught</div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">★ We will update about Subject Module sessions once we launch.</p>
          </section>

          {/* ══ TEST DATE TIMELINE — urgency-driven ══ */}
          <section className="bg-gradient-to-r from-red-50 via-white to-indigo-50 border border-red-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">⏰ First dMAT India Test Date Timeline</h2>
            <p className="text-center text-gray-600 text-sm mb-8">Mark these dates — this is the inaugural India administration</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEST_TIMELINE.map((t, i) => (
                <div key={i} className={`rounded-2xl p-5 border-2 ${t.urgent ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${t.urgent ? "text-red-600" : "text-indigo-600"}`}>{t.date}</div>
                  <h3 className="font-bold text-gray-800 text-sm mb-2">{t.milestone}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mt-6 max-w-2xl mx-auto">
              ⚠️ <strong>Registration closes 15 September 2026</strong> — with a 4-week course + free trial, students should ideally start preparation by early August 2026 at the latest.
            </p>
          </section>

          {/* ══ COURSE PACKS ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">dMAT Core Course — Compare Packs</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Try free, then upgrade to the full 4-week programme</p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-indigo-800 text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Feature</th>
                    <th className="text-center px-4 py-3 font-semibold">Free Trial Pack</th>
                    <th className="text-center px-4 py-3 font-semibold bg-indigo-700">dMAT Core ⭐</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Live Lecture Duration", "60 Min/Day", "60 Min/Day"],
                    ["Live Lecture Content Cycle", "5 Days", "4 Weeks"],
                    ["Total Live Learning Hours", "5 Hours", "20 Hours"],
                    ["In-Class Tests", "1", "5"],
                    ["Login Access Validity", "5 Days", "60 Days"],
                  ].map(([feat, trial, core], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-700">{feat}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{trial}</td>
                      <td className="px-4 py-3 text-center text-indigo-700 font-bold bg-indigo-50">{core}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-indigo-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-900 transition-colors pulse text-center">
                Start Free Trial Pack →
              </a>
            </div>
          </section>

          {/* ══ BATCH SCHEDULE ══ */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Live Class Schedule</h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white mb-4">
              <table className="w-full text-sm">
                <thead className="bg-indigo-800 text-white">
                  <tr>
                    <th className="text-left px-4 py-3">Course</th>
                    <th className="text-left px-4 py-3">Batch</th>
                    <th className="text-center px-4 py-3">IST Timings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-white">
                    <td className="px-4 py-3 font-semibold text-gray-800">dMAT Core</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">Monday – Friday</td>
                    <td className="px-4 py-3 text-center text-indigo-700 font-medium text-xs">9:30 PM – 10:30 PM</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-4 py-3 font-semibold text-green-800">Demo Orientation</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">Tue / Thu / Sat</td>
                    <td className="px-4 py-3 text-center text-green-700 font-medium text-xs">9:00 AM – 10:00 AM</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-gray-500">🎥 Live, instructor-led online sessions — face to face from anywhere · Recordings available for missed lectures</p>
          </section>

          {/* ══ TEST CENTRES ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">dMAT Test Centres in India</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Final confirmed list available during official registration</p>
            <div className="flex flex-wrap justify-center gap-2">
              {TEST_CENTRES.map(city => (
                <span key={city} className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-medium text-indigo-800">📍 {city}</span>
              ))}
            </div>
          </section>

          {/* ══ TRANSPARENCY DISCLAIMER ══ */}
          <section className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex gap-4 items-start">
              <span className="text-3xl flex-shrink-0">ℹ️</span>
              <div>
                <h2 className="font-bold text-gray-900 text-sm mb-1">Who Handles Registration & Certification?</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Registration, test centre booking, technical support, issuing of certificates, and payment for the actual dMAT exam are all managed <strong>directly by g.a.s.t.</strong> — not by ANU Education. Our role is exam preparation and coaching only. You register for the exam yourself at{" "}
                  <a href="https://www.d-mat.de/en/registration" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-medium">www.d-mat.de/en/registration</a>.
                </p>
              </div>
            </div>
          </section>

          {/* ══ FREE DEMO CTA ══ */}
          <section className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">🔥 Start Your dMAT Preparation Today</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto text-sm">
              Join a free Demo Orientation session or start the 5-day free trial pack — experience live teaching before enrolling in the full Core course.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-indigo-800 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-900 transition-colors pulse">
                👉 Book Free Demo Orientation
              </a>
              <a href="https://wa.me/919428186817?text=Hi%2C%20I%20want%20dMAT%20coaching%20details" target="_blank" rel="noopener noreferrer"
                className="bg-yellow-500 text-indigo-950 px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors">
                💬 WhatsApp Now
              </a>
            </div>
          </section>

          {/* ══ FAQ ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">Frequently Asked Questions — dMAT 2026</h2>
            <div className="max-w-3xl mx-auto space-y-3 mt-4">
              {FAQS.map((faq, idx) => (
                <details key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
                  open={openFaq === idx}
                  onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; setOpenFaq(el.open ? idx : null); }}>
                  <summary className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer list-none">
                    <span className="font-semibold text-gray-800 pr-4 text-sm md:text-base">{faq.q}</span>
                    <span className="text-indigo-700 text-xl font-light flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>
                </details>
              ))}
            </div>
          </section>

          {/* ══ FINAL CTA ══ */}
          <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float">🇩🇪</div>
            <h2 className="text-3xl font-bold mb-3">Be Ready for the First dMAT in India</h2>
            <p className="text-indigo-100 mb-2 max-w-xl mx-auto">
              4-week Core Module coaching · Free trial pack · Live instructor-led classes.
            </p>
            <p className="text-yellow-300 font-semibold mb-8 text-sm">
              ⏰ Registration deadline: 15 September 2026 · Test date: 26 September 2026
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="https://study.anuedu.in/register" target="_blank" rel="noopener noreferrer"
                className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105">
                🎓 Book Free Demo Orientation
              </a>
              <a href="tel:+917016497087" className="border-2 border-white/70 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                📞 +91 70164 97087
              </a>
              <a href="https://wa.me/919428186817?text=Hi%2C%20I%20want%20dMAT%20coaching%20details" target="_blank" rel="noopener noreferrer"
                className="bg-yellow-500 text-indigo-950 px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-colors">
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-white/50">Skill India Certified · Modasa, Gujarat · info@anuedu.in</p>
          </section>

          {/* ══ INTERNAL LINKS ══ */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/study-in/germany" className="text-blue-600 hover:underline">Study in Germany</Link>
              <span>·</span>
              <Link href="/language/german" className="text-blue-600 hover:underline">German Language Course</Link>
              <span>·</span>
              <Link href="/test-prep/gre" className="text-blue-600 hover:underline">GRE Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/gmat" className="text-blue-600 hover:underline">GMAT Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">IELTS Coaching</Link>
              <span>·</span>
              <Link href="/services/visa-assistance" className="text-blue-600 hover:underline">Visa Assistance</Link>
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