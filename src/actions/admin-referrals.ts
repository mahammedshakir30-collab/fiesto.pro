"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function markReferralRewarded(referralId: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  const referral = await prisma.referral.findUnique({
    where: { id: referralId }
  });

  if (!referral) throw new Error("Referral not found");
  if (referral.status !== 'CONVERTED') throw new Error("Referral must be in CONVERTED state to be rewarded");

  await prisma.referral.update({
    where: { id: referralId },
    data: {
      status: 'REWARDED',
      rewardedAt: new Date(),
      rewardAmount: 0 // In future, set actual amount
    }
  });

  // Write audit log
  await prisma.platformAuditLog.create({
    data: {
      actorId: session.user.id,
      action: 'referral.reward',
      targetType: 'referral',
      targetId: referralId,
      metadata: { previousStatus: referral.status }
    }
  });

  // Fire notification (we need a festivalId for notification, but this is a platform-level user. 
  // We can query one of the referrer's festivals to attach the notification to, or we can make festivalId optional in Notification.
  // Wait, Notification model requires festivalId. 
  const firstFestival = await prisma.festivalOrganizer.findFirst({
    where: { organizer: { userId: referral.referrerUserId } }
  });

  if (firstFestival) {
    await prisma.notification.create({
      data: {
        userId: referral.referrerUserId,
        festivalId: firstFestival.festivalId,
        type: 'SUCCESS',
        title: 'Referral Rewarded!',
        body: `Your referral has been marked as rewarded. A credit has been applied to your account.`,
      }
    });
  }
}
