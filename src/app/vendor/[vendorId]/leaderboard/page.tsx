import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Trophy, Medal, AlertCircle, Store } from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default async function VendorLeaderboardPage({ params }: { params: { vendorId: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: params.vendorId },
    include: { festival: true }
  });

  if (!vendor || !vendor.festival) notFound();

  const festival = vendor.festival;

  // The Leaderboard is gated behind the festival flag
  if (!festival.vendorLeaderboardEnabled) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
        <h2 className="font-heading text-2xl font-bold mb-2">Leaderboard Disabled</h2>
        <p className="text-muted-foreground">The organizer has not enabled the vendor leaderboard for this festival.</p>
      </div>
    );
  }

  // Fetch the leaderboard snapshots for this festival
  // Note: We show a top 10 view or similar.
  const snapshots = await prisma.vendorLeaderboardSnapshot.findMany({
    where: { festivalId: festival.id },
    orderBy: { rank: 'asc' },
    include: { vendor: { include: { profile: true } } },
    take: 20
  });

  const showValues = festival.vendorLeaderboardShowValues;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Vendor Leaderboard</h1>
        <p className="text-muted-foreground mt-2">See how your booth ranks among other vendors at {festival.name}.</p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-soft">
        {snapshots.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
            <Trophy className="w-10 h-10 text-muted-foreground opacity-50 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-1">No Data Yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Leaderboard data is computed periodically. Check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {snapshots.map((snap) => {
              const isMe = snap.vendorId === vendor.id;
              
              return (
                <div 
                  key={snap.id} 
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    isMe 
                      ? 'bg-color-primary/10 border-color-primary shadow-sm' 
                      : 'bg-muted/30 border-border hover:bg-muted/50 transition-colors'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`font-display text-3xl w-12 text-center ${
                      snap.rank === 1 ? 'text-color-accent' : 
                      snap.rank === 2 ? 'text-gray-400' : 
                      snap.rank === 3 ? 'text-amber-700' : 'text-muted-foreground'
                    }`}>
                      #{snap.rank}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {snap.vendor.profile?.logoUrl ? (
                        <img src={snap.vendor.profile.logoUrl} alt="Logo" className="w-12 h-12 rounded-full object-cover border border-border" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border">
                          <Store className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className={`font-bold ${isMe ? 'text-color-primary' : ''}`}>
                          {snap.vendor.profile?.businessName || snap.vendor.name}
                          {isMe && <span className="ml-2 text-xs bg-color-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                        </h3>
                        <p className="text-xs text-muted-foreground">{snap.vendor.profile?.category || snap.vendor.category}</p>
                      </div>
                    </div>
                  </div>
                  
                  {showValues && (
                    <div className="text-right">
                      <div className="font-mono text-xl font-bold">
                        {snap.metric === 'revenue' ? formatCurrency(snap.value) : snap.value}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                        {snap.metric}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
