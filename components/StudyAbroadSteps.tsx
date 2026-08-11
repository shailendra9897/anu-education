"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Globe, Target, Users, Plane, GraduationCap } from "lucide-react";

type Step = {
  id: string;
  title: string;
  desc: string;
  button: string;
  icon: any;
};

const steps: Step[] = [
  {
    id: "explore",
    title: "Explore & Discover",
    desc: "Unlock endless study abroad opportunities. Research destinations and universities that align with your academic goals. Utilize ANU for complete guidance.",
    button: "Start Exploring",
    icon: Globe,
  },
  {
    id: "matchmaking",
    title: "Personalized Matchmaking",
    desc: "Find your ideal university and course. Share your academic profile to receive tailored recommendations.",
    button: "Get Your Matches",
    icon: Target,
  },
  {
    id: "guidance",
    title: "Expert Guidance & Application Support",
    desc: "Connect with mentors for university selection and application strategies. Get help with documentation & submissions.",
    button: "Talk to an Expert",
    icon: Users,
  },
  {
    id: "visa",
    title: "Visa, Accommodation & Travel",
    desc: "Navigate visas, secure housing, and plan your journey. Apply for your student visa, arrange accommodation, and book flights.",
    button: "Get Visa Assistance",
    icon: Plane,
  },
  {
    id: "predeparture",
    title: "Pre-Departure & Orientation",
    desc: "Prepare for your new academic journey with pre-departure briefings and university orientation.",
    button: "Begin Your Journey",
    icon: GraduationCap,
  },
];

export default function StudyAbroadTimeline() {
  const containerRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const prefersReducedMotion = 
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const ctaGlow = useTransform(
    scrollYProgress,
    [0.8, 1],
    [
      "0px 0px 0px rgba(59,130,246,0)",
      "0px 0px 25px rgba(59,130,246,0.6)",
    ]
  );

  // Set up intersection observer to track active step
  useEffect(() => {
    const observers = stepRefs.current.map((ref, idx) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveStep(idx);
        },
        { threshold: 0.5, rootMargin: "0px 0px -30% 0px" }
      );
      observer.observe(ref);
      return observer;
    });
    return () => {
      observers.forEach((obs) => obs?.disconnect());
    };
  }, []);

  const scrollToStep = (id: string) => {
    const el = document.getElementById(`timeline-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Helper to set refs safely
  const setStepRef = (index: number) => (el: HTMLDivElement | null) => {
    stepRefs.current[index] = el;
  };

  return (
    <section
      ref={containerRef}
      className="py-16 px-6 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">
          Step-by-Step Guide to Studying Abroad
        </h2>
        <p className="text-gray-600 mb-12">
          From university selection to visa and beyond – your complete roadmap
          with ANU Education
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Desktop progress line */}
        <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gray-200 rounded-full">
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="h-full bg-blue-500 rounded-full origin-left"
          />
        </div>

        <div className="relative flex flex-col md:flex-row md:justify-between gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            const stepStart = index / steps.length;
            const stepEnd = (index + 1) / steps.length;
            const stepProgress = useTransform(
              scrollYProgress,
              [stepStart, stepEnd],
              [0, 1]
            );
            const iconGlow = useTransform(stepProgress, [0, 1], [
              "0px 0px 0px rgba(59,130,246,0)",
              "0px 0px 16px rgba(59,130,246,0.8)",
            ]);

            return (
              <motion.div
                key={step.id}
                id={`timeline-${step.id}`}
                ref={setStepRef(index)}
                initial={
                  prefersReducedMotion
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative flex-1 flex flex-col items-center text-center md:items-start md:text-left p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition"
              >
                {index < steps.length - 1 && (
                  <div className="md:hidden absolute left-1/2 -translate-x-1/2 top-20 w-0.5 h-16 bg-gray-200" />
                )}

                <motion.button
                  type="button"
                  onClick={() => scrollToStep(step.id)}
                  style={{ boxShadow: iconGlow }}
                  className={`relative z-10 p-4 rounded-full mb-4 flex items-center justify-center transition-transform focus:outline-none ${
                    isActive
                      ? "bg-blue-500 text-white scale-110"
                      : "bg-blue-100 text-blue-600 hover:scale-105"
                  }`}
                  aria-label={`Go to ${step.title}`}
                >
                  <Icon className="h-7 w-7" />
                </motion.button>

                <h3 className="text-lg font-semibold mb-2">
                  Step {index + 1}: {step.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 max-w-xs">
                  {step.desc}
                </p>

                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 transition"
                >
                  {step.button}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-center">
        <motion.div
          style={{ boxShadow: ctaGlow }}
          animate={
            prefersReducedMotion
              ? {}
              : { scale: [1, 1.03, 1] }
          }
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          className="inline-block rounded-full"
        >
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full bg-blue-600 text-white px-8 py-3 hover:bg-blue-700 transition"
          >
            🚀 Get Started with ANU
          </Link>
        </motion.div>
      </div>
    </section>
  );
}