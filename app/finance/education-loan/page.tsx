export const metadata = {
  title: "Education Loan Assistance - ANU Education",
  description: "Get help applying for education loans from Indian and international banks with ANU Education.",
};

export default function EducationLoanPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Fast Approval for Study Abroad Loans</h1>
      <p className="text-lg">
        Our loans are designed with <strong>no credit check</strong> or <strong>credit score requirement</strong>,
        offering students a stress-free financing solution for education.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center text-sm text-gray-700">
        <div>✅ Affordable Rates</div>
        <div>🚀 Quick Disbursal</div>
        <div>🎓 Your Own Loan Advisor</div>
      </div>

      <button className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition">
        Check Your Eligibility
      </button>

      <h2 className="text-2xl font-bold text-blue-700 mt-10">
        Unlocking global aspirations with ANU Education – Your Global Education Partner
      </h2>
      <p>
        We’ve partnered with top Indian and international banks to provide the best education loan options.
      </p>

      {/* Bank logos placeholder */}
      <div className="flex flex-wrap gap-4 items-center justify-center mt-4">
        <img src="/banks/hdfc.png" alt="HDFC" className="h-8" />
        <img src="/banks/icici.png" alt="ICICI" className="h-8" />
        <img src="/banks/sbi.png" alt="SBI" className="h-8" />
        <img src="/banks/axis.png" alt="Axis Bank" className="h-8" />
        <img src="/banks/avanse.png" alt="Avanse" className="h-8" />
        <img src="/banks/bob.png" alt="BOB" className="h-8" />
      </div>

      <h2 className="text-2xl font-bold text-blue-700 mt-10">
        Why Choose ANU Education for Education Loans?
      </h2>
      <div className="space-y-4 text-gray-800">
        <div>
          <strong>1. Trusted Expertise</strong>
          <p>
            ANU Education, a trusted study abroad consultancy in India, has guided thousands of students toward their global dreams.
          </p>
        </div>

        <div>
          <strong>2. Strong Financing Partners</strong>
          <p>
            We work with major banks and NBFCs to provide competitive and flexible loan options tailored for international education.
          </p>
        </div>

        <div>
          <strong>3. Fast & Hassle-Free Process</strong>
          <p>
            From documentation to final approval, our advisors assist you at every step for a smooth experience.
          </p>
        </div>
      </div>
    </div>
  );
}