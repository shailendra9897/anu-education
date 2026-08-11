export const metadata = {
  title: "Study in Australia - ANU Education",
  description: "Explore top universities in Australia. 2–4 year PSW, scholarships, and relaxed student life await you. Apply now with ANU Education.",
};

export default function AustraliaPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Study in Australia</h1>
      <p>Australia is known for its high-quality education, relaxed lifestyle, and post-study work opportunities.</p>

      <h2 className="text-xl font-semibold">Benefits of Studying in Australia</h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>PSW visa (up to 4 years in metro cities)</li>
        <li>Globally ranked institutions</li>
        <li>Scholarship options for international students</li>
        <li>Work rights for students and dependents</li>
      </ul>

      <h2 className="text-xl font-semibold">Top Courses</h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>Nursing & Healthcare</li>
        <li>Engineering & IT</li>
        <li>Business & Accounting</li>
      </ul>

      <h2 className="text-xl font-semibold">Intakes</h2>
      <p>February, July (main), November (limited)</p>

      <a href="/contact" className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">Talk to Counselor</a>
    </div>
  );
}
