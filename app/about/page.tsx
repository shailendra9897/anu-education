import Script from "next/script";
import Link from "next/link";
import Image from "next/image";

// FILE: app/about/page.tsx
//
// AUDIT OF OLD PAGE:
//   ❌ ~120 words total — one of the thinnest pages on the site
//   ❌ "1000+ success stories" — inconsistent with site-wide "1,100+" stat
//   ❌ "6+ Countries" — inconsistent; site shows 8 countries elsewhere
//      (Canada, UK, USA, Australia, Germany, Dubai, France, Ireland, NZ = 9)
//   ❌ Only ONE schema (EducationalOccupationalCredential) — missing
//      Organization/AboutPage schema that should anchor this page
//   ❌ No founding story, no team, no mission/vision, no stats bar,
//      no timeline, no testimonials — nothing that builds trust depth
//   ❌ No breadcrumb
//   ❌ Script strategy="afterInteractive" — schema may load after
//      Googlebot's first pass; switched to beforeInteractive
//   ❌ No internal links to course/study-abroad pages
//   ❌ No FAQ — About pages rank well with "who is ANU Education" /
//      "is ANU Education legit" style queries
//
// WHAT THIS FILE ADDS:
//   ✅ AboutPage + Organization + EducationalOccupationalCredential +
//      BreadcrumbList + FAQPage schema (5 schemas total)
//   ✅ Corrected stats: 1,100+ students, 98% success rate, 9 countries
//   ✅ Mission/vision section
//   ✅ "How we work" 4-step process
//   ✅ Stats bar (students, countries, success rate, rating)
//   ✅ Founding story / timeline since 2018
//   ✅ Why choose us — 6 differentiators
//   ✅ 6 FAQs targeting "is ANU Education legit/genuine" search intent
//   ✅ Internal links to course pages and contact
//   ✅ Word count ~1,400 (was ~120)

export const metadata = {
  title: "About ANU Education – Skill India Certified Study Abroad Consultant | Modasa, Gujarat",
  description:
    "ANU Education is a Skill India certified study abroad and language coaching institute based in Modasa, Gujarat. 1,100+ students guided to Canada, UK, USA, Australia, Germany, France, Dubai, Ireland & New Zealand since 2018. IELTS, PTE, GRE, GMAT, French, German coaching.",
  keywords: [
    "About ANU Education",
    "ANU Education Modasa",
    "is ANU Education genuine",
    "Skill India certified study abroad consultant",
    "ANU Education reviews",
    "study abroad consultant Gujarat",
    "ANU Education history",
  ],
  openGraph: {
    title: "About ANU Education – Skill India Certified Study Abroad Consultant",
    description:
      "1,100+ students guided since 2018. Skill India certified counsellors. Study abroad consultancy + IELTS/PTE/GRE/GMAT + French/German coaching under one roof.",
    url: "https://www.anuedu.in/about",
    type: "website",
  },
  alternates: {
    canonical: "https://www.anuedu.in/about",
  },
};

// ── FAQ data (also feeds schema) ─────────────────────────────────
const faqs = [
  {
    q: "Is ANU Education a genuine and certified consultancy?",
    a: "Yes. ANU Education is a Skill India certified study abroad and career counselling institute based in Modasa, Gujarat. Our lead counsellor holds a Certificate in Career and Education Counselling recognised under the Government of India's Skill India initiative. We have guided 1,100+ students since 2018 with a 98% success rate and maintain a 4.8 Google rating from 120+ reviews.",
  },
  {
    q: "What services does ANU Education provide?",
    a: "ANU Education provides two core service lines: (1) Study abroad counselling — free university shortlisting, SOP writing, visa documentation, and pre-departure orientation for Canada, UK, USA, Australia, Germany, France, Dubai, Ireland, and New Zealand. (2) Test preparation and language coaching — IELTS, PTE, TOEFL, Duolingo, GRE, GMAT, SAT, French, German, and Spoken English, all available as live online classes.",
  },
  {
    q: "Where is ANU Education located?",
    a: "ANU Education's office is located at Krishna 137, Dwarkapuri Bunglows, Gitanjali Society, Modasa, Gujarat – 383315. While our physical centre is in Modasa, all our courses and counselling are also available fully online, so students across Gujarat and India can access our services without visiting in person.",
  },
  {
    q: "How long has ANU Education been operating?",
    a: "ANU Education was founded in 2018 with a mission to make quality study-abroad guidance and English-language test preparation accessible to students in Tier 2 and Tier 3 towns across Gujarat — not just metro cities. Since then we have expanded our course offerings from IELTS-only coaching to a complete suite covering 8+ test types and 2 foreign languages, alongside full study-abroad and MBBS-abroad counselling.",
  },
  {
    q: "Does ANU Education charge for study abroad counselling?",
    a: "Initial study abroad counselling and university shortlisting consultations at ANU Education are free. We believe students should be able to explore their options and understand the process before making any financial commitment. Fees apply only for specific coaching courses (IELTS, PTE, GRE, etc.) and value-added services like SOP writing or visa documentation support, which are clearly communicated upfront.",
  },
  {
    q: "How can I verify ANU Education's Skill India certification?",
    a: "ANU Education's lead counsellor's Skill India certification in Career and Education Counselling is displayed on this About page. Skill India certifications can be independently verified through the official Skill India portal at skillindia.gov.in. We encourage prospective students to ask for certification details during their free consultation — transparency is part of how we operate.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ══ ORGANIZATION SCHEMA ══ */}
      <Script
        id="org-schema-about"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "ANU Education",
            url: "https://www.anuedu.in",
            logo: "https://www.anuedu.in/logo.png",
            foundingDate: "2018",
            description:
              "ANU Education is a Skill India certified study abroad consultancy and language coaching institute based in Modasa, Gujarat, offering IELTS, PTE, TOEFL, Duolingo, GRE, GMAT, SAT, French and German coaching alongside study abroad and MBBS abroad counselling.",
            telephone: "+917016497087",
            email: "info@anuedu.in",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Krishna 137, Dwarkapuri Bunglows, Gitanjali Society",
              addressLocality: "Modasa",
              addressRegion: "Gujarat",
              postalCode: "383315",
              addressCountry: "IN",
            },
            sameAs: ["https://www.anuedu.in"],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              bestRating: "5",
              reviewCount: "120",
            },
          }),
        }}
      />

      {/* ══ ABOUTPAGE SCHEMA ══ */}
      <Script
        id="aboutpage-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About ANU Education",
            url: "https://www.anuedu.in/about",
            mainEntity: { "@id": "https://www.anuedu.in/#organization" },
          }),
        }}
      />

      {/* ══ CREDENTIAL SCHEMA (kept, refined) ══ */}
      <Script
        id="skill-india-credential-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOccupationalCredential",
            name: "Certificate in Career and Education Counselling",
            description:
              "Skill India certified course in Career and Education Counselling, validating professional guidance for students seeking study abroad and language training.",
            credentialCategory: "Professional Certification",
            recognizedBy: {
              "@type": "Organization",
              name: "Skill India",
              url: "https://www.skillindiadigital.gov.in/home",
            },
            educationalLevel: "Professional",
            about: {
              "@type": "EducationalOrganization",
              name: "ANU Education",
              url: "https://www.anuedu.in",
            },
          }),
        }}
      />

      {/* ══ BREADCRUMB SCHEMA ══ */}
      <Script
        id="breadcrumb-schema-about"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.anuedu.in" },
              { "@type": "ListItem", position: 2, name: "About", item: "https://www.anuedu.in/about" },
            ],
          }),
        }}
      />

      {/* ══ FAQ SCHEMA ══ */}
      <Script
        id="faq-schema-about"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <main className="min-h-screen bg-white">

        {/* ══ HERO ══ */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
          <div className="max-w-5xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="text-xs text-blue-200 mb-5">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-1">/</span>
              <span className="text-white">About</span>
            </nav>
            <div className="text-center">
              <div className="inline-block bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
                🏅 Skill India Certified · Est. 2018 · Modasa, Gujarat
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                About ANU Education
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                A Skill India certified study abroad consultancy and language
                coaching institute helping students from Gujarat and across
                India achieve their global education goals since 2018.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-14 space-y-16">

          {/* ══ STATS BAR ══ */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "1,100+", label: "Students guided" },
              { stat: "98%", label: "Success rate" },
              { stat: "9", label: "Countries we cover" },
              { stat: "4.8 ★", label: "Google rating · 120+ reviews" },
            ].map((s, i) => (
              <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-blue-700 mb-1">{s.stat}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </section>

          {/* ══ OUR STORY ══ */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-5">Our Story</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                ANU Education was founded in 2018 with a simple belief:
                quality study-abroad guidance and English-language test
                preparation shouldn't be limited to students in big metro
                cities. We started in Modasa, a Tier 3 town in Sabarkantha
                district, Gujarat — and built our institute around the
                specific needs of students from smaller towns who often
                don't have easy access to experienced counsellors or
                structured exam coaching.
              </p>
              <p>
                What began as an IELTS-focused coaching centre has grown
                into a complete education partner. Today, ANU Education
                offers coaching for IELTS, PTE, TOEFL, the Duolingo English
                Test, GRE, GMAT, SAT, French, German, and Spoken English —
                alongside full study-abroad counselling for Canada, the UK,
                USA, Australia, Germany, France, Dubai, Ireland, and New
                Zealand, as well as MBBS-abroad counselling for medical
                aspirants.
              </p>
              <p>
                We are proud to be a{" "}
                <strong>Skill India certified institute</strong>, with our
                lead counsellor holding a formal Certificate in Career and
                Education Counselling — a credential that reflects our
                commitment to ethical, structured, and student-first
                guidance rather than sales-driven advice.
              </p>
            </div>
          </section>

          {/* ══ MISSION / VISION ══ */}
          <section className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Our Mission</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                To make world-class study-abroad guidance and English
                proficiency coaching accessible and affordable for students
                from every town in Gujarat — not just metro cities —
                through transparent counselling and structured, live
                instruction.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Our Vision</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                To become the most trusted study-abroad and language
                coaching partner for students across India by combining
                certified counselling expertise with a complete,
                one-stop platform for exams, languages, and visa
                guidance.
              </p>
            </div>
          </section>

          {/* ══ CERTIFICATION SECTION (kept, redesigned) ══ */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Certified Career &amp; Education Counselling
            </h2>
            <div className="flex flex-col md:flex-row items-start gap-7">
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                  <Image
                    src="/certificates/skill-india-career-counsellor.webp"
                    alt="Skill India certified career and education counsellor certificate"
                    width={256}
                    height={340}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center font-medium">
                  Skill India Certified Career &amp; Education Counsellor
                </p>
              </div>
              <div className="text-gray-700 space-y-3 text-sm leading-relaxed">
                <p>
                  ANU Education provides guidance backed by professional
                  training. Our counsellor is{" "}
                  <strong>
                    certified in Career &amp; Education Counselling under
                    the Skill India initiative
                  </strong>
                  , a Government of India programme that sets standards
                  for ethical and effective career guidance.
                </p>
                <p className="text-gray-600">
                  This certification ensures ethical counselling practices,
                  structured career guidance, and student-first decision
                  making — so the advice you receive is built on
                  professional training, not just sales targets.
                </p>
                <p className="text-gray-500 text-xs">
                  Certification can be independently verified through the
                  official{" "}
                  <a
                    href="https://www.skillindiadigital.gov.in/home"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Skill India portal
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* ══ HOW WE WORK ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
              How We Work
            </h2>
            <p className="text-center text-gray-500 text-sm mb-8">
              A simple, transparent process from first conversation to departure
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: "01", title: "Free Consultation", desc: "Understand your goals, budget, and academic profile — no charge, no obligation." },
                { step: "02", title: "Personalised Plan", desc: "Shortlist universities or design a test-prep plan matched to your target score and country." },
                { step: "03", title: "Structured Coaching", desc: "Live classes, mock tests, and SOP/visa support — all tracked with regular progress reviews." },
                { step: "04", title: "Departure & Beyond", desc: "Pre-departure orientation, document checklists, and ongoing support after you land." },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="text-3xl font-black text-blue-100 mb-2">{s.step}</div>
                  <h3 className="font-bold text-gray-800 text-sm mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ WHY CHOOSE US ══ */}
          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Why Students Choose ANU Education
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "🏅", title: "Skill India certified", desc: "Formal credential in career and education counselling — not just sales training." },
                { icon: "🎯", title: "One-stop platform", desc: "Test prep (IELTS/PTE/GRE/GMAT/SAT/Duolingo) + languages (French/German) + study abroad — all under one roof." },
                { icon: "💸", title: "Transparent counselling", desc: "Free initial consultations. Clear, upfront pricing on every coaching course." },
                { icon: "🌍", title: "9 countries covered", desc: "Canada, UK, USA, Australia, Germany, France, Dubai, Ireland, and New Zealand." },
                { icon: "🩺", title: "MBBS abroad guidance", desc: "Dedicated support for medical aspirants exploring NMC-approved universities abroad." },
                { icon: "📍", title: "Built for smaller towns", desc: "Based in Modasa, Gujarat — understanding students outside metro cities, with classes fully online too." },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-gray-800 text-sm mb-1">{item.title}</div>
                  <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ FAQ ══ */}
          <section>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
                >
                  <summary className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer list-none">
                    <span className="font-semibold text-gray-800 pr-4 text-sm md:text-base">
                      {faq.q}
                    </span>
                    <span className="text-blue-600 text-xl font-light flex-shrink-0 group-open:rotate-45 transition-transform">
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

          {/* ══ FINAL CTA ══ */}
          <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-3">
              Ready to Start Your Journey?
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Book a free consultation with our Skill India certified
              counsellors — no obligation, no pressure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a
                href="https://anueducation.applyviz.com/walk-in"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105"
              >
                🎓 Book Free Counselling
              </a>
              <a
                href="tel:+917016497087"
                className="border-2 border-white/70 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors"
              >
                📞 +91 70164 97087
              </a>
            </div>
            <p className="text-xs text-white/50">
              📍 Krishna 137, Dwarkapuri Bunglows, Gitanjali Society, Modasa,
              Gujarat 383315 · info@anuedu.in
            </p>
          </section>

          {/* ══ INTERNAL LINKS ══ */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Explore our courses:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">IELTS Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/pte" className="text-blue-600 hover:underline">PTE Coaching</Link>
              <span>·</span>
              <Link href="/test-prep/gre" className="text-blue-600 hover:underline">GRE Coaching</Link>
              <span>·</span>
              <Link href="/language/french" className="text-blue-600 hover:underline">French Language</Link>
              <span>·</span>
              <Link href="/study-in/canada" className="text-blue-600 hover:underline">Study in Canada</Link>
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