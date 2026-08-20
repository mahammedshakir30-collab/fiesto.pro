import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import BillingClient from './BillingClient';

export default async function OrganizerBillingPage({
  params
}: {
  params: { festivalId: string }
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/signin');

  const [festival, planTiers] = await Promise.all([
    prisma.festival.findUnique({
      where: { id: params.festivalId },
      include: {
        subscription: {
          include: { planTier: true }
        },
        invoices: {
          orderBy: { issuedAt: 'desc' },
          take: 10
        }
      }
    }),
    prisma.planTier.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' }
    })
  ]);

  if (!festival) redirect('/festivals');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-black text-[#504E76]">Billing & Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Manage your plan, payment methods, and invoices.</p>
      </div>

      <BillingClient 
        festival={festival} 
        subscription={festival.subscription} 
        invoices={festival.invoices}
        planTiers={planTiers}
        user={{ name: session.user.name, email: session.user.email }}
      />
    </div>
  );
}
