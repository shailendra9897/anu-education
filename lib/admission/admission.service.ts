// FILE: lib/admission/admission.service.ts
//
// ═════════════════════════════════════════════════════════════════
// PHASE S6-B1 — ADMISSION / CONVERSION SERVICE LAYER
//
// The narrow data-access wrapper over AdmissionEnrollment +
// AdmissionEvent. All business rules live in admission.lifecycle.ts
// (pure). This file only:
//
//   · get-or-create the per-(Lead × course) record under concurrency
//     (Prisma unique constraint + P2002 → resolve to existing),
//   · apply state transitions with an ATOMIC compare-and-swap on the
//     row (single UPDATE on `state`) plus an idempotency-key-backed
//     event inside the SAME transaction,
//   · record free-form audit events (idempotent via eventKey when a
//     discriminator is supplied; otherwise always insert),
//   · assign a counsellor WITHOUT implying contact.
//
// Safety invariants (S6-B1): STUDENT/AI/SYSTEM can never reach a
// human-verification state; AI can surface an opportunity but never
// mark payment/admission; "I paid" is not a verification.
// ═════════════════════════════════════════════════════════════════

import prisma from "@/lib/prisma";
import {
  Prisma,
  AdmissionActor,
  AdmissionEventAction,
  AdmissionState,
} from "@prisma/client";
import {
  AdmissionLifecycleError,
  AdmissionLifecycleErrorCode,
  assertAdmissionEventActionAllowed,
  assertAdmissionTransition,
  buildAdmissionEventKey,
  buildTransitionEventKey,
  canCreateAdmissionEnrollment,
  derivationTargetAction,
  isAdmissionState,
  isValidFollowUpDate,
  normalizeAdmissionCourse,
} from "./admission.lifecycle";

// ── TYPES ──────────────────────────────────────────────────────

export type NewAdmissionEnrollmentInput = {
  leadId: string;
  /** Any recognized coaching course — normalized to the canonical
   *  COACHING_COURSES value before persistence. */
  course: string;
  /** Who is causing creation. Defaults to SYSTEM. STUDENT is barred. */
  actor?: AdmissionActor;
  actorId?: string | null;
  reason?: string | null;
};

export type GetAdmissionEnrollmentInput = {
  leadId: string;
  course: string;
};

export type AdmissionTransitionInput = {
  enrollmentId: string;
  toState: AdmissionState;
  actor: AdmissionActor;
  actorId?: string | null;
  reason?: string | null;
  /** Pass ONLY for a genuinely later repeat of the same logical
   *  transition (e.g. a counsellor contacts the same student again
   *  weeks later). Without it, the unique index collapses repeats. */
  discriminator?: string;
  /**
   * S6-F1 — the counsellor's scheduled next follow-up date, set
   * atomically when the transition ENTERS FOLLOW_UP_REQUIRED.
   *   · Date   → a future, valid date (past dates are rejected).
   *   · null   → explicitly clear any scheduled follow-up.
   *   · "CLEAR"→ equivalent to null.
   *   · undefined (omit) → leave the column unchanged.
   *
   * Whenever a transition LEAVES FOLLOW_UP_REQUIRED the column is
   * auto-cleared (a follow-up is resolved by moving on) unless the
   * target is FOLLOW_UP_REQUIRED itself.
   */
  nextFollowUpAt?: Date | "CLEAR" | null;
};

export type AdmissionEventInput = {
  enrollmentId: string;
  action: AdmissionEventAction;
  actor: AdmissionActor;
  actorId?: string | null;
  reason?: string | null;
  /** Optional idempotency discriminator; when absent the event is
   *  free-form and always inserted. */
  discriminator?: string;
};

export type AdmissionAssignmentInput = {
  enrollmentId: string;
  /** null = release assignment. */
  staffId: string | null;
  actor: AdmissionActor;
  actorId?: string | null;
  reason?: string | null;
};

/**
 * resolveStaffDisplayNames
 * ─────────────────────────
 * Batch-resolves Staff ids → display names for admission-event actor
 * resolution. AdmissionEvent.actorId points at a Staff record but has no
 * Prisma relation in the schema, so surfaces (admission detail + student
 * workspace) resolve names once per batch. Returns an empty Map when
 * there are no ids. Unknown / null ids are simply omitted from the map.
 */
export async function resolveStaffDisplayNames(
  ids: ReadonlyArray<string | null | undefined>,
): Promise<Map<string, string>> {
  const unique = [
    ...new Set(ids.filter((id): id is string => Boolean(id))),
  ];
  if (unique.length === 0) return new Map();
  const staff = await prisma.staff.findMany({
    where: { id: { in: unique } },
    select: { id: true, name: true },
  });
  return new Map(staff.map((s) => [s.id, s.name]));
}

// Helper to detect the unique-constraint violation Prisma throws.
function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  );
}

// ═════════════════════════════════════════════════════════════════
// GET / CREATE
// ═════════════════════════════════════════════════════════════════

/**
 * getOrCreateAdmissionEnrollment
 * ──────────────────────────────
 * Returns the single canonical admission record for a (Lead × course),
 * creating it (INTERESTED + ENROLLMENT_CREATED event) on first use.
 *
 * CONCURRENCY: two requests for the same (leadId, course) may both
 * attempt `create`; the @@unique([leadId, course]) constraint lets
 * exactly one win and the loser resolves the P2002 to the existing row
 * — never a second record. An existing record is returned regardless of
 * its current state (getOrCreate never re-creates; a LOST/NOT_INTERESTED
 * record is re-entered via an explicit transition, not a new row).
 */
export async function getOrCreateAdmissionEnrollment(
  input: NewAdmissionEnrollmentInput,
): Promise<{ enrollment: import("@prisma/client").AdmissionEnrollment; created: boolean }> {
  const course = normalizeAdmissionCourse(input.course);
  if (!course) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.INVALID_COURSE,
      `"${input.course}" is not a canonical coaching course`,
    );
  }
  const actor = input.actor ?? AdmissionActor.SYSTEM;
  if (!canCreateAdmissionEnrollment(actor)) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.FORBIDDEN_ACTOR,
      `Actor ${actor} may not create an admission enrollment`,
    );
  }

  try {
    const enrollment = await prisma.$transaction(async (tx) => {
      const created = await tx.admissionEnrollment.create({
        data: { leadId: input.leadId, course },
      });
      await tx.admissionEvent.create({
        data: {
          admissionEnrollmentId: created.id,
          action: AdmissionEventAction.ENROLLMENT_CREATED,
          previousState: null,
          nextState: AdmissionState.INTERESTED,
          actor,
          actorId: input.actorId ?? null,
          reason: input.reason ?? null,
          eventKey: buildAdmissionEventKey(
            created.id,
            AdmissionEventAction.ENROLLMENT_CREATED,
            actor,
          ),
        },
      });
      return created;
    });
    return { enrollment, created: true };
  } catch (err) {
    if (isUniqueViolation(err)) {
      const existing = await prisma.admissionEnrollment.findUnique({
        where: { leadId_course: { leadId: input.leadId, course } },
      });
      if (existing) return { enrollment: existing, created: false };
    }
    throw err;
  }
}

/** Read the canonical record for a (Lead × course); null when there is
 *  no active conversion journey (absence = NONE). */
export async function getAdmissionEnrollment(
  input: GetAdmissionEnrollmentInput,
): Promise<import("@prisma/client").AdmissionEnrollment | null> {
  const course = normalizeAdmissionCourse(input.course);
  if (!course) return null;
  return prisma.admissionEnrollment.findUnique({
    where: { leadId_course: { leadId: input.leadId, course } },
  });
}

/** Read a record by id with its full immutable event history. */
export async function getAdmissionEnrollmentById(
  admissionEnrollmentId: string,
): Promise<
  | (import("@prisma/client").AdmissionEnrollment & {
      events: import("@prisma/client").AdmissionEvent[];
    })
  | null
> {
  return prisma.admissionEnrollment.findUnique({
    where: { id: admissionEnrollmentId },
    include: { events: { orderBy: { createdAt: "asc" as const } } },
  });
}

// ═════════════════════════════════════════════════════════════════
// TRANSITIONS
// ═════════════════════════════════════════════════════════════════

/**
 * recordAdmissionTransition
 * ─────────────────────────
 * Moves a record to `toState` if and only if the pure lifecycle allows
 * it (graph + actor authority). The row write is an atomic
 * compare-and-swap (UPDATE ... WHERE state = previous), so two
 * concurrent writers of the SAME transition can never both apply it;
 * the event insert rides the same transaction and is additionally
 * protected by @@unique([admissionEnrollmentId, eventKey]).
 */
export async function recordAdmissionTransition(
  input: AdmissionTransitionInput,
): Promise<{
  enrollment: import("@prisma/client").AdmissionEnrollment;
  event: import("@prisma/client").AdmissionEvent | null;
  applied: boolean;
}> {
  const { enrollmentId, toState, actor } = input;

  if (!isAdmissionState(toState)) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.INVALID_STATE,
      `"${String(toState)}" is not a canonical admission state`,
    );
  }

  const current = await prisma.admissionEnrollment.findUnique({
    where: { id: enrollmentId },
  });
  if (!current) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.NOT_FOUND,
      `Admission enrollment ${enrollmentId} not found`,
    );
  }
  if (current.state === toState) {
    // Already at the target — a repeat of an applied transition.
    return { enrollment: current, event: null, applied: false };
  }

  assertAdmissionTransition(current.state, toState, actor);

  // S6-F1 — validate an explicitly provided follow-up date BEFORE any
  // write. Past dates are rejected for a new/rescheduled follow-up.
  let nextFollowUpAt: Date | null = null;
  if (input.nextFollowUpAt !== undefined) {
    if (input.nextFollowUpAt === "CLEAR" || input.nextFollowUpAt === null) {
      nextFollowUpAt = null;
    } else {
      if (!isValidFollowUpDate(input.nextFollowUpAt)) {
        throw new AdmissionLifecycleError(
          AdmissionLifecycleErrorCode.INVALID_STATE,
          "A scheduled follow-up date must be in the future.",
        );
      }
      nextFollowUpAt = new Date(input.nextFollowUpAt);
    }
  }

  const eventKey = buildTransitionEventKey(
    enrollmentId,
    current.state,
    toState,
    actor,
    input.discriminator,
  );

  try {
    const event = await prisma.$transaction(async (tx) => {
      const updated = await tx.admissionEnrollment.updateMany({
        where: { id: enrollmentId, state: current.state },
        data: {
          state: toState,
          contactedAt:
            toState === AdmissionState.COUNSELLOR_CONTACTED
              ? current.contactedAt ?? new Date()
              : current.contactedAt,
          // S6-F1 — entering FOLLOW_UP_REQUIRED sets/clears the date;
          // leaving it auto-clears (a follow-up is resolved by moving on).
          nextFollowUpAt:
            toState === AdmissionState.FOLLOW_UP_REQUIRED
              ? input.nextFollowUpAt === undefined
                ? current.nextFollowUpAt
                : nextFollowUpAt
              : current.state === AdmissionState.FOLLOW_UP_REQUIRED
                ? null
                : current.nextFollowUpAt,
        },
      });
      if (updated.count === 0) {
        // A concurrent writer already moved this row.
        return null;
      }
      return tx.admissionEvent.create({
        data: {
          admissionEnrollmentId: enrollmentId,
          action: derivationTargetAction(current.state, toState),
          previousState: current.state,
          nextState: toState,
          actor,
          actorId: input.actorId ?? null,
          reason: input.reason ?? null,
          eventKey,
        },
      });
    });

    const enrollment = await prisma.admissionEnrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!enrollment) {
      throw new AdmissionLifecycleError(
        AdmissionLifecycleErrorCode.NOT_FOUND,
        `Admission enrollment ${enrollmentId} vanished`,
      );
    }

    if (event) return { enrollment, event, applied: true };

    // Lost a race but the target state was reached by the winner.
    if (enrollment.state === toState) {
      return { enrollment, event: null, applied: false };
    }
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.CONCURRENT_MODIFICATION,
      `Concurrent state modification on admission enrollment ${enrollmentId}`,
    );
  } catch (err) {
    if (isUniqueViolation(err)) {
      // Idempotency-key backstop: this logical transition event already
      // exists (sequential repeat or a parallel winner). The updateMany
      // rolled back with the failed insert, so nothing changed here.
      const existing = await prisma.admissionEvent.findUnique({
        where: {
          admissionEnrollmentId_eventKey: { admissionEnrollmentId: enrollmentId, eventKey },
        },
      });
      const enrollment = await prisma.admissionEnrollment.findUnique({
        where: { id: enrollmentId },
      });
      return { enrollment: enrollment!, event: existing, applied: false };
    }
    throw err;
  }
}

// ═════════════════════════════════════════════════════════════════
// FREE-FORM EVENTS
// ═════════════════════════════════════════════════════════════════

/**
 * recordAdmissionEvent
 * ────────────────────
 * Adds an immutable audit event without changing state (notes, student
 * claims, system notes). Passing a `discriminator` makes the event
 * idempotent under the (enrollmentId, eventKey) unique index; omitting
 * it records a free-form occurrence that is always inserted.
 *
 * SAFETY: PAYMENT_VERIFIED / ADMISSION_CONFIRMED / ADMISSION_COMPLETED
 * can never be emitted by STUDENT, AI or SYSTEM — the pure module
 * rejects them before any write.
 */
export async function recordAdmissionEvent(
  input: AdmissionEventInput,
): Promise<{
  event: import("@prisma/client").AdmissionEvent;
  applied: boolean;
}> {
  assertAdmissionEventActionAllowed(input.action, input.actor);

  const enrollment = await prisma.admissionEnrollment.findUnique({
    where: { id: input.enrollmentId },
  });
  if (!enrollment) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.NOT_FOUND,
      `Admission enrollment ${input.enrollmentId} not found`,
    );
  }

  const eventKey = input.discriminator
    ? buildAdmissionEventKey(
        input.enrollmentId,
        input.action,
        input.actor,
        input.discriminator,
      )
    : null;

  try {
    const event = await prisma.$transaction(async (tx) => {
      await tx.admissionEnrollment.update({
        where: { id: input.enrollmentId },
        data: { updatedAt: new Date() },
      });
      return tx.admissionEvent.create({
        data: {
          admissionEnrollmentId: input.enrollmentId,
          action: input.action,
          previousState: null,
          nextState: enrollment.state,
          actor: input.actor,
          actorId: input.actorId ?? null,
          reason: input.reason ?? null,
          eventKey,
        },
      });
    });
    return { event, applied: true };
  } catch (err) {
    if (isUniqueViolation(err) && eventKey) {
      const existing = await prisma.admissionEvent.findUnique({
        where: {
          admissionEnrollmentId_eventKey: {
            admissionEnrollmentId: input.enrollmentId,
            eventKey,
          },
        },
      });
      return { event: existing ?? err as never, applied: false };
    }
    throw err;
  }
}

// ═════════════════════════════════════════════════════════════════
// COUNSELLOR ASSIGNMENT
// ═════════════════════════════════════════════════════════════════

/**
 * setCounsellorAssignment
 * ───────────────────────
 * Assigns (or releases) a counsellor on the admission record.
 *
 * Assignment is a human (COUNSELLOR | ADMIN) action and — as in S5-D/E
 * and S6-A — does NOT imply the student was contacted: it never bumps
 * `state` and never sets `contactedAt`. Contact is recorded only via a
 * COUNSELLOR_CONTACTED transition. Each assignment produces its own
 * COUNSELLOR_ASSIGNED audit event (no idempotency key: repeated
 * hand-overs are genuinely distinct occurrences).
 */
export async function setCounsellorAssignment(
  input: AdmissionAssignmentInput,
): Promise<{
  enrollment: import("@prisma/client").AdmissionEnrollment;
}> {
  if (input.actor !== AdmissionActor.COUNSELLOR && input.actor !== AdmissionActor.ADMIN) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.FORBIDDEN_ACTOR,
      `Only COUNSELLOR or ADMIN may assign a counsellor; actor=${input.actor}`,
    );
  }

  const current = await prisma.admissionEnrollment.findUnique({
    where: { id: input.enrollmentId },
  });
  if (!current) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.NOT_FOUND,
      `Admission enrollment ${input.enrollmentId} not found`,
    );
  }

  if (input.staffId) {
    const staff = await prisma.staff.findUnique({ where: { id: input.staffId } });
    if (!staff) {
      throw new AdmissionLifecycleError(
        AdmissionLifecycleErrorCode.NOT_FOUND,
        `Staff ${input.staffId} not found`,
      );
    }
  }

  const enrollment = await prisma.$transaction(async (tx) => {
    const updated = await tx.admissionEnrollment.update({
      where: { id: input.enrollmentId },
      data: { assignedCounsellorId: input.staffId },
    });
    await tx.admissionEvent.create({
      data: {
        admissionEnrollmentId: input.enrollmentId,
        action: AdmissionEventAction.COUNSELLOR_ASSIGNED,
        previousState: null,
        nextState: updated.state,
        actor: input.actor,
        actorId: input.actorId ?? input.staffId ?? null,
        reason: input.reason ?? null,
        eventKey: null,
      },
    });
    return updated;
  });

  return { enrollment };
}

// ═════════════════════════════════════════════════════════════════
// S6-F1 — COUNSELLOR FOLLOW-UP SCHEDULING + ATTEMPTS
// ═════════════════════════════════════════════════════════════════
//
// `nextFollowUpAt` (single live column) is written ONLY here and in
// recordAdmissionTransition. Every change is also preserved as an
// immutable AdmissionEvent — never an in-place edit of history.
//
//   · setNextFollowUpDate  → schedule / reschedule / clear the date
//     (an explicit, human, COUNSELLOR|ADMIN action). Used when the
//     record ALREADY sits in FOLLOW_UP_REQUIRED and the counsellor
//     changes the date; the entering transition path is handled by
//     recordAdmissionTransition. Past dates are rejected.
//   · recordFollowUpAttempt → a counsellor/admin records that they made
//     the follow-up attempt. It CLEARS nextFollowUpAt (the scheduled
//     moment has been acted on) and appends a distinct
//     FOLLOW_UP_ATTEMPTED event, keyed by a REQUIRED discriminator so
//     separate attempts are never swallowed by the unique index. It does
//     NOT change state — the outcome (still interested / moved on) is a
//     subsequent explicit transition.
//
// STUDENT, AI and SYSTEM can NEVER invoke these — same human-only gate
// as setCounsellorAssignment.
// ═════════════════════════════════════════════════════════════════

export type SetNextFollowUpDateInput = {
  enrollmentId: string;
  /** Date → future-only; null → clear the scheduled follow-up. */
  nextFollowUpAt: Date | null;
  actor: AdmissionActor;
  actorId?: string | null;
  reason?: string | null;
  /** Optional idempotency discriminator for the scheduling event. */
  discriminator?: string;
};

export type SetNextFollowUpDateResult = {
  enrollment: import("@prisma/client").AdmissionEnrollment;
  event: import("@prisma/client").AdmissionEvent | null;
  applied: boolean;
};

export async function setNextFollowUpDate(
  input: SetNextFollowUpDateInput,
): Promise<SetNextFollowUpDateResult> {
  if (
    input.actor !== AdmissionActor.COUNSELLOR &&
    input.actor !== AdmissionActor.ADMIN
  ) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.FORBIDDEN_ACTOR,
      `Only COUNSELLOR or ADMIN may schedule a follow-up; actor=${input.actor}`,
    );
  }

  let nextFollowUpAt: Date | null;
  if (input.nextFollowUpAt === null) {
    nextFollowUpAt = null;
  } else {
    if (!isValidFollowUpDate(input.nextFollowUpAt)) {
      throw new AdmissionLifecycleError(
        AdmissionLifecycleErrorCode.INVALID_STATE,
        "A scheduled follow-up date must be in the future.",
      );
    }
    nextFollowUpAt = new Date(input.nextFollowUpAt);
  }

  const current = await prisma.admissionEnrollment.findUnique({
    where: { id: input.enrollmentId },
  });
  if (!current) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.NOT_FOUND,
      `Admission enrollment ${input.enrollmentId} not found`,
    );
  }

  const reason = input.reason ?? null;
  const eventKey = buildAdmissionEventKey(
    input.enrollmentId,
    AdmissionEventAction.FOLLOW_UP_REQUIRED,
    input.actor,
    input.discriminator,
  );

  try {
    const event = await prisma.$transaction(async (tx) => {
      const updated = await tx.admissionEnrollment.updateMany({
        where: { id: input.enrollmentId, nextFollowUpAt: current.nextFollowUpAt },
        data: { nextFollowUpAt },
      });
      if (updated.count === 0) {
        // Either unchanged or a concurrent writer moved the date.
        return "NOOP" as const;
      }
      return tx.admissionEvent.create({
        data: {
          admissionEnrollmentId: input.enrollmentId,
          action: AdmissionEventAction.FOLLOW_UP_REQUIRED,
          previousState: current.state,
          nextState: current.state,
          actor: input.actor,
          actorId: input.actorId ?? null,
          reason: reason ?? (nextFollowUpAt ? `Scheduled follow-up` : "Follow-up date cleared"),
          eventKey,
        },
      });
    });

    const enrollment = await prisma.admissionEnrollment.findUnique({
      where: { id: input.enrollmentId },
    });
    if (!enrollment) {
      throw new AdmissionLifecycleError(
        AdmissionLifecycleErrorCode.NOT_FOUND,
        `Admission enrollment ${input.enrollmentId} vanished`,
      );
    }

    if (event === "NOOP") {
      // The date already matches the requested value (or a concurrent
      // writer applied it) — nothing mutable to record.
      return { enrollment, event: null, applied: false };
    }
    return { enrollment, event, applied: true };
  } catch (err) {
    if (isUniqueViolation(err)) {
      // Same scheduling event already recorded — report applied:false.
      const existing = await prisma.admissionEvent.findUnique({
        where: {
          admissionEnrollmentId_eventKey: {
            admissionEnrollmentId: input.enrollmentId,
            eventKey: eventKey,
          },
        },
      });
      const enrollment = await prisma.admissionEnrollment.findUnique({
        where: { id: input.enrollmentId },
      });
      return { enrollment: enrollment!, event: existing ?? null, applied: false };
    }
    throw err;
  }
}

export type FollowUpAttemptInput = {
  enrollmentId: string;
  actor: AdmissionActor;
  actorId?: string | null;
  reason?: string | null;
  /**
   * REQUIRED (or auto-generated) — guarantees each separate attempt is a
   * distinct FOLLOW_UP_ATTEMPTED event and is never collapsed by the
   * (admissionEnrollmentId, eventKey) unique index.
   */
  discriminator?: string;
};

export type FollowUpAttemptResult = {
  enrollment: import("@prisma/client").AdmissionEnrollment;
  event: import("@prisma/client").AdmissionEvent;
  applied: boolean;
};

export async function recordFollowUpAttempt(
  input: FollowUpAttemptInput,
): Promise<FollowUpAttemptResult> {
  if (
    input.actor !== AdmissionActor.COUNSELLOR &&
    input.actor !== AdmissionActor.ADMIN
  ) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.FORBIDDEN_ACTOR,
      `Only COUNSELLOR or ADMIN may record a follow-up attempt; actor=${input.actor}`,
    );
  }

  const current = await prisma.admissionEnrollment.findUnique({
    where: { id: input.enrollmentId },
  });
  if (!current) {
    throw new AdmissionLifecycleError(
      AdmissionLifecycleErrorCode.NOT_FOUND,
      `Admission enrollment ${input.enrollmentId} not found`,
    );
  }

  // REQUIRED discriminator — if the caller did not pass one we mint a
  // unique one so no two attempts share an event key.
  const discriminator =
    input.discriminator ?? `a:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const eventKey = buildAdmissionEventKey(
    input.enrollmentId,
    AdmissionEventAction.FOLLOW_UP_ATTEMPTED,
    input.actor,
    discriminator,
  );

  const event = await prisma.$transaction(async (tx) => {
    await tx.admissionEnrollment.update({
      where: { id: input.enrollmentId },
      // An attempt fulfils the scheduled moment: clear it. State is NOT
      // changed — the outcome is a separate explicit transition.
      data: { nextFollowUpAt: null },
    });
    return tx.admissionEvent.create({
      data: {
        admissionEnrollmentId: input.enrollmentId,
        action: AdmissionEventAction.FOLLOW_UP_ATTEMPTED,
        previousState: current.state,
        nextState: current.state,
        actor: input.actor,
        actorId: input.actorId ?? null,
        reason: input.reason ?? null,
        eventKey,
      },
    });
  });

  const enrollment = await prisma.admissionEnrollment.findUnique({
    where: { id: input.enrollmentId },
  });
  return { enrollment: enrollment!, event, applied: true };
}