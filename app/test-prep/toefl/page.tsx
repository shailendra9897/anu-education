export const metadata = {
  title: "TOEFL Coaching - ANU Education",
  description: "Get expert TOEFL preparation with ANU Education. Score high in reading, writing, listening, and speaking.",
};

export default function TOEFLPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">TOEFL Coaching</h1>
      <p>
        ANU Education provides structured TOEFL coaching for students aiming for top universities. Learn from TOEFL experts and boost your scores.
      </p>
      <ul className="list-disc pl-6">
        <li>Complete Section-wise Guidance</li>
        <li>Weekly Practice Exams</li>
        <li>Flexible Batch Timings</li>
      </ul>
    </div>
  );
}