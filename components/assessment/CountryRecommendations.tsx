"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Check, MapPin } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
export interface CountryRecommendation {
  id: string;
  country: string;
  flag: string;
  rating: number; // 1–5
  matchLabel: string; // "Excellent Match", "Great Match", etc.
  matchScore: number; // 0–100
  why: string[];
  nextSteps: string[];
  link: string;
}

interface CountryRecommendationsProps {
  recommendations: CountryRecommendation[];
}

// ── Helpers ────────────────────────────────────────────────────────
const getMatchColor = (score: number): string => {
  if (score >= 85) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
  return "text-yellow-600 bg-yellow-50 border-yellow-200";
};

const getMatchLabelColor = (label: string): string => {
  if (label.includes("Excellent")) return "text-green-700";
  if (label.includes("Great")) return "text-blue-700";
  return "text-yellow-700";
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={16}
        className={i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ))}
  </div>
);

// ── Main Component ──────────────────────────────────────────────────
export default function CountryRecommendations({
  recommendations,
}: CountryRecommendationsProps) {
  return (
    <section className="py-12 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* ── Section Heading ── */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">🌍 Your Best Country Matches</h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Based on your academic profile, English level, budget and goals, these destinations are the strongest fit for you.
          </p>
        </div>

        {/* ── Cards (Desktop: grid, Mobile: horizontal scroll) ── */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-4 md:overflow-visible snap-x snap-mandatory">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="min-w-[280px] md:min-w-0 flex-1 snap-start bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
            >
              {/* ── Header: Flag + Country + Match Score ── */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{rec.flag}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{rec.country}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={rec.rating} />
                      <span className={`text-xs font-semibold ${getMatchLabelColor(rec.matchLabel)}`}>
                        {rec.matchLabel}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-blue-600">{rec.matchScore}%</span>
                  <span className="text-xs text-gray-400">Match</span>
                </div>
              </div>

              {/* ── Why this country ── */}
              <div className="mt-3 mb-4">
                <p className="text-sm font-semibold text-gray-700">Why {rec.country}?</p>
                <ul className="mt-1 space-y-1">
                  {rec.why.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Next Steps ── */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recommended Next Steps</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {rec.nextSteps.map((step, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100"
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Footer Badges ── */}
              <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                <span className="text-[10px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Budget</span>
                <span className="text-[10px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Academics</span>
                <span className="text-[10px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">English</span>
                <span className="text-[10px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Timeline</span>
              </div>

              {/* ── CTA Button ── */}
              <Link
                href={rec.link}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                Explore {rec.country} <span className="text-lg">→</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}