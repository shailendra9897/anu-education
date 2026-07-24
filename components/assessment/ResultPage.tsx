"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  ArrowRight,
  Target,
  Globe,
  TrendingUp,
  Sparkles,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  DollarSign,
  FileCheck,
  Video,
} from "lucide-react";

// ── Import modular components ──────────────────────────────────────
import ScoreBreakdown, { CategoryScore } from "./ScoreBreakdown";
import CountryRecommendations, { CountryRecommendation } from "./CountryRecommendations";
import StrengthsAndImprovements from "./StrengthsAndImprovements";
import ActionPlan from "./ActionPlan";

// ── Import the shared type from the score engine ──────────────────
import type { AssessmentResult as ScoreResult } from "@/lib/assessment/scoreEngine";
import type { RecommendationReport } from "@/lib/assessment/recommendationEngine";

type FullAssessmentResult = ScoreResult & RecommendationReport;
// ── Types ──────────────────────────────────────────────────────────
interface ResultPageProps {
  result: FullAssessmentResult;
  onRestart?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────
const getTierColor = (tier: string) => {
  if (tier.includes("Excellent") || tier.includes("High")) return "text-green-600 bg-green-50 border-green-200";
  if (tier.includes("Good") || tier.includes("Moderate")) return "text-blue-600 bg-blue-50 border-blue-200";
  return "text-amber-600 bg-amber-50 border-amber-200";
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
};

// ── Component ──────────────────────────────────────────────────────
export default function ResultPage({ result, onRestart }: ResultPageProps) {
  // Safety: ensure result has all required fields with sensible defaults
  const {
  score = 0,
  tier = "Not Available",
  breakdown,
  countries = [],
  strengths = [],
  weaknesses = [],
  actionPlan = [],
} = result;
  const scoreColor = getScoreColor(score);

  // ── Circular meter animation ────────────────────────────────────
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // ── Animation variants ──────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // ── Safely filter arrays ──────────────────────────────────────
  const safeCountries = Array.isArray(countries)
  ? countries.filter(
      (c) =>
        c &&
        typeof c === "object" &&
        typeof c.name === "string" &&
        c.name.trim().length > 0
    )
  : [];
  // ── Extract text from actionPlan (handles strings and objects) ──
  const safeActionPlan: string[] = Array.isArray(actionPlan)
  ? actionPlan
      .filter(
        (item) =>
          item &&
          typeof item.text === "string" &&
          item.text.trim().length > 0
      )
      .sort((a, b) => a.order - b.order)
      .map((item) => item.text)
  : [];
  // ── Build data for ScoreBreakdown ──────────────────────────────
  const categoryScores: CategoryScore[] = [
    {
      id: "academic",
      title: "Academic Profile",
      icon: BookOpen,
      score: breakdown.academic || 0,
      max: 30,
      description: "Your academic performance is strong and meets the requirements for many international universities.",
    },
    {
      id: "english",
      title: "English Readiness",
      icon: FileText,
      score: breakdown.english || 0,
      max: 25,
      description: "Your English level is good, but improving your score can increase admission and scholarship opportunities.",
    },
    {
      id: "budget",
      title: "Financial Readiness",
      icon: DollarSign,
      score: breakdown.budget || 0,
      max: 15,
      description: "Your available budget is suitable for your preferred study destination.",
    },
    {
      id: "documents",
      title: "Document Readiness",
      icon: FileCheck,
      score: breakdown.documents || 0,
      max: 10,
      description: "Most essential documents are available. Completing the remaining documents will make your application stronger.",
    },
    {
      id: "timeline",
      title: "Application Timeline",
      icon: TrendingUp,
      score: breakdown.timeline || 0,
      max: 15,
      description: "Your planned timeline gives you enough time to prepare a competitive application.",
    },
    {
      id: "destination",
      title: "Destination Match",
      icon: Globe,
      score: breakdown.destination || 0,
      max: 5,
      description: "Your preferred country aligns well with your academic profile, budget, and English level.",
    },
  ];

  const countryRecommendations: CountryRecommendation[] = safeCountries.map(
  (rec, index) => {
    // rec.name may contain flag emoji, e.g. "Germany 🇩🇪"
    const countryName = rec.name
      .replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, "")
      .trim();

    const flagMap: Record<string, string> = {
      Canada: "🇨🇦",
      Australia: "🇦🇺",
      "United Kingdom": "🇬🇧",
      UK: "🇬🇧",
      USA: "🇺🇸",
      Germany: "🇩🇪",
      France: "🇫🇷",
      Ireland: "🇮🇪",
    };

    const slugMap: Record<string, string> = {
      Canada: "canada",
      Australia: "australia",
      "United Kingdom": "uk",
      UK: "uk",
      USA: "usa",
      Germany: "germany",
      France: "france",
      Ireland: "ireland",
    };

    const matchScore = rec.match ?? 0;

    return {
      id: `country-${index}`,
      country: countryName,
      flag: flagMap[countryName] || "🌍",
      rating:
        matchScore >= 90 ? 5 :
        matchScore >= 75 ? 4 :
        matchScore >= 60 ? 3 : 2,

      matchLabel:
        matchScore >= 85
          ? "Excellent Match"
          : matchScore >= 70
          ? "Great Match"
          : "Potential Match",

      matchScore,

      // Use REAL recommendation reasons from recommendationEngine
      why: rec.reasons ?? [],

      nextSteps: [
        rec.visaPath,
        rec.intakeNote,
      ].filter(Boolean),

      link: `/study-in/${
        slugMap[countryName] ||
        countryName.toLowerCase().replace(/\s+/g, "-")
      }`,
    };
  }
);

  // ── Overall summary ──────────────────────────────────────────────
  const overallSummary =
    "Your profile shows strong potential for studying abroad. Improving your English score and completing the remaining documents will further strengthen your application and increase your chances of admission to top universities.";

  // ── Render ──────────────────────────────────────────────────────
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-slate-50 py-12 px-4"
    >
      <div className="max-w-6xl mx-auto">

        {/* ── HERO CARD ── */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl text-white p-10 text-center shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.svg')] bg-repeat" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex justify-center mb-5"
          >
            <Trophy size={60} className="text-yellow-300" />
          </motion.div>

          <p className="text-blue-200 uppercase tracking-widest text-sm font-semibold">
            ANU Study Abroad Readiness Assessment™️
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Assessment Complete
          </h1>

          <p className="mt-4 text-lg text-blue-100">
            Your personalised study abroad report is ready.
          </p>

          {/* Circular Score Meter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-10 inline-flex items-center justify-center relative"
          >
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="12"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={scoreColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <text
                x="100"
                y="105"
                textAnchor="middle"
                fontSize="48"
                fontWeight="bold"
                fill="white"
                fontFamily="'Inter', sans-serif"
              >
                {score}
              </text>
              <text
                x="100"
                y="130"
                textAnchor="middle"
                fontSize="16"
                fill="rgba(255,255,255,0.7)"
              >
                / 100
              </text>
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className={`inline-block mt-5 px-6 py-2 rounded-full text-lg font-semibold border ${getTierColor(tier)}`}>
              {tier}
            </span>
          </motion.div>
        </motion.div>

        {/* ── QUICK SUMMARY CARDS ── */}
        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-3 gap-6 mt-10"
        >
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center gap-4">
            <Globe className="w-10 h-10 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Best Country</p>
              <p className="text-xl font-bold text-blue-700">{safeCountries[0]?.name || "Not sure yet"}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center gap-4">
            <Target className="w-10 h-10 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Overall Status</p>
              <p className="text-xl font-bold text-green-600">{tier}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center gap-4">
            <TrendingUp className="w-10 h-10 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Readiness Score</p>
              <p className="text-xl font-bold">{score}/100</p>
            </div>
          </div>
        </motion.div>

        {/* ── MODULAR COMPONENTS ── */}
        <ScoreBreakdown categories={categoryScores} overallSummary={overallSummary} />
        <CountryRecommendations recommendations={countryRecommendations} />

        {/* ── Strengths & Improvements with converted data ── */}
        <StrengthsAndImprovements
  strengths={strengths}
  improvements={weaknesses}
/>
        <ActionPlan steps={safeActionPlan} title="Your Action Plan" />

        {/* ── FREE BONUSES ── */}
        <motion.div
          variants={itemVariants}
          className="mt-12 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-8 shadow-sm"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-amber-800">
            <Sparkles className="w-6 h-6" />
            🎁 Your Free Bonuses
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white/70 rounded-xl p-4 shadow-sm">
              <FileCheck className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-semibold text-sm">Study Abroad Checklist</p>
                <p className="text-xs text-gray-500">PDF download</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/70 rounded-xl p-4 shadow-sm">
              <Video className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-semibold text-sm">IELTS / PTE Strategy</p>
                <p className="text-xs text-gray-500">30‑min video</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/70 rounded-xl p-4 shadow-sm">
              <Users className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-semibold text-sm">Free Demo Class</p>
                <p className="text-xs text-gray-500">Live session</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── RECOMMENDED SERVICES ── */}
        <motion.div
          variants={itemVariants}
          className="mt-12 bg-white rounded-2xl p-8 shadow-md border border-gray-100"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Recommended Services
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-sm">Test Prep</p>
              <p className="text-xs text-gray-500">IELTS / PTE / Duolingo</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-sm">SOP & Visa</p>
              <p className="text-xs text-gray-500">Documentation help</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold text-sm">University Selection</p>
              <p className="text-xs text-gray-500">Personalised guidance</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <DollarSign className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="font-semibold text-sm">Scholarship Help</p>
              <p className="text-xs text-gray-500">Funding assistance</p>
            </div>
          </div>
        </motion.div>

        {/* ── FINAL CTA ── */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-xl mt-10 p-10 text-center border border-gray-100"
        >
          <h2 className="text-3xl font-bold">Ready to Study Abroad?</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Book a FREE counselling session with ANU Education and receive
            personalised university guidance based on your assessment.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
            <button className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition">
              Book Free Counselling <ArrowRight size={20} />
            </button>
            <button className="border border-blue-700 text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold transition">
              WhatsApp Us
            </button>
          </div>

          {onRestart && (
            <button
              onClick={onRestart}
              className="mt-8 text-blue-700 font-semibold hover:underline"
            >
              Start Assessment Again
            </button>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}