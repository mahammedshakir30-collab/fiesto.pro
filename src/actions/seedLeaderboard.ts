"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function seedVendorLeaderboard(festivalId: string) {
  // Clear existing
  await prisma.vendorLeaderboardSnapshot.deleteMany({
    where: { festivalId }
  });

  const vendors = await prisma.vendor.findMany({
    where: { festivalId, status: "APPROVED" }
  });

  if (vendors.length === 0) return { success: false, message: "No approved vendors to seed." };

  // Randomize values and sort
  const data = vendors.map(v => ({
    vendorId: v.id,
    value: Math.floor(Math.random() * 5000) + 500, // random revenue between 500 and 5500
  })).sort((a, b) => b.value - a.value);

  const snapshots = data.map((d, index) => ({
    festivalId,
    vendorId: d.vendorId,
    rank: index + 1,
    metric: "revenue",
    value: d.value,
  }));

  await prisma.vendorLeaderboardSnapshot.createMany({
    data: snapshots
  });

  return { success: true };
}
