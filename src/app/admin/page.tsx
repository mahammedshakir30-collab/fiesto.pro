import React from 'react';
import { prisma } from '@/lib/prisma';
import { TrendingUp, Users, Calendar, Store, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function AdminOverviewPage() {
  const [totalFestivals, totalOrganizers, totalVendors] = await Promise.all([
    prisma.festival.count(),
    prisma.organizer.count(),
    prisma.vendor.count()
  ]);

  const activeFestivals = await prisma.festival.count({ where: { suspended: false } });
  const suspendedFestivals = await prisma.festival.count({ where: { suspended: true } });
  
  const next7Days = new Date();
  next7Days.setDate(next7Days.getDate() + 7);
  
  const expiringTrials = await prisma.festival.findMany({
    where: { 
      trialEndsAt: { not: null, lte: next7Days, gte: new Date() },
      suspended: false
    },
    include: { planTier: true }
  });

  // Calculate MRR estimate
  const festivalsWithPlans = await prisma.festival.findMany({
    where: { planTierId: { not: null }, suspended: false },
    include: { planTier: true }
  });
  const estimatedMRR = festivalsWithPlans.reduce((sum, f) => sum + (f.planTier?.monthlyPrice || 0), 0);

  return (
    <div className="max-w-7xl">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground mt-2">Manage FestOS tenants, billing, and global settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wider">Estimated MRR</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="font-display text-5xl">${estimatedMRR.toLocaleString()}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Calendar className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wider">Total Festivals</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="font-display text-5xl">{totalFestivals}</span>
            <div className="text-xs text-muted-foreground pb-1">
              {activeFestivals} Active <br/> {suspendedFestivals} Suspended
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Users className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wider">Organizers</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="font-display text-5xl">{totalOrganizers}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Store className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wider">Vendors</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="font-display text-5xl">{totalVendors}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft">
          <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-color-accent" /> Trials Ending Soon
          </h2>
          {expiringTrials.length === 0 ? (
            <p className="text-muted-foreground text-sm">No trials expiring in the next 7 days.</p>
          ) : (
            <div className="space-y-4">
              {expiringTrials.map(f => (
                <div key={f.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div>
                    <h3 className="font-bold">{f.name}</h3>
                    <p className="text-sm text-muted-foreground">Ends: {f.trialEndsAt?.toLocaleDateString()}</p>
                  </div>
                  <Link href={`/admin/tenants/${f.id}`} className="text-sm bg-muted px-3 py-1.5 rounded-full hover:bg-muted/80">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft">
          <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" /> Needs Attention
          </h2>
          <p className="text-muted-foreground text-sm mb-4">Festivals that might need support outreach.</p>
          {/* Mocking unhealthy festivals for the UI layout */}
          <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-destructive/5">
            <div>
              <h3 className="font-bold text-destructive">Summer Splash</h3>
              <p className="text-sm text-muted-foreground">0% Setup Completion · Trial ending tomorrow</p>
            </div>
            <Link href={`/admin/tenants`} className="text-sm bg-muted px-3 py-1.5 rounded-full hover:bg-muted/80">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
