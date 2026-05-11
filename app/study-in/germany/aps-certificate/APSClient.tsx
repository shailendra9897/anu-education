'use client';

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

// FAQ data outside component (static)
const faqs = [
  {
    q: "Is APS compulsory for all Indian students?",
    a: "Yes, APS is mandatory for nearly all Indian students applying for a German student visa, regardless of public or private universities. Exceptions include those with German/EU scholarships, prior German degrees, or short courses under 90 days.",
  },
  {
    q: "Can I submit other documents instead of APS?",
    a: "No, APS is the only verification accepted by German authorities for Indian academic credentials.",
  },
  {
    q: "What is the APS processing time?",
    a: "Standard processing is 3–6 weeks after documents arrive. During peak seasons (April–July and winter intakes), it can extend to 8–10 weeks.",
  },
  {
    q: "Why does APS processing time vary during peak seasons?",
    a: "Peak seasons see a high volume of applications from Indian students. Strategies to expedite include using Digilocker for marksheets and applying 3–4 months before visa deadlines.",
  },
  {
    q: "What documents are needed if APS requests more info?",
    a: "APS may ask for original institution verification, Digilocker PDFs, missing proofs (Class 12 admit card, consolidated transcripts), notarised translations, or an authorisation letter. They will email you specific instructions.",
  },
  {
    q: "How to submit additional documents to APS after initial application?",
    a: "Wait for APS email, then reply with attachments, including your application ID. No courier needed unless specified. For school verification, ask your institution to email APS directly.",
  },
  {
    q: "What is the APS fee? Are there extra charges for additional submissions?",
    a: "The non-refundable APS fee is ₹18,000. No additional fees apply for submitting extra documents requested during verification.",
  },
  {
    q: "Can I apply for a German student visa without APS?",
    a: "No, APS is mandatory for visa processing. Without it, your application will be rejected by German Missions in India.",
  },
];

export default function APSClient() {
  // ✅ ALL HOOKS CALLED UNCONDITIONALLY AT THE TOP
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // ✅ No early return before the return statement
  // (any early return would need to come AFTER hooks, but we don't need one here)

  return (
    <>
      {/* Article Schema */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            headline:
              "APS Certificate for Germany: Process, Fees & Documents for Indian Students",
            description:
              "Apply for an APS Certificate for Germany. Learn about APS fees, documents, and processing times, along with guidance on how to obtain a German student visa from India.",
            author: { "@type": "Organization", name: "ANU Education" },
            publisher: {
              "@type": "Organization",
              name: "ANU Education",
              logo: { "@type": "ImageObject", url: "https://www.anuedu.in/logo.png" },
            },
            datePublished: "2026-05-09",
            image: "https://www.anuedu.in/images/aps-certificate-guide.jpg",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://www.anuedu.in/study-in/germany/aps-certificate",
            },
          }),
        }}
      />

      {/* FAQ Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
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

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .stagger-1 {
          animation-delay: 0.1s;
        }
        .stagger-2 {
          animation-delay: 0.2s;
        }
        .stagger-3 {
          animation-delay: 0.3s;
        }
        .doc-table th,
        .doc-table td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
          vertical-align: top;
        }
        .doc-table th {
          background-color: #f1f5f9;
          font-weight: 600;
        }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-semibold mb-4">
              🇩🇪 Mandatory for German Student Visa
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              APS Certificate for Germany 2026: Process, Fees & Documents for Indian Students
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              All Indian students applying for a German student visa must have an APS certificate to verify academic
              documents. The process takes <strong>3–6 weeks</strong> on average and costs <strong>₹18,000</strong>.
            </p>
            <div className="mt-6">
              <a
  href="https://wa.me/919428186817?text=Hi%2C%20I%20need%20guidance%20for%20APS%20Certificate%20and%20Germany%20student%20visa."
  target="_blank"
  rel="noopener noreferrer"
  className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition inline-flex items-center gap-2"
>
  💬 Get APS & Visa Guidance
</a>
            </div>
          </div>

          {/* What is APS */}
          <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">What is APS Certificate?</h2>
            <p className="text-gray-700">
              The <strong>APS (Akademische Prüfstelle)</strong> certificate verifies that your Indian academic
              qualifications are genuine and meet German standards for university admission. Issued by the German
              Embassy's Academic Evaluation Centre in New Delhi, it's your first step before visa applications. This
              digital certificate is sent via email and remains valid indefinitely once approved.
            </p>
          </section>

          {/* Is APS Mandatory */}
          <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">Is APS Mandatory?</h2>
            <p className="text-gray-700">
              Yes, APS is mandatory for nearly all Indian students applying for a German student visa, regardless of
              public or private universities. Exceptions include those with German/EU scholarships, prior German
              degrees, or short courses under 90 days.
              <strong> Without it, your visa application gets rejected by German Missions in India.</strong>
            </p>
          </section>

          {/* Documents Required – Table */}
          <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4">Documents Required</h2>
            <p className="text-gray-700 mb-4">
              Gather these self‑attested colour copies for a smooth process – originals may be requested later.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full doc-table">
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="font-semibold">Passport</td><td>First and last pages</td></tr>
                  <tr><td className="font-semibold">Class 10</td><td>Marksheet and certificate</td></tr>
                  <tr><td className="font-semibold">Class 12</td><td>Marksheet, certificate, and admit card (if available)</td></tr>
                  <tr><td className="font-semibold">Bachelor's (for Master's applicants)</td><td>All semester marksheets, degree/provisional certificate</td></tr>
                  <tr><td className="font-semibold">Language Proof</td><td>IELTS/TOEFL or German proficiency (if available)</td></tr>
                  <tr><td className="font-semibold">Other</td><td>Signed application form, fee receipt, Aadhaar copy, passport photo</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              *Regional language documents need notarised English translations.
            </p>
          </section>

          {/* Application Process – Step-by-Step */}
          <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4">APS Application Process</h2>
            <div className="space-y-3">
              {[
                "Review requirements and checklists on aps-india.de.",
                "Register online and select your process (e.g., undergraduate or graduate).",
                "Pay the fee online (INR 18,000).",
                "Print and sign the form; assemble documents.",
                "Send via courier to APS office (no personal visits).",
                "Track status in your account; attend interview if called.",
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="font-bold text-blue-600 w-6">{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-gray-600">
              Some applicants face a short interview for verification. Start 2–3 months before visa deadlines.
            </p>
          </section>

          {/* APS Fees */}
          <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">APS Fees</h2>
            <p className="text-gray-700">
              The non‑refundable APS fee is <strong>₹18,000</strong>, paid online or via bank transfer using your name
              and passport number as reference. Extra costs for translations or courier (around ₹1,000–2,000). No
              refunds for incomplete applications.
            </p>
          </section>

          {/* Processing Time + Peak Seasons */}
          <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">APS Processing Time</h2>
            <p className="text-gray-700 mb-3">
              Expect <strong>3–6 weeks</strong> after documents arrive. Peak seasons (April–July, winter intakes) can
              stretch to 8–10 weeks. Digital certificates arrive via email after verification or interview (within 2
              weeks after).
            </p>
            <div className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-400">
              <p className="font-semibold">💡 Tip to speed up:</p>
              <p>Apply 3–4 months before visa deadlines; use Digilocker for marksheets to help verification.</p>
            </div>
          </section>

          {/* Common Mistakes */}
          <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">Common Mistakes to Avoid</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Rushing without full documents – delays everything</li>
              <li>Missing deadlines for intake peaks</li>
              <li>Unnotarised translations</li>
              <li>Wrong payment references</li>
              <li>Emailing for status (APS won't reply)</li>
            </ul>
          </section>

          {/* APS & Visa Connection */}
          <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">APS and Visa Connection</h2>
            <p className="text-gray-700">
              APS proves your academics are legit, a must‑have on the German Missions' student visa checklist. Submit it
              with your visa application at VFS; <strong>without APS, no interview slot</strong>.
            </p>
          </section>

          {/* Internal Links */}
          <div className="bg-blue-50 p-6 rounded-2xl text-center mb-8">
            <h3 className="text-xl font-bold mb-3">🇩🇪 Need more help?</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/study-in/germany" className="text-blue-700 hover:underline">
                Study in Germany – Complete Guide
              </Link>
              <span>•</span>
              <Link href="/test-prep/ielts-online" className="text-blue-700 hover:underline">
                IELTS Coaching
              </Link>
              <span>•</span>
              <Link href="/test-prep/german" className="text-blue-700 hover:underline">
                German Language Classes
              </Link>
              <span>•</span>
              <Link href="/study-in/germany/blocked-account" className="text-blue-700 hover:underline">
                Blocked Account Guide
              </Link>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Free counselling on APS, visa, university selection –{" "}
              <Link href="/free-demo" className="text-green-600 font-semibold">
                book a demo
              </Link>.
            </p>
          </div>

          {/* FAQ Section (Accordion) */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">❓ Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-gray-800">{faq.q}</span>
                    <span className="text-blue-600 text-xl">{openFaq === idx ? "−" : "+"}</span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-4 text-gray-600 border-t border-gray-100">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <div className="mt-12 text-center">
            <a
  href="https://wa.me/919428186817?text=Hi%2C%20I%20need%20guidance%20for%20APS%20Certificate%20and%20Germany%20student%20visa."
  target="_blank"
  rel="noopener noreferrer"
  className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition inline-flex items-center gap-2"
>
  💬 Get APS & Visa Guidance
</a>
          </div>
        </div>
      </main>
    </>
  );
}