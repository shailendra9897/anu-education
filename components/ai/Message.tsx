"use client";

// FILE: components/ai/Message.tsx
//
// Single chat bubble — user (right, dark) or assistant (left, white).
// Exports ChatMessage type so ChatWindow.tsx has a single source of
// truth for the message shape instead of duplicating it inline.

import { CHAT_COLOURS } from "./ChatWidget";

export interface ChatMessage {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  createdAt: string; // ISO timestamp
}

// Very small, safe URL-to-link converter — avoids pulling in a full
// markdown renderer for what is currently plain-text chat output.
function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 opacity-90 hover:opacity-100"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[85%] px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap"
        style={{
          borderRadius: CHAT_COLOURS.radius,
          ...(isUser
            ? {
                background: CHAT_COLOURS.primary,
                color: "#fff",
                borderTopRightRadius: 6,
              }
            : {
                background: "#fff",
                color: "#374151",
                borderTopLeftRadius: 6,
              }),
        }}
      >
        {linkify(message.content)}
      </div>
    </div>
  );
}
