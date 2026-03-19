'use client';

import { blogs } from "@/lib/blogData";

export default function BlogPage() {
  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(34, 197, 94, 0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-left {
          animation: fadeInLeft 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-right {
          animation: fadeInRight 0.8s ease-out forwards;
          opacity: 0;
        }

        .float {
          animation: float 3s ease-in-out infinite;
        }

        .pulse {
          animation: pulse 2s infinite;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }

        .blog-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .blog-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 40px -15px rgba(0, 0, 0, 0.2);
        }

        .blog-card:hover .blog-image {
          transform: scale(1.05);
        }

        .blog-image {
          transition: transform 0.6s ease;
        }

        .category-tag {
          transition: all 0.3s ease;
        }

        .category-tag:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .read-more {
          position: relative;
          display: inline-block;
        }

        .read-more::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -2px;
          left: 0;
          background: linear-gradient(90deg, #22c55e, #3b82f6);
          transition: width 0.3s ease;
        }

        .read-more:hover::after {
          width: 100%;
        }

        .gradient-border {
          position: relative;
          border: double 1px transparent;
          border-radius: 1rem;
          background-image: linear-gradient(white, white), 
                            linear-gradient(90deg, #3b82f6, #22c55e, #a855f7);
          background-origin: border-box;
          background-clip: padding-box, border-box;
        }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* HERO SECTION */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="animate-left stagger-1 text-center md:text-left md:flex md:items-center md:justify-between">
              <div className="md:w-2/3">
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
                  📚 Knowledge Hub
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Study Abroad Blog
                </h1>
                <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                  Expert insights on IELTS, PTE, German & French language courses,
                  study abroad preparation, visas, and international education.
                </p>
              </div>
              <div className="hidden md:block text-7xl opacity-20 animate-right stagger-2">
                📖
              </div>
            </div>
            
            {/* STATS BANNER */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 animate-up stagger-3">
              {[
                { icon: "📝", value: "50+", label: "Articles" },
                { icon: "⏱️", value: "5 min", label: "Read Time" },
                { icon: "🎯", value: "2026", label: "Updated" },
                { icon: "⭐", value: "98%", label: "Satisfaction" }
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="font-bold text-xl">{stat.value}</div>
                  <div className="text-xs text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DEMO BANNER */}
        <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
          <div className="animate-up stagger-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-2xl p-6 md:p-8 pulse">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl text-3xl">🎯</div>
                <div>
                  <h3 className="text-xl font-bold">Free IELTS / PTE Demo Classes Available</h3>
                  <p className="text-white/90">Limited seats • Book your spot today</p>
                </div>
              </div>
              <a
                href="/free-demo"
                className="group bg-white text-green-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                Book Now 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* FEATURED CATEGORIES */}
        <div className="max-w-6xl mx-auto px-4 mt-16">
          <h2 className="animate-left stagger-2 text-2xl font-bold mb-8 text-gray-800 flex items-center gap-2">
            <span className="text-3xl">🔍</span> Browse by Category
          </h2>
          
          <div className="flex flex-wrap gap-3 mb-12">
            {["IELTS", "PTE", "German Language", "Study in Germany", "Visa", "Scholarships"].map((category, index) => (
              <span
                key={index}
                className={`animate-up stagger-${index + 1} category-tag px-5 py-2 bg-white rounded-full shadow-md text-gray-700 font-medium cursor-pointer hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* BLOG GRID */}
        <div className="max-w-6xl mx-auto px-4 pb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="animate-left stagger-2 text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-3xl">📚</span> Latest Articles
            </h2>
            <div className="text-sm text-gray-500 animate-right stagger-2">
              Showing {blogs.length} articles
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => {
              // Generate random gradient for each blog card
              const gradients = [
                "from-blue-400 to-indigo-500",
                "from-green-400 to-emerald-500",
                "from-purple-400 to-pink-500",
                "from-orange-400 to-red-500",
                "from-cyan-400 to-teal-500",
                "from-yellow-400 to-amber-500"
              ];
              const gradient = gradients[index % gradients.length];
              
              return (
                <div
                  key={blog.slug}
                  className={`blog-card animate-up stagger-${(index % 5) + 1} group bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all`}
                >
                  {/* Card Header with Gradient */}
                  <div className={`h-32 bg-gradient-to-r ${gradient} p-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                    
                    {/* Category Tag */}
                    <span className="relative inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {blog.category}
                    </span>
                    
                    {/* Reading Time Badge */}
                    <span className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                      ⏱️ 5 min read
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h2 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      <a href={`/blog/${blog.slug}`}>
                        {blog.title}
                      </a>
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {blog.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span>📅</span> Updated 2026
                      </span>
                      <span className="flex items-center gap-1">
                        <span>👁️</span> 1.2k reads
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Study Abroad</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Exam Tips</span>
                    </div>

                    {/* Read More Link */}
                    <a
                      href={`/blog/${blog.slug}`}
                      className="read-more inline-flex items-center text-green-600 font-medium group-hover:text-blue-600 transition-colors"
                    >
                      Read Full Guide
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>

                    {/* Bottom Strip */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <span>👤</span> ANU Expert
                      </span>
                      <span className="text-gray-400">
                        🚀 2026 Guide
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="animate-up stagger-5 bg-white border-2 border-blue-500 text-blue-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-500 hover:text-white transition-all hover:scale-105 inline-flex items-center gap-2">
              <span>📚</span> Load More Articles
              <span>↓</span>
            </button>
          </div>
        </div>

        {/* NEWSLETTER SECTION */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-left stagger-1">
                <div className="text-5xl mb-4 float">📬</div>
                <h2 className="text-3xl font-bold mb-4">Stay Updated with Latest Tips</h2>
                <p className="text-gray-300 text-lg mb-6">
                  Get weekly IELTS strategies, study abroad updates, and expert advice directly in your inbox.
                </p>
                <div className="flex gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-all hover:scale-105">
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  🔒 No spam. Unsubscribe anytime.
                </p>
              </div>
              <div className="animate-right stagger-2 grid grid-cols-2 gap-4">
                {[
                  { icon: "📝", value: "50+", label: "Articles" },
                  { icon: "🎯", value: "Free", label: "Resources" },
                  { icon: "⭐", value: "98%", label: "Success" },
                  { icon: "🌍", value: "10k+", label: "Readers" }
                ].map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="font-bold text-xl">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                ©️ 2026 ANU Education - Study Abroad Consultants | India | Gujarat
              </p>
              <div className="flex gap-6 text-sm text-gray-500">
                <a href="#" className="hover:text-green-600 transition-colors">About</a>
                <a href="#" className="hover:text-green-600 transition-colors">Contact</a>
                <a href="#" className="hover:text-green-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-green-600 transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}