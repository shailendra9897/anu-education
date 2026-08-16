import prisma from "@/lib/prisma";
import { PortalAccessStatus } from "@prisma/client";

export type CreatePortalAccessRequestInput = {
  conversationId?: string;
  demoBookingId?: string;
  studentName: string;
  email: string;
  phone: string;
  course?: string;
};

/**
 * Create a portal access request.
 *
 * Duplicate protection:
 * 1. Same demoBookingId → return existing request.
 * 2. Otherwise same email + active request → return existing request.
 */
export async function createPortalAccessRequest(
  input: CreatePortalAccessRequestInput,
) {
  // Primary duplicate protection: same demo booking.
  if (input.demoBookingId) {
    const existingByBooking =
      await prisma.portalAccessRequest.findFirst({
        where: {
          demoBookingId: input.demoBookingId,
          status: {
            in: [
              PortalAccessStatus.PENDING,
              PortalAccessStatus.PROCESSING,
              PortalAccessStatus.COMPLETED,
            ],
          },
        },
      });

    if (existingByBooking) {
      return existingByBooking;
    }
  }

  // Secondary protection: same email with an active request.
  const existingByEmail =
    await prisma.portalAccessRequest.findFirst({
      where: {
        email: input.email,
        status: {
          in: [
            PortalAccessStatus.PENDING,
            PortalAccessStatus.PROCESSING,
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (existingByEmail) {
    return existingByEmail;
  }

  return prisma.portalAccessRequest.create({
    data: {
      conversationId: input.conversationId,
      demoBookingId: input.demoBookingId,
      studentName: input.studentName,
      email: input.email,
      phone: input.phone,
      course: input.course,
      status: PortalAccessStatus.PENDING,
      attemptCount: 0,
    },
  });
}

/**
 * Get one portal access request.
 */
export async function getPortalAccessRequest(id: string) {
  return prisma.portalAccessRequest.findUnique({
    where: { id },
    include: {
      conversation: true,
    },
  });
}

/**
 * List requests for the admin queue.
 */
export async function listPortalAccessRequests(
  status?: PortalAccessStatus,
) {
  return prisma.portalAccessRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Move a request into PROCESSING.
 */
export async function markPortalAccessProcessing(
  id: string,
  processedBy?: string,
) {
  return prisma.portalAccessRequest.update({
    where: { id },
    data: {
      status: PortalAccessStatus.PROCESSING,
      attemptCount: {
        increment: 1,
      },
      lastAttemptAt: new Date(),
      processedBy,
      errorMessage: null,
      failedAt: null,
    },
  });
}

/**
 * Mark portal access as successfully completed.
 */
export async function markPortalAccessCompleted(
  id: string,
  input?: {
    portalStudentId?: string;
    portalLogin?: string;
    notes?: string;
  },
) {
  return prisma.portalAccessRequest.update({
    where: { id },
    data: {
      status: PortalAccessStatus.COMPLETED,
      portalStudentId: input?.portalStudentId,
      portalLogin: input?.portalLogin,
      notes: input?.notes,
      completedAt: new Date(),
      errorMessage: null,
      failedAt: null,
    },
  });
}

/**
 * Mark portal access as failed.
 */
export async function markPortalAccessFailed(
  id: string,
  errorMessage: string,
) {
  return prisma.portalAccessRequest.update({
    where: { id },
    data: {
      status: PortalAccessStatus.FAILED,
      failedAt: new Date(),
      errorMessage: errorMessage.slice(0, 2000),
    },
  });
}

/**
 * Reset a failed request so it can be attempted again.
 */
export async function retryPortalAccess(id: string) {
  return prisma.portalAccessRequest.update({
    where: { id },
    data: {
      status: PortalAccessStatus.PENDING,
      errorMessage: null,
      failedAt: null,
    },
  });
}