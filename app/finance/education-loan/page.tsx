export const metadata = {
  title: "Education Loan Assistance - ANU Education",
  description: "Get help applying for education loans from Indian and international banks with ANU Education.",
};

export default function EducationLoanPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Education Loan Assistance</h1>
      <p>
        We help students secure loans from leading banks and NBFCs to fund their international education journey.
      </p>
      <ul className="list-disc pl-6">
        <li>Loan from Govt & Private Banks</li>
        <li>Low Interest Rates</li>
        <li>Unsecured & Secured Loan Options</li>
        <li>Quick Approval Process</li>
      </ul>
    </div>
  );
}