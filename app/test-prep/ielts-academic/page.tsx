export const metadata = {
  title: "IELTS Academic Coaching - ANU Education",
  description:
    "Join IELTS Academic coaching at ANU Education and achieve your dream score. Expert trainers, mock tests, and personalized strategies.",
};

export default function IELTSAcademicPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">IELTS Academic Coaching</h1>
      <p>
        Prepare for your IELTS Academic test with ANU Education. Our expert trainers,
        practice materials, and real-time feedback will help you reach your target band.
      </p>
      <ul className="list-disc pl-6">
        <li>Certified IELTS Trainers</li>
        <li>Daily Practice + Mock Tests</li>
        <li>Speaking & Writing Sessions</li>
      </ul>
      <p className="text-lg font-medium text-green-700">Start your IELTS journey with us today!</p>
    </div>
  );
}