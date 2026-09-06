// FILE: lib/admission/admin.admissions.service.ts
//
// ═════════════════════════════════════════════════════════════════
// PHASE S6-B2 — COUNSELLOR ADMISSION WORKSPACE (SERVER-SIDE)
//
// The thin server-side adapter over the S6-B1 authority
// (lib/admission/admission.service.ts + admission.lifecycle.ts).
// It owns ONLY:
//
//   · server-side view queries for the /admin/admissions workspace
//     (list with filters + urgent-first ordering, detail with the
//     immutable event history),
//   · the server-side ACTOR DERIVATION from the authenticated staff
//     identity — the browser can never name its own actor,
//   · the per-record AUTHORIZATION rule (a counsellor may work an
//     admission only when it is unassigned or assigned to them;
//     an ADMIN may work any),
//   · the safe HTTP mapping of AdmissionLifecycleError codes.
//
// It NEVER updates AdmissionEnrollment.state directly: every state
// change, note and assignment is delegated to the S6-B1 service, so
// the lifecycle graph + human-verification gates stay authoritative.
//
// No schema change was required for this phase (S6-B1 already models
// everything the workspace needs).
// ═════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import {
  AdmissionActor,
  AdmissionEventAction,
  AdmissionState,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  getAdmissionEnrollmentById,
  recordAdmissionEvent,
  recordAdmissionTransition,
  recordFollowUpAttempt,
  resolveStaffDisplayNames,
  setCounsellorAssignment,
  setNextFollowUpDate,
} from "./admission.service";
import {
  AdmissionLifecycleError,
  AdmissionLifecycleErrorCode,
  ADMISSION_STATES,
  FOLLOW_UP_DUE_SOON_WINDOW_MS,
  isAdmissionState,
  normalizeAdmissionCourse,
} from "./admission.lifecycle";
import { COACHING_COURSES } from "../lead/leadExtractor";
import {
  isAdminAuthError,
  adminAuthErrorResponse,
  type StaffIdentity,
} from "../auth/admin-guard";

// ═════════════════════════════════════════════════════════════════
// ACTOR DERIVATION — server-side, never browser-provided
// ═════════════════════════════════════════════════════════════════

/**
 * Derive the canonical lifecycle actor from the authenticated staff
 * identity. An ADMIN authenticates as AdmissionActor.ADMIN; every other
 * active staff role (COUNSELLOR / OPERATOR) acts with the authority of
 * AdmissionActor.COUNSELLOR. STUDENT / AI / SYSTEM are NEVER derived —
 * they have no admin login on this surface.
 */
export function actorForStaffIdentity(role: string): AdmissionActor {
  return role === "ADMIN"
    ? AdmissionActor.ADMIN
    : AdmissionActor.COUNSELLOR;
}

// ═════════════════════════════════════════════════════════════════
// AUTHORIZATION — who may work a record
// ═════════════════════════════════════════════════════════════════

export type AdmissionWriteIntent =
  | "STATE" // transitions (incl. contacted)
  | "NOTE"
  | "ASSIGN"
  | "RELEASE";

export type AdmissionWorkPermission =
  | { allowed: true }
  | { allowed: false; reason: "ASSIGNED_TO_OTHER" | "NOT_OWNER" };

/**
 * canModifyAdmission — the per-record rule (pure).
 *
 *  · ADMIN can work / assign / release any admission record.
 *  · A COUNSELLOR may work (transitions/notes) a record only while it
 *    is unassigned OR assigned to them — never one owned by another
 *    counsellor.
 *  · A COUNSELLOR may assign only THEMSELF (claim), and release only a
 *    record assigned to them. Reassigning another counsellor's work is
 *    an ADMIN action.
 */
export function canModifyAdmission(
  identity: Pick<StaffIdentity, "id" | "role">,
  enrollment: { assignedCounsellorId: string | null },
  intent: AdmissionWriteIntent,
  targetStaffId: string | null = null,
): AdmissionWorkPermission {
  if (identity.role === "ADMIN") return { allowed: true };

  if (
    enrollment.assignedCounsellorId !== null &&
    enrollment.assignedCounsellorId !== identity.id
  ) {
    return { allowed: false, reason: "ASSIGNED_TO_OTHER" };
  }

  switch (intent) {
    case "STATE":
    case "NOTE":
      return { allowed: true };
    case "ASSIGN":
      if (targetStaffId === identity.id) return { allowed: true };
      return { allowed: false, reason: "NOT_OWNER" };
    case "RELEASE":
      if (enrollment.assignedCounsellorId === identity.id) {
        return { allowed: true };
      }
      return { allowed: false, reason: "NOT_OWNER" };
  }
}

// ═════════════════════════════════════════════════════════════════
// QUEUE ORDERING — pure, deterministic
// ═════════════════════════════════════════════════════════════════

/**
 * ADMISSION_QUEUE_RANK — "urgent/actionable states first". Uncontacted
 * opportunities and payment evidence sit at the top; closed/terminal
 * journeys sink to the bottom. Within a state, newest updated first.
 */
export const ADMISSION_QUEUE_RANK: Readonly<Record<AdmissionState, number>> = {
  [AdmissionState.COUNSELLOR_CONTACT_PENDING]: 1,
  [AdmissionState.PAYMENT_VERIFICATION]: 2,
  [AdmissionState.PAYMENT_PENDING]: 3,
  [AdmissionState.FOLLOW_UP_REQUIRED]: 4,
  [AdmissionState.DOCUMENTS_PENDING]: 5,
  [AdmissionState.COUNSELLOR_CONTACTED]: 6,
  [AdmissionState.INTERESTED]: 7,
  [AdmissionState.NOT_INTERESTED]: 8,
  [AdmissionState.PAYMENT_VERIFIED]: 9,
  [AdmissionState.ADMISSION_CONFIRMED]: 10,
  [AdmissionState.ADMISSION_COMPLETED]: 11,
  [AdmissionState.LOST]: 12,
};

export type AdmissionQueueCandidate = {
  state: AdmissionState;
  updatedAt: Date;
};

export function compareAdmissionQueueItems(
  a: AdmissionQueueCandidate,
  b: AdmissionQueueCandidate,
): number {
  const rankDiff = ADMISSION_QUEUE_RANK[a.state] - ADMISSION_QUEUE_RANK[b.state];
  if (rankDiff !== 0) return rankDiff;
  return b.updatedAt.getTime() - a.updatedAt.getTime();
}

// ═════════════════════════════════════════════════════════════════
// ACTION VOCABULARY — every action delegates to the S6-B1 service
// ═════════════════════════════════════════════════════════════════

export type AdminAdmissionAction =
  | "ASSIGN"
  | "RELEASE"
  | "CONTACT_PENDING"
  | "MARK_CONTACTED"
  | "FOLLOW_UP"
  | "FOLLOW_UP_ATTEMPTED"
  | "DOCUMENTS_PENDING"
  | "PAYMENT_PENDING"
  | "PAYMENT_VERIFICATION"
  | "PAYMENT_VERIFIED"
  | "ADMISSION_CONFIRMED"
  | "ADMISSION_COMPLETED"
  | "NOT_INTERESTED"
  | "LOST"
  | "REACTIVATE"
  | "NOTE";

export const ADMIN_ADMISSION_ACTIONS: readonly AdminAdmissionAction[] = [
  "ASSIGN",
  "RELEASE",
  "CONTACT_PENDING",
  "MARK_CONTACTED",
  "FOLLOW_UP",
  "FOLLOW_UP_ATTEMPTED",
  "DOCUMENTS_PENDING",
  "PAYMENT_PENDING",
  "PAYMENT_VERIFICATION",
  "PAYMENT_VERIFIED",
  "ADMISSION_CONFIRMED",
  "ADMISSION_COMPLETED",
  "NOT_INTERESTED",
  "LOST",
  "REACTIVATE",
  "NOTE",
];

/** State-changing actions → their lifecycle target state. */
export const ADMIN_ACTION_TO_STATE: Readonly<
  Partial<Record<AdminAdmissionAction, AdmissionState>>
> = {
  CONTACT_PENDING: AdmissionState.COUNSELLOR_CONTACT_PENDING,
  MARK_CONTACTED: AdmissionState.COUNSELLOR_CONTACTED,
  FOLLOW_UP: AdmissionState.FOLLOW_UP_REQUIRED,
  DOCUMENTS_PENDING: AdmissionState.DOCUMENTS_PENDING,
  PAYMENT_PENDING: AdmissionState.PAYMENT_PENDING,
  PAYMENT_VERIFICATION: AdmissionState.PAYMENT_VERIFICATION,
  PAYMENT_VERIFIED: AdmissionState.PAYMENT_VERIFIED,
  ADMISSION_CONFIRMED: AdmissionState.ADMISSION_CONFIRMED,
  ADMISSION_COMPLETED: AdmissionState.ADMISSION_COMPLETED,
  NOT_INTERESTED: AdmissionState.NOT_INTERESTED,
  LOST: AdmissionState.LOST,
  REACTIVATE: AdmissionState.INTERESTED,
};

// ═════════════════════════════════════════════════════════════════
// VIEW QUERIES
// ═════════════════════════════════════════════════════════════════

/** Canonical coaching courses, sorted — single source, server-side. */
export const ADMISSION_COURSE_OPTIONS: readonly string[] = [
  ...new Set(Object.values(COACHING_COURSES)),
].sort((a, b) => a.localeCompare(b));

export type ListAdminAdmissionsOptions = {
  course?: string;
  /** AdmissionState when filtering to a single state, else ALL. */
  state?: AdmissionState | "ALL";
  /** "me" = the calling staff, "unassigned" = no counsellor, else a
   *  valid staff id. */
  assignee?: string;
  /** S6-F2 — filter by scheduled-follow-up due-ness, evaluated
   *  server-side against `now` (absolute epoch, timezone-safe):
   *    "none"     → no scheduled follow-up (nextFollowUpAt is null)
   *    "overdue"  → due date has passed
   *    "due"      → within the due-soon window (24h), not yet overdue
   *    "upcoming" → scheduled later than the due-soon window
   *  Undefined → no follow-up filter. */
  followUp?: "none" | "overdue" | "due" | "upcoming";
  limit?: number;
  offset?: number;
};

/** Active COUNSELLORs for assignee filters + the assign dropdown. */
export async function listAdminCounsellors() {
  return prisma.staff.findMany({
    where: { active: true, role: "COUNSELLOR" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
}

export async function listAdminAdmissions(
  identity: Pick<StaffIdentity, "id">,
  options: ListAdminAdmissionsOptions = {},
) {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  const where: {
    course?: { equals: string };
    state?: AdmissionState;
    assignedCounsellorId?: { equals: string } | null;
    nextFollowUpAt?:
      | { equals: null }
      | { lt: Date }
      | { gt: Date; lte: Date }
      | { gt: Date };
  } = {};

  if (options.course) {
    const course = normalizeAdmissionCourse(options.course);
    if (!course) {
      throw new AdmissionLifecycleError(
        AdmissionLifecycleErrorCode.INVALID_COURSE,
        `"${options.course}" is not a canonical coaching course`,
      );
    }
    where.course = { equals: course };
  }

  if (options.state && options.state !== "ALL") {
    if (!isAdmissionState(options.state)) {
      throw new AdmissionLifecycleError(
        AdmissionLifecycleErrorCode.INVALID_STATE,
        `"${String(options.state)}" is not a canonical admission state`,
      );
    }
    where.state = options.state;
  }

  if (options.assignee === "unassigned") {
    where.assignedCounsellorId = null;
  } else if (options.assignee === "me") {
    where.assignedCounsellorId = { equals: identity.id };
  } else if (options.assignee) {
    where.assignedCounsellorId = { equals: options.assignee };
  }

  // S6-F2 — follow-up due-ness filter, evaluated against `now` (absolute
  // epoch ms → timezone-safe, matching the S6-F1 classifier semantics).
  if (options.followUp) {
    const now = Date.now();
    if (options.followUp === "none") {
      where.nextFollowUpAt = { equals: null };
    } else if (options.followUp === "overdue") {
      where.nextFollowUpAt = { lt: new Date(now) };
    } else if (options.followUp === "due") {
      where.nextFollowUpAt = { gt: new Date(now), lte: new Date(now + FOLLOW_UP_DUE_SOON_WINDOW_MS) };
    } else {
      where.nextFollowUpAt = { gt: new Date(now + FOLLOW_UP_DUE_SOON_WINDOW_MS) };
    }
  }

  const candidates = await prisma.admissionEnrollment.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: { id: true, state: true, updatedAt: true },
  });

  const ordered = candidates
    .map((c) => ({ id: c.id, state: c.state, updatedAt: c.updatedAt }))
    .sort(compareAdmissionQueueItems);

  const total = ordered.length;
  const page = ordered.slice(offset, offset + limit);
  const pageIds = page.map((p) => p.id);

  const rows = await prisma.admissionEnrollment.findMany({
    where: { id: { in: pageIds } },
    include: {
      lead: { select: { id: true, name: true, phone: true, email: true } },
      assignedCounsellor: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const rowById = new Map(rows.map((r) => [r.id, r]));
  const admissions = page.map((item) => ({
    ...(rowById.get(item.id) as NonNullable<(typeof rows)[number]>),
  }));

  const [counsellors] = await Promise.all([listAdminCounsellors()]);

  return {
    admissions,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
    counsellors,
    courses: ADMISSION_COURSE_OPTIONS,
    states: ADMISSION_STATES,
  };
}

export async function getAdminAdmissionDetail(admissionEnrollmentId: string) {
  const withEvents = await getAdmissionEnrollmentById(admissionEnrollmentId);
  if (!withEvents) return null;

  const lead =
    withEvents.leadId &&
    (await prisma.lead.findUnique({
      where: { id: withEvents.leadId },
      select: { id: true, name: true, phone: true, email: true },
    }));

  const assignedCounsellor =
    withEvents.assignedCounsellorId &&
    (await prisma.staff.findUnique({
      where: { id: withEvents.assignedCounsellorId },
      select: { id: true, name: true, email: true },
    }));

  // S6-F2 — resolve each event's actorId → Staff display name so the
  // history reads "Rahul — Counsellor" instead of a bare role verb.
  // AdmissionEvent has no staff relation, so resolve in one batch.
  const staffNames = await resolveStaffDisplayNames(
    withEvents.events.map((e) => e.actorId),
  );

  return {
    ...withEvents,
    lead,
    assignedCounsellor,
    events: withEvents.events.map((e) => ({
      ...e,
      actorName: e.actorId ? (staffNames.get(e.actorId) ?? null) : null,
    })),
  };
}

// ═════════════════════════════════════════════════════════════════
// ACTIONS — everything funnels through the S6-B1 service
// ═════════════════════════════════════════════════════════════════

export type AdminAdmissionActionInput = {
  admissionEnrollmentId: string;
  action: AdminAdmissionAction;
  /** SERVER-DERIVED actor (from the authenticated staff identity). */
  actor: AdmissionActor;
  /** The authenticated staff id — recorded as the event actorId. */
  actorId: string;
  reason?: string | null;
  /** Note text (NOTE action). */
  note?: string | null;
  /** Assignment target (ASSIGN) / release uses null. */
  staffId?: string | null;
  /** Idempotency discriminator — optional, for explicit later repeats. */
  discriminator?: string | null;
  /**
   * S6-F1 — scheduled next follow-up date for the FOLLOW_UP action:
   *   Date   → schedule/reschedule to that future date.
   *   null   → clear the scheduled follow-up.
   *   undefined (omit) → leave unchanged / no date.
   */
  nextFollowUpAt?: Date | null;
};

export type AdminAdmissionActionResult = {
  enrollment: import("@prisma/client").AdmissionEnrollment;
  event: import("@prisma/client").AdmissionEvent | null;
  applied: boolean;
};

/**
 * performAdminAdmissionAction — executes one admitted workspace action.
 * Every state change goes through recordAdmissionTransition; every note
 * through recordAdmissionEvent; assignment through setCounsellorAssignment.
 * The record is NEVER updated directly here.
 */
export async function performAdminAdmissionAction(
  input: AdminAdmissionActionInput,
): Promise<AdminAdmissionActionResult> {
  const { admissionEnrollmentId, action, actor, actorId } = input;

  switch (action) {
    case "NOTE":
      if (!input.note?.trim()) {
        throw new AdmissionLifecycleError(
          AdmissionLifecycleErrorCode.INVALID_STATE,
          "A note requires text.",
        );
      }
      {
        const result = await recordAdmissionEvent({
          enrollmentId: admissionEnrollmentId,
          action: AdmissionEventAction.NOTE_ADDED,
          actor,
          actorId,
          reason: input.note.trim(),
          discriminator: input.discriminator ?? undefined,
        });
        const enrollment = await prisma.admissionEnrollment.findUnique({
          where: { id: admissionEnrollmentId },
        });
        return { enrollment: enrollment!, event: result.event, applied: result.applied };
      }
    case "ASSIGN":
    case "RELEASE":
      {
        const { enrollment } = await setCounsellorAssignment({
          enrollmentId: admissionEnrollmentId,
          staffId: action === "ASSIGN" ? input.staffId ?? null : null,
          actor,
          actorId,
          reason: input.reason ?? null,
        });
        return { enrollment, event: null, applied: true };
      }
    case "FOLLOW_UP_ATTEMPTED":
      {
        // Human-only, ownership-authorized, distinct immutable event.
        const current = await prisma.admissionEnrollment.findUnique({
          where: { id: admissionEnrollmentId },
        });
        if (!current) throw new AdmissionLifecycleError(AdmissionLifecycleErrorCode.NOT_FOUND, `Admission enrollment ${admissionEnrollmentId} not found`);
        const attempt = await recordFollowUpAttempt({
          enrollmentId: admissionEnrollmentId,
          actor,
          actorId,
          reason: input.reason ?? null,
          // Pass the client discriminator when supplied, else the service
          // mints a unique one so distinct attempts are never collapsed.
          discriminator: input.discriminator ?? undefined,
        });
        return { enrollment: attempt.enrollment, event: attempt.event, applied: attempt.applied };
      }
    case "FOLLOW_UP":
      {
        const currentStateRow = await prisma.admissionEnrollment.findUnique({
          where: { id: admissionEnrollmentId },
          select: { state: true, nextFollowUpAt: true },
        });
        if (!currentStateRow) {
          throw new AdmissionLifecycleError(
            AdmissionLifecycleErrorCode.NOT_FOUND,
            `Admission enrollment ${admissionEnrollmentId} not found`,
          );
        }
        const currentState = currentStateRow.state;
        if (input.nextFollowUpAt !== undefined && currentState === AdmissionState.FOLLOW_UP_REQUIRED) {
          // Already in FOLLOW_UP_REQUIRED → schedule/reschedule/clear the
          // date in place (no state transition), preserving an event.
          const res = await setNextFollowUpDate({
            enrollmentId: admissionEnrollmentId,
            nextFollowUpAt: input.nextFollowUpAt,
            actor,
            actorId,
            reason: input.reason ?? null,
            discriminator: input.discriminator ?? undefined,
          });
          return { enrollment: res.enrollment, event: res.event, applied: res.applied };
        }
        // First-time scheduling → enter FOLLOW_UP_REQUIRED with the date
        // set atomically (or without a date when omitted).
        return recordAdmissionTransition({
          enrollmentId: admissionEnrollmentId,
          toState: AdmissionState.FOLLOW_UP_REQUIRED,
          actor,
          actorId,
          reason: input.reason ?? null,
          discriminator: input.discriminator ?? undefined,
          nextFollowUpAt: input.nextFollowUpAt === undefined ? undefined : input.nextFollowUpAt,
        });
      }
    default: {
      const toState = ADMIN_ACTION_TO_STATE[action];
      if (!toState) {
        throw new AdmissionLifecycleError(
          AdmissionLifecycleErrorCode.INVALID_STATE,
          `Unknown admission action "${String(action)}".`,
        );
      }
      return recordAdmissionTransition({
        enrollmentId: admissionEnrollmentId,
        toState,
        actor,
        actorId,
        reason: input.reason ?? null,
        discriminator: input.discriminator ?? undefined,
      });
    }
  }
}

// ═════════════════════════════════════════════════════════════════
// SAFE HTTP ERROR MAPPING
// ═════════════════════════════════════════════════════════════════

export function adminAdmissionErrorResponse(error: unknown): NextResponse {
  if (isAdminAuthError(error)) {
    return adminAuthErrorResponse(error);
  }

  if (error instanceof AdmissionLifecycleError) {
    let status: number;
    switch (error.code) {
      case AdmissionLifecycleErrorCode.NOT_FOUND:
        status = 404;
        break;
      case AdmissionLifecycleErrorCode.FORBIDDEN_ACTOR:
      case AdmissionLifecycleErrorCode.REQUIRES_HUMAN_VERIFICATION:
        status = 403;
        break;
      case AdmissionLifecycleErrorCode.CONCURRENT_MODIFICATION:
        status = 409;
        break;
      default:
        status = 400;
    }
    return NextResponse.json(
      { success: false, errorCode: error.code, error: error.message },
      { status },
    );
  }

  console.error("[ADMIN ADMISSIONS] error:", error);
  return NextResponse.json(
    { success: false, error: "Unable to process the request." },
    { status: 500 },
  );
}