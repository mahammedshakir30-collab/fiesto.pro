"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { requirePermission } from "@/lib/rbac";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendNotification } from "./notifications";

export async function getStaffForFestival(festivalId: string): Promise<Prisma.StaffMemberGetPayload<{ include: { user: true } }>[]> {
  await requirePermission(festivalId, "staff", "view");
  return prisma.staffMember.findMany({
    where: { festivalId },
    include: { user: true }
  });
}

export async function inviteStaff(festivalId: string, email: string, roleName: string, customRoleName?: string, teamId?: string) {
  await requirePermission(festivalId, "staff", "invite");
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Get or create the Role on the fly
  let panelType: any = "ADMIN";
  if (roleName === "SCANNER") panelType = "CHECKIN";
  else if (roleName === "LEADER") panelType = "TEAM_LEADER";
  
  const finalRoleName = roleName === "CUSTOM" && customRoleName ? customRoleName : roleName;

  let role = await prisma.role.findFirst({
    where: { festivalId, name: finalRoleName }
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        festivalId,
        name: finalRoleName,
        panelType,
        kind: roleName === "CUSTOM" ? "CUSTOM" : "SYSTEM"
      }
    });
  }

  const token = Math.random().toString(36).substring(2, 15);
  
  await prisma.staffInvite.create({
    data: {
      festivalId,
      email,
      roleId: role.id,
      inviterId: session.user.id,
      token,
      status: "PENDING",
      teamId: teamId || null
    }
  });

  console.log(`Staff invited. Invite token: ${token}`);
  return { success: true };
}

export async function acceptStaffInvite(token: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const invite = await prisma.staffInvite.findUnique({
    where: { token },
    include: { role: true, festival: true }
  });

  if (!invite || invite.status !== "PENDING") {
    throw new Error("Invalid or expired invite");
  }

  // Add the user to UserRole
  await prisma.userRole.create({
    data: {
      userId: session.user.id,
      roleId: invite.roleId,
      festivalId: invite.festivalId
    }
  });

  // Create StaffMember record
  await prisma.staffMember.create({
    data: {
      festivalId: invite.festivalId,
      userId: session.user.id
    }
  });

  
  // Mark invite accepted
  await prisma.staffInvite.update({
    where: { id: invite.id },
    data: { status: "ACCEPTED" }
  });

  if (invite.teamId) {
    await prisma.team.update({
      where: { id: invite.teamId },
      data: { leaderId: session.user.id }
    });
  }


  // Notify the inviter
  await sendNotification({
    festivalId: invite.festivalId,
    userId: invite.inviterId,
    type: "SUCCESS",
    title: "Staff Invite Accepted",
    body: `${session.user.email || 'A user'} has accepted your invitation to join ${invite.festival.name} as ${invite.role.name}.`
  });

  return { success: true, festivalId: invite.festivalId };
}


export async function getPendingInvites(festivalId: string) {
  return await prisma.staffInvite.findMany({
    where: { festivalId, status: 'PENDING' },
    include: { role: true, team: true },
    orderBy: { createdAt: 'desc' }
  });
}
