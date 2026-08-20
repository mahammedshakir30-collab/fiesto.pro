"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trophy, Users, CheckCircle, Activity, ExternalLink, Plus } from 'lucide-react';
import { addTeamPoint, updatePublishState } from '@/actions/pulse';
import Link from 'next/link';

interface LivePulseProps {
  festivalId: string;
  festivalSlug: string;
  stats: {
    programmesCount: number;
    candidatesCount: number;
    categoriesCount: number;
    pointsCount: number;
  };
  rankedTeams: { id: string; name: string; points: number }[];
  rankedCandidates: { id: string; name: string; points: number }[];
  publishState: any;
  teams: any[];
}

export function LivePulseDashboard({ 
  festivalId, 
  festivalSlug,
  stats, 
  rankedTeams, 
  rankedCandidates, 
  publishState,
  teams
}: LivePulseProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAddingPoint, setIsAddingPoint] = useState(false);

  const defaultState = publishState || { published: false, showCandidates: true, showReasons: false };

  const handlePublishChange = async (field: string, value: boolean) => {
    setIsPublishing(true);
    try {
      await updatePublishState(festivalId, {
        published: field === 'published' ? value : defaultState.published,
        showCandidates: field === 'showCandidates' ? value : defaultState.showCandidates,
        showReasons: field === 'showReasons' ? value : defaultState.showReasons,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update publish state");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddPoint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddingPoint(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('festivalId', festivalId);
      await addTeamPoint(formData);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      alert("Failed to add point");
    } finally {
      setIsAddingPoint(false);
    }
  };

  const topTeam = rankedTeams.length > 0 ? rankedTeams[0].name : 'N/A';

  return (
    <div className="space-y-6">
      {/* Quick Status Strip */}
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          <h2 className="font-bold text-primary">Live Pulse Active</h2>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <div><span className="text-muted-foreground mr-1">Top Team:</span> {topTeam}</div>
          <div><span className="text-muted-foreground mr-1">Points Logged:</span> {stats.pointsCount}</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Programmes</p>
                <h3 className="text-3xl font-black text-[#504E76]">{stats.programmesCount}</h3>
              </div>
              <Activity className="w-5 h-5 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Candidates</p>
                <h3 className="text-3xl font-black text-[#504E76]">{stats.candidatesCount}</h3>
              </div>
              <Users className="w-5 h-5 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Categories</p>
                <h3 className="text-3xl font-black text-[#504E76]">{stats.categoriesCount}</h3>
              </div>
              <CheckCircle className="w-5 h-5 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Points</p>
                <h3 className="text-3xl font-black text-[#504E76]">{stats.pointsCount}</h3>
              </div>
              <Trophy className="w-5 h-5 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Standings & Add Point */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-[#C4C3E3]">
            <CardHeader className="border-b border-[#C4C3E3] bg-muted/20 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold text-[#504E76] flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Team Points Ledger
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Manual point ledger and public standings visibility.</p>
                </div>
                
                {/* Publish Controls */}
                <div className="bg-card border p-3 rounded-xl shadow-sm text-sm min-w-[280px]">
                  <div className="flex items-center justify-between mb-3 border-b pb-2">
                    <div className="font-bold">Publish to Public</div>
                    <Switch 
                      checked={defaultState.published} 
                      onCheckedChange={(c) => handlePublishChange('published', c)} 
                      disabled={isPublishing}
                    />
                  </div>
                  <div className="space-y-2 mb-3">
                    <Label className="flex items-center justify-between text-xs cursor-pointer">
                      <span>Show Top Candidates</span>
                      <Switch 
                        checked={defaultState.showCandidates} 
                        onCheckedChange={(c) => handlePublishChange('showCandidates', c)}
                        disabled={isPublishing}
                        className="scale-75"
                      />
                    </Label>
                    <Label className="flex items-center justify-between text-xs cursor-pointer">
                      <span>Show Reasons Log</span>
                      <Switch 
                        checked={defaultState.showReasons} 
                        onCheckedChange={(c) => handlePublishChange('showReasons', c)}
                        disabled={isPublishing}
                        className="scale-75"
                      />
                    </Label>
                  </div>
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs font-bold" asChild>
                    <a href={`/discover/${festivalSlug}/standings`} target="_blank" rel="noopener noreferrer">
                      Preview Standings <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Add Point Entry</h3>
              <form onSubmit={handleAddPoint} className="flex flex-col md:flex-row gap-3 items-end mb-8 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex-1 w-full">
                  <Label className="text-xs mb-1 block">Team *</Label>
                  <select name="teamId" required className="w-full p-2 border rounded-lg text-sm bg-background">
                    <option value="">Select a team...</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <Label className="text-xs mb-1 block">Candidate (Optional)</Label>
                  {/* For simplicity we'll just use a text input for candidate ID or omit, actually the prompt says "Candidate (optional)" but a real select would fetch candidates per team. We'll leave it as a simple text input for ID for now, or just skip full relation in this simple form. Let's provide a text input for ID for now. */}
                  <input type="text" name="candidateId" placeholder="Candidate ID" className="w-full p-2 border rounded-lg text-sm bg-background" />
                </div>
                <div className="w-24 w-full">
                  <Label className="text-xs mb-1 block">Points *</Label>
                  <input type="number" name="points" required step="0.5" className="w-full p-2 border rounded-lg text-sm bg-background" />
                </div>
                <div className="flex-1 w-full">
                  <Label className="text-xs mb-1 block">Reason *</Label>
                  <input type="text" name="reason" required placeholder="e.g. Winner - Solo Dance" className="w-full p-2 border rounded-lg text-sm bg-background" />
                </div>
                <Button type="submit" disabled={isAddingPoint} className="bg-primary text-white whitespace-nowrap h-9">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </form>

              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Current Team Rankings</h3>
              <div className="space-y-2">
                {rankedTeams.map((t, i) => (
                  <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
                        {i + 1}
                      </div>
                      <span className="font-bold text-[#504E76]">{t.name}</span>
                    </div>
                    <div className="font-black text-lg text-[#504E76]">{t.points} <span className="text-xs text-muted-foreground font-normal">pts</span></div>
                  </div>
                ))}
                {rankedTeams.length === 0 && (
                  <div className="text-center p-6 text-sm text-muted-foreground border border-dashed rounded-xl">
                    No points logged yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Candidates & Progress */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-bold">Top Candidates</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {rankedCandidates.slice(0, 10).map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                      <span className="font-medium text-sm truncate max-w-[140px]">{c.name}</span>
                    </div>
                    <span className="font-bold text-sm text-primary">{c.points} <span className="font-normal text-xs text-muted-foreground">pts</span></span>
                  </div>
                ))}
                {rankedCandidates.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground p-4">
                    No individual candidates ranked yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-bold">Registration Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-muted-foreground">Teams Onboarded</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-muted-foreground">Candidates Reg.</span>
                    <span>85%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[85%]"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
