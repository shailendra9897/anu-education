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
  MessageRole,
} from "@prisma/client";
import type { Conversation } from "@prisma/client";
import prisma from "@/lib/prisma";
import { buildPrompt } from "@/lib/chat/prompt.service";
import { generateChatCompletion, type ChatMessage } from "@/lib/ai/client";
import { ANU_FACTS } from "@/lib/ai/systemPrompt";
import { routeIntent } from "@/lib/chat/intent-router";
import {
  isAwaitingDemoConfirmation,
  getPendingDemoCourse,
} from "@/lib/chat/memory.service";
import { processDemoRequest } from "@/lib/demo/demo.booking";
import { captureDemoStudentDetails } from "@/lib/demo/demo.details.service";
import { getMissingDemoDetails } from "@/lib/demo/demo.details";
import { getDemoBookingByConversation } from "@/lib/demo/demo.service";
import { extractStudentDetails } from "@/lib/demo/student-details.extractor";
import { createPortalAccessRequest } from "@/lib/portal/portal.access.service";
import {
  extractLead,
  persistLeadContext,
  extractCoachingLead,
  buildCoachingContextString,
  type LeadExtractionResult,
  type CoachingLeadContext,
} from "@/lib/lead/leadExtractor";

const SOURCE_PAGE_WHATSAPP = "/whatsapp";

// ── SHARED PIPELINE HELPERS (mirror of chat route internals) ─────

async function saveMessage(
  conversationId: string,
  role: MessageRole,
  content: string
) {
  return prisma.message.create({
    data: { conversationId, role, content },
  });
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

  return messages.reverse().map((m) => ({
    role: m.role === MessageRole.ASSISTANT ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));
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

  // ── Extract & update student identity details ────────────────
  const extractedStudentDetails = await extractStudentDetails(userMessage);
  if (
    extractedStudentDetails.name ||
    extractedStudentDetails.phone ||
    extractedStudentDetails.email
  ) {
    current = await prisma.conversation.update({
      where: { id: current.id },
      data: {
        ...(extractedStudentDetails.name ? { name: extractedStudentDetails.name } : {}),
        ...(extractedStudentDetails.phone ? { phone: extractedStudentDetails.phone } : {}),
        ...(extractedStudentDetails.email ? { email: extractedStudentDetails.email } : {}),
      },
    });
  }

  // ── Demo state + deterministic intent routing ─────────────────
  const awaitingDemoConfirmation =
    await isAwaitingDemoConfirmation(current.id);
  const existingDemoBooking =
    await getDemoBookingByConversation(current.id);
  const pendingDemoCourse = awaitingDemoConfirmation
    ? await getPendingDemoCourse(current.id)
    : null;
  const intentRoute = routeIntent({
    message: userMessage,
    awaitingDemoConfirmation,
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
  if (
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
      awaitingConfirmation: awaitingDemoConfirmation,
      pendingCourse: pendingDemoCourse,
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

    if (
      coachingExtraction.name ||
      coachingExtraction.phone ||
      coachingExtraction.email
    ) {
      current = await prisma.conversation.update({
        where: { id: current.id },
        data: {
          ...(coachingExtraction.name ? { name: coachingExtraction.name } : {}),
          ...(coachingExtraction.phone ? { phone: coachingExtraction.phone } : {}),
          ...(coachingExtraction.email ? { email: coachingExtraction.email } : {}),
        },
      });
    }

    coachingContextStr = buildCoachingContextString(coachingExtraction);
  }

  // ── History (fetched AFTER saving USER msg — mirrors web) ─────
  const historyMessages = await getRecentMessages(current.id);

  // ── Prompt assembly (system + memory + knowledge [+coaching]) ─
  const prompt = await buildPrompt({
    conversationId: current.id,
    userMessage,
    sourcePage: SOURCE_PAGE_WHATSAPP,
  });

  const systemContent = [
    prompt.system,
    prompt.memory ? `\nContext / Memory:\n${prompt.memory}` : "",
    prompt.knowledge ? `\nKnowledge Context:\n${prompt.knowledge}` : "",
    coachingContextStr ? `\n${coachingContextStr}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const fullMessages: ChatMessage[] = [
    { role: "system", content: systemContent },
    ...historyMessages,
  ];

  // ── Groq generation ────────────────────────────────────────────
  console.log("[WhatsApp Webhook] AI processing", {
    conversationId: current.id,
    intent: intentRoute.intent,
  });
  const aiResponse = await generateChatCompletion({ messages: fullMessages });

  // ── Persist assistant reply BEFORE sending to WhatsApp ────────
  await saveMessage(current.id, MessageRole.ASSISTANT, aiResponse.content);

  return aiResponse.content;
}
