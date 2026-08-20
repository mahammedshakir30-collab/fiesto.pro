"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCandidates(festivalId: string) {
  return await prisma.candidate.findMany({
    where: { festivalId },
    include: {
      category: true,
      team: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getCandidateFormData(festivalId: string) {
  const categories = await prisma.category.findMany({
    where: { festivalId },
    orderBy: { name: "asc" },
  });

  const teams = await prisma.team.findMany({
    where: { festivalId },
    orderBy: { name: "asc" },
  });

  return { categories, teams };
}

export async function createCandidate(festivalId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  const teamId = formData.get("teamId") as string | null;
  const gender = formData.get("gender") as string | null;
  const chestNumber = formData.get("chestNumber") as string | null;
  const photoUrl = formData.get("photoUrl") as string | null;

  if (!name || !categoryId) {
    throw new Error("Name and Category are required");
  }

  const cleanChest = chestNumber?.trim() ? chestNumber.trim() : null;

  if (cleanChest) {
    const duplicate = await prisma.candidate.findFirst({
      where: {
        festivalId,
        chestNumber: cleanChest
      },
      include: { team: true }
    });

    if (duplicate) {
      const teamInfo = duplicate.team?.name ? ` (Team: ${duplicate.team.name})` : '';
      throw new Error(`Chest Number "${cleanChest}" is already assigned to "${duplicate.name}"${teamInfo}. Please choose a unique chest number.`);
    }
  }

  try {
    await prisma.candidate.create({
      data: {
        festivalId,
        name: name.trim(),
        categoryId,
        teamId: teamId || undefined,
        gender: gender || undefined,
        chestNumber: cleanChest || undefined,
        photoUrl: photoUrl || undefined,
      },
    });

    revalidatePath(`/organizer/${festivalId}/candidates`);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw new Error(`Chest Number "${cleanChest}" is already in use by another candidate. Please choose a different number.`);
    }
    throw error;
  }
}

export async function updateCandidate(id: string, festivalId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  const teamId = formData.get("teamId") as string | null;
  const gender = formData.get("gender") as string | null;
  const chestNumber = formData.get("chestNumber") as string | null;
  const photoUrl = formData.get("photoUrl") as string | null;

  if (!name || !categoryId) {
    throw new Error("Name and Category are required");
  }

  const cleanChest = chestNumber?.trim() ? chestNumber.trim() : null;

  if (cleanChest) {
    const duplicate = await prisma.candidate.findFirst({
      where: {
        festivalId,
        chestNumber: cleanChest,
        NOT: { id }
      },
      include: { team: true }
    });

    if (duplicate) {
      const teamInfo = duplicate.team?.name ? ` (Team: ${duplicate.team.name})` : '';
      throw new Error(`Chest Number "${cleanChest}" is already assigned to "${duplicate.name}"${teamInfo}. Please choose a unique chest number.`);
    }
  }

  try {
    await prisma.candidate.update({
      where: { id },
      data: {
        name: name.trim(),
        categoryId,
        teamId: teamId || null,
        gender: gender || null,
        chestNumber: cleanChest || null,
        photoUrl: photoUrl || null,
      },
    });

    revalidatePath(`/organizer/${festivalId}/candidates`);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw new Error(`Chest Number "${cleanChest}" is already in use by another candidate. Please choose a different number.`);
    }
    throw error;
  }
}

export async function deleteCandidate(id: string, festivalId: string) {
  await prisma.candidate.delete({
    where: { id },
  });

  revalidatePath(`/organizer/${festivalId}/candidates`);
}
