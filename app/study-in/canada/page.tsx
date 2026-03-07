// app/study-in/canada/page.tsx

export default function CanadaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4 sm:py-28">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-5xl mx-auto text-center px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
            Study in Canada 2026
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-95">
            World-class education, multicultural environment, and PGWP up to 3 years for Indian students.
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center gap-3 bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
          >
            Book Free Counseling Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-200/30 rounded-full blur-3xl animate-bounce slow" />
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-12 sm:space-y-16">
        
        {/* Why Study Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Why Study in Canada?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🎓", title: "Top-Ranked Universities", desc: "Globally recognized education quality" },
              { icon: "💰", title: "Affordable Tuition", desc: "CAD 15K-38K/year vs USA/UK (₹10-25L)" },
              { icon: "💼", title: "PGWP Up to 3 Years", desc: "Work after study, PR pathway" },
              { icon: "🌍", title: "Safe & Diverse", desc: "Welcoming multicultural society" }
            ].map((item, idx) => (
              <div key={idx} className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:bg-white">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Programs */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Popular Programs for Indians</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {["Business & Management", "Computer Science & IT", "Engineering", "Health Sciences"].map((prog, idx) => (
              <div key={idx} className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-8 rounded-2xl text-center hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:from-indigo-600">
                <h3 className="text-xl font-bold mb-2">{prog}</h3>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Intakes & Eligibility */}
        <section className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Key Intakes 2026</h2>
            <div className="space-y-4">
              {[
                { intake: "September (Fall)", desc: "Main intake, most programs" },
                { intake: "January (Winter)", desc: "Second major intake" },
                { intake: "May (Summer)", desc: "Limited programs available" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="font-bold text-blue-600 text-lg">{idx + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900">{item.intake}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">2026 Eligibility</h2>
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-yellow-400">
                <h3 className="font-semibold text-lg mb-2">IELTS/PTE: 6.0+ overall</h3>
                <p className="text-sm text-gray-700">No band less than 5.5, TOEFL/PTE accepted</p>
              </div>
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-400">
                <h3 className="font-semibold text-lg mb-2">Academics: 60%+ in 12th/Bachelor's</h3>
                <p className="text-sm text-gray-700">Varies by program & institution</p>
              </div>
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-400">
                <h3 className="font-semibold text-lg mb-2">Visa: PAL Required + CAD 22,895 GIC</h3>
                <p className="text-sm text-gray-700">Study permit cap ~155K in 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* ANU Help Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-12 sm:p-16 lg:p-20 rounded-3xl text-center backdrop-blur-sm bg-opacity-95">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">How ANU Education Helps You</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto leading-relaxed opacity-90">
            Expert counselors guide you through university selection, SOP writing, PAL/GIC setup, and visa success (95%+ approval rate).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/contact" 
              className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-2xl w-full sm:w-auto text-center"
            >
              Start Your Journey Today
            </a>
            <a 
              href="/contact" 
              className="border-2 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-700 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              WhatsApp Now
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}