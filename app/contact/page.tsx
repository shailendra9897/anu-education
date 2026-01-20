import Script from "next/script";

export const metadata = {
  title: "Contact ANU Education – Study Abroad & Language Coaching",
  description:
    "Contact ANU Education for IELTS, PTE, German & French language coaching and study abroad consultancy in Germany. Call, WhatsApp or book a free course today.",
};

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

      {/* ===== SEO SCHEMA ===== */}
      <Script
        id="anu-education-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "ANU Education",
            "image": "https://www.anuedu.in/logo.png",
            "url": "https://www.anuedu.in/contact",
            "telephone": "+917016497087",
            "email": "info@anuedu.in",
            "address": {
              "@type": "PostalAddress",
              "streetAddress":
                "Krishna 137, Dwarkapuri Bunglows, Gitanjali Society",
              "addressLocality": "Modasa",
              "addressRegion": "Gujarat",
              "postalCode": "383315",
              "addressCountry": "IN",
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 23.4675584,
              "longitude": 73.3084437,
            },
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": "+917016497087",
                "contactType": "customer support",
                "areaServed": "IN",
                "availableLanguage": "English",
              }
            ],
            "sameAs": [],
            "makesOffer": [
              {
                "@type": "Service",
                "name": "IELTS Online Coaching",
              },
              {
                "@type": "Service",
                "name": "PTE Online Coaching",
              },
              {
                "@type": "Service",
                "name": "German Language Course",
              },
              {
                "@type": "Service",
                "name": "French Language Course",
              },
              {
                "@type": "Service",
                "name": "Study Abroad Consultant",
              }
            ]
          }),
        }}
      />

      {/* ===== PAGE CONTENT ===== */}
      <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
        Contact ANU Education – Study Abroad & Language Coaching
      </h1>

      <p className="text-gray-700 text-lg">
        Get expert guidance for <strong>IELTS, PTE, German & French language courses</strong> and
        professional <strong>Study Abroad consultancy for Germany</strong>.  
        We provide online coaching and personalized counselling across India.
      </p>

      {/* ===== CONTACT DETAILS ===== */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <p>
          📞 <strong>Call:</strong>{" "}
          <a
            href="tel:+917016497087"
            className="text-blue-600 hover:underline"
          >
            +91 70164 97087
          </a>
        </p>

        <p>
          📱 <strong>WhatsApp:</strong>{" "}
          <a
            href="https://wa.me/919428186817"
            target="_blank"
            className="text-green-600 hover:underline"
          >
            Chat on WhatsApp
          </a>
        </p>

        <p>
          ✉️ <strong>Email:</strong>{" "}
          <a
            href="mailto:info@anuedu.in"
            className="text-blue-600 hover:underline"
          >
            info@anuedu.in
          </a>
        </p>

        <address className="not-italic text-gray-700">
          📍 <strong>Address:</strong><br />
          Krishna 137, Dwarkapuri Bunglows,<br />
          Gitanjali Society, Modasa,<br />
          Gujarat 383315, India
        </address>
      </div>

      {/* ===== GOOGLE MAP ===== */}
      <div className="rounded-xl overflow-hidden border">
        <iframe
          title="ANU Education Location"
          src="https://www.google.com/maps?q=23.4675584,73.3084437&z=15&output=embed"
          width="100%"
          height="350"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* ===== SERVICES ===== */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Our Services</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>IELTS Online Coaching</li>
          <li>PTE Online Coaching</li>
          <li>German Language Course</li>
          <li>French Language Course</li>
          <li><strong>Study Abroad Consultant</strong></li>
        </ul>
      </div>

      {/* ===== CTA ===== */}
      <div className="bg-blue-50 p-6 rounded-xl text-center space-y-4">
        <h3 className="text-xl font-semibold text-blue-700">
          Start Your Journey with ANU Education
        </h3>
        <p className="text-gray-700">
          Book a <strong>FREE course demo or counselling session</strong> with our experts today.
        </p>
        <a
          href="https://study.anuedu.in/register"
          target="_blank"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700"
        >
          Book Free Course
        </a>
      </div>

    </div>
  );
}