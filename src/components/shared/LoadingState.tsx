import React from 'react';

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="w-full h-[400px] flex flex-col items-center justify-center space-y-6">
      <div className="relative w-16 h-16">
        {/* Outer pulsing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-color-soft/20 animate-ping"></div>
        {/* Inner spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-color-primary border-r-color-primary border-b-transparent border-l-transparent animate-spin"></div>
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-color-accent rounded-full"></div>
      </div>
      <div className="font-heading text-lg font-bold text-muted-foreground animate-pulse">
        {message}
      </div>
    </div>
  );
}
