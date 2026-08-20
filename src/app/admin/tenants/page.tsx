import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search, Filter, ShieldAlert } from 'lucide-react';

export default async function AdminTenantsPage() {
  const festivals = await prisma.festival.findMany({
    include: { planTier: true, coOrganizers: { include: { organizer: { include: { user: true } } } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Tenants</h1>
        <p className="text-muted-foreground mt-2">Manage all festivals across the platform.</p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search festivals or organizers..." 
              className="text-[#F1642E] w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-color-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Festival Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Plan Tier</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {festivals.map((festival) => {
                const owner = festival.coOrganizers[0]?.organizer?.user;
                return (
                  <tr key={festival.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        {festival.name}
                        {festival.suspended && <ShieldAlert className="w-4 h-4 text-destructive" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        festival.suspended ? 'bg-destructive/10 text-destructive' :
                        festival.status === 'LIVE' ? 'bg-color-success/10 text-color-success' :
                        'bg-color-accent/10 text-color-accent'
                      }`}>
                        {festival.suspended ? 'SUSPENDED' : festival.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {festival.planTier?.name || 'Trial (No Plan)'}
                    </td>
                    <td className="px-6 py-4">
                      {owner?.email || '—'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {festival.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/tenants/${festival.id}`} className="text-color-primary hover:underline">
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
