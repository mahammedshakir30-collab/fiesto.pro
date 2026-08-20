"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { NotificationType } from "@prisma/client";

export async function getNotifications(festivalId: string, page = 1, limit = 20, unreadOnly = false) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const userId = session.user.id;

  const where = {
    festivalId,
    userId,
    ...(unreadOnly ? { read: false } : {})
  };

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where })
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getUnreadCount(festivalId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return 0;
  
  return prisma.notification.count({
    where: {
      festivalId,
      userId: session.user.id,
      read: false
    }
  });
}

export async function markAsRead(notificationId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return;

  await prisma.notification.update({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true }
  });
}

export async function markAllAsRead(festivalId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return;

  await prisma.notification.updateMany({
    where: { festivalId, userId: session.user.id, read: false },
    data: { read: true }
  });
}

// Utility to send a notification (used internally by other actions)
export async function sendNotification(data: {
  festivalId: string;
  userId: string;
  type?: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      festivalId: data.festivalId,
      userId: data.userId,
      type: data.type || "INFO",
      title: data.title,
      body: data.body,
      link: data.link
    }
  });

  // Broadcast via Pusher to the specific user's channel
  await pusherServer.trigger(
    `user-${data.userId}-festival-${data.festivalId}`,
    "new-notification",
    notification
  ).catch(console.error);

  return notification;
}
