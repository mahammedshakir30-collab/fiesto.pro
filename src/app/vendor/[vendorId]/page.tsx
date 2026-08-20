import React from 'react';
import { notFound } from 'next/navigation';
import { TrendingUp, ShoppingBag, MapPin, Store, AlertCircle, CheckCircle2, ChevronRight, CreditCard } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function VendorOverviewPage({ params }: { params: { vendorId: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: params.vendorId },
    include: { 
      festival: true,
      profile: true
    }
  });
  
  if (!vendor) notFound();

  const festival = vendor.festival;
  
  // Calculate profile completion %
  let completionPct = 0;
  if (vendor.profile) {
    const fields = ['businessName', 'description', 'logoUrl', 'category', 'contactEmail', 'contactPhone'];
    const filled = fields.filter(f => (vendor.profile as any)[f]).length;
    completionPct = Math.round((filled / fields.length) * 100);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Application Status Banner */}
      {vendor.status !== 'APPROVED' && vendor.status !== 'ACTIVE' && (
        <div className={`p-4 rounded-xl border flex items-start gap-4 ${
          vendor.status === 'REJECTED' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-color-accent/10 border-color-accent/20 text-color-accent'
        }`}>
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">
              {vendor.status === 'PENDING' ? 'Application Under Review' : 'Changes Requested'}
            </h3>
            <p className="opacity-90">
              {vendor.status === 'PENDING' 
                ? 'Your vendor application is currently being reviewed by the organizer. You will be notified once a decision is made.'
                : 'Your application requires changes. Please check your notifications for details from the organizer.'}
            </p>
          </div>
        </div>
      )}

      {(vendor.status === 'APPROVED' || vendor.status === 'ACTIVE') && (
        <>
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-2">Welcome back to your vendor portal for {festival?.name}.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-card border border-border rounded-3xl shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-color-success/20 text-color-success flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="font-bold text-muted-foreground text-sm uppercase tracking-wider">Revenue</span>
              </div>
              <div className="font-display text-4xl text-foreground">--</div>
              <p className="text-xs text-muted-foreground mt-2">No vendor-scoped line items</p>
            </div>

            <div className="p-6 bg-card border border-border rounded-3xl shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-color-accent/20 text-color-accent flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="font-bold text-muted-foreground text-sm uppercase tracking-wider">Orders</span>
              </div>
              <div className="font-display text-4xl text-foreground">--</div>
              <p className="text-xs text-muted-foreground mt-2">Dependency gap flagged</p>
            </div>

            <div className="p-6 bg-card border border-border rounded-3xl shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="font-bold text-muted-foreground text-sm uppercase tracking-wider">Next Payout</span>
              </div>
              <div className="font-display text-4xl text-foreground">--</div>
              <p className="text-xs text-muted-foreground mt-2">Stripe Connect required</p>
            </div>

            <div className="p-6 bg-card border border-border rounded-3xl shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-muted-foreground text-sm uppercase tracking-wider">Profile Setup</span>
                  <span className="font-bold">{completionPct}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-color-primary h-2 rounded-full" style={{ width: `${completionPct}%` }}></div>
                </div>
              </div>
              <Link href={`/vendor/${vendor.id}/profile`} className="mt-4 text-sm font-bold text-color-primary hover:underline flex items-center">
                {completionPct === 100 ? 'Edit Profile' : 'Complete Profile'} <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          <h2 className="font-heading text-2xl font-bold mt-12 mb-6">Recent Orders</h2>
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-soft">
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-50" />
              <h3 className="font-bold text-xl text-foreground mb-2">No orders available yet</h3>
              <p className="max-w-md mx-auto">
                Once the core checkout system supports vendor-scoped line items, your recent sales will appear here. Currently flagged as a dependency gap.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
