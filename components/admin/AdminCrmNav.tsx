"use client";

// ═════════════════════════════════════════════════════════════════
// PHASE S6-F2 — CANONICAL CRM NAVIGATION HEADER
//
// A small, purely-presentational nav bar linking the EXISTING canonical
// admin surfaces (Conversations, Admissions, Demo attendance, Portal
// access, Staff). It never authorizes anything — that stays server-side
// (requireAdminAuth / canModifyAdmission). It simply gives a counsellor
// one consistent way to move between the daily-work surfaces.
//
// `current` is the route path of the page hosting it ("/admin/admissions"
// etc.) so the matching link is visually highlighted.
// ═════════════════════════════════════════════════════════════════

import Link from "next/link";

const LINKS: Array<{ href: string; label: string }> = [
  { href: "/admin/conversations", label: "Conversations" },
  { href: "/admin/admissions", label: "Admissions" },
  { href: "/admin/demo-attendance", label: "Demo attendance" },
  { href: "/admin/portal-access", label: "Portal access" },
  { href: "/admin/staff", label: "Staff" },
];

export function AdminCrmNav({ current }: { current?: string }) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-1">
      {LINKS.map((link) => {
        const active = link.href === current;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              active
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
