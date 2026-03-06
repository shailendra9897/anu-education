'use client'

import { useState, useEffect } from "react";

export default function FreeDemoPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("IELTS");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(7200);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const progress = (step / 3) * 100;

  async function submitForm() {
    setLoading(true);
    try {
      await fetch("/api/demo-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, course }),
      });
      setSuccess(true);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  return (
    <main className="bg-white min-h-screen text-gray-900">
      {/* HERO */}
      <section className="text-center py-12 px-4">
        <h1 className="text-3xl font-bold mb-3">Free IELTS / PTE Demo Classes</h1>
        <p className="text-gray-600 mb-3">
          Join our <strong>3 Days FREE Live Demo</strong>
        </p>
        <p className="text-green-600 font-semibold">🔥 Limited seats this week</p>
      </section>

      {/* COUNTDOWN */}
      <section className="text-center mb-10">
        <p className="font-semibold text-lg">Next Demo Starts In</p>
        <p className="text-3xl font-bold text-green-600">
          {hours}:{minutes.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
        </p>
      </section>

      {/* FORM */}
      <section className="max-w-md mx-auto px-4 pb-16">
        <div className="border rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-center mb-4">Reserve Your Free Demo</h2>

          {/* PROGRESS */}
          <div className="w-full bg-gray-200 h-2 rounded mb-6">
            <div
              className="bg-green-600 h-2 rounded"
              style={{ width: progress + "%" }}
            />
          </div>

          {/* SUCCESS SCREEN */}
          {success ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">🎉 Demo Seat Reserved</h3>
              <p className="text-gray-600 mb-4">Check WhatsApp for demo details</p>
              <a
                href="https://wa.me/919428186817"
                className="block bg-green-600 text-white py-3 rounded-lg"
              >
                Open WhatsApp
              </a>
            </div>
          ) : (
            <>
              {/* STEP 1 */}
              {step === 1 && (
                <div>
                  <label className="text-sm font-medium">Your Name</label>
                  <input
                    className="w-full border rounded-lg p-3 mt-2 mb-4"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div>
                  <label className="text-sm font-medium">WhatsApp Number</label>
                  <input
                    className="w-full border rounded-lg p-3 mt-2 mb-4"
                    placeholder="91XXXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <button
                    onClick={() => setStep(3)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div>
                  <label className="text-sm font-medium">Select Course</label>
                  <select
                    className="w-full border rounded-lg p-3 mt-2 mb-4"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  >
                    <option value="IELTS">IELTS</option>
                    <option value="PTE">PTE</option>
                    <option value="Study Abroad">Study Abroad</option>
                  </select>
                  <button
                    onClick={submitForm}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg"
                  >
                    {loading ? "Submitting..." : "Start Free Demo"}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    No credit card required
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}