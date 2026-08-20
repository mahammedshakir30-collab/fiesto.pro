import React from 'react';
import { prisma } from '@/lib/prisma';
import { FEATURE_REGISTRY } from '@/lib/features';
import { FileText, Plus, Check } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PlanFormDialog } from './PlanFormDialog';

export default async function AdminPlansPage() {
  const session = await getServerSession(authOptions);
  
  const platformUser = await prisma.platformUser.findUnique({
    where: { userId: session?.user.id }
  });

  if (platformUser?.role !== 'SUPER_ADMIN') {
    redirect('/unauthorized'); // Support agents cannot touch plans
  }

  const plans = await prisma.planTier.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Plan Tiers</h1>
          <p className="text-muted-foreground mt-2">Manage subscription plans and feature entitlements.</p>
        </div>
        <PlanFormDialog mode="create" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const entitlements = typeof plan.featureEntitlements === 'string' 
            ? JSON.parse(plan.featureEntitlements) 
            : plan.featureEntitlements;

          return (
            <div key={plan.id} className="bg-card border border-border rounded-3xl p-8 shadow-soft flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-2xl font-bold">{plan.name}</h2>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${plan.active ? 'bg-color-success/10 text-color-success' : 'bg-muted text-muted-foreground'}`}>
                  {plan.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-4xl">${plan.monthlyPrice}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              
              <div className="space-y-4 flex-1 mb-8">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Entitlements</h3>
                {FEATURE_REGISTRY.map(feature => {
                  const isEntitled = entitlements?.[feature.key];
                  return (
                    <div key={feature.key} className={`flex items-start gap-3 ${!isEntitled ? 'opacity-50' : ''}`}>
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isEntitled ? 'bg-color-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                        {isEntitled && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-medium">{feature.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-6 flex gap-3">
                <PlanFormDialog plan={plan} mode="edit" />
                <form action="/api/admin/plans/toggle" method="POST" className="flex-1">
                  <input type="hidden" name="planId" value={plan.id} />
                  <input type="hidden" name="active" value={(!plan.active).toString()} />
                  <button type="submit" className="w-full py-2 rounded-xl border border-border font-bold hover:bg-muted transition-colors text-muted-foreground">
                    {plan.active ? 'Deactivate' : 'Activate'}
                  </button>
                </form>
              </div>
            </div>
          );
        })}

        {plans.length === 0 && (
          <div className="col-span-full bg-card border border-border rounded-3xl p-12 text-center shadow-soft">
            <FileText className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold mb-2">No Plans Created</h3>
            <p className="text-muted-foreground mb-6">Create your first subscription tier to get started.</p>
            <PlanFormDialog mode="create" />
          </div>
        )}
      </div>
    </div>
  );
}

