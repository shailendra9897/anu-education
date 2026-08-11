'use client';

import Script from "next/script";
import Link from "next/link";

export default function CanadaClient() {
  return (
    <>
      {/* Organization Schema */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "ANU Education",
            url: "https://www.anuedu.in",
            logo: "https://www.anuedu.in/logo.png",
            sameAs: [
              "https://www.facebook.com/anueducation",
              "https://www.instagram.com/anueducation",
              "https://www.youtube.com/anueducation",
            ],
            telephone: "+91 7016497087",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Modasa",
              addressRegion: "Gujarat",
              addressCountry: "India",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              reviewCount: "1500",
            },
          }),
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
            name: "Study in Canada Consultation & Preparation",
            description:
              "Complete guidance for Indian students: university selection, PGWP, student visa, and PR pathways.",
            provider: {
              "@type": "Organization",
              name: "ANU Education",
              sameAs: "https://www.anuedu.in",
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
              courseWorkload: "PT2H",
              startDate: "2026-04-15",
            },
          }),
        }}
      />

      {/* FAQ Schema */}
      <Script
        id="faq-schema-canada"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How much does it cost to study in Canada for Indian students?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Tuition fees range from CAD 15,000–38,000 per year (₹10–25 lakhs). Living costs average CAD 10,000–15,000 per year. Many universities offer scholarships for Indian students.",
                },
              },
              {
                "@type": "Question",
                name: "What is PGWP in Canada?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The Post‑Graduation Work Permit (PGWP) allows students to work for up to 3 years after completing their studies. This is a major pathway to Canadian Permanent Residency.",
                },
              },
              {
                "@type": "Question",
                name: "What are the main intakes in Canada?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The main intakes are September (Fall) – the largest intake, January (Winter) – second major, and May (Summer) – limited programs. We recommend applying 8–12 months in advance.",
                },
              },
              {
                "@type": "Question",
                name: "Is IELTS required for Canada student visa?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, most universities require IELTS 6.0–6.5 overall (no band less than 5.5). PTE, TOEFL, and Duolingo are also accepted by many institutions.",
                },
              },
              {
                "@type": "Question",
                name: "What is the Canada student visa success rate?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "With proper documentation and financial proof, the success rate is high (90%+). ANU Education has a 95%+ visa success rate for genuine students.",
                },
              },
              {
                "@type": "Question",
                name: "Can I get PR after studying in Canada?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, after completing a 2‑year program and 1 year of skilled work experience, you can apply for Permanent Residency through Express Entry or Provincial Nominee Programs (PNP).",
                },
              },
            ],
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
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
          50% { box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
        }
        .animate-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
        .animate-left { animation: fadeInLeft 0.8s ease-out forwards; opacity: 0; }
        .animate-right { animation: fadeInRight 0.8s ease-out forwards; opacity: 0; }
        .float { animation: float 3s ease-in-out infinite; }
        .pulse { animation: pulse 2s infinite; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
        .stat-card { transition: all 0.3s ease; }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 20px 30px -10px rgba(0,0,0,0.15); }
        .section-title { position: relative; display: inline-block; }
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
        .info-card { transition: all 0.3s ease; }
        .info-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1); }
        .faq-question { transition: all 0.2s ease; }
        .faq-question:hover { background-color: #f3f4f6; }
        .cta-banner { background: linear-gradient(135deg, #1e3a8a 0%, #dc2626 50%, #3b82f6 100%); }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                🇨🇦 PGWP up to 3 years | PR Pathway | 95%+ Visa Success
              </div>
              <h1 className="animate-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Study in Canada
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  For Indian Students
                </span>
              </h1>
              <p className="animate-up stagger-2 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Canada offers world‑class education, affordable tuition, and a clear path to Permanent Residency. 
                Learn about top universities, PGWP, intakes, and visa process – all with expert guidance from ANU Education.
              </p>
              <div className="animate-up stagger-3 flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="/contact"
                  className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <span>🇨🇦</span> Free Canada Counseling
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a
                  href="https://study.anuedu.in/register"
                  target="_blank"
                  className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
                >
                  <span>🎓</span> Book FREE IELTS / PTE Demo
                </a>
              </div>
              {/* Trust Badges */}
              <div className="animate-up stagger-4 flex flex-wrap justify-center gap-6 mt-8 text-sm">
                <span className="flex items-center gap-2">✅ 500+ Students Placed in Canada</span>
                <span className="flex items-center gap-2">✅ 95% Visa Success Rate</span>
                <span className="flex items-center gap-2">✅ Free Expert Guidance</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🎓", value: "90+", label: "Top Universities", desc: "Globally ranked", color: "from-blue-500 to-cyan-500" },
              { icon: "💼", value: "3 Years", label: "PGWP", desc: "Post‑graduation work permit", color: "from-green-500 to-emerald-500" },
              { icon: "💰", value: "CAD 15K–38K", label: "Tuition per year", desc: "Affordable compared to USA/UK", color: "from-purple-500 to-pink-500" },
              { icon: "🏆", value: "95%+", label: "Visa Success", desc: "With ANU Education", color: "from-orange-500 to-red-500" },
            ].map((stat, idx) => (
              <div key={idx} className={`animate-up stagger-${idx+1} stat-card bg-gradient-to-br ${stat.color} text-white rounded-2xl p-6 text-center shadow-lg`}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="font-semibold">{stat.label}</div>
                <div className="text-xs opacity-90">{stat.desc}</div>
              </div>
            ))}
          </div>

          {/* Why Canada */}
          <section>
            <h2 className="text-3xl font-bold mb-6 section-title">Why Study in Canada?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "🎓", title: "Globally Ranked Universities", desc: "University of Toronto, UBC, McGill – world‑class education" },
                { icon: "💼", title: "PGWP up to 3 Years", desc: "Work after graduation – pathway to Permanent Residency" },
                { icon: "💰", title: "Affordable Tuition", desc: "CAD 15K–38K/year – much lower than USA/UK" },
                { icon: "🌍", title: "Safe & Multicultural", desc: "Friendly environment, Indian communities in major cities" },
                { icon: "🛂", title: "Easy Visa Process", desc: "SDS stream for faster processing for Indian students" },
                { icon: "🏆", title: "PR Pathway", desc: "Express Entry, PNP – stay and work permanently" },
              ].map((item, idx) => (
                <div key={idx} className={`animate-up stagger-${idx+1} info-card bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg`}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Top Universities */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center section-title-center">Top Universities for Indian Students</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { uni: "University of Toronto", rank: "#1 Canada (21 Global)", programs: "Business, CS/IT, Engineering" },
                { uni: "McGill University", rank: "#2 Canada (41 Global)", programs: "Management, Health Sciences" },
                { uni: "University of British Columbia", rank: "#3 Canada (45 Global)", programs: "CS/IT, Engineering, Business" },
                { uni: "University of Waterloo", rank: "#7 Canada", programs: "CS/IT, Engineering (Co‑op)" },
                { uni: "McMaster University", rank: "#4 Canada", programs: "Health Sciences, Engineering" },
                { uni: "University of Alberta", rank: "#5 Canada", programs: "Engineering, Business, CS" },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="font-bold text-gray-800 mb-1">{item.uni}</h3>
                  <p className="text-blue-600 text-sm font-semibold mb-2">{item.rank}</p>
                  <p className="text-gray-600 text-sm">{item.programs}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <a href="/contact" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition">Explore More Universities →</a>
            </div>
          </section>

          {/* Popular Programs */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-center section-title-center">Popular Programs in Canada</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {["Business & Management (MBA)", "Computer Science & AI", "Engineering", "Health Sciences & Nursing"].map((prog, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 text-center shadow-md border hover:shadow-lg transition-all">
                  <div className="text-2xl mb-2">⭐</div>
                  <p className="font-semibold text-gray-800">{prog}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cost Breakdown */}
          <section>
            <h2 className="text-3xl font-bold mb-6 section-title">Cost of Study & Living</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border text-center">
                <div className="text-4xl mb-2">🎓</div>
                <div className="text-2xl font-bold text-blue-600">CAD 15K–38K</div>
                <p className="text-gray-600">Tuition Fees (per year)</p>
                <p className="text-sm text-gray-500">₹10–25 lakhs approx.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border text-center">
                <div className="text-4xl mb-2">🏠</div>
                <div className="text-2xl font-bold text-green-600">CAD 10K–15K</div>
                <p className="text-gray-600">Living Cost (per year)</p>
                <p className="text-sm text-gray-500">Including rent, food, transport</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border text-center">
                <div className="text-4xl mb-2">💰</div>
                <div className="text-2xl font-bold text-purple-600">CAD 22,895</div>
                <p className="text-gray-600">GIC Required</p>
                <p className="text-sm text-gray-500">Guaranteed Investment Certificate</p>
              </div>
            </div>
          </section>

          {/* PGWP & PR */}
          <section className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-3xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">Post‑Graduation Work Permit (PGWP) & PR</h2>
              <p className="text-white/90 text-lg mt-2">Your pathway to Canadian Permanent Residency</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">🎓</div>
                <h3 className="font-bold text-xl mb-2">Complete Studies</h3>
                <p>Minimum 2‑year program in Canada</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">💼</div>
                <h3 className="font-bold text-xl mb-2">Get PGWP</h3>
                <p>Work up to 3 years after graduation</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-bold text-xl mb-2">Apply for PR</h3>
                <p>Express Entry or PNP after 1 year of skilled work</p>
              </div>
            </div>
          </section>

          {/* Intakes & Eligibility */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4">Key Intakes 2026</h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-2"> <strong>September (Fall)</strong> – Main intake, most programs</li>
                <li className="flex items-center gap-2">❄️ <strong>January (Winter)</strong> – Second major intake</li>
                <li className="flex items-center gap-2">☀️ <strong>May (Summer)</strong> – Limited programs</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4">2026 Eligibility</h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">✅ <strong>IELTS/PTE:</strong> 6.0+ overall (no band less 5.5)</li>
                <li className="flex items-center gap-2">✅ <strong>Academics:</strong> 60%+ in 12th/Bachelor's</li>
                <li className="flex items-center gap-2">✅ <strong>Visa:</strong> PAL required + CAD 22,895 GIC</li>
              </ul>
            </div>
          </section>

          {/* How ANU Helps */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">How ANU Education Helps You</h2>
            <p className="text-lg mb-6">Expert counselors guide you through university selection, SOP writing, PAL/GIC setup, and visa filing – 95%+ approval rate.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition">Start Your Journey Today</a>
              <a href="https://wa.me/919428186817" target="_blank" className="border-2 border-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition">💬 WhatsApp Now</a>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center section-title-center"> Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                {
                  q: "How much does it cost to study in Canada for Indian students?",
                  a: "Tuition fees range from CAD 15,000–38,000 per year (₹10–25 lakhs). Living costs average CAD 10,000–15,000 per year. Many universities offer scholarships for Indian students."
                },
                {
                  q: "What is PGWP in Canada?",
                  a: "The Post‑Graduation Work Permit (PGWP) allows students to work for up to 3 years after completing their studies. This is a major pathway to Canadian Permanent Residency."
                },
                {
                  q: "What are the main intakes in Canada?",
                  a: "The main intakes are September (Fall) – the largest intake, January (Winter) – second major, and May (Summer) – limited programs. We recommend applying 8–12 months in advance."
                },
                {
                  q: "Is IELTS required for Canada student visa?",
                  a: "Yes, most universities require IELTS 6.0–6.5 overall (no band less than 5.5). PTE, TOEFL, and Duolingo are also accepted by many institutions."
                },
                {
                  q: "What is the Canada student visa success rate?",
                  a: "With proper documentation and financial proof, the success rate is high (90%+). ANU Education has a 95%+ visa success rate for genuine students."
                },
                {
                  q: "Can I get PR after studying in Canada?",
                  a: "Yes, after completing a 2‑year program and 1 year of skilled work experience, you can apply for Permanent Residency through Express Entry or Provincial Nominee Programs (PNP)."
                },
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
                  <h3 className="font-semibold text-gray-800">{faq.q}</h3>
                  <p className="text-gray-600 mt-2">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="cta-banner rounded-3xl p-12 text-center text-white">
            <div className="max-w-3xl mx-auto">
              <div className="text-6xl mb-4 float">🇨🇦</div>
              <h2 className="text-3xl font-bold mb-4">Ready to Study in Canada?</h2>
              <p className="text-xl mb-6 text-white/90">Get personalized guidance on university selection, scholarships, visa, and PR pathways.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact" className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:shadow-xl transition">Apply for Free Counseling</a>
                <a href="https://wa.me/919428186817" target="_blank" className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">💬 Chat on WhatsApp</a>
              </div>
              <p className="mt-6 text-sm text-white/80">Limited seats available for September 2026 intake</p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}