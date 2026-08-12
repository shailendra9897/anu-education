import prisma from "@/lib/prisma";

export type CreatePortalAccessRequestInput = {
  conversationId?: string;
  demoBookingId?: string;
  studentName: string;
  email: string;
  phone: string;
  course?: string;
};

export async function createPortalAccessRequest(
  input: CreatePortalAccessRequestInput,
) {
  const existing = await prisma.portalAccessRequest.findFirst({
    where: {
      email: input.email,
      status: {
        in: ["PENDING", "PROCESSING"],
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.portalAccessRequest.create({
    data: {
      conversationId: input.conversationId,
      demoBookingId: input.demoBookingId,
      studentName: input.studentName,
      email: input.email,
      phone: input.phone,
      course: input.course,
      status: "PENDING",
    },
  });
}