"use client";

import { useState } from "react";
import type { AssessmentResult } from "@/lib/assessment/scoreEngine";
import { generateRoadmapPDF } from "@/lib/assessment/generateRoadmapPDF";

interface LeadCaptureModalProps {
  onClose: () => void;
  score: number;
  countries: string[];
  result: AssessmentResult;
}

// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx4vH_ilTA0PxRgoONzmpDqN-JsZ7b1Gr7qL9RwrplXL11a3djSt9W7b7WoPIEWvZ4M4g/exec";

export default function LeadCaptureModal({
  onClose,
  score,
  countries,
  result,
}: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
const handleDownloadPDF = () => {
  generateRoadmapPDF(
    {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
    },
    result
  );
};

  if (submitting) return;

  setError("");

  if (!name.trim()) {
    setError("Please enter your full name.");
    return;
  }

  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length < 10) {
    setError("Please enter a valid phone number.");
    return;
  }

  if (!email.trim()) {
    setError("Please enter your email address.");
    return;
  }

  setSubmitting(true);

  try {
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      score,
      countries: Array.isArray(countries)
        ? countries.join(", ")
        : "",
      source: "Study Abroad Readiness Assessment",
      page:
        typeof window !== "undefined"
          ? window.location.href
          : "",
      submittedAt: new Date().toISOString(),
    };

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
    });

    setSubmitted(true);
  } catch (error) {
    console.error("Lead submission failed:", error);

    setError(
      "We couldn't save your details. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
};
const handleDownloadPDF = () => {
    generateRoadmapPDF(
      {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      },
      result
    );
  };

  return (
    
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 text-gray-800 shadow-2xl relative">

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        {!submitted ? (
          <>
            {/* Heading */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎯</div>

              <h2 className="text-2xl font-bold text-[#0F1B4C]">
                Get Your Personalised Roadmap
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Your readiness score is
              </p>

              <div className="text-3xl font-black text-green-600 mt-1">
                {score}/100
              </div>

              <p className="text-sm text-gray-500 mt-3">
                Enter your details to unlock your personalised study
                abroad roadmap and free counselling support.
              </p>
            </div>

            {/* Countries */}
            {countries.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-center">
                <p className="text-xs text-gray-500 mb-1">
                  Your recommended destinations
                </p>

                <p className="text-sm font-semibold text-blue-700">
                  {countries.join(" • ")}
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={submitting}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6EE7B7] focus:border-transparent outline-none disabled:opacity-60"
                required
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                inputMode="tel"
                disabled={submitting}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6EE7B7] focus:border-transparent outline-none disabled:opacity-60"
                required
              />

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={submitting}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#6EE7B7] focus:border-transparent outline-none disabled:opacity-60"
                required
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#6EE7B7] to-[#34D399] text-[#0F1B4C] font-bold py-3.5 rounded-xl hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Creating Your Roadmap..."
                  : "Get My Roadmap →"}
              </button>
            </form>

            <p className="text-xs text-gray-400 mt-4 text-center">
              🔒 Your information is secure. No spam.
            </p>
          </>
        ) : (
          /* Success */
          <div className="text-center py-8">

            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-3xl mb-5">
              ✓
            </div>

            <h3 className="text-2xl font-bold text-[#0F1B4C]">
              Your Roadmap Is Ready!
            </h3>

            <p className="text-gray-500 mt-3">
              Thanks, {name}. Your details have been received successfully.
            </p>

            <div className="mt-5 bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">
                Your Readiness Score
              </p>

              <p className="text-3xl font-black text-green-600 mt-1">
                {score}/100
              </p>
            </div>

            <div className="mt-6 space-y-3">
  <button
    type="button"
    onClick={handleDownloadPDF}
    className="w-full bg-gradient-to-r from-[#6EE7B7] to-[#34D399] text-[#0F1B4C] font-bold py-3.5 rounded-xl hover:brightness-110 transition"
  >
    📄 Save My Roadmap as PDF
  </button>

  <button
    type="button"
    onClick={onClose}
    className="w-full bg-[#0F1B4C] text-white font-semibold py-3 rounded-xl hover:bg-[#162660] transition"
  >
    View My Full Results
  </button>
</div>
            <p className="text-xs text-gray-400 mt-4">
              Next: you'll be able to save your personalised roadmap as PDF.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}