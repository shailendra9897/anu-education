'use client';

import Link from "next/link";
import {
  IELTS_ACADEMIC_SELF_PREP_PRICE_DISPLAY,
  IELTS_ACADEMIC_CHAMPION_FROM_PRICE_DISPLAY,
  IELTS_GST_LABEL,
} from "@/lib/data/ielts-pricing";
import { faqs } from "@/lib/data/faq/ielts-india";
import IELTSStudentStories from "@/components/testimonials/IELTSStudentStories";

// The India page's Self Preparation card uses the fixed Self Prep PayU link;
// its Champion card uses the fixed Champion — One Batch PayU link. The
// retired on-page checkout is never used.
const IELTS_SELF_PREP_PAYU_URL =
  "https://u.payu.in/PAYUMN/uIqbwdNTKrTp";
const IELTS_CHAMPION_ONE_BATCH_PAYU_URL =
  "https://u.payu.in/PAYUMN/BIInlBUFpA9I";

export default function IELTSCoachingPage() {
  return (
    <>
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

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(34, 197, 94, 0);
          }
        }

        .animate-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-left {
          animation: fadeInLeft 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-right {
          animation: fadeInRight 0.8s ease-out forwards;
          opacity: 0;
        }

        .float {
          animation: float 3s ease-in-out infinite;
        }

        .pulse {
          animation: pulse 2s infinite;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }

        .feature-card {
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.15);
        }

        .section-title {
          position: relative;
          display: inline-block;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #22c55e);
          border-radius: 2px;
        }

        .section-title-left::after {
          left: 0;
          transform: none;
        }

        .pricing-card {
          transition: all 0.4s ease;
        }

        .pricing-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 40px -15px rgba(0, 0, 0, 0.2);
        }

        .testimonial-card {
          transition: all 0.3s ease;
        }

        .testimonial-card:hover {
          transform: translateX(5px);
        }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* ================= HERO SECTION ================= */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                🎓 Online IELTS Preparation Across India
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                IELTS Coaching in India
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Online | Live Classes | Mock Tests
                </span>
              </h1>
              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Compare ANU Education&apos;s IELTS preparation options: a self-paced
                study pack or live online Champion batches, both with mock tests,
                mentor feedback and study abroad counselling.
              </p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="/free-demo"
                  className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  <span>🎓</span> Start Free Demo (5 Days)
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a
                  href="https://wa.me/919428186817"
                  className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>💬</span> Talk to Counselor
                </a>
              </div>
              <div className="animate-up stagger-4 flex flex-wrap justify-center gap-4 mt-8 text-sm">
                <span className="flex items-center gap-2">🎯 15 full-length mock tests</span>
                <span className="flex items-center gap-2">📚 60 sectional practice tests</span>
                <span className="flex items-center gap-2">🗓️ 6-month access</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          
          {/* ================= KEY FEATURES ================= */}
          <section>
            <h2 className="animate-left stagger-1 text-3xl font-bold text-center mb-12 section-title">
              What the IELTS Programme Includes
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "📺",
                  title: "Daily Live Classes",
                  desc: "Interactive online classes with expert trainers. Recorded sessions available for revision.",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: "📝",
                  title: "Mock Test Portal",
                  desc: "15+ full-length mock tests with detailed performance analysis and band score predictions.",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  icon: "💬",
                  title: "Doubt Clearing Sessions",
                  desc: "Daily doubt clearing sessions with one-on-one attention for every student.",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  icon: "✍️",
                  title: "Writing Evaluation",
                  desc: "Personalized feedback on essays and letters with band-wise improvement tips.",
                  color: "from-orange-500 to-red-500"
                },
                {
                  icon: "🎙️",
                  title: "Speaking Practice",
                  desc: "One-on-one speaking sessions with expert trainers to boost fluency and confidence.",
                  color: "from-pink-500 to-rose-500"
                },
                {
                  icon: "🌍",
                  title: "FREE Study Abroad Counseling",
                  desc: "Complete guidance for Germany, UK, Canada, Australia, and 10+ countries.",
                  color: "from-indigo-500 to-purple-500"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`animate-up stagger-${index + 1} feature-card bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl border border-gray-100`}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ================= STATS SECTION ================= */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "📚", value: "15", label: "Full-length mock tests", color: "from-blue-500 to-cyan-500" },
              { icon: "📝", value: "60", label: "Sectional practice tests", color: "from-green-500 to-emerald-500" },
              { icon: "🎥", value: "300+", label: "Grammar & vocabulary videos", color: "from-purple-500 to-pink-500" },
              { icon: "🗓️", value: "6", label: "Months of access", color: "from-orange-500 to-red-500" }
            ].map((stat, index) => (
              <div
                key={index}
                className={`animate-up stagger-${index + 1} bg-gradient-to-br ${stat.color} text-white p-6 rounded-2xl shadow-xl text-center hover:scale-105 transition-transform`}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="font-bold text-2xl">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            ))}
          </section>

          {/* ================= COURSE STRUCTURE ================= */}
          <section className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="animate-left stagger-1 text-3xl font-bold text-center mb-8 section-title">
              Comprehensive IELTS Training
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                  <span>📚</span> Course Modules
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">✅ <span className="font-medium">Listening:</span> 4 sections, 40 questions strategies</li>
                  <li className="flex items-center gap-2">✅ <span className="font-medium">Reading:</span> Skimming, scanning, time management</li>
                  <li className="flex items-center gap-2">✅ <span className="font-medium">Writing:</span> Task 1 (graphs/charts) & Task 2 (essays)</li>
                  <li className="flex items-center gap-2">✅ <span className="font-medium">Speaking:</span> Part 1, 2, 3 with fluency practice</li>
                  <li className="flex items-center gap-2">✅ <span className="font-medium">Vocabulary:</span> 500+ band 7+ words and collocations</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-green-600 flex items-center gap-2">
                  <span>⏰</span> Weekly Schedule
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">📅 <span className="font-medium">Monday-Friday:</span> Live classes (1.5 hours/day)</li>
                  <li className="flex items-center gap-2">📝 <span className="font-medium">Saturday:</span> Mock test & evaluation</li>
                  <li className="flex items-center gap-2">💬 <span className="font-medium">Sunday:</span> Doubt clearing & counseling</li>
                  <li className="flex items-center gap-2">🎙️ <span className="font-medium">Flexible:</span> Recorded sessions for revision</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ================= MOCK TEST PORTAL SECTION ================= */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="animate-left stagger-1">
                <div className="text-5xl mb-4">📱</div>
                <h2 className="text-3xl font-bold mb-4">Advanced Mock Test Portal</h2>
                <p className="text-white/90 text-lg mb-6">
                  Access our state-of-the-art mock test platform with:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">✅ 15+ full-length IELTS mock tests</li>
                  <li className="flex items-center gap-2">✅ Real exam interface and timing</li>
                  <li className="flex items-center gap-2">✅ Instant band score predictions</li>
                  <li className="flex items-center gap-2">✅ Detailed performance analytics</li>
                  <li className="flex items-center gap-2">✅ Mobile & desktop access 24/7</li>
                </ul>
              </div>
              <div className="animate-right stagger-2 text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8">
                  <div className="text-4xl font-bold mb-2">FREE Access</div>
                  <p className="mb-4">with every IELTS batch</p>
                  <a href="/free-demo" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
                    Try Free Demo
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ================= FREE STUDY ABROAD COUNSELING ================= */}
          <section className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-3xl p-8 md:p-12">
            <div className="text-center">
              <div className="text-5xl mb-4 float">🌍</div>
              <h2 className="text-3xl font-bold mb-4">FREE Study Abroad Counseling</h2>
              <p className="text-white/90 text-lg mb-8 max-w-3xl mx-auto">
                Get expert guidance on university selection, application process, visa documentation, 
                scholarships, and pre-departure preparation for Germany, UK, Canada, Australia & more.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">🇩🇪 Germany</div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">🇬🇧 UK</div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">🇨🇦 Canada</div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">🇦🇺 Australia</div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">🇺🇸 USA</div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">🇳🇿 New Zealand</div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">🇮🇪 Ireland</div>
              </div>
            </div>
          </section>

          {/* ================= PRICING PLANS ================= */}
          <section>
            <h2 className="animate-left stagger-1 text-3xl font-bold text-center mb-3 section-title">
              Compare IELTS Course Packages
            </h2>
            <p className="text-center text-sm text-gray-600 mb-2 max-w-2xl mx-auto">
              Compare the self-paced and live-class options, then choose the
              learning format that suits your schedule.
            </p>
            <p className="text-center text-sm text-gray-600 mb-10">
              {`${IELTS_GST_LABEL}. Course activation and portal access are completed manually after payment verification.`}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "FREE Demo",
                  price: "₹0",
                  duration: "5 Days",
                  features: [
                    "3 Live Classes",
                    "1 Mock Test",
                    "Basic Study Material",
                    "Doubt Clearing Session"
                  ],
                  popular: false,
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  name: "Self Preparation",
                  price: IELTS_ACADEMIC_SELF_PREP_PRICE_DISPLAY,
                  duration: "180 Days",
                  features: [
                    "60 Practice Tests",
                    "15 Full-Length Mock Tests",
                    "300+ Grammar & Vocabulary Videos",
                    "Expert Mentor Feedback",
                    "5-Day Free Trial",
                    "Study Abroad Counseling"
                  ],
                  popular: false,
                  color: "from-green-500 to-emerald-500"
                },
                {
                  name: "Champion",
                  price: IELTS_ACADEMIC_CHAMPION_FROM_PRICE_DISPLAY,
                  duration: "8 Weeks",
                  features: [
                    "Everything in Self Prep",
                    "Daily Live Classes (Morning / Afternoon / Evening)",
                    "Beginner & Advanced Batches",
                    "Saturday Grammar & Sunday Doubt Sessions",
                    "FREE 4-Week French Live Course",
                    "Study Abroad Counseling"
                  ],
                  popular: true,
                  color: "from-purple-500 to-pink-500"
                }
              ].map((plan, index) => (
                <div
                  key={index}
                  className={`animate-up stagger-${index + 1} pricing-card bg-white rounded-2xl shadow-xl overflow-hidden border ${plan.popular ? 'border-green-500 ring-2 ring-green-500' : 'border-gray-200'}`}
                >
                  {plan.popular && (
                    <div className="bg-green-500 text-white text-center py-2 text-sm font-semibold">
                      🔥 Most Popular
                    </div>
                  )}
                  <div className={`bg-gradient-to-br ${plan.color} p-6 text-white text-center`}>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="text-4xl font-bold mt-2">{plan.price}</div>
                    <p className="text-sm opacity-90">/{plan.duration}</p>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-green-500">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                    {plan.name === "Champion" ? (
                      <a
                        href={IELTS_CHAMPION_ONE_BATCH_PAYU_URL}
                        aria-label={`Buy ${plan.name} — open the secure PayU payment page`}
                        className="block text-center py-3 rounded-xl font-bold transition-all bg-purple-600 text-white hover:bg-purple-700"
                      >
                        Buy Now
                      </a>
                    ) : plan.name === "Self Preparation" ? (
                      <a
                        href={IELTS_SELF_PREP_PAYU_URL}
                        aria-label={`Buy ${plan.name} — open the secure PayU payment page`}
                        className="inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition-colors bg-blue-700 text-white hover:bg-blue-800"
                      >
                        Buy Now
                      </a>
                    ) : (
                      <a
                        href="/free-demo"
                        className="block text-center py-3 rounded-xl font-bold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Start Free Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================= SELF PREP VS CHAMPION ================= */}
          <section>
            <h2 className="animate-left stagger-1 text-3xl font-bold text-center mb-3 section-title">
              Self Preparation vs Champion
            </h2>
            <p className="text-center text-sm text-gray-600 mb-10 max-w-2xl mx-auto">
              Both packs cover the same IELTS Academic syllabus. The difference
              is how much live teaching you want.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">What you get</th>
                    <th className="text-left px-4 py-3 font-semibold">Self Preparation</th>
                    <th className="text-left px-4 py-3 font-semibold">Champion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {[
                    ["Learning format", "Self-paced videos, practice tests and mock tests", "Daily live classes plus everything in Self Preparation"],
                    ["Live classes", "Not included", "Morning, afternoon or evening batch"],
                    ["Batch levels", "—", "Beginner (40 hrs) and Advanced (60 hrs)"],
                    ["Mock tests", "15 full-length + 60 sectional", "15 full-length + 60 sectional"],
                    ["Weekend support", "Saturday analysis and Sunday doubt-solving", "Saturday analysis and Sunday doubt-solving"],
                    ["French course", "Not included", "Free 4-week live French course"],
                    ["Login access", "6 months", "6 months"],
                    ["Price", `${IELTS_ACADEMIC_SELF_PREP_PRICE_DISPLAY} (GST included)`, `from ${IELTS_ACADEMIC_CHAMPION_FROM_PRICE_DISPLAY} (GST included)`],
                  ].map(([label, selfPrep, champion], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-800">{label}</td>
                      <td className="px-4 py-3 text-gray-600">{selfPrep}</td>
                      <td className="px-4 py-3 text-gray-600">{champion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
              Prices include GST. Course activation and portal access are completed
              manually after payment verification.
            </p>
          </section>

          {/* ================= HOW ENROLLMENT WORKS ================= */}
          <section>
            <h2 className="animate-left stagger-1 text-3xl font-bold text-center mb-3 section-title">
              How Enrollment Works
            </h2>
            <p className="text-center text-sm text-gray-600 mb-10 max-w-2xl mx-auto">
              Four steps from your first class to full course access.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: "01", title: "Book a free demo", desc: "Register for the 5-day free demo through the free demo page." },
                { step: "02", title: "Try the classes", desc: "Attend live classes, take a mock test and see how the course fits your schedule." },
                { step: "03", title: "Choose your pack", desc: "Pick Self Preparation for self-paced study or Champion for daily live classes." },
                { step: "04", title: "Pay and get access", desc: "Use the Buy Now link for your pack. Course activation and portal access are completed manually after payment verification." },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="text-blue-600 font-bold text-sm mb-2">{item.step}</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-base">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ================= CHOOSE BY CITY ================= */}
          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              Choose by City
            </h2>
            <p className="text-center text-sm text-gray-600 mb-6 max-w-2xl mx-auto">
              The course is delivered online across India. These pages cover the
              city-specific questions students ask most often.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/test-prep/ielts-online" className="bg-white rounded-xl p-4 border border-blue-100 text-blue-700 font-semibold hover:bg-blue-100 transition-colors text-sm">
                Live online batches across India →
              </Link>
              <Link href="/test-prep/ielts/ielts-coaching-ahmedabad" className="bg-white rounded-xl p-4 border border-blue-100 text-blue-700 font-semibold hover:bg-blue-100 transition-colors text-sm">
                IELTS preparation for Ahmedabad students →
              </Link>
              <Link href="/test-prep/ielts-coaching-gandhinagar" className="bg-white rounded-xl p-4 border border-blue-100 text-blue-700 font-semibold hover:bg-blue-100 transition-colors text-sm">
                IELTS coaching for Gandhinagar students →
              </Link>
              <Link href="/test-prep/ielts-coaching-modasa" className="bg-white rounded-xl p-4 border border-blue-100 text-blue-700 font-semibold hover:bg-blue-100 transition-colors text-sm">
                IELTS coaching in Modasa and nearby districts →
              </Link>
            </div>
          </section>

          {/* ================= TESTIMONIALS ================= */}
          <IELTSStudentStories
            heading="Student Experiences"
            intro="Approved student stories are published here once consent and score evidence are on file."
          />

          {/* ================= FAQ SECTION ================= */}
          <section>
            <h2 className="animate-left stagger-1 text-3xl font-bold text-center mb-12 section-title">
              ❓ Frequently Asked Questions
            </h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ================= FINAL CTA ================= */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-12 text-center">
            <div className="text-6xl mb-4 float">🚀</div>
            <h2 className="text-3xl font-bold mb-4">Start Your IELTS Preparation</h2>
            <p className="text-xl mb-4 text-white/90 max-w-2xl mx-auto">
              Compare the self-paced and live-class options, check the GST-inclusive
              price, and book a free demo before you enrol.
            </p>
            <p className="mb-8 text-sm text-white/80">
              Looking for daily live classes?{" "}
              <a href="/test-prep/ielts-online" className="underline font-semibold">
                See the online IELTS coaching page
              </a>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/free-demo"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
              >
                Book 5-Day Free Demo
                <span>→</span>
              </a>
              <a
                href="https://wa.me/919428186817"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                Talk to a Counsellor
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}