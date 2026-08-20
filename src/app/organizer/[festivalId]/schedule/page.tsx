import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

export default function SchedulePage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">
          Manage and view the chronological sequence of all events and programs.
        </p>
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-color-primary" />
            Master Schedule
          </CardTitle>
          <CardDescription>
            The master timeline of events will appear here. This module is currently under construction.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center border-t border-border/50 bg-muted/20">
          <p className="text-muted-foreground text-sm font-medium">Coming soon in the next update.</p>
        </CardContent>
      </Card>
    </div>
  );
}
