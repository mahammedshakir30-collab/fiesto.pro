import React from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Tag, Settings, CreditCard } from 'lucide-react';
import { getFestivalById } from '@/actions/utils';
import { getTicketTiers } from '@/actions/commerce';

export default async function FestivalTicketsPage({ params }: { params: { festivalId: string } }) {
  const festival = await getFestivalById(params.festivalId);
  if (!festival) notFound();

  const tiers = await getTicketTiers(festival.id);

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Ticketing</h1>
          <p className="text-muted-foreground mt-2">Manage ticket tiers, pricing, and promotional codes.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="font-bold border-border text-foreground hover:bg-muted">
            <Tag className="w-4 h-4 mr-2" /> Promo Codes
          </Button>
          <Button className="bg-color-accent text-white hover:bg-color-accent/90 rounded-full font-bold">
            <Plus className="w-4 h-4 mr-2" /> Add Tier
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
              <th className="p-4 font-medium">Tier Name</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Limit</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {tiers.map(tier => (
              <tr key={tier.id} className="hover:bg-muted/30 transition-soft group">
                <td className="p-4">
                  <div className="font-bold text-base mb-1">{tier.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-xs">{tier.description}</div>
                </td>
                <td className="p-4 font-bold font-display text-xl text-color-primary">
                  {(tier.price / 100).toLocaleString('en-US', { style: 'currency', currency: tier.currency })}
                </td>
                <td className="p-4 text-muted-foreground">
                  {tier.capacity ? tier.capacity.toLocaleString() : 'Unlimited'}
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                    tier.status === 'ACTIVE' ? 'bg-color-success/20 text-color-success border-color-success/30' :
                    tier.status === 'SOLD_OUT' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    {tier.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-soft">
                    <button className="p-2 text-muted-foreground hover:text-color-primary" title="Payment Link"><CreditCard className="w-4 h-4" /></button>
                    <button className="p-2 text-muted-foreground hover:text-foreground" title="Settings"><Settings className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
