'use client'

import { useState } from 'react'

export default function FinalCTA() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 py-16 sm:py-20 px-4">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-multiply animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/30 rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-white/20 rounded-full animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-8">
          <svg className="w-5 h-5 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-semibold">Limited Seats Available</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent mb-6 leading-tight">
          Start Your IELTS / PTE Journey Today
        </h2>
        
        <div className="max-w-2xl mx-auto mb-10 px-4">
          <p className="text-xl sm:text-2xl text-white/90 font-medium mb-6 leading-relaxed">
            Join our <span className="bg-white/20 px-3 py-1 rounded-full">FREE 3-Day Live Demo</span> 
            and unlock strategies that boosted <span className="font-bold text-white">1000+ students</span> to their dream bands!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm sm:text-base">
            <div className="flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <svg className="w-6 h-6 text-yellow-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <svg className="w-6 h-6 text-emerald-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976c.419-.491.272-1.102.723-1.745a3.066 3.066 0 012.812-2.812zM10 11a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
              <span>1000+ Students</span>
            </div>
            <div className="flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <svg className="w-6 h-6 text-blue-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>

        {/* Mobile-first stacked buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 max-w-md mx-auto">
          <a
            href="/free-demo"
            className="group relative bg-white text-green-700 px-8 sm:px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center">
              🚀 Start Free Demo
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-green-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </a>

          <a
            href="https://wa.me/919428186817"
            className="group border-2 border-white/50 hover:border-white bg-white/10 backdrop-blur-sm text-white px-8 sm:px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-white/25 transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            💬 Chat on WhatsApp
            <svg className={`w-5 h-5 transition-transform ${isHovered ? 'group-hover:scale-110' : ''}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </a>
        </div>

        <p className="text-sm sm:text-base text-white/80 font-medium bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl inline-block border border-white/20">
          ✅ No credit card required • 🎯 Seats filling fast this week
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}