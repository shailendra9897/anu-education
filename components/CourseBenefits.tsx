export default function CourseBenefits() {
  const benefits = [
    {
      title: "15 Full-Length Mock Tests",
      desc: "Real IELTS exam simulations with AI scoring & detailed analysis",
      icon: "📊",
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Live Online Classes",
      desc: "Interactive sessions with 10+ yr certified trainers",
      icon: "🎥",
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Flexible Batch Timing",
      desc: "Morning, evening & weekend batches for working professionals",
      icon: "⏰",
      color: "from-orange-500 to-amber-600"
    },
    {
      title: "Doubt Solving Support",
      desc: "24/7 WhatsApp group + 1:1 trainer mentoring",
      icon: "💬",
      color: "from-purple-500 to-violet-600"
    },
    {
      title: "100+ Practice Exercises",
      desc: "Grammar, vocab, listening & speaking task mastery",
      icon: "📚",
      color: "from-pink-500 to-rose-600"
    },
    {
      title: "180 Days Portal Access",
      desc: "Unlimited recordings, materials & progress tracking",
      icon: "🔓",
      color: "from-green-500 to-emerald-600"
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-slate-700 bg-clip-text text-transparent mb-6">
            Everything You Need For Band 8+
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our comprehensive program delivers proven results with expert guidance and unlimited practice
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 text-center hover:-translate-y-3 hover:shadow-2xl hover:bg-white transition-all duration-500 border border-white/50 hover:border-emerald-200 overflow-hidden h-full"
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${benefit.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Icon Ring */}
              <div className="relative z-10 mb-6">
                <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-r ${benefit.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 mb-4`}>
                  <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{benefit.icon}</span>
                </div>
                <div className="w-24 h-24 border-2 border-white/30 rounded-full absolute inset-[-6px] group-hover:bg-emerald-500/10 group-hover:border-emerald-400/50 transition-all duration-500" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors duration-300 leading-tight">
                {benefit.title}
              </h3>
              
              <p className="text-gray-600 text-base leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                {benefit.desc}
              </p>

              {/* Hover glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl animate-pulse" />
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-2">15</div>
            <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Full Mock Tests</div>
          </div>
          <div className="p-6">
            <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-2">100+</div>
            <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Practice Sets</div>
          </div>
          <div className="p-6">
            <div className="text-3xl sm:text-4xl font-black text-purple-600 mb-2">180</div>
            <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Days Access</div>
          </div>
          <div className="p-6">
            <div className="text-3xl sm:text-4xl font-black text-orange-600 mb-2">95%</div>
            <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  )
}