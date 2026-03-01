export const metadata = {
  title: "Test Preparation Courses | IELTS, PTE & German – ANU Education",
  description:
    "Explore IELTS, PTE and German language test preparation courses by ANU Education. Live classes, mock tests, and expert trainers.",
};

export default function TestPrepPage() {
  return (
    <main className="bg-white text-gray-800">

      {/* HERO */}
      <section className="py-14 bg-gradient-to-r from-green-50 to-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-6">
            Test Preparation Courses at ANU Education
          </h1>
          <p className="text-lg text-gray-600">
            Prepare for IELTS, PTE, and German language exams with expert trainers, 
            mock tests, and personalized score improvement strategies.
          </p>
        </div>
      </section>

      {/* COURSE GRID */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* IELTS Online */}
            <div className="border p-6 rounded-2xl shadow-sm hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold mb-3">
                IELTS Online Coaching
              </h2>
              <p className="text-gray-600 mb-4">
                Live interactive IELTS classes with 15 full-length mock tests 
                and AI-based performance analysis.
              </p>
              <a
                href="/test-prep/ielts-online"
                className="text-green-600 font-semibold"
              >
                View IELTS Online →
              </a>
            </div>

            {/* IELTS Academic */}
            <div className="border p-6 rounded-2xl shadow-sm hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold mb-3">
                IELTS Academic
              </h2>
              <p className="text-gray-600 mb-4">
                Comprehensive IELTS Academic training for students planning 
                to study abroad.
              </p>
              <a
                href="/test-prep/ielts-academic"
                className="text-green-600 font-semibold"
              >
                View IELTS Academic →
              </a>
            </div>

            {/* PTE */}
            <div className="border p-6 rounded-2xl shadow-sm hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold mb-3">
                PTE Coaching
              </h2>
              <p className="text-gray-600 mb-4">
                AI-scored PTE mock tests, live classes, and expert guidance 
                to achieve 65+ and 79+ scores.
              </p>
              <a
                href="/test-prep/pte"
                className="text-green-600 font-semibold"
              >
                View PTE →
              </a>
            </div>

            {/* German */}
            <div className="border p-6 rounded-2xl shadow-sm hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold mb-3">
                German Language
              </h2>
              <p className="text-gray-600 mb-4">
                A1 to B2 German language classes for students planning 
                to study in Germany.
              </p>
              <a
                href="/test-prep/german"
                className="text-green-600 font-semibold"
              >
                View German →
              </a>
            </div>

            {/* GRE */}
<div className="border p-6 rounded-2xl shadow-sm hover:shadow-lg transition">
  <h2 className="text-2xl font-semibold mb-3">
    GRE Coaching
  </h2>
  <p className="text-gray-600 mb-4">
    Comprehensive GRE preparation with Quant, Verbal and AWA training for MS admissions abroad.
  </p>
  <a
    href="/test-prep/gre"
    className="text-green-600 font-semibold"
  >
    View GRE →
  </a>
</div>

{/* GMAT */}
<div className="border p-6 rounded-2xl shadow-sm hover:shadow-lg transition">
  <h2 className="text-2xl font-semibold mb-3">
    GMAT Coaching
  </h2>
  <p className="text-gray-600 mb-4">
    Expert GMAT training for MBA aspirants with mock tests and performance analysis.
  </p>
  <a
    href="/test-prep/gmat"
    className="text-green-600 font-semibold"
  >
    View GMAT →
  </a>
</div>

{/* SAT */}
<div className="border p-6 rounded-2xl shadow-sm hover:shadow-lg transition">
  <h2 className="text-2xl font-semibold mb-3">
    SAT Coaching
  </h2>
  <p className="text-gray-600 mb-4">
    SAT preparation for undergraduate admissions with Math and Evidence-Based Reading training.
  </p>
  <a
    href="/test-prep/sat"
    className="text-green-600 font-semibold"
  >
    View SAT →
  </a>
</div>

{/* TOEFL */}
<div className="border p-6 rounded-2xl shadow-sm hover:shadow-lg transition">
  <h2 className="text-2xl font-semibold mb-3">
    TOEFL Coaching
  </h2>
  <p className="text-gray-600 mb-4">
    TOEFL online preparation with structured Reading, Listening, Speaking and Writing modules.
  </p>
  <a
    href="/test-prep/toefl"
    className="text-green-600 font-semibold"
  >
    View TOEFL →
  </a>
</div>

{/* Duolingo */}
<div className="border p-6 rounded-2xl shadow-sm hover:shadow-lg transition">
  <h2 className="text-2xl font-semibold mb-3">
    Duolingo English Test
  </h2>
  <p className="text-gray-600 mb-4">
    Duolingo test preparation with adaptive practice questions and mock test simulations.
  </p>
  <a
    href="/test-prep/duolingo"
    className="text-green-600 font-semibold"
  >
    View Duolingo →
  </a>
</div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-green-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Not Sure Which Test Is Right for You?
        </h2>
        <p className="mb-6">
          Book a free counselling session and get expert guidance.
        </p>
        <a
          href="https://study.anuedu.in/register"
          className="bg-white text-green-700 px-8 py-3 rounded-xl font-semibold"
        >
          Book Free Counselling
        </a>
      </section>

    </main>
  );
}