export const metadata = {
  title: "Learn German Online – 3 Days Free Demo Classes | ANU Education",
  description:
    "Learn German online with 3 days free demo classes. Structured A1–C2 German courses with live speaking practice, CEFR-aligned curriculum, and certification.",
};

export default function GermanCoursePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

      {/* Hero */}
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
          Learn German Online – 3 Days Free Demo Classes
        </h1>
        <p className="text-lg text-gray-700">
          Welcome to your German learning journey. Our German online classes are
          designed to make language learning accessible, interactive, and effective.
          Courses are structured according to <strong>CEFR levels (A1–C2)</strong>.
        </p>
      </section>

      {/* Why Choose Us */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Why Choose Our German Classes?</h2>
        <ul className="space-y-3 text-gray-700">
          <li>🎓 <strong>Structured Curriculum:</strong> Grammar, vocabulary, speaking, and cultural context aligned with CEFR standards.</li>
          <li>🗣️ <strong>Speaking Focus:</strong> Live interactive sessions to build confidence and fluency.</li>
          <li>📚 <strong>Practical Resources:</strong> Exercises and materials designed for real-life usage.</li>
          <li>✅ <strong>Certification Path:</strong> Certificates provided upon successful course completion.</li>
          <li>🌍 <strong>Community Learning:</strong> Group activities and peer practice for faster improvement.</li>
        </ul>
      </section>

      {/* Special Offer */}
      <section className="bg-green-50 border border-green-200 p-6 rounded-xl text-center space-y-3">
        <h2 className="text-2xl font-semibold text-green-700">
          🎉 3 Days Free Demo Classes
        </h2>
        <p className="text-gray-700">
          Experience our teaching style, live speaking practice, and interactive
          exercises before you commit.
        </p>
        <a
          href="https://study.anuedu.in/register"
          target="_blank"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700"
        >
          Book Free Demo Class
        </a>
      </section>

      {/* Course Levels */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">German Course Levels</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Beginner (A1–A2):</strong> Basic vocabulary, everyday phrases, and simple grammar.</li>
          <li><strong>Intermediate (B1–B2):</strong> Fluency building, real-life conversations, and vocabulary expansion.</li>
          <li><strong>Advanced (C1–C2):</strong> Academic writing, professional communication, and advanced grammar.</li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li>Register online through our website</li>
          <li>Attend 3 days of free demo classes</li>
          <li>Choose a course level based on your goals</li>
          <li>Earn certificates after completion</li>
        </ol>
      </section>

      {/* Testimonials */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Student Testimonials</h2>
        <div className="bg-gray-50 p-5 rounded-xl space-y-3">
          <p className="italic text-gray-700">
            “The 3-day demo gave me confidence to continue. The speaking practice was excellent!”
          </p>
          <p className="font-semibold">– Itisha patel (A1 Level)</p>
        </div>
        <div className="bg-gray-50 p-5 rounded-xl space-y-3">
          <p className="italic text-gray-700">
            “I loved the interactive sessions. It felt like learning with friends while guided by experts.”
          </p>
          <p className="font-semibold">– Virendrasinh Rajput (B2 Level)</p>
        </div>
      </section>

      {/* Internal Link to Germany */}
      <section className="bg-blue-50 p-6 rounded-xl text-center space-y-4">
        <h2 className="text-xl font-semibold text-blue-700">
          Planning to Study in Germany?
        </h2>
        <p className="text-gray-700">
          German language skills are essential for university admission, APS approval,
          and visa success.
        </p>
        <a
          href="/study-in/germany"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700"
        >
          Study in Germany – Complete Guide
        </a>
      </section>

    </div>
  );
}