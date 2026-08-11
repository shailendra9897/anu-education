export const metadata = {
  title: "Study in USA - ANU Education",
  description: "Apply to top US universities with ANU Education. STEM OPT, scholarships, and career-focused study in the USA made simple.",
};

export default function USAPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Study in the USA</h1>
      <p>The USA offers unmatched academic excellence, research opportunities, and a multicultural learning environment.</p>

      <h2 className="text-xl font-semibold">Why Choose the USA?</h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>Top-ranked universities and Ivy League options</li>
        <li>Flexible curriculum and electives</li>
        <li>STEM OPT work extension (up to 3 years)</li>
        <li>Research & innovation hub</li>
      </ul>

      <h2 className="text-xl font-semibold">Popular Fields</h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>Computer Science & AI</li>
        <li>Engineering</li>
        <li>Business & Finance</li>
        <li>Health and Life Sciences</li>
      </ul>

      <h2 className="text-xl font-semibold">Intakes</h2>
      <p>Fall (August), Spring (January), and Summer (May – limited)</p>

      <a href="/contact" className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">Apply Now</a>
    </div>
  );
}