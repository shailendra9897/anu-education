import Script from "next/script";

export const metadata = {
  title: "Best IELTS Online Coaching in India (2026 Guide) | ANU Education",
  description:
    "Looking for the best IELTS online coaching in India? Compare features, mock tests, Band 7+ strategies and free demo classes in this complete 2026 guide.",
  keywords:
    "best IELTS online coaching India, IELTS online classes India, IELTS preparation online, IELTS Band 7 strategy, IELTS free demo class",
};

export default function BlogPage() {
  const articleUrl =
    "https://www.anuedu.in/blog/best-ielts-online-coaching-india";

  return (
    <>
      {/* ================= ARTICLE SCHEMA ================= */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline:
              "Best IELTS Online Coaching in India (2026 Complete Guide)",
            description:
              "Complete guide to choosing the best IELTS online coaching in India and scoring Band 7+.",
            author: {
              "@type": "Organization",
              name: "ANU Education",
            },
            publisher: {
              "@type": "Organization",
              name: "ANU Education",
              logo: {
                "@type": "ImageObject",
                url: "https://www.anuedu.in/logo.png",
              },
            },
            mainEntityOfPage: articleUrl,
          }),
        }}
      />

      {/* ================= BREADCRUMB SCHEMA ================= */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.anuedu.in",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: "https://www.anuedu.in/blog",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Best IELTS Online Coaching in India",
                item: articleUrl,
              },
            ],
          }),
        }}
      />

      <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">

        {/* HERO */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Best IELTS Online Coaching in India (2026 Complete Guide)
        </h1>

        <p className="text-gray-600 mb-8">
          If you're searching for the <strong>best IELTS online coaching in India</strong>, 
          this complete guide will help you choose the right program and achieve 
          <strong> Band 7+ or higher</strong>.
        </p>

        {/* ================= TABLE OF CONTENTS ================= */}
        <div className="bg-gray-50 p-6 rounded-xl mb-10">
          <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
          <ul className="list-disc pl-6 space-y-2 text-green-700">
            <li><a href="#why-online">Why IELTS Online Coaching is Growing</a></li>
            <li><a href="#features">What Makes the Best IELTS Program?</a></li>
            <li><a href="#band7">How to Score Band 7+</a></li>
            <li><a href="#comparison">Online vs Offline Coaching</a></li>
            <li><a href="#recommendation">Recommended Program</a></li>
          </ul>
        </div>

        {/* SECTION 1 */}
        <h2 id="why-online" className="text-2xl font-semibold mt-10 mb-4">
          Why IELTS Online Coaching is Growing in India
        </h2>

        <p className="mb-6">
          Students from Delhi, Mumbai, Bangalore, Hyderabad, Ahmedabad, Jaipur 
          and across Tier-2 cities now prefer online IELTS coaching because it offers:
        </p>

        <ul className="list-disc pl-6 space-y-2 mb-8">
          <li>Live interactive Zoom classes</li>
          <li>Flexible batch timings</li>
          <li>Recorded session backup</li>
          <li>Access to mock tests anytime</li>
          <li>Lower cost compared to offline institutes</li>
        </ul>

        {/* SECTION 2 */}
        <h2 id="features" className="text-2xl font-semibold mt-10 mb-4">
          What Makes the Best IELTS Online Coaching?
        </h2>

        <ul className="list-disc pl-6 space-y-2 mb-8">
          <li>15+ Full-Length Mock Tests</li>
          <li>Structured Reading, Listening, Writing & Speaking modules</li>
          <li>Personalized Writing Correction</li>
          <li>1-on-1 Speaking Evaluation</li>
          <li>Free Demo Before Enrollment</li>
        </ul>

        {/* SECTION 3 */}
        <h2 id="band7" className="text-2xl font-semibold mt-10 mb-4">
          How to Score Band 7+ in IELTS
        </h2>

        <ul className="list-disc pl-6 space-y-2 mb-8">
          <li>Time management strategy in Reading</li>
          <li>Daily Listening practice</li>
          <li>Clear structure in Writing Task 1 & 2</li>
          <li>Fluency improvement for Speaking</li>
          <li>Weekly full-length mock tests</li>
        </ul>

        {/* SECTION 4 */}
        <h2 id="comparison" className="text-2xl font-semibold mt-10 mb-4">
          Online vs Offline IELTS Coaching
        </h2>

        <p className="mb-8">
          Online coaching provides flexibility, affordability, and access to expert 
          trainers nationwide. Offline coaching requires travel and fixed schedules. 
          For working professionals and students across India, online learning is more practical.
        </p>

        {/* RECOMMENDATION */}
        <h2 id="recommendation" className="text-2xl font-semibold mt-10 mb-4">
          Recommended IELTS Online Coaching Program
        </h2>

        <p className="mb-8">
          If you're looking for a structured online IELTS program with 
          15 mock tests, expert evaluation, and a free 3-day demo, explore our{" "}
          <a
            href="/test-prep/ielts-online"
            className="text-green-600 font-semibold"
          >
            IELTS Online Coaching
          </a>.
        </p>

        {/* CTA BOX */}
        <div className="bg-green-600 text-white p-8 rounded-xl text-center mt-12">
          <h2 className="text-xl font-semibold mb-3">
            Ready to Boost Your IELTS Score?
          </h2>
          <p className="mb-4">
            Join our 3-Day Free Demo and experience structured online IELTS coaching.
          </p>
          <a
            href="https://study.anuedu.in/register"
            className="bg-white text-green-700 px-6 py-3 rounded-lg font-medium"
          >
            Book Free Demo Now
          </a>
        </div>

      </main>
    </>
  );
}