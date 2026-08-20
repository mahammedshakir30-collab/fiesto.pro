"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getOnboardingState(festivalId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ORGANIZER" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  // Fetch all necessary data to compute completion state
  const festival = await prisma.festival.findUnique({
    where: { id: festivalId },
    include: {
      stages: true,
      ticketTiers: true,
      roles: {
        include: { userRoles: true }
      },
      onboardingSteps: true,
    }
  });

  if (!festival) throw new Error("Festival not found");

  // Check if dismissed
  const dismissedStep = festival.onboardingSteps.find(s => s.key === "dismissed");
  if (dismissedStep?.completed) {
    return { dismissed: true, steps: [], progress: 100, completedCount: 7, totalSteps: 7 };
  }

  // 1. Festival Profile — name, dates, description, cover image
  const hasProfile = !!(festival.name && festival.startDate && festival.endDate && festival.description && festival.coverImageUrl);
  
  // 2. Venues — at least one venue/stage added
  const hasVenues = festival.stages.length > 0;
  
  // 3. Ticket Tiers — at least one ticket type configured
  const hasTickets = festival.ticketTiers.length > 0;
  
  // 4. Vendor Applications — vendor application form published (Mocking for now as Vendor settings UI is not full)
  // We'll check if a 'vendor_setup' onboarding step was manually completed, or default to false
  const hasVendorSetup = festival.onboardingSteps.find(s => s.key === "vendor_setup")?.completed || false;
  
  // 5. Staff & Roles — at least one non-Owner role assigned
  const hasStaff = festival.roles.some(r => r.name !== "Owner" && r.userRoles.length > 0);
  
  // 6. Payouts — Stripe Connect account linked
  const hasPayouts = festival.onboardingSteps.find(s => s.key === "payouts")?.completed || false;
  
  // 7. Publish — public site is live
  const hasPublished = festival.status === "PUBLISHED" || festival.status === "LIVE";

  const steps = [
    { key: "profile", completed: hasProfile },
    { key: "venues", completed: hasVenues },
    { key: "tickets", completed: hasTickets },
    { key: "vendors", completed: hasVendorSetup },
    { key: "staff", completed: hasStaff },
    { key: "payouts", completed: hasPayouts },
    { key: "publish", completed: hasPublished }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return {
    dismissed: false,
    steps,
    progress,
    completedCount,
    totalSteps: steps.length
  };
}

export async function dismissOnboardingBanner(festivalId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ORGANIZER" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  await prisma.onboardingStep.upsert({
    where: { festivalId_key: { festivalId, key: "dismissed" } },
    update: { completed: true, completedAt: new Date() },
    create: { festivalId, key: "dismissed", completed: true, completedAt: new Date() }
  });

  return { success: true };
}
