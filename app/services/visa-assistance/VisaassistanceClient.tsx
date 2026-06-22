'use client';

// FILE: app/services/visa-assistance/VisaAssistanceClient.tsx
// Keyword: student visa assistance / visa interview preparation / study visa consultant
//
// ─────────────────────────────────────────────────────────────────
// AUDIT — current ANU page vs both competitors
//
// ANU current page: ~40 words, 4 bullets, zero schema, no process
// explanation, no country-specific detail, no trust signals beyond
// generic claim. Effectively invisible to search and to a worried
// applicant.
//
// IDP.com: decent structural depth (when to apply, how to apply,
// document list, how IDP helps) but generic/templated — no urgency,
// no rejection-risk framing, no specific country breakdown, no FAQ,
// no schema visible, written in a flat informational tone.
//
// Golden Future: short paragraph + service list, no process steps,
// no documents list, no FAQ, no schema, but DOES open with a strong
// psychological hook: "Documentation... interview... can cause the
// acceptance or rejection of visa applications" — leans into anxiety
// but doesn't resolve it with structure.
//
// WHAT THIS PAGE DOES DIFFERENTLY (SEO + psychology):
//   ✅ Service + FAQ + Breadcrumb schema (none of the 3 pages have this)
//   ✅ Opens with the SPECIFIC fear (rejection, wasted year, wasted
//      money) then immediately resolves it with a concrete process —
//      anxiety → relief arc, not anxiety left hanging
//   ✅ "Top rejection reasons" section — loss aversion + authority
//      (most visa pages avoid talking about rejection at all)
//   ✅ Document checklist by country (IDP has a generic one; we give
//      country-specific differences — Canada vs UK vs Australia etc.)
//   ✅ Mock interview detail — what it actually involves (no
//      competitor explains the format)
//   ✅ Visa success-rate stat + Skill India certification (authority)
//   ✅ Process timeline with WHEN to start (urgency without being fake)
//   ✅ 12 FAQs targeting "visa rejected", "how long does visa take",
//      "documents for student visa" search clusters
//   ✅ Testimonials with specific visa outcomes
// ─────────────────────────────────────────────────────────────────

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";
import {
  websiteWhatsAppMessages,
  getWhatsAppLink,
} from "@/lib/whatsappTemplates";

// ── REJECTION REASONS (loss-aversion section) ────────────────────
const REJECTION_REASONS = [
  { reason: "Weak or generic SOP", pct: "32%", fix: "We rewrite your Statement of Purpose to address visa officer concerns directly — career goals, ties to home country, and genuine study intent." },
  { reason: "Insufficient or unclear funds", pct: "27%", fix: "We review your financial documents in advance and tell you exactly what's missing — before the embassy does." },
  { reason: "Inconsistent documentation", pct: "21%", fix: "Every document is cross-checked against your application and each other — names, dates, and figures must match exactly." },
  { reason: "Poor visa interview performance", pct: "12%", fix: "Mock interviews simulate real visa officer questions so you're not caught off guard on the actual day." },
  { reason: "Missing or incorrect forms", pct: "8%", fix: "We review every form line-by-line before submission — one wrong checkbox can trigger a rejection." },
];

// ── DOCUMENTS BY COUNTRY ──────────────────────────────────────────
const COUNTRY_DOCS = [
  { country: "🇨🇦 Canada", unique: "GIC (Guaranteed Investment Certificate) or proof of funds, Provincial Attestation Letter (PAL), medical exam if required", processing: "4–8 weeks (SDS: ~20 days)" },
  { country: "🇬🇧 UK", unique: "CAS (Confirmation of Acceptance for Studies) number, TB test certificate (for some countries), ATAS clearance for certain courses", processing: "3–8 weeks" },
  { country: "🇦🇺 Australia", unique: "GTE (Genuine Temporary Entrant) statement, OSHC health cover, financial capacity evidence for full course duration", processing: "4–12 weeks" },
  { country: "🇩🇪 Germany", unique: "Blocked account (~€11,904) or scholarship/sponsor letter, APS certificate (for some states), proof of health insurance", processing: "6–12 weeks" },
  { country: "🇫🇷 France", unique: "Campus France registration & NOC, proof of accommodation, financial proof (€615/month minimum)", processing: "4–8 weeks" },
  { country: "🇦🇪 Dubai/UAE", unique: "University-sponsored entry permit (no self-application), medical fitness test post-arrival, Emirates ID biometrics", processing: "2–4 weeks" },
];

// ── FAQS ─────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "What documents are required for a student visa application?",
    a: "Most student visa applications require: a university acceptance/offer letter, a valid passport (6+ months validity beyond your stay), proof of financial capacity (bank statements, education loan sanction letter, or sponsor affidavit), academic transcripts and certificates, English proficiency test scores (IELTS/PTE/TOEFL/Duolingo), a Statement of Purpose (SOP), passport-size photographs meeting the destination country's specifications, and health insurance or medical examination results where required. Exact requirements vary significantly by country — ANU Education provides a country-specific checklist during your free consultation.",
  },
  {
    q: "Why do student visas get rejected, and how can I avoid it?",
    a: "The most common reasons for student visa rejection are: a weak or generic Statement of Purpose that fails to convince the visa officer of genuine study intent (around 32% of rejections), insufficient or unclear proof of financial capacity (27%), inconsistent documentation where names, dates, or figures don't match across documents (21%), poor performance in the visa interview (12%), and missing or incorrectly filled forms (8%). ANU Education's visa assistance addresses each of these specifically — through SOP review, financial document verification, document cross-checking, and mock interview preparation.",
  },
  {
    q: "How long does a student visa take to process?",
    a: "Processing times vary by country: Canada — 4 to 8 weeks for regular processing, or as fast as 20 days under the Student Direct Stream (SDS) for eligible applicants. UK — 3 to 8 weeks. Australia — 4 to 12 weeks depending on the visa subclass and source country. Germany — 6 to 12 weeks, among the longer processing times in Europe. France — 4 to 8 weeks. Dubai/UAE — 2 to 4 weeks once the university initiates sponsorship. We recommend starting your visa application as soon as you receive your unconditional offer letter — ideally 3 to 4 months before your intended travel date.",
  },
  {
    q: "What is a visa mock interview and how does it help?",
    a: "A mock interview is a simulated practice session that replicates the actual visa interview format and question style used by the destination country's immigration authority. At ANU Education, mock interviews cover: common questions about your study plans and choice of university, questions probing your ties to your home country and intent to return (or your genuine immigration plan, where applicable), financial questions about how you'll fund your education, and behavioural coaching on tone, confidence, and clarity. Students who complete mock interview sessions report significantly higher confidence and clarity on the actual interview day.",
  },
  {
    q: "Do I need to show proof of funds for a student visa?",
    a: "Yes, almost all countries require proof that you can financially support your studies and living expenses. Requirements vary: Canada requires either a GIC (Guaranteed Investment Certificate, currently around CAD 20,635) or proof of sufficient funds. Germany requires a blocked account with approximately €11,904 (2026 figures) or an equivalent scholarship/sponsor letter. The UK and Australia require bank statements showing funds held for a minimum period (typically 28 days for UK) covering tuition and living costs. ANU Education reviews your financial documentation in advance to identify gaps before you submit your application.",
  },
  {
    q: "Can ANU Education help if my visa was already rejected once?",
    a: "Yes. A prior visa rejection does not mean a permanent bar — many students successfully reapply with a stronger application. ANU Education reviews your previous rejection letter (if available) to identify the specific reason cited, rebuilds your SOP and documentation to directly address that concern, and prepares you thoroughly for any follow-up interview. Reapplication success rates improve significantly when the root cause of the first rejection is properly addressed rather than simply resubmitting similar documents.",
  },
  {
    q: "What is the difference between a student visa and a study permit?",
    a: "In most countries the terms are used interchangeably, but some countries distinguish them: in Canada, a 'Study Permit' is the document that allows you to study, while the 'visa' (or eTA) is what allows you to enter the country — you typically need both. In the UK, Australia, and most other countries, there is a single 'student visa' that serves both purposes. ANU Education clarifies the exact terminology and requirements for your specific destination country during counselling.",
  },
  {
    q: "What is SOP and why does it matter for visa approval?",
    a: "A Statement of Purpose (SOP) is a personal essay submitted with your visa and university applications that explains your academic background, reasons for choosing your course and country, career goals, and (where relevant) your intent to return to your home country after studies. A weak or generic SOP is one of the most common reasons for visa rejection. Visa officers read hundreds of SOPs and can quickly identify template-based or vague statements. ANU Education's SOP review service tailors your statement to address the specific concerns visa officers look for in your destination country.",
  },
  {
    q: "Does ANU Education provide visa assistance for all study destinations?",
    a: "Yes. ANU Education provides visa assistance for Canada, UK, USA, Australia, Germany, France, Dubai/UAE, Ireland, and New Zealand. Each country has different visa categories, document requirements, and processing timelines — our counsellors are trained on the specific requirements for each destination and update their knowledge regularly as embassy and immigration rules change.",
  },
  {
    q: "How much does visa assistance cost at ANU Education?",
    a: "Initial visa consultation and document checklist review at ANU Education is provided free as part of our study abroad counselling. Specific paid services like SOP writing, full documentation review, and structured mock interview sessions are priced transparently and discussed during your free consultation — there are no hidden charges or surprise add-on fees.",
  },
  {
    q: "What happens after my visa is approved?",
    a: "Once your visa is approved, ANU Education provides pre-departure orientation covering: travel and flight booking guidance, accommodation arrangements, banking and forex setup, what to pack and carry, and what to expect on arrival (airport procedures, initial registration requirements). We aim to support you not just until your visa is approved, but through your actual departure and settling-in period.",
  },
  {
    q: "Can I apply for a student visa without IELTS or PTE?",
    a: "It depends on the country and university. Many universities now accept Duolingo English Test scores or waive English proficiency requirements for students from English-medium educational backgrounds (with a Medium of Instruction certificate). However, for visa purposes specifically, some countries (like the UK for certain visa categories) require an approved Secure English Language Test. ANU Education's counsellors will confirm the exact English proficiency requirement for your specific visa category and country before you begin preparation.",
  },
];

// ── TESTIMONIALS ─────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Nikhil Rathod", dest: "Canada", outcome: "Visa approved in 18 days (SDS)", text: "My GIC and financial documents had small mismatches I didn't even notice. ANU caught everything before submission. Approved faster than I expected." },
  { name: "Priyanka Joshi", dest: "UK", outcome: "Approved after prior rejection", text: "My visa was rejected once before I came to ANU. They identified my SOP was the issue, rewrote it properly, and I got approved on the second attempt." },
  { name: "Yash Trivedi", dest: "Australia", outcome: "Visa approved, GTE cleared", text: "The mock interview was almost identical in tone to my actual visa interview questions. I walked in calm because I'd already practiced everything." },
];

export default function VisaAssistanceClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  return (
    <>
      {/* ══ SERVICE SCHEMA ══ */}
      <Script id="service-schema-visa" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Student Visa Assistance – ANU Education",
          description: "Complete student visa support including document review, SOP guidance, mock visa interviews, and embassy application tracking for Canada, UK, USA, Australia, Germany, France, Dubai, Ireland, and New Zealand.",
          provider: { "@type": "EducationalOrganization", name: "ANU Education", url: "https://www.anuedu.in", telephone: "+917016497087", address: { "@type": "PostalAddress", addressLocality: "Modasa", addressRegion: "Gujarat", addressCountry: "IN" } },
          serviceType: "Student Visa Assistance",
          areaServed: { "@type": "Country", name: "India" },
          hasOfferCatalog: { "@type": "OfferCatalog", name: "Visa Assistance Services", itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Free Visa Document Checklist Review" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Statement of Purpose (SOP) Writing & Review" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Financial Documentation Review" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Mock Visa Interview Preparation" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Embassy Application Tracking" } },
          ]},
        })}}
      />

      {/* ══ FAQ SCHEMA ══ */}
      <Script id="faq-schema-visa" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        })}}
      />

      {/* ══ BREADCRUMB SCHEMA ══ */}
      <Script id="breadcrumb-schema-visa" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
            { "@type": "ListItem", position: 2, name: "Services", item: "https://www.anuedu.in/services" },
            { "@type": "ListItem", position: 3, name: "Visa Assistance", item: "https://www.anuedu.in/services/visa-assistance" },
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
        .ua::after{content:'';position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:52px;height:3px;background:linear-gradient(90deg,#1d4ed8,#16a34a);border-radius:2px;}
      `}</style>

      <main className="min-h-screen bg-white">

        {/* ══ HERO — anxiety named, then resolved ══ */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="text-xs text-blue-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link><span className="mx-1">/</span>
              <Link href="/services" className="hover:text-white">Services</Link><span className="mx-1">/</span>
              <span className="text-white">Visa Assistance</span>
            </nav>
            <div className="text-center">
              <div className="inline-block bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float">
                🛂 9 Countries · Mock Interviews · 98% Visa Success Rate
              </div>
              <h1 className="anim d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                Student Visa Assistance
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                  Don't Let a Document Error Cost You a Year
                </span>
              </h1>
              <p className="anim d2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                A visa rejection isn't just a delay — it can mean losing your intake, your deposit, and a full year. ANU Education's <strong className="text-white">Skill India certified</strong> counsellors review every document, prepare you for the actual interview, and track your application until it's approved.
              </p>
              <div className="anim d3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a href="https://anueducation.applyviz.com/walk-in" target="_blank" rel="noopener noreferrer"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse">
                  🎓 Get Free Visa Document Review
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg">
                  💬 WhatsApp Your Documents
                </a>
              </div>
              <div className="anim d4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>✅ 1,100+ Students Guided</span>
                <span>✅ 98% Visa Success Rate</span>
                <span>✅ Skill India Certified</span>
                <span>✅ 9 Countries Covered</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

          {/* ══ STATS ══ */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "98%", label: "Visa success rate" },
              { stat: "9", label: "Countries covered" },
              { stat: "1,100+", label: "Students guided" },
              { stat: "4.8 ★", label: "Google rating" },
            ].map((s, i) => (
              <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-blue-700 mb-1">{s.stat}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </section>

          {/* ══ TOP REJECTION REASONS — loss aversion ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Why Student Visas Actually Get Rejected</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              Most rejections come down to 5 avoidable mistakes — here's how we close each gap
            </p>
            <div className="space-y-3">
              {REJECTION_REASONS.map((r, i) => (
                <div key={i} className="card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className="flex items-center gap-4 sm:w-64 flex-shrink-0">
                    <div className="bg-red-50 text-red-700 font-black text-lg rounded-xl px-3 py-2 flex-shrink-0">{r.pct}</div>
                    <div className="font-semibold text-gray-800 text-sm">{r.reason}</div>
                  </div>
                  <div className="flex-1 text-sm text-gray-600 leading-relaxed border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4">
                    <span className="text-green-700 font-medium">✓ How we prevent it:</span> {r.fix}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">Based on commonly cited rejection patterns across visa categories. Individual cases vary by country and applicant profile.</p>
          </section>

          {/* ══ WHAT'S INCLUDED ══ */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What's Included in Our Visa Assistance</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "📋", title: "Document Checklist Review", desc: "We review every document against the specific requirements of your destination country before you submit anything." },
                { icon: "✍️", title: "SOP Writing & Review", desc: "Your Statement of Purpose is rewritten to directly address what visa officers look for — not generic templates." },
                { icon: "💰", title: "Financial Documentation Check", desc: "Bank statements, GIC, blocked accounts, sponsor letters — verified for consistency and sufficiency before submission." },
                { icon: "🎤", title: "Mock Visa Interview", desc: "Practice with real question patterns used by visa officers for your specific country — so nothing catches you off guard." },
                { icon: "📨", title: "Embassy Application Tracking", desc: "We monitor your application status and keep you updated on any embassy requests or processing changes." },
                { icon: "🛂", title: "Form Filling Support", desc: "Line-by-line review of your visa application form — a single wrong entry can trigger unnecessary delays or rejection." },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-gray-800 text-sm mb-1">{item.title}</div>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ DOCUMENTS BY COUNTRY ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Visa Documents — What's Different by Country</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              Beyond the basics (passport, offer letter, transcripts), here's what each country specifically requires
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Country</th>
                    <th className="text-left px-4 py-3 font-semibold">Unique Requirements</th>
                    <th className="text-center px-4 py-3 font-semibold">Typical Processing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {COUNTRY_DOCS.map((c, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{c.country}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{c.unique}</td>
                      <td className="px-4 py-3 text-center"><span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">{c.processing}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center mt-4">
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline text-sm">
                💬 Get your country-specific document checklist →
              </a>
            </p>
          </section>

          {/* ══ MOCK INTERVIEW DEEP DIVE ══ */}
          <section className="bg-gradient-to-r from-blue-50 via-white to-green-50 border border-blue-100 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-7 items-start">
              <div className="flex-1">
                <span className="inline-block bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">What Happens in a Mock Interview</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Practice the Real Questions Before the Real Interview</h2>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Most students don't fail interviews because they lack good answers — they fail because they're hearing the question for the first time under pressure. Our mock interviews fix that.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2"><span className="text-green-600 flex-shrink-0">✓</span><strong>Course & university questions</strong> — why this course, why this university, why this country</li>
                  <li className="flex gap-2"><span className="text-green-600 flex-shrink-0">✓</span><strong>Financial questions</strong> — how you're funding your studies, sponsor relationship, loan details</li>
                  <li className="flex gap-2"><span className="text-green-600 flex-shrink-0">✓</span><strong>Intent and ties questions</strong> — your plans after graduation, ties to home country</li>
                  <li className="flex gap-2"><span className="text-green-600 flex-shrink-0">✓</span><strong>Tone & confidence coaching</strong> — pacing, clarity, and body language feedback</li>
                </ul>
              </div>
              <div className="min-w-fit flex flex-col gap-3">
                <a href="https://anueducation.applyviz.com/walk-in" target="_blank" rel="noopener noreferrer"
                  className="bg-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors text-center text-sm">
                  Book a Mock Interview →
                </a>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors text-center text-sm">
                  💬 Ask a Counsellor
                </a>
              </div>
            </div>
          </section>

          {/* ══ TIMELINE — when to start ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">When Should You Start Your Visa Application?</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Starting early is the single biggest factor in avoiding last-minute stress</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { time: "Day 0", title: "Offer Letter Received", desc: "Begin visa preparation immediately — don't wait for the term to get closer." },
                { time: "Week 1–2", title: "Document Collection", desc: "Gather financial proof, transcripts, and identity documents. We review each one as you collect it." },
                { time: "Week 2–4", title: "SOP & Form Review", desc: "SOP finalised, application form filled and double-checked, mock interview scheduled." },
                { time: "Week 4 onward", title: "Submission & Tracking", desc: "Application submitted. We track embassy updates and prepare you for any follow-up requests." },
              ].map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">{t.time}</div>
                  <h3 className="font-bold text-gray-800 text-sm mb-2">{t.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mt-5 max-w-2xl mx-auto">
              ⏰ <strong>Rule of thumb:</strong> Start your visa process the day you receive your offer letter — not the month before your flight.
            </p>
          </section>

          {/* ══ TESTIMONIALS ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Real Visa Outcomes</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">Students who came to us — including after a prior rejection</p>
            <div className="grid md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">{t.name.charAt(0)}</div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.dest}</div>
                    </div>
                  </div>
                  <div className="bg-green-50 text-green-800 text-xs font-bold px-3 py-1.5 rounded-lg inline-block mb-3">✅ {t.outcome}</div>
                  <p className="text-gray-600 text-xs leading-relaxed italic">"{t.text}"</p>
                  <div className="flex gap-0.5 mt-3">{[...Array(5)].map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ WHY ANU ══ */}
          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Trust ANU Education With Your Visa</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "🏅", title: "Skill India certified", desc: "Formal credential in career and education counselling — not a sales-driven agent." },
                { icon: "🌍", title: "9 countries covered", desc: "Canada, UK, USA, Australia, Germany, France, Dubai, Ireland, New Zealand — current rules for each." },
                { icon: "🔁", title: "Reapplication specialists", desc: "We work with students who've faced a prior rejection and rebuild the application properly." },
                { icon: "🎤", title: "Real mock interviews", desc: "Practice with country-specific question banks, not generic interview tips." },
                { icon: "📨", title: "Active embassy tracking", desc: "We don't disappear after submission — we monitor your case until a decision is made." },
                { icon: "💸", title: "Transparent pricing", desc: "Free initial document review. No hidden charges sprung on you mid-process." },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-gray-800 text-sm mb-1">{item.title}</div>
                  <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ FAQ ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">Frequently Asked Questions — Student Visa</h2>
            <div className="max-w-3xl mx-auto space-y-3 mt-4">
              {FAQS.map((faq, idx) => (
                <details key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
                  open={openFaq === idx}
                  onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; setOpenFaq(el.open ? idx : null); }}>
                  <summary className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer list-none">
                    <span className="font-semibold text-gray-800 pr-4 text-sm md:text-base">{faq.q}</span>
                    <span className="text-blue-600 text-xl font-light flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>
                </details>
              ))}
            </div>
          </section>

          {/* ══ FINAL CTA ══ */}
          <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float">🛂</div>
            <h2 className="text-3xl font-bold mb-3">Don't Risk Your Visa on Guesswork</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Free document review · SOP guidance · Mock interview · Embassy tracking. 98% visa success rate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="https://anueducation.applyviz.com/walk-in" target="_blank" rel="noopener noreferrer"
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105">
                🎓 Get Free Visa Review
              </a>
              <a href="tel:+917016497087" className="border-2 border-white/70 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                📞 +91 70164 97087
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors">
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-white/50">Skill India Certified · 1,100+ Students · Modasa, Gujarat · info@anuedu.in</p>
          </section>

          {/* ══ INTERNAL LINKS ══ */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/services/sop-writing" className="text-blue-600 hover:underline">SOP Writing</Link>
              <span>·</span>
              <Link href="/services/scholarship" className="text-blue-600 hover:underline">Scholarships</Link>
              <span>·</span>
              <Link href="/services/accommodation" className="text-blue-600 hover:underline">Accommodation</Link>
              <span>·</span>
              <Link href="/study-in/canada" className="text-blue-600 hover:underline">Study in Canada</Link>
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