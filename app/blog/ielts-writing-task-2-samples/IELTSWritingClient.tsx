'use client';

import Script from "next/script";

export default function IELTSWritingSamples() {
  return (
    <>
      {/* Article Schema */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "IELTS Writing Task 2 Samples – Band 7 to Band 9 Guide",
            description:
              "Examples of Band 7–9 IELTS Writing Task 2 essays with strategies and practice topics for 2026.",
            author: {
              "@type": "Organization",
              name: "ANU Education",
            },
            publisher: {
              "@type": "Organization",
              name: "ANU Education",
              url: "https://www.anuedu.in",
            },
            datePublished: "2026-03-01",
          }),
        }}
      />

      {/* FAQ Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How many paragraphs should I write for IELTS Writing Task 2?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Aim for 4-5 paragraphs: Introduction, 2-3 body paragraphs, and a conclusion. Each body paragraph should focus on one main idea with examples."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use personal examples in IELTS essays?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Personal examples are acceptable, but make sure they're relevant and support your argument. For higher band scores, mix personal examples with broader societal evidence."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between Band 7 and Band 9 essays?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Band 9 essays demonstrate sophisticated vocabulary, complex sentence structures, and fully developed arguments with seamless coherence. Band 7 essays are competent but may have less flexibility or precision in language use."
                }
              }
            ]
          }),
        }}
      />

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .slide-left {
          animation: slideInLeft 0.8s ease-out forwards;
          opacity: 0;
        }

        .slide-right {
          animation: slideInRight 0.8s ease-out forwards;
          opacity: 0;
        }

        .slide-up {
          animation: slideInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
      `}</style>

      <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        
        {/* Hero Section with Animated Badge */}
        <div className="slide-up stagger-1">
          <div className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
            ⭐ Updated for 2026
          </div>
        </div>

        {/* TITLE with slide animation */}
        <h1 className="slide-left stagger-2 text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          IELTS Writing Task 2 Samples: <span className="block text-2xl md:text-3xl text-gray-700 mt-2">Band 9 Guide for 2026</span>
        </h1>

        {/* Description with slide animation */}
        <div className="slide-right stagger-3 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
          <p className="text-gray-700 text-lg leading-relaxed">
            IELTS Writing Task 2 tests your ability to write a clear, persuasive essay
            of at least <span className="font-bold text-green-600">250 words in 40 minutes</span>. 
            Topics usually include education, technology, health, environment, and society. 
            To achieve a high band score, you must demonstrate strong task response, 
            logical structure, vocabulary, and grammar.
          </p>
        </div>

        {/* QUICK STATS CARDS - Animated */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: "⏱️", label: "Time", value: "40 min", color: "from-blue-500 to-cyan-500" },
            { icon: "📝", label: "Words", value: "250+", color: "from-green-500 to-emerald-500" },
            { icon: "🎯", label: "Band Score", value: "7-9", color: "from-orange-500 to-red-500" },
            { icon: "📚", label: "Topics", value: "5+", color: "from-purple-500 to-pink-500" }
          ].map((stat, index) => (
            <div 
              key={index}
              className={`slide-up stagger-${index + 1} bg-gradient-to-br ${stat.color} text-white p-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-bold text-xl">{stat.value}</div>
              <div className="text-xs opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CORE STRATEGIES - Animated Card */}
        <div className="slide-up stagger-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-8 rounded-3xl shadow-2xl mb-12 hover:scale-[1.02] transition-all duration-500">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">🚀</span> Core Strategies for Band 8+
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="bg-white/20 p-2 rounded-lg">📐</span>
                <div>
                  <h3 className="font-bold">Structure</h3>
                  <p className="text-white/80">Introduction → 2–3 Body Paragraphs → Conclusion</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-white/20 p-2 rounded-lg">📊</span>
                <div>
                  <h3 className="font-bold">Word Count</h3>
                  <p className="text-white/80">Aim for 260–280 words</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="bg-white/20 p-2 rounded-lg">💡</span>
                <div>
                  <h3 className="font-bold">Vocabulary</h3>
                  <p className="text-white/80">Use collocations like <span className="bg-white/30 px-2 py-1 rounded">foster critical thinking</span></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-white/20 p-2 rounded-lg">⏰</span>
                <div>
                  <h3 className="font-bold">Timing</h3>
                  <p className="text-white/80">Plan (5 min) → Write (30 min) → Review (5 min)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SAMPLE 1 - Band 9 with animations */}
        <div className="slide-left stagger-5 bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border-l-8 border-yellow-400 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-xl font-bold text-lg flex items-center gap-2">
              <span>🏆</span> Band 9
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Education & Technology</h2>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mb-6 border border-gray-200">
            <p className="font-semibold text-gray-700 mb-2">📌 Question:</p>
            <p className="italic text-gray-600">
              "Some people believe that online learning will replace classroom learning. To what extent do you agree or disagree?"
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-400 hover:translate-x-2 transition-transform duration-300">
              <span className="font-bold text-blue-700 block mb-1">Introduction:</span>
              <p className="text-gray-700">While online learning platforms have revolutionized education through accessibility, I believe they cannot fully replace traditional classrooms because face-to-face interaction remains essential for effective learning.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-400 hover:translate-x-2 transition-transform duration-300">
              <span className="font-bold text-green-700 block mb-1">Body Paragraph 1:</span>
              <p className="text-gray-700">Online education provides flexibility and global reach. Platforms like Coursera allow students worldwide to access top university courses at low cost, which promotes lifelong learning opportunities.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-purple-400 hover:translate-x-2 transition-transform duration-300">
              <span className="font-bold text-purple-700 block mb-1">Body Paragraph 2:</span>
              <p className="text-gray-700">However, traditional classrooms encourage teamwork, discussion, and immediate teacher feedback. These factors build communication skills and deeper understanding.</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-400 hover:translate-x-2 transition-transform duration-300">
              <span className="font-bold text-orange-700 block mb-1">Conclusion:</span>
              <p className="text-gray-700">A hybrid system combining online platforms with classroom interaction provides the most effective educational model.</p>
            </div>
          </div>
        </div>

        {/* SAMPLE 2 - Band 8 with animations */}
        <div className="slide-right stagger-4 bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border-l-8 border-emerald-400 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-4 py-2 rounded-xl font-bold text-lg flex items-center gap-2">
              <span>🌟</span> Band 8
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Health & Lifestyle</h2>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mb-6 border border-gray-200">
            <p className="italic text-gray-600">
              "Governments should ban fast food to improve public health. Do you agree or disagree?"
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-xl hover:translate-x-2 transition-transform">
              <span className="font-bold text-red-700">Opening:</span> Although fast food contributes to obesity and other health problems, banning it entirely would not be the best solution. Instead, governments should focus on education and regulation.
            </div>
            <div className="p-4 bg-green-50 rounded-xl hover:translate-x-2 transition-transform">
              <span className="font-bold text-green-700">Supporting Point:</span> Fast food consumption is strongly linked to health issues such as diabetes and heart disease. Therefore, policies like sugar taxes and nutritional labeling can help reduce unhealthy consumption.
            </div>
            <div className="p-4 bg-orange-50 rounded-xl hover:translate-x-2 transition-transform">
              <span className="font-bold text-orange-700">Counter Argument:</span> However, banning fast food could limit personal freedom and create economic challenges for low-income families who rely on affordable food options.
            </div>
            <div className="p-4 bg-blue-50 rounded-xl hover:translate-x-2 transition-transform">
              <span className="font-bold text-blue-700">Conclusion:</span> In conclusion, governments should promote healthier lifestyles through education rather than strict bans.
            </div>
          </div>
        </div>

        {/* SAMPLE 3 - Band 7 with animations */}
        <div className="slide-left stagger-3 bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border-l-8 border-blue-400 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white px-4 py-2 rounded-xl font-bold text-lg flex items-center gap-2">
              <span>📘</span> Band 7
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Environment</h2>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mb-6 border border-gray-200">
            <p className="italic text-gray-600">
              "Individuals cannot improve the environment; only governments and large companies can make a difference. Do you agree?"
            </p>
          </div>

          <div className="space-y-3 text-gray-700">
            <p className="p-3 bg-indigo-50 rounded-lg">✅ <span className="font-medium">Introduction:</span> Governments and large organizations certainly play a major role in environmental protection, but individuals also contribute significantly through daily choices and social influence.</p>
            <p className="p-3 bg-indigo-50 rounded-lg">🏛️ Governments can introduce environmental policies, while corporations can implement sustainable production methods.</p>
            <p className="p-3 bg-indigo-50 rounded-lg">🌱 Nevertheless, individual actions such as reducing plastic use, recycling, and supporting eco-friendly businesses create meaningful long-term change.</p>
            <p className="p-3 bg-green-100 rounded-lg font-medium">🤝 Therefore, cooperation between governments, businesses, and individuals is necessary for effective environmental protection.</p>
          </div>
        </div>

        {/* PROGRESS TRACKER */}
        <div className="slide-up stagger-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white p-4 rounded-2xl mb-8 text-center">
          <p className="font-bold text-lg">📈 Band Score Progress: Band 7 → Band 8 → Band 9</p>
          <div className="w-full bg-white/30 h-2 rounded-full mt-2">
            <div className="w-2/3 bg-white h-2 rounded-full"></div>
          </div>
        </div>

        {/* PRACTICE TOPIC - Animated Card */}
        <div className="slide-up stagger-3 bg-gradient-to-br from-purple-600 to-pink-600 text-white p-8 rounded-3xl shadow-2xl mb-12 hover:scale-[1.02] transition-all duration-500">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">🎯</span> 2026 Practice Topic
          </h2>

          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
            <p className="text-xl md:text-2xl italic mb-6 leading-relaxed text-center">
              "Social media influencers negatively impact young people more than they benefit society. Discuss both views."
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="px-4 py-2 bg-white/30 rounded-full text-sm hover:bg-white/50 transition-colors cursor-default">📱 Negative: Unrealistic standards</span>
              <span className="px-4 py-2 bg-white/30 rounded-full text-sm hover:bg-white/50 transition-colors cursor-default">💼 Positive: Career inspiration</span>
              <span className="px-4 py-2 bg-white/30 rounded-full text-sm hover:bg-white/50 transition-colors cursor-default">⚖️ Balance both views</span>
            </div>
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="slide-up stagger-4 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ❓ Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "How many paragraphs should I write for IELTS Writing Task 2?",
                a: "Aim for 4-5 paragraphs: Introduction, 2-3 body paragraphs, and a conclusion. Each body paragraph should focus on one main idea with examples. This structure helps examiners follow your argument clearly."
              },
              {
                q: "Can I use personal examples in IELTS essays?",
                a: "Yes! Personal examples are acceptable and can make your essay more authentic. However, for higher band scores (8+), mix personal examples with broader societal evidence to demonstrate wider perspective."
              },
              {
                q: "What's the difference between Band 7 and Band 9 essays?",
                a: "Band 9 essays demonstrate sophisticated vocabulary, complex sentence structures, and fully developed arguments with seamless coherence. Band 7 essays are competent but may have less flexibility or precision in language use."
              },
              {
                q: "How important is the conclusion?",
                a: "Very important! A strong conclusion summarizes your main points and restates your position. It's your last chance to impress the examiner. Avoid introducing new ideas here."
              },
              {
                q: "Should I write more than 250 words?",
                a: "Yes, aim for 260-280 words. Writing exactly 250 words might limit your ability to fully develop arguments. However, don't exceed 300 words as you might run out of time or become repetitive."
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <span className="bg-gradient-to-br from-green-500 to-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-800">
                      {faq.q}
                    </h3>
                    <p className="text-gray-600">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TIPS GRID */}
        <div className="slide-up stagger-3 grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: "✍️", title: "Practice Daily", desc: "Write at least one essay every day" },
            { icon: "📖", title: "Read Samples", desc: "Study high-scoring essays" },
            { icon: "⏰", title: "Time Yourself", desc: "Stick to 40 minutes" }
          ].map((tip, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-md text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="text-3xl mb-2">{tip.icon}</div>
              <h3 className="font-bold">{tip.title}</h3>
              <p className="text-sm text-gray-600">{tip.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="slide-up stagger-4 bg-gradient-to-br from-green-600 to-emerald-600 text-white p-8 rounded-3xl shadow-2xl text-center hover:scale-[1.02] transition-all duration-500">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-2xl font-bold mb-3">
            Improve Your IELTS Writing Score
          </h3>

          <p className="mb-6 text-white/90 text-lg">
            Practice with real IELTS mock tests and get expert feedback on your essays. 
            <span className="block font-bold mt-2">Limited spots available for March 2026!</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://study.anuedu.in/register"
              className="bg-white text-green-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              🚀 Book Free Demo Class
              <span>→</span>
            </a>
            <a
              href="#samples"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              📚 View All Samples
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="slide-up stagger-5 mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Last Updated: March 2026 | ANU Education IELTS Coaching | Porbandar
          </p>
          <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
            <span>📚 50+ Sample Essays</span>
            <span>⭐ 98% Success Rate</span>
            <span>⏱️ Free Mock Tests</span>
          </div>
        </div>
      </main>
    </>
  );
}