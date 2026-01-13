export const metadata = {
  title: "Student Air Tickets - ANU Education",
  description: "Get best deals on international student flight tickets with extra baggage and discounts.",
};

export default function AirTicketsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Air Ticket Booking</h1>
      <p>We provide student discounts and special baggage allowances for flights.</p>
      <ul className="list-disc pl-6">
        <li>Lowest Fare Guarantee</li>
        <li>Student Discount Fares</li>
        <li>24/7 Booking Support</li>
      </ul>
    </div>
  );
}