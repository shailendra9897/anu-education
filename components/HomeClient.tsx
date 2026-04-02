'use client';

import Script from "next/script";
import { CountryCard } from '@/components/CountryCard';
import { TestCard } from '@/components/TestCard';
import { ServiceCard } from '@/components/ServiceCard';
import StudyAbroadSteps from '@/components/StudyAbroadSteps';

export default function HomeClient() {
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

        .hero-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .hero-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 30px 45px -15px rgba(0, 0, 0, 0.3);
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
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #22c55e);
          border-radius: 2px;
        }

        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.15);
        }

        .floating-shape {
          position: absolute;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1));
          border-radius: 50%;
          filter: blur(60px);
          z-index: 0;
        }
      `}</style>

      {/* ================= SCHEMA ================= */}
      <Script id="edu-schema" type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "ANU Education",
            "url": "https://www.anuedu.in",
            "telephone": "+91 7016497087",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Modasa",
              "addressRegion": "Gujarat",
              "addressCountry": "India"
            },
            "aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": 4.8,
  "reviewCount": 17
}
          })
        }}
      />

      {/* Floating Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape w-96 h-96 -top-20 -left-20 opacity-30"></div>
        <div className="floating-shape w-80 h-80 top-1/2 -right-20 opacity-20"></div>
        <div className="floating-shape w-64 h-64 bottom-20 left-1/3 opacity-25"></div>
      </div>

      {/* ================= PAGE ================= */}
      <div className="relative z-10 container mx-auto px-4 py-12 space-y-16">

        {/* ================= HERO SECTION ================= */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl text-white p-8 md:p-12 hero-card">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-16 -mb-16"></div>
          
          <div className="relative z-10 text-center space-y-6">
            {/* Badge */}
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
              ⭐ India's Most Trusted Study Abroad Consultant
            </div>

            {/* Main Heading */}
<h1 className="text-4xl md:text-6xl font-bold leading-tight animate-up stagger-1">
  <a href="/test-prep/ielts-coaching-india" className="hover:underline">
    IELTS Coaching
  </a>,{" "}
  <a href="/test-prep/pte" className="hover:underline">
    PTE Classes
  </a>{" "}
  & <br />
  <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
    Study Abroad Guidance in India
  </span>
</h1>

            {/* Description */}
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-up stagger-2">
              Join expert-led IELTS coaching, PTE classes, and study abroad counselling for Germany, UK, Canada & Europe. 
              Get <span className="font-bold text-yellow-300">FREE demo classes</span> and personalized guidance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 animate-up stagger-3">
              <a
                href="/free-demo"
                className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
              >
                <span>🎓</span> Book Free Demo Class
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>

              <a
                href="https://wa.me/919428186817"
                className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
              >
                <span>💬</span> WhatsApp Guidance
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm animate-up stagger-4">
              <span className="flex items-center gap-2">⭐ 4.8 ★ (Google Reviews)</span>
              <span className="flex items-center gap-2">🎯 98% Success Rate</span>
              <span className="flex items-center gap-2">🌍 10+ Countries</span>
            </div>
          </div>
        </section>

        {/* ================= STATS SECTION ================= */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: "👥", value: "1100+", label: "Students Trained", color: "from-blue-500 to-cyan-500" },
            { icon: "🎓", value: "98%", label: "Success Rate", color: "from-green-500 to-emerald-500" },
            { icon: "🌍", value: "10+", label: "Countries", color: "from-purple-500 to-pink-500" },
            { icon: "🏆", value: "150+", label: "Tie up Universities", color: "from-orange-500 to-red-500" }
          ].map((stat, index) => (
            <div
              key={index}
              className={`animate-up stagger-${index + 1} bg-gradient-to-br ${stat.color} text-white p-6 rounded-2xl shadow-xl text-center card-hover`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="font-bold text-2xl">{stat.value}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* ================= KEYWORD BOOST SECTION ================= */}
        <section className="bg-white p-8 rounded-3xl shadow-xl text-center border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 section-title">
            Best IELTS & PTE Coaching with Study Abroad Support
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Looking for <span className="font-semibold text-blue-600">IELTS coaching near you</span> or 
            <span className="font-semibold text-green-600"> PTE online classes</span>? ANU Education provides expert training, 
            mock tests, and complete study abroad support for Germany, UK, Canada and more.
          </p>
        </section>

        {/* ================= POPULAR COURSES QUICK LINKS ================= */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-8 section-title">
            Popular Courses & Services
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "IELTS Coaching Online", href: "/test-prep/ielts-online", color: "blue" },
              { name: "PTE Coaching", href: "/test-prep/pte", color: "green" },
              { name: "German Language", href: "/test-prep/german", color: "purple" },
              { name: "Free Demo Classes", href: "/free-demo", color: "orange" }
            ].map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={`animate-up stagger-${index + 1} px-6 py-3 bg-${link.color}-50 text-${link.color}-600 rounded-xl font-medium hover:bg-${link.color}-100 transition-all hover:scale-105 shadow-md`}
              >
                {link.name} →
              </a>
            ))}
          </div>
        </section>

        {/* ================= STUDY ABROAD DESTINATIONS ================= */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center section-title">
            🌍 Study Abroad Destinations
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <CountryCard name="Canada" image="/icons/canada.png" link="/study-in/canada" />
            <CountryCard name="UK" image="/icons/uk.png" link="/study-in/uk" />
            <CountryCard name="Germany" image="/icons/germany.png" link="/study-in/germany" />
            <CountryCard name="Australia" image="/icons/australia.png" link="/study-in/australia" />
            <CountryCard name="USA" image="/icons/usa.png" link="/study-in/usa" />
            <CountryCard name="Dubai" image="/icons/dubai.png" link="/study-in/dubai" />
            <CountryCard name="Ireland" image="/icons/ireland.png" link="/study-in/ireland" />
            <CountryCard name="France" image="/icons/france.png" link="/study-in/france" />
          </div>
        </section>

        {/* ================= TEST PREPARATION ================= */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center section-title">
            📝 Test Preparation
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <TestCard name="IELTS" link="/test-prep/ielts-online" />
            <TestCard name="PTE" link="/test-prep/pte" />
            <TestCard name="German" link="/test-prep/german" />
            <TestCard name="French" link="/test-prep/french" />
            <TestCard name="TOEFL" link="/test-prep/toefl" />
            <TestCard name="Duolingo" link="/test-prep/duolingo" />
          </div>
        </section>

        {/* ================= VALUE ADDED SERVICES ================= */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center section-title">
            ✨ Value Added Services
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <ServiceCard title="Visa Assistance" link="/services/visa-assistance" />
            <ServiceCard title="SOP Writing" link="/services/sop-writing" />
            <ServiceCard title="Accommodation" link="/services/accommodation" />
            <ServiceCard title="Scholarship Help" link="/services/scholarship" />
            <ServiceCard title="Loan Assistance" link="/services/loan" />
            <ServiceCard title="Career Counseling" link="/services/career-counseling" />
          </div>
        </section>

        {/* ================= STUDY ABROAD STEPS ================= */}
        <section className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center section-title">
            🚀 Step-by-Step Guide to Studying Abroad
          </h2>
          <StudyAbroadSteps />
        </section>

        {/* ================= TESTIMONIALS SECTION ================= */}
        <section className="bg-white p-8 rounded-3xl shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center section-title">
            ⭐ What Our Students Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Patel",
                course: "IELTS Band 7.5",
                text: "ANU Education helped me achieve my target score. The mock tests and feedback were extremely helpful!",
                rating: 5
              },
              {
                name: "Rahul Sharma",
                course: "Germany Admission",
                text: "Got admission to TU Munich! The visa guidance and SOP support were exceptional.",
                rating: 5
              },
              {
                name: "Neha Gupta",
                course: "PTE 79+",
                text: "The trainers are very experienced. Free demo class convinced me to join. Best decision ever!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className={`animate-up stagger-${index + 1} p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl card-hover`}>
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.course}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= CTA BANNER ================= */}
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-10 rounded-3xl shadow-2xl text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-5xl mb-4 float">🚀</div>
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Study Abroad Journey?</h2>
            <p className="text-xl mb-8 text-white/90">Join 1100+ successful students who achieved their dreams with ANU Education</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/free-demo"
                className="bg-white text-green-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
              >
                Book Free Demo Class
                <span>→</span>
              </a>
              <a
                href="/contact"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                Contact Counselor
              </a>
            </div>
            <p className="mt-4 text-sm text-white/80">Limited seats available for March 2026 batch</p>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              ©️ 2026 ANU Education - Study Abroad Consultants | Modasa, Gujarat
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="/about" className="hover:text-green-600 transition-colors">About</a>
              <a href="/contact" className="hover:text-green-600 transition-colors">Contact</a>
              <a href="/privacy" className="hover:text-green-600 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-green-600 transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}