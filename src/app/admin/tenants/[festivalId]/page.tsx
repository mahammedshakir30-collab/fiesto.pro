import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ShieldAlert, LogIn, Store, Users, Play, Pause } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AdminTenantDetailsPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  
  const festival = await prisma.festival.findUnique({
    where: { id: params.festivalId },
    include: { 
      planTier: true, 
      coOrganizers: { include: { organizer: { include: { user: true } } } },
      staffMembers: true,
      vendors: true
    }
  });

  if (!festival) notFound();

  const platformUser = await prisma.platformUser.findUnique({
    where: { userId: session?.user.id }
  });

  const isSuperAdmin = platformUser?.role === 'SUPER_ADMIN';

  const planTiers = await prisma.planTier.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">{festival.name}</h1>
          <p className="text-muted-foreground mt-2">ID: {festival.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <form action="/api/impersonate/start" method="POST">
            <input type="hidden" name="festivalId" value={festival.id} />
            <button 
              type="submit" 
              className="flex items-center gap-2 px-4 py-2 border border-color-primary text-color-primary rounded-xl font-bold hover:bg-color-primary/10 transition-colors"
            >
              <LogIn className="w-4 h-4" /> View as Organizer
            </button>
          </form>
        </div>
      </div>

      {festival.suspended && (
        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-3xl flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-destructive mt-1 shrink-0" />
          <div>
            <h3 className="font-bold text-destructive text-lg">Tenant is Suspended</h3>
            <p className="text-sm mt-1">{festival.suspendedReason || 'No reason provided.'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-6">
          <h2 className="font-heading text-xl font-bold">Details</h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Status</span>
              <span className="font-bold">{festival.status}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Plan Tier</span>
              <span className="font-bold">{festival.planTier?.name || 'Trial (No Plan)'}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Created At</span>
              <span className="font-bold">{festival.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground">Owner Email</span>
              <span className="font-bold">{festival.coOrganizers[0]?.organizer?.user?.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-6">
          <h2 className="font-heading text-xl font-bold">Usage Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-xl flex items-center gap-4">
              <Users className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Staff</p>
                <p className="font-bold text-2xl">{festival.staffMembers.length}</p>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-xl flex items-center gap-4">
              <Store className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Vendors</p>
                <p className="font-bold text-2xl">{festival.vendors.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-6">
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" /> Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Suspending a tenant will immediately block all organizer and staff access. The public site and checkout will also be taken offline.
          </p>

          <form action={festival.suspended ? '/api/admin/tenants/reinstate' : '/api/admin/tenants/suspend'} method="POST" className="bg-muted p-6 rounded-xl border border-border">
            <input type="hidden" name="festivalId" value={festival.id} />
            
            {!festival.suspended && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Reason for Suspension (Required)</label>
                <input 
                  type="text" 
                  name="reason" 
                  required
                  placeholder="e.g. Terms of Service violation" 
                  className="w-full px-4 py-2 bg-background border border-border rounded-md"
                />
              </div>
            )}

            <button 
              type="submit" 
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-white transition-colors ${
                festival.suspended ? 'bg-color-success hover:bg-color-success/90' : 'bg-destructive hover:bg-destructive/90'
              }`}
            >
              {festival.suspended ? <><Play className="w-4 h-4" /> Reinstate Tenant</> : <><Pause className="w-4 h-4" /> Suspend Tenant</>}
            </button>
          </form>
        </div>
      )}

      {isSuperAdmin && (
        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-6">
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            Billing Override (Admin Only)
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Manually assign a plan tier to this tenant. This will override their current subscription status to ACTIVE and write to the audit log.
          </p>

          <form action="/api/admin/tenants/override-plan" method="POST" className="bg-muted p-6 rounded-xl border border-border">
            <input type="hidden" name="festivalId" value={festival.id} />
            
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Select Plan Tier</label>
              <select name="planTierId" required className="w-full px-4 py-2 bg-background border border-border rounded-md">
                <option value="">-- Select a Plan --</option>
                {planTiers.map(plan => (
                  <option key={plan.id} value={plan.id} defaultValue={festival.planTierId === plan.id ? plan.id : undefined}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              className="px-6 py-2 rounded-xl font-bold text-white bg-[#504E76] hover:bg-[#504E76]/90 transition-colors"
            >
              Force Assign Plan
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
