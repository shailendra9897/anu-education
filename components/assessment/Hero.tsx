"use client";

// FILE: app/assessment/study-abroad-readiness/components/Hero.tsx
//
// Design: Deep indigo (#0F1B4C) background · mint green (#6EE7B7) accent
// Signature element: animated SVG readiness-meter ring that fills to ~65%
// on load — makes the abstract concept of "readiness" visual before any
// question is answered.
// Typography: Sora (display, optimistic geometric) + Inter (body)

import { useEffect, useRef, useState } from "react";

// ── ANIMATED RING ─────────────────────────────────────────────────
// r=54 → circumference = 2π×54 ≈ 339.3
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ReadinessMeter() {
  const [progress, setProgress] = useState(0); // 0 → 65
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Small delay then animate to 65
    const delay = setTimeout(() => {
      let frame = 0;
      const target = 65;
      const duration = 1400; // ms
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setProgress(Math.round(eased * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 400);
    return () => clearTimeout(delay);
  }, []);

  const strokeDashoffset = isMounted
    ? CIRCUMFERENCE * (1 - progress / 100)
    : CIRCUMFERENCE;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer glow ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 148,
          height: 148,
          background:
            "radial-gradient(circle, rgba(110,231,183,0.18) 0%, transparent 70%)",
        }}
      />
      <svg
        width={148}
        height={148}
        viewBox="0 0 148 148"
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={74}
          cy={74}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={10}
        />
        {/* Progress arc */}
        <circle
          cx={74}
          cy={74}
          r={RADIUS}
          fill="none"
          stroke="url(#meterGrad)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.03s linear" }}
        />
        <defs>
          <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
        </defs>
      </svg>

      {/* Centre label */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ transform: "rotate(0deg)" }}
      >
        <span
          className="text-3xl font-black leading-none"
          style={{
            color: "#6EE7B7",
            fontFamily: "'Sora', 'Inter', system-ui, sans-serif",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {isMounted ? progress : 0}
          <span className="text-lg" style={{ color: "#FDE68A" }}>
            %
          </span>
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest mt-0.5"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          Ready
        </span>
      </div>
    </div>
  );
}

// ── FLOATING PARTICLE (subtle atmosphere) ────────────────────────
function Particle({
  style,
}: {
  style: React.CSSProperties;
}) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 4,
        height: 4,
        background: "rgba(110,231,183,0.35)",
        ...style,
      }}
    />
  );
}

// ── FEATURE PILL ─────────────────────────────────────────────────
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
      style={{
        background: "rgba(110,231,183,0.12)",
        border: "1px solid rgba(110,231,183,0.25)",
        color: "#6EE7B7",
      }}
    >
      {children}
    </span>
  );
}

// ── HERO ─────────────────────────────────────────────────────────
interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setPrefersReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    // Stagger reveal
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>

      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-16"
        style={{ background: "#0F1B4C" }}
      >
        {/* Background mesh gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(30,58,95,0.9) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 85% 80%, rgba(110,231,183,0.07) 0%, transparent 60%)",
          }}
        />

        {/* Scattered particles */}
        {!prefersReduced && (
          <>
            <Particle style={{ top: "12%", left: "8%", animationDelay: "0s" }} />
            <Particle style={{ top: "22%", left: "82%", animationDelay: "0.4s" }} />
            <Particle style={{ top: "65%", left: "6%", animationDelay: "0.9s" }} />
            <Particle style={{ top: "78%", left: "91%", animationDelay: "0.2s" }} />
            <Particle style={{ top: "40%", left: "95%", animationDelay: "1.1s" }} />
          </>
        )}

        {/* ── CONTENT ── */}
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* ── LEFT / TOP: Copy ── */}
            <div className="flex-1 text-center lg:text-left">

              {/* Eyebrow */}
              <div
                className="hero-animate"
                style={{
                  animationDelay: "0.05s",
                  opacity: visible ? undefined : 0,
                }}
              >
                <span
                  className="inline-block text-xs font-bold tracking-[0.22em] uppercase mb-5 px-3 py-1.5 rounded-full"
                  style={{
                    color: "#FDE68A",
                    background: "rgba(253,230,138,0.1)",
                    border: "1px solid rgba(253,230,138,0.25)",
                  }}
                >
                  Free · 2 Minutes · No Sign-up Needed
                </span>
              </div>

              {/* Headline */}
              <h1
                className="hero-animate"
                style={{
                  animationDelay: "0.12s",
                  fontFamily: "'Sora', 'Inter', system-ui, sans-serif",
                  fontSize: "clamp(2rem, 5vw, 3.4rem)",
                  fontWeight: 800,
                  lineHeight: 1.15,
                  color: "#F8FAFF",
                  letterSpacing: "-0.02em",
                  marginBottom: "1rem",
                }}
              >
                ANU Study Abroad
                <br />
                <span style={{ color: "#6EE7B7" }}>Readiness</span>
                {" "}
                <span
                  style={{
                    fontStyle: "italic",
                    fontWeight: 700,
                    color: "rgba(248,250,255,0.7)",
                  }}
                >
                  Assessment
                </span>
                <sup
                  style={{
                    fontSize: "0.45em",
                    verticalAlign: "super",
                    color: "#FDE68A",
                    fontStyle: "normal",
                    fontWeight: 700,
                    letterSpacing: 0,
                  }}
                >
                  ™
                </sup>
              </h1>

              {/* Sub */}
              <p
                className="hero-animate"
                style={{
                  animationDelay: "0.2s",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "1.1rem",
                  color: "rgba(248,250,255,0.7)",
                  lineHeight: 1.65,
                  maxWidth: 440,
                  margin: "0 auto 1.6rem",
                  fontWeight: 400,
                }}
              >
                Answer 8 quick questions and find out exactly how prepared you are
                to study abroad — plus your top country recommendations, course
                fit, and a personal roadmap.
              </p>

              {/* Pill row */}
              <div
                className="hero-animate flex flex-wrap gap-2 justify-center lg:justify-start mb-8"
                style={{ animationDelay: "0.28s" }}
              >
                <Pill>✔ Personalised Score (out of 100)</Pill>
                <Pill>✔ Country Recommendations</Pill>
                <Pill>✔ Course &amp; Exam Fit</Pill>
                <Pill>✔ Free Counselling</Pill>
              </div>

              {/* CTA */}
              <div
                className="hero-animate"
                style={{ animationDelay: "0.38s" }}
              >
                <button
                  onClick={onStart}
                  className="hero-btn-pulse inline-flex items-center gap-3 font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-100 focus:outline-none focus:ring-4 focus:ring-green-300/40"
                  style={{
                    background:
                      "linear-gradient(135deg, #6EE7B7 0%, #34D399 100%)",
                    color: "#0F1B4C",
                    padding: "16px 36px",
                    fontFamily: "'Sora', 'Inter', system-ui, sans-serif",
                  }}
                  aria-label="Start the Study Abroad Readiness Assessment"
                >
                  Check My Readiness
                  <span
                    className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>

                <p
                  className="mt-3 text-xs"
                  style={{ color: "rgba(248,250,255,0.4)" }}
                >
                  ⏱ 2 minutes · 8 questions · No signup · 100% free
                </p>
              </div>
            </div>

            {/* ── RIGHT / BOTTOM: Meter + stat cards ── */}
            <div
              className="hero-animate flex-shrink-0 flex flex-col items-center gap-6"
              style={{ animationDelay: "0.18s" }}
            >
              {/* Meter */}
              <div className={prefersReduced ? "" : "hero-float"}>
                <ReadinessMeter />
                <p
                  className="text-center text-xs mt-3 font-semibold"
                  style={{ color: "rgba(248,250,255,0.4)" }}
                >
                  Where could you score?
                </p>
              </div>

              {/* Mini stat cards */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                {[
                  { val: "1,100+", label: "Students guided" },
                  { val: "9", label: "Countries covered" },
                  { val: "98%", label: "Visa success" },
                  { val: "Free", label: "Counselling included" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl px-4 py-3 text-center"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="text-lg font-black"
                      style={{
                        color: "#6EE7B7",
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {s.val}
                    </div>
                    <div
                      className="text-[10px] font-medium mt-0.5"
                      style={{ color: "rgba(248,250,255,0.45)" }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social proof strip */}
              <div
                className="text-center text-xs rounded-xl px-5 py-3"
                style={{
                  background: "rgba(253,230,138,0.08)",
                  border: "1px solid rgba(253,230,138,0.18)",
                  color: "#FDE68A",
                  maxWidth: 280,
                }}
              >
                <span className="font-bold">23 students</span> took this
                assessment today
              </div>
            </div>

          </div>

          {/* ── BOTTOM TRUST BAR ── */}
          <div
            className="hero-animate mt-14 pt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
            style={{
              animationDelay: "0.45s",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {[
              { icon: "🏅", text: "Skill India Certified" },
              { icon: "🔒", text: "No spam · No cold calls" },
              { icon: "🌍", text: "Canada · UK · Germany · Australia · UAE" },
            ].map((item) => (
              <span
                key={item.text}
                className="inline-flex items-center gap-2 text-xs font-medium"
                style={{ color: "rgba(248,250,255,0.45)" }}
              >
                <span>{item.icon}</span>
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
