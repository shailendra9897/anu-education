"use client";

// FILE: components/ai/ChatWindow.tsx
//
// Renders the full chat panel: header (avatar, title, online status,
// close button), a welcome message with capability bullets, quick
// action pills, the scrollable message list, and the input box.
//
// Design: Primary #0F1B4C · Accent #22C55E · radius 20px · soft shadow
// matching the ASCII mockup provided:
//
//   ┌─────────────────────────────────────┐
//   │ 🤖 ANU AI            🟢 Online    ✕ │
//   │ Your Study Abroad Assistant          │
//   ├─────────────────────────────────────┤
//   │ 👋 Welcome message + bullets         │
//   │ [🇩🇪 Germany] [📘 IELTS] [🎓 Demo]   │
//   ├─────────────────────────────────────┤
//   │ (message history)                    │
//   ├─────────────────────────────────────┤
//   │ Ask about visas, IELTS, Germany.. ➤ │
//   └─────────────────────────────────────┘
//
// Talks to app/api/chat/route.ts. Keeps its own message state —
// ChatWidget only owns open/close and passes static configuration.

import { useState, useRef, useEffect, useCallback } from "react";
import { CHAT_COLOURS, type QuickAction } from "./ChatWidget";
import Message, { type ChatMessage } from "./Message";
import TypingIndicator from "./TypingIndicator";

// ── PROPS ─────────────────────────────────────────────────────────
interface WelcomeBullet {
  emoji: string;
  text:  string;
}

interface ChatWindowProps {
  onClose:          () => void;
  title:            string;
  subtitle:         string;
  welcomeMessage:   string;
  welcomeBullets:   WelcomeBullet[];
  quickActions:     QuickAction[];
  inputPlaceholder: string;
}

export default function ChatWindow({
  onClose,
  title,
  subtitle,
  welcomeMessage,
  welcomeBullets,
  quickActions,
  inputPlaceholder,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // hides welcome once chat begins

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message / typing state change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Send a message to the API ────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setHasStarted(true);
    setInput("");

    const userMsg: ChatMessage = {
      id:   crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id:   crypto.randomUUID(),
        role: "assistant",
        content: data.reply ?? "Sorry, I couldn't process that. Please try again or WhatsApp us for help.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, something went wrong on my end. You can reach a counsellor directly on WhatsApp: https://wa.me/919428186817",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  // ── Quick action handler ──────────────────────────────────────────
  const handleQuickAction = (action: QuickAction) => {
    if (action.type === "link") {
      window.open(action.value, "_blank", "noopener,noreferrer");
      return;
    }
    sendMessage(action.value);
  };

  // ── Form submit ────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex w-[92vw] max-w-sm flex-col overflow-hidden shadow-2xl sm:w-96"
      style={{
        borderRadius: CHAT_COLOURS.radius,
        maxHeight: "min(640px, calc(100dvh - 96px))",
        background: "#fff",
      }}
      role="dialog"
      aria-label={`${title} chat window`}
    >
      {/* ── HEADER ── */}
      <div
        className="flex items-start justify-between px-5 py-4 text-white flex-shrink-0"
        style={{ background: CHAT_COLOURS.primary }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg"
            style={{ background: "rgba(255,255,255,0.12)" }}
            aria-hidden="true"
          >
            🤖
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold">{title}</span>
            <span className="text-xs text-white/70">{subtitle}</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium">
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ background: CHAT_COLOURS.accent }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ background: CHAT_COLOURS.accent }}
                />
              </span>
              <span style={{ color: CHAT_COLOURS.accent }}>Online</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ background: "#F7F8FC" }}
      >
        {/* Welcome message — shown until the first message is sent */}
        {!hasStarted && (
          <div className="mb-4">
            <div
              className="max-w-[85%] px-4 py-3 text-sm text-gray-700 shadow-sm"
              style={{
                background: "#fff",
                borderRadius: CHAT_COLOURS.radius,
                borderTopLeftRadius: 6,
              }}
            >
              <p className="mb-2 font-semibold text-gray-900">👋 {welcomeMessage}</p>
              <ul className="space-y-1">
                {welcomeBullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <span aria-hidden="true">{b.emoji}</span>
                    <span>{b.text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-400">Ask me anything!</p>
            </div>
          </div>
        )}

        {/* Message history */}
        <div className="space-y-3">
          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div
        className="flex flex-wrap gap-2 border-t px-4 py-3 flex-shrink-0"
        style={{ borderColor: "#EEF0F6", background: "#fff" }}
      >
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleQuickAction(action)}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: "#E2E5F0", color: CHAT_COLOURS.primary }}
          >
            <span aria-hidden="true">{action.emoji}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* ── INPUT ── */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t px-4 py-3 flex-shrink-0"
        style={{ borderColor: "#EEF0F6", background: "#fff" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputPlaceholder}
          aria-label="Type your message"
          className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Send message"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-30"
          style={{ background: CHAT_COLOURS.accent }}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
