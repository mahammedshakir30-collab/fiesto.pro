"use client";

import React, { useEffect } from 'react';
import Pusher from 'pusher-js';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PusherClient({ festivalId }: { festivalId: string }) {
  const router = useRouter();

  useEffect(() => {
    // Check if Pusher is configured
    if (!process.env.NEXT_PUBLIC_PUSHER_APP_KEY) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    });

    const channel = pusher.subscribe(`festival-${festivalId}`);
    
    channel.bind('result-released', (data: { programmeId: string, name: string }) => {
      toast.success(`New Result Released!`, {
        description: `Results for ${data.name} are now available.`,
        duration: 5000,
        action: {
          label: 'Refresh',
          onClick: () => router.refresh()
        }
      });
      // Also automatically refresh after a small delay to pull the new data
      setTimeout(() => router.refresh(), 1000);
    });

    return () => {
      pusher.unsubscribe(`festival-${festivalId}`);
      pusher.disconnect();
    };
  }, [festivalId, router]);

  return null;
}
