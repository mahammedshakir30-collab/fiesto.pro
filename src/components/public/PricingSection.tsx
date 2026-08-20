'use client';

import React from 'react';
import { PlanCard } from '@/components/shared/PlanCard';
import { PlanTier } from '@prisma/client';

interface PricingSectionProps {
  plans: PlanTier[];
  context?: 'public' | 'organizer';
  festival?: { id: string; name: string } | null;
  user?: { name?: string | null; email?: string | null } | null;
  currentPlanId?: string | null;
}

export function PricingSection({ plans, context = 'public', festival, user, currentPlanId }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-24 bg-[#FAF8F5] relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[#F1642E] bg-[#FFF2ED] border border-[#F1642E]/20 uppercase tracking-wider mb-4">
            Pricing Plans
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-[#111827] tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your festival's needs. Upgrade or scale at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map(plan => (
            <PlanCard 
              key={plan.id}
              plan={plan}
              context={context}
              festival={festival}
              user={user}
              currentPlanId={currentPlanId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
