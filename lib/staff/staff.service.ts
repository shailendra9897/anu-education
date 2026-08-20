// FILE: lib/staff/staff.service.ts
//
// Server-side Staff CRUD. Used by /api/admin/staff routes.
// Authentication is handled by app/middleware.ts (Basic Auth
// on /api/admin/*). This service does NOT handle auth.

import prisma from "@/lib/prisma";

// ── TYPES ──────────────────────────────────────────────────────

export type CreateStaffInput = {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  active?: boolean;
};

export type UpdateStaffInput = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  active?: boolean;
};

// ── CREATE ─────────────────────────────────────────────────────

export async function createStaff(input: CreateStaffInput) {
  return prisma.staff.create({
    data: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      role: input.role?.trim().toUpperCase() || "COUNSELLOR",
      active: input.active ?? true,
    },
  });
}

// ── READ ───────────────────────────────────────────────────────

export async function getStaff(id: string) {
  return prisma.staff.findUnique({ where: { id } });
}

export async function listStaff(options?: { active?: boolean; role?: string }) {
  const where: Record<string, unknown> = {};

  if (options?.active !== undefined) {
    where.active = options.active;
  }

  if (options?.role) {
    where.role = options.role.toUpperCase();
  }

  return prisma.staff.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * List active counsellors — used by the assignment dropdown.
 * Only returns Staff where active = true AND role = COUNSELLOR.
 */
export async function listActiveCounsellors() {
  return prisma.staff.findMany({
    where: {
      active: true,
      role: "COUNSELLOR",
    },
    orderBy: { name: "asc" },
  });
}

// ── UPDATE ─────────────────────────────────────────────────────

export async function updateStaff(id: string, input: UpdateStaffInput) {
  const data: Record<string, unknown> = {};

  if (input.name !== undefined) data.name = input.name.trim();
  if (input.email !== undefined) data.email = input.email.trim().toLowerCase();
  if (input.phone !== undefined) data.phone = input.phone?.trim() || null;
  if (input.role !== undefined) data.role = input.role.trim().toUpperCase();
  if (input.active !== undefined) data.active = input.active;

  return prisma.staff.update({
    where: { id },
    data,
  });
}

// ── TOGGLE ACTIVE ──────────────────────────────────────────────

export async function toggleStaffActive(id: string) {
  const staff = await prisma.staff.findUnique({ where: { id } });

  if (!staff) {
    throw new Error("Staff not found");
  }

  return prisma.staff.update({
    where: { id },
    data: { active: !staff.active },
  });
}
