export const metadata = {
  title: "Privacy Policy | ANU Education",
  description:
    "Privacy Policy of ANU Education explaining how student data is collected, used, and protected for counselling, demo classes, and study abroad services.",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 text-gray-800">
      <h1 className="text-3xl font-bold text-blue-700">Privacy Policy</h1>

      <p>
        ANU Education respects your privacy and is committed to protecting the
        personal information you share with us. This Privacy Policy explains
        how we collect, use, and safeguard your data.
      </p>

      <h2 className="text-xl font-semibold">1. Information We Collect</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Name, phone number, email address</li>
        <li>Preferred course and target country</li>
        <li>Information shared via forms, WhatsApp, or counselling sessions</li>
      </ul>

      <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To provide free counselling and demo classes</li>
        <li>To contact you regarding courses, admissions, or services</li>
        <li>To improve our educational offerings and student support</li>
      </ul>

      <h2 className="text-xl font-semibold">3. Data Sharing</h2>
      <p>
        We do not sell or rent your personal data. Information may be shared
        only with trusted partners strictly for education-related services
        such as admissions, test preparation, or visa guidance.
      </p>

      <h2 className="text-xl font-semibold">4. Data Security</h2>
      <p>
        We use reasonable technical and organizational measures to protect your
        information from unauthorized access or misuse.
      </p>

      <h2 className="text-xl font-semibold">5. Cookies & Tracking</h2>
      <p>
        Our website may use cookies or analytics tools to improve user
        experience and website performance.
      </p>

      <h2 className="text-xl font-semibold">6. Your Consent</h2>
      <p>
        By submitting your information on our website, you consent to this
        Privacy Policy.
      </p>

      <h2 className="text-xl font-semibold">7. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, contact us at:
        <br />
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