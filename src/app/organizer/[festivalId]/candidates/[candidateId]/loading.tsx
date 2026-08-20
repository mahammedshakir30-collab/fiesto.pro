import React from 'react';

export default function CandidateProfileLoading() {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl">
      <div className="h-4 w-32 bg-gray-200 rounded"></div>

      {/* 4 Stat Cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-white border border-gray-200 rounded-2xl p-5"></div>
        ))}
      </div>

      {/* Main Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="h-96 bg-white border border-gray-200 rounded-3xl p-6"></div>
        <div className="lg:col-span-2 h-96 bg-white border border-gray-200 rounded-3xl p-6"></div>
      </div>
    </div>
  );
}
