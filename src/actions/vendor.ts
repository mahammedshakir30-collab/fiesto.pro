"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateVendorProfile(vendorId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { festival: true }
  });

  if (!vendor) throw new Error("Vendor not found");

  // Only the vendor or a SUPER_ADMIN can update their profile
  if (session.user.role !== "SUPER_ADMIN" && vendor.userId !== session.user.id) {
    throw new Error("Unauthorized to edit this vendor profile");
  }

  // Upsert the VendorProfile
  await prisma.vendorProfile.upsert({
    where: { vendorId },
    update: {
      businessName: data.businessName,
      description: data.description,
      logoUrl: data.logoUrl,
      boothPhotos: data.boothPhotos || [],
      category: data.category,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      // boothNumber is typically set by the organizer, so we don't update it from vendor side unless permitted.
      // We will only update if the data includes it (but the UI will probably disable it).
      boothNumber: data.boothNumber || undefined,
    },
    create: {
      vendorId,
      businessName: data.businessName,
      description: data.description,
      logoUrl: data.logoUrl,
      boothPhotos: data.boothPhotos || [],
      category: data.category,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    }
  });

  // Revalidate the paths
  revalidatePath(`/vendor/${vendorId}`);
  revalidatePath(`/vendor/${vendorId}/profile`);
  
  return { success: true };
}

export async function toggleVendorLeaderboard(festivalId: string, enabled: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ORGANIZER")) {
    throw new Error("Unauthorized");
  }

  await prisma.festival.update({
    where: { id: festivalId },
    data: { vendorLeaderboardEnabled: enabled }
  });
  
  revalidatePath(`/organizer/${festivalId}/settings`);
  
  return { success: true };
}
