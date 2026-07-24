"use client";

import {
  GraduationCap,
  MessageSquare,
  DollarSign,
  FileText,
  Calendar,
  Globe,
  Star,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
export interface CategoryScore {
  id: string;
  title: string;
  icon: React.ElementType;
  score: number;       // points earned
  max: number;         // maximum possible points
  description: string;
}

interface ScoreBreakdownProps {
  categories: CategoryScore[];
  overallSummary: string;
}

// ── Helpers ────────────────────────────────────────────────────────
const getPercentage = (score: number, max: number): number =>
  max > 0 ? Math.round((score / max) * 100) : 0;

const getStatus = (pct: number): { label: string; color: string; stars: number } => {
  if (pct >= 85) return { label: "Excellent", color: "text-green-600 bg-green-100 border-green-200", stars: 5 };
  if (pct >= 70) return { label: "Strong", color: "text-green-600 bg-green-100 border-green-200", stars: 4 };
  if (pct >= 55) return { label: "Good", color: "text-yellow-600 bg-yellow-100 border-yellow-200", stars: 3 };
  if (pct >= 40) return { label: "Fair", color: "text-orange-600 bg-orange-100 border-orange-200", stars: 2 };
  return { label: "Needs Improvement", color: "text-red-600 bg-red-100 border-red-200", stars: 1 };
};

const getProgressColor = (pct: number): string => {
  if (pct >= 70) return "bg-green-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-orange-500";
};

const StarRating = ({ stars }: { stars: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          className={i <= stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────
export default function ScoreBreakdown({
  categories,
  overallSummary,
}: ScoreBreakdownProps) {
  return (
    <section className="py-12 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">

        {/* ── Section Heading ── */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">📊 Your Readiness Breakdown</h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            See how your profile performed across the six key areas used to evaluate your study abroad readiness.
          </p>
        </div>

        {/* ── Cards Grid ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const pct = getPercentage(cat.score, cat.max);
            const status = getStatus(pct);
            const Icon = cat.icon;
            const progressColor = getProgressColor(pct);

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200"
              >
                {/* Header: Icon + Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">{cat.title}</h3>
                </div>

                {/* Score */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-gray-900">{cat.score}</span>
                  <span className="text-sm font-medium text-gray-400">/ {cat.max}</span>
                </div>

                {/* Stars + Status */}
                <div className="flex items-center gap-3 mb-3">
                  <StarRating stars={status.stars} />
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full ${progressColor} transition-all duration-700 ease-out`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">{cat.description}</p>
              </div>
            );
          })}
        </div>

        {/* ── Overall Summary ── */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <h4 className="text-lg font-semibold text-blue-800 mb-2">📌 Overall Profile Summary</h4>
          <p className="text-gray-700 max-w-3xl mx-auto">{overallSummary}</p>
        </div>
      </div>
    </section>
  );
}