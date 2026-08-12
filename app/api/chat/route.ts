// FILE: app/api/chat/route.ts
//
// ─────────────────────────────────────────────────────────────────
// Website chat endpoint — powered by Groq API
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { ConversationSource, MessageRole } from "@prisma/client";
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

    console.log("[DEMO DEBUG]", {
      conversationId: conversation.id,
      awaitingDemoConfirmation,
      pendingDemoCourse,
      conversationName: conversation.name,
      conversationPhone: conversation.phone,
      conversationEmail: conversation.email,
      userMessage,
    });

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