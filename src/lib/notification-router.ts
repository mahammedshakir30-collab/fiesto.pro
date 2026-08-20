import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/actions/notifications";
import { NotificationType } from "@prisma/client";

/**
 * Notifies all users who have the specified permission for the given festival.
 * Also notifies users with the SUPER_ADMIN role.
 */
export async function notifyUsersByPermission(data: {
  festivalId: string;
  resource: string;
  action: string;
  title: string;
  body: string;
  type?: NotificationType;
  link?: string;
}) {
  // Find users who have this permission mapped via UserRole -> Role -> Permission
  // Also include SUPER_ADMINs
  const eligibleUsers = await prisma.user.findMany({
    where: {
      OR: [
        { role: "SUPER_ADMIN" },
        {
          userRoles: {
            some: {
              festivalId: data.festivalId,
              role: {
                permissions: {
                  some: {
                    resource: data.resource,
                    action: data.action,
                  }
                }
              }
            }
          }
        }
      ]
    },
    select: { id: true }
  });

  // Deduplicate user IDs just in case
  const userIds = Array.from(new Set(eligibleUsers.map(u => u.id)));

  // Send notifications to all eligible users in parallel
  await Promise.all(
    userIds.map(userId =>
      sendNotification({
        festivalId: data.festivalId,
        userId,
        title: data.title,
        body: data.body,
        type: data.type,
        link: data.link
      })
    )
  );
}
