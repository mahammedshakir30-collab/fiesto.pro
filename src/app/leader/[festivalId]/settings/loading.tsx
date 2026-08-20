import React from 'react';

export default function LeaderDashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-44 rounded-3xl bg-muted/60 border border-border/50" />

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 rounded-2xl bg-card border border-border/60 p-4 space-y-3">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-8 w-14 bg-muted/80 rounded" />
          </div>
        ))}
      </div>

      {/* Split Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-72 rounded-2xl bg-card border border-border/60 p-6 space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted/40 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="h-72 rounded-2xl bg-card border border-border/60 p-6 space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted/40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
