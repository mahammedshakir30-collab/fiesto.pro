import React from 'react';
import { Download, FileText, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminBillingPage() {
  const invoices = [
    { id: 'INV-2026-08', org: 'Neon Nights Productions', amount: 15420.00, status: 'paid', date: 'Aug 01, 2026' },
    { id: 'INV-2026-07', org: 'Desert Frequency', amount: 8900.50, status: 'paid', date: 'Jul 01, 2026' },
    { id: 'INV-2026-06', org: 'Aurora Borealis Sound', amount: 12050.00, status: 'pending', date: 'Jun 01, 2026' },
    { id: 'INV-2026-05', org: 'Neon Nights Productions', amount: 14100.00, status: 'paid', date: 'May 01, 2026' },
  ];

  return (
    <div className="max-w-7xl">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Billing & Revenue</h1>
          <p className="text-muted-foreground mt-2">Platform revenue splits, active tiers, and invoices.</p>
        </div>
        <Button variant="outline" className="font-bold border-border text-foreground hover:bg-muted">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 bg-card border border-border rounded-2xl">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Platform Cut (3%)</div>
          <div className="font-display text-4xl text-color-success">$142,500</div>
          <div className="text-xs text-muted-foreground mt-2">MTD Revenue</div>
        </div>
        <div className="p-6 bg-card border border-border rounded-2xl">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Pending Payouts</div>
          <div className="font-display text-4xl text-color-warning">$84,200</div>
          <div className="text-xs text-muted-foreground mt-2">To Organizers</div>
        </div>
        <div className="p-6 bg-card border border-border rounded-2xl bg-gradient-to-br from-color-primary/20 to-transparent">
          <div className="text-sm font-bold text-color-primary uppercase tracking-wider mb-2">Pro Subscriptions</div>
          <div className="font-display text-4xl">42</div>
          <div className="text-xs text-muted-foreground mt-2">Active Orgs on $99/mo tier</div>
        </div>
      </div>

      <div>
        <h3 className="font-heading text-xl font-bold mb-6">Recent Invoices</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                <th className="p-4 font-medium">Invoice ID</th>
                <th className="p-4 font-medium">Organizer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-soft">
                  <td className="p-4 font-mono font-bold">{inv.id}</td>
                  <td className="p-4">{inv.org}</td>
                  <td className="p-4 text-muted-foreground">{inv.date}</td>
                  <td className="p-4 font-bold">${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${inv.status === 'paid' ? 'bg-color-success/20 text-color-success' : 'bg-color-warning/20 text-color-warning'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-muted-foreground hover:text-foreground transition-soft">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
