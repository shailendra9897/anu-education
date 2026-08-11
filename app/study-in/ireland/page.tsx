// app/study-in/ireland/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Study in Ireland 🇮🇪 | 2026 Guide for Indian Students | ANU Education",
  description:
    "Complete 2026 guide to studying in Ireland for Indian students. Top universities, tuition fees, scholarships, D‑visa procedure, part‑time work & 1‑2 year post‑study stay‑back.",
  keywords:
    "study in Ireland, Irish student visa, Ireland D visa, tuition fees Ireland, post-study work Ireland",
  alternates: {
    canonical: "https://www.anuedu.in/study-in/ireland",
  },
  openGraph: {
    title: "Study in Ireland 🇮🇪 | 2026 Guide for Indian Students",
    description:
      "Step‑by‑step overview of Ireland as a study destination. English‑speaking environment, affordable education, generous post‑graduation stay‑back & European job market.",
    url: "https://www.anuedu.in/study-in/ireland",
    type: "website",
    images: [
      {
        url: "/images/study-in-ireland-og.jpg",
        width: 1200,
        height: 630,
        alt: "Irish universities and student life",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Study in Ireland – 2026 Complete Guide",
    description:
      "Everything about Ireland student visa, costs, scholarships, part‑time work and PR pathways.",
    images: ["/images/study-in-ireland-og.jpg"],
  },
};

export default function IrelandPage() {
  return (
    <>
      {/* ========== ARTICLE SCHEMA ========== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Study in Ireland: 2026–27 Complete Guide for Indian Students",
            description:
              "Comprehensive roadmap for Indian students planning higher education in Ireland. Covers D visa, fees, scholarships, work rights, and stay‑back options.",
            author: { "@type": "Organization", name: "ANU Education" },
            publisher: {
              "@type": "Organization",
              name: "ANU Education",
              logo: { "@type": "ImageObject", url: "https://www.anuedu.in/logo.png" },
            },
            datePublished: "2026-05-10",
            image: "https://www.anuedu.in/images/study-in-ireland-og.jpg",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://www.anuedu.in/study-in/ireland",
            },
          }),
        }}
      />

      {/* ========== FAQ SCHEMA (JSON‑LD) ========== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Which is better for Indian students: Ireland vs UK vs Germany?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Ireland offers an English‑speaking environment, reasonable tuition, and a 1–2 year stay‑back visa. The UK has higher fees and a 2‑year Graduate Route. Germany is affordable but requires German for many jobs and has an 18‑month job‑seeker visa. India’s tech and pharma talent fits Ireland’s booming job market perfectly.",
                },
              },
              {
                "@type": "Question",
                name: "What are the IELTS requirements for Irish universities?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most postgraduate programmes require IELTS 6.5 overall (no band below 6.0). Trinity College Dublin or UCD may ask for 7.0 for competitive courses. PTE Academic or TOEFL are also accepted. A valid English test score is mandatory for both admission and the D visa.",
                },
              },
              {
                "@type": "Question",
                name: "How much does it cost to live in Ireland as a student?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Living expenses vary by city: Dublin €1,200–1,500/month; Galway, Cork or Limerick €900–1,200/month. Many students manage with part‑time earnings. Proof of at least €10,000 per year (excl. tuition) is required for the visa.",
                },
              },
              {
                "@type": "Question",
                name: "Can I work part‑time while studying in Ireland?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Students holding a Stamp 2 permission can work up to 20 hours/week during term time and 40 hours/week during holidays (June–September, Christmas, Easter). On‑campus jobs, retail, hospitality, and university career portals are common sources of employment.",
                },
              },
              {
                "@type": "Question",
                name: "What are the top‑paying industries for Indian graduates in Ireland?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Ireland’s tech sector (Dublin’s “Silicon Docks”), pharmaceutical and biotech clusters in Cork, and financial services offer the highest entry salaries. AI/ML roles start at €50,000–70,000; pharma jobs are similarly well compensated.",
                },
              },
            ],
          }),
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
          
          {/* HERO SECTION */}
          <section className="text-center space-y-4">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-semibold">
              🇮🇪 Top EU study destination | English‑taught | Stay‑back up to 2 years
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Study in Ireland
              <span className="block text-2xl md:text-3xl text-blue-600 mt-2">2026–27 Guide for Indian Students</span>
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Ireland combines world‑class education with a warm, English‑speaking environment.  
              Whether you dream of working in the “Silicon Valley of Europe” or exploring historic castles,  
              this guide walks you through **universities, visa, costs, scholarships, and the post‑study work pathway**.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/free-demo"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
              >
                🎓 Get free expert counselling
              </Link>
              <Link
                href="/test-prep/ielts-online"
                className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition"
              >
                📘 Prepare for IELTS / PTE
              </Link>
            </div>
          </section>

          {/* WHY IRELAND */}
          <section className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-4">✨ Why Indian students prefer Ireland</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>🎓 English‑speaking education</strong> – No language barrier inside the EU.</li>
                <li><strong>💼 Generous post‑study visa</strong> – 1–2 years (Stamp 1G) to work full‑time.</li>
                <li><strong>💸 Affordable compared to US/UK</strong> – Tuition + living €18,000–25,000/year.</li>
                <li><strong>🤝 Huge Indian student community</strong> – Supportive networks across all major cities.</li>
              </ul>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>🏙️ “Silicon Valley of Europe”</strong> – Google, Meta, Apple, Pfizer, Intel have HQs here.</li>
                <li><strong>🌍 Gateway to Europe</strong> – Travel and work opportunities across the EU after graduation.</li>
                <li><strong>🔐 Safe & student‑friendly</strong> – Ireland is consistently ranked as one of the world’s friendliest countries.</li>
              </ul>
            </div>
          </section>

          {/* TOP UNIVERSITIES + TUITION */}
          <section className="bg-white p-8 rounded-2xl shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">🏛️ Top Irish universities & tuition fees (2026)</h2>
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">University</th>
                  <th className="border p-3 text-left">Popular programmes</th>
                  <th className="border p-3 text-left">Annual tuition (€)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border p-3"><strong>Trinity College Dublin (TCD)</strong></td><td className="border p-3">CS, Data Science, Finance, Engineering</td><td className="border p-3">22,000 – 28,000</td></tr>
                <tr><td className="border p-3"><strong>University College Dublin (UCD)</strong></td><td className="border p-3">Business Analytics, Engineering, Biotech</td><td className="border p-3">20,000 – 26,000</td></tr>
                <tr><td className="border p-3"><strong>University of Galway</strong></td><td className="border p-3">IT, Data Analytics, Biomedical</td><td className="border p-3">14,500 – 20,000</td></tr>
                <tr><td className="border p-3"><strong>University College Cork (UCC)</strong></td><td className="border p-3">CS, Mechanical Engineering, Data Science</td><td className="border p-3">18,000 – 24,000</td></tr>
                <tr><td className="border p-3"><strong>University of Limerick (UL)</strong></td><td className="border p-3">CS, Engineering, Data Science</td><td className="border p-3">14,000 – 18,000</td></tr>
                <tr><td className="border p-3"><strong>Dublin City University (DCU)</strong></td><td className="border p-3">Engineering, Data Analytics, Finance</td><td className="border p-3">14,500 – 20,000</td></tr>
                <tr><td className="border p-3"><strong>Maynooth University</strong></td><td className="border p-3">CS, Applied Data Analytics, Bioinformatics</td><td className="border p-3">12,000 – 16,000</td></tr>
              </tbody>
            </table>
            <p className="text-sm text-gray-500 mt-3 italic">Fees are for non‑EU students, based on 2026‑27 data. Always verify with the university.</p>
          </section>

          {/* COST OF LIVING + PART‑TIME WORK */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-bold mb-3">🏠 Monthly living expenses</h2>
              <ul className="space-y-2">
                <li><strong>🏙️ Dublin:</strong> €1,200 – €1,500</li>
                <li><strong>🌊 Cork / Galway / Limerick:</strong> €900 – €1,200</li>
                <li><strong>🍽️ Food & groceries:</strong> €200 – €300</li>
                <li><strong>🚌 Transport (student card):</strong> €80 – €120</li>
                <li><strong>📱 Utilities & internet:</strong> €100 – €150</li>
              </ul>
              <p className="mt-3 text-sm text-gray-500 italic">A minimum of <strong>€10,000/year</strong> must be shown as proof of funds for the visa.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-bold mb-3">💼 Part‑time work rights (Stamp 2)</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>20 hours/week</strong> during term time.</li>
                <li><strong>40 hours/week</strong> during holidays (June, July, August, Christmas, Easter).</li>
                <li>Popular jobs: <strong>café/retail assistant, library help, campus ambassador, hotel staff</strong>.</li>
                <li>University career portals and job fairs are the best starting points.</li>
              </ul>
              <p className="mt-3 text-sm text-gray-500 italic">Part‑time earnings can cover a significant portion of your monthly living costs.</p>
            </div>
          </section>

          {/* SCHOLARSHIPS */}
          <section className="bg-blue-50 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">🎓 Top scholarships for Indian students (2026‑27)</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div><strong>🇮🇪 Government of Ireland‑IES</strong><br />€10,000 stipend + full tuition fee waiver. 60 awards available. Requires offer from an eligible Irish HEI.</div>
              <div><strong>🏫 NCI India Scholarship</strong><br />€75,000 total fund for Indian master’s students (business, computing, psychology). Merit‑ & need‑based.</div>
              <div><strong>⚛️ Fulbright‑Ireland</strong><br />For research master’s and PhD students. Covers tuition + monthly stipend + health insurance.</div>
              <div><strong>🌟 University‑specific merit awards</strong><br />Many universities (UCD, Trinity, UCC) offer partial to full fee waivers for high‑achieving students.</div>
            </div>
            <p className="text-sm text-gray-600 mt-4 italic">Always check individual university scholarship portals – deadlines are usually between January and March.</p>
          </section>

          {/* STUDENT VISA (D VISA) */}
          <section className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-3">🛂 Ireland student visa – D Study Visa (long stay)</h2>
            <ul className="grid md:grid-cols-2 gap-3 list-disc pl-5 mb-6">
              <li><strong>Unconditional offer</strong> from an ILEP‑listed programme.</li>
              <li><strong>English proficiency:</strong> IELTS 6.5 (6.0 no band) or equivalent PTE/TOEFL.</li>
              <li><strong>Financial proof:</strong> Show €10,000 living expenses + paid tuition (or evidence of funds to cover both).</li>
              <li><strong>Private health insurance</strong> valid in Ireland.</li>
              <li><strong>Passport</strong> valid for at least 12 months.</li>
              <li><strong>Online application</strong> via AVATS portal, then biometrics at Indian VFS centre.</li>
            </ul>
            <div className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-400">
              <p className="font-semibold">📌 Processing time</p>
              <p>4–8 weeks on average. Apply at least <strong>3 months before the course starts</strong>. Peak seasons (July–September) may take longer.</p>
            </div>
          </section>

          {/* POST‑STUDY WORK VISA (STAMP 1G) */}
          <section className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-3">📄 Post‑study work visa – Stamp 1G (Third Level Graduate Programme)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Bachelor’s (NFQ Level 8):</strong> 1 year stay‑back.</li>
              <li><strong>Master’s / PG Diploma (NFQ Level 9):</strong> 2 years (issued in two 12‑month blocks).</li>
              <li><strong>PhD (NFQ Level 10):</strong> 2 years.</li>
              <li><strong>Full work rights</strong> – 40 hours/week for any employer, no sponsorship required.</li>
              <li>Apply <strong>within 6 months of receiving final results</strong> (registration fee ~€300).</li>
              <li>After Stamp 1G, you can switch to a <strong>Critical Skills Employment Permit</strong> or <strong>General Employment Permit</strong> and eventually progress to Stamp 4 (residence permit).</li>
            </ul>
            <div className="mt-5 p-4 bg-green-50 rounded-xl">
              💡 <strong>High‑demand sectors (tech, pharma, finance)</strong> offer excellent job prospects and average entry salaries of €45,000–70,000.
            </div>
          </section>

          {/* COMPARISON TABLE: IRELAND vs UK vs GERMANY */}
          <section className="overflow-x-auto bg-white rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold p-6 pb-3">🌍 Ireland vs UK vs Germany – quick snapshot</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100"><th className="border p-3">Factor</th><th className="border p-3">🇮🇪 Ireland</th><th className="border p-3">🇬🇧 UK</th><th className="border p-3">🇩🇪 Germany</th></tr>
              </thead>
              <tbody>
                <tr><td className="border p-3 font-bold">Tuition (per year)</td><td className="border p-3">€10,000–25,000</td><td className="border p-3">£15,000–35,000</td><td className="border p-3">€0–3,000 (public uni)</td></tr>
                <tr><td className="border p-3 font-bold">Living cost (monthly)</td><td className="border p-3">€1,000–1,500</td><td className="border p-3">£1,200–1,800</td><td className="border p-3">€800–1,200</td></tr>
                <tr><td className="border p-3 font-bold">Post‑study stay‑back</td><td className="border p-3">1–2 years</td><td className="border p-3">2 years</td><td className="border p-3">18 months (job‑seeker)</td></tr>
                <tr><td className="border p-3 font-bold">Language of instruction</td><td className="border p-3">English</td><td className="border p-3">English</td><td className="border p-3">German (strongly recommended)</td></tr>
                <tr><td className="border p-3 font-bold">Top industries</td><td className="border p-3">Tech, pharma, finance</td><td className="border p-3">Finance, consulting, healthcare</td><td className="border p-3">Engineering, IT, manufacturing</td></tr>
              </tbody>
            </table>
            <div className="p-5 text-sm text-gray-600">
              ✅ Ireland sits in the “sweet spot”: English‑speaking, affordable tuition, strong post‑study work rights and a direct path to European tech/pharma jobs.
            </div>
          </section>

          {/* FAQ SECTION (VISIBLE ACCORDION) */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">❓ Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              <details className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
                <summary className="font-semibold text-gray-800 cursor-pointer">1️⃣ Which is better for Indian students: Ireland vs UK vs Germany?</summary>
                <p className="text-gray-600 mt-3">Ireland offers an English‑speaking environment, reasonable tuition, and a 1–2 year stay‑back visa. The UK has higher fees and a 2‑year Graduate Route. Germany is affordable but requires German for many jobs and has an 18‑month job‑seeker visa. India’s tech and pharma talent fits Ireland’s booming job market perfectly.</p>
              </details>
              <details className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
                <summary className="font-semibold text-gray-800 cursor-pointer">2️⃣ What are the IELTS requirements for Irish universities?</summary>
                <p className="text-gray-600 mt-3">Most postgraduate programmes require IELTS 6.5 overall (no band below 6.0). Trinity College Dublin or UCD may ask for 7.0 for competitive courses. PTE Academic or TOEFL are also accepted. A valid English test score is mandatory for both admission and the D visa.</p>
              </details>
              <details className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
                <summary className="font-semibold text-gray-800 cursor-pointer">3️⃣ How much does it cost to live in Ireland as a student?</summary>
                <p className="text-gray-600 mt-3">Living expenses vary by city: Dublin €1,200–1,500/month; Galway, Cork or Limerick €900–1,200/month. Many students manage with part‑time earnings. Proof of at least €10,000 per year (excl. tuition) is required for the visa.</p>
              </details>
              <details className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
                <summary className="font-semibold text-gray-800 cursor-pointer">4️⃣ Can I work part‑time while studying in Ireland?</summary>
                <p className="text-gray-600 mt-3">Yes. Students holding a Stamp 2 permission can work up to 20 hours/week during term time and 40 hours/week during holidays (June–September, Christmas, Easter). On‑campus jobs, retail, hospitality, and university career portals are common sources of employment.</p>
              </details>
              <details className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
                <summary className="font-semibold text-gray-800 cursor-pointer">5️⃣ What are the top‑paying industries for Indian graduates in Ireland?</summary>
                <p className="text-gray-600 mt-3">Ireland’s tech sector (Dublin’s “Silicon Docks”), pharmaceutical and biotech clusters in Cork, and financial services offer the highest entry salaries. AI/ML roles start at €50,000–70,000; pharma jobs are similarly well compensated.</p>
              </details>
            </div>
          </section>

          {/* FINAL CALL‑TO‑ACTION */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-100 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-3">Ready to make Ireland your study destination?</h3>
            <p className="text-gray-700 max-w-2xl mx-auto mb-5">
              ANU Education helps you shortlist universities, prepare for IELTS/PTE, craft a winning SOP, and complete the D‑visa process – all the way to your Irish arrival.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/free-demo" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                🎓 Book free counselling
              </Link>
              <Link href="/test-prep/ielts-online" className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition">
                📘 Start IELTS / PTE prep
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">🌐 <strong>www.anuedu.in</strong> | 📞 <strong>+91 7016497087</strong> | 💬 <strong>WhatsApp +91 94281 86817</strong></p>
          </div>

          {/* INTERNAL LINKS */}
          <div className="text-sm text-center text-gray-500 border-t pt-6 mt-2">
            <p>
              Explore more: <Link href="/study-in/germany" className="text-blue-600 hover:underline">Study in Germany</Link> •
              <Link href="/study-in/canada" className="text-blue-600 hover:underline ml-1"> Study in Canada</Link> •
              <Link href="/ielts-preparation-guide" className="text-blue-600 hover:underline ml-1"> IELTS preparation guide</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}