'use client';

import Script from "next/script";
import Link from "next/link";

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

      {/* ================= SCHEMA ================= */}
      <Script
        id="course-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "IELTS Online Coaching in India",
            description: "Daily live classes, mock test portal, doubt clearing sessions, and free study abroad counseling",
            provider: {
              "@type": "Organization",
              name: "ANU Education",
              url: "https://www.anuedu.in",
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
              availability: "https://schema.org/OnlineOnly",
              validFrom: "2026-01-01",
            },
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "Online",
              courseWorkload: "PT8H",
              startDate: "2026-03-25",
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
            mainEntity: [
              {
                "@type": "Question",
                "name": "Do you provide online IELTS coaching?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! ANU Education offers live online IELTS coaching with daily classes, mock tests, and doubt clearing sessions."
                }
              },
              {
                "@type": "Question",
                "name": "What is included in the free demo?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "3 days free demo includes live classes, mock test access, and one-on-one counseling with expert trainers."
                }
              }
            ]
          })
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* ================= HERO SECTION ================= */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                ⭐ India's #1 Online IELTS Coaching
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Best IELTS Coaching in India
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Online | Live Classes | Mock Tests
                </span>
              </h1>
              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Join ANU Education for expert IELTS coaching with daily live classes, 
                advanced mock test portal, doubt clearing sessions, and FREE study abroad counseling.
              </p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="/free-demo"
                  className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  <span>🎓</span> Start Free Demo (3 Days)
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
                <span className="flex items-center gap-2">🎯 98% Success Rate</span>
                <span className="flex items-center gap-2">📅 1100+ Students Trained</span>
                <span className="flex items-center gap-2">⭐ 4.8 ★ (Google Reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          
          {/* ================= KEY FEATURES ================= */}
          <section>
            <h2 className="animate-left stagger-1 text-3xl font-bold text-center mb-12 section-title">
              What Makes ANU Education the Best Choice?
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
              { icon: "🎯", value: "98%", label: "Success Rate", color: "from-blue-500 to-cyan-500" },
              { icon: "👥", value: "1100+", label: "Students Trained", color: "from-green-500 to-emerald-500" },
              { icon: "📚", value: "15+", label: "Mock Tests", color: "from-purple-500 to-pink-500" },
              { icon: "⭐", value: "4.8", label: "Rating (Google Reviews)", color: "from-orange-500 to-red-500" }
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
            <h2 className="animate-left stagger-1 text-3xl font-bold text-center mb-12 section-title">
              Choose Your IELTS Batch
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "FREE Demo",
                  price: "₹0",
                  duration: "3 Days",
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
                  name: "IELTS Express",
                  price: "₹4,999",
                  duration: "4 Weeks",
                  features: [
                    "Daily Live Classes",
                    "15 Mock Tests",
                    "Writing Evaluation",
                    "Speaking Practice",
                    "Doubt Clearing Sessions",
                    "Study Abroad Counseling"
                  ],
                  popular: true,
                  color: "from-green-500 to-emerald-500"
                },
                {
                  name: "IELTS Premium",
                  price: "₹7,999",
                  duration: "8 Weeks",
                  features: [
                    "Everything in Express",
                    "1-on-1 Speaking Sessions",
                    "Personal Mentor",
                    "Visa Guidance",
                    "SOP/LOR Assistance",
                    "Guaranteed Band 6.5+"
                  ],
                  popular: false,
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
                    <a
                      href="/free-demo"
                      className={`block text-center py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {plan.name === "FREE Demo" ? "Start Free Demo" : "Enroll Now"}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================= TESTIMONIALS ================= */}
          <section>
            <h2 className="animate-left stagger-1 text-3xl font-bold text-center mb-12 section-title">
              ⭐ Success Stories
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Priya Sharma",
                  score: "Band 8.0",
                  text: "ANU Education's mock test portal was a game-changer. The daily doubt clearing sessions helped me improve quickly.",
                  country: "Canada"
                },
                {
                  name: "Rahul Mehta",
                  score: "Band 7.5",
                  text: "Best IELTS coaching online! The live classes and study abroad counseling helped me get admission in Germany.",
                  country: "Germany"
                },
                {
                  name: "Anjali Patel",
                  score: "Band 8.5",
                  text: "The writing evaluation and speaking practice sessions were exceptional. Highly recommended!",
                  country: "UK"
                }
              ].map((testimonial, index) => (
                <div key={index} className={`animate-up stagger-${index + 1} testimonial-card bg-white rounded-2xl p-6 shadow-lg border border-gray-100`}>
                  <div className="flex items-center gap-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div className="border-t pt-3">
                    <p className="font-bold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-green-600">IELTS {testimonial.score}</p>
                    <p className="text-xs text-gray-500">Studying in {testimonial.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================= FAQ SECTION ================= */}
          <section>
            <h2 className="animate-left stagger-1 text-3xl font-bold text-center mb-12 section-title">
              ❓ Frequently Asked Questions
            </h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                {
                  q: "Do you provide online IELTS coaching with live classes?",
                  a: "Yes! We offer daily live online classes with expert trainers. All sessions are recorded for revision."
                },
                {
                  q: "How many mock tests are included?",
                  a: "Our IELTS Express and Premium batches include 15+ full-length mock tests with detailed performance analysis."
                },
                {
                  q: "Is there any doubt clearing support?",
                  a: "Absolutely! We have daily doubt clearing sessions and one-on-one support for every student."
                },
                {
                  q: "Do you provide free study abroad counseling?",
                  a: "Yes! All our IELTS students get FREE counseling for study abroad destinations including Germany, UK, Canada, Australia, and more."
                },
                {
                  q: "Can I get a free demo before enrolling?",
                  a: "Yes! We offer 3 days of free demo classes including mock test access. Book your free demo now!"
                }
              ].map((faq, index) => (
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
            <h2 className="text-3xl font-bold mb-4">Start Your IELTS Journey Today</h2>
            <p className="text-xl mb-8 text-white/90">Join 10,000+ successful students who achieved their dream band score</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/free-demo"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
              >
                Claim 3-Day Free Demo
                <span>→</span>
              </a>
              <a
                href="https://wa.me/919428186817"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                Talk to Expert Counselor
              </a>
            </div>
            <p className="mt-6 text-sm text-white/80">Limited seats available for March 2026 batch</p>
          </section>
        </div>
      </main>
    </>
  );
}