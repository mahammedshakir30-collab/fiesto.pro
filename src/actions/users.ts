"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PaginatedResponse } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUsers(page = 1, limit = 10): Promise<PaginatedResponse<Prisma.UserGetPayload<{}> >> {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.user.count()
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}

export async function getOrganizers(page = 1, limit = 10): Promise<PaginatedResponse<Prisma.OrganizerGetPayload<{ include: { user: true } }>>> {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    prisma.organizer.findMany({ include: { user: true }, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.organizer.count()
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}

export async function updateOrganizerVerification(id: string, verified: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");
  return prisma.organizer.update({ where: { id }, data: { verified } });
}
