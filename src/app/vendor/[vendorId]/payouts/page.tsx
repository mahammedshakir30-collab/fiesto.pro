import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CreditCard, AlertCircle, CheckCircle2, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default async function VendorPayoutsPage({ params }: { params: { vendorId: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: params.vendorId },
    include: { payouts: { orderBy: { periodStart: 'desc' } } }
  });

  if (!vendor) notFound();

  // For demonstration, since Stripe Account ID is not stored on Vendor model yet,
  // we mock the Stripe Connect state based on whether there are any payouts.
  // In a real implementation, you'd check `vendor.stripeAccountId` and `vendor.stripeChargesEnabled`.
  const isConnected = false; 

  const upcomingAmount = 0; // Would be computed from unpaid orders
  const upcomingDate = new Date();
  upcomingDate.setDate(upcomingDate.getDate() + 7);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Payouts</h1>
        <p className="text-muted-foreground mt-2">Manage your earnings, payouts, and payment details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-soft">
            <h2 className="font-heading text-xl font-bold mb-6">Payout History</h2>
            
            {vendor.payouts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                <CreditCard className="w-10 h-10 text-muted-foreground opacity-50 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-1">No Payouts Yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  When you start receiving payouts from sales, they will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-xl">Period</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Paid Date</th>
                      <th className="px-6 py-4 rounded-tr-xl">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {vendor.payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          {payout.periodStart.toLocaleDateString()} - {payout.periodEnd.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-foreground">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            payout.status === 'paid' ? 'bg-color-success/10 text-color-success' :
                            payout.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                            'bg-color-accent/10 text-color-accent'
                          }`}>
                            {payout.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {payout.paidAt ? payout.paidAt.toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4">
                          {payout.stripeTransferId ? (
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                              {payout.stripeTransferId}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
            <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Next Estimated Payout
            </h3>
            <div className="font-display text-5xl text-foreground mb-2">
              {formatCurrency(upcomingAmount)}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Scheduled for <span className="text-foreground">{upcomingDate.toLocaleDateString()}</span>
            </p>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Estimates are based on unpaid orders and may change due to refunds or disputes.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft relative overflow-hidden">
            {isConnected ? (
              <div className="absolute top-0 left-0 w-full h-1 bg-color-success"></div>
            ) : (
              <div className="absolute top-0 left-0 w-full h-1 bg-color-accent"></div>
            )}
            
            <h3 className="font-bold text-lg mb-2">Stripe Connect</h3>
            
            {isConnected ? (
              <div>
                <div className="flex items-center gap-2 text-color-success font-bold text-sm mb-4">
                  <CheckCircle2 className="w-5 h-5" /> Connected and Active
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Your account is verified and ready to receive payouts.
                </p>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  View Stripe Dashboard <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-color-accent font-bold text-sm mb-4">
                  <AlertCircle className="w-5 h-5" /> Action Required
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  You must complete onboarding with Stripe to receive your payouts.
                </p>
                <Button className="w-full bg-[#635BFF] hover:bg-[#635BFF]/90 text-white font-bold h-12 rounded-xl">
                  Complete Setup
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
