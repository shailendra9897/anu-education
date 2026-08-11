"use client";

// ── Imports ──────────────────────────────────────────────────────────
import { useState, useEffect } from "react";

// ── Components (now imported from the shared components folder) ──
import Hero from "@/components/assessment/Hero";
import ProgressBar from "@/components/assessment/ProgressBar";
import QuestionCard, { QUESTIONS } from "@/components/assessment/QuestionCard";
import LoadingScreen from "@/components/assessment/LoadingScreen";
import ResultPage from "@/components/assessment/ResultPage";
import LeadCaptureModal from "@/components/assessment/LeadCaptureModal";

import {
  buildFullResult,
  type AssessmentResult as ScoreResult,
} from "@/lib/assessment/scoreEngine";

import {
  buildRecommendation,
  type RecommendationReport,
} from "@/lib/assessment/recommendationEngine";
// ── Types ──────────────────────────────────────────────────────────
type Answers = Record<number, string | string[]>;

type FullAssessmentResult = ScoreResult & RecommendationReport;
// ── Main Component ──────────────────────────────────────────────────
export default function AssessmentClient() {
  // ── State ──────────────────────────────────────────────────────────
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FullAssessmentResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const totalQuestions = QUESTIONS.length;
  const currentQuestion = QUESTIONS[currentIndex];
  const isLast = currentIndex === totalQuestions - 1;

  // ── Progress Calculation ──────────────────────────────────────────
  const answeredCount = Object.keys(answers).filter(
    (id) => answers[Number(id)] && answers[Number(id)].length > 0
  ).length;

  // ── Handlers ──────────────────────────────────────────────────────
  const handleStart = () => setStarted(true);

  const handleAnswer = (id: number, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (isLast) {
      computeResult();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setShowResult(false);
    setShowLeadCapture(false);
    setLeadCaptured(false);
  };

  // ── Compute Result ──────────────────────────────────────────────
  const computeResult = () => {
  setLoading(true);

  setTimeout(() => {
    const scoreResult = buildFullResult(answers);

    const recommendations = buildRecommendation(
      answers,
      scoreResult.breakdown
    );

    const fullResult: FullAssessmentResult = {
      ...scoreResult,
      ...recommendations,
    };

    console.log("FINAL ASSESSMENT RESULT:", fullResult);

    setResult(fullResult);
    setLoading(false);
    setShowResult(true);
  }, 1800);
};

  // ── Lead Capture Trigger ──────────────────────────────────────────
  useEffect(() => {
  if (showResult && result && !showLeadCapture && !leadCaptured) {
    const timer = setTimeout(() => {
      setShowLeadCapture(true);
    }, 3000);

    return () => clearTimeout(timer);
  }
}, [showResult, result, showLeadCapture, leadCaptured]);
  // ── Render ──────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;

  if (!started) {
    return <Hero onStart={handleStart} />;
  }

  if (showResult && result) {
    return (
      <>
        <ResultPage result={result} onRestart={handleRestart} />
        {showLeadCapture && (
          <LeadCaptureModal
  onClose={() => {
    setShowLeadCapture(false);
    setLeadCaptured(true);
  }}
  score={result.score}
  countries={result.countries.map((country) => country.name)}
  result={result}
/>
        )}
      </>
    );
  }

  // ── Main Question Flow ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0F1B4C] text-white">
      {/* Sticky Header with Progress Bar */}
      <div className="sticky top-0 z-20 bg-[#0F1B4C]/80 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="text-center text-xs font-semibold tracking-widest uppercase text-white/30 mb-1">
            ANU Study Abroad Readiness Assessment™️
          </div>
          <ProgressBar
            current={currentIndex + 1}
            total={totalQuestions}
            answeredCount={answeredCount}
          />
        </div>
      </div>

      <QuestionCard
        question={currentQuestion}
        answers={answers}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onBack={handleBack}
        current={currentIndex + 1}
        total={totalQuestions}
        isLast={isLast}
      />
    </div>
  );
}