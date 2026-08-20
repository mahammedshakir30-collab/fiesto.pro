import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function logPlatformAction(
  action: string,
  targetType: string,
  targetId: string,
  metadata?: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return;

    const platformUser = await prisma.platformUser.findUnique({
      where: { userId: session.user.id }
    });

    if (!platformUser) {
      console.warn("Attempted to log platform action but user is not a PlatformUser", session.user.id);
      return;
    }

    await prisma.platformAuditLog.create({
      data: {
        actorId: platformUser.id,
        action,
        targetType,
        targetId,
        metadata: metadata || {},
      }
    });
  } catch (err) {
    console.error("Failed to log platform action:", err);
  }
}
