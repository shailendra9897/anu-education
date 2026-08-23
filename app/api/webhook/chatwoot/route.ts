// FILE: app/api/webhook/chatwoot/route.ts
//
// ─────────────────────────────────────────────────────────────────
// CHATWOOT WEBHOOK — BASE PATH (Task 6B, observe-only)
//
// The production endpoint carries its secret as a URL path segment:
//
//   https://www.anuedu.in/api/webhook/chatwoot/<secret>
//
// Next.js App Router serves that URL from ./[secret]/route.ts, which
// delegates to the shared handler in lib/chatwoot/handler.ts. This
// sibling controller only covers requests WITHOUT a secret segment:
//
//   POST /api/webhook/chatwoot        → 403 (missing secret in path;
//                                       identical to a wrong secret —
//                                       fail closed, no echo)
//   GET  /api/webhook/chatwoot[/...]  → 405 (Chatwoot webhooks are
//                                       POST-only; deliberately NO
//                                       Meta-style verification
//                                       handshake exists here)
//
// OBSERVE-ONLY: this phase never touches the database, the AI
// pipeline, the Chatwoot API or WhatsApp sending.
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest): Promise<NextResponse> {
  console.warn("[Chatwoot Webhook] rejected", {
    reason: "missing_secret_segment",
  });
  return NextResponse.json({ ok: false }, { status: 403 });
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { ok: false },
    { status: 405, headers: { Allow: "POST" } }
  );
}
