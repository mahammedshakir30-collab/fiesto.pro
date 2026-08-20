"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PricingSection } from '@/components/public/PricingSection';
import { createCustomerPortalSession, cancelSubscription } from '@/actions/billing';
import { buildWhatsAppUpgradeLink } from '@/lib/whatsapp';
import { CalendarDays, CreditCard, AlertTriangle, ArrowRight, Download } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function BillingClient({ 
  festival, 
  subscription, 
  invoices, 
  planTiers,
  user
}: any) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const handlePortalSession = async () => {
    try {
      await createCustomerPortalSession(festival.id);
    } catch (err: any) {
      alert("Failed to open portal: " + err.message);
    }
  };

  const logUpgradeIntent = async (targetPlanId: string) => {
    try {
      await fetch('/api/analytics/upgrade-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          festivalId: festival.id, 
          requestedPlanId: targetPlanId, 
          currentPlanId: subscription?.planTierId 
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription(festival.id, cancelReason);
      alert("Subscription cancelled. You will have access until the end of your billing period.");
      setShowCancelDialog(false);
      window.location.reload();
    } catch (err: any) {
      alert("Failed to cancel: " + err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  // Status Badge Logic
  const renderStatusBadge = () => {
    if (!subscription) return <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">NO SUBSCRIPTION</span>;

    const s = subscription.status;
    if (s === 'ACTIVE') {
      return <span className="px-3 py-1 bg-[#A3B565]/20 text-[#A3B565] border border-[#A3B565]/50 rounded-full text-xs font-bold">ACTIVE</span>;
    }
    if (s === 'PAST_DUE') {
      return <span className="px-3 py-1 bg-[#F1642E]/20 text-[#F1642E] border border-[#F1642E]/50 rounded-full text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> PAST DUE</span>;
    }
    if (s === 'CANCELED') {
      return <span className="px-3 py-1 bg-gray-200 text-gray-700 border border-gray-300 rounded-full text-xs font-bold">CANCELED</span>;
    }
    if (s === 'TRIALING') {
      const daysLeft = subscription.currentPeriodEnd ? differenceInDays(new Date(subscription.currentPeriodEnd), new Date()) : 0;
      // Interpolate color from orange (safe) to warning (approaching expiry)
      // We'll use static classes for simplicity: if > 3 days it's safe (FCDD9D yellowish), if <= 3 it's warning (F1642E)
      const isExpiringSoon = daysLeft <= 3;
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isExpiringSoon ? 'bg-[#F1642E]/20 text-[#F1642E] border-[#F1642E]/50' : 'bg-[#FCDD9D]/40 text-[#504E76] border-[#FCDD9D]'}`}>
          TRIAL: {daysLeft} DAYS LEFT
        </span>
      );
    }
    return <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">{s}</span>;
  };

  return (
    <div className="space-y-12">
      {/* OVERVIEW CARD */}
      <section className="bg-white border border-[#C4C3E3] rounded-3xl p-8 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-[#504E76]">{subscription?.planTier?.name || 'Free Plan'}</h2>
            {renderStatusBadge()}
          </div>
          {subscription?.status === 'TRIALING' && (
            <p className="text-[#F1642E] font-medium text-sm mt-1">
              Your trial ends on {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
            </p>
          )}
          {subscription?.cancelAtPeriodEnd && (
            <p className="text-muted-foreground text-sm mt-1">
              Cancels on {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {subscription?.status === 'PAST_DUE' ? (
            <Button variant="default" className="bg-[#F1642E] hover:bg-[#F1642E]/90 text-white" onClick={handlePortalSession}>
              <CreditCard className="w-4 h-4 mr-2" /> Update Payment Method
            </Button>
          ) : (
            <>
              {subscription?.stripeCustomerId && (
                <Button variant="outline" className="border-[#C4C3E3] text-[#504E76]" onClick={handlePortalSession}>
                  Manage Billing (Stripe)
                </Button>
              )}
            </>
          )}
        </div>
      </section>

      {/* PLANS GRID */}
      <div className="-mx-6">
        <PricingSection 
          plans={planTiers} 
          context="organizer" 
          festival={festival} 
          user={user} 
          currentPlanId={subscription?.planTierId} 
        />
      </div>

      {/* INVOICES */}
      <section>
        <h3 className="text-xl font-bold text-[#504E76] mb-6">Invoices</h3>
        {invoices && invoices.length > 0 ? (
          <div className="overflow-hidden border border-[#C4C3E3] rounded-2xl bg-white shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 border-b border-[#C4C3E3]">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#504E76]">Date</th>
                  <th className="px-6 py-4 font-bold text-[#504E76]">Amount</th>
                  <th className="px-6 py-4 font-bold text-[#504E76]">Status</th>
                  <th className="px-6 py-4 font-bold text-[#504E76]">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4C3E3]/50">
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 text-[#504E76]">{new Date(inv.issuedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-[#504E76]">₹{inv.amountPaid}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${inv.status === 'paid' ? 'bg-[#A3B565]/20 text-[#A3B565]' : 'bg-[#F1642E]/20 text-[#F1642E]'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {inv.pdfUrl ? (
                        <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                          <Download className="w-4 h-4 mr-1" /> PDF
                        </a>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 border border-dashed border-[#C4C3E3] rounded-2xl">
            <p className="text-muted-foreground">No invoices found.</p>
          </div>
        )}
      </section>

      {/* CANCEL MODAL */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-soft relative">
            <h3 className="text-2xl font-bold text-[#504E76] mb-4">Cancel Subscription</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to cancel? You will retain access to your current features until the end of your billing cycle, after which you will be downgraded. Features like custom domains will stop working.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#504E76] mb-2">Reason for cancelling (optional)</label>
              <textarea 
                className="w-full rounded-xl border border-[#C4C3E3] p-3 text-sm focus:ring-[#504E76] focus:border-[#504E76]"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Help us improve..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isCancelling}>Keep Subscription</Button>
              <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
