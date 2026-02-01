// metadata
export const metadata = {
  title: "About Us - ANU Education",
  description: "Learn about ANU Education, your trusted partner for studying abroad.",
};

// About Section Component
function AboutSection() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">About ANU Education</h1>
      <p>
        ANU Education is committed to helping students fulfill their dream of studying abroad. With years of experience,
        expert counselors, and 1000+ success stories, we’re a name you can trust.
      </p>
      <ul className="list-disc pl-6">
        <li>Transparent Counseling</li>
        <li>University Tie-ups in 6+ Countries</li>
        <li>Test Prep & Visa Guidance</li>
      </ul>
    </section>
  );
}

// Certification Section Component
function CertificationSection() {
  return (
    <section className="mt-10 bg-gray-50 p-6 rounded-xl border">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">
        Certified Career & Education Counselling
      </h2>

      <div className="flex flex-col md:flex-row items-start gap-6">
        <img
          src="/certificates/skill-india-career-counsellor.webp"
          alt="Skill India certified career and education counsellor certificate"
          className="w-full md:w-64 rounded-lg shadow-md"
          loading="lazy"
        />

        <div className="text-gray-700 space-y-3">
          <p>
            ANU Education provides guidance backed by professional training.
            Our counsellor is <strong>certified in Career & Education Counselling
            under the Skill India initiative</strong>.
          </p>

          <p className="text-sm text-gray-600">
            This certification ensures ethical counselling practices,
            structured career guidance, and student-first decision making.
          </p>
        </div>
      </div>
    </section>
  );
}

// Main Page Component
export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <AboutSection />
      <CertificationSection />
    </div>
  );
}