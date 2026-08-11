// components/assessment/LoadingScreen.tsx
"use client";

import { useState, useEffect } from "react";

const messages = [
  "Analyzing your academic profile...",
  "Evaluating your English readiness...",
  "Checking your budget and goals...",
  "Matching you with the best countries...",
  "Preparing your personalised roadmap...",
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F1B4C]">
      {/* ── Animated Ring Spinner ── */}
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#6EE7B7] border-r-[#6EE7B7] animate-spin" />
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-full bg-[#6EE7B7]/10 blur-sm" />
      </div>

      {/* ── Message ── */}
      <p className="mt-8 text-lg font-medium text-white/80 transition-opacity duration-300">
        {messages[messageIndex]}
      </p>

      {/* ── Progress Dots ── */}
      <div className="mt-6 flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === messageIndex ? "bg-[#6EE7B7] scale-125" : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}