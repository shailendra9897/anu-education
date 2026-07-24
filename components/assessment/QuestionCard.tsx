"use client";

// FILE: app/assessment/study-abroad-readiness/components/QuestionCard.tsx
//
// Handles 3 question types:
//   "single"  — one answer, auto-advances after 280ms
//   "multi"   — multiple answers, requires explicit "Continue" button
//
// Also exports:
//   QUESTIONS      — all 12 question objects
//   SCORE_WEIGHTS  — scoring map for ResultCard

import { useState, useEffect } from "react";

// ── QUESTION DEFINITIONS ──────────────────────────────────────────
export type QuestionType = "single" | "multi";

export interface Question {
  id: number;
  type: QuestionType;
  emoji: string;
  text: string;
  subtext?: string;
  options: string[];
  multiMin?: number;
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    type: "single",
    emoji: "🌍",
    text: "Why do you want to study abroad?",
    options: [
      "Higher Education / University Degree",
      "PR Pathway (Permanent Residency)",
      "Better Job Opportunities",
      "Research / PhD",
      "Not Sure Yet",
    ],
  },
  {
    id: 2,
    type: "single",
    emoji: "🎓",
    text: "What level of study are you planning for?",
    options: [
      "Diploma / Certificate",
      "Bachelor's Degree",
      "Master's Degree",
      "MBA",
      "PhD / Research",
    ],
  },
  {
    id: 3,
    type: "single",
    emoji: "📋",
    text: "What is your current highest qualification?",
    options: [
      "Completed 10th / SSC",
      "Completed 12th / HSC",
      "Bachelor's Degree",
      "Master's Degree",
      "Other",
    ],
  },
  {
    id: 4,
    type: "single",
    emoji: "📊",
    text: "What is your academic score?",
    subtext: "This affects university eligibility thresholds.",
    options: [
      "Below 50%",
      "50% – 59%",
      "60% – 69%",
      "70% – 79%",
      "80% and above",
    ],
  },
  {
    id: 5,
    type: "single",
    emoji: "⚠️",
    text: "Do you have any academic backlogs or arrears?",
    subtext: "Be honest — this affects your university shortlist, not your score.",
    options: [
      "No backlogs",
      "Yes, 1–2 backlogs",
      "Yes, 3–5 backlogs",
      "More than 5 backlogs",
    ],
  },
  {
    id: 6,
    type: "single",
    emoji: "🗣️",
    text: "What is your current English proficiency?",
    subtext: "Select the closest match. Haven't tested yet? Choose the first option.",
    options: [
      "Not taken any English test yet",
      "Taken a test — below IELTS 5.5 equivalent",
      "IELTS 5.5 / PTE 42 / Equivalent",
      "IELTS 6.0 / PTE 50 / Equivalent",
      "IELTS 6.5 / PTE 58 / Equivalent",
      "IELTS 7.0+ / PTE 65+ / Equivalent",
    ],
  },
  {
    id: 7,
    type: "single",
    emoji: "🌐",
    text: "Which country are you most interested in?",
    options: [
      "Canada 🇨🇦",
      "Australia 🇦🇺",
      "United Kingdom 🇬🇧",
      "USA 🇺🇸",
      "Germany 🇩🇪",
      "Other Europe 🇪🇺",
      "Not Decided Yet",
    ],
  },
  {
    id: 8,
    type: "single",
    emoji: "💰",
    text: "What is your total study budget?",
    subtext: "Include tuition + living costs for the full course duration.",
    options: [
      "Below ₹10 lakhs",
      "₹10 – 15 lakhs",
      "₹15 – 25 lakhs",
      "₹25 – 40 lakhs",
      "₹40 lakhs+",
    ],
  },
  {
    id: 9,
    type: "single",
    emoji: "📅",
    text: "When do you want to start your application?",
    options: [
      "As soon as possible (within 1 month)",
      "Within 3 months",
      "Within 6 months",
      "Within 9 months",
      "Just exploring for now",
    ],
  },
  {
    id: 10,
    type: "multi",
    emoji: "📁",
    text: "Which documents do you already have ready?",
    subtext: "Select all that apply.",
    options: [
      "Valid Passport",
      "Academic Transcripts / Marksheets",
      "English Test Scorecard (IELTS / PTE / etc.)",
      "Statement of Purpose (SOP)",
      "Letters of Recommendation (LOR)",
      "None of these yet",
    ],
    multiMin: 1,
  },
  {
    id: 11,
    type: "single",
    emoji: "🗺️",
    text: "Where are you in your study abroad journey?",
    options: [
      "Just starting to explore",
      "Shortlisting countries and universities",
      "Preparing my documents",
      "Ready to apply — need guidance",
      "Need complete counselling from scratch",
    ],
  },
  {
    id: 12,
    type: "single",
    emoji: "🚧",
    text: "What is your biggest challenge right now?",
    subtext: "This helps us give you the most relevant next step.",
    options: [
      "Choosing the right country",
      "English preparation (IELTS / PTE)",
      "Budget or education loan",
      "Selecting the right university",
      "Visa process and documents",
      "Scholarships and funding",
      "Don't know where to start",
    ],
  },
];

// ── SCORING WEIGHTS ───────────────────────────────────────────────
// Each answer contributes points toward the 0–100 readiness score.
// Max theoretical: sum of highest value per question = ~110 (normalised to 100 in ResultCard)
export const SCORE_WEIGHTS: Record<number, Record<string, number>> = {
  1: {
    "Higher Education / University Degree": 10,
    "PR Pathway (Permanent Residency)": 10,
    "Better Job Opportunities": 8,
    "Research / PhD": 10,
    "Not Sure Yet": 3,
  },
  2: {
    "Diploma / Certificate": 6,
    "Bachelor's Degree": 8,
    "Master's Degree": 10,
    "MBA": 10,
    "PhD / Research": 10,
  },
  3: {
    "Completed 10th / SSC": 2,
    "Completed 12th / HSC": 5,
    "Bachelor's Degree": 8,
    "Master's Degree": 10,
    "Other": 5,
  },
  4: {
    "Below 50%": 2,
    "50% – 59%": 4,
    "60% – 69%": 7,
    "70% – 79%": 9,
    "80% and above": 10,
  },
  5: {
    "No backlogs": 10,
    "Yes, 1–2 backlogs": 7,
    "Yes, 3–5 backlogs": 4,
    "More than 5 backlogs": 1,
  },
  6: {
    "Not taken any English test yet": 2,
    "Taken a test — below IELTS 5.5 equivalent": 3,
    "IELTS 5.5 / PTE 42 / Equivalent": 5,
    "IELTS 6.0 / PTE 50 / Equivalent": 7,
    "IELTS 6.5 / PTE 58 / Equivalent": 9,
    "IELTS 7.0+ / PTE 65+ / Equivalent": 10,
  },
  7: {
    "Canada 🇨🇦": 8, "Australia 🇦🇺": 8, "United Kingdom 🇬🇧": 8,
    "USA 🇺🇸": 8, "Germany 🇩🇪": 8, "Other Europe 🇪🇺": 7,
    "Not Decided Yet": 4,
  },
  8: {
    "Below ₹10 lakhs": 3,
    "₹10 – 15 lakhs": 5,
    "₹15 – 25 lakhs": 8,
    "₹25 – 40 lakhs": 9,
    "₹40 lakhs+": 10,
  },
  9: {
    "As soon as possible (within 1 month)": 10,
    "Within 3 months": 9,
    "Within 6 months": 7,
    "Within 9 months": 5,
    "Just exploring for now": 2,
  },
  // Q10 multi: 2 pts per document, scored separately in ResultCard
  10: {
    "Valid Passport": 2,
    "Academic Transcripts / Marksheets": 2,
    "English Test Scorecard (IELTS / PTE / etc.)": 2,
    "Statement of Purpose (SOP)": 2,
    "Letters of Recommendation (LOR)": 2,
    "None of these yet": 0,
  },
  11: {
    "Just starting to explore": 2,
    "Shortlisting countries and universities": 5,
    "Preparing my documents": 7,
    "Ready to apply — need guidance": 9,
    "Need complete counselling from scratch": 4,
  },
  12: {
    // Biggest challenge doesn't affect score — used in result card recommendations only
    "Choosing the right country": 5,
    "English preparation (IELTS / PTE)": 5,
    "Budget or education loan": 5,
    "Selecting the right university": 5,
    "Visa process and documents": 5,
    "Scholarships and funding": 5,
    "Don't know where to start": 5,
  },
};

// ── OPTION BUTTON ─────────────────────────────────────────────────
function OptionButton({
  label,
  selected,
  onClick,
  multi,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "13px 18px",
        borderRadius: 14,
        border: selected ? "2px solid #6EE7B7" : "2px solid rgba(255,255,255,0.08)",
        background: selected ? "rgba(110,231,183,0.12)" : "rgba(255,255,255,0.03)",
        color: selected ? "#6EE7B7" : "rgba(248,250,255,0.8)",
        fontWeight: selected ? 700 : 500,
        fontSize: "0.94rem",
        fontFamily: "'Inter', system-ui, sans-serif",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        transition: "all 0.18s ease",
        outline: "none",
      }}
    >
      <span>{label}</span>
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: multi ? 6 : "50%",
          border: selected ? "none" : "2px solid rgba(255,255,255,0.2)",
          background: selected ? "linear-gradient(135deg,#6EE7B7,#34D399)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.18s ease",
        }}
      >
        {selected && (
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#0F1B4C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

// ── QUESTION CARD ─────────────────────────────────────────────────
interface QuestionCardProps {
  question: Question;
  answers: Record<number, string | string[]>;
  onAnswer: (id: number, value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  current: number;
  total: number;
  isLast?: boolean;
}

export default function QuestionCard({
  question,
  answers,
  onAnswer,
  onNext,
  onBack,
  current,
  total,
  isLast = false,
}: QuestionCardProps) {
  const currentAnswer = answers[question.id];
  const isSingle = question.type === "single";
  const isMulti = question.type === "multi";

  const [multiSelected, setMultiSelected] = useState<string[]>(
    () => (Array.isArray(currentAnswer) ? currentAnswer : [])
  );

  useEffect(() => {
    setMultiSelected(Array.isArray(answers[question.id]) ? (answers[question.id] as string[]) : []);
  }, [question.id]);

  const handleSingle = (option: string) => {
    onAnswer(question.id, option);
    setTimeout(onNext, 280);
  };

  const handleMulti = (option: string) => {
    if (option === "None of these yet") {
      const next = multiSelected.includes(option) ? [] : [option];
      setMultiSelected(next);
      onAnswer(question.id, next);
      return;
    }
    const without = multiSelected.filter((s) => s !== "None of these yet");
    const next = without.includes(option)
      ? without.filter((s) => s !== option)
      : [...without, option];
    setMultiSelected(next);
    onAnswer(question.id, next);
  };

  const multiValid = multiSelected.length >= (question.multiMin ?? 1);
  const progressPct = Math.round(((current - 1) / total) * 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes qcard-in {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .qcard-enter { animation: qcard-in 0.35s ease-out forwards; }
      `}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
        style={{ background: "#0F1B4C" }}
      >
        <div className="qcard-enter w-full" key={question.id} style={{ maxWidth: 600 }}>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold" style={{ color: "rgba(248,250,255,0.4)" }}>
                Question {current} of {total}
              </span>
              <span className="text-xs font-bold" style={{ color: "#6EE7B7" }}>
                {progressPct}% complete
              </span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: "rgba(255,255,255,0.07)" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg,#6EE7B7,#34D399)",
                  borderRadius: 9999,
                  transition: "width 0.45s ease-out",
                }}
              />
            </div>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-7 sm:p-9"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Header */}
            <div className="mb-6">
              <span className="text-3xl mb-3 block">{question.emoji}</span>
              <h2
                className="font-bold leading-snug"
                style={{
                  color: "#F8FAFF",
                  fontFamily: "'Sora', system-ui, sans-serif",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                  marginBottom: question.subtext ? 8 : 0,
                }}
              >
                {question.text}
              </h2>
              {question.subtext && (
                <p className="text-sm" style={{ color: "rgba(248,250,255,0.42)", lineHeight: 1.6 }}>
                  {question.subtext}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2.5" role={isMulti ? "group" : "radiogroup"} aria-label={question.text}>
              {question.options.map((option) => (
                <OptionButton
                  key={option}
                  label={option}
                  selected={isSingle ? currentAnswer === option : multiSelected.includes(option)}
                  multi={isMulti}
                  onClick={() => isSingle ? handleSingle(option) : handleMulti(option)}
                />
              ))}
            </div>

            {/* Multi continue */}
            {isMulti && (
              <button
                type="button"
                onClick={onNext}
                disabled={!multiValid}
                style={{
                  marginTop: 20,
                  width: "100%",
                  padding: "14px 0",
                  background: multiValid ? "linear-gradient(135deg,#6EE7B7,#34D399)" : "rgba(110,231,183,0.15)",
                  color: multiValid ? "#0F1B4C" : "#6EE7B7",
                  fontFamily: "'Sora', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderRadius: 14,
                  border: "none",
                  cursor: multiValid ? "pointer" : "not-allowed",
                  opacity: multiValid ? 1 : 0.5,
                  transition: "all 0.2s ease",
                }}
              >
                {isLast ? "See My Results →" : "Continue →"}
              </button>
            )}
          </div>

          {/* Nav row */}
          <div className="flex justify-between items-center mt-4 px-1">
            <button
              type="button"
              onClick={onBack}
              disabled={current === 1}
              style={{
                background: "none",
                border: "none",
                color: current === 1 ? "rgba(248,250,255,0.2)" : "rgba(248,250,255,0.5)",
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: current === 1 ? "not-allowed" : "pointer",
              }}
            >
              ← Back
            </button>

            <span className="text-xs" style={{ color: "rgba(248,250,255,0.2)" }}>
              {current}/{total}
            </span>

            {/* Show skip only on unanswered single questions */}
            {isSingle && !currentAnswer ? (
              <button
                type="button"
                onClick={onNext}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(248,250,255,0.32)",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Skip →
              </button>
            ) : (
              <span className="text-xs font-semibold" style={{ color: isSingle && currentAnswer ? "#6EE7B7" : "transparent" }}>
                ✓ Selected
              </span>
            )}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "rgba(248,250,255,0.18)" }}>
            🔒 Your answers personalise your result. No data is shared.
          </p>
        </div>
      </div>
    </>
  );
}