import React from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Filter, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { getFestivalById } from '@/actions/utils';
import { getVendorsForFestival } from '@/actions/vendors';
import { BulkImportWizard } from '@/components/organizer/BulkImportWizard';

export default async function FestivalVendorsPage({ params }: { params: { festivalId: string } }) {
  const festival = await getFestivalById(params.festivalId);
  if (!festival) notFound();

  const vendors = await getVendorsForFestival(festival.id);

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground mt-2">Review applications and assign booth locations.</p>
        </div>
        <div className="flex items-center gap-3">
          <BulkImportWizard festivalId={festival.id} entity="VENDOR" title="Import Vendors" />
          <Button variant="outline" className="font-bold border-border text-foreground hover:bg-muted">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Vendors List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-heading text-xl font-bold border-b border-border pb-2">Approved Vendors</h2>
          {vendors.filter(v => v.status === 'ACTIVE').map(vendor => (
            <div key={vendor.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-soft">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-heading text-xl font-bold">{vendor.name}</h3>
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider rounded">
                    {vendor.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{vendor.description}</p>
              </div>
              <div className="shrink-0 flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Booth Assigned</span>
                  <div className="flex items-center gap-1 font-mono text-sm text-color-primary bg-color-primary/10 px-3 py-1 rounded-md border border-color-primary/20">
                    <MapPin className="w-4 h-4" /> B-42
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Applications Sidebar */}
        <div className="space-y-6">
          <h2 className="font-heading text-xl font-bold border-b border-border pb-2 flex items-center justify-between">
            <span>Pending Apps</span>
            <span className="w-6 h-6 rounded-full bg-color-warning text-warning-foreground text-xs flex items-center justify-center font-bold">2</span>
          </h2>
          
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-card border border-color-warning/50 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-color-warning"></div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-color-warning" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Received 2d ago</span>
                </div>
                <h4 className="font-bold text-sm mb-1">Neon Eats Co.</h4>
                <p className="text-xs text-muted-foreground mb-4">Food Truck - Gourmet Burgers</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-color-success text-white hover:bg-color-success/90 font-bold">Approve</Button>
                  <Button size="sm" variant="outline" className="flex-1">Review</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
