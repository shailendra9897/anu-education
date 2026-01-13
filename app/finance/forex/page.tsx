export const metadata = {
  title: "Forex Services for Students - ANU Education",
  description: "Get the best exchange rates for tuition fee payments, living expenses, and travel.",
};

export default function ForexPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Forex & Currency Exchange</h1>
      <p>
        We offer safe and hassle-free forex services for international students.
      </p>
      <ul className="list-disc pl-6">
        <li>Student-friendly Rates</li>
        <li>Prepaid Forex Cards</li>
        <li>Cash & Wire Transfers</li>
        <li>Secure & RBI-Approved</li>
      </ul>
    </div>
  );
}