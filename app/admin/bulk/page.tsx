"use client";

import { useState } from "react";

export default function BulkPage() {
  const [numbers, setNumbers] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);

    const numberArray = numbers.split("\n").map(n => n.trim());

    await fetch("/api/send-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numbers: numberArray,
        templateName: "free_demo_offer",
      }),
    });

    setLoading(false);
    alert("Messages Sent!");
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Send Bulk WhatsApp Template</h1>

      <textarea
        className="w-full border p-3 mb-4"
        rows={8}
        placeholder="Enter one number per line (919xxxxxxxxx)"
        value={numbers}
        onChange={(e) => setNumbers(e.target.value)}
      />

      <button
        onClick={handleSend}
        className="bg-green-600 text-white px-6 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Template"}
      </button>
    </div>
  );
}