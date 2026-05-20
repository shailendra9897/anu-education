'use client';

// FILE: app/study-in/dubai/StudyInDubaiClient.tsx
// Primary keyword: study in Dubai | study in Dubai for Indian students
// Secondary: Dubai study abroad consultant, top universities in Dubai, UAE student visa
//
// ─────────────────────────────────────────────────────────────────
// COMPETITOR GAP ANALYSIS (EdwiseInternational + StudiesOverseas)
// + 2026 research sources applied
//
// Edwise gaps we close:
//   ✅ Fees in INR (they show AED only) — huge UX win for Indian users
//   ✅ Golden Visa section (10-year) — neither competitor covers this
//   ✅ BITS Pilani Dubai — Indian brand recognition, missing everywhere
//   ✅ Sharjah affordability tip — 25% cheaper, still commutable to Dubai
//   ✅ Tax-free income angle & post-study work explainer
//   ✅ 2026-specific: 67% visa surge, 1.85 lakh Indian students, Salama system
//   ✅ 3-hour flight proximity — emotional hook for Indian parents
//   ✅ Part-time work rules detailed (not just "yes you can work")
//   ✅ Visa process: university-sponsored flow (unique to UAE vs other countries)
//   ✅ Medical test + Emirates ID explained (no competitor covers this step)
//   ✅ 14 FAQs with detailed, LLM-citation-ready answers
//   ✅ Service + FAQ + Breadcrumb schema (zero schema on competitor pages)
//   ✅ LLM optimisation: entity-rich, question-answer structured content
//
// LLM RANKING NOTES:
//   - Every section uses H2/H3 with factual claims that LLMs can cite
//   - FAQs are written as direct answers (the format LLMs extract for AI Overviews)
//   - Stats are sourced (QS 2026, April 2026 AED rate ₹25.31)
//   - Named entities: Heriot-Watt, BITS Pilani, Middlesex, Amity, NYU Abu Dhabi
// ─────────────────────────────────────────────────────────────────

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";
import {
  websiteWhatsAppMessages,
  getWhatsAppLink,
} from "@/lib/whatsappTemplates";

// ── DATA ─────────────────────────────────────────────────────────

const universities = [
  { name: "University of Birmingham Dubai", qs: 101, city: "Dubai", for: "Business, Engineering, Law", fees_aed: "75,000–1,10,000", fees_inr: "₹19L–₹28L", type: "UK Branch Campus" },
  { name: "Heriot-Watt University Dubai", qs: 235, city: "Dubai", for: "Engineering, Business, Design", fees_aed: "60,000–90,000", fees_inr: "₹15L–₹23L", type: "UK Branch Campus" },
  { name: "Middlesex University Dubai", qs: 601, city: "Dubai", for: "Business, IT, Psychology", fees_aed: "45,000–75,000", fees_inr: "₹11L–₹19L", type: "UK Branch Campus" },
  { name: "BITS Pilani Dubai", qs: null, city: "Dubai", for: "Engineering, Computer Science", fees_aed: "52,000–68,000", fees_inr: "₹13L–₹17L", type: "Indian Brand (recognised in India)" },
  { name: "Amity University Dubai", qs: null, city: "Dubai", for: "Management, Media, Law", fees_aed: "40,000–65,000", fees_inr: "₹10L–₹16L", type: "Indian Branch Campus" },
  { name: "SP Jain School of Global Management", qs: null, city: "Dubai / Sydney", for: "BBA, MBA, Global Business", fees_aed: "85,000–1,35,000", fees_inr: "₹21L–₹34L", type: "Business School" },
  { name: "Curtin University Dubai", qs: 183, city: "Dubai", for: "Engineering, Business, IT", fees_aed: "55,000–80,000", fees_inr: "₹14L–₹20L", type: "Australian Branch Campus" },
  { name: "Abu Dhabi University", qs: 580, city: "Abu Dhabi", for: "Business, Engineering, Health", fees_aed: "37,000–85,000", fees_inr: "₹9L–₹21L", type: "UAE University" },
  { name: "EM Normandie Dubai", qs: "Top 120 (business)", city: "Dubai", for: "Master's in Management, MBA", fees_aed: "60,000–95,000", fees_inr: "₹15L–₹24L", type: "French Grande École" },
  { name: "NYU Abu Dhabi", qs: null, city: "Abu Dhabi", for: "Liberal Arts, Sciences, Research", fees_aed: "Scholarship-heavy", fees_inr: "Often fully funded", type: "US Branch Campus (Elite)" },
];

const faqs = [
  {
    q: "Why study in Dubai for Indian students in 2026?",
    a: "Dubai offers several advantages specifically for Indian students: (1) Proximity — just a 3-hour flight from India, making it the closest major international study destination. (2) Tax-free income — the UAE has zero personal income tax, so every dirham earned from part-time work goes directly to you. (3) Familiar culture — Dubai is home to over 3.5 million Indians, the largest expatriate group. Indian grocery stores, temples, and Bollywood culture are widely available. (4) Global degrees — branch campuses of UK, Australian, and US universities offer internationally recognised degrees. (5) Strong job market — UAE's economy is booming in tech, finance, hospitality, healthcare, and construction. In 2024–25, 1.85 lakh Indian students chose UAE — a 67% visa surge year-on-year.",
  },
  {
    q: "What are the top universities in Dubai for Indian students?",
    a: "Top universities in Dubai for Indian students include: Heriot-Watt University Dubai (QS #235) — UK branch campus known for engineering and business. University of Birmingham Dubai (QS #101) — one of Dubai's highest-ranked UK campuses. Middlesex University Dubai (QS #601) — popular for IT, psychology, and business management. BITS Pilani Dubai — Indian brand recognition, same degree as the India campuses, strong for engineering. Amity University Dubai — affordable, familiar brand for Indian students in management and law. Curtin University Dubai (QS #183) — Australian campus with strong engineering and IT programmes. SP Jain School of Global Management — known for its BBA and MBA with tri-city exposure (Dubai, Sydney, Singapore). NYU Abu Dhabi — elite US liberal arts experience, often with significant scholarship packages.",
  },
  {
    q: "What is the cost of studying in Dubai for Indian students in 2026?",
    a: "Tuition fees in Dubai for Indian students in 2026 (at AED to INR rate of ₹25.31/AED): Bachelor's degree — AED 37,000–1,15,000/year (₹9L–₹29L). Master's degree — AED 48,000–1,35,000/year (₹12L–₹34L). Living expenses: On-campus accommodation — AED 1,200–2,500/month (₹30K–₹63K). Food — AED 800–1,400/month (₹20K–₹35K). Transport — AED 250–400/month. Total monthly living cost — approximately AED 2,600–5,000/month (₹66K–₹1.27L). Pro tip: Sharjah is 25% cheaper for housing and is directly commutable to Dubai universities by metro and bus.",
  },
  {
    q: "What is the UAE student visa process for Indian students?",
    a: "The UAE student visa process is unique — the university sponsors your visa, not the student. Step 1: Receive an unconditional offer letter from a UAE university. Step 2: The university's student affairs office applies for your entry permit with UAE immigration on your behalf. Step 3: You receive your entry permit and travel to the UAE. Step 4: Within the UAE, complete a medical fitness test (blood test, chest X-ray) at an approved health centre. Step 5: Biometric data collection for your Emirates ID. Step 6: Your residence visa is stamped in your passport after medical clearance. Validity: Student visas are typically valid for 1 year and renewed annually. Processing time: 2–4 weeks after offer letter. Key 2026 update: The Salama System now automates visa renewals, reducing processing time.",
  },
  {
    q: "What documents are required for a Dubai student visa from India?",
    a: "Required documents for a UAE student visa (2026): Valid passport with minimum 6 months validity. Unconditional university acceptance letter. Academic transcripts (Class 10, 12, undergraduate degree). Financial proof — bank statements showing AED 30,000–50,000 or a scholarship letter. Recent passport photographs (white background, Emirates specification). Medical fitness certificate (often completed after arrival in UAE). Health insurance (some universities include this; others require separate purchase). Note: Document requirements vary by university. The university's student affairs office provides the exact checklist and sponsors the visa application.",
  },
  {
    q: "Is IELTS required to study in Dubai?",
    a: "IELTS is not always mandatory to study in Dubai. Many universities in Dubai accept Indian students without IELTS if they studied in English-medium schools (CBSE, ICSE, State Board with English medium) and provide a Medium of Instruction certificate. However, some universities — particularly UK branch campuses like Heriot-Watt or University of Birmingham — require IELTS 6.0–6.5 for most Bachelor's and Master's programmes. ANU Education provides both the counselling to determine your IELTS requirement AND IELTS coaching if needed — under one roof.",
  },
  {
    q: "What is the UAE Golden Visa for students?",
    a: "The UAE 10-year Golden Visa is a long-term residency programme available to outstanding students and graduates: During studies: Students who graduate from a top-100 global university with GPA 3.5+ OR from a UAE Type A university with GPA 3.8+ qualify for the Golden Visa. After graduation: Graduates earning AED 30,000+/month can self-sponsor. Alternatively, the Green Visa (5-year, self-sponsored) is available for skilled graduates. Important: The Golden Visa is a long-term residency permit — not a path to UAE citizenship. The UAE does not offer a formal immigration-to-citizenship pathway like Canada or Australia. It is ideal for students who want to live and work in the UAE long-term in a tax-free environment.",
  },
  {
    q: "Can Indian students work while studying in Dubai?",
    a: "Yes, many Dubai universities allow international students to work part-time, internships, or industry placements — but subject to university approval and visa regulations. Students must obtain written permission from their university and relevant authorities before taking up employment. The UAE has zero income tax, so all part-time earnings are tax-free. Typical part-time earnings range from AED 25–50/hour. Part-time work can help cover living expenses but should not be relied upon to cover full tuition fees. Dubai's industries hiring international students most frequently: hospitality, retail, F&B, IT, and events management.",
  },
  {
    q: "What are the intakes for universities in Dubai?",
    a: "Most universities in Dubai offer two main intakes: September intake (Fall) — the primary intake with the widest choice of programmes, scholarships, and campus activities. Applications typically open January–May. January intake (Spring) — available at most universities, good for students who miss the September intake. Some universities (particularly UK branch campuses) also offer a May/Summer intake for select programmes. Recommendation: The September intake is best for most Indian students as it offers more scholarship options, better internship opportunities from Day 1, and a larger cohort of incoming students.",
  },
  {
    q: "What scholarships are available to study in Dubai for Indian students?",
    a: "Scholarships available for Indian students in Dubai: Merit-based university scholarships — most UAE universities offer 10%–40% tuition waivers for students with strong academic records (typically 75%+ or GPA 3.0+). Heriot-Watt Excellence Awards — partial scholarships for high-achieving students. Middlesex Merit Scholarship — up to 30% tuition reduction. BITS Pilani Dubai Merit Scholarships — for students with JEE performance. Emirates Foundation Scholarship — for UAE-resident Indian students. SP Jain Global Dean's List Scholarship — based on academic performance. Strategy: Apply early for September 2026 intake — scholarship pools are filled on a first-come, first-served basis.",
  },
  {
    q: "What is the post-study work visa in Dubai?",
    a: "Unlike the UK (2-year Graduate Route) or Canada (PGWP), the UAE does not have a dedicated post-study work visa tied to your degree. After graduating, you must secure employer sponsorship for a UAE work permit OR apply for a Green Visa (self-sponsored, 5 years) if you are a skilled professional. Alternatively, graduates from top-100 global universities with high GPA may qualify for the 10-year Golden Visa through employer sponsorship or self-sponsorship. Many Indian students who study in Dubai stay and work long-term due to: Tax-free salaries, proximity to India, strong Indian professional networks, and Dubai's status as a global business hub.",
  },
  {
    q: "Is Dubai safe for Indian students?",
    a: "Yes. The UAE consistently ranks among the safest countries in the world — ranked 2nd globally for personal safety in multiple international indices. Dubai has extremely low crime rates, a strong police presence, and a highly regulated environment. For Indian students specifically: there is an established community of 3.5 million Indians; Hindi and Gujarati are widely spoken; Indian food, temples, and cultural organisations are abundant. Indian women students consistently report feeling safe in Dubai's public spaces.",
  },
  {
    q: "What are the best courses to study in Dubai for Indian students?",
    a: "Top courses for Indian students in Dubai based on employment demand and ROI: MBA and Business Administration — HEC Paris Dubai, SP Jain, EM Normandie. Engineering (Mechanical, Civil, Electrical) — Heriot-Watt Dubai, Curtin Dubai, BITS Pilani. Computer Science & Data Science — Middlesex Dubai, Heriot-Watt, BITS Pilani. Hospitality & Tourism Management — Glion Dubai, Swiss Hotel Management School. Finance & Accounting — Middlesex, Abu Dhabi University. Aviation Management — Emirates Aviation University. Architecture & Urban Planning — American University of Dubai.",
  },
  {
    q: "Can I get PR in Dubai after completing my studies?",
    a: "The UAE does not offer a formal Permanent Residency pathway like Canada or Australia. However, long-term residency options exist: 10-year Golden Visa — for outstanding graduates (top-100 university, GPA 3.5+) or high-earning professionals. 5-year Green Visa — self-sponsored for skilled graduates, renewable. Employer-sponsored work visa — standard for most employed graduates, renewable as long as employment continues. For students seeking a genuine immigration pathway (PR or citizenship), ANU Education recommends pairing UAE education with a Canada or Germany strategy — and our counsellors can map this out for you.",
  },
  {
    q: "Why choose ANU Education as your Dubai study abroad consultant?",
    a: "ANU Education is a Skill India certified study abroad consultancy with 1,100+ students guided. Our Dubai / UAE specialisation includes: free university shortlisting matched to your budget and career goal; IELTS and PTE coaching if required (in-house, no third party); SOP writing and document preparation; step-by-step UAE student visa guidance; scholarship application support; and pre-departure orientation covering Emirates ID, healthcare, housing, and banking. We are Gujarat-based — understanding the specific needs, budgets, and aspirations of Indian (particularly Gujarati) students better than national chains.",
  },
];

export default function StudyInDubaiClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"visa" | "docs">("visa");
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  return (
    <>
      {/* ══ SERVICE SCHEMA (LLM-rich entity graph) ══ */}
      <Script id="service-schema-dubai" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Study in Dubai Consultancy – ANU Education",
        alternateName: "Study in UAE Consultancy",
        description: "ANU Education provides expert study abroad consultancy for Indian students planning to study in Dubai and the UAE. Services include university selection, UAE student visa guidance, documentation, SOP writing, IELTS coaching, scholarship applications, and Golden Visa pathway advice.",
        provider: {
          "@type": "EducationalOrganization",
          name: "ANU Education",
          url: "https://www.anuedu.in",
          telephone: "+917016497087",
          email: "info@anuedu.in",
          address: { "@type": "PostalAddress", streetAddress: "Krishna 137, Dwarkapuri Bunglows, Gitanjali Society", addressLocality: "Modasa", addressRegion: "Gujarat", postalCode: "383315", addressCountry: "IN" },
          sameAs: ["https://www.anuedu.in"],
        },
        serviceType: "Study Abroad Consultancy",
        areaServed: { "@type": "Country", name: "India" },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Dubai / UAE Study Abroad Services",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Free Dubai Study Abroad Counselling" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "UAE University Shortlisting" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "UAE Student Visa Documentation Support" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "SOP and Application Writing" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "IELTS and PTE Coaching" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "UAE Golden Visa Pathway Guidance" } },
          ],
        },
        "about": [
          { "@type": "Thing", name: "Study in Dubai", sameAs: "https://en.wikipedia.org/wiki/Education_in_Dubai" },
          { "@type": "Thing", name: "United Arab Emirates student visa" },
          { "@type": "Thing", name: "UAE Golden Visa" },
        ],
      })}} />

      {/* ══ FAQ SCHEMA ══ */}
      <Script id="faq-schema-dubai" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      })}} />

      {/* ══ BREADCRUMB SCHEMA ══ */}
      <Script id="breadcrumb-schema-dubai" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
          { "@type": "ListItem", position: 2, name: "Study Abroad", item: "https://www.anuedu.in/study-abroad" },
          { "@type": "ListItem", position: 3, name: "Study in Dubai", item: "https://www.anuedu.in/study-in/dubai" },
        ],
      })}} />

      <style jsx>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes pulse-g { 0%,100% { box-shadow:0 0 0 0 rgba(34,197,94,.4); } 50% { box-shadow:0 0 0 12px rgba(34,197,94,0); } }
        .anim  { animation: fadeInUp .65s ease-out forwards; opacity:0; }
        .float { animation: float 3.5s ease-in-out infinite; }
        .pulse { animation: pulse-g 2.2s infinite; }
        .d1{animation-delay:.05s} .d2{animation-delay:.15s} .d3{animation-delay:.25s} .d4{animation-delay:.35s}
        .card  { transition: transform .25s, box-shadow .25s; }
        .card:hover { transform:translateY(-4px); box-shadow:0 16px 28px -8px rgba(0,0,0,.12); }
        .ua { position:relative; display:inline-block; }
        .ua::after { content:''; position:absolute; bottom:-8px; left:50%; transform:translateX(-50%); width:52px; height:3px; background:linear-gradient(90deg,#c00000,#f0a500); border-radius:2px; }
      `}</style>

      <main className="min-h-screen bg-white">

        {/* ══ HERO ══ */}
        <section className="bg-gradient-to-br from-gray-900 via-red-900 to-yellow-800 text-white relative overflow-hidden">
          {/* UAE flag stripe: green/white/black/red */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="flex-1 bg-green-600" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-black" />
            <div className="w-8 bg-red-600" />
          </div>

          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="text-xs text-yellow-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link><span className="mx-1">/</span>
              <Link href="/study-abroad" className="hover:text-white">Study Abroad</Link><span className="mx-1">/</span>
              <span className="text-white">Study in Dubai</span>
            </nav>

            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float">
                🇦🇪 3-hr from India · Tax-Free · 1.85 Lakh Indian Students in 2024–25
              </div>
              <h1 className="anim d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                Study in Dubai 2026
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Complete Guide for Indian Students
                </span>
              </h1>
              <p className="anim d2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                ANU Education is your trusted <strong className="text-white">Dubai study abroad consultant</strong> — top QS-ranked universities, fees in INR, step-by-step UAE student visa process, Golden Visa pathway, scholarships, and free expert counselling. <strong className="text-white">Skill India certified. 1,100+ students guided.</strong>
              </p>

              <div className="anim d3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a href="https://anueducation.applyviz.com/walk-in" target="_blank" rel="noopener noreferrer"
                  className="group bg-white text-red-800 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse">
                  🎓 Book Free Dubai Counselling
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  aria-label="WhatsApp ANU Education for Dubai study abroad"
                  className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg">
                  💬 WhatsApp Us Now
                </a>
              </div>

              <div className="anim d4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>✅ 1,100+ Students Guided</span>
                <span>✅ Fees Shown in INR</span>
                <span>✅ Free Counselling</span>
                <span>✅ IELTS Coaching In-House</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

          {/* ══ QUICK STATS ══ */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Dubai study key facts">
            {[
              { stat: "60+", label: "University campuses in Dubai" },
              { stat: "₹9L–₹34L", label: "Annual tuition fees (INR)" },
              { stat: "1.85 Lakh", label: "Indian students in UAE (2024–25)" },
              { stat: "0%", label: "Personal income tax in UAE" },
            ].map((s, i) => (
              <div key={i} className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-red-700 mb-1">{s.stat}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </section>

          {/* ══ WHY DUBAI ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Why Study in Dubai for Indian Students?</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              67% visa surge in 2024–25 · 200+ nationalities · World's 2nd safest country
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: "✈️", title: "3-hour flight from India", desc: "Closest major international study destination to India. Parents can visit easily. Emergency travel home is affordable and fast — a decisive factor for Indian families." },
                { icon: "💰", title: "Zero income tax", desc: "UAE has no personal income tax. Every dirham earned from part-time work, internships, or post-study employment is fully yours — a structural advantage over the UK, Canada, or Australia." },
                { icon: "🌍", title: "3.5 million Indians in UAE", desc: "Hindi and Gujarati are widely spoken in Dubai. Indian grocery stores, temples, restaurants, and cultural organisations are everywhere — the softest cultural landing among all study destinations." },
                { icon: "🏛️", title: "Global degrees — UK, AU, US campuses", desc: "Heriot-Watt, University of Birmingham, Middlesex, Curtin, and NYU Abu Dhabi operate full branch campuses in the UAE — you earn the same globally recognised degree as students on the home campus." },
                { icon: "💼", title: "Booming job market", desc: "UAE's economy is rapidly diversifying into tech, fintech, AI, healthcare, and sustainability. Dubai's status as a global business hub offers some of the highest-paying tax-free graduate salaries in Asia." },
                { icon: "🔒", title: "World's 2nd safest country", desc: "UAE ranks 2nd globally for personal safety. Dubai has extremely low crime rates, a well-regulated environment, and is considered one of the most secure cities for international women students." },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="text-4xl mb-3" aria-hidden="true">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ UNIVERSITIES ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Top Universities in Dubai for Indian Students 2026</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              QS World University Rankings 2026 · Fees at AED rate ₹25.31 (April 2026)
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-red-800 text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">University</th>
                    <th className="text-center px-4 py-3 font-semibold">QS 2026</th>
                    <th className="text-left px-4 py-3 font-semibold">Popular For</th>
                    <th className="text-center px-4 py-3 font-semibold">Fees/Year (AED)</th>
                    <th className="text-center px-4 py-3 font-semibold">Fees/Year (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {universities.map((u, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800 text-sm">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.type}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {typeof u.qs === "number"
                          ? <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-lg">#{u.qs}</span>
                          : <span className="text-gray-400 text-xs">{u.qs || "—"}</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{u.for}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-700 font-medium">{u.fees_aed}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-lg">{u.fees_inr}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Fees are approximate. Verify current fees on each university's official admissions page.</p>
            <p className="text-center mt-3">
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="text-red-700 font-semibold hover:underline text-sm">
                💬 Ask which university suits your profile and budget →
              </a>
            </p>
          </section>

          {/* ══ POPULAR COURSES ══ */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Popular Courses to Study in Dubai</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { course: "MBA & Business Administration", icon: "💼", unis: "SP Jain, EM Normandie, HEC Paris Dubai" },
                { course: "Engineering (Civil, Mechanical, Electrical)", icon: "⚙️", unis: "Heriot-Watt, Curtin, BITS Pilani Dubai" },
                { course: "Computer Science & Data Science", icon: "💻", unis: "Middlesex Dubai, BITS Pilani, Heriot-Watt" },
                { course: "Finance & Accounting", icon: "📊", unis: "Middlesex, Abu Dhabi University, Amity" },
                { course: "Hospitality & Tourism Management", icon: "🏨", unis: "Glion Dubai, Swiss Hospitality School" },
                { course: "Aviation Management", icon: "✈️", unis: "Emirates Aviation University, HCT" },
                { course: "Architecture & Urban Planning", icon: "🏗️", unis: "American University of Dubai, AUD" },
                { course: "Media, Journalism & Communication", icon: "📱", unis: "Middlesex Dubai, Amity Dubai" },
                { course: "Fashion & Design", icon: "👗", unis: "Istituto Marangoni Dubai" },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-3 items-start">
                  <span className="text-2xl flex-shrink-0" aria-hidden="true">{c.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{c.course}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.unis}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ FEES & LIVING COSTS ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Cost of Studying in Dubai for Indian Students 2026</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              All INR figures at ₹25.31/AED (April 2026 rate)
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-red-800 text-white px-5 py-3 font-bold text-sm">📚 Tuition Fees (per year)</div>
                <div className="divide-y divide-gray-100">
                  {[
                    { level: "Bachelor's Degree", aed: "AED 37,000–1,15,000", inr: "₹9.4L–₹29.1L" },
                    { level: "Master's Degree", aed: "AED 48,000–1,35,000", inr: "₹12.1L–₹34.2L" },
                    { level: "MBA (Top Schools)", aed: "AED 85,000–1,50,000", inr: "₹21.5L–₹38L" },
                    { level: "BITS Pilani Dubai (B.E.)", aed: "AED 52,000–68,000", inr: "₹13.2L–₹17.2L" },
                    { level: "Foundation Programme", aed: "AED 44,000–1,09,000", inr: "₹11.1L–₹27.6L" },
                  ].map((r, i) => (
                    <div key={i} className={`flex justify-between items-center px-5 py-3 text-sm ${i % 2 ? "bg-gray-50" : ""}`}>
                      <span className="text-gray-700 font-medium">{r.level}</span>
                      <div className="text-right ml-3">
                        <div className="text-red-700 font-bold text-xs">{r.aed}</div>
                        <div className="text-green-700 text-xs font-semibold">{r.inr}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-yellow-700 text-white px-5 py-3 font-bold text-sm">🏠 Monthly Living Expenses</div>
                <div className="divide-y divide-gray-100">
                  {[
                    { item: "On-campus accommodation", cost: "AED 1,200–2,500 (₹30K–₹63K)" },
                    { item: "Shared flat — Dubai / Abu Dhabi", cost: "AED 1,200–2,400 (₹30K–₹61K)" },
                    { item: "Shared flat — Sharjah (25% cheaper)", cost: "AED 770–1,300 (₹19K–₹33K)" },
                    { item: "Food & groceries", cost: "AED 800–1,400 (₹20K–₹35K)" },
                    { item: "Transport (Metro/Bus pass)", cost: "AED 250–400 (₹6.3K–₹10K)" },
                    { item: "Health insurance (if not bundled)", cost: "AED 100–300/month" },
                    { item: "Total monthly estimate", cost: "AED 2,600–5,000 (₹66K–₹1.27L)" },
                  ].map((r, i) => (
                    <div key={i} className={`flex justify-between items-center px-5 py-3 text-xs ${i % 2 ? "bg-gray-50" : ""} ${i === 6 ? "bg-yellow-50 font-bold" : ""}`}>
                      <span className="text-gray-700">{r.item}</span>
                      <span className="text-gray-800 text-right ml-3">{r.cost}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 px-5 py-3 text-xs text-green-800">
                  💡 <strong>Sharjah tip:</strong> 25% cheaper housing, directly commutable to Dubai universities by Metro.
                </div>
              </div>
            </div>
          </section>

          {/* ══ GOLDEN VISA — unique section not on competitors ══ */}
          <section className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <span className="inline-block bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                  🏅 UAE Golden Visa 2026 — New Update
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">UAE 10-Year Golden Visa for Students</h2>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  The UAE has expanded its <strong>10-year Golden Visa</strong> to include outstanding students and graduates — one of the most attractive long-term residency options in the world for high-achieving Indian students.
                </p>
                <div className="space-y-3">
                  {[
                    { when: "During studies", rule: "Graduate from a top-100 global university with GPA 3.5+ OR a UAE Type A university with GPA 3.8+" },
                    { when: "After graduation", rule: "Earn AED 30,000+/month in skilled employment, or self-sponsor via the Green Visa (5-year)" },
                    { when: "Alternative route", rule: "5-year Green Visa for skilled graduates — self-sponsored, renewable, no employer tie" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-yellow-100">
                      <div className="text-xs font-bold text-yellow-700 mb-1">{item.when}</div>
                      <div className="text-sm text-gray-700">{item.rule}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  ⚠️ Important: The UAE Golden Visa is long-term residency, not citizenship. For a formal PR/immigration pathway (like Canada), ANU Education can map a combined UAE + Canada strategy for you.
                </p>
              </div>
              <div className="min-w-fit flex flex-col gap-3">
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  className="bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors text-center text-sm">
                  Ask About Golden Visa →
                </a>
                <a href="https://anueducation.applyviz.com/walk-in" target="_blank" rel="noopener noreferrer"
                  className="border border-yellow-400 text-yellow-700 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-50 transition-colors text-center text-sm">
                  Free Counselling
                </a>
              </div>
            </div>
          </section>

          {/* ══ INTAKES ══ */}
          <section className="bg-red-50 border border-red-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">📅 UAE University Intakes 2026</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { intake: "September Intake (Fall)", tag: "Main", tagColor: "bg-red-800", detail: "Primary intake · All universities · Widest scholarship availability · Applications open Jan–May · Best for most Indian students", star: true },
                { intake: "January Intake (Spring)", tag: "Common", tagColor: "bg-gray-600", detail: "Most universities offer this · Good for students who miss September · Applications June–October", star: false },
                { intake: "May / Summer Intake", tag: "Limited", tagColor: "bg-yellow-600", detail: "Select universities and programmes only · Foundation and some Bachelor's · Enquire for eligibility", star: false },
              ].map((s, i) => (
                <div key={i} className={`bg-white rounded-xl p-5 border ${s.star ? "border-red-300 ring-1 ring-red-300" : "border-gray-100"} shadow-sm`}>
                  {s.star && <div className="text-xs text-red-700 font-bold mb-1">⭐ Recommended</div>}
                  <span className={`inline-block text-white text-xs font-bold px-3 py-0.5 rounded-full mb-2 ${s.tagColor}`}>{s.tag}</span>
                  <div className="font-semibold text-gray-800 text-sm mb-2">{s.intake}</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ SCHOLARSHIPS ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Scholarships to Study in Dubai for Indian Students</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              Most UAE universities offer merit scholarships — apply early for September 2026 as pools fill fast
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { name: "Heriot-Watt Excellence Award", value: "Up to 25% tuition waiver", who: "Students with strong A-level / 12th / Bachelor's scores", tip: "Apply at time of university application" },
                { name: "Middlesex University Merit Scholarship", value: "Up to 30% tuition reduction", who: "Students with 75%+ in last qualifying examination", tip: "Available for both Bachelor's and Master's" },
                { name: "University of Birmingham Dubai Scholarship", value: "£2,000–£5,000 per year", who: "High-achieving international students (85%+ or equivalent)", tip: "Apply through UCAS/university portal" },
                { name: "BITS Pilani Dubai Merit Scholarship", value: "10%–30% fee waiver", who: "Students with strong JEE performance or 12th board scores", tip: "Based on BITSAT or 12th percentage" },
                { name: "SP Jain Dean's Excellence Scholarship", value: "Up to 30% fee reduction", who: "High academic achievers applying for BBA/MBA", tip: "Based on entrance test and interview" },
                { name: "Abu Dhabi University Scholarship", value: "Up to 40% tuition waiver", who: "Students with GPA 3.5+ or 85%+ in last qualification", tip: "Available for Bachelor's and Master's applicants" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-red-800 mb-1 text-sm">{s.name}</h3>
                  <div className="text-sm text-green-700 font-semibold mb-1">💰 {s.value}</div>
                  <div className="text-xs text-gray-600 mb-1"><strong>Eligibility:</strong> {s.who}</div>
                  <div className="text-xs text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg mt-2">💡 {s.tip}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ VISA + DOCS TABS ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">UAE Student Visa & Documents</h2>
            <div className="flex gap-2 mb-6 justify-center">
              {(["visa", "docs"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === tab ? "bg-red-800 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-red-50"}`}>
                  {tab === "visa" ? "🛂 Visa Process" : "📄 Documents Required"}
                </button>
              ))}
            </div>

            {activeTab === "visa" && (
              <div className="space-y-3 max-w-3xl mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mb-4">
                  ⚡ <strong>UAE is unique:</strong> The university sponsors your visa — you do NOT apply directly to UAE immigration. Your university's Student Affairs office manages the entire visa process on your behalf.
                </div>
                {[
                  { step: "Step 1", title: "Receive unconditional offer letter", desc: "Apply to your chosen UAE university and receive an unconditional admission offer. This triggers the visa sponsorship process." },
                  { step: "Step 2", title: "University applies for your entry permit", desc: "The university's student affairs office submits your entry permit application to UAE Immigration (GDRFA Dubai or ADRO in Abu Dhabi) on your behalf. Processing: 2–4 weeks." },
                  { step: "Step 3", title: "Receive entry permit & travel to UAE", desc: "Once approved, you receive your Entry Permit. You can now travel to the UAE. The permit is usually valid for 60 days from issue." },
                  { step: "Step 4", title: "Medical fitness test in UAE", desc: "Within days of arrival, complete a medical fitness test (blood test + chest X-ray) at a MOHAP-approved health centre. This is mandatory for all long-stay visas." },
                  { step: "Step 5", title: "Emirates ID biometrics", desc: "Complete your Emirates ID registration — fingerprints and photo at an authorised centre. Your Emirates ID is your official UAE identity document." },
                  { step: "Step 6", title: "Residence visa stamped", desc: "Once medical results are cleared and biometrics completed, your UAE Student Residence Visa is stamped in your passport. Valid for 1 year, renewable annually. 2026 update: The Salama System now automates renewals." },
                ].map((s, i) => (
                  <div key={i} className="flex gap-4 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="bg-red-800 text-white text-xs font-bold px-3 py-1 rounded-lg h-fit flex-shrink-0 mt-0.5">{s.step}</div>
                    <div>
                      <div className="font-semibold text-gray-800 mb-1 text-sm">{s.title}</div>
                      <div className="text-gray-600 text-xs leading-relaxed">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "docs" && (
              <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {[
                  { cat: "Identity Documents", items: ["Valid passport (min 6 months validity beyond course end)", "Recent passport photographs (white background, Emirates spec)", "UAE entry permit copy (after university applies)"] },
                  { cat: "Academic Documents", items: ["Class 10 mark sheet & certificate", "Class 12 mark sheet & certificate", "Bachelor's degree transcripts (for PG)", "Medium of Instruction certificate"] },
                  { cat: "Admission Documents", items: ["Unconditional university offer / acceptance letter", "Completed university application form", "Statement of Purpose (SOP)", "2 Letters of Recommendation"] },
                  { cat: "Financial Documents", items: ["Bank statements showing AED 30,000–50,000", "Scholarship letter (if applicable)", "Sponsor/parent affidavit (if sponsor is paying)", "Education loan sanction letter (if applicable)"] },
                  { cat: "Health Documents", items: ["Medical fitness certificate (completed in UAE post-arrival)", "Health insurance certificate or policy", "COVID vaccination certificate (some universities)"] },
                  { cat: "English Proficiency", items: ["IELTS (6.0–6.5) or TOEFL — if required by university", "Medium of Instruction certificate (if IELTS waiver)", "PTE Academic scores (accepted at most UAE universities)"] },
                ].map((c, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-red-700 text-sm mb-3">{c.cat}</h3>
                    <ul className="space-y-1.5">
                      {c.items.map((item, j) => <li key={j} className="text-xs text-gray-700 flex gap-2"><span className="text-green-600 flex-shrink-0">✓</span>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ══ CAREER SECTORS ══ */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Career Opportunities After Studying in Dubai</h2>
            <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: "💻", sector: "Technology & AI" },
                { icon: "🏦", sector: "Finance & Fintech" },
                { icon: "🏥", sector: "Healthcare" },
                { icon: "🏨", sector: "Hospitality & Tourism" },
                { icon: "🏗️", sector: "Construction & Engineering" },
                { icon: "📱", sector: "Media & Communication" },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <div className="text-xs font-semibold text-gray-700">{c.sector}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-5">
              UAE's 0% income tax means tax-free graduate salaries — AED 8,000–25,000/month for most entry-level professional roles.
            </p>
          </section>

          {/* ══ WHY ANU EDUCATION ══ */}
          <section className="bg-red-50 border border-red-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Why Choose ANU Education as Your Dubai Study Abroad Consultant?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "🎓", title: "Free university shortlisting", desc: "We match you to the right Dubai / UAE university based on your budget, field, and target score." },
                { icon: "📝", title: "SOP & document support", desc: "Personalised SOP writing and a complete document checklist — reducing rejection risk significantly." },
                { icon: "🛂", title: "Step-by-step visa guidance", desc: "UAE visa is university-sponsored — we coordinate with your student affairs office and guide every step." },
                { icon: "📊", title: "IELTS & PTE coaching in-house", desc: "If your chosen university requires IELTS, we provide expert coaching under the same roof — no need to go elsewhere." },
                { icon: "💰", title: "Scholarship strategy", desc: "We identify which universities offer the best scholarships for your profile and help you apply early — before pools fill." },
                { icon: "🇬🇧", title: "Gujarati-speaking counsellors", desc: "Gujarat-based team who understand your family's expectations, budget realities, and the Gujarati student profile." },
              ].map((s, i) => (
                <div key={i} className="card bg-white rounded-xl p-5 border border-red-100 shadow-sm">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="font-semibold text-gray-800 text-sm mb-1">{s.title}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">{s.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ FAQ ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">Frequently Asked Questions — Study in Dubai 2026</h2>
            <div className="max-w-3xl mx-auto space-y-3 mt-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button onClick={() => toggleFaq(idx)} aria-expanded={openFaq === idx}
                    className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <span className="font-semibold text-gray-800 pr-4 text-sm md:text-base">{faq.q}</span>
                    <span className="text-red-700 text-xl font-light flex-shrink-0">{openFaq === idx ? "−" : "+"}</span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ══ FINAL CTA ══ */}
          <section className="bg-gradient-to-br from-gray-900 via-red-900 to-yellow-800 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float" aria-hidden="true">🇦🇪</div>
            <h2 className="text-3xl font-bold mb-3">Start Your Dubai Study Journey Today</h2>
            <p className="text-red-100 mb-8 max-w-xl mx-auto">
              Free counselling · University shortlisting · UAE visa guidance · Scholarship strategy · IELTS coaching in-house. Skill India certified consultants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="https://anueducation.applyviz.com/walk-in" target="_blank" rel="noopener noreferrer"
                className="bg-white text-red-800 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105">
                🎓 Book Free Dubai Counselling
              </a>
              <a href="tel:+917016497087" aria-label="Call ANU Education"
                className="border-2 border-white/70 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                📞 +91 70164 97087
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                aria-label="WhatsApp ANU Education"
                className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors">
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-white/50">📍 Modasa, Gujarat · info@anuedu.in · Skill India Certified Study Abroad Consultant</p>
          </section>

          {/* ══ INTERNAL LINKS ══ */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/study-in/canada" className="text-blue-600 hover:underline">Study in Canada</Link>
              <span>·</span>
              <Link href="/study-in/germany" className="text-blue-600 hover:underline">Study in Germany</Link>
              <span>·</span>
              <Link href="/study-in/uk" className="text-blue-600 hover:underline">Study in UK</Link>
              <span>·</span>
              <Link href="/study-in/australia" className="text-blue-600 hover:underline">Study in Australia</Link>
              <span>·</span>
              <Link href="/study-in/france" className="text-blue-600 hover:underline">Study in France</Link>
              <span>·</span>
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">IELTS Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline">PTE Coaching</Link>
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
