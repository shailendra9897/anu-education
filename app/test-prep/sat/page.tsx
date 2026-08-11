export const metadata = {
  title: "SAT Coaching - ANU Education",
  description: "Join SAT prep classes at ANU Education. Focused learning, practice tests, and expert faculty.",
};

export default function SATPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">SAT Coaching</h1>
      <p>
        ANU Education offers SAT coaching to help students excel in reading, writing, and math. Ideal for undergrad admissions.
      </p>
      <ul className="list-disc pl-6">
        <li>Full-Length Practice Tests</li>
        <li>Math Tricks and Grammar Boost</li>
        <li>Time Management Strategies</li>
      </ul>
    </div>
  );
}