export const metadata = {
  title: "Content Moderation & Acceptable Use Policy | ANU Education",
  description:
    "Content moderation and acceptable use policy for ANU Education website in compliance with Indian IT laws and digital ethics guidelines.",
};

export default function ContentPolicyPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">
        Content Moderation & Acceptable Use Policy
      </h1>

      <p className="mb-6">
        This Content Moderation and Acceptable Use Policy governs the use of
        the ANU Education website and related digital services. By accessing
        or using our website, you agree to comply with this policy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        1. Purpose of This Policy
      </h2>
      <p className="mb-6">
        ANU Education is committed to maintaining a safe, respectful, and
        legally compliant digital environment. This policy outlines acceptable
        conduct for users interacting with our website, forms, and digital
        platforms.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        2. Prohibited Content & Activities
      </h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Posting or transmitting unlawful, defamatory, or harmful content</li>
        <li>Uploading misleading, fraudulent, or false information</li>
        <li>Attempting to hack, disrupt, or misuse website functionality</li>
        <li>Impersonating ANU Education staff or representatives</li>
        <li>Using the website for spam, bulk messaging, or promotional abuse</li>
        <li>Violating intellectual property rights</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        3. User-Submitted Information
      </h2>
      <p className="mb-6">
        Any information submitted through contact forms, demo registrations,
        or inquiries must be accurate and lawful. ANU Education reserves the
        right to reject or remove any misleading or inappropriate submissions.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        4. Content Monitoring & Removal
      </h2>
      <p className="mb-6">
        ANU Education reserves the right to review, remove, or restrict access
        to any content or user activity that violates this policy or applicable
        Indian laws, including the Information Technology Act and related rules.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        5. Intellectual Property
      </h2>
      <p className="mb-6">
        All content, including text, logos, course materials, and website
        design elements, is the intellectual property of ANU Education.
        Unauthorized reproduction or distribution is strictly prohibited.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        6. Legal Compliance
      </h2>
      <p className="mb-6">
        This policy is drafted in accordance with applicable Indian laws,
        including digital media and intermediary guidelines. Users are expected
        to comply with all relevant laws when interacting with our platform.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        7. Contact for Policy Concerns
      </h2>
      <p>
        For any concerns related to content or acceptable use, please contact:
        <br />
        <strong>Email:</strong> info@anuedu.in
        <br />
        <strong>Phone:</strong> +91 7016497087
      </p>
    </main>
  );
}