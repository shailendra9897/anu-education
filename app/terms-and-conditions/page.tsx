export const metadata = {
  title: "Terms & Conditions | ANU Education",
  description:
    "Terms and Conditions for counselling, demo classes, payments, and educational services provided by ANU Education.",
};

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 text-gray-800">
      <h1 className="text-3xl font-bold text-blue-700">Terms & Conditions</h1>

      <p>
        These Terms & Conditions govern your use of ANU Education’s website,
        counselling services, demo classes, and educational offerings.
      </p>

      <h2 className="text-xl font-semibold">1. Counselling & Demo Classes</h2>
      <p>
        Free counselling and demo classes are provided for guidance purposes
        only. Admission, visa approval, or score improvement is not guaranteed.
      </p>

      <h2 className="text-xl font-semibold">2. Course Enrolment & Fees</h2>
      <p>
        Course fees, discounts, or offers are subject to change. Payments made
        after demo classes are non-refundable unless stated otherwise in
        writing.
      </p>

      <h2 className="text-xl font-semibold">3. Payments</h2>
      <p>
        Payments may be accepted via UPI, bank transfer, or other approved
        methods. You are responsible for providing accurate payment details.
      </p>

      <h2 className="text-xl font-semibold">4. Student Responsibility</h2>
      <p>
        Students are responsible for providing correct academic and personal
        information. ANU Education is not liable for delays or rejections due to
        incorrect data.
      </p>

      <h2 className="text-xl font-semibold">5. Intellectual Property</h2>
      <p>
        All content, materials, videos, and course resources belong to ANU
        Education and may not be copied or redistributed without permission.
      </p>

      <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
      <p>
        ANU Education shall not be held liable for decisions made by universities,
        embassies, or testing authorities.
      </p>

      <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
      <p>
        We reserve the right to update these Terms & Conditions at any time.
        Continued use of our services indicates acceptance of updated terms.
      </p>

      <h2 className="text-xl font-semibold">8. Contact Information</h2>
      <p>
        <strong>Email:</strong> info@anuedu.in
        <br />
        <strong>Phone:</strong> +91 7016497087
      </p>

      <p className="text-sm text-gray-500">
        Last updated: January 2026
      </p>
    </div>
  );
}