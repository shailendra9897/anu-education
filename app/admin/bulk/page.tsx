"use client";

import { useState } from "react";

// Template definitions with placeholders
const templates = [
  {
    name: "Teacher Collaboration",
    id: "teacher_collaboration_primary",
    variables: ["teacher_name", "school_name"],
  },
  {
    name: "Free Demo Offer",
    id: "free_demo_offer",
    variables: ["demo_date", "demo_time"],
  },
];

export default function BulkPage() {
  const [numbers, setNumbers] = useState("");
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [optInChecked, setOptInChecked] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === templateId);

  // Update variable state when template changes
  const handleTemplateChange = (newId: string) => {
    setTemplateId(newId);
    const freshVars: Record<string, string> = {};
    templates.find((t) => t.id === newId)?.variables.forEach((v) => {
      freshVars[v] = "";
    });
    setVariables(freshVars);
  };

  // Parse and validate phone numbers (Indian format)
  const parseNumbers = (text: string): string[] => {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => {
        // Remove any non-digit characters, then check if it's a valid Indian mobile number
        const digits = line.replace(/\D/g, "");
        // 10 digits OR 12 digits starting with 91
        return digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
      })
      .map((line) => {
        let digits = line.replace(/\D/g, "");
        if (digits.length === 10) digits = "91" + digits;
        return digits;
      });
  };

  const handleSend = async () => {
    if (!optInChecked) {
      alert("⚠️ You must confirm that all numbers have opted in to receive WhatsApp messages.");
      return;
    }

    const numberArray = parseNumbers(numbers);
    if (numberArray.length === 0) {
      alert("Please enter valid Indian mobile numbers (10 digits, one per line).");
      return;
    }

    // Validate that all required variables are filled
    const missing = selectedTemplate?.variables.filter((v) => !variables[v]?.trim());
    if (missing && missing.length > 0) {
      alert(`Missing values: ${missing.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/send-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numbers: numberArray,
          templateName: templateId,
          templateVariables: variables,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.sentCount} messages sent. Failed: ${data.failedCount || 0}`);
        setNumbers("");
        setOptInChecked(false);
      } else {
        alert(`❌ Error: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      alert("Server error. Check console.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-4">
      <h1 className="text-2xl font-bold">Send Bulk WhatsApp Template</h1>

      {/* Opt-in confirmation */}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={optInChecked}
          onChange={(e) => setOptInChecked(e.target.checked)}
        />
        I confirm that all numbers have explicitly opted in to receive messages.
      </label>

      {/* Template Select */}
      <select
        className="w-full border p-2 rounded"
        value={templateId}
        onChange={(e) => handleTemplateChange(e.target.value)}
      >
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* Variables inputs */}
      {selectedTemplate && selectedTemplate.variables.length > 0 && (
        <div className="space-y-2 border p-3 rounded bg-gray-50">
          <p className="font-medium">Template Variables:</p>
          {selectedTemplate.variables.map((varName) => (
            <input
              key={varName}
              type="text"
              placeholder={`{{${varName}}}`}
              className="w-full border p-2 rounded"
              value={variables[varName] || ""}
              onChange={(e) =>
                setVariables({ ...variables, [varName]: e.target.value })
              }
            />
          ))}
        </div>
      )}

      {/* Numbers textarea */}
      <textarea
        className="w-full border p-3 rounded"
        rows={8}
        placeholder="Enter one Indian mobile number per line (e.g., 9876543210 or +919876543210)"
        value={numbers}
        onChange={(e) => setNumbers(e.target.value)}
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        className="bg-green-600 text-white px-6 py-2 rounded w-full disabled:opacity-50"
        disabled={loading || !optInChecked}
      >
        {loading ? "Sending..." : "Send Template"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        ⚠️ You must have explicit consent from every recipient. Unsolicited messages
        will result in permanent WhatsApp API ban.
      </p>
    </div>
  );
}