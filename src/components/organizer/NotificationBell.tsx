"use client";

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import Pusher from 'pusher-js';
import { getUnreadCount } from '@/actions/notifications';
import { useSession } from 'next-auth/react';

export function NotificationBell({ festivalId }: { festivalId: string }) {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    let pusherClient: Pusher | null = null;
    let channel: any = null;

    async function init() {
      try {
        const count = await getUnreadCount(festivalId);
        setUnreadCount(count);

        if (process.env.NEXT_PUBLIC_PUSHER_APP_KEY) {
          pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2'
          });

          channel = pusherClient.subscribe(`user-${session!.user.id}-festival-${festivalId}`);
          channel.bind('new-notification', (data: any) => {
            setUnreadCount(prev => prev + 1);
          });
        }
      } catch (err) {
        console.error("Failed to init notifications", err);
      }
    }

    init();

    return () => {
      if (channel) channel.unbind_all();
      if (pusherClient) pusherClient.disconnect();
    };
  }, [festivalId, session?.user?.id]);

  return (
    <Link 
      href={`/organizer/${festivalId}/notifications`}
      className="relative p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      title="Notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-color-accent rounded-full border-2 border-background">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}

