// FILE: tests/helpers/scoped-cleanup.ts
//
// ID-SCOPED test cleanup.
//
// G1-19 finding H-3: two test files cleaned up with an empty-filter,
// table-wide delete that ran after every test. That is only survivable
// because the suite points at a throwaway local database, but it is
// exactly the pattern that destroys real data if the suite is ever
// pointed at a shared database.
//
// Every helper in this module deletes ONLY rows whose id (or whose parent
// id) is one the test itself created. There is no code path that can
// issue a table-wide delete:
//
//   · a delete is skipped entirely when the matching id list is empty;
//   · every `where` clause is built from an explicit id list;
//   · children are scoped by their PARENT id, so rows created indirectly
//     by a service are still covered.
//
// The module imports nothing — the database handle is injected — so the
// behaviour can be regression-tested with a fake database.

export type CleanupTracker = {
  staffIds: string[];
  leadIds: string[];
  conversationIds: string[];
  messageIds: string[];
  demoBookingIds: string[];
  admissionEnrollmentIds: string[];
  portalAccessRequestIds: string[];
};

export type CleanupDb = {
  staff: { deleteMany(args: { where: unknown }): Promise<unknown> };
  lead: { deleteMany(args: { where: unknown }): Promise<unknown> };
  conversation: { deleteMany(args: { where: unknown }): Promise<unknown> };
  message: { deleteMany(args: { where: unknown }): Promise<unknown> };
  leadContext: { deleteMany(args: { where: unknown }): Promise<unknown> };
  demoBooking: { deleteMany(args: { where: unknown }): Promise<unknown> };
  demoBookingEvent: { deleteMany(args: { where: unknown }): Promise<unknown> };
  admissionEnrollment: { deleteMany(args: { where: unknown }): Promise<unknown> };
  admissionEvent: { deleteMany(args: { where: unknown }): Promise<unknown> };
  portalAccessRequest: { deleteMany(args: { where: unknown }): Promise<unknown> };
};

export function createCleanupTracker(): CleanupTracker {
  return {
    staffIds: [],
    leadIds: [],
    conversationIds: [],
    messageIds: [],
    demoBookingIds: [],
    admissionEnrollmentIds: [],
    portalAccessRequestIds: [],
  };
}

export function resetCleanupTracker(tracker: CleanupTracker): void {
  tracker.staffIds.length = 0;
  tracker.leadIds.length = 0;
  tracker.conversationIds.length = 0;
  tracker.messageIds.length = 0;
  tracker.demoBookingIds.length = 0;
  tracker.admissionEnrollmentIds.length = 0;
  tracker.portalAccessRequestIds.length = 0;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => typeof value === "string" && value !== ""))];
}

/**
 * Delete every row the test created — and nothing else.
 *
 * The order respects the foreign keys. Each delete is skipped when it has
 * no ids to work with, so an empty tracker performs no writes at all.
 */
export async function cleanupScopedRecords(
  db: CleanupDb,
  tracker: CleanupTracker,
): Promise<void> {
  const staffIds = unique(tracker.staffIds);
  const leadIds = unique(tracker.leadIds);
  const conversationIds = unique(tracker.conversationIds);
  const messageIds = unique(tracker.messageIds);
  const demoBookingIds = unique(tracker.demoBookingIds);
  const admissionEnrollmentIds = unique(tracker.admissionEnrollmentIds);
  const portalAccessRequestIds = unique(tracker.portalAccessRequestIds);

  // 1. Children of admissions.
  if (admissionEnrollmentIds.length > 0) {
    await db.admissionEvent
      .deleteMany({
        where: { admissionEnrollmentId: { in: admissionEnrollmentIds } },
      })
      .catch(() => {});
  }

  // 2. Children of demo bookings.
  if (demoBookingIds.length > 0) {
    await db.demoBookingEvent
      .deleteMany({ where: { demoBookingId: { in: demoBookingIds } } })
      .catch(() => {});
  }

  // 3. Rows that belong to a test conversation (directly or via a parent).
  if (messageIds.length > 0 || conversationIds.length > 0) {
    await db.message
      .deleteMany({
        where: {
          OR: [
            ...(messageIds.length > 0 ? [{ id: { in: messageIds } }] : []),
            ...(conversationIds.length > 0
              ? [{ conversationId: { in: conversationIds } }]
              : []),
          ],
        },
      })
      .catch(() => {});
  }

  if (conversationIds.length > 0) {
    await db.leadContext
      .deleteMany({ where: { conversationId: { in: conversationIds } } })
      .catch(() => {});
  }

  // 4. Rows that belong to a test lead.
  if (demoBookingIds.length > 0 || conversationIds.length > 0) {
    await db.demoBooking
      .deleteMany({
        where: {
          OR: [
            ...(demoBookingIds.length > 0 ? [{ id: { in: demoBookingIds } }] : []),
            ...(conversationIds.length > 0
              ? [{ conversationId: { in: conversationIds } }]
              : []),
          ],
        },
      })
      .catch(() => {});
  }

  if (portalAccessRequestIds.length > 0 || leadIds.length > 0) {
    await db.portalAccessRequest
      .deleteMany({
        where: {
          OR: [
            ...(portalAccessRequestIds.length > 0
              ? [{ id: { in: portalAccessRequestIds } }]
              : []),
            ...(leadIds.length > 0 ? [{ leadId: { in: leadIds } }] : []),
          ],
        },
      })
      .catch(() => {});
  }

  if (admissionEnrollmentIds.length > 0) {
    await db.admissionEnrollment
      .deleteMany({ where: { id: { in: admissionEnrollmentIds } } })
      .catch(() => {});
  }

  // 5. The records themselves.
  if (conversationIds.length > 0) {
    await db.conversation
      .deleteMany({ where: { id: { in: conversationIds } } })
      .catch(() => {});
  }

  if (leadIds.length > 0) {
    await db.lead.deleteMany({ where: { id: { in: leadIds } } }).catch(() => {});
  }

  if (staffIds.length > 0) {
    await db.staff.deleteMany({ where: { id: { in: staffIds } } }).catch(() => {});
  }
}
