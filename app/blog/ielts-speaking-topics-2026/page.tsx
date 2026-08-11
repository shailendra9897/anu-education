'use client';

import Script from "next/script";

export default function IELTSSpeakingPage() {
  return (
    <>
      {/* ================= SCHEMA ================= */}

      <Script
        id="faq-schema-speaking"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What topics are asked in IELTS Speaking?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Common topics include hobbies, education, work, travel, technology, and daily life experiences.",
                },
              },
              {
                "@type": "Question",
                name: "How to score Band 7 in IELTS Speaking?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Speak fluently, use advanced vocabulary, avoid repetition, and give structured answers with examples.",
                },
              },
              {
                "@type": "Question",
                name: "Is IELTS Speaking difficult?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No, it is a simple conversation test. With practice and confidence, you can score high.",
                },
              },
            ],
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

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
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

        .cue-card:hover {
          transform: translateY(-8px) rotate(1deg);
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      <main className="max-w-4xl mx-auto px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
        
        {/* HERO SECTION */}
        <div className="slide-up stagger-1 text-center mb-10">
          <div className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4 float">
            ⭐ Updated for 2026
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            IELTS Speaking Topics 2026
          </h1>
          <p className="text-xl text-gray-600">Cue Cards + Sample Answers for Band 7+</p>
        </div>

        {/* INTRO CARD */}
        <div className="slide-right stagger-2 bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-8 rounded-3xl shadow-2xl mb-12 transform hover:scale-[1.02] transition-all duration-500">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-4 rounded-2xl text-3xl">🎤</div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Journey to Band 7+ Starts Here</h2>
              <p className="text-white/90 text-lg">
                IELTS Speaking is one of the easiest sections if you prepare smartly.
                In this guide, you will find latest topics, cue cards, and Band 7+ answers.
              </p>
            </div>
          </div>
        </div>

        {/* TEST FORMAT CARDS */}
        <h2 className="slide-left stagger-3 text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span className="text-3xl">📋</span> IELTS Speaking Test Format
        </h2>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { part: "Part 1", title: "Introduction", time: "4-5 min", desc: "Basic questions about yourself", color: "from-blue-400 to-cyan-400", icon: "👋" },
            { part: "Part 2", title: "Cue Card", time: "3-4 min", desc: "1 min prep + 2 min speaking", color: "from-green-400 to-emerald-400", icon: "🎴" },
            { part: "Part 3", title: "Discussion", time: "4-5 min", desc: "Follow-up questions", color: "from-purple-400 to-pink-400", icon: "💬" }
          ].map((item, index) => (
            <div 
              key={index}
              className={`slide-up stagger-${index + 1} bg-gradient-to-br ${item.color} text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-xl">{item.part}</h3>
              <p className="font-semibold text-lg">{item.title}</p>
              <p className="text-sm opacity-90 mb-2">{item.time}</p>
              <p className="text-sm opacity-80">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CUE CARDS SECTION */}
        <h2 className="slide-left stagger-3 text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span className="text-3xl">🎴</span> Latest Cue Cards for 2026
        </h2>

        {/* CUE CARD 1 */}
        <div className="cue-card slide-left stagger-4 bg-white rounded-3xl shadow-xl p-8 mb-8 border-l-8 border-blue-400 transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-lg">
              🎴 Cue Card 1
            </span>
            <h3 className="text-2xl font-bold text-gray-800">Describe a Place You Like to Visit</h3>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6">
            <p className="font-semibold text-gray-700 mb-3">You should say:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-blue-500">📍</span> Where it is
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">❤️</span> Why you like it
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">🎯</span> What you do there
              </li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
            <p className="font-bold text-green-700 mb-2 flex items-center gap-2">
              <span>💬</span> Sample Answer (Band 7+):
            </p>
            <p className="text-gray-700 leading-relaxed">
              "One of my favorite places is a <span className="bg-yellow-100 px-1 font-medium">serene park</span> near my residence. 
              I <span className="bg-yellow-100 px-1 font-medium">frequently visit</span> it during evenings to 
              <span className="bg-yellow-100 px-1 font-medium">unwind and rejuvenate</span>. The lush greenery and 
              tranquil atmosphere <span className="bg-yellow-100 px-1 font-medium">effectively alleviate</span> my stress. 
              I often take a leisurely walk or sit on a bench while reading books. 
              This place holds <span className="bg-yellow-100 px-1 font-medium">immense sentimental value</span> for me."
            </p>
            <div className="mt-3 flex gap-2">
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">serene</span>
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">frequently visit</span>
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">unwind</span>
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">rejuvenate</span>
            </div>
          </div>
        </div>

        {/* CUE CARD 2 */}
        <div className="cue-card slide-right stagger-4 bg-white rounded-3xl shadow-xl p-8 mb-8 border-l-8 border-green-400 transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-gradient-to-br from-green-400 to-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-lg">
              🎴 Cue Card 2
            </span>
            <h3 className="text-2xl font-bold text-gray-800">Describe a Skill You Want to Learn</h3>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl mb-6">
            <p className="font-semibold text-gray-700 mb-3">You should say:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">🎯</span> What skill it is
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">❓</span> Why you want to learn it
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">⏰</span> How you plan to learn it
              </li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
            <p className="font-bold text-green-700 mb-2 flex items-center gap-2">
              <span>💬</span> Sample Answer (Band 7+):
            </p>
            <p className="text-gray-700 leading-relaxed">
              "I am <span className="bg-yellow-100 px-1 font-medium">keen to master</span> public speaking as it 
              <span className="bg-yellow-100 px-1 font-medium">plays a pivotal role</span> in 
              <span className="bg-yellow-100 px-1 font-medium">professional growth</span>. 
              This skill <span className="bg-yellow-100 px-1 font-medium">enhances confidence</span> and enables 
              <span className="bg-yellow-100 px-1 font-medium">effective communication</span>. 
              I plan to join a <span className="bg-yellow-100 px-1 font-medium">Toastmasters club</span> and 
              practice regularly. Additionally, I will watch TED talks to 
              <span className="bg-yellow-100 px-1 font-medium">emulate successful speakers</span>. 
              I believe mastering this skill will <span className="bg-yellow-100 px-1 font-medium">open numerous doors</span> 
              in my career."
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">keen to master</span>
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">pivotal role</span>
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">professional growth</span>
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">emulate</span>
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">open numerous doors</span>
            </div>
          </div>
        </div>

        {/* CUE CARD 3 */}
        <div className="cue-card slide-left stagger-3 bg-white rounded-3xl shadow-xl p-8 mb-8 border-l-8 border-purple-400 transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-gradient-to-br from-purple-400 to-pink-500 text-white px-4 py-2 rounded-xl font-bold text-lg">
              🎴 Cue Card 3
            </span>
            <h3 className="text-2xl font-bold text-gray-800">Describe a Memorable Vacation</h3>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl mb-6">
            <p className="font-semibold text-gray-700 mb-3">You should say:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-purple-500">📍</span> Where you went
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">👥</span> Who you went with
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">🌟</span> What made it memorable
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-200">
            <p className="font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span>💬</span> Sample Answer (Band 7+):
            </p>
            <p className="text-gray-700 leading-relaxed">
              "My most <span className="bg-yellow-100 px-1 font-medium">unforgettable getaway</span> was to 
              <span className="bg-yellow-100 px-1 font-medium">Manali</span> with my college friends. 
              We <span className="bg-yellow-100 px-1 font-medium">embarked on this journey</span> last summer and 
              <span className="bg-yellow-100 px-1 font-medium">it exceeded all expectations</span>. 
              The <span className="bg-yellow-100 px-1 font-medium">breathtaking landscapes</span> and 
              <span className="bg-yellow-100 px-1 font-medium">adrenaline-pumping activities</span> like river rafting 
              made it special. We also had a <span className="bg-yellow-100 px-1 font-medium">campfire night</span> 
              where we shared stories and <span className="bg-yellow-100 px-1 font-medium">forged lasting memories</span>. 
              This trip <span className="bg-yellow-100 px-1 font-medium">strengthened our bond</span> and gave us stories to 
              cherish forever."
            </p>
          </div>
        </div>

        {/* TIPS SECTION */}
        <h2 className="slide-left stagger-3 text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span className="text-3xl">💡</span> IELTS Speaking Band 7+ Tips
        </h2>

        <div className="slide-up stagger-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-8 rounded-3xl shadow-2xl mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "🗣️", tip: "Speak naturally and confidently" },
              { icon: "🔗", tip: "Use linking words (however, moreover, etc.)" },
              { icon: "🚫", tip: "Avoid memorized answers" },
              { icon: "📅", tip: "Practice daily speaking for 15 minutes" },
              { icon: "🎯", tip: "Record yourself and analyze" },
              { icon: "📚", tip: "Learn 5 new words daily" }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-white/10 p-4 rounded-xl">
                <span className="text-2xl">{item.icon}</span>
                <span>{item.tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PROGRESS TRACKER */}
        <div className="slide-up stagger-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white p-4 rounded-2xl mb-8 text-center">
          <p className="font-bold text-lg">📊 Your Speaking Progress: Beginner → Intermediate → Band 7+</p>
          <div className="w-full bg-white/30 h-2 rounded-full mt-2">
            <div className="w-2/3 bg-white h-2 rounded-full"></div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: "🎴", label: "Cue Cards", value: "50+", color: "from-blue-500 to-cyan-500" },
            { icon: "⭐", label: "Band 7+ Rate", value: "94%", color: "from-green-500 to-emerald-500" },
            { icon: "⏱️", label: "Practice Time", value: "15 min", color: "from-orange-500 to-red-500" },
            { icon: "🎯", label: "Topics", value: "100+", color: "from-purple-500 to-pink-500" }
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

        {/* FAQ SECTION */}
        <h2 className="slide-left stagger-3 text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span className="text-3xl">❓</span> Frequently Asked Questions
        </h2>

        <div className="slide-up stagger-4 space-y-4 mb-12">
          {[
            {
              q: "What topics are asked in IELTS Speaking?",
              a: "Common topics include hobbies, education, work, travel, technology, and daily life experiences. Part 2 cue cards often ask you to describe a person, place, event, or object."
            },
            {
              q: "How to score Band 7 in IELTS Speaking?",
              a: "Speak fluently without long pauses, use advanced vocabulary appropriately, avoid repetition, give structured answers with examples, and maintain good pronunciation."
            },
            {
              q: "Is IELTS Speaking difficult?",
              a: "No, it is a simple conversation test. With regular practice, confidence building, and proper guidance from experts, you can easily score high."
            },
            {
              q: "How long is the Speaking test?",
              a: "The test lasts 11-14 minutes. Part 1 (4-5 min), Part 2 (3-4 min), Part 3 (4-5 min)."
            }
          ].map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <span className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
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

        {/* CTA */}
        <div className="slide-up stagger-5 bg-gradient-to-br from-green-600 to-emerald-600 text-white p-10 rounded-3xl shadow-2xl text-center transform hover:scale-[1.02] transition-all duration-500">
          <div className="text-6xl mb-4 float">🎯</div>
          <h3 className="text-3xl font-bold mb-3">
            Want Band 7+ in IELTS Speaking?
          </h3>
          <p className="text-xl mb-8 text-white/90">
            Join ANU Education FREE 3-day demo classes with expert trainers
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://study.anuedu.in/register"
              className="bg-white text-green-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center gap-2 pulse"
            >
              🚀 Book Free Demo Class
              <span>→</span>
            </a>
            <a
              href="#"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              📞 Contact Counselor
            </a>
          </div>
          <p className="mt-6 text-sm text-white/80">
            Limited seats • 50+ students achieved Band 7+ last month
          </p>
        </div>

        {/* FOOTER */}
        <div className="slide-up stagger-5 mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Last Updated: March 2026 | ANU Education IELTS Coaching | Porbandar
          </p>
          <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
            <span>🎴 50+ Cue Cards</span>
            <span>⭐ 94% Success Rate</span>
            <span>🎯 Free Demo Classes</span>
            <span>📚 Expert Trainers</span>
          </div>
        </div>
      </main>
    </>
  );
}