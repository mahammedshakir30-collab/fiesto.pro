import React from 'react';
import { getLeaderDashboardData } from '@/actions/leader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Ticket, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Trophy, 
  Calendar, 
  Plus, 
  Layers,
  Printer
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function LeaderDashboardPage({ params }: { params: { festivalId: string } }) {
  try {
    const { team, festival, stats, candidates, programmes } = await getLeaderDashboardData(params.festivalId);

    const completionRate = stats.totalProgrammes > 0 
      ? Math.round((stats.registeredProgrammesCount / stats.totalProgrammes) * 100) 
      : 0;

    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-color-primary/10 via-color-accent/5 to-transparent border border-border p-6 md:p-8 rounded-3xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-color-primary/20 text-color-primary border-color-primary/30 font-bold px-3 py-1">
                  Team {team.name}
                </Badge>
                <span className="text-xs text-muted-foreground">• Festival Leader Portal</span>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight">
                {festival?.name || 'Festival'} Control Center
              </h1>
              <p className="text-muted-foreground text-sm max-w-xl">
                Manage your team roster, candidate chest numbers, and register your members for stage competitions and festival programmes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/leader/${params.festivalId}/candidates`}>
                <Button variant="outline" className="gap-2 bg-card/80 backdrop-blur shadow-sm">
                  <Users className="w-4 h-4 text-color-primary" />
                  Manage Candidates
                </Button>
              </Link>
              <Link href={`/leader/${params.festivalId}/registrations`}>
                <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
                  <Ticket className="w-4 h-4" />
                  Register for Events
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border-border hover:border-color-primary/40 transition-all shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Team Candidates
              </CardTitle>
              <Users className="h-4 w-4 text-color-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-heading">{stats.totalCandidates}</div>
              <p className="text-xs text-muted-foreground mt-1">Roster members in {team.name}</p>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-color-primary/40 transition-all shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Event Registrations
              </CardTitle>
              <Ticket className="h-4 w-4 text-color-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-heading text-color-accent">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground mt-1">Total slots filled by team</p>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-color-primary/40 transition-all shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Available Events
              </CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-heading">{stats.totalProgrammes}</div>
              <p className="text-xs text-muted-foreground mt-1">Total festival competitions</p>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-color-primary/40 transition-all shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Participation
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
                {stats.registeredProgrammesCount} <span className="text-sm font-normal text-muted-foreground">/ {stats.totalProgrammes}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{completionRate}% programmes covered</p>
            </CardContent>
          </Card>
        </div>

        {/* Split Section: Team Candidates Snapshot & Programme Catalog Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Candidates Snapshot */}
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
              <div>
                <CardTitle className="text-lg font-bold font-heading">Team Roster</CardTitle>
                <CardDescription className="text-xs">Your registered participants and chest numbers</CardDescription>
              </div>
              <Link href={`/leader/${params.festivalId}/candidates`}>
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-color-primary">
                  View All ({stats.totalCandidates}) <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {candidates.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">No candidates in this team yet.</p>
                  <Link href={`/leader/${params.festivalId}/candidates`}>
                    <Button size="sm" variant="outline" className="mt-3 text-xs gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Add First Candidate
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {candidates.slice(0, 5).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/40">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-color-primary/10 text-color-primary flex items-center justify-center font-bold text-xs font-mono">
                          {c.chestNumber || '#'}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.category.name}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs font-normal">
                        {c.registrations.length} {c.registrations.length === 1 ? 'event' : 'events'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Programme Registration Snapshot */}
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
              <div>
                <CardTitle className="text-lg font-bold font-heading">Event Registrations</CardTitle>
                <CardDescription className="text-xs">Programmes with registered candidates from {team.name}</CardDescription>
              </div>
              <Link href={`/leader/${params.festivalId}/registrations`}>
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-color-primary">
                  Open Catalog <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {programmes.filter(p => p.registrations.length > 0).length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">Your team hasn't registered for any programmes yet.</p>
                  <Link href={`/leader/${params.festivalId}/registrations`}>
                    <Button size="sm" className="mt-3 text-xs gap-1.5">
                      <Ticket className="w-3.5 h-3.5" /> Start Registering
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {programmes
                    .filter(p => p.registrations.length > 0)
                    .slice(0, 5)
                    .map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/40">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-background rounded border border-border">
                              {p.code}
                            </span>
                            <span className="font-semibold text-sm">{p.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {p.registrations.map(r => r.candidate.name).join(', ')}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs font-semibold text-color-primary">
                          {p.registrations.length} registered
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('Leader Dashboard Error:', error);
    redirect('/portal');
  }
}
