"use client";

import { useState, useEffect } from "react";
import { whatsappTemplates } from "@/lib/whatsappTemplates";

export default function WhatsAppPage() {
  const [numbers, setNumbers] = useState("");
  const [templateId, setTemplateId] = useState(whatsappTemplates[0]?.id || "");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [optInConfirmed, setOptInConfirmed] = useState(false);

  const selectedTemplate = whatsappTemplates.find((t) => t.id === templateId);

  // Reset variables when template changes
  useEffect(() => {
    if (selectedTemplate?.variables) {
      const initial: Record<string, string> = {};
      selectedTemplate.variables.forEach((v) => (initial[v] = ""));
      setVariables(initial);
    }
  }, [templateId, selectedTemplate]);

  const parseNumbers = (text: string): string[] => {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => {
        // Indian mobile: 10 digits OR 12 digits starting with 91
        const digits = line.replace(/\D/g, "");
        return digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
      })
      .map((line) => {
        let digits = line.replace(/\D/g, "");
        if (digits.length === 10) digits = "91" + digits;
        return digits;
      });
  };

  const handleSend = async () => {
    if (!optInConfirmed) {
      alert("⚠️ You must confirm that all recipients have opted in.");
      return;
    }

    const numberArray = parseNumbers(numbers);
    if (numberArray.length === 0) {
      alert("Please enter valid Indian mobile numbers (10 digits, one per line).");
      return;
    }

    // Validate template variables
    if (selectedTemplate?.variables?.length) {
      const missing = selectedTemplate.variables.filter((v) => !variables[v]?.trim());
      if (missing.length) {
        alert(`Missing values for: ${missing.join(", ")}`);
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/send", {
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
        alert(`✅ Sent: ${data.sent} / ${numberArray.length}\nFailed: ${data.failedCount || 0}`);
        setNumbers("");
        setOptInConfirmed(false);
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
      <h1 className="text-2xl font-bold">WhatsApp Campaign (Pro)</h1>

      {/* Opt-in checkbox */}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={optInConfirmed}
          onChange={(e) => setOptInConfirmed(e.target.checked)}
        />
        I confirm that all numbers have explicitly opted in to receive WhatsApp messages.
      </label>

      {/* Template select */}
      <select
        className="w-full border p-2 rounded"
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
      >
        {whatsappTemplates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* Template variables (if any) */}
      {selectedTemplate?.variables && selectedTemplate.variables.length > 0 && (
        <div className="border p-3 rounded bg-gray-50 space-y-2">
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

      {/* Numbers input */}
      <textarea
        className="w-full border p-3 rounded"
        rows={6}
        placeholder="Enter one Indian mobile number per line (e.g., 9876543210 or +919876543210)"
        value={numbers}
        onChange={(e) => setNumbers(e.target.value)}
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        className="bg-green-600 text-white px-6 py-2 rounded w-full disabled:opacity-50"
        disabled={loading || !optInConfirmed}
      >
        {loading ? "Sending..." : "Send Campaign"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        ⚠️ You must have explicit consent from every recipient. Unsolicited messages
        will result in permanent WhatsApp API ban.
      </p>
    </div>
  );
}