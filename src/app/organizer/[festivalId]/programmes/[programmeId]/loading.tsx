import React from 'react';

export default function ProgrammeDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-64 bg-gray-200 rounded-xl"></div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-28 bg-gray-200 rounded-full"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
            <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Info Panels skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-white border border-gray-200 rounded-2xl p-6"></div>
        <div className="h-48 bg-white border border-gray-200 rounded-2xl p-6"></div>
      </div>

      {/* Tabs & Table skeleton */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
        <div className="flex gap-4 border-b pb-4">
          <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-12 bg-gray-100 rounded-xl"></div>
          <div className="h-12 bg-gray-100 rounded-xl"></div>
          <div className="h-12 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
