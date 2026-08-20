'use server';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createTemplate(festivalId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  return prisma.template.create({
    data: {
      ...data,
      festivalId
    }
  });
}

export async function togglePublish(id: string, published: boolean) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  return prisma.template.update({
    where: { id },
    data: { 
      published,
      publishedAt: published ? new Date() : null,
      featuredOnHome: published ? undefined : false // remove from home if unpublished
    }
  });
}

export async function toggleFeatured(id: string, featuredOnHome: boolean) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  return prisma.template.update({
    where: { id },
    data: { featuredOnHome }
  });
}

export async function deleteTemplate(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  return prisma.template.delete({
    where: { id }
  });
}
