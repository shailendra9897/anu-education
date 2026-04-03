"use client";

import { useState } from "react";
import { whatsappTemplates } from "@/lib/whatsappTemplates";

export default function WhatsAppPage() {
  const [mode, setMode] = useState<"single" | "bulk">("bulk");
  const [phone, setPhone] = useState("");
  const [numbers, setNumbers] = useState("");
  const [templateId, setTemplateId] = useState(whatsappTemplates[0].id);
  const [loading, setLoading] = useState(false);

  const selectedTemplate = whatsappTemplates.find(
    (t) => t.id === templateId
  );

  const parseNumbers = (text: string) => {
    return text
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length >= 10);
  };

  const handleSend = async () => {
    setLoading(true);

    try {
      if (mode === "single") {
        await fetch("/api/send-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            number: phone,
            templateName: templateId,
          }),
        });

        alert("Message Sent ✅");
      } else {
        const numberArray = parseNumbers(numbers);

        await fetch("/api/send-bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numbers: numberArray,
            templateName: templateId,
          }),
        });

        alert("Bulk Sent ✅");
      }
    } catch (err) {
      alert("Error ❌");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-4">

      <h1 className="text-2xl font-bold">WhatsApp Campaign Panel</h1>

      {/* MODE SWITCH */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("single")}
          className={`px-4 py-2 rounded ${
            mode === "single" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Single
        </button>

        <button
          onClick={() => setMode("bulk")}
          className={`px-4 py-2 rounded ${
            mode === "bulk" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Bulk
        </button>
      </div>

      {/* TEMPLATE SELECT */}
      <select
        className="w-full border p-2 rounded"
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
      >
        {whatsappTemplates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.category})
          </option>
        ))}
      </select>

      {/* SINGLE */}
      {mode === "single" && (
        <input
          className="w-full border p-2 rounded"
          placeholder="Enter phone (919xxxxxxxxx)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      )}

      {/* BULK */}
      {mode === "bulk" && (
        <textarea
          className="w-full border p-2 rounded"
          rows={6}
          placeholder="Enter numbers (one per line)"
          value={numbers}
          onChange={(e) => setNumbers(e.target.value)}
        />
      )}

      {/* SEND */}
      <button
        onClick={handleSend}
        className="bg-green-600 text-white px-6 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Campaign"}
      </button>

      {/* INFO */}
      <p className="text-xs text-gray-500 text-center">
        Leads will be saved automatically in Google Sheet.
      </p>
    </div>
  );
}