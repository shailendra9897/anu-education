"use client";

// FILE: components/ai/TypingIndicator.tsx
//
// Three-dot "assistant is typing" bubble — shown in the message list
// while ChatWindow awaits a response from /api/chat.

import { CHAT_COLOURS } from "./ChatWidget";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-1.5 px-4 py-3 shadow-sm"
        style={{
          background: "#fff",
          borderRadius: CHAT_COLOURS.radius,
          borderTopLeftRadius: 6,
        }}
        aria-label="ANU AI is typing"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full opacity-60"
            style={{
              background: CHAT_COLOURS.primary,
              animation: `anu-typing-bounce 1.2s ${i * 0.15}s infinite ease-in-out`,
            }}
          />
        ))}
        <style>{`
          @keyframes anu-typing-bounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30%            { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
