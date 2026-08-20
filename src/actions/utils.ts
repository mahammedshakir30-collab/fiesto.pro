"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getTicketTierById(id: string): Promise<Prisma.TicketTierGetPayload<{}> | null> {
  return prisma.ticketTier.findUnique({ where: { id } });
}

export async function getFestivalById(id: string): Promise<Prisma.FestivalGetPayload<{}> | null> {
  return prisma.festival.findUnique({ where: { id } });
}
