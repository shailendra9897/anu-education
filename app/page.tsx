'use client';

import { CountryCard } from '@/components/CountryCard';
import { TestCard } from '@/components/TestCard';
import { ServiceCard } from '@/components/ServiceCard';
import StudyAbroadSteps from '@/components/StudyAbroadSteps'; // ⬅️ import the new component

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">

      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-2">Welcome to ANU Education</h1>
        <p className="text-lg text-gray-600">Your trusted partner in studying abroad and test prep</p>
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