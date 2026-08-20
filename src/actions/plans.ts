"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FEATURE_REGISTRY } from "@/lib/features";

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

export async function createPlanTier(formData: FormData) {
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  const monthlyPrice = parseFloat(formData.get("monthlyPrice") as string);
  const annualPriceStr = formData.get("annualPrice") as string;
  const annualPrice = annualPriceStr ? parseFloat(annualPriceStr) : null;
  const maxFestivalsStr = formData.get("maxFestivals") as string;
  const maxFestivals = maxFestivalsStr ? parseInt(maxFestivalsStr, 10) : null;
  const maxStaffStr = formData.get("maxStaffPerFestival") as string;
  const maxStaffPerFestival = maxStaffStr ? parseInt(maxStaffStr, 10) : null;
  const tagline = formData.get("tagline") as string || null;
  const badge = formData.get("badge") as string || null;
  const isContactSales = formData.get("isContactSales") === 'true';
  const durationOptions = formData.get("durationOptions") ? JSON.parse(formData.get("durationOptions") as string) : [];
  const featureList = formData.get("featureList") ? JSON.parse(formData.get("featureList") as string) : [];

  // Gather entitlements
  const featureEntitlements: Record<string, boolean> = {};
  for (const feature of FEATURE_REGISTRY) {
    featureEntitlements[feature.key] = formData.get(`feature_${feature.key}`) === 'on';
  }

  // Calculate next sort order
  const maxOrderPlan = await prisma.planTier.findFirst({
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true }
  });
  const sortOrder = maxOrderPlan ? maxOrderPlan.sortOrder + 1 : 0;

  await prisma.planTier.create({
    data: {
      name,
      monthlyPrice,
      annualPrice,
      maxFestivals,
      maxStaffPerFestival,
      featureEntitlements,
      sortOrder,
      tagline,
      badge,
      isContactSales,
      durationOptions,
      featureList
    }
  });

  revalidatePath("/admin/plans");
}

export async function updateFestivalPlan(formData: FormData) {
  await requireSuperAdmin();

  const festivalId = formData.get("festivalId") as string;
  const planTierId = formData.get("planTierId") as string;
  const trialEndsAtStr = formData.get("trialEndsAt") as string;

  if (!festivalId) throw new Error("Festival ID is required");

  const trialEndsAt = trialEndsAtStr ? new Date(trialEndsAtStr) : null;
  const planIdToUse = planTierId === "none" ? null : planTierId;

  await prisma.festival.update({
    where: { id: festivalId },
    data: {
      planTierId: planIdToUse,
      trialEndsAt
    }
  });

  revalidatePath("/admin/organizers/[id]", "page");
}

export async function updatePlanTier(planId: string, formData: FormData) {
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  const monthlyPrice = parseFloat(formData.get("monthlyPrice") as string);
  const annualPriceStr = formData.get("annualPrice") as string;
  const annualPrice = annualPriceStr ? parseFloat(annualPriceStr) : null;
  const maxFestivalsStr = formData.get("maxFestivals") as string;
  const maxFestivals = maxFestivalsStr ? parseInt(maxFestivalsStr, 10) : null;
  const maxStaffStr = formData.get("maxStaffPerFestival") as string;
  const maxStaffPerFestival = maxStaffStr ? parseInt(maxStaffStr, 10) : null;
  const tagline = formData.get("tagline") as string || null;
  const badge = formData.get("badge") as string || null;
  const isContactSales = formData.get("isContactSales") === 'true';
  const durationOptions = formData.get("durationOptions") ? JSON.parse(formData.get("durationOptions") as string) : [];
  const featureList = formData.get("featureList") ? JSON.parse(formData.get("featureList") as string) : [];

  const featureEntitlements: Record<string, boolean> = {};
  for (const feature of FEATURE_REGISTRY) {
    featureEntitlements[feature.key] = formData.get('feature_' + feature.key) === 'on';
  }

  await prisma.planTier.update({
    where: { id: planId },
    data: {
      name,
      monthlyPrice,
      annualPrice,
      maxFestivals,
      maxStaffPerFestival,
      featureEntitlements,
      tagline,
      badge,
      isContactSales,
      durationOptions,
      featureList
    }
  });

  revalidatePath("/admin/plans");
}

