'use client';

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";

export default function GermanyPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <>
      {/* ================= COMPREHENSIVE SCHEMA MARKUP ================= */}
      
      {/* Organization Schema */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "ANU Education",
            "url": "https://www.anuedu.in",
            "logo": "https://www.anuedu.in/logo.png",
            "sameAs": [
              "https://www.facebook.com/anueducation",
              "https://www.instagram.com/anueducation",
              "https://www.youtube.com/anueducation"
            ],
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Modasa",
              "addressRegion": "Gujarat",
              "addressCountry": "India"
            }
          })
        }}
      />

      {/* Course Schema */}
      <Script
        id="course-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Study in Germany Consultation & Preparation",
            "description": "Complete guidance for Indian students: APS certificate, blocked account, university selection, visa assistance, and German language preparation.",
            "provider": {
              "@type": "Organization",
              "name": "ANU Education",
              "sameAs": "https://www.anuedu.in"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR",
              "availability": "https://schema.org/OnlineOnly",
              "validFrom": "2026-01-01"
            }
          })
        }}
      />

      {/* FAQ Schema */}
      <Script
        id="faq-schema-germany"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is APS certificate mandatory for Indian students to study in Germany?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, APS certificate is mandatory for most Indian students applying to German universities and for student visa processing. It verifies your academic credentials and is issued by the Academic Evaluation Centre (APS), Germany."
                }
              },
              {
                "@type": "Question",
                "name": "What is a blocked account and how much money is required?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A blocked account (Sperrkonto) is required to prove financial capability for German student visa. Currently, students need approximately €11,208 per year, which is released monthly (around €934) after arrival in Germany."
                }
              },
              {
                "@type": "Question",
                "name": "Is education free in Germany?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most public universities in Germany offer free or very low tuition fees. Students usually pay only a semester contribution of €150-€400, which includes public transport and other student benefits."
                }
              },
              {
                "@type": "Question",
                "name": "Do Indian students need IELTS or German language?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "English-taught programs require IELTS (6.5 overall) or TOEFL. German-taught programs require German language proficiency (A2/B1 for admission, C1 for most universities). ANU Education offers both IELTS and German language preparation."
                }
              },
              {
                "@type": "Question",
                "name": "Can Indian students work and get PR in Germany?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Students can work 120 full days or 240 half days per year. After graduation, get an 18-month job search visa. Permanent Residency is possible after 21-24 months of working post-study. Germany offers excellent PR pathways for skilled professionals."
                }
              },
              {
                "@type": "Question",
                "name": "What are the best courses to study in Germany?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Germany is famous for Engineering (Mechanical, Automobile, Electrical), Computer Science, AI & Data Science, Business Analytics, Renewable Energy, and Robotics. These fields have high job placement rates."
                }
              },
              {
                "@type": "Question",
                "name": "How to apply for German student visa from India?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Visa process requires: APS certificate, admission letter, blocked account proof, health insurance, language certificates, and academic documents. Processing time is 4-8 weeks. ANU Education provides complete visa assistance."
                }
              }
            ]
          })
        }}
      />

      {/* Article Schema for Blog Content */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Study in Germany for Indian Students – Free Education & PR Opportunities",
            "description": "Complete guide for Indian students to study in Germany: free public universities, APS certificate, blocked account, visa process, work opportunities, and PR pathways.",
            "image": "https://www.anuedu.in/images/study-in-germany.jpg",
            "author": {
              "@type": "Organization",
              "name": "ANU Education"
            },
            "publisher": {
              "@type": "Organization",
              "name": "ANU Education",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.anuedu.in/logo.png"
              }
            },
            "datePublished": "2026-03-23",
            "dateModified": "2026-03-23",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://www.anuedu.in/study-in/germany"
            }
          })
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
            transform: translateY(-10px);
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

        .stat-card {
          transition: all 0.3s ease;
        }

        .stat-card:hover {
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
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #2563eb, #22c55e);
          border-radius: 2px;
        }

        .info-card {
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1);
        }

        .faq-question {
          transition: all 0.2s ease;
        }

        .faq-question:hover {
          background-color: #f3f4f6;
        }

        .cta-banner {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #22c55e 100%);
        }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* ================= HERO SECTION ================= */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                🇩🇪 Free Public Universities | 18-Month Job Search Visa | PR Pathway
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Study in Germany
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  For Indian Students
                </span>
              </h1>
              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Germany is one of the top destinations for Indian students due to its 
                <strong className="text-yellow-300"> free public universities, world-class education, and strong job market</strong>.
                Study Engineering, IT, Data Science, Business, and more with excellent post-study opportunities.
              </p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="/contact"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <span>🇩🇪</span> Apply for Germany Counselling
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a
                  href="https://study.anuedu.in/register"
                  target="_blank"
                  className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  <span>🎓</span> Book FREE IELTS / German Class
                </a>
              </div>
              
              {/* Trust Badges */}
              <div className="animate-up stagger-4 flex flex-wrap justify-center gap-6 mt-8 text-sm">
                <span className="flex items-center gap-2">✅ 120+ Students Placed in Germany</span>
                <span className="flex items-center gap-2">✅ 94% Visa Success Rate</span>
                <span className="flex items-center gap-2">✅ Free Expert Guidance</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
          
          {/* ================= QUICK STATS ================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🎓", value: "0€", label: "Tuition Fees", desc: "Public Universities", color: "from-blue-500 to-cyan-500" },
              { icon: "💰", value: "€11,208", label: "Blocked Account", desc: "Annual requirement", color: "from-green-500 to-emerald-500" },
              { icon: "💼", value: "18 Months", label: "Job Search Visa", desc: "After graduation", color: "from-purple-500 to-pink-500" },
              { icon: "🏆", value: "21-24 Months", label: "PR Pathway", desc: "After work", color: "from-orange-500 to-red-500" }
            ].map((stat, index) => (
              <div key={index} className={`animate-up stagger-${index + 1} stat-card bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100`}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                <div className="font-semibold text-gray-800">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.desc}</div>
              </div>
            ))}
          </div>

          {/* ================= WHY GERMANY ================= */}
          <section>
            <h2 className="text-3xl font-bold mb-6 section-title">Why Study in Germany?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🎓", title: "Free Public Universities", desc: "No or very low tuition fees at public universities" },
                { icon: "🏆", title: "Globally Ranked Universities", desc: "World-class education and research institutes" },
                { icon: "💼", title: "High Job Demand", desc: "High demand for engineers, IT & technical professionals" },
                { icon: "⏰", title: "Work While Studying", desc: "Work 20 hours/week during studies" },
                { icon: "🌟", title: "PR Pathway", desc: "Strong pathway to Permanent Residency" },
                { icon: "🌍", title: "Post-Study Work Visa", desc: "18-month job search visa after graduation" }
              ].map((item, index) => (
                <div key={index} className={`animate-up stagger-${index + 1} info-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg`}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ================= POPULAR COURSES ================= */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center section-title">Popular Courses in Germany</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Mechanical, Automobile & Electrical Engineering",
                "Computer Science, AI & Data Science",
                "Business Analytics & Management",
                "Renewable Energy & Environmental Engineering",
                "Robotics & Industry 4.0",
                "Medicine & Life Sciences"
              ].map((course, index) => (
                <div key={index} className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">{course}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ================= COST BREAKDOWN ================= */}
          <section>
            <h2 className="text-3xl font-bold mb-6 section-title">Cost of Study & Living</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="text-4xl mb-2">🏛️</div>
                <div className="text-2xl font-bold text-blue-600">€0 – €1,500</div>
                <p className="text-gray-600">Tuition Fees (per year)</p>
                <p className="text-sm text-gray-500 mt-2">Public universities only</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="text-4xl mb-2">🏠</div>
                <div className="text-2xl font-bold text-green-600">€850 – €1,000</div>
                <p className="text-gray-600">Living Cost (per month)</p>
                <p className="text-sm text-gray-500 mt-2">Including rent, food, transport</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="text-4xl mb-2">💰</div>
                <div className="text-2xl font-bold text-purple-600">€11,208</div>
                <p className="text-gray-600">Blocked Account (per year)</p>
                <p className="text-sm text-gray-500 mt-2">Released monthly after arrival</p>
              </div>
            </div>
          </section>

          {/* ================= APS CERTIFICATE ================= */}
          <section className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">APS Certificate</h2>
                <p className="text-gray-700 mb-4">
                  <strong className="text-red-600">Mandatory for Indian Students</strong> – The APS Certificate is an academic verification required for Indian students applying to German universities and for student visa processing.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">✅ Mandatory for most Bachelor's & Master's applicants</li>
                  <li className="flex items-center gap-2">✅ Issued by Academic Evaluation Centre (APS), Germany</li>
                  <li className="flex items-center gap-2">✅ Processing time: 4–8 weeks</li>
                  <li className="flex items-center gap-2">✅ Without APS, applications may be rejected</li>
                </ul>
                <a href="/contact" className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
                  Get APS Guidance →
                </a>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                <div className="text-5xl mb-3">📄</div>
                <p className="text-gray-600">Start your APS process early</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">4-8 Weeks</p>
                <p className="text-sm text-gray-500">Processing Time</p>
              </div>
            </div>
          </section>

          {/* ================= BLOCKED ACCOUNT ================= */}
          <section>
            <h2 className="text-3xl font-bold mb-6 section-title">Blocked Account (Sperrkonto)</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <p className="text-gray-700 mb-4">
                  A blocked account is financial proof required for the German student visa. The deposited amount is released monthly after arrival in Germany.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">✅ Required amount: <strong className="text-green-600">approx. €11,208</strong></li>
                  <li className="flex items-center gap-2">✅ Monthly allowance: <strong>around €934</strong></li>
                  <li className="flex items-center gap-2">✅ Mandatory for visa approval</li>
                  <li className="flex items-center gap-2">✅ Can be opened through approved providers like Fintiba, Expatrio</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">🏦</div>
                <p className="text-lg mb-2">We help you with:</p>
                <ul className="space-y-1 text-sm">
                  <li>✓ Blocked account setup guidance</li>
                  <li>✓ Documentation assistance</li>
                  <li>✓ Best provider selection</li>
                  <li>✓ Timely processing</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ================= WORK & PR ================= */}
          <section className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-3xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">Work Opportunities & Permanent Residency</h2>
              <p className="text-white/90 text-lg mt-2">Your pathway to a successful career in Germany</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">💼</div>
                <h3 className="font-bold text-xl mb-2">During Studies</h3>
                <p>Work 120 full days or 240 half days per year</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">🔍</div>
                <h3 className="font-bold text-xl mb-2">After Graduation</h3>
                <p>18-month job search visa to find employment</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-bold text-xl mb-2">Permanent Residency</h3>
                <p>Possible after 21-24 months of work post-study</p>
              </div>
            </div>
          </section>

          {/* ================= FAQ SECTION ================= */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center section-title">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                {
                  q: "Is APS certificate mandatory for Indian students to study in Germany?",
                  a: "Yes, APS certificate is mandatory for most Indian students applying to German universities and for student visa processing. It verifies your academic credentials and is issued by the Academic Evaluation Centre (APS), Germany. Processing time is 4-8 weeks."
                },
                {
                  q: "What is a blocked account and how much money is required?",
                  a: "A blocked account (Sperrkonto) is required to prove financial capability for German student visa. Currently, students need approximately €11,208 per year, which is released monthly (around €934) after arrival in Germany."
                },
                {
                  q: "Is education free in Germany?",
                  a: "Most public universities in Germany offer free or very low tuition fees. Students usually pay only a semester contribution of €150-€400, which includes public transport and other student benefits."
                },
                {
                  q: "Do Indian students need IELTS or German language?",
                  a: "English-taught programs require IELTS (6.5 overall) or TOEFL. German-taught programs require German language proficiency (A2/B1 for admission, C1 for most universities). ANU Education offers both IELTS and German language preparation."
                },
                {
                  q: "Can Indian students work and get PR in Germany?",
                  a: "Yes! Students can work 120 full days or 240 half days per year. After graduation, get an 18-month job search visa. Permanent Residency is possible after 21-24 months of working post-study."
                },
                {
                  q: "What are the best courses to study in Germany?",
                  a: "Germany is famous for Engineering (Mechanical, Automobile, Electrical), Computer Science, AI & Data Science, Business Analytics, Renewable Energy, and Robotics. These fields have high job placement rates."
                },
                {
                  q: "How to apply for German student visa from India?",
                  a: "Visa process requires: APS certificate, admission letter, blocked account proof, health insurance, language certificates, and academic documents. Processing time is 4-8 weeks. ANU Education provides complete visa assistance."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="faq-question w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-800">{faq.q}</span>
                    <span className="text-blue-600 text-xl">{activeFaq === index ? '−' : '+'}</span>
                  </button>
                  {activeFaq === index && (
                    <div className="px-6 pb-4 text-gray-600 border-t border-gray-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ================= FINAL CTA ================= */}
          <section className="cta-banner rounded-3xl p-12 text-center text-white">
            <div className="max-w-3xl mx-auto">
              <div className="text-6xl mb-4 float">🇩🇪</div>
              <h2 className="text-3xl font-bold mb-4">Start Your Germany Study Journey with ANU Education</h2>
              <p className="text-xl mb-6 text-white/90">
                Get expert guidance on universities, APS, blocked account, visa, and language preparation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  🇩🇪 Apply for Germany Counselling
                </a>
                <a
                  href="https://study.anuedu.in/register"
                  target="_blank"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  🎓 Book FREE IELTS / German Class
                </a>
              </div>
              <p className="mt-6 text-sm text-white/80">Limited seats available for Winter 2026 intake</p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}