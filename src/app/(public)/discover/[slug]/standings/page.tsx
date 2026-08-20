import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PusherStandingsClient } from './PusherStandingsClient';
import { Trophy, Users, AlertCircle, Award, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default async function StandingsPage({ params }: { params: { slug: string } }) {
  const festival = await prisma.festival.findUnique({
    where: { slug: params.slug },
    include: {
      standingsPublishState: true
    }
  });

  if (!festival) notFound();

  const publishState = festival.standingsPublishState;

  if (!publishState?.published) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
        <Trophy className="w-16 h-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-3xl font-black font-heading text-[#504E76] mb-4">Standings Not Available</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The standings for {festival.name} haven't been published yet. Please check back later during the live event.
        </p>
        <Link href={`/discover/${festival.slug}`} className="px-6 py-3 bg-color-primary text-white rounded-full font-bold hover:bg-color-primary/90 transition-all">
          Return to Festival
        </Link>
      </div>
    );
  }

  // Fetch points and candidate groups in parallel
  const [pointsEntries, candidatePoints, publishedProgrammes] = await Promise.all([
    prisma.teamPointEntry.findMany({
      where: { festivalId: festival.id },
      include: { 
        team: true,
        programme: { select: { id: true, name: true, code: true, pointsPublished: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    publishState.showCandidates
      ? prisma.teamPointEntry.groupBy({
          by: ['candidateId'],
          where: { festivalId: festival.id, candidateId: { not: null } },
          _sum: { points: true }
        })
      : Promise.resolve([]),
    prisma.programme.findMany({
      where: { festivalId: festival.id, pointsPublished: true },
      include: {
        category: true,
        teamPointEntries: {
          include: {
            candidate: { select: { id: true, name: true, chestNumber: true } },
            team: { select: { id: true, name: true } }
          },
          orderBy: { points: 'desc' }
        }
      },
      orderBy: { code: 'asc' }
    })
  ]);

  // Aggregate Team Points
  const teamMap: Record<string, { id: string, name: string, points: number, entries: typeof pointsEntries }> = {};
  for (const entry of pointsEntries) {
    if (!teamMap[entry.teamId]) {
      teamMap[entry.teamId] = { id: entry.teamId, name: entry.team.name, points: 0, entries: [] };
    }
    teamMap[entry.teamId].points += entry.points;
    teamMap[entry.teamId].entries.push(entry);
  }
  const rankedTeams = Object.values(teamMap).sort((a, b) => b.points - a.points);

  // Aggregate Candidate Points if needed
  let rankedCandidates: { id: string, name: string, points: number }[] = [];
  if (publishState.showCandidates && candidatePoints.length > 0) {
    const candidateIds = candidatePoints.map(c => c.candidateId).filter(Boolean) as string[];
    const candidates = await prisma.candidate.findMany({
      where: { id: { in: candidateIds } },
      select: { id: true, name: true }
    });
    
    rankedCandidates = candidatePoints.map(cp => {
      const c = candidates.find(cand => cand.id === cp.candidateId);
      return {
        id: cp.candidateId!,
        name: c?.name || 'Unknown',
        points: cp._sum.points || 0
      };
    }).sort((a, b) => b.points - a.points);
  }

  const lastUpdated = pointsEntries.length > 0 ? pointsEntries[0].createdAt : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-12">
      <PusherStandingsClient festivalId={festival.id} />
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFF2ED] text-[#F1642E] rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[#F1642E]/20">
          Live Standings
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-heading text-[#504E76] mb-3">Festival Standings</h1>
        <p className="text-xl text-muted-foreground">{festival.name}</p>
        
        {lastUpdated && (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Teams Leaderboard */}
        <div className={`space-y-6 ${publishState.showCandidates ? 'lg:col-span-2' : 'lg:col-span-3 max-w-4xl mx-auto w-full'}`}>
          <div className="bg-card border border-border shadow-soft rounded-3xl overflow-hidden">
            <div className="p-6 md:p-8 border-b bg-muted/20">
              <h2 className="text-2xl font-bold font-heading text-[#504E76] flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-500" /> Team Leaderboard
              </h2>
            </div>
            <div className="divide-y">
              {rankedTeams.map((team, index) => (
                <div key={team.id} className="p-6 md:p-8 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-black text-lg md:text-2xl shadow-sm
                        ${index === 0 ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-200' : 
                          index === 1 ? 'bg-gray-100 text-gray-700 border-2 border-gray-200' :
                          index === 2 ? 'bg-orange-100 text-orange-800 border-2 border-orange-200' :
                          'bg-muted text-muted-foreground'}`}>
                        {index + 1}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-[#504E76]">{team.name}</h3>
                    </div>
                    <div className="text-2xl md:text-4xl font-black text-primary">
                      {team.points} <span className="text-sm md:text-lg font-bold text-muted-foreground">pts</span>
                    </div>
                  </div>
                  
                  {/* Reasons / Points Breakdown: only show programme details if pointsPublished is true */}
                  {publishState.showReasons && team.entries.length > 0 && (
                    <div className="mt-6 ml-14 md:ml-20">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Recent Points</h4>
                      <div className="space-y-2">
                        {team.entries.slice(0, 8).map(entry => {
                          const isProgPublished = entry.programme ? entry.programme.pointsPublished : true;
                          const displayReason = isProgPublished 
                            ? entry.reason 
                            : 'Points Awarded (Programme details pending)';

                          return (
                            <div key={entry.id} className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-xl border border-border/50">
                              <span className="text-[#504E76] font-medium">{displayReason}</span>
                              <span className="font-bold text-primary shrink-0">+{entry.points}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {rankedTeams.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  No points have been awarded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Candidates */}
        {publishState.showCandidates && (
          <div className="space-y-6">
            <div className="bg-card border border-border shadow-soft rounded-3xl overflow-hidden sticky top-8">
              <div className="p-6 border-b bg-muted/20">
                <h2 className="text-xl font-bold font-heading text-[#504E76] flex items-center gap-2">
                  <Users className="w-5 h-5 text-color-primary" /> Top Candidates
                </h2>
              </div>
              <div className="divide-y">
                {rankedCandidates.slice(0, 15).map((candidate, index) => (
                  <div key={candidate.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-4">{index + 1}.</span>
                      <span className="font-bold text-[#504E76] truncate max-w-[160px]">{candidate.name}</span>
                    </div>
                    <span className="font-bold text-primary">{candidate.points} <span className="text-xs font-normal text-muted-foreground">pts</span></span>
                  </div>
                ))}
                {rankedCandidates.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No candidates ranked yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Published Programmes Points Breakdown */}
      {publishedProgrammes.length > 0 && (
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Award className="w-6 h-6 text-[#F1642E]" />
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Published Programme Points</h2>
              <p className="text-xs text-gray-500">Official point breakdowns for concluded programmes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publishedProgrammes.map(prog => (
              <div key={prog.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-800">
                    {prog.code}
                  </span>
                  <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" /> Published
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{prog.name}</h3>
                
                {prog.teamPointEntries.length > 0 ? (
                  <div className="space-y-1.5 pt-2 border-t border-gray-200/60">
                    {prog.teamPointEntries.slice(0, 3).map((entry, idx) => (
                      <div key={entry.id} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-gray-700 truncate max-w-[160px]">
                          {idx + 1}. {entry.candidate?.name || entry.team.name}
                        </span>
                        <span className="font-bold text-[#F1642E]">+{entry.points} pts</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">No points entries</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
