"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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
    id: "step1",
    title: "Explore & Discover",
    desc:
      "Unlock endless study abroad opportunities. Research destinations and universities that align with your academic goals. Utilize ANU for complete guidance.",
    button: "Start Exploring",
    icon: Globe,
  },
  {
    id: "step2",
    title: "Personalized Matchmaking",
    desc:
      "Find your ideal university and course. Share your academic profile to receive tailored recommendations.",
    button: "Get Your Matches",
    icon: Target,
  },
  {
    id: "step3",
    title: "Expert Guidance & Application Support",
    desc:
      "Connect with mentors for university selection and application strategies. Get help with documentation & submissions.",
    button: "Talk to an Expert",
    icon: Users,
  },
  {
    id: "step4",
    title: "Visa, Accommodation & Travel",
    desc:
      "Navigate visas, secure housing, and plan your journey. Apply for your student visa, arrange accommodation, and book flights.",
    button: "Get Visa Assistance",
    icon: Plane,
  },
  {
    id: "step5",
    title: "Pre-Departure & Orientation",
    desc:
      "Prepare for your new academic journey with pre-departure briefings and university orientation.",
    button: "Begin Your Journey",
    icon: GraduationCap,
  },
];

export default function StudyAbroadTimeline() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const ctaGlow = useTransform(
    scrollYProgress,
    [0.8, 1],
    [
      "0px 0px 0px rgba(59,130,246,0)",
      "0px 0px 25px rgba(59,130,246,0.9)",
    ]
  );

  const scrollToStep = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section
      ref={ref}
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

      <div className="relative flex flex-col md:flex-row md:justify-between md:items-start max-w-6xl mx-auto">
        {/* progress line */}
        <motion.div
          style={{ scaleX }}
          className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-blue-500 origin-left z-0"
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          // per-step glow for the icon
          const stepProgress = useTransform(
            scrollYProgress,
            [index / steps.length, (index + 1) / steps.length],
            [0, 1]
          );
          const iconGlow = useTransform(stepProgress, [0, 1], [
            "0px 0px 0px rgba(59,130,246,0)",
            "0px 0px 20px rgba(59,130,246,0.8)",
          ]);

          return (
            <motion.div
              key={step.id}
              id={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative flex-1 flex flex-col items-center md:items-start text-center md:text-left p-6"
            >
              {/* Clickable, glowing icon */}
              <motion.button
                type="button"
                onClick={() => scrollToStep(step.id)}
                style={{ boxShadow: iconGlow }}
                className="relative z-10 p-4 bg-blue-100 rounded-full mb-4 flex items-center justify-center hover:scale-110 transition-transform focus:outline-none"
                aria-label={`Go to ${step.title}`}
              >
                <Icon className="h-8 w-8 text-blue-600" />
              </motion.button>

              <h3 className="text-lg font-semibold mb-2">
                Step {index + 1}: {step.title}
              </h3>
              <p className="text-gray-600 mb-3">{step.desc}</p>

              <Link
                href="/contact"
                className="inline-flex items-center rounded-full bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
              >
                {step.button}
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <motion.div
          style={{ boxShadow: ctaGlow }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block rounded-full"
        >
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full bg-blue-600 text-white px-8 py-3 hover:bg-blue-700"
          >
            🚀 Get Started with ANU
          </Link>
        </motion.div>
      </div>
    </section>
  );
}