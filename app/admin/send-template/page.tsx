'use client';

import { useState } from "react";

export default function SendTemplatePage() {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const handleLogin = async () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      setAuthenticated(true);
    } else {
      alert("Wrong password");
    }
  };

  const handleSend = async () => {
    if (!number) {
      setStatus("❌ Please enter phone number");
      return;
    }

    setLoading(true);
    setStatus("Sending...");

    try {
      const res = await fetch("/api/send-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number, name })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ Template sent successfully");
        setNumber("");
        setName("");
      } else {
        setStatus(`❌ ${data?.error?.error?.message || "Failed to send"}`);
      }
    } catch {
      setStatus("❌ Server error");
    }

    setLoading(false);
  };

  if (!authenticated) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Admin Login</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, marginBottom: 10 }}
        />
        <br />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 500 }}>
      <h2>Send WhatsApp Template</h2>

      <input
        type="text"
        placeholder="Phone (9198XXXXXXXX)"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        type="text"
        placeholder="Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <button onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : "Send Template"}
      </button>

      <p>{status}</p>
    </div>
  );
}