"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyUsersByPermission } from "@/lib/notification-router";
import { PaginatedResponse } from "@/lib/types";
import { Prisma } from "@prisma/client";

import { requirePermission } from "@/lib/rbac";

export async function getTicketTiers(festivalId: string): Promise<Prisma.TicketTierGetPayload<{}>[]> {
  // Allow view if they have tickets:view
  await requirePermission(festivalId, "tickets", "view");
  return prisma.ticketTier.findMany({
    where: { festivalId },
    orderBy: { price: "asc" }
  });
}

export async function createTicketTier(festivalId: string, data: any) {
  // Enforce server-side RBAC
  await requirePermission(festivalId, "tickets", "create");
  
  // Implementation stub...
  console.log("Creating ticket tier:", { festivalId, data });
  return { success: true };
}

export async function getOrders(festivalId: string, page = 1, limit = 10): Promise<PaginatedResponse<Prisma.OrderGetPayload<{ include: { user: true } }>>> {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where: { festivalId },
      include: { user: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.order.count({ where: { festivalId } })
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}

export async function purchaseTicket(tierId: string, festivalId: string, userDetails: { firstName: string; lastName: string; email: string }) {
  // Normally this would happen after a successful Stripe webhook or payment intent confirmation.
  // For this mock checkout flow, we will create the order and attendee immediately.

  // 1. Check if user exists, if not, create a guest user (or link to existing)
  let user = await prisma.user.findUnique({ where: { email: userDetails.email } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        role: "ATTENDEE",
      }
    });
  }

  // 2. Fetch ticket tier to get price
  const tier = await prisma.ticketTier.findUnique({ where: { id: tierId } });
  if (!tier) throw new Error("Ticket tier not found");

  if (tier.soldCount >= tier.capacity) {
    throw new Error("This ticket tier is sold out.");
  }

  // 3. Create the transaction
  const result = await prisma.$transaction(async (tx) => {
    // Increment sold count
    const updatedTier = await tx.ticketTier.update({
      where: { id: tierId },
      data: { soldCount: { increment: 1 } }
    });

    if (updatedTier.soldCount === updatedTier.capacity) {
      // Sold out! Trigger notification
      await notifyUsersByPermission({
        festivalId,
        resource: "finance",
        action: "view", // Let's use finance:view since finance manages revenue/tickets
        title: "Ticket Tier Sold Out",
        body: `The ticket tier "${updatedTier.name}" has officially sold out.`,
        type: "SUCCESS",
        link: `/dashboard/${festivalId}/tickets`
      });
    }

    // Create Order
    const order = await tx.order.create({
      data: {
        festivalId,
        userId: user.id,
        totalAmount: tier.price,
        currency: tier.currency,
        status: "COMPLETED",
        purchasedAt: new Date(),
      }
    });

    // Create Attendee (Ticket)
    // Generate a secure payload for the QR code. For testing, a UUID is sufficient.
    const crypto = require("crypto");
    const qrPayload = crypto.randomUUID();

    const attendee = await tx.attendee.create({
      data: {
        orderId: order.id,
        userId: user.id,
        festivalId,
        ticketTierId: tier.id,
        qrCode: qrPayload,
      }
    });

    return { order, attendee };
  });

  return result;
}
