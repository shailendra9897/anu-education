// FILE: lib/lead/student.workspace.service.ts
//
// ═════════════════════════════════════════════════════════════════
// PHASE S6-E — UNIFIED COUNSELLOR STUDENT WORKSPACE (READ-ONLY)
//
// A single, read-only VIEW over the existing canonical records for one
// student/conversion journey. It NEVER writes and NEVER duplicates data
// into a new table — it is a CRM UX layer over:
//
//   Conversation(s) + Message transcript
//   Lead (canonical identity)
//   LeadContext
//   DemoBooking(s) + verified attendance + DemoBookingEvent history
//   AdmissionEnrollment(s) (Lead × course) + AdmissionEvent history
//   Latest COUNSELLOR_ACTION (audit-only SYSTEM row)
//   PortalAccessRequest(s) (safe operational fields only)
//
// Design rules honoured here:
//   • Transcript is conversation-SPECIFIC and excludes SYSTEM rows
//     (audit / COUNSELLOR_ACTION / ADMISSION_RECORD / prompts).
//   • Related conversations for the same Lead are listed separately;
//     message rows are never merged across conversations.
//   • Course isolation: every AdmissionEnrollment is Lead × course and
//     DemoBooking is booking-specific — German never colours IELTS.
//   • Attendance is read from DemoBooking.status ONLY (verified by a
//     counsellor) — never inferred from messages.
//   • No internal AI information is exposed (no prompts, reasoning,
//     raw classifier output, hidden priority labels).
//
// Authorization is enforced by the caller (route handler via
// requireAdminAuth). This module is purely a data-reader + mapper.
// ═════════════════════════════════════════════════════════════════

import prisma from "@/lib/prisma";
import { MessageRole } from "@prisma/client";
import {
  COUNSELLOR_ACTION_PREFIX,
  parseActionEventContent,
  type CounsellorActionState,
} from "./counsellor.action";
import { classifyFollowUpStatus } from "../admission/admission.lifecycle";
import { resolveStaffDisplayNames } from "../admission/admission.service";

// ── Output types ───────────────────────────────────────────────────

export type StudentTranscriptEntry = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: Date;
};

export type StudentWorkspaceConversation = {
  id: string;
  source: string;
  status: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  sourcePage: string | null;
  leadScore: number | null;
  leadTier: string | null;
  createdAt: Date;
  updatedAt: Date;
  assignedCounsellor: { id: string; name: string; email: string } | null;
};

export type StudentWorkspaceLead = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  identitySource: string | null;
  createdAt: Date;
} | null;

export type StudentWorkspaceLeadContext = {
  goal: string | null;
  targetCountry: string | null;
  targetCourse: string | null;
  englishLevel: string | null;
  budgetRange: string | null;
  timeline: string | null;
  intake: string | null;
  biggestChallenge: string | null;
} | null;

export type StudentWorkspaceDemoBooking = {
  id: string;
  course: string | null;
  preferredBatch: string | null;
  preferredDate: Date | null;
  status: string;
  attendedAt: Date | null;
  noShowAt: Date | null;
  cancelledAt: Date | null;
  attendanceNote: string | null;
  createdAt: Date;
  verifiedBy: { id: string; name: string } | null;
  events: {
    id: string;
    action: string;
    previousStatus: string | null;
    nextStatus: string;
    staffName: string | null;
    note: string | null;
    createdAt: Date;
  }[];
};

export type StudentWorkspaceAdmission = {
  id: string;
  course: string;
  state: string;
  contactedAt: Date | null;
  nextFollowUpAt: Date | null;
  /** Derived deterministic follow-up due state (S6-F1). */
  followUp: {
    status: "NONE" | "OVERDUE" | "DUE_SOON" | "UPCOMING";
    label: string;
    isOverdue: boolean;
    isDueSoon: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  assignedCounsellor: { id: string; name: string; email: string } | null;
  events: {
    id: string;
    action: string;
    previousState: string | null;
    nextState: string;
    actor: string;
    actorId: string | null;
    /** S6-F2 — resolved Staff display name for COUNSELLOR/ADMIN actors. */
    actorName: string | null;
    reason: string | null;
    createdAt: Date;
  }[];
};

export type StudentWorkspacePortalRequest = {
  id: string;
  course: string | null;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  failedAt: Date | null;
  notes: string | null;
};

export type StudentWorkspaceAction = {
  state: CounsellorActionState;
  course: string | null;
  reason: string;
} | null;

export type StudentWorkspace = {
  conversation: StudentWorkspaceConversation;
  lead: StudentWorkspaceLead;
  relatedConversations: StudentWorkspaceConversation[];
  transcript: StudentTranscriptEntry[];
  leadContext: StudentWorkspaceLeadContext;
  demoBookings: StudentWorkspaceDemoBooking[];
  admissions: StudentWorkspaceAdmission[];
  portalAccessRequests: StudentWorkspacePortalRequest[];
  latestAction: StudentWorkspaceAction;
};

// ═════════════════════════════════════════════════════════════════
// QUERY — efficient, bounded, no N+1
// ═════════════════════════════════════════════════════════════════

/**
 * getStudentWorkspace
 * Reads the unified student view for ONE conversation. Returns null if
 * the conversation does not exist. Any active staff member is allowed to
 * read (authorization is at the route/auth layer); opening this view
 * NEVER mutates any record — opening a conversation must not change an
 * admission state, attendance, or anything else.
 */
export async function getStudentWorkspace(
  conversationId: string,
): Promise<StudentWorkspace | null> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      assignedCounsellor: { select: { id: true, name: true, email: true } },
      leadContext: true,
    },
  });

  if (!conversation) return null;

  // The canonical Lead behind this conversation (may be null for an
  // anonymous web session that has not yet shared any identity).
  const leadId = conversation.leadId;
  const lead = leadId
    ? await prisma.lead.findUnique({
        where: { id: leadId },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          identitySource: true,
          createdAt: true,
        },
      })
    : null;

  // Related conversations = every conversation owned by the same Lead
  // (cross-channel visibility, Phase 10). The selected one is included so
  // the UI can mark it; message rows are never merged (Phase 10 isolation).
  const relatedConversations = leadId
    ? await prisma.conversation.findMany({
        where: { leadId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        include: {
          assignedCounsellor: { select: { id: true, name: true, email: true } },
        },
      })
    : conversation.leadId
      ? []
      : // No lead — still surface the single conversation for anonymous rows.
        [conversation];

  // Transcript: strictly the SELECTED conversation, USER + ASSISTANT only.
  // SYSTEM audit rows (COUNSELLOR_ACTION, ADMISSION_RECORD, prompts, etc.)
  // are excluded at the query level — they never reach the counsellor UI.
  const transcript: StudentTranscriptEntry[] = (
    await prisma.message.findMany({
      where: {
        conversationId,
        role: { in: [MessageRole.USER, MessageRole.ASSISTANT] },
      },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, content: true, createdAt: true },
    })
  ).map((m) => ({
    id: m.id,
    role: m.role as "USER" | "ASSISTANT",
    content: m.content,
    createdAt: m.createdAt,
  }));

  // Demo bookings: all bookings for the Lead (or the conversation row when
  // unlinked / anonymous). Includes attendance + verified-by + event history.
  const bookingsWhere = leadId
    ? { leadId }
    : { conversationId };
  const demoBookings = await prisma.demoBooking.findMany({
    where: bookingsWhere,
    orderBy: { createdAt: "desc" },
    include: {
      attendanceVerifiedByStaff: { select: { id: true, name: true } },
      events: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          action: true,
          previousStatus: true,
          nextStatus: true,
          staff: { select: { name: true } },
          note: true,
          createdAt: true,
        },
      },
    },
  });

  // Admissions: every Lead × course journey + its immutable event history.
  // Course isolation is inherent — each row is scoped by (leadId, course).
  const admissionEnrollments = leadId
    ? await prisma.admissionEnrollment.findMany({
        where: { leadId },
        orderBy: { updatedAt: "desc" },
        include: {
          assignedCounsellor: { select: { id: true, name: true, email: true } },
          events: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              action: true,
              previousState: true,
              nextState: true,
              actor: true,
              actorId: true,
              reason: true,
              createdAt: true,
            },
          },
        },
      })
    : [];

  // Portal access: safe operational fields only (never credentials,
  // portalLogin, token/screenshot/debug artifacts, or activation claims).
  const portalAccessRequests = leadId
    ? await prisma.portalAccessRequest.findMany({
        where: { leadId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          course: true,
          status: true,
          createdAt: true,
          completedAt: true,
          failedAt: true,
          notes: true,
        },
      })
    : [];

  // Latest COUNSELLOR_ACTION (audit-only SYSTEM row) for the selected
  // conversation — the deterministic queue state, never a hidden priority.
  const latestActionEvent = await prisma.message.findFirst({
    where: {
      conversationId,
      role: MessageRole.SYSTEM,
      content: { startsWith: COUNSELLOR_ACTION_PREFIX },
    },
    orderBy: { createdAt: "desc" },
    select: { content: true },
  });
  const latestActionParsed = parseActionEventContent(
    latestActionEvent?.content ?? null,
  );
  const latestAction =
    latestActionParsed && latestActionParsed.state !== "NONE"
      ? {
          state: latestActionParsed.state,
          course: latestActionParsed.course,
          reason: latestActionParsed.reason,
        }
      : null;

  // S6-F2 — resolve every admission-event actorId → Staff name in one
  // batch so the workspace history reads "Rahul — Counsellor".
  const staffNames = await resolveStaffDisplayNames(
    admissionEnrollments.flatMap((a) => a.events.map((e) => e.actorId)),
  );

  return {
    conversation: mapConversation(conversation),
    lead,
    relatedConversations: relatedConversations.map(mapConversation),
    transcript,
    leadContext: conversation.leadContext, // already scoped to this conversation
    demoBookings: demoBookings.map((b) => ({
      id: b.id,
      course: b.course,
      preferredBatch: b.preferredBatch,
      preferredDate: b.preferredDate,
      status: b.status,
      attendedAt: b.attendedAt,
      noShowAt: b.noShowAt,
      cancelledAt: b.cancelledAt,
      attendanceNote: b.attendanceNote,
      createdAt: b.createdAt,
      verifiedBy: b.attendanceVerifiedByStaff
        ? { id: b.attendanceVerifiedByStaff.id, name: b.attendanceVerifiedByStaff.name }
        : null,
      events: b.events.map((e) => ({
        id: e.id,
        action: e.action,
        previousStatus: e.previousStatus,
        nextStatus: e.nextStatus,
        staffName: e.staff?.name ?? null,
        note: e.note,
        createdAt: e.createdAt,
      })),
    })),
    admissions: admissionEnrollments.map((a) => {
      const fu = classifyFollowUpStatus(a.nextFollowUpAt);
      return {
        id: a.id,
        course: a.course,
        state: a.state,
        contactedAt: a.contactedAt,
        nextFollowUpAt: a.nextFollowUpAt,
        followUp: {
          status: fu.status,
          label: fu.label,
          isOverdue: fu.isOverdue,
          isDueSoon: fu.isDueSoon,
        },
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        assignedCounsellor: a.assignedCounsellor,
        events: a.events.map((e) => ({
          id: e.id,
          action: e.action,
          previousState: e.previousState,
          nextState: e.nextState,
          actor: e.actor,
          actorId: e.actorId,
          actorName: e.actorId ? (staffNames.get(e.actorId) ?? null) : null,
          reason: e.reason,
          createdAt: e.createdAt,
        })),
      };
    }),
    portalAccessRequests,
    latestAction,
  };
}

function mapConversation(
  c: {
    id: string;
    source: string;
    status: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    sourcePage: string | null;
    leadScore: number | null;
    leadTier: string | null;
    createdAt: Date;
    updatedAt: Date;
    assignedCounsellor: { id: string; name: string; email: string } | null;
  },
): StudentWorkspaceConversation {
  return {
    id: c.id,
    source: c.source,
    status: c.status,
    name: c.name,
    phone: c.phone,
    email: c.email,
    sourcePage: c.sourcePage,
    leadScore: c.leadScore,
    leadTier: c.leadTier,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    assignedCounsellor: c.assignedCounsellor,
  };
}
