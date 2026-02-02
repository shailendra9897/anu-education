'use client';

import { CountryCard } from '@/components/CountryCard';
import { TestCard } from '@/components/TestCard';
import { ServiceCard } from '@/components/ServiceCard';
import StudyAbroadSteps from '@/components/StudyAbroadSteps'; // ⬅️ import the new component

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">

      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-700">
          Study Abroad & Language Coaching for Indian Students
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Free demo classes for IELTS & German language, expert counselling for
          Study in Germany, UK, Canada & Europe — all under one roof.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <a
            href="https://study.anuedu.in/register"
            target="_blank"
            className="bg-green-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-green-700"
          >
            🎓 Book Free Language Class
          </a>

          <p className="text-sm text-gray-500 pt-4">
            ✔ Google-verified education consultant · ✔ Serving students across India · ✔ Online & Offline Support
          </p>

          <a
            href="https://anueducation.applyviz.com/walk-in"
            target="_blank"
            className="border border-blue-600 text-blue-600 px-8 py-3 rounded-xl text-lg hover:bg-blue-50"
          >
            🧭 Free Study Abroad Counselling
          </a>
        </div>
      </section>

      {/* Confused Section (with checkmark icon) */}
      <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center space-y-3">
        <h2 className="text-xl md:text-2xl font-semibold text-blue-700">
          Confused About Study Abroad or Language Courses?
        </h2>

        <p className="text-gray-700 flex items-center justify-center gap-2">
          {/* ✅ Checkmark icon */}
          <svg xmlns="http://www.w3.org/2000/svg" 
               className="h-4 w-4 text-green-600" 
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M5 13l4 4L19 7" />
          </svg>
          Get free guidance from a <strong>Skill India Certified Career Counsellor</strong>. 
          No spam. No pressure.
        </p>

        <a
          href="https://wa.me/919428186817?text=Hi%20ANU%20Team%2C%20I%20need%20free%20guidance%20for%20study%20abroad%20or%20language%20course."
          target="_blank"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-green-700 transition"
        >
          💬 Get Free Guidance on WhatsApp
        </a>
      </section>

      {/* FREE COUNSELLING SECTION */}
      <section className="bg-blue-50 py-10 px-6 rounded-xl text-center space-y-5">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-700">
          Free Study Abroad Counselling & Language Demo Classes
        </h2>

        <p className="text-gray-700 max-w-3xl mx-auto">
          Planning to study abroad in 2026? Get expert guidance for
          <strong> Study in Germany, UK, Canada & Europe</strong>.
          Attend free demo classes for <strong>IELTS & German language</strong>
          and get clarity on universities, APS, visa, blocked account & PR options.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <a
            href="https://study.anuedu.in/register"
            target="_blank"
            className="bg-green-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-green-700"
          >
            🎓 Book Free Language Class
          </a>

          <a
            href="https://anueducation.applyviz.com/walk-in"
            target="_blank"
            className="border border-blue-600 text-blue-600 px-8 py-3 rounded-xl text-lg hover:bg-blue-50"
          >
            🧭 Book Free Study Abroad Counselling
          </a>
        </div>

        <p className="text-sm text-gray-600 italic">
          Limited slots • No obligation • 100% free guidance
        </p>
      </section>

      {/* Study Abroad */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Study Abroad Destinations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <CountryCard name="Canada" image="/icons/canada.png" link="/study-in/canada" />
          <CountryCard name="UK" image="/icons/uk.png" link="/study-in/uk" />
          <CountryCard name="USA" image="/icons/usa.png" link="/study-in/usa" />
          <CountryCard name="Australia" image="/icons/australia.png" link="/study-in/australia" />
          <CountryCard name="Germany" image="/icons/germany.png" link="/study-in/germany" />
          <CountryCard name="Dubai" image="/icons/dubai.png" link="/study-in/dubai" />
          <CountryCard name="France" image="/icons/france.png" link="/study-in/france" />
        </div>
      </section>

      {/* Test Prep */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Test Preparation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <TestCard name="IELTS Academic" link="/test-prep/ielts-academic" />
          <TestCard name="IELTS General" link="/test-prep/ielts-general" />
          <TestCard name="GERMAN" link="/test-prep/german" />
          <TestCard name="PTE" link="/test-prep/pte" />
          <TestCard name="Duolingo" link="/test-prep/duolingo" />
          <TestCard name="SAT" link="/test-prep/sat" />
          <TestCard name="GRE" link="/test-prep/gre" />
          <TestCard name="GMAT" link="/test-prep/gmat" />
        </div>
      </section>

      {/* Services */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Value Added Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <ServiceCard title="Scholarships" link="/services/scholarship" />
          <ServiceCard title="SOP Writing" link="/services/sop-writing" />
          <ServiceCard title="Accommodation" link="/services/accommodation" />
          <ServiceCard title="SIM Card" link="/services/sim-card" />
          <ServiceCard title="Visa Assistance" link="/services/visa-assistance" />
          <ServiceCard title="Air Tickets" link="/services/air-tickets" />
          <ServiceCard title="Travel Insurance" link="/services/travel-insurance" />
          <ServiceCard title="Know Your Score" link="/services/know-your-score" />
        </div>
      </section>

      {/* Step by Step Guide */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Step-by-Step Guide to Studying Abroad with ANU
        </h2>
        <StudyAbroadSteps />
      </section>
    </div>
  );
}