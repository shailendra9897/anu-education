export const metadata = {
  title: "Scholarship Guidance - ANU Education",
  description: "Get assistance with university and government scholarships for international students.",
};

export default function ScholarshipPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Scholarship Guidance</h1>
      <p>Find and apply for scholarships offered by universities and governments worldwide.</p>
      <ul className="list-disc pl-6">
        <li>Merit-based Scholarships</li>
        <li>Country-specific Grants</li>
        <li>Application & Essay Support</li>
      </ul>
    </div>
  );
}