// FILE: app/api/webhook/evolution/[secret]/route.ts
//
// ─────────────────────────────────────────────────────────────────
// EVOLUTION INBOUND WEBHOOK ENDPOINT
//
//   POST /api/webhook/evolution/<secret>
//
// AUTHENTICATION (fail-closed, never logs secrets):
//   • If EVOLUTION_WEBHOOK_SECRET is configured, <secret> is compared
//     timing-safely against it (see lib/whatsapp/evolution.handler.ts).
//   • If it is NOT configured but EVOLUTION_API_KEY is present, the
//     Evolution-native `apikey` request header is compared instead, and
//     the path secret is ignored. The base sibling route (without a
//     secret segment) also works in that mode.
//   • Neither configured → 403, loud.
//
// HTTP contract:
//   200 {ok:true, outcome:"replied"}          → genuine student msg + AI reply sent
//   200 {ok:true, outcome:"duplicate"}        → same Evolution message id re-delivered
//   200 {ok:true, outcome:"ignored"}          → unsupported/noise (group, self,
//                                                non-text, empty, …, handled
//                                                elsewhere)
//   200 {ok:true, outcome:"ai_skipped_assigned"|"ai_skipped_handed_off"}
//                                               → staff-owned thread; inbound saved, no AI
//   200 {ok:true, outcome:"reply_failed"}      → AI ran, Evolution send failed (claim kept)
//   400 {ok:false}                            → malformed/unreadable body
//   403 {ok:false}                            → bad/absent path secret OR unconfigured
//   405                                        → GET (POST-only webhook; no Meta-style
//                                                 verification handshake)
//   429 {ok:false, outcome:"rate_limited"}    → shared AI rate limiter; claim released
//   500 {ok:false}                            → genuine pre-reply failure (claim released)
//
// All business rules live in lib/whatsapp/evolution.handler.ts and
// lib/whatsapp/evolution.payload.ts; this file is a thin Next.js
// adapter.
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

import {
  handleEvolutionWebhookPost,
  type EvolutionBridgeDeps,
} from "@/lib/whatsapp/evolution.handler";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { secret?: string };
}

export async function POST(
  req: NextRequest,
  context: RouteContext,
  bridgeDeps?: EvolutionBridgeDeps
): Promise<NextResponse> {
  return handleEvolutionWebhookPost(req, context.params?.secret, bridgeDeps);
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { ok: false },
    { status: 405, headers: { Allow: "POST" } }
  );
}