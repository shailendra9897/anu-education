// FILE: app/api/chat/route.ts
//
// ─────────────────────────────────────────────────────────────────
// Website chat endpoint — powered by Groq API
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import {
  ConversationSource,
  ConversationStatus,
  HandoffTrigger,
  MessageRole,
} from "@prisma/client";
import type { Conversation, Message } from "@prisma/client";
import { buildPrompt } from "@/lib/chat/prompt.service";
import prisma from "@/lib/prisma";
import { findOrCreateConversation } from "@/lib/chat/conversation.service";
import { generateChatCompletion, type ChatMessage } from "@/lib/ai/client";
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
import { ANU_FACTS } from "@/lib/ai/systemPrompt";
import { routeIntent } from "@/lib/chat/intent-router";
import {
  extractLead,
  persistLeadContext,
  type LeadExtractionResult,
} from "@/lib/lead/leadExtractor";
import {
  extractCoachingLead,
  buildCoachingContextString,
  type CoachingLeadContext,
} from "@/lib/lead/leadExtractor";

// ── REQUEST / RESPONSE CONTRACT ────────────────────────────────────

interface ChatRequestBody {
  message:         string;
  conversationId?: string;   // present once a thread exists client-side
  phone?:          string;   // E.164 — only if already captured
  sessionId?:      string;   // web widget session token
  sourcePage?:     string;   // e.g. "/test-prep/gmat"
  history?:        unknown;  // server DB is source of truth
}

interface ChatResponseBody {
  reply:          string;
  conversationId: string;
}

// ── STEP: saveMessage ────────────────────────────────────────────
async function saveMessage(
  conversationId: string,
  role: MessageRole,
  content: string
): Promise<Message> {
  return prisma.message.create({
    data: { conversationId, role, content },
  });
}

// ── STEP: getRecentMessages ──────────────────────────────────────
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

  // Reverse to maintain chronological order & map roles to ChatMessage format
  return messages.reverse().map((m) => ({
    role: m.role === MessageRole.ASSISTANT ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));
}

async function createHumanHandoff(
  conversationId: string,
  reason: string,
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
  } | null,
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

// ── POST HANDLER — orchestrates the full pipeline in order ────────
export async function POST(req: Request): Promise<NextResponse<ChatResponseBody | { error: string }>> {
  try {
    const body = (await req.json()) as ChatRequestBody;

    // ── Validate ──────────────────────────────────────────────────
    if (!body?.message || typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json({ error: "`message` is required" }, { status: 400 });
    }
    const userMessage = body.message.trim();

    // ── findOrCreateConversation() ───────────────────────────────
    let conversation: Conversation;
    if (body.conversationId) {
      const existing = await prisma.conversation.findUnique({
        where: { id: body.conversationId },
      });
      conversation =
        existing ??
        (await findOrCreateConversation({
          phone: body.phone,
          sessionId: body.sessionId,
          source: ConversationSource.WEB,
          sourcePage: body.sourcePage,
        }));
    } else {
      conversation = await findOrCreateConversation({
        phone: body.phone,
        sessionId: body.sessionId,
        source: ConversationSource.WEB,
        sourcePage: body.sourcePage,
      });
    }

    // ── Extract & Update Student Details on Conversation ─────────
    const extractedStudentDetails = await extractStudentDetails(userMessage);

    if (
      extractedStudentDetails.name ||
      extractedStudentDetails.phone ||
      extractedStudentDetails.email
    ) {
      conversation = await prisma.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          ...(extractedStudentDetails.name
            ? { name: extractedStudentDetails.name }
            : {}),
          ...(extractedStudentDetails.phone
            ? { phone: extractedStudentDetails.phone }
            : {}),
          ...(extractedStudentDetails.email
            ? { email: extractedStudentDetails.email }
            : {}),
        },
      });
    }

    // ── Demo Handling Flow ───────────────────────────────────────
    const awaitingDemoConfirmation =
      await isAwaitingDemoConfirmation(conversation.id);

    const existingDemoBooking =
      await getDemoBookingByConversation(conversation.id);
    const pendingDemoCourse = awaitingDemoConfirmation
      ? await getPendingDemoCourse(conversation.id)
      : null;
    const intentRoute = routeIntent({
      message: userMessage,
      awaitingDemoConfirmation,
    });

    console.log("[DEMO DEBUG]", {
      conversationId: conversation.id,
      awaitingDemoConfirmation,
      pendingDemoCourse,
      conversationName: conversation.name,
      conversationPhone: conversation.phone,
      conversationEmail: conversation.email,
      userMessage,
    });
    console.log("[INTENT ROUTER]", intentRoute);

    await saveMessage(
      conversation.id,
      MessageRole.USER,
      userMessage
    );

    let updatedDemoBooking = existingDemoBooking;

    if (existingDemoBooking) {
      await captureDemoStudentDetails({
        bookingId: existingDemoBooking.id,
        message: userMessage,
      });

      updatedDemoBooking =
        await getDemoBookingByConversation(conversation.id);
    }

    if (intentRoute.intent === "HUMAN_HANDOFF") {
      const handoffMessage = await createHumanHandoff(
        conversation.id,
        intentRoute.reason,
      );

      await saveMessage(
        conversation.id,
        MessageRole.ASSISTANT,
        handoffMessage,
      );

      return NextResponse.json({
        reply: handoffMessage,
        conversationId: conversation.id,
      });
    }

    if (
      updatedDemoBooking &&
      (
        updatedDemoBooking.status === "PENDING" ||
        updatedDemoBooking.status === "CONFIRMED"
      )
    ) {
      const missingDetails = getMissingDemoDetails({
        name: updatedDemoBooking.name ?? undefined,
        phone: updatedDemoBooking.phone ?? undefined,
        email: updatedDemoBooking.email ?? undefined,
      });

      const hasMissingDetails =
        missingDetails.name ||
        missingDetails.phone ||
        missingDetails.email;

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

        await saveMessage(
          conversation.id,
          MessageRole.ASSISTANT,
          detailMessage,
        );

        return NextResponse.json({
          reply: detailMessage,
          conversationId: conversation.id,
        });
      }

      // ── EXISTING DEMO + DETAILS NOW COMPLETE ─────────────────────
      if (
        updatedDemoBooking.name &&
        updatedDemoBooking.phone &&
        updatedDemoBooking.email
      ) {
        // Create portal access request if it does not already exist.
        await createPortalAccessRequest({
          conversationId: conversation.id,
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

        await saveMessage(
          conversation.id,
          MessageRole.ASSISTANT,
          completionMessage,
        );

        return NextResponse.json({
          reply: completionMessage,
          conversationId: conversation.id,
        });
      }
    }

    if (intentRoute.intent === "DEMO") {
      const demoResult = await processDemoRequest({
        conversationId: conversation.id,
        message: userMessage,
        name: conversation.name ?? undefined,
        phone: conversation.phone ?? body.phone,
        email: conversation.email ?? undefined,
        awaitingConfirmation: awaitingDemoConfirmation,
        pendingCourse: pendingDemoCourse,
      });

      if (demoResult.needsConfirmation) {
        await saveMessage(
          conversation.id,
          MessageRole.ASSISTANT,
          demoResult.message,
        );

        return NextResponse.json({
          reply: demoResult.message,
          conversationId: conversation.id,
        });
      }

      if (demoResult.success) {
        await saveMessage(
          conversation.id,
          MessageRole.ASSISTANT,
          demoResult.message,
        );

        return NextResponse.json({
          reply: demoResult.message,
          conversationId: conversation.id,
        });
      }
    }

    if (intentRoute.intent === "LEAD_QUALIFICATION") {
      const existingLeadContext = await prisma.leadContext.findUnique({
        where: { conversationId: conversation.id },
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
        toLeadExtractionResult(conversation, existingLeadContext),
      );

      await persistLeadContext(conversation.id, leadExtraction);
    }

    // ── COACHING LEAD Handling ────────────────────────────────────
    let coachingContextStr: string | null = null;

    if (intentRoute.intent === "COACHING_LEAD") {
      const existingLeadContext = await prisma.leadContext.findUnique({
        where: { conversationId: conversation.id },
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
        course:           existingLeadContext?.targetCourse ?? undefined,
        destination:      existingLeadContext?.targetCountry ?? undefined,
        currentLevel:     existingLeadContext?.englishLevel ?? undefined,
        budget:           existingLeadContext?.budgetRange ?? undefined,
        intake:           existingLeadContext?.intake ?? undefined,
        goal:             existingLeadContext?.goal ?? undefined,
        name:             conversation.name ?? undefined,
        phone:            conversation.phone ?? undefined,
        email:            conversation.email ?? undefined,
      };

      const coachingExtraction = extractCoachingLead(userMessage, previousCoaching);

      // Persist to existing LeadContext fields
      const leadForPersist: LeadExtractionResult = {
        name:         coachingExtraction.name,
        phone:        coachingExtraction.phone,
        email:        coachingExtraction.email,
        country:      coachingExtraction.destination,
        course:       coachingExtraction.course,
        intake:       coachingExtraction.intake,
        budget:       coachingExtraction.budget,
        englishLevel: coachingExtraction.currentLevel ?? coachingExtraction.targetScore,
        timeline:     coachingExtraction.targetExamDate,
        goal:         coachingExtraction.goal as LeadExtractionResult["goal"],
      };

      await persistLeadContext(conversation.id, leadForPersist);

      // Update conversation identity fields if detected
      if (coachingExtraction.name || coachingExtraction.phone || coachingExtraction.email) {
        conversation = await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            ...(coachingExtraction.name  ? { name: coachingExtraction.name }  : {}),
            ...(coachingExtraction.phone ? { phone: coachingExtraction.phone } : {}),
            ...(coachingExtraction.email ? { email: coachingExtraction.email } : {}),
          },
        });
      }

      // Build coaching context for AI prompt
      coachingContextStr = buildCoachingContextString(coachingExtraction);
    }

    // ── getRecentMessages() ───────────────────────────────────────
    const historyMessages = await getRecentMessages(conversation.id);

    // ── buildPrompt() ─────────────────────────────────────────────
    const prompt = await buildPrompt({
      conversationId: conversation.id,
      userMessage,
      sourcePage: body.sourcePage ?? conversation.sourcePage ?? undefined,
    });

    // ── Construct system message context ──────────────────────────
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

    // ── Generate AI Response using Groq Client ────────────────────
    const aiResponse = await generateChatCompletion({
      messages: fullMessages,
    });

    const reply = aiResponse.content;

    // ── saveMessage(ASSISTANT) ────────────────────────────────────
    await saveMessage(conversation.id, MessageRole.ASSISTANT, reply);

    // ── Return JSON ────────────────────────────────────────────────
    return NextResponse.json({
      reply,
      conversationId: conversation.id,
    });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or WhatsApp us for help." },
      { status: 500 }
    );
  }
}
