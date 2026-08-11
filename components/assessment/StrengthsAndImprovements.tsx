"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface Strength {
  label: string;
  detail: string;
  icon: string;
}

interface Weakness {
  label: string;
  detail: string;
  icon: string;
  fixWith: string;
}

interface StrengthsAndImprovementsProps {
  strengths: Strength[];
  improvements: Weakness[];
}
// ── Component ──────────────────────────────────────────────────────
export default function StrengthsAndImprovements({
  strengths,
  improvements,
}: StrengthsAndImprovementsProps) {
  return (
    <section className="py-12 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">

          {/* ── Left: Strengths ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-md border border-green-100"
          >
            <h3 className="text-2xl font-bold text-green-700 flex items-center gap-3 mb-6">
              <CheckCircle className="w-7 h-7" />
              💪 Your Strengths
            </h3>
            <ul className="space-y-3">
              {strengths.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
  <div className="font-semibold flex items-center gap-2">
    <span>{item.icon}</span>
    {item.label}
  </div>

  <p className="text-sm text-gray-500 mt-1">
    {item.detail}
  </p>
</div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ── Right: Areas to Improve ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-md border border-amber-100"
          >
            <h3 className="text-2xl font-bold text-amber-700 flex items-center gap-3 mb-6">
              <AlertCircle className="w-7 h-7" />
              ⚠ Areas to Improve
            </h3>
            <ul className="space-y-3">
              {improvements.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <AlertCircle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
  <div className="font-semibold flex items-center gap-2">
    <span>{item.icon}</span>
    {item.label}
  </div>

  <p className="text-sm text-gray-500 mt-1">
    {item.detail}
  </p>

  <div className="mt-2 text-xs font-medium text-blue-600">
    Recommended: {item.fixWith}
  </div>
</div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  );
}