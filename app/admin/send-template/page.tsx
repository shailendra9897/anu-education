'use client';

import { useState } from "react";

export default function SendTemplatePage() {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!number) {
      setStatus("❌ Please enter phone number");
      return;
    }

    // Basic phone validation (India format)
    if (!/^91\d{10}$/.test(number)) {
      setStatus("❌ Phone must be like 9198XXXXXXXX");
      return;
    }

    setLoading(true);
    setStatus("Sending...");

    try {
      const res = await fetch("/api/send-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          number,
          name
        })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ Template sent successfully");
        setNumber("");
        setName("");
      } else {
        setStatus(`❌ Error: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      setStatus("❌ Server error");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 40, maxWidth: 500 }}>
      <h2 style={{ marginBottom: 20 }}>Send WhatsApp Template</h2>

      <input
        type="text"
        placeholder="Phone (e.g. 9198XXXXXXXX)"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 15 }}
      />

      <input
        type="text"
        placeholder="Student Name (Optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 15 }}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        style={{
          padding: 12,
          width: "100%",
          background: loading ? "#999" : "#16a34a",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        {loading ? "Sending..." : "Send Template"}
      </button>

      <p style={{ marginTop: 20 }}>{status}</p>
    </div>
  );
}