import React from 'react';
import { notFound } from 'next/navigation';
import { ScheduleGrid } from '@/components/organizer/ScheduleGrid';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getFestivalById } from '@/actions/utils';
import { getStages, getLineupSlots, getArtists } from '@/actions/lineup';

export default async function FestivalLineupPage({ params }: { params: { festivalId: string } }) {
  const festival = await getFestivalById(params.festivalId);
  if (!festival) notFound();

  const [stages, slots, artists] = await Promise.all([
    getStages(festival.id),
    getLineupSlots(festival.id),
    getArtists()
  ]);

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Lineup & Schedule</h1>
          <p className="text-muted-foreground mt-2">Drag and drop artists to build your festival timeline.</p>
        </div>
        <Button className="bg-color-accent text-white hover:bg-color-accent/90 rounded-full font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add Performance
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <select className="bg-card border border-border text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-color-primary">
          <option>Day 1 - {new Date(festival.startDate).toLocaleDateString()}</option>
          <option>Day 2 - {new Date(festival.endDate).toLocaleDateString()}</option>
        </select>
        <Button variant="outline" className="border-border text-foreground hover:bg-muted font-bold">
          Auto-fill Gaps
        </Button>
      </div>

      <ScheduleGrid 
        festival={festival} 
        stages={stages} 
        slots={slots} 
        artists={artists} 
      />
    </div>
  );
}
