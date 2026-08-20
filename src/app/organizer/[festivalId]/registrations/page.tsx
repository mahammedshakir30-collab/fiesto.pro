import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Ticket } from 'lucide-react';
import { BulkImportWizard } from '@/components/organizer/BulkImportWizard';

export default function RegistrationsPage({ params }: { params: { festivalId: string } }) {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Registrations</h1>
          <p className="text-muted-foreground">
            Manage ticket sales, attendee registrations, and access passes.
          </p>
        </div>
        <BulkImportWizard festivalId={params.festivalId} entity="REGISTRATION" title="Import Registrations" />
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-color-primary" />
            Registration Hub
          </CardTitle>
          <CardDescription>
            Registration analytics and user data will appear here. This module is currently under construction.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center border-t border-border/50 bg-muted/20">
          <p className="text-muted-foreground text-sm font-medium">Coming soon in the next update.</p>
        </CardContent>
      </Card>
    </div>
  );
}
