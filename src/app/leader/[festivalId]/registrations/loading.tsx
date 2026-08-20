import React from 'react';

export default function LeaderCatalogLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-28 rounded-2xl bg-card border border-border/60 p-6 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-7 w-64 bg-muted/80 rounded" />
        </div>
        <div className="h-11 w-32 bg-muted rounded-xl" />
      </div>

      {/* Filter Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-11 bg-card border border-border/60 rounded-xl" />
        <div className="h-11 bg-card border border-border/60 rounded-xl" />
        <div className="h-11 bg-card border border-border/60 rounded-xl" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 rounded-2xl bg-card border border-border/60 p-5 space-y-4">
            <div className="flex justify-between">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded-full" />
            </div>
            <div className="h-16 bg-muted/30 rounded-xl" />
            <div className="h-10 bg-muted/60 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
