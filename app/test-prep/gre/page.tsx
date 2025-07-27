export const metadata = {
  title: "GRE Coaching - ANU Education",
  description: "Score high in GRE with ANU Education’s focused coaching. Verbal, Quant, and AWA strategies covered.",
};

export default function GREPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">GRE Coaching</h1>
      <p>
        Get comprehensive GRE coaching at ANU Education. Learn strategies to improve both verbal reasoning and quantitative aptitude.
      </p>
      <ul className="list-disc pl-6">
        <li>Quant & Verbal Deep Dives</li>
        <li>Weekly Progress Tracking</li>
        <li>AWA Essay Training</li>
      </ul>
    </div>
  );
}