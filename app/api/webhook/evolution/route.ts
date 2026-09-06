// FILE: app/api/webhook/evolution/route.ts
//
// ─────────────────────────────────────────────────────────────────
// EVOLUTION WEBHOOK — BASE PATH
//
// The production endpoint may carry its secret in the URL path:
//
//   https://www.anuedu.in/api/webhook/evolution/<secret>
//
// Next.js App Router serves that URL from ./[secret]/route.ts, which
// delegates to the shared handler in lib/whatsapp/evolution.handler.ts.
// This sibling controller covers requests WITHOUT a secret segment:
//
//   POST /api/webhook/evolution          → routes to the shared handler
//     with secret = null. Auth fails 403 when EVOLUTION_WEBHOOK_SECRET
//     is configured; it SUCCEEDS when only the Evolution-native
//     `apikey` header (EVOLUTION_API_KEY) is in use.
//   GET  /api/webhook/evolution[/...]    → 405 (POST-only webhook; no
//     Meta-style verification handshake).
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

import { handleEvolutionWebhookPost } from "@/lib/whatsapp/evolution.handler";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleEvolutionWebhookPost(req, null);
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { ok: false },
    { status: 405, headers: { Allow: "POST" } }
  );
}