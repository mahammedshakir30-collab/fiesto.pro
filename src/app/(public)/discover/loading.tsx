import React from 'react';

export default function PublicLoading() {
  return (
    <div className="w-full min-h-screen animate-pulse bg-color-base">
      {/* Hero Skeleton */}
      <div className="h-[60vh] bg-[#504E76]/80 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-4 text-center">
          <div className="h-4 w-32 bg-white/20 rounded-full mx-auto" />
          <div className="h-14 w-3/4 bg-white/30 rounded-2xl mx-auto" />
          <div className="h-5 w-full bg-white/20 rounded-xl mx-auto" />
          <div className="h-12 w-44 bg-[#F1642E]/70 rounded-full mx-auto mt-6" />
        </div>
      </div>

      {/* Grid Content Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 rounded-3xl bg-card border border-border p-6 space-y-4">
              <div className="h-36 bg-muted/60 rounded-2xl" />
              <div className="h-6 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted/70 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
