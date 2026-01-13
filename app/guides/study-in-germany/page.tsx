export const metadata = {
  title: "Study in Germany Guide for Indian Students | ANU Education",
  description:
    "Complete guide to study in Germany for Indian students. APS certificate, blocked account, eligibility, costs, visa process, work rights & PR explained clearly.",
};

export default function StudyInGermanyGuide() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

      {/* HERO */}
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
          Complete Guide to Study in Germany for Indian Students
        </h1>
        <p className="text-gray-700 text-lg">
          Germany is one of the best destinations for Indian students because of
          <strong> free public universities, strong job market, and PR opportunities</strong>.
          This guide explains the full process step by step.
        </p>
      </section>

      {/* WHY GERMANY */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Why Study in Germany?</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>No or very low tuition fees at public universities</li>
          <li>Globally recognised degrees</li>
          <li>High demand for engineering, IT & technical professionals</li>
          <li>Work part-time while studying</li>
          <li>Clear pathway to Permanent Residency (PR)</li>
        </ul>
      </section>

      {/* ELIGIBILITY */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Eligibility for Indian Students</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Relevant Bachelor’s degree for Master’s programs</li>
          <li>APS Certificate (mandatory)</li>
          <li>IELTS or German language proficiency (A2–B1 depending on course)</li>
          <li>SOP, CV & academic documents</li>
        </ul>
      </section>

      {/* APS */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">APS Certificate Explained</h2>
        <p className="text-gray-700">
          APS (Akademische Prüfstelle) verifies Indian academic documents.
          Without APS approval, German universities and visa applications are not accepted.
        </p>
      </section>

      {/* BLOCKED ACCOUNT */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Blocked Account Explained</h2>
        <p className="text-gray-700">
          Indian students must show proof of funds using a blocked account.
          The current requirement is approximately <strong>€11,208</strong> for one year.
        </p>
      </section>

      {/* COST */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Cost of Study & Living</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Tuition fees: €0 – €1,500 per year (public universities)</li>
          <li>Living expenses: €850 – €1,000 per month</li>
          <li>Health insurance & semester fees extra</li>
        </ul>
      </section>

      {/* WORK & PR */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Work Opportunities & PR</h2>
        <p className="text-gray-700">
          Students can work <strong>120 full days or 240 half days</strong> per year.
          After graduation, Germany provides an <strong>18-month job search visa</strong>
          and a strong PR pathway.
        </p>
      </section>

      {/* CTA */}
      <section className="bg-blue-50 p-6 rounded-xl text-center space-y-4">
        <h3 className="text-xl font-semibold text-blue-700">
          Need Expert Guidance?
        </h3>
        <p className="text-gray-700">
          Get expert help with universities, APS, visa, IELTS & German language preparation.
        </p>
        <a
          href="https://study.anuedu.in/register"
          target="_blank"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700"
        >
          Book FREE Counselling / IELTS / German Class
        </a>
      </section>

    </div>
  );
}