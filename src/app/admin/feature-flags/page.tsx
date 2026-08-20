import React from 'react';
import { prisma } from '@/lib/prisma';
import { ToggleLeft } from 'lucide-react';
import { CreateFlagDialog } from './CreateFlagDialog';

export default async function AdminFeatureFlagsPage() {
  const flags = await prisma.globalFeatureFlag.findMany();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Global Feature Flags</h1>
          <p className="text-muted-foreground mt-2">Manage platform-wide kill switches for features still in rollout.</p>
        </div>
        <CreateFlagDialog />
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-soft">
        {flags.length === 0 ? (
          <div className="text-center py-12">
            <ToggleLeft className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold mb-2">No Global Flags</h3>
            <p className="text-muted-foreground mb-6">Create global kill switches here to manage major feature rollouts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flags.map(flag => (
              <div key={flag.key} className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div>
                  <h3 className="font-bold text-lg font-mono">{flag.key}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                </div>
                <form action={async (formData) => {
                  "use server";
                  const { toggleGlobalFlag } = await import("@/actions/feature-flags");
                  await toggleGlobalFlag(flag.key, !flag.enabled);
                }}>
                  <button 
                    type="submit"
                    className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${flag.enabled ? 'bg-color-primary' : 'bg-muted'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${flag.enabled ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
