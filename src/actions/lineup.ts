"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createStage(festivalId: string, data: { name: string, capacity?: number, indoor?: boolean }) {
  await prisma.stage.create({
    data: {
      festivalId,
      name: data.name,
      capacity: data.capacity,
      indoor: data.indoor || false
    }
  });
  revalidatePath(`/organizer/${festivalId}/stages`);
}

export async function getStages(festivalId: string): Promise<Prisma.StageGetPayload<{}>[]> {
  return prisma.stage.findMany({ where: { festivalId } });
}

export async function getArtists(): Promise<Prisma.ArtistGetPayload<{}>[]> {
  return prisma.artist.findMany();
}

export async function getLineupSlots(festivalId: string): Promise<Prisma.LineupSlotGetPayload<{ include: { artist: true, stage: true } }>[]> {
  return prisma.lineupSlot.findMany({
    where: { festivalId },
    include: { artist: true, stage: true },
    orderBy: { startTime: "asc" }
  });
}
