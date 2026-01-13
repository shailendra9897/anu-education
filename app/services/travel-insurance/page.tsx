export const metadata = {
  title: "Travel Insurance for Students - ANU Education",
  description: "Comprehensive travel insurance plans covering medical, baggage loss, and trip delays.",
};

export default function TravelInsurancePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Travel Insurance</h1>
      <p>We help you choose travel insurance that keeps you protected during your journey.</p>
      <ul className="list-disc pl-6">
        <li>Medical Emergencies Covered</li>
        <li>Trip Cancellation & Delay</li>
        <li>Baggage & Document Loss</li>
      </ul>
    </div>
  );
}