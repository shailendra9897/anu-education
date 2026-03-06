'use client'

import { useState } from "react"

export default function BandCalculator() {
  const [current, setCurrent] = useState<number>(5)
  const [result, setResult] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const improvements: Record<number, number> = {
    4: 4.5,
    4.5: 5.5,
    5: 6.5,
    5.5: 7,
    6: 7.5,
    6.5: 8,
    7: 8.5,
    // Cap at 9 for higher
  }

  function calculate() {
    setIsCalculating(true)
    setTimeout(() => {
      const improved = Math.min(improvements[current as keyof typeof improvements] || 9, 9)
      setResult(improved)
      setIsCalculating(false)
    }, 800)
  }

  const bands = [4, 4.5, 5, 5.5, 6, 6.5, 7]

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
            Band Score Booster
          </h2>
          <p className="text-xl text-gray-700 max-w-md mx-auto leading-relaxed">
            Discover your potential IELTS band after our proven training program. Average student gains +1.5 bands!
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 rounded-3xl p-8 sm:p-12 transition-all duration-500 hover:shadow-3xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3 tracking-wide">
                Your Current Overall Band Score
              </label>
              <select
                className="w-full p-4 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm text-lg font-semibold text-gray-900 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-300 hover:border-green-300 shadow-lg"
                value={current}
                onChange={(e) => setCurrent(Number(e.target.value))}
              >
                {bands.map((band) => (
                  <option key={band} value={band}>
                    Band {band}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={calculate}
              disabled={isCalculating}
              className="group w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 px-6 rounded-2xl text-lg font-bold shadow-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-200 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isCalculating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating your boost...
                  </>
                ) : (
                  <>
                    🚀 Check Expected Band
                  </>
                )}
              </span>
              {!isCalculating && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              )}
            </button>

            {result && (
              <div className="text-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100 shadow-lg animate-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-md mb-4">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-gray-800">Training Boost Achieved!</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">Estimated Band After Training</p>
                <p className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 tracking-tight">
                  {result}
                </p>
                <p className="text-sm text-gray-600 bg-white/60 px-4 py-2 rounded-full inline-block font-medium">
                  Based on 1,500+ student results at Anu Education
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="text-center p-3 bg-white/50 rounded-xl">
                    <div className="font-bold text-2xl text-green-600">{(result - current).toFixed(1)}</div>
                    <div>Average Gain</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-xl">
                    <div className="font-bold text-2xl text-emerald-600">95%</div>
                    <div>Success Rate</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-center text-gray-500 mt-8 pt-8 border-t border-gray-100">
            *Results based on students completing full program. Individual results may vary.
          </p>
        </div>
      </div>
    </section>
  )
}