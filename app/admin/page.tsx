'use client';

import { useState } from "react";

export default function SimpleAdmin() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");

  if (!auth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="p-6 border rounded-xl">
          <h2 className="mb-3">Enter Password</h2>

          <input
            type="password"
            className="border p-2 w-full mb-3"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={() => {
              if (password === "anu@123") setAuth(true);
              else alert("Wrong password");
            }}
            className="bg-green-600 text-white px-4 py-2"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">CRM Access</h1>

      <a
        href="https://docs.google.com/spreadsheets/d/1FZIFDVyQdtMT92mYfVp2NsUbQvMvnUFqKa75iYEI2bA/edit?gid=0#gid=0"
        target="_blank"
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        Open Google Sheet
      </a>
    </div>
  );
}