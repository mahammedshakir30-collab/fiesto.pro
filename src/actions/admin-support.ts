"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createFaq(data: { question: string; answer: string; category: string; sortOrder?: number; published?: boolean }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  await prisma.fAQArticle.create({ data });
  revalidatePath('/admin/settings/support');
}

export async function deleteFaq(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  await prisma.fAQArticle.delete({ where: { id } });
  revalidatePath('/admin/settings/support');
}

export async function createTutorial(data: { title: string; youtubeUrl: string; description?: string; category?: string; sortOrder?: number }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  await prisma.tutorialVideo.create({ data });
  revalidatePath('/admin/settings/support');
}

export async function deleteTutorial(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  await prisma.tutorialVideo.delete({ where: { id } });
  revalidatePath('/admin/settings/support');
}
