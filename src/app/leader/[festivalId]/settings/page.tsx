import React from 'react';
import { validateLeaderAccess } from '@/actions/leader';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Ticket, Shield, Calendar, MapPin, Download, CheckCircle2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LeaderSettingsPage({ params }: { params: { festivalId: string } }) {
  try {
    const { team, session } = await validateLeaderAccess(params.festivalId);

    const [candidatesCount, registrationsCount] = await Promise.all([
      prisma.candidate.count({
        where: { festivalId: params.festivalId, teamId: team.id }
      }),
      prisma.registration.count({
        where: {
          candidate: { festivalId: params.festivalId, teamId: team.id }
        }
      })
    ]);

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">Team Overview & Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Information, roster statistics, and export options for {team.name}.
          </p>
        </div>

        {/* Team Profile Card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-muted/20 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold font-heading">Team Identity</CardTitle>
                <CardDescription className="text-xs">Your registered team profile in this festival</CardDescription>
              </div>
              <Badge variant="outline" className="bg-color-primary/10 text-color-primary font-bold px-3 py-1">
                Active Team
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                <div className="text-xs text-muted-foreground uppercase font-semibold">Team Name</div>
                <div className="text-2xl font-bold font-heading text-color-primary mt-1">{team.name}</div>
                <div className="text-xs text-muted-foreground mt-2">Team ID: <span className="font-mono">{team.id}</span></div>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                <div className="text-xs text-muted-foreground uppercase font-semibold">Team Leader</div>
                <div className="text-lg font-bold mt-1">{session.user.name || 'Team Leader'}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{session.user.email}</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Leader Permissions
                </div>
              </div>
            </div>

            {/* Festival Details */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Festival Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Festival</div>
                  <div className="font-semibold">{team.festival.name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Location</div>
                  <div className="font-semibold">{team.festival.location || 'Main Venue'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <Badge variant="outline" className="text-xs uppercase">{team.festival.status}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links & Shortcuts */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-heading">Leader Quick Tools</CardTitle>
            <CardDescription className="text-xs">Quickly jump to relevant sections of your team</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href={`/leader/${params.festivalId}/candidates`} className="block">
              <div className="p-4 rounded-xl border border-border hover:border-color-primary transition-all bg-card/60 hover:bg-muted/30 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-color-primary/10 text-color-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Manage Candidates</div>
                    <div className="text-xs text-muted-foreground">{candidatesCount} candidates in team</div>
                  </div>
                </div>
              </div>
            </Link>

            <Link href={`/leader/${params.festivalId}/registrations`} className="block">
              <div className="p-4 rounded-xl border border-border hover:border-color-accent transition-all bg-card/60 hover:bg-muted/30 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-color-accent/10 text-color-accent">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Programme Registrations</div>
                    <div className="text-xs text-muted-foreground">{registrationsCount} registrations completed</div>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error: any) {
    console.error('Leader Settings Error:', error);
    redirect('/portal');
  }
}
