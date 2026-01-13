export const metadata = {
  title: "About Us - ANU Education",
  description: "Learn about ANU Education, your trusted partner for studying abroad.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">About ANU Education</h1>
      <p>
        ANU Education is committed to helping students fulfill their dream of studying abroad. With years of experience,
        expert counselors, and 1000+ success stories, we’re a name you can trust.
      </p>
      <ul className="list-disc pl-6">
        <li>Transparent Counseling</li>
        <li>University Tie-ups in 6+ Countries</li>
        <li>Test Prep & Visa Guidance</li>
      </ul>
    </div>
  );
}