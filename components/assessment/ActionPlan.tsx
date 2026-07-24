"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ActionPlanProps {
  steps: string[];
  title?: string;
}

export default function ActionPlan({
  steps,
  title = "Your Action Plan",
}: ActionPlanProps) {
  return (
    <section className="py-12 px-4 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        {/* ── Heading ── */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center text-gray-900 mb-10"
        >
          {title}
        </motion.h2>

        {/* ── Timeline ── */}
        <div className="relative">
          {/* Vertical guide line (behind everything) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-200" />

          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative flex items-center mb-8 last:mb-0"
              >
                {/* Left side: step number */}
                <div className="w-1/2 pr-8 text-right">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-md">
                    {index + 1}
                  </div>
                </div>

                {/* Center: connector arrow (↓) */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                  {!isLast && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.15 + 0.2 }}
                      className="bg-white rounded-full p-0.5 shadow-sm"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" strokeWidth={2.5} />
                    </motion.div>
                  )}
                </div>

                {/* Right side: step description */}
                <div className="w-1/2 pl-8">
                  <p className="text-lg font-medium text-gray-800 leading-relaxed">
                    {step}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}