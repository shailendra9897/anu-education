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

  useEffect(() => {
    if (selectedTemplate?.variables) {
      const initial: Record<string, string> = {};
      selectedTemplate.variables.forEach((v) => (initial[v] = ""));
      setVariables(initial);
    }
  }, [templateId, selectedTemplate]);

  // ==========================
  // NEW PARSE FUNCTION (supports "Name, 9876543210")
  // ==========================
  const parseData = (text: string) => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, number] = line.split(",");
        let digits = number?.replace(/\D/g, "") || "";

        if (digits.length === 10) digits = "91" + digits;

        return {
          name: name?.trim() || "Student",
          phone: digits,
        };
      })
      .filter((item) => item.phone.length >= 12);
  };

  const handleSend = async () => {
    if (!optInConfirmed) {
      alert("⚠️ You must confirm that all recipients have opted in.");
      return;
    }

    const contacts = parseData(numbers);
    if (contacts.length === 0) {
      alert("Please enter valid data (Name, Phone) – one per line.");
      return;
    }

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
          contacts,           // 👈 new structure
          templateName: templateId,
          templateVariables: variables,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ Sent: ${data.sent} / ${contacts.length}\nFailed: ${data.failedCount || 0}`);
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

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={optInConfirmed}
          onChange={(e) => setOptInConfirmed(e.target.checked)}
        />
        I confirm that all numbers have explicitly opted in to receive WhatsApp messages.
      </label>

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

      <textarea
        className="w-full border p-3 rounded font-mono"
        rows={8}
        placeholder="Enter one contact per line:&#10;Raj, 9876543210&#10;Priya, +919876543210&#10;Amit, 9876543211"
        value={numbers}
        onChange={(e) => setNumbers(e.target.value)}
      />

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