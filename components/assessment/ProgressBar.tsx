"use client";

interface ProgressBarProps {
  current: number; // 1‑based question number
  total: number;   // total questions (12)
  answeredCount: number; // number of answered questions
}

export default function ProgressBar({
  current,
  total,
  answeredCount,
}: ProgressBarProps) {
  const progress = Math.round((answeredCount / total) * 100);

  // ── Dynamic messages ──────────────────────────────────────────────
  let message = "";
  if (current <= 3) {
    message = "🎉 Great start!";
  } else if (current <= 6) {
    message = "🚀 You're halfway there.";
  } else if (current <= 10) {
    message = "✨ Almost done! Your personalized report is being prepared.";
  } else {
    message = "📊 Finalizing your profile...";
  }

  // ── Time remaining (assuming ~2 min per question) ──────────────
  const remainingQuestions = total - answeredCount;
  const minutesRemaining = Math.max(0, remainingQuestions * 2);
  let timeText = "";
  if (remainingQuestions === 0) {
    timeText = "⏱ Almost done!";
  } else if (minutesRemaining > 1) {
    timeText = `⏱ About ${minutesRemaining} minutes remaining.`;
  } else {
    timeText = "⏱ Less than a minute remaining.";
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2">
      {/* ── Question counter and percentage ── */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-white/60">
          Question {current} of {total}
        </span>
        <span className="text-sm font-bold text-[#6EE7B7]">
          {progress}% Complete
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#6EE7B7] to-[#34D399] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Message + time ── */}
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-white/40">{message}</span>
        <span className="text-xs text-white/40">{timeText}</span>
      </div>
    </div>
  );
}