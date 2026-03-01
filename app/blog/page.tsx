import Image from "next/image";
import { blogs } from "@/lib/blogData";

export const metadata = {
  title: "Study Abroad Blog 2026 | IELTS, PTE, Germany – ANU Education",
  description:
    "Read expert blogs on IELTS, PTE, German language, study in Germany, visas, scholarships & study abroad preparation by ANU Education.",
};

export default function BlogPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">
          Study Abroad Blog
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Expert insights on IELTS, PTE, German & French language courses,
          study abroad preparation, visas, and international education.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {blogs.map((blog) => (
          <div
            key={blog.slug}
            className="border rounded-2xl overflow-hidden hover:shadow-xl transition bg-white"
          >
            <a href={`/blog/${blog.slug}`}>
              <Image
                src={blog.image}
                alt={blog.title}
                width={1200}
                height={800}
                className="w-full h-56 object-cover"
              />
            </a>

            <div className="p-6">
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {blog.category}
              </span>

              <h2 className="text-xl font-semibold mt-4 mb-3">
                {blog.title}
              </h2>

              <p className="text-gray-600 mb-4">
                {blog.description}
              </p>

              <a
                href={`/blog/${blog.slug}`}
                className="text-green-600 font-medium hover:underline"
              >
                Read Full Guide →
              </a>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}