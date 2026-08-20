"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getAnnouncements(festivalId: string): Promise<Prisma.AnnouncementGetPayload<{}>[]> {
  return prisma.announcement.findMany({
    where: { festivalId },
    orderBy: { createdAt: "desc" }
  });
}
