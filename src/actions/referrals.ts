"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function getOrCreateReferralCode() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  let referralCode = await prisma.referralCode.findUnique({
    where: { userId }
  });

  if (!referralCode) {
    const code = nanoid(8).toUpperCase();
    try {
      referralCode = await prisma.referralCode.create({
        data: {
          userId,
          code
        }
      });
    } catch (e) {
      // In case of race condition
      referralCode = await prisma.referralCode.findUnique({
        where: { userId }
      });
      if (!referralCode) throw e;
    }
  }

  // Also fetch the referral history for this user
  const referrals = await prisma.referral.findMany({
    where: { referrerUserId: userId },
    orderBy: { createdAt: 'desc' }
  });

  // Manual join to get festival names since referredFestivalId is a string without foreign key relation to Festival in schema? Wait, schema has referredFestivalId as unique string.
  // Wait, I can fetch festivals manually.
  const festivalIds = referrals.map(r => r.referredFestivalId);
  const festivals = await prisma.festival.findMany({
    where: { id: { in: festivalIds } },
    select: { id: true, name: true }
  });

  const festivalMap = new Map(festivals.map(f => [f.id, f.name]));

  const mappedReferrals = referrals.map(r => ({
    id: r.id,
    festivalName: festivalMap.get(r.referredFestivalId) || 'Unknown Festival',
    status: r.status,
    createdAt: r.createdAt
  }));

  return {
    code: referralCode.code,
    referrals: mappedReferrals
  };
}
