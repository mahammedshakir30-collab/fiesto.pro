"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

async function requireOrganizer(festivalId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const festival = await prisma.festival.findUnique({
    where: { id: festivalId },
    include: {
      staffMembers: true,
      coOrganizers: true
    }
  });

  if (!festival) throw new Error("Festival not found");

  const isOrganizer = festival.coOrganizers.some(o => o.organizerId === session.user.id);
  const isStaff = festival.staffMembers.some(s => s.userId === session.user.id);
  
  if (!isOrganizer && !isStaff) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function addTeamPoint(formData: FormData) {
  const festivalId = formData.get("festivalId") as string;
  const session = await requireOrganizer(festivalId);

  const teamId = formData.get("teamId") as string;
  const candidateIdStr = formData.get("candidateId") as string;
  const candidateId = candidateIdStr ? candidateIdStr : null;
  const programmeIdStr = formData.get("programmeId") as string;
  const programmeId = programmeIdStr ? programmeIdStr : null;
  const points = parseFloat(formData.get("points") as string);
  const reason = formData.get("reason") as string;

  if (!teamId || isNaN(points) || !reason) {
    throw new Error("Missing required fields");
  }

  const entry = await prisma.teamPointEntry.create({
    data: {
      festivalId,
      teamId,
      candidateId,
      programmeId,
      points,
      reason,
      awardedBy: session.user.name || session.user.email || 'Organizer'
    },
    include: {
      team: { select: { name: true } },
      programme: { select: { name: true, code: true } }
    }
  });

  // Trigger realtime update via Pusher
  try {
    await pusherServer.trigger(`festival-${festivalId}-standings`, 'points-updated', {
      id: entry.id,
      teamId: entry.teamId,
      points: entry.points,
      teamName: entry.team.name,
      programmeId: entry.programmeId
    });
  } catch (err) {
    console.error("Pusher trigger failed:", err);
  }

  revalidatePath(`/organizer/${festivalId}`);
  if (programmeId) {
    revalidatePath(`/organizer/${festivalId}/programmes/${programmeId}`);
  }
  if (candidateId) {
    revalidatePath(`/organizer/${festivalId}/candidates/${candidateId}`);
  }
  revalidatePath(`/discover/[slug]/standings`, 'page');
  return { success: true, entry };
}

export async function toggleProgrammePointsPublish(festivalId: string, programmeId: string, publish: boolean) {
  await requireOrganizer(festivalId);

  const updated = await prisma.programme.update({
    where: { id: programmeId, festivalId },
    data: {
      pointsPublished: publish,
      pointsPublishedAt: publish ? new Date() : null
    }
  });

  revalidatePath(`/organizer/${festivalId}/programmes/${programmeId}`);
  revalidatePath(`/organizer/${festivalId}/programmes`);
  revalidatePath(`/discover/[slug]/standings`, 'page');
  return { success: true, pointsPublished: updated.pointsPublished };
}

export async function updatePublishState(festivalId: string, data: { published: boolean, showCandidates: boolean, showReasons: boolean }) {
  await requireOrganizer(festivalId);

  await prisma.standingsPublishState.upsert({
    where: { festivalId },
    create: {
      festivalId,
      published: data.published,
      showCandidates: data.showCandidates,
      showReasons: data.showReasons,
      publishedAt: data.published ? new Date() : null
    },
    update: {
      published: data.published,
      showCandidates: data.showCandidates,
      showReasons: data.showReasons,
      publishedAt: data.published ? new Date() : null
    }
  });

  revalidatePath(`/organizer/${festivalId}`);
  revalidatePath(`/discover/[slug]/standings`, 'page');
  return { success: true };
}

export async function getCandidatePointsLedger(festivalId: string, candidateId: string) {
  await requireOrganizer(festivalId);

  return prisma.teamPointEntry.findMany({
    where: { festivalId, candidateId },
    include: {
      programme: { select: { id: true, name: true, code: true } },
      team: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getProgrammePointsLedger(festivalId: string, programmeId: string, candidateId?: string) {
  await requireOrganizer(festivalId);

  return prisma.teamPointEntry.findMany({
    where: { 
      festivalId, 
      programmeId,
      ...(candidateId ? { candidateId } : {})
    },
    include: {
      candidate: { select: { id: true, name: true, chestNumber: true, photoUrl: true } },
      team: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}
