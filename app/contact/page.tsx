import Script from "next/script";
import ContactForm from "@/components/ContactForm";
import {
  websiteWhatsAppMessages,
  getWhatsAppLink,
} from "@/lib/whatsappTemplates";

export const metadata = {
  title: "Contact ANU Education – IELTS, PTE & Study Abroad Coaching",
  description:
    "Contact ANU Education for IELTS, PTE, German & French language coaching and study abroad consultancy in Modasa, Gujarat. Call, WhatsApp or book a free counselling session today.",
};

const services = [
  { label: "IELTS Online Coaching", href: "/test-prep/ielts-online" },
  { label: "PTE Online Coaching", href: "/test-prep/pte" },
  { label: "German Language Course", href: "/test-prep/german" },
  { label: "French Language Course", href: "/test-prep/french" },
  { label: "Study Abroad Consultant", href: "/study-abroad" },
  { label: "TOEFL Coaching", href: "/test-prep/toefl" },
];

export default function ContactPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "name": "ANU Education",
    "image": "https://www.anuedu.in/logo.png",
    "logo": "https://www.anuedu.in/logo.png",
    "url": "https://www.anuedu.in",
    "telephone": "+917016497087",
    "email": "info@anuedu.in",
    "description":
      "ANU Education is a Skill India certified study abroad consultancy and language coaching institute in Modasa, Gujarat offering IELTS, PTE, German, French, TOEFL and Duolingo preparation.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Krishna 137, Dwarkapuri Bunglows, Gitanjali Society",
      "addressLocality": "Modasa",
      "addressRegion": "Gujarat",
      "postalCode": "383315",
      "addressCountry": "IN",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 23.4675584,
      "longitude": 73.3084437,
    },
    "openingHours": "Mo-Sa 09:00-19:00",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "bestRating": "5",
      "reviewCount": "120",
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+917016497087",
        "contactType": "customer support",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi", "Gujarati"],
      },
    ],
    "makesOffer": [
      { "@type": "Service", "name": "IELTS Online Coaching" },
      { "@type": "Service", "name": "PTE Online Coaching" },
      { "@type": "Service", "name": "German Language Course" },
      { "@type": "Service", "name": "French Language Course" },
      { "@type": "Service", "name": "TOEFL Coaching" },
      { "@type": "Service", "name": "Duolingo English Test Preparation" },
      { "@type": "Service", "name": "Study Abroad Consultant" },
      { "@type": "Service", "name": "Visa Assistance" },
    ],
    "sameAs": [
      "https://www.facebook.com/anueducation",
      "https://www.instagram.com/anueducation",
    ],
  };

  return (
    <>
      {/* ===== SEO SCHEMA (site-wide — also add this to layout.tsx) ===== */}
      <Script
        id="anu-education-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="min-h-screen bg-white">

        {/* ── HERO BANNER ── */}
        <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-2">
              Get in touch
            </p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Contact ANU Education
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Expert guidance for{" "}
              <strong className="text-white">IELTS, PTE, German & French</strong>{" "}
              coaching and{" "}
              <strong className="text-white">Study Abroad consultancy</strong>.
              Based in Modasa, serving students across India — online & in-person.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-12 space-y-14">

          {/* ── CONTACT CARDS ── */}
          <section aria-label="Contact details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Call */}
              <a
                href="tel:+917016497087"
                aria-label="Call ANU Education at +91 70164 97087"
                className="flex flex-col items-center text-center gap-2 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
              >
                <span className="text-3xl" aria-hidden="true">📞</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-blue-500">Call us</span>
                <span className="text-blue-700 font-semibold text-sm">+91 70164 97087</span>
                <span className="text-xs text-gray-400">Mon–Sat, 9am–7pm</span>
              </a>

              {/* WhatsApp */}
              <a
                href={getWhatsAppLink(websiteWhatsAppMessages.home)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with ANU Education on WhatsApp"
                className="flex flex-col items-center text-center gap-2 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-200 transition-colors group"
              >
                <span className="text-3xl" aria-hidden="true">💬</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-green-600">WhatsApp</span>
                <span className="text-green-600 font-semibold text-sm">Chat instantly</span>
                <span className="text-xs text-gray-400">Usually replies in 2 hrs</span>
              </a>

              {/* Email */}
              <a
                href="mailto:info@anuedu.in"
                aria-label="Email ANU Education at info@anuedu.in"
                className="flex flex-col items-center text-center gap-2 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
              >
                <span className="text-3xl" aria-hidden="true">✉️</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-blue-500">Email</span>
                <span className="text-blue-700 font-semibold text-sm">info@anuedu.in</span>
                <span className="text-xs text-gray-400">We respond within 24 hrs</span>
              </a>

              {/* Google Review */}
              <a
                href="https://g.page/r/CYymYi7iPXA4EBM/review"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Leave a Google review for ANU Education"
                className="flex flex-col items-center text-center gap-2 p-5 rounded-2xl border border-yellow-100 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-300 transition-colors group"
              >
                <span className="text-3xl" aria-hidden="true">⭐</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-600">Google Review</span>
                <span className="text-yellow-700 font-semibold text-sm">Rate us 5 stars</span>
                <span className="text-xs text-gray-400">4.8 ★ · 20+ reviews</span>
              </a>

            </div>
          </section>

          {/* ── ADDRESS + MAP ── */}
          <section aria-label="Office location" className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Visit our office</h2>
              <address className="not-italic text-gray-600 leading-relaxed">
                📍 Krishna 137, Dwarkapuri Bunglows,<br />
                Gitanjali Society, Modasa,<br />
                Gujarat 383315, India
              </address>
              <p className="text-gray-600 text-sm">
                🕐 <strong>Office hours:</strong> Monday – Saturday, 9:00 AM – 7:00 PM
              </p>
              <p className="text-gray-600 text-sm">
                🌐 Online sessions available pan-India
              </p>
            </div>

            {/* Replace src with your GBP embed URL from Google Maps → Share → Embed a map */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <iframe
                title="ANU Education Location – Modasa, Gujarat"
                src="https://www.google.com/maps?q=23.4675584,73.3084437&z=15&output=embed"
                width="100%"
                height="280"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>

          {/* ── CERTIFIED COUNSELLOR (moved above form) ── */}
          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-3">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  Skill India Certified
                </span>
                <h2 className="text-2xl font-bold text-blue-900">
                  Certified Career & Education Counselling
                </h2>
                <p className="text-blue-800">
                  ANU Education is led by a{" "}
                  <strong>Skill India certified Career & Education Counsellor</strong> —
                  ethical, transparent, and student-first guidance with zero sales pressure.
                </p>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>✔ 1,000+ students guided successfully</li>
                  <li>✔ No sales pressure counselling</li>
                  <li>✔ Online & in-person sessions</li>
                  <li>✔ Guidance in English, Hindi & Gujarati</li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 min-w-fit">
                <a
                  href="https://anueducation.applyviz.com/walk-in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-700 text-white px-6 py-3 rounded-xl hover:bg-blue-800 text-center font-semibold transition-colors"
                >
                  👉 Book Free Counselling
                </a>
                <a
                  href="https://study.anuedu.in/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-blue-700 border border-blue-300 px-6 py-3 rounded-xl hover:bg-blue-50 text-center font-semibold transition-colors"
                >
                  📚 Book Free Demo Class
                </a>
              </div>
            </div>
          </section>

          {/* ── ENQUIRY FORM ── */}
          <section>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Submit Your Enquiry</h2>
              <p className="text-gray-500 text-sm">
                Fill the form below — we'll get back to you within 2 hours on WhatsApp.
              </p>
            </div>
            <ContactForm />
          </section>

          {/* ── SERVICES ── */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Our Services</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {services.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="flex items-center gap-2 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors text-sm font-medium text-gray-700 hover:text-blue-700"
                >
                  <span className="text-blue-500 text-base" aria-hidden="true">→</span>
                  {label}
                </a>
              ))}
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Start Your Journey with ANU Education</h3>
            <p className="text-blue-100 mb-6">
              Book a <strong>FREE demo class or counselling session</strong> today — no commitment required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://study.anuedu.in/register"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                Book Free Course
              </a>
              <a
                href={getWhatsAppLink(websiteWhatsAppMessages.home)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with ANU Education on WhatsApp"
                className="bg-green-500 text-white font-semibold px-8 py-3 rounded-xl hover:bg-green-600 transition-colors"
              >
                💬 WhatsApp Us Now
              </a>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}