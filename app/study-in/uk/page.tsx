export const metadata = {
  title: "Study in UK - ANU Education",
  description: "Study in the UK with expert guidance. Apply to top universities, get scholarships & 2-year PSW. Start your UK study journey today with ANU Education.",
};
export default function UKPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Study in the UK</h1>
      <p>The UK is home to some of the world's most prestigious universities, offering globally recognized degrees and a vibrant campus life.</p>

      <h2 className="text-xl font-semibold">Why Study in the UK?</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>1-year Master's programs</li>
        <li>Post-study work visa (2 years for UG/PG)</li>
        <li>Diverse cultural exposure and historical cities</li>
        <li>World-ranked universities and research facilities</li>
      </ul>

      <h2 className="text-xl font-semibold">Popular Courses</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Finance, Law, and Business</li>
        <li>Engineering and Design</li>
        <li>Health Sciences</li>
      </ul>

      <h2 className="text-xl font-semibold">Intakes</h2>
      <p>September (main), January (secondary)</p>

      <h2 className="text-xl font-semibold">Eligibility</h2>
      <ul className="list-disc pl-6 text-gray-700">
        <li>60%+ in academics</li>
        <li>IELTS 6.0+ (some universities accept MOI)</li>
        <li>SOP, LORs, and financial proof</li>
      </ul>

      <a href="/contact" className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">Get Started</a>
    </div>
  );
}