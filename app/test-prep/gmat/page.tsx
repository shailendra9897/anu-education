export const metadata = {
  title: "GMAT Coaching - ANU Education",
  description: "Crack the GMAT exam with ANU Education’s expert training. Adaptive prep, analytics, and mocks.",
};

export default function GMATPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">GMAT Coaching</h1>
      <p>
        ANU Education provides adaptive GMAT coaching, covering quantitative, verbal, and integrated reasoning with smart practice tools.
      </p>
      <ul className="list-disc pl-6">
        <li>Computer Adaptive Prep</li>
        <li>Integrated Reasoning Mastery</li>
        <li>Smart Analytics for Progress</li>
      </ul>
    </div>
  );
}