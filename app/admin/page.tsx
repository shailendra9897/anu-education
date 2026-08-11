"use client";

import { useState } from "react";
import { whatsappTemplates } from "@/lib/whatsappTemplates";

export default function WhatsAppPage() {
  const [data, setData] = useState("");
  const [templateId, setTemplateId] = useState(whatsappTemplates[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [optInConfirmed, setOptInConfirmed] = useState(false);

  // 🔥 PARSE NAME + NUMBER
  const parseContacts = (text: string) => {
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
      .filter((item) => item.phone.length === 12);
  };

  const handleSend = async () => {
    if (!optInConfirmed) {
      alert("⚠️ Please confirm opt-in.");
      return;
    }

    const contacts = parseContacts(data);

    if (contacts.length === 0) {
      alert("Invalid format. Use: Name,Number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contacts, // ✅ NEW
          templateName: templateId,
        }),
      });

      const result = await res.json();

      if (result.success) {
        alert(`✅ Sent: ${result.sent}`);
        setData("");
        setOptInConfirmed(false);
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-4">
      <h1 className="text-2xl font-bold">WhatsApp Campaign 🚀</h1>

      {/* OPT-IN */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={optInConfirmed}
          onChange={(e) => setOptInConfirmed(e.target.checked)}
        />
        I confirm all users opted-in
      </label>

      {/* TEMPLATE */}
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

      {/* INPUT */}
      <textarea
        className="w-full border p-3 rounded"
        rows={8}
        placeholder={`Enter data like:
Rahul,9876543210
Amit,9123456789`}
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      {/* BUTTON */}
      <button
        onClick={handleSend}
        disabled={loading || !optInConfirmed}
        className="bg-green-600 text-white px-6 py-2 rounded w-full"
      >
        {loading ? "Sending..." : "Send Campaign"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        ⚠️ Only send to opted-in users
      </p>
    </div>
  );
}