"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

// Fetch initial stats for the dashboard
export async function getCheckinStats(festivalId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  // Verify staff or organizer
  const hasAccess = await verifyAccess(session.user.id, festivalId, session.user.role);
  if (!hasAccess) throw new Error("Unauthorized access to this festival");

  const [totalExpected, scannedIn] = await Promise.all([
    prisma.attendee.count({ where: { festivalId } }),
    prisma.attendee.count({ where: { festivalId, checkedIn: true } })
  ]);

  return { totalExpected, scannedIn };
}

// Verify a scanned QR code
export async function verifyTicket(qrPayload: string, festivalId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Verify staff or organizer access
  const hasAccess = await verifyAccess(session.user.id, festivalId, session.user.role);
  if (!hasAccess) throw new Error("Unauthorized access to this festival");

  // Basic check for empty payloads
  if (!qrPayload || qrPayload.trim() === "") {
    throw new Error("Invalid Code: Empty payload");
  }

  // Find the attendee by qrCode
  const attendee = await prisma.attendee.findUnique({
    where: { qrCode: qrPayload },
    include: {
      ticketTier: true,
      user: true,
    }
  });

  if (!attendee) {
    throw new Error("Invalid Code: Ticket not found");
  }

  if (attendee.festivalId !== festivalId) {
    throw new Error("Invalid Code: Ticket belongs to a different festival");
  }

  if (attendee.checkedIn) {
    throw new Error(`Duplicate: Already Scanned at ${attendee.checkedInAt?.toLocaleString()}`);
  }

  // Mark as checked in
  const updatedAttendee = await prisma.attendee.update({
    where: { id: attendee.id },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
    }
  });

  // Calculate new total
  const newScannedInCount = await prisma.attendee.count({
    where: { festivalId, checkedIn: true }
  });

  // Broadcast the update
  try {
    await pusherServer.trigger(`festival-${festivalId}`, "count-updated", {
      scannedIn: newScannedInCount,
    });
  } catch (err) {
    console.error("Pusher broadcast failed:", err);
    // Don't fail the checkin just because broadcast failed
  }

  return {
    success: true,
    attendeeName: `${attendee.user.firstName} ${attendee.user.lastName}`,
    ticketName: attendee.ticketTier.name,
    scannedInCount: newScannedInCount
  };
}

// Helper to check if a user is an organizer or authorized staff for this festival
async function verifyAccess(userId: string, festivalId: string, role: string) {
  if (role === "SUPER_ADMIN") return true;

  if (role === "ORGANIZER") {
    const org = await prisma.organizer.findUnique({ where: { userId } });
    if (org) {
      const isOwner = await prisma.festivalOrganizer.findFirst({
        where: { festivalId, organizerId: org.id }
      });
      if (isOwner) return true;
    }
  }

  // Check if they are staff with canScanTickets permission
  const staff = await prisma.staffMember.findFirst({
    where: {
      festivalId,
      userId,
      active: true,
      canScanTickets: true
    }
  });

  return !!staff;
}
