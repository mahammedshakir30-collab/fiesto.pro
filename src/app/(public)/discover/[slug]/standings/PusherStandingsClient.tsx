"use client";

import { useEffect } from 'react';
import Pusher from 'pusher-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Props {
  festivalId: string;
}

export function PusherStandingsClient({ festivalId }: Props) {
  const router = useRouter();

  useEffect(() => {
    // Enable pusher logging in dev only
    if (process.env.NODE_ENV !== 'production') {
      Pusher.logToConsole = true;
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    });

    const channel = pusher.subscribe(`festival-${festivalId}-standings`);

    channel.bind('points-updated', (data: { teamId: string, points: number, teamName: string }) => {
      // Toast notification
      toast.success(`${data.points} points awarded to ${data.teamName}!`);
      
      // Refresh server component to get new data
      router.refresh();
    });

    return () => {
      pusher.unsubscribe(`festival-${festivalId}-standings`);
      pusher.disconnect();
    };
  }, [festivalId, router]);

  return null; // Headless component
}
