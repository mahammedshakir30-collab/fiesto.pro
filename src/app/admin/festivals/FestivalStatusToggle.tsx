"use client";

import { useState } from "react";
import { updateFestivalStatus } from "@/actions/festivals";
import { MoreHorizontal, ShieldAlert, Star, PlayCircle, PauseCircle } from "lucide-react";

export function FestivalStatusToggle({ festivalId, currentStatus }: { festivalId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  const toggleStatus = async (newStatus: string) => {
    setLoading(true);
    await updateFestivalStatus(festivalId, newStatus);
    window.location.reload();
  };

  return (
    <div className={`flex items-center justify-end gap-2 transition-soft ${loading ? "opacity-50" : "opacity-0 group-hover:opacity-100"}`}>
      <button title="Feature" className="p-2 text-muted-foreground hover:text-color-warning"><Star className="w-4 h-4" /></button>
      {currentStatus === 'LIVE' ? (
        <button onClick={() => toggleStatus('PUBLISHED')} title="Pause" className="p-2 text-muted-foreground hover:text-color-primary"><PauseCircle className="w-4 h-4" /></button>
      ) : (
        <button onClick={() => toggleStatus('LIVE')} title="Set Live" className="p-2 text-muted-foreground hover:text-color-success"><PlayCircle className="w-4 h-4" /></button>
      )}
      <button onClick={() => toggleStatus('CANCELLED')} title="Suspend" className="p-2 text-muted-foreground hover:text-destructive"><ShieldAlert className="w-4 h-4" /></button>
      <button className="p-2 text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
    </div>
  );
}
