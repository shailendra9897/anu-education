"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import {
  websiteWhatsAppMessages,
  getWhatsAppLink,
} from "@/lib/whatsappTemplates";

export default function IELTSBandCalculatorClient() {
  const [type, setType] = useState<"academic" | "general">("academic");

  const [scores, setScores] = useState({
    listening: "",
    reading: "",
    writing: "",
    speaking: "",
  });

  const calculateOverallBand = () => {
    const values = Object.values(scores).map((v) => parseFloat(v) || 0);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const decimal = average % 1;
    let rounded = average;
    if (decimal < 0.25) {
      rounded = Math.floor(average);
    } else if (decimal < 0.75) {
      rounded = Math.floor(average) + 0.5;
    } else {
      rounded = Math.ceil(average);
    }
    return rounded.toFixed(1);
  };

  const overallBand = calculateOverallBand();

  const getBandMessage = () => {
    const band = parseFloat(overallBand);
    if (band >= 7) {
      return {
        title: "🌍 Excellent Score for Germany & Canada",
        text: "Your IELTS score is strong for Germany, Canada, and top universities.",
      };
    }
    if (band >= 6) {
      return {
        title: "🇬🇧 Good Score for UK Universities",
        text: "You may qualify for many UK universities and study abroad programs.",
      };
    }
    return {
      title: "📚 Improve Your IELTS Score",
      text: "Join our expert IELTS coaching to improve your band score quickly.",
    };
  };

  const message = getBandMessage();

  // Conversion table (Academic Listening & Reading)
  const listeningReadingTable = [
    { correct: "39-40", band: "9.0" },
    { correct: "37-38", band: "8.5" },
    { correct: "35-36", band: "8.0" },
    { correct: "33-34", band: "7.5" },
    { correct: "30-32", band: "7.0" },
    { correct: "27-29", band: "6.5" },
    { correct: "23-26", band: "6.0" },
    { correct: "19-22", band: "5.5" },
    { correct: "15-18", band: "5.0" },
  ];

  return (
    <>
      {/* ================= SCHEMAS ================= */}
      <Script
        id="calculator-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "IELTS Band Score Calculator",
            url: "https://www.anuedu.in/tools/ielts-band-calculator",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Any",
            description:
              "Free IELTS Academic and General Band Score Calculator with instant overall band estimation and study abroad guidance.",
          }),
        }}
      />

      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How is IELTS overall band calculated?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The IELTS overall band score is calculated by averaging Listening, Reading, Writing, and Speaking scores and rounding to the nearest 0.5 or whole band.",
                },
              },
              {
                "@type": "Question",
                name: "Is Band 6 enough for UK study?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, many UK universities accept IELTS Band 6 or 6.5 depending on the course and university.",
                },
              },
              {
                "@type": "Question",
                name: "What IELTS score is required for Canada?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most Canadian colleges and universities prefer IELTS scores between 6 and 7 bands.",
                },
              },
            ],
          }),
        }}
      />

      {/* ================= MAIN ================= */}
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              IELTS Band Score Calculator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Calculate your IELTS Academic or General overall band score instantly.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border">
            {/* Test Type Toggle */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setType("academic")}
                className={`px-6 py-3 rounded-xl font-bold transition ${
                  type === "academic"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Academic
              </button>
              <button
                onClick={() => setType("general")}
                className={`px-6 py-3 rounded-xl font-bold transition ${
                  type === "general"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                General
              </button>
            </div>

            {/* Input Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              {["listening", "reading", "writing", "speaking"].map((field) => (
                <div key={field}>
                  <label className="block mb-2 font-semibold capitalize text-gray-700">
                    {field}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={scores[field as keyof typeof scores]}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        [field]: e.target.value,
                      })
                    }
                    placeholder="Enter band score"
                    className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Result */}
            <div className="mt-10 text-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8">
                <p className="text-lg mb-2">Your Estimated Overall Band</p>
                <h2 className="text-6xl font-extrabold mb-4">{overallBand}</h2>
                <h3 className="text-2xl font-bold mb-2">{message.title}</h3>
                <p className="text-white/90 max-w-xl mx-auto">{message.text}</p>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/free-demo"
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  🎓 Book Free Demo Class
                </Link>
                <a
                  href={getWhatsAppLink(websiteWhatsAppMessages.ieltsAcademic)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg"
                >
                  💬 Get IELTS Guidance
                </a>
              </div>
            </div>
          </div>

          {/* ================= CONVERSION TABLE ================= */}
          <div className="mt-12 bg-white rounded-2xl p-6 shadow">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              IELTS Academic Listening & Reading Score Conversion (Correct Answers → Band)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Correct Answers (out of 40)</th>
                    <th className="border p-3 text-left">Band Score</th>
                  </tr>
                </thead>
                <tbody>
                  {listeningReadingTable.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="border p-3 font-mono">{row.correct}</td>
                      <td className="border p-3 font-bold text-blue-600">{row.band}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              *Conversion for Academic Listening & Reading. General Training Reading uses a different scale.
            </p>
          </div>

          {/* ================= INTERNAL LINKS ================= */}
          <div className="mt-12 text-center space-y-3">
            <h3 className="text-xl font-semibold text-gray-700">Related Resources</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/test-prep/ielts-online"
                className="text-blue-600 hover:underline font-medium"
              >
                IELTS Online Coaching
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/test-prep/ielts/ielts-coaching-ahmedabad"
                className="text-blue-600 hover:underline font-medium"
              >
                IELTS Coaching Ahmedabad
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/free-demo"
                className="text-green-600 hover:underline font-medium"
              >
                Free Demo Class
              </Link>
            </div>
          </div>

          {/* FAQ Section (as plain text, already in schema) */}
          <div className="mt-16 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="text-2xl font-bold mb-3">
                How is IELTS Overall Band Calculated?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                IELTS overall band score is calculated by averaging the scores of Listening, Reading, Writing, and Speaking sections. The final score is rounded to the nearest 0.5 or whole band.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="text-2xl font-bold mb-3">
                IELTS Score for UK, Germany & Canada
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Most UK universities accept IELTS 6.0–6.5 bands. Canada and Germany often prefer scores between 6.5 and 7 depending on the course and university requirements.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}