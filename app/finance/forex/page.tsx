export const metadata = {
  title: "Student Forex Service | Best Forex Rates for Students – ANU Education",
  description:
    "ANU Education provides student forex services with best exchange rates, fast international transfers, paperless process, and expert guidance for students studying abroad, especially Germany.",
};

export default function ForexPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

      {/* Hero */}
      <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
        🌍 ANU Education Forex Services
      </h1>
      <p className="text-lg text-gray-700">
        <strong>Best Forex Rates for Students</strong>, Anytime, Anywhere!  
        We ensure smooth, affordable international money transfers for your
        overseas education journey.
      </p>

      {/* Why Choose Us */}
      <h2 className="text-2xl font-semibold">✨ Why Choose Our Student Forex Service?</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Best Rates:</strong> Competitive forex rates specially for students</li>
        <li><strong>Transparent Pricing:</strong> No hidden charges</li>
        <li><strong>Lightning Fast Deposits:</strong> No delays in tuition or living expenses</li>
        <li><strong>Paperless Process:</strong> Fully digital & student-friendly</li>
      </ul>

      {/* How it Works */}
      <h2 className="text-2xl font-semibold">
        📘 Understanding Student International Money Transfers in 3 Steps
      </h2>

      <ol className="list-decimal pl-6 space-y-4 text-gray-700">
        <li>
          <strong>Initiate the Transfer</strong><br />
          Choose ANU Education Forex or your preferred bank and provide recipient
          details such as student name, account number, and SWIFT/BIC code.
        </li>

        <li>
          <strong>Processing via International Networks</strong><br />
          Payments are securely processed through global networks like SWIFT.
          Intermediary banks assist if required.
        </li>

        <li>
          <strong>Funds Credited</strong><br />
          The recipient bank credits the amount. Transfers usually take
          <strong> 1–5 business days</strong>.
        </li>
      </ol>

      {/* Student Focus */}
      <h2 className="text-2xl font-semibold">🎓 Tailored for Students</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Easy tuition fee payments</li>
        <li>Living expense transfers abroad</li>
        <li>Support for scholarships & stipends</li>
      </ul>

      {/* Internal Link to Germany */}
      <div className="bg-blue-50 p-6 rounded-xl space-y-3">
        <h3 className="text-xl font-semibold text-blue-700">
          Studying in Germany?
        </h3>
        <p className="text-gray-700">
          If you are planning to study in Germany, our student forex service
          helps you manage tuition fees, blocked account transfers, and living
          expenses smoothly.
        </p>
        <a
          href="/study-in/germany"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
        >
          Study in Germany – Complete Guide
        </a>
      </div>

      {/* CTA */}
      <div className="text-center pt-6">
        <a
          href="/contact"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700"
        >
          Get Student Forex Assistance
        </a>
      </div>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is a student forex service?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A student forex service helps international students transfer tuition fees, living expenses, and education-related funds abroad at competitive exchange rates."
                }
              },
              {
                "@type": "Question",
                "name": "Why choose ANU Education for student forex services?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ANU Education offers best student forex rates, transparent pricing, fast transfers, and a fully paperless process."
                }
              },
              {
                "@type": "Question",
                "name": "How long does an international student transfer take?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "International student transfers usually take 1–5 business days depending on banks and countries involved."
                }
              },
              {
                "@type": "Question",
                "name": "Is student forex required for studying in Germany?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, students studying in Germany require forex services for tuition fees, blocked account funding, and living expenses."
                }
              }
            ]
          })
        }}
      />

      {/* Service Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Student Forex Service",
            "description":
              "ANU Education provides student forex services including international money transfers, tuition fee payments, and living expense transfers for students studying abroad.",
            "provider": {
              "@type": "Organization",
              "name": "ANU Education",
              "url": "https://www.anuedu.in"
            },
            "areaServed": {
              "@type": "Country",
              "name": "India"
            },
            "audience": {
              "@type": "Audience",
              "audienceType": "International Students"
            }
          })
        }}
      />

    </div>
  );
}