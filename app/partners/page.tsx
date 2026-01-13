export const metadata = {
  title: "Partner With ANU Education",
  description: "Partner with ANU Education and grow your educational or service network.",
};

export default function PartnersPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Partner With Us</h1>
      <p>We invite universities, agents, and service providers to collaborate with us.</p>
      <ul className="list-disc pl-6">
        <li>Recruitment Partnerships</li>
        <li>Test Prep Franchise</li>
        <li>Co-branded Events</li>
      </ul>
    </div>
  );
}