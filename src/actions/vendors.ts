"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyUsersByPermission } from "@/lib/notification-router";

import { requirePermission } from "@/lib/rbac";

export async function getVendorsForFestival(festivalId: string): Promise<Prisma.VendorGetPayload<{}>[]> {
  await requirePermission(festivalId, "vendors", "view");
  return prisma.vendor.findMany({ where: { festivalId } });
}

export async function getVendorProfile(vendorId: string): Promise<Prisma.VendorGetPayload<{}> | null> {
  return prisma.vendor.findUnique({ where: { id: vendorId } });
}

export async function approveVendor(festivalId: string, vendorId: string) {
  // Enforce server-side RBAC
  await requirePermission(festivalId, "vendors", "approve");
  
  // Stub
  return prisma.vendor.update({
    where: { id: vendorId },
    data: { status: "APPROVED" }
  });
}

export async function submitVendorApplication(festivalId: string, data: { name: string; description: string; category: string }) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const vendor = await prisma.vendor.create({
    data: {
      festivalId,
      userId: session.user.id,
      name: data.name,
      description: data.description,
      category: data.category as any,
      status: "PENDING"
    }
  });

  // Notify Admin/Vendor Coordinator
  await notifyUsersByPermission({
    festivalId,
    resource: "vendors",
    action: "approve",
    title: "New Vendor Application",
    body: `${data.name} has submitted an application for the ${data.category} category.`,
    type: "ACTION_REQUIRED",
    link: `/organizer/${festivalId}/vendors`
  });

  return vendor;
}
