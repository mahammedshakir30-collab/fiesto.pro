"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const platformUser = await prisma.platformUser.findUnique({
    where: { userId: session.user.id }
  });

  if (platformUser?.role !== 'SUPER_ADMIN') {
    throw new Error("Forbidden: Super Admin only");
  }
}

export async function createGlobalFlag(formData: FormData) {
  await requireSuperAdmin();

  const key = formData.get("key") as string;
  const description = formData.get("description") as string;
  const enabled = formData.get("enabled") === 'true';

  if (!key) throw new Error("Flag key is required");

  // ensure uppercase snake_case
  const formattedKey = key.toUpperCase().replace(/\s+/g, '_');

  await prisma.globalFeatureFlag.create({
    data: {
      key: formattedKey,
      description,
      enabled
    }
  });

  revalidatePath("/admin/feature-flags");
}

export async function toggleGlobalFlag(key: string, enabled: boolean) {
  await requireSuperAdmin();

  await prisma.globalFeatureFlag.update({
    where: { key },
    data: { enabled }
  });

  revalidatePath("/admin/feature-flags");
}
