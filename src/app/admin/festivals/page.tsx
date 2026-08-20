import React from 'react';
import { getAdminFestivals } from '@/actions/festivals';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Plus, ShieldAlert, Star, PlayCircle, PauseCircle } from 'lucide-react';
import Link from 'next/link';
import { FestivalStatusToggle } from './FestivalStatusToggle';

export default async function AdminFestivalsPage() {
  const { data: festivals } = await getAdminFestivals();

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Festivals</h1>
          <p className="text-muted-foreground mt-2">Manage all events across the platform.</p>
        </div>
        <Button className="bg-color-accent text-white hover:bg-color-accent/90 rounded-full font-bold">
          <Plus className="w-4 h-4 mr-2" /> Create Festival
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium hidden md:table-cell">Location</th>
              <th className="p-4 font-medium hidden lg:table-cell">Dates</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {festivals.map(fest => (
              <tr key={fest.id} className="hover:bg-muted/30 transition-soft group">
                <td className="p-4">
                  <div className="font-bold text-base mb-1 group-hover:text-color-accent transition-soft">
                    <Link href={`/organizer/${fest.id}`}>{fest.name}</Link>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">{fest.id}</div>
                </td>
                <td className="p-4 hidden md:table-cell text-muted-foreground">{fest.location}</td>
                <td className="p-4 hidden lg:table-cell text-muted-foreground">
                  {new Date(fest.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="p-4">
                  <StatusBadge status={fest.status as any} />
                </td>
                <td className="p-4 text-right">
                  <FestivalStatusToggle festivalId={fest.id} currentStatus={fest.status as any} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-color-soft/20 text-color-soft border-color-soft/30',
    PUBLISHED: 'bg-color-primary/20 text-color-primary border-color-primary/30',
    LIVE: 'bg-color-success/20 text-color-success border-color-success/30',
    COMPLETED: 'bg-muted text-muted-foreground border-border',
    CANCELLED: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
}
