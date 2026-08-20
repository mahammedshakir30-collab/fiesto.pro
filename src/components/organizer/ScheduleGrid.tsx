"use client";

import React from 'react';
import { Festival, Stage, LineupSlot, Artist } from '@/lib/types';
import { Clock } from 'lucide-react';

export function ScheduleGrid({ 
  festival, 
  stages, 
  slots, 
  artists 
}: { 
  festival: Festival, 
  stages: Stage[], 
  slots: LineupSlot[], 
  artists: Artist[] 
}) {
  // A simplified, static timeline grid simulation
  const hours = ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[800px]">
        {/* Header Row (Time) */}
        <div className="flex border-b border-border bg-muted/50">
          <div className="w-48 shrink-0 border-r border-border p-4 font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" /> Stages
          </div>
          <div className="flex-1 flex">
            {hours.map(hour => (
              <div key={hour} className="flex-1 min-w-[100px] p-4 text-xs font-bold text-muted-foreground border-r border-border/50 text-center">
                {hour}
              </div>
            ))}
          </div>
        </div>

        {/* Stage Rows */}
        {stages.map(stage => {
          const stageSlots = slots.filter(s => s.stageId === stage.id);
          
          return (
            <div key={stage.id} className="flex border-b border-border last:border-0 hover:bg-muted/30 transition-soft relative h-24">
              {/* Stage Name col */}
              <div className="w-48 shrink-0 border-r border-border p-4 flex flex-col justify-center bg-card z-10">
                <div className="font-bold text-sm truncate">{stage.name}</div>
                <div className="text-xs text-muted-foreground truncate">Cap: {stage.capacity ? stage.capacity.toLocaleString() : 'N/A'}</div>
              </div>

              {/* Timeline blocks container */}
              <div className="flex-1 relative flex">
                {/* Background grid lines */}
                {hours.map(hour => (
                  <div key={hour} className="flex-1 min-w-[100px] border-r border-border/20"></div>
                ))}

                {/* Render Mock Blocks absolute based on percentage (simplified for visual mock) */}
                {/* Normally we'd calculate exact left/width based on start/end times. We'll simulate a few blocks. */}
                {stageSlots.slice(0, 3).map((slot, i) => {
                  const artist = artists.find(a => a.id === slot.artistId);
                  if (!artist) return null;
                  
                  // Mock positions just for the visual builder effect
                  const left = `${(i * 30) + 10}%`; 
                  const width = '25%';

                  return (
                    <div 
                      key={slot.id} 
                      className="absolute top-3 bottom-3 rounded-xl bg-color-primary/20 border border-color-primary/30 p-2 cursor-grab hover:bg-color-primary hover:text-white transition-soft group shadow-sm flex flex-col justify-center"
                      style={{ left, width }}
                    >
                      <div className="font-bold text-xs truncate text-color-primary group-hover:text-white">{artist.name}</div>
                      <div className="text-[10px] opacity-70 truncate">{new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
