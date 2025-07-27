export const metadata = {
  title: "Student Accommodation Help - ANU Education",
  description: "Find affordable and verified student accommodations near your campus.",
};

export default function AccommodationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Accommodation Assistance</h1>
      <p>We help you find safe, comfortable, and affordable places to stay abroad.</p>
      <ul className="list-disc pl-6">
        <li>Hostel & PG Options</li>
        <li>University Dorms & Off-campus Rentals</li>
        <li>Verified Listings & Contracts</li>
      </ul>
    </div>
  );
}