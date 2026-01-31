export const metadata = {
  title: "Study Abroad Blog 2026 | IELTS, PTE, Germany – ANU Education",
  description:
    "Read expert blogs on IELTS, PTE, German language, study in Germany, visas, scholarships & study abroad preparation by ANU Education.",
};

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">
        Study Abroad Blog
      </h1>

      <p className="text-gray-700">
        Expert insights on IELTS, PTE, German & French language courses,
        study abroad preparation, visas, and international education.
      </p>

      {/* Blog List */}
      <div className="border rounded-xl p-5 hover:shadow-md transition">
        <h2 className="text-xl font-semibold text-blue-600">
          Study Abroad Prep 2026: IELTS, PTE, German & French Compared
        </h2>
        <p className="text-gray-600 mt-2">
          Daily routines, course comparison, success stories and a 12-week
          preparation plan for study abroad aspirants.
        </p>
        <a
          href="/blog/study-abroad-prep-2026"
          className="inline-block mt-3 text-green-600 font-medium hover:underline"
        >
          Read Full Guide →
        </a>
      </div>
    </div>
  );
}