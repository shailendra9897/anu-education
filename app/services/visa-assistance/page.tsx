export const metadata = {
  title: "Visa Assistance - ANU Education",
  description: "Complete visa support for study abroad students. Mock interviews, documentation, and embassy updates.",
};

export default function VisaAssistancePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Visa Assistance</h1>
      <p>
        Our expert visa counselors ensure a smooth visa process. From preparing financials to mock interviews, we help you at every step.
      </p>
      <ul className="list-disc pl-6">
        <li>Complete Documentation Review</li>
        <li>Visa Form Filling Help</li>
        <li>Mock Interview Preparation</li>
        <li>Regular Embassy Updates</li>
      </ul>
    </div>
  );
}