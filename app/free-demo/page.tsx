"use client";

import { useState } from "react";

export default function FreeDemoPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("IELTS");
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {

    if (!name || !phone) {
      setStatus("Please fill all fields");
      return;
    }

    setStatus("Submitting...");

    const res = await fetch("/api/demo-lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, phone, course }),
    });

    if (res.ok) {
      setStatus("✅ Registration successful");
      setName("");
      setPhone("");
    } else {
      setStatus("❌ Error submitting form");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">

      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full">

        <h1 className="text-2xl font-bold mb-3 text-center">
          Free IELTS / PTE Demo Class
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Book your FREE demo class with ANU Education.
        </p>

        <select
          className="w-full border p-3 rounded mb-3"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        >
          <option>IELTS</option>
          <option>PTE</option>
          <option>Study Abroad</option>
        </select>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-3 rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone Number"
          className="w-full border p-3 rounded mb-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
        >
          Reserve My Free Demo
        </button>

        <p className="text-sm text-gray-500 text-center mt-2">
          No credit/debit card required • 100% Free Demo Class
        </p>

        <p className="text-center mt-4 text-sm">{status}</p>

      </div>

    </main>
  );
}