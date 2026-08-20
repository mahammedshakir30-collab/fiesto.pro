'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Loader2 } from 'lucide-react';
import { toggleCompetitionMode } from '@/actions/competitions';

export function CompetitionToggle({ festivalId, initialEnabled, entitled = true }: { festivalId: string, initialEnabled: boolean, entitled?: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (!entitled) return;
    setIsLoading(true);
    try {
      const newState = !enabled;
      await toggleCompetitionMode(festivalId, newState);
      setEnabled(newState);
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle competition mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border border-border bg-card rounded-xl flex items-center justify-between">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-color-primary/10 flex items-center justify-center shrink-0 mt-1">
          <Trophy className="w-5 h-5 text-color-primary" />
        </div>
        <div>
          <h3 className="font-bold">Competition & Judging Module</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            Enable the competition system to add categories, candidate registration, and scoring features. 
            This will add a new "Competitions" section to your sidebar.
          </p>
          {!entitled && (
            <p className="text-xs font-bold text-destructive mt-2">
              Upgrade required to enable this feature.
            </p>
          )}
        </div>
      </div>
      <button 
        onClick={handleToggle}
        disabled={isLoading || !entitled}
        className={`w-14 h-7 rounded-full relative transition-colors ${enabled ? 'bg-color-primary' : 'bg-muted'} ${(isLoading || !entitled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${enabled ? 'right-1' : 'left-1'}`}>
          {isLoading && <Loader2 className="w-3 h-3 text-color-primary animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
        </div>
      </button>
    </div>
  );
}
