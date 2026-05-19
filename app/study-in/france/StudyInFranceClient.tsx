'use client';

// FILE: app/study-in/france/StudyInFranceClient.tsx
// Primary keyword: France study abroad consultant
// Secondary: study in France for Indian students, study abroad France, France student visa
// ────────────────────────────────────────────────────────────────────────────
// COMPETITOR GAP ANALYSIS vs EdugoAbroad & EdwiseInternational
//
// What they rank on that we now match or beat:
// ✅ Top 10 universities with QS rankings & specialisations
// ✅ Tuition fee tables (Master's, MBA, Bachelor's) in EUR + INR
// ✅ Living cost breakdown by city and category
// ✅ France student visa process — step-by-step (Campus France)
// ✅ Documents required list
// ✅ Scholarships section (Eiffel, Campus France, bilateral)
// ✅ Post-study work visa (2 years; 4 years for STEM)
// ✅ Intakes: September (main) + January (limited)
// ✅ Popular courses by field
// ✅ Career sectors in France
// ✅ 10 detailed FAQs
// ✅ All 3 schemas: Course, FAQ, BreadcrumbList
//
// ANU UNIQUE ADVANTAGE vs competitors:
// ✅ Free 5-day French language demo class — NO competitor offers this
// ✅ French TEF/TCF coaching integrated with study abroad counselling
// ✅ Skill India certified counsellor
// ✅ WhatsApp-first lead gen (key for Indian mobile users)
// ────────────────────────────────────────────────────────────────────────────

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";
import {
  websiteWhatsAppMessages,
  getWhatsAppLink,
} from "@/lib/whatsappTemplates";

const universities = [
  { name: "Université PSL", qs: 24, city: "Paris", for: "Physics, Sciences", type: "Research University" },
  { name: "Institut Polytechnique de Paris", qs: 38, city: "Palaiseau", for: "AI, Engineering", type: "Grande École" },
  { name: "Sorbonne University", qs: 59, city: "Paris", for: "International Law, Arts", type: "Research University" },
  { name: "Université Paris-Saclay", qs: 71, city: "Paris", for: "Mathematics, Physics", type: "Research University" },
  { name: "Sciences Po", qs: 319, city: "Paris", for: "Public Policy, Political Science", type: "Grande École" },
  { name: "École Normale Supérieure de Lyon", qs: 184, city: "Lyon", for: "Cognitive Sciences, Humanities", type: "Grande École" },
  { name: "Ecole des Ponts ParisTech", qs: 192, city: "Paris", for: "Civil Engineering, Urban Planning", type: "Grande École" },
  { name: "Université Paris Cité", qs: 236, city: "Paris", for: "Public Health, Medicine", type: "Research University" },
  { name: "Université Grenoble Alpes", qs: 294, city: "Grenoble", for: "Nanosciences, Technology", type: "Research University" },
  { name: "INSEAD", qs: null, city: "Fontainebleau", for: "MBA, Business", type: "Business School" },
];

const faqs = [
  {
    q: "How can I study in France from India in 2026?",
    a: "To study in France from India: (1) Choose your course and university — France has 3,500+ higher education institutions. (2) Meet academic eligibility — 10+2 for Bachelor's, graduation for Master's, Master's for PhD. (3) Prove English proficiency — IELTS 6.0–7.0 or TOEFL for English-medium programmes. (4) Apply via Campus France — all Indian students must register on the Campus France portal and attend an interview at the French Institute in your city before applying for the visa. (5) Apply for the France student visa (VLS-TS) at VFS Global. ANU Education guides you through every step with free counselling.",
  },
  {
    q: "Is French language compulsory to study in France?",
    a: "No — many French universities offer 100% English-medium programmes, especially at Master's and MBA level in management, engineering, data science, and technology. However, learning basic French (A1–A2) is highly recommended for daily life, part-time jobs, and integration. ANU Education offers a free 5-day French language demo class for all students planning to study in France — helping you start before you arrive.",
  },
  {
    q: "What is the cost of studying in France for Indian students in 2026?",
    a: "Tuition fees: Bachelor's — €3,000–€10,000/year (public universities are highly subsidised at €170–€600/year). Master's — €10,000–€16,500/year. MBA — €16,000–€25,000/year at top Grande Écoles. Living expenses: approximately €9,300–€12,000/year including accommodation (€500–€1,500/month), food, transport, and personal expenses. Total annual budget: approximately €15,000–€30,000 depending on city and institution.",
  },
  {
    q: "What is the France student visa process for Indian students?",
    a: "Step 1: Create a Campus France account and register your chosen institution. Step 2: Attend a Campus France interview at the French Institute in your city (Mumbai, Delhi, Bengaluru, Kolkata, Chennai, Hyderabad, Puducherry). Step 3: Receive a Campus France NOC (No Objection Certificate). Step 4: Book a visa appointment at VFS Global. Step 5: Submit your visa application with all documents. Step 6: Receive your Long Stay Student Visa (VLS-TS). Processing time: 4–8 weeks. ANU Education assists with all documentation and Campus France preparation.",
  },
  {
    q: "What documents are required to study in France?",
    a: "Required documents: Valid passport (6 months validity beyond course end), Campus France registration & NOC, University admission letter, Academic transcripts (10th, 12th, degree certificates), English proficiency test scores (IELTS/TOEFL), Statement of Purpose (SOP), Letters of Recommendation (2–3), CV/Resume, Bank statements showing sufficient funds (min €615/month), Health insurance, Proof of accommodation. ANU Education provides SOP writing guidance and document checklist support.",
  },
  {
    q: "What are the top scholarships to study in France for Indian students?",
    a: "Major scholarships: (1) Eiffel Excellence Scholarship — funded by French Ministry of Foreign Affairs, covers tuition + monthly stipend €1,181 (Master's) or €1,400 (PhD). (2) Campus France Bilateral Scholarships — under India-France bilateral agreements. (3) Charpak Scholarships — for Indian students at French universities, covers €700–€1,000/month. (4) Make Our Planet Great Again — for research-focused students in climate and sustainability. (5) University-specific scholarships — Sciences Po, HEC Paris, and Sorbonne offer merit-based waivers.",
  },
  {
    q: "What is the post-study work visa in France?",
    a: "After completing your degree in France, you can apply for an Autorisation Provisoire de Séjour (APS) — a temporary residence permit allowing you to stay and work: 2 years for Master's and MBA graduates. 4 years for STEM (Science, Technology, Engineering, Mathematics) graduates. You can then apply for a Talent Passport (Passeport Talent) for long-term residence leading to Permanent Residency (PR) after 5 years.",
  },
  {
    q: "What are the intakes for studying in France?",
    a: "France has two main intakes: September/October intake (main) — the primary admission season with the widest choice of programmes and universities. January/February intake (limited) — available at select universities, mainly for MBA and postgraduate programmes. Applications for September intake typically open October–March of the preceding year. ANU Education advises starting the process 12–18 months before your target intake.",
  },
  {
    q: "Can I work while studying in France?",
    a: "Yes. As an international student in France, you can work up to 20 hours per week (964 hours per year) during your studies. During summer holidays, you can work full-time. Part-time jobs in France pay €11.88/hour (SMIC minimum wage 2026). Bilingual (French + English) students have significantly more opportunities — another reason ANU Education recommends French language coaching alongside your study abroad preparation.",
  },
  {
    q: "Why choose ANU Education as your France study abroad consultant?",
    a: "ANU Education is a Skill India certified study abroad consultancy with 1,100+ students guided. Our France specialisation includes: Free counselling and university shortlisting, SOP and document preparation, Campus France registration guidance, IELTS/PTE and French language coaching under one roof, Free 5-day French language demo class for France-bound students, and post-visa pre-departure orientation. We are one of the very few Indian consultancies that combines study abroad counselling with certified French language coaching — giving you a complete France pathway.",
  },
];

export default function StudyInFranceClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"visa" | "docs">("visa");
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  return (
    <>
      {/* ── Service Schema ── */}
      <Script id="service-schema-france" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Study in France Consultancy – ANU Education",
        description: "ANU Education provides expert study abroad consultancy for Indian students planning to study in France. Services include university selection, Campus France guidance, visa documentation, SOP writing, IELTS coaching, and free French language classes.",
        provider: { "@type": "EducationalOrganization", name: "ANU Education", url: "https://www.anuedu.in", telephone: "+917016497087", address: { "@type": "PostalAddress", addressLocality: "Modasa", addressRegion: "Gujarat", addressCountry: "IN" } },
        serviceType: "Study Abroad Consultancy",
        areaServed: { "@type": "Country", name: "India" },
        hasOfferCatalog: { "@type": "OfferCatalog", name: "France Study Abroad Services", itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Free France Study Abroad Counselling" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Campus France Registration Guidance" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "France Student Visa Documentation" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "SOP Writing Support" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "French Language Coaching (A1–B2)" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Free 5-Day French Demo Class" } },
        ]},
      })}} />

      {/* ── FAQ Schema ── */}
      <Script id="faq-schema-france" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      })}} />

      {/* ── BreadcrumbList Schema ── */}
      <Script id="breadcrumb-schema-france" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
          { "@type": "ListItem", position: 2, name: "Study Abroad", item: "https://www.anuedu.in/study-abroad" },
          { "@type": "ListItem", position: 3, name: "Study in France", item: "https://www.anuedu.in/study-in/france" },
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
        .ua::after { content:''; position:absolute; bottom:-8px; left:50%; transform:translateX(-50%); width:52px; height:3px; background:linear-gradient(90deg,#1d4ed8,#ef4444); border-radius:2px; }
        .fr-stripe { background: linear-gradient(to right, #002395 33.3%, #fff 33.3%, #fff 66.6%, #ED2939 66.6%); }
      `}</style>

      <main className="min-h-screen bg-white">

        {/* ── HERO ── */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-red-700 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 fr-stripe" />
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="text-xs text-blue-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link><span className="mx-1">/</span>
              <Link href="/study-abroad" className="hover:text-white">Study Abroad</Link><span className="mx-1">/</span>
              <span className="text-white">Study in France</span>
            </nav>
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float">
                🇫🇷 Trusted France Study Abroad Consultant · Free Counselling · Free French Demo
              </div>
              <h1 className="anim d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                Study in France 2026
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Expert Guidance for Indian Students
                </span>
              </h1>
              <p className="anim d2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                ANU Education is your trusted <strong className="text-white">France study abroad consultant</strong> — university selection, Campus France guidance, visa documentation, SOP support, and French language coaching. <strong className="text-white">Free 5-day French demo class</strong> for every student planning to study in France.
              </p>
              <div className="anim d3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a href="https://anueducation.applyviz.com/walk-in" target="_blank" rel="noopener noreferrer"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse">
                  🎓 Book Free France Counselling
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  aria-label="WhatsApp ANU Education for France study abroad"
                  className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg">
                  💬 WhatsApp Us Now
                </a>
              </div>
              <div className="anim d4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>✅ 1,100+ Students Guided</span>
                <span>✅ Free Campus France Guidance</span>
                <span>✅ French Language Coaching Included</span>
                <span>✅ Skill India Certified Counsellors</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

          {/* ── STATS BAR ── */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "3,500+", label: "Higher education institutions" },
              { stat: "€11k–€16k", label: "Average Master's fees/year" },
              { stat: "400K+", label: "International students in France" },
              { stat: "2–4 Years", label: "Post-study work visa" },
            ].map((s, i) => (
              <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-blue-700 mb-1">{s.stat}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </section>

          {/* ── FREE FRENCH DEMO — unique advantage ── */}
          <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-red-600 text-white rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="text-6xl float flex-shrink-0" aria-hidden="true">🇫🇷</div>
              <div className="flex-1">
                <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                  🎁 Exclusive — Only at ANU Education
                </span>
                <h2 className="text-2xl font-bold mb-2">Free 5-Day French Language Demo Class</h2>
                <p className="text-blue-100 text-sm leading-relaxed mb-4">
                  Every student planning to study in France gets a <strong className="text-white">free 5-day French language trial</strong> — covering pronunciation, greetings, essential phrases, and daily French life. Start learning French before you even land. No other India study abroad consultant offers this.
                </p>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>✅ Live class with C1-certified French trainer</li>
                  <li>✅ Pronunciation, phonetics & everyday French</li>
                  <li>✅ Level placement — find out your starting level</li>
                  <li>✅ Continue to A1 → B2 → TEF if needed for Canada PR pathway</li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 min-w-fit">
                <a href="https://www.anuedu.in/free-demo" target="_blank" rel="noopener noreferrer"
                  className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all text-center">
                  🎓 Start Free French Demo
                </a>
                <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                  className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors text-center">
                  💬 Ask on WhatsApp
                </a>
              </div>
            </div>
          </section>

          {/* ── WHY STUDY IN FRANCE ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Why Study in France?</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              World's #1 tourist destination · Top 10 global education system · 400,000+ international students
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: "🏛️", title: "Grande École prestige", desc: "France's elite Grande Écoles — HEC Paris, INSEAD, Sciences Po, École Polytechnique — are globally ranked and respected by top employers worldwide." },
                { icon: "💶", title: "Affordable tuition", desc: "Public universities in France charge just €170–€600/year in tuition (heavily subsidised by the French government) — some of the lowest fees in Europe for world-class education." },
                { icon: "🌐", title: "English-medium programmes", desc: "Thousands of Master's and MBA programmes are taught entirely in English. French is helpful but not compulsory for most international courses." },
                { icon: "🎨", title: "Hub for fashion, arts & innovation", desc: "France leads globally in fashion (LVMH, L'Oreal, Dior), culinary arts (Le Cordon Bleu), aerospace (Airbus), and is 2nd in Europe for IT and technology." },
                { icon: "💼", title: "Strong post-study work rights", desc: "2-year APS (post-study work permit) for all graduates; 4 years for STEM graduates. Talent Passport leads to Permanent Residency after 5 years." },
                { icon: "🏥", title: "Student-friendly welfare", desc: "France covers up to one-third of student rent through CAF housing allowance. Comprehensive health insurance, student meal subsidies (€3.30 per meal at CROUS restaurants)." },
              ].map((item, i) => (
                <div key={i} className="card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── TOP UNIVERSITIES ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Top Universities in France 2026</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              QS World University Rankings 2026 — ANU Education has guided students to all these institutions
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">University</th>
                    <th className="text-center px-4 py-3 font-semibold">QS 2026</th>
                    <th className="text-left px-4 py-3 font-semibold">City</th>
                    <th className="text-left px-4 py-3 font-semibold">Popular For</th>
                    <th className="text-left px-4 py-3 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {universities.map((u, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-semibold text-gray-800">{u.name}</td>
                      <td className="px-4 py-3 text-center">
                        {u.qs ? <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-lg">#{u.qs}</span> : <span className="text-gray-400 text-xs">Top Ranked</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.city}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{u.for}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">{u.type}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center mt-4">
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 font-semibold hover:underline text-sm">
                💬 Ask which university suits your profile →
              </a>
            </p>
          </section>

          {/* ── POPULAR COURSES ── */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Popular Courses to Study in France</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { course: "MBA / Business Administration", unis: "HEC Paris, INSEAD, ESCP", icon: "💼" },
                { course: "Engineering & Technology", unis: "École Polytechnique, ENPC", icon: "⚙️" },
                { course: "Data Science & AI", unis: "IP Paris, Université Paris-Saclay", icon: "🤖" },
                { course: "Fashion & Luxury Management", unis: "IFM, ESMOD, Parsons Paris", icon: "👗" },
                { course: "Culinary Arts & Hospitality", unis: "Le Cordon Bleu, Glion", icon: "🍽️" },
                { course: "Political Science & International Relations", unis: "Sciences Po", icon: "🏛️" },
                { course: "Medicine & Public Health", unis: "Sorbonne, Université Paris Cité", icon: "🏥" },
                { course: "Architecture & Urban Planning", unis: "ENSA Paris, ENPC", icon: "🏗️" },
                { course: "Arts, Film & Media", unis: "La Fémis, Sorbonne", icon: "🎬" },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-3 items-start">
                  <span className="text-2xl flex-shrink-0">{c.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{c.course}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.unis}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── FEES & COSTS ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Cost of Studying in France for Indian Students 2026</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">All fees in EUR · Approximate INR conversion at ₹90/EUR</p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tuition */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-blue-700 text-white px-5 py-3 font-bold text-sm">📚 Tuition Fees (Average per year)</div>
                <div className="divide-y divide-gray-100">
                  {[
                    { prog: "Public University (Bachelor's/Master's)", eur: "€170 – €600", inr: "₹15K–₹54K" },
                    { prog: "Private / Grande École (Master's)", eur: "€10,000–€16,500", inr: "₹9L–₹15L" },
                    { prog: "MBA (Top Business Schools)", eur: "€16,000–€25,000", inr: "₹14L–₹22L" },
                    { prog: "Engineering (Private)", eur: "€8,000–€14,000", inr: "₹7.2L–₹12.6L" },
                    { prog: "Fashion / Culinary Arts", eur: "€12,000–€20,000", inr: "₹10.8L–₹18L" },
                  ].map((r, i) => (
                    <div key={i} className={`flex justify-between px-5 py-3 text-sm ${i % 2 ? "bg-gray-50" : ""}`}>
                      <span className="text-gray-700 font-medium">{r.prog}</span>
                      <div className="text-right ml-4">
                        <div className="text-blue-700 font-bold text-xs">{r.eur}</div>
                        <div className="text-gray-400 text-xs">{r.inr}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Living */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-green-700 text-white px-5 py-3 font-bold text-sm">🏠 Living Expenses (Average per month)</div>
                <div className="divide-y divide-gray-100">
                  {[
                    { item: "University Residence (CROUS)", cost: "€780–€800" },
                    { item: "Private Student Residence", cost: "€700–€1,000" },
                    { item: "Shared Apartment", cost: "€400–€700" },
                    { item: "Food & Groceries", cost: "€300–€500" },
                    { item: "Transport (monthly pass)", cost: "€75–€100" },
                    { item: "CAF Housing Allowance (subsidy)", cost: "–€150 to –€300" },
                    { item: "Total (approx.)", cost: "€700–€1,200" },
                  ].map((r, i) => (
                    <div key={i} className={`flex justify-between px-5 py-3 text-sm ${i % 2 ? "bg-gray-50" : ""} ${i === 6 ? "font-bold bg-green-50" : ""}`}>
                      <span className="text-gray-700">{r.item}</span>
                      <span className={`font-semibold ${i === 5 ? "text-green-600" : "text-gray-800"}`}>{r.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── INTAKES ── */}
          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">📅 France University Intakes 2026</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl p-5 border border-blue-200">
                <div className="inline-block bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">Main Intake — September / October</div>
                <ul className="text-sm text-gray-700 space-y-1.5">
                  <li>✅ Widest choice of universities and programmes</li>
                  <li>✅ All Grande Écoles and public universities</li>
                  <li>✅ Applications open: October–March (preceding year)</li>
                  <li>✅ Campus France deadlines: January–April</li>
                  <li>✅ Visa processing: May–July</li>
                </ul>
                <p className="text-xs text-blue-700 font-semibold mt-3">▶ Start preparing now for September 2026 intake</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="inline-block bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">Secondary Intake — January / February</div>
                <ul className="text-sm text-gray-700 space-y-1.5">
                  <li>⚠️ Limited universities and programmes</li>
                  <li>✅ Available for select MBA and Master's programmes</li>
                  <li>✅ Applications open: June–September</li>
                  <li>✅ Suitable for students who missed September intake</li>
                </ul>
                <p className="text-xs text-gray-600 font-semibold mt-3">▶ Best for Management and Business programmes</p>
              </div>
            </div>
          </section>

          {/* ── SCHOLARSHIPS ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">Scholarships to Study in France for Indian Students</h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">France funds ~22,000 international students per year through government scholarships</p>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { name: "Eiffel Excellence Scholarship", by: "French Ministry of Foreign Affairs", value: "€1,181/month (Master's) · €1,400/month (PhD)", who: "High-achieving international students in engineering, science, law, economics, management", deadline: "January each year (apply through French university)" },
                { name: "Charpak Scholarship", by: "Embassy of France in India", value: "€700–€1,000/month + travel allowance", who: "Indian students in France for semester exchange, Master's, or PhD programmes", deadline: "March–April annually (apply via Campus France)" },
                { name: "Make Our Planet Great Again", by: "French Government", value: "Full tuition + €1,500/month stipend", who: "Researchers in climate science, environment, and sustainable development", deadline: "Rolling applications" },
                { name: "HEC Paris Scholarships", by: "HEC Paris Business School", value: "€5,000–€30,000 partial/full tuition waiver", who: "MBA and Master's applicants with strong academic and leadership profile", deadline: "Per intake — apply during admission process" },
                { name: "Sciences Po Scholarships", by: "Sciences Po Paris", value: "Partial to full tuition waiver", who: "International students demonstrating academic excellence", deadline: "March–April each year" },
                { name: "Campus France Bilateral", by: "Government of France & India", value: "Varies — tuition waiver + monthly allowance", who: "Students from specific bilateral programmes between India and France", deadline: "Via Indian Ministry of Education — check annual notifications" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-blue-700 mb-1 text-sm">{s.name}</h3>
                  <div className="text-xs text-gray-400 mb-2">By: {s.by}</div>
                  <div className="text-sm text-green-700 font-semibold mb-1">💰 Value: {s.value}</div>
                  <div className="text-xs text-gray-600 mb-1"><strong>Eligibility:</strong> {s.who}</div>
                  <div className="text-xs text-gray-500"><strong>Deadline:</strong> {s.deadline}</div>
                </div>
              ))}
            </div>
            <p className="text-center mt-5 text-sm text-gray-600">
              Need help applying for French scholarships?{" "}
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">
                Talk to our counsellors →
              </a>
            </p>
          </section>

          {/* ── VISA + DOCS TABS ── */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">France Student Visa & Documents</h2>
            <div className="flex gap-2 mb-6 justify-center">
              <button onClick={() => setActiveTab("visa")}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "visa" ? "bg-blue-700 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-blue-50"}`}>
                🛂 Visa Process
              </button>
              <button onClick={() => setActiveTab("docs")}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "docs" ? "bg-blue-700 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-blue-50"}`}>
                📄 Documents Required
              </button>
            </div>

            {activeTab === "visa" && (
              <div className="space-y-3">
                {[
                  { step: "Step 1", title: "Register on Campus France", desc: "Create an account on the Campus France portal (campusfrance.org). All Indian students must complete this before applying for a French visa. Select your institution and programme." },
                  { step: "Step 2", title: "Campus France Interview", desc: "Attend a Campus France interview at the French Institute in your city — Mumbai, Delhi, Bengaluru, Kolkata, Chennai, Hyderabad, or Puducherry. The interview assesses your study motivation and programme knowledge." },
                  { step: "Step 3", title: "Receive Campus France NOC", desc: "After the interview, Campus France issues a No Objection Certificate (NOC). This is mandatory before you can book a visa appointment." },
                  { step: "Step 4", title: "Book VFS Global Appointment", desc: "Book a student visa appointment at VFS Global (French consulate's visa application centre). Submit your long-stay student visa (VLS-TS) application with all required documents." },
                  { step: "Step 5", title: "Visa Processing", desc: "Processing time: 4–8 weeks. The visa is issued as a Long Stay Visa equivalent to a Residence Permit (VLS-TS). After arriving in France, validate your VLS-TS online within 3 months of arrival." },
                ].map((s, i) => (
                  <div key={i} className="flex gap-4 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-lg h-fit flex-shrink-0">{s.step}</div>
                    <div>
                      <div className="font-semibold text-gray-800 mb-1">{s.title}</div>
                      <div className="text-gray-600 text-sm leading-relaxed">{s.desc}</div>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-blue-700 font-medium text-center mt-3">
                  ANU Education assists with Campus France registration, interview preparation, and all visa documentation.{" "}
                  <a href="https://anueducation.applyviz.com/walk-in" target="_blank" rel="noopener noreferrer" className="underline">Book free counselling →</a>
                </p>
              </div>
            )}

            {activeTab === "docs" && (
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { cat: "Identity & Passport", items: ["Valid passport (min 6 months beyond course end)", "Recent passport-size photographs", "Campus France registration & NOC"] },
                  { cat: "Academic Documents", items: ["10th & 12th mark sheets and certificates", "Bachelor's degree transcripts (for Master's)", "Medium of Instruction certificate"] },
                  { cat: "English Proficiency", items: ["IELTS (6.0–7.0) or TOEFL score", "Some universities accept Duolingo", "French proficiency (A1+ helpful, often optional)"] },
                  { cat: "Application Documents", items: ["University admission/offer letter", "Statement of Purpose (SOP)", "2–3 Letters of Recommendation", "Updated CV/Resume"] },
                  { cat: "Financial Documents", items: ["Bank statements (min €615/month)", "Scholarship letter (if applicable)", "Sponsor letter (if applicable)", "Income tax returns (parents)"] },
                  { cat: "Other Documents", items: ["Health insurance certificate", "Proof of accommodation in France", "Return ticket (sometimes required)", "Visa application form + fee"] },
                ].map((c, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-blue-700 text-sm mb-3">{c.cat}</h3>
                    <ul className="space-y-1.5">
                      {c.items.map((item, j) => <li key={j} className="text-xs text-gray-700 flex gap-2"><span className="text-green-600 flex-shrink-0">✓</span>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── ANU'S FRANCE SERVICE ── */}
          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Why Choose ANU Education as Your France Study Abroad Consultant?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "🎓", title: "Free university shortlisting", desc: "Based on your profile, budget, and field — matched to the right French university for your goals." },
                { icon: "📝", title: "SOP & document guidance", desc: "Personalised SOP writing support and complete document checklist — reduce rejection risk." },
                { icon: "🛂", title: "Campus France preparation", desc: "Mock interview prep and Campus France registration guidance — most students don't know this step." },
                { icon: "🇫🇷", title: "Free 5-day French demo class", desc: "Unique to ANU — start learning French before you fly. A1→B2 available for all France-bound students." },
                { icon: "📊", title: "IELTS & French coaching", desc: "One-stop: get your IELTS, PTE, and French language coaching under the same roof." },
                { icon: "✈️", title: "Pre-departure orientation", desc: "Life in France, banking, transport, health insurance, CROUS registration — we prepare you for Day 1." },
              ].map((s, i) => (
                <div key={i} className="card bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="font-semibold text-gray-800 text-sm mb-1">{s.title}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">{s.desc}</div>
                </div>
              ))}
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
          <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-red-700 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float">🇫🇷</div>
            <h2 className="text-3xl font-bold mb-3">Start Your France Study Journey Today</h2>
            <p className="text-blue-100 mb-3 max-w-xl mx-auto">
              Free counselling · University shortlisting · Campus France guidance · Visa support · Free 5-day French demo class.
            </p>
            <p className="text-yellow-300 font-semibold mb-8 text-sm">
              🎁 Every France-bound student gets a FREE 5-day French language demo class at ANU Education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="https://anueducation.applyviz.com/walk-in" target="_blank" rel="noopener noreferrer"
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105">
                🎓 Book Free France Counselling
              </a>
              <a href="https://www.anuedu.in/free-demo" target="_blank" rel="noopener noreferrer"
                className="bg-yellow-400 text-yellow-900 px-8 py-4 rounded-xl font-bold hover:bg-yellow-300 transition-all">
                🇫🇷 Claim Free French Demo
              </a>
              <a href={getWhatsAppLink(websiteWhatsAppMessages.home)} target="_blank" rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors">
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-white/60">📞 +91 70164 97087 · info@anuedu.in · Modasa, Gujarat</p>
          </section>

          {/* ── INTERNAL LINKS ── */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/language/french" className="text-blue-600 hover:underline">French Language Course</Link>
              <span>·</span>
              <Link href="/study-in/canada" className="text-blue-600 hover:underline">Study in Canada</Link>
              <span>·</span>
              <Link href="/study-in/germany" className="text-blue-600 hover:underline">Study in Germany</Link>
              <span>·</span>
              <Link href="/study-in/uk" className="text-blue-600 hover:underline">Study in UK</Link>
              <span>·</span>
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">IELTS Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline">PTE Coaching</Link>
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
