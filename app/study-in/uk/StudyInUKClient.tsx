'use client';

import Script from "next/script";
import { useState, useEffect } from "react";

export default function StudyInUKClient() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showFab, setShowFab] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Show FAB after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowFab(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            "telephone": "+91 7016497087",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Modasa",
              "addressRegion": "Gujarat",
              "addressCountry": "India"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "1500"
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
            "name": "Study in UK Consultation & Preparation",
            "description": "Complete guidance for Indian students: university selection, 1-year master's programs, UK student visa, IELTS preparation, and post-study work opportunities.",
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
            },
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": "Online",
              "courseWorkload": "PT2H",
              "startDate": "2026-04-01"
            }
          })
        }}
      />

      {/* FAQ Schema */}
      <Script
        id="faq-schema-uk"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How much does it cost to study in UK?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Tuition fees range from £10,000–£20,000 per year depending on the course and university. Living costs in London are £1,200–£1,500 per month, while other cities cost £800–£1,200 per month."
                }
              },
              {
                "@type": "Question",
                "name": "Is UK good for masters?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Masters in UK are just 1-year programs, globally recognized, and offer excellent career opportunities. UK universities consistently rank among the world's best."
                }
              },
              {
                "@type": "Question",
                "name": "Can I work while studying in UK?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, international students can work up to 20 hours per week during term time and full-time during holidays. This helps manage living expenses and gain work experience."
                }
              },
              {
                "@type": "Question",
                "name": "What is the UK student visa success rate?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The success rate is very high (90%+) when documents are complete and financial requirements are met. ANU Education's expert visa team ensures proper documentation for maximum success."
                }
              },
              {
                "@type": "Question",
                "name": "Which city is best for Indian students in UK?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sheffield, Manchester, Birmingham, London, and Leicester are popular choices. Sheffield and Manchester offer affordable living with top universities and vibrant Indian communities."
                }
              },
              {
                "@type": "Question",
                "name": "What is the post-study work visa in UK?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Graduate Route visa allows students to stay and work for 2 years after completing their degree. This is a great opportunity to gain international work experience."
                }
              },
              {
                "@type": "Question",
                "name": "What IELTS score is required for UK universities?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most UK universities require IELTS 6.0–6.5 overall for undergraduate and 6.5–7.0 for postgraduate programs. ANU Education offers IELTS coaching to help achieve target scores."
                }
              }
            ]
          })
        }}
      />

      {/* Article Schema */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Study in UK for Indian Students – Complete Guide 2026",
            "description": "Complete guide for Indian students to study in UK: 1-year masters, top universities, student visa, living costs, post-study work visa, and career opportunities.",
            "image": "https://www.anuedu.in/images/study-in-uk.jpg",
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
            "datePublished": "2026-03-25",
            "dateModified": "2026-03-25",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://www.anuedu.in/study-in/uk"
            }
          })
        }}
      />

      {/* Local Business Schema */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "ANU Education",
            "image": "https://www.anuedu.in/logo.png",
            "telephone": "+91 7016497087",
            "email": "info@anuedu.in",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Near Modasa Bus Stand",
              "addressLocality": "Modasa",
              "addressRegion": "Gujarat",
              "postalCode": "383315",
              "addressCountry": "IN"
            },
            "openingHours": "Mo-Sa 09:00-19:00",
            "priceRange": "₹₹",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "1500"
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
          background: linear-gradient(90deg, #dc2626, #3b82f6);
          border-radius: 2px;
        }

        .section-title-center::after {
          left: 50%;
          transform: translateX(-50%);
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
          background: linear-gradient(135deg, #1e3a8a 0%, #dc2626 50%, #3b82f6 100%);
        }

        .fab {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .fab:hover {
          transform: scale(1.1);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .fab {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
        
        {/* ================= HERO SECTION ================= */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-blue-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                🇬🇧 1-Year Masters | 2-Year Post Study Work Visa | Top UK Universities
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Study in UK
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Start Your Global Career with ANU Education
                </span>
              </h1>
              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Turn your dream into reality with ANU Education. Every year, thousands of Indian students choose the UK for its 
                <strong className="text-yellow-300"> world-class education, 1-year master's programs, and excellent career opportunities</strong>.
                We help you from admission to visa – 100% guidance.
              </p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="/contact"
                  className="group bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <span>🇬🇧</span> Free Counseling
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a
                  href="https://study.anuedu.in/register"
                  target="_blank"
                  className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  <span>🎓</span> Book FREE Demo Class
                </a>
                <a
                  href="https://wa.me/919428186817"
                  target="_blank"
                  className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>💬</span> WhatsApp Now
                </a>
              </div>
              
              {/* Trust Badges */}
              <div className="animate-up stagger-4 flex flex-wrap justify-center gap-6 mt-8 text-sm">
                <span className="flex items-center gap-2">✅ 500+ Students Placed in UK</span>
                <span className="flex items-center gap-2">✅ 92% Visa Success Rate</span>
                <span className="flex items-center gap-2">✅ Free Profile Evaluation</span>
                <span className="flex items-center gap-2">✅ End-to-End Support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
          
          {/* ================= QUICK STATS ================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "⏳", value: "1 Year", label: "Masters Duration", desc: "Faster career start", color: "from-red-500 to-orange-500" },
              { icon: "💼", value: "2 Years", label: "Post Study Work Visa", desc: "Graduate Route", color: "from-blue-500 to-cyan-500" },
              { icon: "🎓", value: "90+", label: "Top Universities", desc: "Russell Group", color: "from-green-500 to-emerald-500" },
              { icon: "💰", value: "£10k-20k", label: "Tuition Fees", desc: "Per year", color: "from-purple-500 to-pink-500" }
            ].map((stat, index) => (
              <div key={index} className={`animate-up stagger-${index + 1} stat-card bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100`}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-xl font-bold text-red-600">{stat.value}</div>
                <div className="font-semibold text-gray-800">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.desc}</div>
              </div>
            ))}
          </div>

          {/* ================= WHY STUDY IN UK ================= */}
          <section>
            <h2 className="text-3xl font-bold mb-6 section-title">Why Study in UK for Indian Students?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🎓", title: "Globally Ranked Universities", desc: "Oxford, Cambridge, Imperial, and 90+ world-class institutions" },
                { icon: "⏳", title: "1-Year Masters in UK", desc: "Complete your degree faster and start your career sooner" },
                { icon: "💼", title: "2-Year Post Study Work Visa", desc: "Graduate Route allows 2 years of work after studies" },
                { icon: "🌍", title: "Multicultural Environment", desc: "Join a diverse community of international students" },
                { icon: "📈", title: "High Employability Rate", desc: "UK degrees are recognized and valued worldwide" },
                { icon: "💰", title: "Work While Studying", desc: "20 hours/week during term, full-time during holidays" }
              ].map((item, index) => (
                <div key={index} className={`animate-up stagger-${index + 1} info-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg`}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ================= TOP UNIVERSITIES ================= */}
          <section className="bg-gradient-to-r from-red-50 to-blue-50 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center section-title-center">Top Universities We Work With</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sheffield Universities */}
              <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all">
                <div className="text-2xl mb-2">🏫</div>
                <h3 className="font-bold text-gray-800 mb-2">Universities in Sheffield</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ University of Sheffield</li>
                  <li>✓ Sheffield Hallam University</li>
                </ul>
              </div>
              
              {/* Manchester Universities */}
              <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all">
                <div className="text-2xl mb-2">🏙️</div>
                <h3 className="font-bold text-gray-800 mb-2">UK Manchester University Options</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ University of Manchester</li>
                  <li>✓ Manchester Metropolitan University</li>
                </ul>
              </div>
              
              {/* London Universities */}
              <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all">
                <div className="text-2xl mb-2">🇬🇧</div>
                <h3 className="font-bold text-gray-800 mb-2">London Universities</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ King's College London</li>
                  <li>✓ Queen Mary University</li>
                  <li>✓ University of Westminster</li>
                </ul>
              </div>
              
              {/* Birmingham & Others */}
              <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all">
                <div className="text-2xl mb-2">🏆</div>
                <h3 className="font-bold text-gray-800 mb-2">Other Top Universities</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ University of Birmingham</li>
                  <li>✓ University of Leeds</li>
                  <li>✓ University of Glasgow</li>
                </ul>
              </div>
            </div>
            <p className="text-center mt-6 text-gray-600">👉 Get expert guidance to choose the right university based on your profile.</p>
          </section>

          {/* ================= POPULAR COURSES ================= */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center section-title-center">Popular Courses – Masters in UK</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: "💼", course: "Business & Management (MBA)" },
                { icon: "🤖", course: "Data Science & AI" },
                { icon: "🔧", course: "Engineering" },
                { icon: "🏥", course: "Healthcare & Nursing" }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-4 text-center shadow-md border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="font-semibold text-gray-800">{item.course}</p>
                </div>
              ))}
            </div>
            <p className="text-center mt-4 text-gray-600 italic">✨ Complete your degree in just 1 year and start working faster.</p>
          </section>

          {/* ================= LIVING COST ================= */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Student Living Cost in UK</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold mb-3">London</h3>
                <div className="text-3xl font-bold mb-2">£1,200 – £1,500</div>
                <p className="text-white/80">per month</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold mb-3">Other Cities</h3>
                <div className="text-3xl font-bold mb-2">£800 – £1,200</div>
                <p className="text-white/80">per month</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {["🏠 Accommodation", "🍔 Food", "🚌 Transport", "📱 Miscellaneous"].map((item, index) => (
                <div key={index} className="bg-white/10 rounded-xl p-3 text-center">
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center mt-6 text-white/90">👉 Students can work 20 hours/week to manage expenses.</p>
          </section>

          {/* ================= UK STUDENT VISA ================= */}
          <section className="bg-white rounded-3xl shadow-xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">UK Student Visa – Full Support</h2>
                <p className="text-gray-600 mb-4">We provide complete help for UK student visas:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">✅ <strong>SOP & Documentation</strong></li>
                  <li className="flex items-center gap-2">✅ <strong>Financial Guidance</strong></li>
                  <li className="flex items-center gap-2">✅ <strong>Visa Filing</strong></li>
                  <li className="flex items-center gap-2">✅ <strong>Mock Interview Preparation</strong></li>
                </ul>
                <p className="mt-4 text-green-600 font-bold">👉 High success rate with expert visa team.</p>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white text-center">
                <div className="text-4xl mb-3">🛂</div>
                <div className="text-2xl font-bold mb-2">92% Visa Success Rate</div>
                <p>With ANU Education's expert guidance</p>
                <div className="mt-4">
                  <span className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm">FREE Visa Consultation</span>
                </div>
              </div>
            </div>
          </section>

          {/* ================= WHY ANU EDUCATION ================= */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Why Choose ANU Education?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: "✅", title: "100% Transparent Process", desc: "No hidden fees, complete honesty" },
                { icon: "👨‍🏫", title: "Expert Counselors", desc: "Years of UK education experience" },
                { icon: "🎯", title: "Personalized University Selection", desc: "Based on your profile & budget" },
                { icon: "📚", title: "IELTS / PTE Coaching", desc: "Free demo classes available" },
                { icon: "🎓", title: "FREE Demo Classes", desc: "Experience before you enroll" },
                { icon: "🤝", title: "End-to-End Support", desc: "From admission to arrival" }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-2xl p-5 text-center shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ================= FAQ SECTION ================= */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center section-title-center">❓ Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                {
                  q: "How much does it cost to study in UK?",
                  a: "Tuition fees range from £10,000–£20,000 per year depending on the course and university. Living costs in London are £1,200–£1,500 per month, while other cities cost £800–£1,200 per month."
                },
                {
                  q: "Is UK good for masters?",
                  a: "Yes! Masters in UK are just 1-year programs, globally recognized, and offer excellent career opportunities. UK universities consistently rank among the world's best."
                },
                {
                  q: "Can I work while studying in UK?",
                  a: "Yes, international students can work up to 20 hours per week during term time and full-time during holidays. This helps manage living expenses and gain work experience."
                },
                {
                  q: "What is the UK student visa success rate?",
                  a: "The success rate is very high (90%+) when documents are complete and financial requirements are met. ANU Education's expert visa team ensures proper documentation for maximum success."
                },
                {
                  q: "Which city is best for Indian students in UK?",
                  a: "Sheffield, Manchester, Birmingham, London, and Leicester are popular choices. Sheffield and Manchester offer affordable living with top universities and vibrant Indian communities."
                },
                {
                  q: "What is the post-study work visa in UK?",
                  a: "The Graduate Route visa allows students to stay and work for 2 years after completing their degree. This is a great opportunity to gain international work experience."
                },
                {
                  q: "What IELTS score is required for UK universities?",
                  a: "Most UK universities require IELTS 6.0–6.5 overall for undergraduate and 6.5–7.0 for postgraduate programs. ANU Education offers IELTS coaching to help achieve target scores."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="faq-question w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-800">{faq.q}</span>
                    <span className="text-red-600 text-xl">{activeFaq === index ? '−' : '+'}</span>
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
              <div className="text-6xl mb-4 float">🇬🇧</div>
              <h2 className="text-3xl font-bold mb-4">Book Your FREE Counseling Today!</h2>
              <p className="text-xl mb-6 text-white/90">
                Don't miss your chance to study in UK and build a global future.
                <br />
                <strong>Limited seats available for upcoming intake!</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  🇬🇧 Apply Now – Get FREE Profile Evaluation
                </a>
                <a
                  href="https://wa.me/919428186817"
                  target="_blank"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  💬 Chat on WhatsApp & Start Your UK Journey Today
                </a>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
                <span>📞 Call: +91 7016497087</span>
                <span>💬 WhatsApp: +91 94281 86817</span>
                <span>🌐 www.anuedu.in</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ================= FLOATING ACTION BUTTON (FAB) ================= */}
      {showFab && (
        <div className="fab">
          <a
            href="https://wa.me/919428186817"
            target="_blank"
            className="bg-green-500 text-white rounded-full p-4 shadow-2xl hover:bg-green-600 transition-all flex items-center gap-2"
          >
            <span className="text-2xl">💬</span>
            <span className="hidden md:inline font-semibold">Chat Now</span>
          </a>
        </div>
      )}
    </>
  );
}