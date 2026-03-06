'use client'

import { useState, useEffect } from "react";
import UrgencyCounter from "@/components/UrgencyCounter";
import CourseBenefits from "@/components/CourseBenefits";
import BandCalculator from "@/components/BandCalculator";
import FinalCTA from "@/components/FinalCTA";

export default function FreeDemoPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("IELTS");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(7200);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progress = (step / 3) * 100;

  async function submitForm() {
    setLoading(true);
    try {
      await fetch("/api/demo-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, course }),
      });
      setSuccess(true);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  const steps = [
    { number: 1, title: "Your Name", icon: "👤" },
    { number: 2, title: "WhatsApp Number", icon: "📱" },
    { number: 3, title: "Select Course", icon: "📚" }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-gray-900 antialiased">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-green-200 mb-8">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping" />
            <span className="font-semibold text-emerald-800">🔥 Limited seats - {Math.floor(seconds / 3600)}h:{Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')}:{(seconds % 60).toString().padStart(2, '0')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent mb-6 leading-tight">
            Free 3-Day Live Demo
          </h1>
          
          <div className="max-w-2xl mx-auto mb-12">
            <p className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-4">
              IELTS / PTE Band 8+ Strategies
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              Join 1000+ students who unlocked their dream scores with our proven methods
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-12">
            <a
              href="#form"
              className="group bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/50 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
            >
              🚀 Reserve Free Seat
            </a>
            <a
              href="https://wa.me/919428186817"
              className="border-2 border-emerald-600 text-emerald-700 hover:text-white hover:bg-emerald-600 px-8 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-emerald-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
            >
              💬 Quick Chat
            </a>
          </div>
        </div>
      </section>

      {/* URGENCY COUNTER */}
      <UrgencyCounter />

      {/* STEP FORM */}
      <section id="form" className="py-20 px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 rounded-3xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Reserve Your Seat (2 min)
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 font-semibold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No card required • 100% Secure
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                {steps.map((s) => (
                  <div key={s.number} className="flex flex-col items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s.number ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>
                      {s.number}
                    </span>
                    <span className="mt-1 min-w-[60px]">{s.title}</span>
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-2xl overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-2xl shadow-lg transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* SUCCESS STATE */}
            {success ? (
              <div className="text-center animate-in slide-in-from-top-8 fade-in duration-700">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-emerald-700 mb-4">🎉 Seat Confirmed!</h3>
                <p className="text-lg text-gray-700 mb-8">Demo details sent to WhatsApp</p>
                <a
                  href="https://wa.me/919428186817"
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/50 transform hover:-translate-y-1 transition-all duration-300"
                >
                  💬 Open WhatsApp Chat
                </a>
              </div>
            ) : (
              /* FORM STEPS */
              <>
                {step === 1 && (
                  <div className="animate-in slide-in-from-left-8 fade-in duration-500">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-2xl">{steps[0].icon}</span>
                      Full Name
                    </label>
                    <input
                      className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 text-lg placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => setStep(2)}
                      disabled={!name.trim()}
                      className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-emerald-500/50 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Continue to Step 2 →
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-2xl">📱</span>
                      WhatsApp Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-lg text-gray-500">🇮🇳 +91</span>
                      </div>
                      <input
                        className="w-full pl-24 pr-4 py-5 border-2 border-gray-200 rounded-2xl text-lg placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                        placeholder="XXXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/D/g, '').slice(0,10))}
                        maxLength={10}
                      />
                    </div>
                    <button
                      onClick={() => setStep(3)}
                      disabled={phone.length !== 10}
                      className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-emerald-500/50 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Continue to Course →
                    </button>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-in slide-in-from-left-8 fade-in duration-500">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-2xl">{steps[2].icon}</span>
                      Choose Your Course
                    </label>
                    <select
                      className="w-full border-2 border-gray-200 rounded-2xl p-5 text-lg bg-white shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all duration-300 hover:shadow-md appearance-none bg-no-repeat bg-right"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                    >
                      <option value="IELTS">🎯 IELTS (Academic/General)</option>
                      <option value="PTE">⚡ PTE (Fast Results)</option>
                      <option value="Study Abroad">🌍 Complete Study Abroad</option>
                    </select>
                    <button
                      onClick={submitForm}
                      disabled={loading || !name || !phone}
                      className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-5 px-8 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-emerald-500/50 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Securing Your Seat...
                        </>
                      ) : (
                        "✅ Start Free Demo Now"
                      )}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-4 px-2">
                      🔒 100% Secure • No credit card required
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* COMPONENTS */}
      <CourseBenefits />
      <BandCalculator />
      <FinalCTA />
    </main>
  );
}