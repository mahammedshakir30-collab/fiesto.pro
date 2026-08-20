"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaginatedResponse } from "@/lib/types";
import { Prisma } from "@prisma/client";

// Used across components
export type FestivalWithRelations = Prisma.FestivalGetPayload<{
  include: {
    coOrganizers: { include: { organizer: true } };
    stages: true;
    ticketTiers: true;
  }
}>;

export async function getPublicFestivals(page = 1, limit = 10): Promise<PaginatedResponse<FestivalWithRelations>> {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    prisma.festival.findMany({
      where: {
        status: { in: ["PUBLISHED", "LIVE"] }
      },
      include: {
        coOrganizers: { include: { organizer: true } },
        stages: true,
        ticketTiers: true,
      },
      skip,
      take: limit,
      orderBy: { startDate: "asc" }
    }),
    prisma.festival.count({
      where: { status: { in: ["PUBLISHED", "LIVE"] } }
    })
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}

export async function getFestivalBySlug(slug: string): Promise<FestivalWithRelations | null> {
  return prisma.festival.findUnique({
    where: { slug },
    include: {
      coOrganizers: { include: { organizer: true } },
      stages: true,
      ticketTiers: true,
    }
  });
}

export async function getOrganizerFestivals(page = 1, limit = 10): Promise<PaginatedResponse<FestivalWithRelations>> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ORGANIZER") {
    throw new Error("Unauthorized");
  }

  const org = await prisma.organizer.findUnique({ where: { userId: session.user.id } });
  if (!org) throw new Error("Organizer profile not found");

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.festival.findMany({
      where: {
        coOrganizers: { some: { organizerId: org.id } }
      },
      include: {
        coOrganizers: { include: { organizer: true } },
        stages: true,
        ticketTiers: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.festival.count({
      where: { coOrganizers: { some: { organizerId: org.id } } }
    })
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}

export async function getAdminFestivals(page = 1, limit = 10): Promise<PaginatedResponse<FestivalWithRelations>> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.festival.findMany({
      include: {
        coOrganizers: { include: { organizer: true } },
        stages: true,
        ticketTiers: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.festival.count()
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}

export async function updateFestivalStatus(id: string, status: any) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  return prisma.festival.update({ where: { id }, data: { status } });
}

export async function updateFestivalBanner(id: string, coverImageUrl: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ORGANIZER" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }


  // If ORGANIZER, verify they own this festival
  if (session.user.role === "ORGANIZER") {
    const org = await prisma.organizer.findUnique({ where: { userId: session.user.id } });
    if (!org) throw new Error("Organizer profile not found");
    
    const isOwner = await prisma.festivalOrganizer.findFirst({
      where: { festivalId: id, organizerId: org.id }
    });
    if (!isOwner) throw new Error("Unauthorized: You do not own this festival");
  }

  return prisma.festival.update({ 
    where: { id }, 
    data: { coverImageUrl } 
  });
}

export async function createFestival(data: { name: string, description: string, location: string, startDate: string, endDate: string }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  let slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const existing = await prisma.festival.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }

  let org = await prisma.organizer.findUnique({ where: { userId: session.user.id } });
  if (!org) {
    org = await prisma.organizer.create({
      data: {
        userId: session.user.id,
        companyName: session.user.name || "My Organization",
        contactEmail: session.user.email || "",
      }
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const fest = await tx.festival.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: "DRAFT",
      }
    });

    await tx.festivalOrganizer.create({
      data: {
        festivalId: fest.id,
        organizerId: org!.id,
        isOwner: true,
      }
    });

    const adminRole = await tx.role.create({
      data: {
        festivalId: fest.id,
        name: "Administrator",
        description: "Full access to all festival features.",
        panelType: "ADMIN",
        kind: "SYSTEM",
      }
    });

    await tx.userRole.create({
      data: {
        userId: session.user.id,
        roleId: adminRole.id,
        festivalId: fest.id,
      }
    });

    await tx.staffMember.create({
      data: {
        festivalId: fest.id,
        userId: session.user.id,
        active: true,
        canScanTickets: true,
        canEditLineup: true,
        canManageStaff: true,
        canManageVendors: true,
      }
    });

    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ORGANIZER") {
      await tx.user.update({
        where: { id: session.user.id },
        data: { role: "ORGANIZER" }
      });
    }

    return fest;
  });

  return result.id;
}
