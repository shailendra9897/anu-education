// app/study-in/dubai/page.tsx
export const metadata = {
  title: "Study in France - ANU Education",
  description: "Get admission in top business and fashion schools in France. Work part-time, get 2-year PSW and enjoy Europe’s lifestyle.",
};
export default function dubai() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Study in Canada</h1>
      <p className="text-lg text-gray-700">
        Canada is one of the most preferred destinations for international students due to its world-class education, multicultural environment, and post-study work opportunities.
      </p>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Why Study in Canada?</h2>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li>High-quality education with globally ranked universities</li>
          <li>Affordable tuition fees compared to USA or UK</li>
          <li>Opportunity to work while studying and post-graduation work permit (PGWP)</li>
          <li>Safe, diverse, and inclusive society</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Popular Programs</h2>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li>Business and Management</li>
          <li>Computer Science and IT</li>
          <li>Engineering and Technology</li>
          <li>Health Sciences</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Intakes</h2>
        <p>Major intakes in Canada: <strong>January, May, and September</strong></p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Eligibility</h2>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li>Minimum 55–60% in academics</li>
          <li>IELTS score of 6.0+ (no band less than 5.5)</li>
          <li>Strong SOP and financial documents</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">How ANU Education Helps</h2>
        <p className="text-gray-700">
          Our expert counselors will help you choose the right program, prepare your documents, write a strong SOP, and guide you through the visa process.
        </p>
      </section>

      <a href="/contact" className="inline-block mt-8 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
        Book Free Counseling
      </a>
    </div>
  );
}