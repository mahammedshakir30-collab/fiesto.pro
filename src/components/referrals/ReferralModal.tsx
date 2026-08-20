"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Copy, Share2, Loader2 } from 'lucide-react';
import { getOrCreateReferralCode } from '@/actions/referrals';

interface ReferralModalProps {
  children: React.ReactNode;
}

export function ReferralModal({ children }: ReferralModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ code: string; referrals: any[] } | null>(null);
  
  useEffect(() => {
    if (open && !data) {
      setLoading(true);
      getOrCreateReferralCode()
        .then(res => setData(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [open, data]);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/signup?ref=${data?.code}` 
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Copied to clipboard');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join FestOS',
          text: 'Get 1 month free when you sign up for FestOS using my referral link!',
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl font-sans">
        <DialogHeader>
          <div className="w-12 h-12 bg-color-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Gift className="w-6 h-6 text-color-primary" />
          </div>
          <DialogTitle className="text-center font-heading text-2xl font-black text-[#504E76]">
            Refer & Earn
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-color-primary" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            <p className="text-center text-muted-foreground text-sm">
              Give a friend 1 month free, and get a month free when they subscribe to a paid plan.
            </p>

            <div className="bg-gray-50 border border-border p-4 rounded-xl flex items-center gap-4">
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Your Share Link</p>
                <p className="truncate font-mono text-sm text-[#504E76]">{shareUrl}</p>
              </div>
              <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                <Copy className="w-4 h-4 text-[#504E76]" />
              </Button>
              <Button size="icon" onClick={handleShare} className="shrink-0 bg-color-primary text-white hover:bg-color-primary/90">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <h4 className="font-bold text-[#504E76] mb-3 text-sm">Your Referrals ({data.referrals.length})</h4>
              {data.referrals.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {data.referrals.map((ref, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-border rounded-lg bg-white">
                      <div>
                        <p className="font-bold text-sm text-[#504E76]">{ref.festivalName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(ref.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        {ref.status === 'PENDING' && <span className="text-[10px] font-bold uppercase px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Pending</span>}
                        {ref.status === 'CONVERTED' && <span className="text-[10px] font-bold uppercase px-2 py-1 bg-green-100 text-green-800 rounded-full">Converted</span>}
                        {ref.status === 'REWARDED' && <span className="text-[10px] font-bold uppercase px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Rewarded</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 border border-dashed border-border rounded-xl">
                  <p className="text-sm text-muted-foreground">You haven't referred anyone yet.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-destructive">
            Failed to load referral data.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
