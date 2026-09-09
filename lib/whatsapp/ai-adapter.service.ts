// FILE: lib/whatsapp/ai-adapter.service.ts
//
// ─────────────────────────────────────────────────────────────────
// PHASE 5 — WHATSAPP → EXISTING ANU AI ENGINE ADAPTER
//
// Translates an inbound WhatsApp text message into the SAME AI
// processing pipeline used by the website chat (app/api/chat/route.ts)
// and returns the reply text. The website route is intentionally NOT
// modified; this adapter calls the identical underlying services in
// the identical order:
//
//   extractStudentDetails        → conversation identity capture
//   memory.service               → demo confirmation state
//   intent-router                → DEMO / COACHING_LEAD /
//                                  LEAD_QUALIFICATION / HUMAN_HANDOFF
//                                  / GENERAL routing
//   demo.* services              → free demo class flow (booking,
//                                  details, portal access)
//   leadExtractor                → study-abroad + coaching lead
//                                  qualification (IELTS/PTE/German/
//                                  Spoken English etc.)
//   prompt.service buildPrompt   → system prompt + knowledge + memory
//   ai/client generateChatCompletion → Groq response
//
// DELIBERATE MIRROR: the orchestration below duplicates the *order*
// of app/api/chat/route.ts step-for-step (user message saved before
// handoff check, history fetched after saving so the current message
// is included, coaching context injected into the system content…).
// If the website pipeline changes order meaningfully, update both.
// The engines themselves are shared — nothing AI-related is
// re-implemented here.
//
// Runs only inside Next.js (imports use "@/…" path aliases).
// ─────────────────────────────────────────────────────────────────

import {
  ConversationStatus,
  HandoffTrigger,
  LeadIdentitySource,
  MessageRole,
} from "@prisma/client";
import type { Conversation } from "@prisma/client";
import prisma from "@/lib/prisma";
import { buildPrompt } from "@/lib/chat/prompt.service";
import { generateChatCompletion, type ChatMessage } from "@/lib/ai/client";
import { ANU_FACTS } from "@/lib/ai/systemPrompt";
import { routeIntent } from "@/lib/chat/intent-router";
import { ensureLeadLinkedToConversation } from "@/lib/lead/lead.identity.service";
import {
  isAwaitingDemoConfirmation,
  getPendingDemoCourse,
} from "@/lib/chat/memory.service";
import { processDemoRequest } from "@/lib/demo/demo.booking";
import {
  evaluateDemoOpportunity,
  detectPendingDemoOffer,
  buildDemoOfferContextString,
  shouldOfferFreeDemoNow,
  getDemoFunnelStage,
} from "@/lib/demo/demo.offer";
import {
  evaluateDemoFollowUp,
  buildPostDemoContextString,
  describeCounsellorAction,
} from "@/lib/demo/demo.followup";
import {
  evaluateCounsellorPriority,
  buildCounsellorContextString,
} from "@/lib/lead/counsellor.priority";
import {
  mapCounsellorPriorityToAction,
  shouldTrackCounsellorAction,
  shouldEmitActionEvent,
  parseActionEventContent,
  buildActionEventContent,
  buildActionReason,
  COUNSELLOR_ACTION_PREFIX,
} from "@/lib/lead/counsellor.action";
import { captureDemoStudentDetails } from "@/lib/demo/demo.details.service";
import { getMissingDemoDetails } from "@/lib/demo/demo.details";
import { getDemoBookingByConversation } from "@/lib/demo/demo.service";
import { extractStudentDetails } from "@/lib/demo/student-details.extractor";
import { createPortalAccessRequest } from "@/lib/portal/portal.access.service";
import { applyAiAdmissionWiring } from "@/lib/admission/admission.wiring";
import {
  extractLead,
  persistLeadContext,
  extractCoachingLead,
  buildCoachingContextString,
  type LeadExtractionResult,
  type CoachingLeadContext,
} from "@/lib/lead/leadExtractor";

const SOURCE_PAGE_WHATSAPP = "/whatsapp";

// Phase 1 — WhatsApp completion ceiling. WhatsApp replies are short; a
// 2000-token ceiling lets a single burst consume most of the Groq TPM
// budget. Configurable via WHATSAPP_MAX_TOKENS (default 500). The
// website /api/chat route keeps its own (wider) ceiling — this caller
// explicitly passes the lower limit into the shared client.
const WHATSAPP_MAX_TOKENS = (() => {
  const raw = Number(process.env.WHATSAPP_MAX_TOKENS ?? 500);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 500;
})();

// Phase 1 — WhatsApp knowledge context budget. The website chat keeps
// the wider default (6 docs / 10,000 chars); WhatsApp asks for less so
// a normal student message stays well under Groq's 8000 TPM.
const WHATSAPP_KNOWLEDGE_DOCUMENTS = 3;
const WHATSAPP_KNOWLEDGE_CHARACTERS = 3500;

// ── SHARED PIPELINE HELPERS (mirror of chat route internals) ─────

export type StudentIdentityUpdate = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
};

/**
 * allowedConversationIdentityUpdates — which conversation-row fields may
 * be populated from a message-text extraction.
 *
 * SECURITY (Phase 1): Conversation.phone is the ROUTED WhatsApp sender
 * phone and is the only value allowed to establish or replace it. A phone
 * number found inside message text ("call me on 98…", a forwarded
 * number…) is NEVER written to Conversation.phone — writing it would
 * silently re-point the conversation identity and merge real,
 * unrelated conversations into one (conversation-isolation leak). The
 * extracted phone continues to flow only as supplementary,
 * conversation-scoped lead/demo detail (LeadContext / DemoBooking),
 * which is safe.
 */
export function allowedConversationIdentityUpdates(
  input: StudentIdentityUpdate
): { name?: string; email?: string } {
  const update: { name?: string; email?: string } = {};
  if (typeof input.name === "string" && input.name.trim()) {
    update.name = input.name.trim();
  }
  if (typeof input.email === "string" && input.email.trim()) {
    update.email = input.email.trim();
  }
  return update;
}

async function saveMessage(
  conversationId: string,
  role: MessageRole,
  content: string
) {
  return prisma.message.create({
    data: { conversationId, role, content },
  });
}

/**
 * assertNonEmptyAssistantReply — EMPTY-REPLY GUARD.
 *
 * A stripped thinking response (or any other reason) that yields
 * empty/whitespace-only content is a GENERATION FAILURE, not a successful
 * assistant reply. Returns the trimmed content when non-empty, otherwise
 * throws BEFORE the ASSISTANT message can be persisted — so no empty row
 * is written, Evolution is never called with empty text, and the transport
 * releases the idempotency claim and allows a clean retry.
 */
export function assertNonEmptyAssistantReply(
  content: string,
  conversationId: string
): string {
  if (!content || !content.trim()) {
    throw new Error(
      `[WhatsApp AI] empty assistant response after generation (conversation ${conversationId})`
    );
  }
  return content;
}

async function getRecentMessages(
  conversationId: string,
  limit = 10
): Promise<ChatMessage[]> {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { role: true, content: true },
  });

  return messages
    // Phase 7: NEVER fold system/business messages (e.g. the first-contact
    // acknowledgement) into the AI context as if they were the student's
    // message. SYSTEM is audit-only.
    .filter((m) => m.role !== MessageRole.SYSTEM)
    // Chronological order — the SQL fetch is `desc`, and buildPrompt in
    // prompt.service.ts prepends this block to the system prompt. A
    // descending list would read newest→oldest, confusing the model and
    // making the current question look like a reply to itself.
    .reverse()
    .map((m) => ({
      role: m.role === MessageRole.ASSISTANT ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));
}

// Phase 7 stale-demo guard: a PENDING/CONFIRMED demo booking from a
// PREVIOUS turn must never hijack an unrelated new message. It should
// only keep driving the demo flow when the student is actually
// continuing it — either they expressed a demo intent, or they are
// supplying one of the still-missing contact details (name/phone/email)
// for the in-progress booking.
export type DemoBookingLike = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: string | null;
};

export type ExtractedStudentDetailsLike = {
  name?: string;
  phone?: string;
  email?: string;
};

/**
 * shouldContinueExistingDemoFlow — Phase 7 regression predicate.
 *
 * Given the routed intent for the CURRENT message and the state of any
 * EXISTING demo booking on this conversation, decides whether the
 * pipeline should keep driving the old demo flow (true) or fall through
 * to normal intent routing / AI (false).
 *
 * It returns true ONLY when the student is genuinely still in the demo
 * flow:
 *   • the current message routed to DEMO intent (explicit demo request,
 *     or a confirmation like "yes"/"book it" while awaiting), OR
 *   • the current message supplies one of the contact details that the
 *     in-progress booking is still missing (name/phone/email) — the
 *     detail-collection turn.
 *
 * An unrelated enquiry against an old PENDING/CONFIRMED booking
 * (e.g. "I want information about IELTS" while a German demo booking is
 * still PENDING) therefore returns FALSE — it must be routed normally,
 * NEVER answered with the abandoned demo-completion text.
 */
export function shouldContinueExistingDemoFlow(input: {
  intentRoute: { intent: string };
  existingBooking: DemoBookingLike | null;
  extractedStudentDetails: ExtractedStudentDetailsLike;
}): boolean {
  const { intentRoute, existingBooking, extractedStudentDetails } = input;

  if (intentRoute.intent === "DEMO") return true;

  if (!existingBooking) return false;

  return (
    (!existingBooking.name && Boolean(extractedStudentDetails.name)) ||
    (!existingBooking.phone && Boolean(extractedStudentDetails.phone)) ||
    (!existingBooking.email && Boolean(extractedStudentDetails.email))
  );
}

async function createHumanHandoff(
  conversationId: string,
  reason: string
): Promise<string> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: ConversationStatus.HANDED_OFF },
  });

  await prisma.handoffEvent.create({
    data: {
      conversationId,
      trigger: HandoffTrigger.EXPLICIT_HUMAN_REQUEST,
      triggerDetail: reason,
    },
  });

  return (
    `I’ll connect you with a human counsellor. ` +
    `The fastest way is WhatsApp: ${ANU_FACTS.whatsappLink}`
  );
}

function toLeadExtractionResult(
  conversation: Conversation,
  leadContext: {
    goal?: string | null;
    targetCountry?: string | null;
    targetCourse?: string | null;
    englishLevel?: string | null;
    budgetRange?: string | null;
    timeline?: string | null;
    intake?: string | null;
  } | null
): LeadExtractionResult {
  return {
    name: conversation.name ?? undefined,
    phone: conversation.phone ?? undefined,
    email: conversation.email ?? undefined,
    country: leadContext?.targetCountry ?? undefined,
    course: leadContext?.targetCourse ?? undefined,
    englishLevel: leadContext?.englishLevel ?? undefined,
    budget: leadContext?.budgetRange ?? undefined,
    timeline: leadContext?.timeline ?? undefined,
    intake: leadContext?.intake ?? undefined,
    goal: leadContext?.goal as LeadExtractionResult["goal"] | undefined,
  };
}

// ── PUBLIC ENTRY POINT ───────────────────────────────────────────

/**
 * runAnuAiPipelineForWhatsApp
 * ───────────────────────────
 * Processes an inbound WhatsApp text through the full existing ANU
 * AI pipeline and returns the assistant reply text. Saves BOTH the
 * USER and ASSISTANT messages into the shared Conversation/Message
 * store so website CRM, memory and WhatsApp share one source of
 * truth. Throws on failure — callers decide HTTP/retry semantics.
 */
export async function runAnuAiPipelineForWhatsApp(
  conversation: Conversation,
  userMessage: string
): Promise<string> {
  let current = conversation;

  // S2 — last-line-of-defense group guard. Primary protection lives in
  // payload classification + webhook dispatch, which never route a group
  // frame here. This throws instead of answering when a legacy group
  // conversation (e.g. one created before the guard shipped, whose
  // profile name carries Meta's "(GROUP)" marker) somehow reaches the AI
  // pipeline, so a shared-room transcript can never be turned into an AI
  // reply. Throwing (rather than returning a canned response) is
  // deliberate: the webhook would otherwise send that response back into
  // the group.
  if (conversation.name && /\(group\)/i.test(conversation.name.trim())) {
    throw new Error(
      `[group guard] refusing to run AI pipeline for group conversation ${conversation.id}`
    );
  }

  // ── Extract & update student identity details ────────────────
  const extractedStudentDetails = await extractStudentDetails(userMessage);
  // Phase 1 safety: only name/email may be written to the conversation row
  // from message text. Conversation.phone is the routed sender phone;
  // a phone found inside the message text must NEVER replace it.
  const identityUpdates = allowedConversationIdentityUpdates(
    extractedStudentDetails
  );
  if (identityUpdates.name || identityUpdates.email) {
    current = await prisma.conversation.update({
      where: { id: current.id },
      data: identityUpdates,
    });
  }

  // ── Canonical CRM identity (C1) ────────────────────────────────
  // WhatsApp conversations carry a phone from the very first inbound
  // (findOrCreateConversation already linked the Lead); re-running the
  // idempotent ensure keeps capture of ANY newly-extracted email/name
  // consistent with the Lead layer. Never changes conversation reuse.
  ({ conversation: current } = await ensureLeadLinkedToConversation({
    conversationId: current.id,
    knownConversation: current,
    identitySource: LeadIdentitySource.WHATSAPP,
  }));

  // ── Demo state + deterministic intent routing ─────────────────
  const awaitingDemoConfirmation =
    await isAwaitingDemoConfirmation(current.id);
  const existingDemoBooking =
    await getDemoBookingByConversation(current.id);
  const pendingDemoCourse = awaitingDemoConfirmation
    ? await getPendingDemoCourse(current.id)
    : null;

  // S5-A — FREE DEMO CONVERSION FOUNDATION: memory.service only
  // recognises its OWN strict booking-ask phrasing ("would you like me
  // to book…"). The AI may word a demo offer naturally ("Want me to
  // book your free German demo?"), which memory.service would miss. So
  // scan the last assistant message too; a subsequent bare "yes"/"sure"
  // /"okay" then still resolves a bare assent into the existing demo
  // booking flow with the right course.
  const recentForOffer = await getRecentMessages(current.id);
  const lastAssistantMessage = [...recentForOffer]
    .reverse()
    .find((m) => m.role === "assistant");
  const offerPendingState = lastAssistantMessage
    ? detectPendingDemoOffer(lastAssistantMessage.content)
    : { pending: false, course: null };
  const demoFlowActive =
    awaitingDemoConfirmation || offerPendingState.pending;
  const pendingCourse = pendingDemoCourse ?? offerPendingState.course;

  const intentRoute = routeIntent({
    message: userMessage,
    awaitingDemoConfirmation: demoFlowActive,
  });

  // ── Save inbound USER message (before branching, as on web) ───
  await saveMessage(current.id, MessageRole.USER, userMessage);

  let updatedDemoBooking = existingDemoBooking;
  if (existingDemoBooking) {
    await captureDemoStudentDetails({
      bookingId: existingDemoBooking.id,
      message: userMessage,
    });
    updatedDemoBooking = await getDemoBookingByConversation(current.id);
  }

  // ── HUMAN_HANDOFF — escalate, never answer with AI ────────────
  if (intentRoute.intent === "HUMAN_HANDOFF") {
    const handoffMessage = await createHumanHandoff(
      current.id,
      intentRoute.reason
    );
    await saveMessage(current.id, MessageRole.ASSISTANT, handoffMessage);
    return handoffMessage;
  }

  // ── Demo booking detail completion / confirmation ─────────────
  // Phase 7 stale-demo guard: only continue an EXISTING
  // PENDING/CONFIRMED demo booking when the student is genuinely
  // continuing that flow (expressed demo intent, or supplying one of
  // the still-missing contact details). An old demo booking must NEVER
  // hijack an unrelated new message (e.g. "I want information about
  // IELTS" while a German demo booking is still PENDING). In that case
  // the pipeline falls through to normal intent routing / AI.
  const continuingDemoFlow = shouldContinueExistingDemoFlow({
    intentRoute,
    existingBooking: updatedDemoBooking,
    extractedStudentDetails,
  });

  if (
    continuingDemoFlow &&
    updatedDemoBooking &&
    (updatedDemoBooking.status === "PENDING" ||
      updatedDemoBooking.status === "CONFIRMED")
  ) {
    const missingDetails = getMissingDemoDetails({
      name: updatedDemoBooking.name ?? undefined,
      phone: updatedDemoBooking.phone ?? undefined,
      email: updatedDemoBooking.email ?? undefined,
    });
    const hasMissingDetails =
      missingDetails.name || missingDetails.phone || missingDetails.email;

    if (hasMissingDetails) {
      const missing: string[] = [];
      if (missingDetails.name) missing.push("your name");
      if (missingDetails.phone) missing.push("your WhatsApp number");
      if (missingDetails.email) missing.push("your email address");
      const last = missing.pop();
      const detailMessage =
        missing.length > 0
          ? `To complete your demo booking and create your ANU Education portal access, please share ${missing.join(", ")} and ${last}.`
          : `To complete your demo booking and create your ANU Education portal access, please share ${last}.`;

      await saveMessage(current.id, MessageRole.ASSISTANT, detailMessage);
      return detailMessage;
    }

    // Existing demo + details complete → portal access + confirm.
    if (
      updatedDemoBooking.name &&
      updatedDemoBooking.phone &&
      updatedDemoBooking.email
    ) {
      await createPortalAccessRequest({
        conversationId: current.id,
        demoBookingId: updatedDemoBooking.id,
        leadId: current.leadId ?? undefined,
        studentName: updatedDemoBooking.name,
        phone: updatedDemoBooking.phone,
        email: updatedDemoBooking.email,
        course: updatedDemoBooking.course ?? undefined,
      });

      const completionMessage =
        `Perfect, ${updatedDemoBooking.name}! Your free ` +
        `${updatedDemoBooking.course ?? ""} demo booking is confirmed. ` +
        `Your portal access request has also been created. ` +
        `You will receive your portal activation details by email.`;

      await saveMessage(current.id, MessageRole.ASSISTANT, completionMessage);
      return completionMessage;
    }
  }

  // ── New demo request flow ─────────────────────────────────────
  if (intentRoute.intent === "DEMO") {
    const demoResult = await processDemoRequest({
      conversationId: current.id,
      message: userMessage,
      name: current.name ?? undefined,
      phone: current.phone ?? undefined,
      email: current.email ?? undefined,
      leadId: current.leadId ?? undefined,
      awaitingConfirmation: demoFlowActive,
      pendingCourse: pendingCourse,
    });

    if (demoResult.needsConfirmation || demoResult.success) {
      await saveMessage(current.id, MessageRole.ASSISTANT, demoResult.message);
      return demoResult.message;
    }
    // Neither → fall through to AI (mirrors website behavior).
  }

  // ── Study-abroad lead qualification ───────────────────────────
  if (intentRoute.intent === "LEAD_QUALIFICATION") {
    const existingLeadContext = await prisma.leadContext.findUnique({
      where: { conversationId: current.id },
      select: {
        goal: true,
        targetCountry: true,
        targetCourse: true,
        englishLevel: true,
        budgetRange: true,
        timeline: true,
        intake: true,
      },
    });
    const leadExtraction = extractLead(
      userMessage,
      toLeadExtractionResult(current, existingLeadContext)
    );
    await persistLeadContext(current.id, leadExtraction);
  }

  // ── Coaching lead qualification (ANU's primary business) ──────
  let coachingContextStr: string | null = null;
  if (intentRoute.intent === "COACHING_LEAD") {
    const existingLeadContext = await prisma.leadContext.findUnique({
      where: { conversationId: current.id },
      select: {
        goal: true,
        targetCountry: true,
        targetCourse: true,
        englishLevel: true,
        budgetRange: true,
        timeline: true,
        intake: true,
      },
    });

    const previousCoaching: CoachingLeadContext = {
      course: existingLeadContext?.targetCourse ?? undefined,
      destination: existingLeadContext?.targetCountry ?? undefined,
      currentLevel: existingLeadContext?.englishLevel ?? undefined,
      budget: existingLeadContext?.budgetRange ?? undefined,
      intake: existingLeadContext?.intake ?? undefined,
      goal: existingLeadContext?.goal ?? undefined,
      name: current.name ?? undefined,
      phone: current.phone ?? undefined,
      email: current.email ?? undefined,
    };

    const coachingExtraction = extractCoachingLead(userMessage, previousCoaching);

    const leadForPersist: LeadExtractionResult = {
      name: coachingExtraction.name,
      phone: coachingExtraction.phone,
      email: coachingExtraction.email,
      country: coachingExtraction.destination,
      course: coachingExtraction.course,
      intake: coachingExtraction.intake,
      budget: coachingExtraction.budget,
      englishLevel:
        coachingExtraction.currentLevel ?? coachingExtraction.targetScore,
      timeline: coachingExtraction.targetExamDate,
      goal: coachingExtraction.goal as LeadExtractionResult["goal"],
    };
    await persistLeadContext(current.id, leadForPersist);

    if (coachingExtraction.name || coachingExtraction.email) {
      current = await prisma.conversation.update({
        where: { id: current.id },
        data: allowedConversationIdentityUpdates({
          name: coachingExtraction.name,
          phone: coachingExtraction.phone ?? null,
          email: coachingExtraction.email,
        }),
      });
    }

    // Canonical CRM identity may have gained name/phone/email here too.
    ({ conversation: current } = await ensureLeadLinkedToConversation({
      conversationId: current.id,
      knownConversation: current,
      identitySource: LeadIdentitySource.WHATSAPP,
    }));

    coachingContextStr = buildCoachingContextString(coachingExtraction);
  }

  // ── S5-A — FREE demo conversion nudge decision ────────────────
  // Deterministic gate: offer a FREE demo in THIS assistant reply only
  // for enrollment-adjacent coaching enquiries that aren't already in a
  // demo offer or booked. The AI produces the natural wording from the
  // context block below (never hardcoded text).
  const demoOpportunity = evaluateDemoOpportunity(userMessage);
  const demoOfferNudge = shouldOfferFreeDemoNow({
    intent: intentRoute.intent,
    course: demoOpportunity.course,
    existingBooking: existingDemoBooking,
    awaitingDemoConfirmation,
    offerPending: offerPendingState.pending,
  });
  const demoOfferContextStr =
    demoOfferNudge && demoOpportunity.course
      ? buildDemoOfferContextString(demoOpportunity.course)
      : null;

  // ── S5-B — FREE DEMO ATTENDANCE + POST-DEMO FOLLOW-UP ─────────
  // Deterministic post-demo conversion signal over the booking row.
  // Attendance is ONLY taken from the student's own words this turn — a
  // booking row never implies attendance. The S5-A demo nudge above and
  // this follow-up are mutually exclusive by construction: the nudge
  // only fires when there is NO booking; this only fires when there IS
  // one, and the DEMO/booking-confirmation branches return early above,
  // so a fresh "yes, book it" turn is never treated as post-demo.
  const demoFollowUp = evaluateDemoFollowUp({
    booking: updatedDemoBooking,
    currentMessageCourse: demoOpportunity.course,
    message: userMessage,
  });
  let postDemoContextStr: string | null = null;
  let postDemoIntent = "NONE";
  let counsellorAction: string | null = null;
  if (
    demoFollowUp.eligible &&
    demoFollowUp.course &&
    demoFollowUp.response.intent !== "NONE"
  ) {
    postDemoIntent = demoFollowUp.response.intent;
    postDemoContextStr = buildPostDemoContextString({
      course: demoFollowUp.course,
      batch: updatedDemoBooking?.preferredBatch ?? null,
      attendance: demoFollowUp.response.attendance,
      intent: demoFollowUp.response.intent,
    });
    counsellorAction = describeCounsellorAction({
      message: userMessage,
      response: demoFollowUp.response,
      course: demoFollowUp.course,
    });
    // Schema-free audit trail (SYSTEM rows are audit-only — getRecentMessages
    // filters them out of AI context). Records attendance + intent + the
    // eligibility reason without writing to the booking or creating a lead.
    await saveMessage(
      current.id,
      MessageRole.SYSTEM,
      `DEMO_FOLLOWUP [${demoFollowUp.response.attendance}/${demoFollowUp.response.intent}/${demoFollowUp.course}] ${demoFollowUp.reason}`
    );
  }

  // ── S5-C — ADMISSION INTENT + COUNSELLOR PRIORITY (derived state) ─
  // Pure deterministic classification on TOP of everything decided above:
  // which conversations need a human counsellor FIRST. It never writes a
  // score (Conversation.leadScore belongs to the assessment tool), never
  // texts a counsellor, never creates a handoff. It reuses the S5-A/B
  // stale-demo guard so an old booking never colours a new course enquiry,
  // and group/handoff remain excluded (defence-in-depth flags; the webhook
  // ownership gate + earlier branches already handle them).
  const funnelStage = getDemoFunnelStage({
    existingBooking: updatedDemoBooking,
    awaitingDemoConfirmation,
    offerPending: offerPendingState.pending,
  });
  const priorityDecision = evaluateCounsellorPriority({
    message: userMessage,
    course: demoOpportunity.course,
    booking: updatedDemoBooking,
    postDemo: demoFollowUp.response,
    humanHandoffRequested:
      (intentRoute.intent as string) === "HUMAN_HANDOFF",
    groupConversation: /\(group\)/i.test(conversation.name?.trim() ?? ""),
    // S6-D3 — the HUMAN-VERIFIED attendance fact on the booking (S6-D2-B).
    // Distinct from the student's own words this turn (postDemo.attendance):
    // this authoritative status only escalates the counsellor queue and
    // never auto-verifies payment, never confirms admission, and never
    // marks the student contacted.
    verifiedAttendance: updatedDemoBooking
      ? {
          course: updatedDemoBooking.course ?? null,
          status: updatedDemoBooking.status ?? null,
        }
      : null,
  });
  const counsellorContextStr = buildCounsellorContextString({
    priority: priorityDecision.priority,
    admissionIntent: priorityDecision.admissionIntent,
    course: priorityDecision.course,
    demoEligible: priorityDecision.demoEligible,
    attended: demoFollowUp.response.attendance === "ATTENDED",
  });
  if (priorityDecision.priority !== "NONE") {
    await saveMessage(
      current.id,
      MessageRole.SYSTEM,
      `COUNSELLOR_PRIORITY [${priorityDecision.admissionIntent}/${priorityDecision.priority}/${priorityDecision.course ?? "-"}] ${priorityDecision.action} :: ${priorityDecision.reason}`
    );
  }

  // ── S5-D/E — COUNSELLOR ACTION QUEUE FOUNDATION (transition-logged) ─
  // Turns the S5-C priority into the explicit action-queue state and
  // records it as an audit-only SYSTEM event AT MOST ONCE PER ESCALATION
  // LEVEL (NONE→FOLLOW_UP→PRIORITY_FOLLOW_UP→ADMISSION_ASSISTANCE).
  // Repeated same-level turns never duplicate the event; a downgrade
  // never writes one. The webhook ownership gate already skips the whole
  // adapter for ASSIGNED / HANDED_OFF / group threads — the gate below is
  // defence-in-depth mirroring that gate. Nothing here texts a counsellor,
  // creates a lead or a handoff, or touches the student; the SYSTEM row is
  // filtered out of the AI context (getRecentMessages) so it can never
  // reach the student, and the student-facing context is unchanged.
  //
  // IDEMPOTENCY (Phase S5-E): read-then-write remains BEST-EFFORT. The
  // current schema has no unique constraint we could use to make the
  // emission atomic (Message has no unique (conversationId, …), and the
  // wamid idempotency claim is per-message, not per-state), so two distinct
  // student messages processed concurrently could both read "no event yet"
  // and both emit the same first-level event. A transaction would not make
  // this atomic either (no constraint to serialize on), so we do NOT invent
  // a fake guarantee here. Hardening requires a schema decision — see the
  // S5-E report. Per-message duplicates are still prevented by the wamid
  // claim, and sequential turns behave exactly once per escalation level.
  const counsellorActionState = mapCounsellorPriorityToAction(
    priorityDecision.priority
  );
  let counsellorActionEmitted = false;
  if (
    shouldTrackCounsellorAction({
      priority: priorityDecision.priority,
      assignedCounsellorId: current.assignedCounsellorId,
      status: current.status,
    })
  ) {
    const lastActionEvent = await prisma.message.findFirst({
      where: {
        conversationId: current.id,
        role: MessageRole.SYSTEM,
        content: { startsWith: COUNSELLOR_ACTION_PREFIX },
      },
      orderBy: { createdAt: "desc" },
      select: { content: true },
    });
    const previousActionState = parseActionEventContent(
      lastActionEvent?.content ?? null
    )?.state;
    if (shouldEmitActionEvent(previousActionState, counsellorActionState)) {
      await saveMessage(
        current.id,
        MessageRole.SYSTEM,
        buildActionEventContent({
          state: counsellorActionState,
          reason: buildActionReason(priorityDecision),
          course: priorityDecision.course,
        })
      );
      counsellorActionEmitted = true;
    }
  }

  // ── S6-C — AI ADMISSION RECORD WIRING (canonical enrollment) ───
  // Bridges the S5-C admission-intent decision into the S6-B1
  // AdmissionEnrollment record so real WhatsApp enquiries populate the
  // S6-B2 counsellor workspace. WhatsApp only — the /api/chat route
  // does NOT run this in this phase.
  //
  // This is orchestration only: every mutation goes through
  // getOrCreateAdmissionEnrollment / recordAdmissionTransition (never a
  // direct AdmissionEvent write, never a manual state mutate). AI may
  // ONLY surface a new record to COUNSELLOR_CONTACT_PENDING; every other
  // state is unreachable for the AI actor by the lifecycle itself, and
  // "I paid / payment done" is never treated as payment/admission
  // verification. It reuses the S5-C classification (no new classifier)
  // and the S5-C resolved course (stale-demo guard inherited), and its
  // safety gates mirror the webhook ownership guard: GROUP / ASSIGNED /
  // HANDED_OFF / HUMAN_HANDOFF never reach a mutation.
  if (
    priorityDecision.admissionIntent !== "NONE" &&
    priorityDecision.admissionIntent !== "LOW" &&
    priorityDecision.course
  ) {
    const wiringResult = await applyAiAdmissionWiring({
      conversation: current,
      admissionIntent: priorityDecision.admissionIntent,
      course: priorityDecision.course,
      reason: priorityDecision.reason,
      humanHandoffRequested:
        (intentRoute.intent as string) === "HUMAN_HANDOFF",
      groupConversation: /\(group\)/i.test(current.name?.trim() ?? ""),
    });
    if (!wiringResult.skipped && wiringResult.enrollmentId) {
      await saveMessage(
        current.id,
        MessageRole.SYSTEM,
        `ADMISSION_RECORD [${
          wiringResult.created ? "CREATED" : "REUSED"
        }/${priorityDecision.course}/${priorityDecision.admissionIntent}] ${
          wiringResult.advancedToContactPending
            ? "CONTACT_PENDING"
            : "already_at_or_beyond_CONTACT_PENDING"
        } :: ${priorityDecision.reason}`
      );
    }
  }

  // ── History (fetched AFTER saving USER msg — mirrors web) ─────
  // Phase 1: this recent-message block is the SINGLE history source for
  // WhatsApp (chronological, incl. the just-saved current message).
  // `includeMemory: false` disables the memory-service replay of the same
  // rows, which was embedded into the system prompt a second time.
  const historyMessages = await getRecentMessages(current.id);

  // ── Prompt assembly (system + knowledge [+coaching]; no duplicated
  //    memory replay for WhatsApp) ────────────────────────────────
  const prompt = await buildPrompt({
    conversationId: current.id,
    userMessage,
    sourcePage: SOURCE_PAGE_WHATSAPP,
    includeMemory: false,
    knowledgeOptions: {
      maxDocuments: WHATSAPP_KNOWLEDGE_DOCUMENTS,
      maxCharacters: WHATSAPP_KNOWLEDGE_CHARACTERS,
    },
  });

  const systemContent = [
    prompt.system,
    prompt.memory ? `\nContext / Memory:\n${prompt.memory}` : "",
    prompt.knowledge ? `\nKnowledge Context:\n${prompt.knowledge}` : "",
    coachingContextStr ? `\n${coachingContextStr}` : "",
    demoOfferContextStr ? `\n${demoOfferContextStr}` : "",
    postDemoContextStr ? `\n${postDemoContextStr}` : "",
    counsellorContextStr ? `\n${counsellorContextStr}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const fullMessages: ChatMessage[] = [
    { role: "system", content: systemContent },
    ...historyMessages,
  ];

  // ── Groq generation ────────────────────────────────────────────
  // Phase 1: WhatsApp uses a lower completion ceiling (~500 tokens) so a
  // single reply can never eat most of the shared Groq TPM budget.
  console.log("[WhatsApp Webhook] AI processing", {
    conversationId: current.id,
    intent: intentRoute.intent,
    demoFunnelStage: funnelStage,
    demoOfferNudge: demoOfferNudge,
    postDemoIntent,
    counsellorAction: counsellorAction ?? null,
    admissionIntent: priorityDecision.admissionIntent,
    counsellorPriority: priorityDecision.priority,
    counsellorActionState,
    counsellorActionEmitted,
  });
  const aiResponse = await generateChatCompletion({
    messages: fullMessages,
    maxTokens: WHATSAPP_MAX_TOKENS,
    // Non-thinking mode for WhatsApp's short-reply workload. The default
    // GROQ_MODEL (qwen/qwen3.6-27b) is a thinking model: with a 500-token
    // completion ceiling it can spend the ENTIRE budget on its  thinking
    // block, leaving stripThinkingTags() with nothing but an empty string.
    // reasoning_effort="none" switches it to instruct mode — direct
    // answers only, so a valid user message is never silently answered
    // with an empty ASSISTANT reply.
    reasoningEffort: "none",
  });

  // EMPTY-REPLY GUARD: a stripped thinking response (or any other reason)
  // that yields empty/whitespace-only content is a GENERATION FAILURE, not
  // a successful assistant reply. Throw BEFORE persisting the ASSISTANT
  // message so no empty row is written, Evolution is never called with
  // empty text, and the transport releases the idempotency claim and
  // allows a clean retry.
  const content = assertNonEmptyAssistantReply(
    aiResponse.content,
    current.id
  );

  // ── Persist assistant reply BEFORE sending to WhatsApp ────────
  await saveMessage(current.id, MessageRole.ASSISTANT, content);

  return content;
}
