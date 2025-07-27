export const metadata = {
  title: "Know Your Score - ANU Education",
  description: "Evaluate your English test readiness with our quick assessment quiz.",
};

export default function KnowYourScorePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Know Your Score</h1>
      <p>Take a quick quiz to understand which English test you're most ready for: IELTS, PTE, or Duolingo.</p>
      <ul className="list-disc pl-6">
        <li>Free Assessment</li>
        <li>Instant Result</li>
        <li>Guidance Based on Score</li>
      </ul>
    </div>
  );
}