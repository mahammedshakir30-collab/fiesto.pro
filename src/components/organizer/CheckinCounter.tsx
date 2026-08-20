"use client";

import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js';

interface CheckinCounterProps {
  festivalId: string;
  initialScannedIn: number;
  totalExpected: number;
}

export function CheckinCounter({ festivalId, initialScannedIn, totalExpected }: CheckinCounterProps) {
  const [scannedIn, setScannedIn] = useState(initialScannedIn);
  const [scansPerMinute, setScansPerMinute] = useState(0);
  const [scanHistory, setScanHistory] = useState<number[]>([]);

  useEffect(() => {
    // Sync initial state if it changes
    setScannedIn(initialScannedIn);
  }, [initialScannedIn]);

  useEffect(() => {
    // Initialize Pusher Client
    const pusherAppKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherAppKey) {
      console.warn("Pusher App Key is missing. Real-time updates disabled.");
      return;
    }

    const pusher = new Pusher(pusherAppKey, {
      cluster: pusherCluster || 'us2',
    });

    const channel = pusher.subscribe(`festival-${festivalId}`);

    channel.bind('count-updated', (data: { scannedIn: number }) => {
      setScannedIn(data.scannedIn);
      setScanHistory(prev => [...prev, Date.now()]);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`festival-${festivalId}`);
      pusher.disconnect();
    };
  }, [festivalId]);

  // Calculate scans per minute
  useEffect(() => {
    const interval = setInterval(() => {
      const oneMinuteAgo = Date.now() - 60000;
      // Filter out events older than 1 minute
      const recentScans = scanHistory.filter(time => time > oneMinuteAgo);
      
      setScansPerMinute(recentScans.length);
      
      // Clean up old history to prevent memory leak over long sessions
      if (scanHistory.length !== recentScans.length) {
        setScanHistory(recentScans);
      }
    }, 5000); // update SPM every 5 seconds

    return () => clearInterval(interval);
  }, [scanHistory]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-6 bg-card border border-border rounded-2xl transition-all duration-300">
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Scanned In</div>
        <div className="font-display text-5xl text-color-success animate-in slide-in-from-bottom-2 duration-300" key={scannedIn}>
          {scannedIn.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground mt-2">/ {totalExpected.toLocaleString()} Expected</div>
      </div>
      <div className="p-6 bg-card border border-border rounded-2xl transition-all duration-300">
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Gate Traffic</div>
        <div className="font-display text-5xl text-color-warning" key={scansPerMinute}>
          {scansPerMinute}
        </div>
        <div className="text-xs text-muted-foreground mt-2">Scans per minute</div>
      </div>
    </div>
  );
}
