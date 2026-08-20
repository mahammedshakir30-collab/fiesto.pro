import React from 'react';
import { ShoppingBag, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function VendorOrdersPage({ params }: { params: { vendorId: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: params.vendorId }
  });

  if (!vendor) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">Manage customer orders and sales history.</p>
        </div>
        <Button variant="outline" disabled className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-soft">
        <div className="flex flex-col items-center justify-center text-center py-12 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          
          <h2 className="font-heading text-2xl font-bold mb-2">No vendor-scoped orders available</h2>
          <p className="text-muted-foreground mb-8">
            Currently, the core checkout system processes festival-wide orders and does not yet split them by vendor. This feature is flagged as a dependency gap and will be enabled in a future update.
          </p>

          <div className="p-4 bg-color-accent/10 text-color-accent rounded-xl border border-color-accent/20 flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold">Dependency Gap</span>
              <p className="mt-1 opacity-90">
                Awaiting "Vendor-Scoped Line Items" update to the core Order schema. Export and filtering features will become active once individual vendor line items are trackable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
