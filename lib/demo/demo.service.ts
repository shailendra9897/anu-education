import prisma from "@/lib/prisma";
import { DemoBookingStatus } from "@prisma/client";

export type CreateDemoBookingInput = {
  conversationId: string;
  name?: string;
  phone?: string;
  email?: string;
  course?: string;
  preferredBatch?: string;
  preferredDate?: Date;
  notes?: string;
};

export async function createDemoBooking(
  input: CreateDemoBookingInput
) {
  return prisma.demoBooking.create({
    data: {
      conversationId: input.conversationId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      course: input.course,
      preferredBatch: input.preferredBatch,
      preferredDate: input.preferredDate,
      notes: input.notes,
      status: DemoBookingStatus.PENDING,
    },
  });
}

export async function getDemoBooking(id: string) {
  return prisma.demoBooking.findUnique({
    where: { id },
  });
}

export async function listPendingBookings() {
  return prisma.demoBooking.findMany({
    where: {
      status: DemoBookingStatus.PENDING,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateDemoBooking(
  id: string,
  data: Partial<CreateDemoBookingInput>
) {
  return prisma.demoBooking.update({
    where: { id },
    data,
  });
}

export async function confirmDemoBooking(id: string) {
  return prisma.demoBooking.update({
    where: { id },
    data: {
      status: DemoBookingStatus.CONFIRMED,
    },
  });
}

export async function markDemoAttended(id: string) {
  return prisma.demoBooking.update({
    where: { id },
    data: {
      status: DemoBookingStatus.ATTENDED,
    },
  });
}

export async function cancelDemoBooking(id: string) {
  return prisma.demoBooking.update({
    where: { id },
    data: {
      status: DemoBookingStatus.CANCELLED,
    },
  });
}

export type DemoStudentDetailsUpdate = {
  name?: string;
  phone?: string;
  email?: string;
};

export async function updateDemoStudentDetails(
  bookingId: string,
  details: DemoStudentDetailsUpdate,
) {
  return prisma.demoBooking.update({
    where: {
      id: bookingId,
    },
    data: {
      ...(details.name ? { name: details.name } : {}),
      ...(details.phone ? { phone: details.phone } : {}),
      ...(details.email ? { email: details.email } : {}),
    },
  });
}

export async function getDemoBookingByConversation(
  conversationId: string,
) {
  return prisma.demoBooking.findFirst({
    where: {
      conversationId,
      status: {
        not: "CANCELLED",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}