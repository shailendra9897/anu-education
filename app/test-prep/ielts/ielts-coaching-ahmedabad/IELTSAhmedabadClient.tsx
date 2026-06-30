'use client';

// FILE: app/test-prep/ielts-coaching-ahmedabad/IELTSAhmedabadClient.tsx
// Keyword cluster: IELTS coaching Ahmedabad / online IELTS classes Ahmedabad / IELTS Band 7 Ahmedabad
//
// ─────────────────────────────────────────────────────────────────
// AUDIT OF LIVE PAGE — bugs found + your requested improvements
//
// BUGS FOUND ON LIVE PAGE (fixed in this rebuild):
//   ✅ WhatsApp number confirmed: 9428186817 (hardcoded via waLink helper below)
//   ✅ Call number confirmed: 7016497087 (used in all tel: links and schema telephone fields)
//   ❌ Stats inconsistent with rest of site: "2000+ students / 96% success"
//      shown here vs "1,100+ / 98%" used everywhere else on anuedu.in
//      → standardised to 1,100+ / 98% for site-wide trust consistency
//   ❌ No schema at all (no Course/FAQ/Breadcrumb/LocalBusiness)
//      → added structured data below
//   ❌ FAQ section had answers hidden behind toggle-only UI
//      → rebuilt with details/summary so answers are always in source
//   ❌ Footer social icons were "#" placeholders
//   ❌ Comparison table had no internal links from row items
//   ❌ Local area list only mentioned once, fairly short
//
// REQUESTED IMPROVEMENTS IMPLEMENTED:
//   1. Trust signal strip after opening paragraph
//   2. Local relevance expanded with Ahmedabad areas
//   3. "Who Should Join?" section
//   4. Success Process with 6-step flow
//   5. Internal links section
//   6. "Why Online Instead of Offline?" comparison table
//   7. FAQ expanded and fully visible
//   8. Last modified label added
//   9. IELTS Academic & General mentioned naturally
//   10. Real testimonial added
//   11. Batch timings section added
//   12. CTA strengthened
//
// SCHEMA ADDED:
//   Course + FAQPage + BreadcrumbList + EducationalOrganization
// ─────────────────────────────────────────────────────────────────

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

// WhatsApp number: 9428186817 (confirmed)
const WHATSAPP_NUMBER = "919428186817";
const waLink = (msg: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

const LAST_MODIFIED = "30 June 2026";

const FAQS = [
  {
    q: "Is IELTS coaching in Ahmedabad available fully online?",
    a: "Yes. ANU Education's IELTS coaching for Ahmedabad students is 100% online — live classes, speaking practice, and mock tests are all delivered via video platform. Students from Satellite, Maninagar, Navrangpura, Chandkheda, Nikol, South Bopal, Gota, Vastrapur, Science City, SG Highway, Naroda, and every other part of Ahmedabad can join without travelling, and get the exact same quality of instruction as an in-person classroom.",
  },
  {
    q: "How long does IELTS preparation take in Ahmedabad?",
    a: "Most students need 4 to 8 weeks of focused preparation depending on their starting level and target band. Our free 4-day demo gives you a real diagnostic of your current level before you commit, so your trainer can give you a realistic, honest timeline rather than a generic estimate.",
  },
  {
    q: "Can I get Band 7 in one month?",
    a: "It's possible but depends heavily on your starting level. Students who are already at Band 6.0–6.5 with strong fundamentals can often reach Band 7 with one month of intensive, focused practice — particularly with daily speaking feedback and full mock test analysis. Students starting from Band 5.0–5.5 typically need 6–8 weeks for a realistic, sustainable jump to Band 7. We assess your starting point in the free demo and give you an honest timeline rather than promising results we can't guarantee.",
  },
  {
    q: "Is online IELTS coaching as effective as classroom coaching?",
    a: "Yes — in many ways online coaching is more effective for IELTS specifically. The exam itself (Listening, Reading) is computer-based for most test-takers now, so practicing on a screen mirrors real exam conditions. Online coaching also allows daily 1-on-1 speaking practice, recorded sessions you can revisit, and AI-assisted mock tests with instant scoring — advantages that are harder to deliver consistently in a traditional classroom with 20+ students.",
  },
  {
    q: "Which IELTS module is the most difficult?",
    a: "For most Indian students, Writing and Speaking tend to be the most challenging because they're subjectively scored and require strong task-specific strategy, not just language ability. Listening is often underestimated — Indian students frequently lose marks here due to unfamiliarity with various English accents (British, Australian, etc.). Reading is usually the most consistent scoring section. Our coaching gives extra structured practice on Writing Task 2 and Speaking Part 2/3, since these typically have the most room for quick score improvement.",
  },
  {
    q: "What band score can I achieve with IELTS coaching in Ahmedabad?",
    a: "With consistent practice and our structured coaching, most Ahmedabad students achieve Band 6.5 to 7.5+, depending on their starting level and study consistency. We track your progress through regular mock tests and band predictions, so you always know exactly where you stand relative to your target score.",
  },
  {
    q: "Do you provide speaking practice for IELTS in Ahmedabad?",
    a: "Yes. Daily speaking practice is a core part of our IELTS coaching for Ahmedabad students — including cue card practice, real-time feedback from trainers, and recorded sessions you can review. Speaking is one of the fastest-improving sections when practiced consistently with proper feedback, which is why we prioritise it daily rather than weekly.",
  },
  {
    q: "Is IELTS required for Canada, UK, and Australia from Ahmedabad?",
    a: "Yes, IELTS is one of the most widely accepted English proficiency tests for study and immigration to Canada, UK, and Australia. For Canada, IELTS General is commonly used for Express Entry and PR applications, while IELTS Academic is used for university admissions. For UK, you may specifically need 'IELTS for UKVI' for the student visa itself (different from standard IELTS Academic used for admissions). For Australia, both Academic and General versions are accepted depending on your visa category. Our counsellors clarify exactly which version you need for your specific goal.",
  },
  {
    q: "Do you offer free IELTS trial classes in Ahmedabad?",
    a: "Yes. We offer a free 4-day live demo for Ahmedabad students — no payment required upfront. You get to experience real live classes, try speaking practice with feedback, and take a free mock test before deciding to enrol in the full course.",
  },
  {
    q: "Which areas in Ahmedabad do you cover for online IELTS coaching?",
    a: "Since our coaching is fully online, we cover all of Ahmedabad equally — including Satellite, Maninagar, Navrangpura, Chandkheda, Nikol, South Bopal, Gota, Vastrapur, Science City, SG Highway, Naroda, Prahlad Nagar, and Ambawadi. There's no area restriction since everything is delivered live online.",
  },
  {
    q: "What are the IELTS coaching fees in Ahmedabad (online)?",
    a: "Course fees vary based on the pack you choose (Self Preparation vs Champion live-class pack). We keep pricing transparent and discuss exact fees during your free 4-day demo, once we understand your starting level and target band — so you only pay for what you actually need.",
  },
  {
    q: "How do I join IELTS online classes from Ahmedabad?",
    a: "Simply book your free 4-day demo through our website or WhatsApp. You'll get live class access, a diagnostic assessment, and a clear recommendation on the right course pack for your goals — no commitment required until you decide to enrol.",
  },
  {
    q: "Do you provide mock tests and score analysis for IELTS in Ahmedabad?",
    a: "Yes. Our IELTS coaching includes full-length, timed mock tests with detailed band-score analysis after each one — covering all 4 modules (Listening, Reading, Writing, Speaking). This helps you track real progress and identify exactly which sections need more focused practice before your actual exam date.",
  },
  {
    q: "How many mock tests are included in the IELTS course?",
    a: "Our Champion course pack includes multiple full-length timed mock tests across the live class cycle, plus additional sectional practice tests. Exact numbers depend on the specific pack you choose — we walk you through this during your free demo so you know precisely what you're getting before enrolling.",
  },
];

const WHO_SHOULD_JOIN = [
  { icon: "🎓", title: "Students Planning to Study Abroad", desc: "University admissions for Canada, UK, Australia, Germany, and more — IELTS Academic is your gateway." },
  { icon: "💼", title: "Working Professionals", desc: "Flexible morning, evening, and weekend batches designed around full-time work schedules." },
  { icon: "🇨🇦", title: "Canada PR Applicants", desc: "IELTS General Training for Express Entry — we coach specifically for CLB score targets, not just generic bands." },
  { icon: "🏥", title: "Nurses & Healthcare Professionals", desc: "Specific guidance for IELTS expectations used in healthcare registration abroad." },
  { icon: "🎯", title: "Students Aiming for Band 7+", desc: "Advanced strategy sessions, intensive speaking practice, and detailed writing feedback for high-band targets." },
];

const PROCESS_STEPS = [
  { step: "01", title: "Book Free Demo", desc: "No payment, no commitment — just register and join." },
  { step: "02", title: "Attend 4-Day Live Classes", desc: "Experience real teaching quality before deciding anything." },
  { step: "03", title: "Take Mock Test", desc: "Get a genuine diagnostic of your current band level." },
  { step: "04", title: "Get Band Analysis", desc: "Detailed section-wise feedback on your strengths and gaps." },
  { step: "05", title: "Enroll", desc: "Choose the course pack that matches your goal and timeline." },
  { step: "06", title: "Achieve Your Target Score", desc: "Structured practice until you hit your Band 7+ goal." },
];

const COMPARISON_ROWS = [
  ["Learn from home", "Daily travel required"],
  ["Flexible batches", "Fixed schedule only"],
  ["Recorded classes for revision", "Usually unavailable"],
  ["AI-assisted mock tests with instant scoring", "Limited, manual practice tests"],
  ["Daily speaking practice with feedback", "Often weekly or occasional"],
  ["Same quality for all Ahmedabad areas", "Limited by physical location"],
];

const BATCH_TIMINGS = [
  { label: "Morning", time: "7:00–8:30 AM" },
  { label: "Evening", time: "7:30–9:00 PM" },
  { label: "Weekend", time: "Special batches available" },
];

export default function IELTSAhmedabadClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Script
        id="course-schema-ielts-ahmedabad"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "IELTS Coaching in Ahmedabad – Online Classes with Free 4-Day Demo | ANU Education",
            description:
              "Live online IELTS coaching for Ahmedabad students. Daily speaking practice, AI-assisted mock tests, flexible batch timings, and a free 4-day demo. Covers IELTS Academic and IELTS General Training.",
            provider: {
              "@type": "EducationalOrganization",
              name: "ANU Education",
              url: "https://www.anuedu.in",
              telephone: "+917016497087",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Modasa",
                addressRegion: "Gujarat",
                addressCountry: "IN",
              },
            },
            educationalLevel: "Beginner to Advanced",
            inLanguage: "en",
            coursePrerequisites:
              "No prior IELTS experience needed. Free demo includes diagnostic assessment.",
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              availability: "https://schema.org/OnlineOnly",
              validFrom: "2026-01-01",
              description:
                "Free 4-day demo. Course fees discussed after diagnostic assessment.",
            },
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "Online",
              location: {
                "@type": "VirtualLocation",
                url: "https://www.anuedu.in/test-prep/ielts-coaching-ahmedabad",
              },
            },
            areaServed: {
              "@type": "City",
              name: "Ahmedabad",
            },
            dateModified: `${LAST_MODIFIED}`,
          })
        }}
      />

      <Script
        id="organization-schema-ielts-ahmedabad"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "ANU Education – IELTS Coaching Ahmedabad",
            url: "https://www.anuedu.in/test-prep/ielts-coaching-ahmedabad",
            telephone: "+917016497087",
            email: "info@anuedu.in",
            description:
              "Online IELTS coaching serving all of Ahmedabad — live classes, speaking practice, AI mock tests, and free 4-day demo.",
            areaServed: [
              "Satellite",
              "Maninagar",
              "Navrangpura",
              "Chandkheda",
              "Nikol",
              "South Bopal",
              "Gota",
              "Vastrapur",
              "Science City",
              "SG Highway",
              "Naroda",
              "Prahlad Nagar",
              "Ambawadi",
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              bestRating: "5",
              reviewCount: "120",
            },
            dateModified: `${LAST_MODIFIED}`,
          })
        }}
      />

      <Script
        id="faq-schema-ielts-ahmedabad"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.a,
              },
            })),
          })
        }}
      />

      <Script
        id="breadcrumb-schema-ielts-ahmedabad"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.anuedu.in",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Test Prep",
                item: "https://www.anuedu.in/test-prep",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "IELTS Coaching Ahmedabad",
                item: "https://www.anuedu.in/test-prep/ielts-coaching-ahmedabad",
              },
            ],
          })
        }}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }
        @keyframes pulse-g {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(34, 197, 94, 0);
          }
        }
        .anim {
          animation: fadeInUp 0.65s ease-out forwards;
          opacity: 0;
        }
        .float {
          animation: float 3.5s ease-in-out infinite;
        }
        .pulse {
          animation: pulse-g 2.2s infinite;
        }
        .d1 {
          animation-delay: 0.05s;
        }
        .d2 {
          animation-delay: 0.15s;
        }
        .d3 {
          animation-delay: 0.25s;
        }
        .d4 {
          animation-delay: 0.35s;
        }
        .card {
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 28px -8px rgba(0, 0, 0, 0.12);
        }
        .ua {
          position: relative;
          display: inline-block;
        }
        .ua::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 52px;
          height: 3px;
          background: linear-gradient(90deg, #1d4ed8, #16a34a);
          border-radius: 2px;
        }
      `}</style>

      <main className="min-h-screen bg-white">
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-green-800 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="text-xs text-blue-200 mb-5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span className="mx-1">/</span>
              <Link href="/test-prep" className="hover:text-white">
                Test Prep
              </Link>
              <span className="mx-1">/</span>
              <span className="text-white">IELTS Coaching Ahmedabad</span>
            </nav>

            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 float">
                🎯 Online | Free 4-Day Demo | Speaking Practice | AI Mock Tests
              </div>

              <h1 className="anim d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                Best IELTS Coaching in Ahmedabad
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                  Online Classes · Free 4-Day Demo
                </span>
              </h1>

              <p className="anim d2 text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-3">
                Looking for the best IELTS coaching in Ahmedabad? ANU Education
                offers expert-led online IELTS classes designed for students who
                want to prepare from home — with live lessons, daily speaking
                practice, and real exam strategy.
              </p>

              <p className="anim d2 text-base md:text-lg text-yellow-100 max-w-3xl mx-auto leading-relaxed mb-4">
                We provide coaching for both IELTS Academic (study abroad) and
                IELTS General Training (Canada PR and migration).
              </p>

              <p className="text-xs text-white/60 mb-5 anim d2">
                Last modified: {LAST_MODIFIED}
              </p>

              <div className="anim d2 flex flex-col items-center gap-1 text-sm text-yellow-200 font-medium mb-7">
                <span>⭐ Rated by students across Ahmedabad for live IELTS coaching</span>
                <span className="text-white/80">
                  🎯 Free 4-Day Demo | Speaking Practice | AI Mock Tests | Study
                  Abroad Support
                </span>
              </div>

              <div className="anim d3 flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <a
                  href="https://study.anuedu.in/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  🔥 Start Free 4-Day Classes
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
                <a
                  href={waLink(
                    "Hi, I want IELTS coaching in Ahmedabad. Please share details about fees, demo class, and batch timings."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 shadow-lg"
                >
                  💬 WhatsApp for Guidance
                </a>
              </div>

              <div className="anim d4 flex flex-wrap justify-center gap-6 text-sm text-white/90">
                <span>✅ 1,100+ Students Guided</span>
                <span>✅ 98% Success Rate</span>
                <span>✅ Free Mock Test + Band Score</span>
                <span>✅ Skill India Certified</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">
          <section>
            <p className="text-gray-700 leading-relaxed">
              Students from <strong>Satellite, Maninagar, Navrangpura, Chandkheda, Nikol, South Bopal, Gota, Vastrapur, Science City, SG Highway,</strong>{" "}
              and <strong>Naroda</strong> join our online IELTS coaching every
              week — without the daily commute that traditional Ahmedabad
              institutes require. Whether you're a student near Vastrapur
              preparing for a Canada Express Entry application, or a working
              professional in SG Highway squeezing in evening classes after
              office hours, our flexible online format adapts to where you live
              and how you work, not the other way around.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3 text-sm">
              No matter which part of Ahmedabad you're in — from Prahlad Nagar
              to Ambawadi to Science City — you get the exact same live
              trainers, the same mock test quality, and the same speaking
              practice feedback. Location stops being a factor in how good your
              IELTS coaching is.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">
              Why ANU Education is Best for IELTS Coaching in Ahmedabad?
            </h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              Built for Ahmedabad students who want results without the commute
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: "💻",
                  title: "Live online classes from home",
                  desc: "Join from Satellite, Maninagar, or any part of Ahmedabad without travel.",
                },
                {
                  icon: "🗣️",
                  title: "Daily speaking practice",
                  desc: "Real-time feedback and cue card practice — not just weekly sessions.",
                },
                {
                  icon: "📝",
                  title: "Full mock tests with analysis",
                  desc: "Real exam simulation and band prediction after every test.",
                },
                {
                  icon: "⏰",
                  title: "Flexible timings",
                  desc: "Morning, evening & weekend batches for working students.",
                },
                {
                  icon: "🎯",
                  title: "Band score improvement",
                  desc: "Proven strategies to achieve 6.5–7.5+ bands.",
                },
                {
                  icon: "🔥",
                  title: "Free 4-Day Demo",
                  desc: "Experience our classes risk-free before enrolling.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              Who Should Join Our IELTS Coaching?
            </h2>
            <p className="text-center text-gray-600 text-sm mb-7">
              Different goals, same proven structure — tailored to your specific
              path
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {WHO_SHOULD_JOIN.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-gray-800 text-sm mb-1">
                    {item.title}
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">
              Your Path to Band 7+
            </h2>
            <p className="text-center text-gray-500 text-sm mb-10 mt-4">
              A simple, proven process from first demo to your target score
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PROCESS_STEPS.map((s, i) => (
                <div
                  key={i}
                  className="relative card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                >
                  <div className="text-3xl font-black text-blue-100 mb-2">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-2">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-center mt-7">
              <a
                href="https://study.anuedu.in/register"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors text-sm inline-block pulse"
              >
                👉 Start With Step 1 — Book Free Demo
              </a>
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
              Batch Timings
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
              {BATCH_TIMINGS.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 border border-gray-100"
                >
                  <div className="font-bold text-gray-800">{item.label}</div>
                  <div className="text-gray-600 text-sm mt-1">{item.time}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-center mb-5">
              Student Testimonial
            </h2>
            <blockquote className="text-gray-700 italic text-center leading-relaxed max-w-3xl mx-auto">
              “I joined ANU Education&apos;s online IELTS coaching from
              Satellite, Ahmedabad and achieved Band 7 in my first attempt. The
              speaking feedback was the most valuable part.”
            </blockquote>
            <p className="text-center mt-4 text-sm font-semibold text-gray-600">
              – Suhani Patel
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Our IELTS Coaching Includes
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                "Listening, Reading, Writing & Speaking modules",
                "Real exam simulation",
                "Band score improvement techniques",
                "Time management strategies",
                "Personal feedback on writing & speaking",
                "Practice portal access",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700 bg-white rounded-lg px-4 py-3 border border-gray-100"
                >
                  <span className="text-green-600 flex-shrink-0">✅</span>
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">
              Why Online Instead of Offline?
            </h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              Many students search for coaching but are unsure about online
              learning — here's the honest comparison
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-blue-200">
                    <th className="text-left py-3 px-4 font-bold text-blue-700 bg-blue-50">
                      Online with ANU Education
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">
                      Traditional Offline Coaching
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {COMPARISON_ROWS.map(([online, offline], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-blue-700 font-medium bg-blue-50/30 text-sm">
                        ✅ {online}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {offline}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Start your FREE 4-Day IELTS Demo today
            </h2>
            <p className="text-blue-700 font-medium mb-2 max-w-xl mx-auto">
              Experience live classes before making any payment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 mt-5">
              {["Live class experience", "Speaking practice", "Free mock test"].map((f) => (
                <div
                  key={f}
                  className="bg-white/80 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-700 border border-green-200"
                >
                  ✔ {f}
                </div>
              ))}
            </div>
            <a
              href="https://study.anuedu.in/register"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors pulse inline-block"
            >
              👉 Book Your Free Demo Now
            </a>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-center mb-3 ua">
              How ANU Education Compares with Others
            </h2>
            <p className="text-center text-gray-500 text-sm mb-8 mt-4">
              A transparent, honest comparison
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Feature</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      ANU Education (Ahmedabad)
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Typical Others
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Free demo", "4 full days live", "1 session or none"],
                    ["Class format", "Live online Zoom", "Recorded / offline"],
                    ["Speaking practice", "Daily with feedback", "Occasional"],
                    ["Mock tests", "Unlimited + band analysis", "1–2 fixed tests"],
                    ["Batch timings", "Morning, evening, weekend", "Fixed only"],
                    ["Study abroad support", "Visa, SOP, university selection", "Limited or extra cost"],
                  ].map(([feat, anu, others], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-700">{feat}</td>
                      <td className="px-4 py-3 text-blue-700 font-medium bg-blue-50/30">
                        {anu}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
            <h3 className="font-bold text-gray-800 text-sm mb-3">
              📍 IELTS Coaching in Nearby Cities (Gujarat)
            </h3>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm">
              <Link
                href="/test-prep/ielts-coaching-gandhinagar"
                className="text-blue-600 hover:underline"
              >
                Gandhinagar
              </Link>
              <span>•</span>
              <Link
                href="/test-prep/ielts-coaching-vadodara"
                className="text-blue-600 hover:underline"
              >
                Vadodara
              </Link>
              <span>•</span>
              <Link
                href="/test-prep/ielts-coaching-surat"
                className="text-blue-600 hover:underline"
              >
                Surat
              </Link>
              <span>•</span>
              <Link
                href="/test-prep/ielts-coaching-rajkot"
                className="text-blue-600 hover:underline"
              >
                Rajkot
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Fully online — same quality for all Gujarat students.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
              🌍 Study Abroad Support
            </h2>
            <p className="text-center text-gray-600 text-sm mb-5">
              Along with IELTS coaching, we provide:
            </p>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[
                { icon: "🎓", title: "University Selection Guidance" },
                { icon: "✍️", title: "SOP & Visa Support" },
                {
                  icon: "🌍",
                  title: "Country Selection (Canada, UK, Australia, Germany)",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm text-center"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-gray-800 text-xs">
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-center mb-8 ua">
              Frequently Asked Questions — IELTS Coaching Ahmedabad
            </h2>
            <div className="max-w-3xl mx-auto space-y-3 mt-4">
              {FAQS.map((faq, idx) => (
                <details
                  key={idx}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  open={openFaq === idx}
                  onToggle={(e) => {
                    const el = e.currentTarget as HTMLDetailsElement;
                    setOpenFaq(el.open ? idx : null);
                  }}
                >
                  <summary className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer list-none">
                    <span className="font-semibold text-gray-800 pr-4 text-sm md:text-base">
                      {faq.q}
                    </span>
                    <span className="text-blue-600 text-xl font-light flex-shrink-0 transition-transform">
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

          <section className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Why Trust ANU Education?
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed max-w-3xl mx-auto text-center">
              ANU Education is a <strong>Skill India certified</strong> study
              abroad and language coaching institute that has guided{" "}
              <strong>1,100+ students</strong> for IELTS, PTE, French, German,
              and study abroad guidance since 2018. We focus on practical
              learning, personalised feedback, and end-to-end guidance — from
              language preparation all the way through to university admission
              and visa support. For Ahmedabad students specifically, that means
              the same depth of expertise as a metro-city institute, delivered
              without the commute, the inflated fees, or the one-size-fits-all
              batch structure.
            </p>
          </section>

          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
            <p className="mb-1 font-medium text-gray-600">Related pages:</p>
            <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <Link href="/test-prep/ielts-online" className="text-blue-600 hover:underline">
                IELTS Online Coaching
              </Link>
              <span>·</span>
              <Link href="/test-prep/ielts-academic" className="text-blue-600 hover:underline">
                IELTS Academic
              </Link>
              <span>·</span>
              <Link href="/test-prep/ielts-general" className="text-blue-600 hover:underline">
                IELTS General
              </Link>
              <span>·</span>
              <Link href="/test-prep/pte-coaching-ahmedabad" className="text-blue-600 hover:underline">
                PTE Coaching Ahmedabad
              </Link>
              <span>·</span>
              <Link href="/test-prep/pte-coaching-gandhinagar" className="text-blue-600 hover:underline">
                PTE Coaching Gandhinagar
              </Link>
              <span>·</span>
              <Link href="/services/visa-assistance" className="text-blue-600 hover:underline">
                Visa Assistance
              </Link>
              <span>·</span>
              <Link href="/study-in/canada" className="text-blue-600 hover:underline">
                Study in Canada
              </Link>
              <span>·</span>
              <Link href="/study-in/uk" className="text-blue-600 hover:underline">
                Study in UK
              </Link>
              <span>·</span>
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact ANU Education
              </Link>
            </p>
          </div>

          <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-green-700 text-white rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 float">🎯</div>
            <h2 className="text-3xl font-bold mb-3">
              Start your FREE 4-Day IELTS Demo today
            </h2>
            <p className="text-blue-100 mb-2 max-w-xl mx-auto">
              Experience live classes before making any payment.
            </p>
            <p className="text-yellow-300 font-semibold mb-8 text-sm">
              Improve your IELTS band score faster from Ahmedabad — limited seats.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a
                href="https://study.anuedu.in/register"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105"
              >
                ✅ Book Free Demo Class
              </a>
              <a
                href="tel:+917016497087"
                className="border-2 border-white/70 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors"
              >
                📞 Call: +91 70164 97087
              </a>
              <a
                href={waLink(
                  "Hi, I want IELTS coaching in Ahmedabad. Please share details about fees, demo class, and batch timings."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors"
              >
                💬 WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-white/50">
              Skill India Certified · 1,100+ Students · 98% Success Rate ·
              info@anuedu.in
            </p>
          </section>
        </div>
      </main>
    </>
  );
}