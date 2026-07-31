"use client";

// FILE: components/assessment/ActionPlan.tsx
//
// UPDATED vs submitted version:
//   ❌ Old: steps: string[] — threw away category + urgency data
//      that recommendationEngine.getActionPlan() already computes
//   ✅ New: steps: ActionItem[] — uses order, text, category, urgent
//      directly from lib/assessment/types.ts (no reshaping needed
//      in AssessmentClient/ResultPage before passing down)
//   ✅ Category → icon + colour mapping added (english/documents/
//      university/visa/financial/counselling)
//   ✅ Urgent items get a red badge + red-tinted number circle
//      instead of every step looking identical
//   ✅ Backwards-compatible: still accepts string[] via a safe
//      normaliser, so nothing breaks if an older caller passes plain text
//   ✅ Same visual language as submitted file: centered vertical
//      timeline, number circle left, ChevronDown connector, text right

import { motion } from "framer-motion";
import {
  ChevronDown,
  Languages,
  FileText,
  GraduationCap,
  Stamp,
  Wallet,
  PhoneCall,
  AlertCircle,
} from "lucide-react";
import type { ActionItem, ActionCategory } from "@/lib/assessment/types";

// ── Category → visual mapping ─────────────────────────────────────
const CATEGORY_CONFIG: Record<
  ActionCategory,
  { icon: typeof Languages; colour: string; bg: string; label: string }
> = {
  english: {
    icon: Languages,
    colour: "from-blue-600 to-indigo-600",
    bg: "bg-blue-50 text-blue-700",
    label: "English",
  },
  documents: {
    icon: FileText,
    colour: "from-purple-600 to-fuchsia-600",
    bg: "bg-purple-50 text-purple-700",
    label: "Documents",
  },
  university: {
    icon: GraduationCap,
    colour: "from-emerald-600 to-teal-600",
    bg: "bg-emerald-50 text-emerald-700",
    label: "University",
  },
  visa: {
    icon: Stamp,
    colour: "from-cyan-600 to-sky-600",
    bg: "bg-cyan-50 text-cyan-700",
    label: "Visa",
  },
  financial: {
    icon: Wallet,
    colour: "from-amber-600 to-orange-600",
    bg: "bg-amber-50 text-amber-700",
    label: "Financial",
  },
  counselling: {
    icon: PhoneCall,
    colour: "from-pink-600 to-rose-600",
    bg: "bg-pink-50 text-pink-700",
    label: "Counselling",
  },
};

const URGENT_COLOUR = "from-red-600 to-rose-600";

// ── Props ──────────────────────────────────────────────────────────
// Accepts either the real ActionItem[] (preferred) or plain string[]
// (backwards-compatible fallback so old callers don't break).
interface ActionPlanProps {
  steps: ActionItem[] | string[];
  title?: string;
}

// Normalise a string[] into ActionItem[] shape so rendering logic
// only has to handle one type.
function normaliseSteps(steps: ActionItem[] | string[]): ActionItem[] {
  if (steps.length === 0) return [];
  if (typeof steps[0] === "string") {
    return (steps as string[]).map((text, i) => ({
      order: i + 1,
      text,
      category: "counselling" as ActionCategory,
      urgent: false,
    }));
  }
  return steps as ActionItem[];
}

export default function ActionPlan({
  steps,
  title = "Your Action Plan",
}: ActionPlanProps) {
  const items = normaliseSteps(steps);

  if (items.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-slate-50">
      <div className="max-w-3xl mx-auto">

        {/* ── Heading ── */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center text-gray-900 mb-2"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center text-gray-500 text-sm mb-10"
        >
          {items.filter((s) => s.urgent).length > 0
            ? `${items.filter((s) => s.urgent).length} urgent item${
                items.filter((s) => s.urgent).length > 1 ? "s" : ""
              } need your attention first`
            : "Follow these steps in order for the smoothest path forward"}
        </motion.p>

        {/* ── Timeline ── */}
        <div className="relative">
          {/* Vertical guide line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-200" />

          {items.map((step, index) => {
            const isLast = index === items.length - 1;
            const config = CATEGORY_CONFIG[step.category] ?? CATEGORY_CONFIG.counselling;
            const Icon = config.icon;
            const circleGradient = step.urgent ? URGENT_COLOUR : config.colour;

            return (
              <motion.div
                key={`${step.order}-${step.text}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12, duration: 0.5 }}
                className="relative flex items-center mb-8 last:mb-0"
              >
                {/* Left side: step number + category icon */}
                <div className="w-1/2 pr-8 text-right">
                  <div className="inline-flex flex-col items-center gap-1.5">
                    <div
                      className={`relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${circleGradient} text-white font-bold text-lg shadow-md`}
                    >
                      {step.order}
                      {step.urgent && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center">
                            <AlertCircle className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                          </span>
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bg}`}
                    >
                      <Icon className="w-3 h-3" strokeWidth={2.5} />
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Center: connector arrow */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                  {!isLast && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.12 + 0.2 }}
                      className="bg-white rounded-full p-0.5 shadow-sm"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" strokeWidth={2.5} />
                    </motion.div>
                  )}
                </div>

                {/* Right side: step description */}
                <div className="w-1/2 pl-8">
                  <p
                    className={`text-lg font-medium leading-relaxed ${
                      step.urgent ? "text-red-800" : "text-gray-800"
                    }`}
                  >
                    {step.text}
                  </p>
                  {step.urgent && (
                    <span className="inline-block mt-1.5 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Do this first
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── CTA footer ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: items.length * 0.12 + 0.3 }}
          className="text-center mt-10"
        >
          <a
            href="https://anueducation.applyviz.com/walk-in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Get Help With These Steps →
          </a>
        </motion.div>

      </div>
    </section>
  );
}