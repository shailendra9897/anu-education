"use client";

// FILE: components/ai/ChatWidget.tsx
//
// UPDATED vs submitted version:
//   ✅ Floating trigger redesigned as a two-line pill button matching
//      the spec: "💬 ANU AI" (bold) + "🟢 Ask AI Anything" (subtext
//      with a pulsing green online dot) — not just a single emoji circle
//
//   ⚠️ POSITIONING FIX: components/ClientWrapper.tsx renders a
//      separate LeadModal floating button at the exact same corner
//      (fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-[9999]).
//      This component's trigger is positioned to STACK ABOVE it
//      (bottom-24 sm:bottom-28) with matching right-edge alignment,
//      and sits at a lower z-index (z-[9990] vs LeadModal's z-[9999])
//      so LeadModal's full-screen form correctly takes over the
//      screen if opened while this chat is also open. Original label
//      also said "Free Guidance" — same wording as LeadModal's
//      button — renamed to "Ask AI Anything" so the two floating
//      actions read as clearly distinct, not duplicated.
//
//   ✅ Colours moved to shared constants (CHAT_COLOURS) so ChatWidget
//      and ChatWindow never drift out of sync on brand colour
//   ✅ Passes structured config to ChatWindow: title, subtitle, quick
//      actions list, and contact links — ChatWindow stays "dumb" and
//      reusable, ChatWidget owns the ANU-specific configuration
//   ✅ Escape key closes the widget (accessibility)
//   ✅ aria-label on trigger button for screen readers
//   ✅ Trigger button hides with a fade/scale transition instead of
//      an abrupt unmount — feels less jarring on open/close

import { useState, useEffect, useCallback } from "react";
import ChatWindow from "./ChatWindow";

// ── SHARED BRAND CONSTANTS ─────────────────────────────────────────
// Exported so ChatWindow, Message, and TypingIndicator all reference
// the same values — change the brand colour once, everywhere updates.
export const CHAT_COLOURS = {
  primary:   "#0F1B4C",
  accent:    "#22C55E",
  radius:    "20px",
};

// ── QUICK ACTIONS CONFIG ───────────────────────────────────────────
// Centralised here (not in ChatWindow) since these are ANU-specific
// business decisions, not generic chat-UI behaviour.
export interface QuickAction {
  id:    string;
  label: string;
  emoji: string;
  // "prompt" sends this text into the chat as if the user typed it.
  // "link" opens an external URL instead (e.g. WhatsApp, enrolment).
  type:  "prompt" | "link";
  value: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "germany", label: "Germany", emoji: "🇩🇪", type: "prompt", value: "Tell me about studying in Germany" },
  { id: "ielts",   label: "IELTS",   emoji: "📘", type: "prompt", value: "Tell me about IELTS coaching" },
  { id: "german",  label: "German",  emoji: "🇩🇪", type: "prompt", value: "Tell me about German language classes" },
  { id: "demo",    label: "Demo",    emoji: "🎓", type: "link",   value: "https://study.anuedu.in/register" },
  { id: "whatsapp",label: "WhatsApp",emoji: "💬", type: "link",   value: "https://wa.me/919428186817?text=Hi%2C%20I%20have%20a%20question%20for%20ANU%20Education" },
];

const WELCOME_BULLETS = [
  { emoji: "🇩🇪", text: "Study in Germany" },
  { emoji: "🇬🇧", text: "Study in UK" },
  { emoji: "🇨🇦", text: "Study in Canada" },
  { emoji: "📘", text: "IELTS & PTE" },
  { emoji: "🇩🇪", text: "German Language" },
  { emoji: "🎓", text: "Free Demo Classes" },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Escape key closes the widget
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      {/* ── CHAT PANEL ── */}
      {open && (
        <ChatWindow
          onClose={close}
          title="ANU AI"
          subtitle="Your Study Abroad Assistant"
          welcomeMessage="Welcome to ANU Education! I'm your AI counsellor. I can instantly help you with:"
          welcomeBullets={WELCOME_BULLETS}
          quickActions={QUICK_ACTIONS}
          inputPlaceholder="Ask about visas, IELTS, Germany..."
        />
      )}

      {/* ── FLOATING TRIGGER — two-line pill button ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open ANU AI chat assistant"
        aria-expanded={open}
        className={`fixed bottom-24 right-5 z-[9990] flex items-center gap-3 pl-4 pr-5 py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl sm:bottom-28 sm:right-8 ${
          open ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
        }`}
        style={{
          background: CHAT_COLOURS.primary,
          borderRadius: 9999,
        }}
      >
        {/* Robot icon in a soft circle */}
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg"
          style={{ background: "rgba(255,255,255,0.12)" }}
          aria-hidden="true"
        >
          🤖
        </span>

        {/* Two-line label */}
        <span className="flex flex-col items-start leading-tight">
          <span className="text-sm font-bold">💬 ANU AI</span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-white/80">
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
            Ask AI Anything
          </span>
        </span>
      </button>
    </>
  );
}
