// FILE: app/api/webhook/chatwoot/[secret]/route.ts
//
// ─────────────────────────────────────────────────────────────────
// CHATWOOT WEBHOOK ENDPOINT (Task 6B — OBSERVE-ONLY)
//
//   POST /api/webhook/chatwoot/<secret>
//
// The secret lives in the URL path and is compared timing-safely
// against CHATWOOT_WEBHOOK_SECRET inside the shared handler
// (lib/chatwoot/handler.ts). All business rules live there and in
// lib/chatwoot/payload.ts; this file is a thin Next.js adapter.
//
// HTTP contract:
//   200 {ok:true,  outcome:"observed"} → genuine inbound student msg
//   200 {ok:true,  outcome:"ignored"}  → anything classifier rejects
//                                        (outgoing, notes, other
//                                        events, foreign inbox…)
//   400 {ok:false}                     → malformed/unreadable body
//   403 {ok:false}                     → bad or absent path secret
//   405                                → GET (POST-only webhook; no
//                                        Meta-style GET verification)
//
// OBSERVE-ONLY: no DB writes, no AI/Groq calls, no Chatwoot API
// calls, no WhatsApp sends in this phase.
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

import { handleChatwootWebhookPost } from "@/lib/chatwoot/handler";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { secret?: string };
}

export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  return handleChatwootWebhookPost(req, context.params?.secret);
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { ok: false },
    { status: 405, headers: { Allow: "POST" } }
  );
}
