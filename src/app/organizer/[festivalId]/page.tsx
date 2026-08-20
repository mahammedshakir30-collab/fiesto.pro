import React from 'react';
import { notFound } from 'next/navigation';
import { PlayCircle, ShieldCheck, ExternalLink, ArrowRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getFestivalById } from '@/actions/utils';
import { SetupChecklist } from '@/components/organizer/SetupChecklist';
import { LivePulseDashboard } from '@/components/organizer/LivePulseDashboard';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getActiveSetupVideo } from '@/actions/setup-video';

export default async function FestivalOverviewPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  const [festival, setupVideo, org] = await Promise.all([
    getFestivalById(params.festivalId),
    getActiveSetupVideo(),
    session?.user?.id ? prisma.organizer.findUnique({ where: { userId: session.user.id } }) : Promise.resolve(null)
  ]);
  
  if (!festival) notFound();

  // Time of day greeting
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  // Compute profile completion
  let completionPercentage = 50; // default base
  if (true) {
    if (org) {
      let completedFields = 0;
      let totalFields = 6;
      if (festival.name) completedFields++;
      if (festival.description) completedFields++;
      if (festival.location) completedFields++;
      if (org.companyName) completedFields++;
      if (org.contactEmail) completedFields++;
      if (org.contactPhone) completedFields++;
      completionPercentage = Math.round((completedFields / totalFields) * 100);
    }
  }

  const r = Math.round(241 + (163 - 241) * (completionPercentage / 100));
  const g = Math.round(100 + (181 - 100) * (completionPercentage / 100));
  const b = Math.round(46 + (101 - 46) * (completionPercentage / 100));
  const pillColor = `rgb(${r}, ${g}, ${b})`;

  // Circumference for the SVG circle
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  if (festival.status === 'LIVE' || festival.status === 'COMPLETED') {
    // Fetch all live pulse stats in parallel to eliminate database latency waterfalls
    const [
      programmesCount,
      candidatesCount,
      categoriesCount,
      pointsEntries,
      publishState,
      candidatePoints,
      teams
    ] = await Promise.all([
      prisma.programme.count({ where: { category: { festivalId: festival.id } } }),
      prisma.candidate.count({ where: { team: { festivalId: festival.id } } }),
      prisma.category.count({ where: { festivalId: festival.id } }),
      prisma.teamPointEntry.findMany({ 
        where: { festivalId: festival.id },
        include: { team: true }
      }),
      prisma.standingsPublishState.findUnique({ where: { festivalId: festival.id } }),
      prisma.teamPointEntry.groupBy({
        by: ['candidateId'],
        where: { festivalId: festival.id, candidateId: { not: null } },
        _sum: { points: true }
      }),
      prisma.team.findMany({ where: { festivalId: festival.id } })
    ]);

    // Aggregate points by team
    const teamPoints: Record<string, { id: string, name: string, points: number }> = {};
    for (const p of pointsEntries) {
      if (!teamPoints[p.teamId]) {
        teamPoints[p.teamId] = { id: p.teamId, name: p.team.name, points: 0 };
      }
      teamPoints[p.teamId].points += p.points;
    }
    const rankedTeams = Object.values(teamPoints).sort((a, b) => b.points - a.points);
    
    // Fetch candidate names if candidate points exist
    const candidateIds = candidatePoints.map(c => c.candidateId).filter(Boolean) as string[];
    const candidates = candidateIds.length > 0 
      ? await prisma.candidate.findMany({
          where: { id: { in: candidateIds } },
          select: { id: true, name: true }
        })
      : [];
    
    const rankedCandidates = candidatePoints.map(cp => {
      const c = candidates.find(cand => cand.id === cp.candidateId);
      return {
        id: cp.candidateId!,
        name: c?.name || 'Unknown',
        points: cp._sum.points || 0
      };
    }).sort((a, b) => b.points - a.points);

    return (
      <LivePulseDashboard 
        festivalId={festival.id}
        festivalSlug={festival.slug}
        stats={{ programmesCount, candidatesCount, categoriesCount, pointsCount: pointsEntries.length }}
        rankedTeams={rankedTeams}
        rankedCandidates={rankedCandidates}
        publishState={publishState}
        teams={teams}
      />
    );
  }

  const hasActiveVideo = setupVideo && setupVideo.active && (setupVideo.youtubeUrl || setupVideo.fileUrl);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-sm font-bold text-color-primary uppercase tracking-wider mb-1">{greeting}</p>
          <h1 className="font-heading text-4xl font-black text-[#504E76]">{festival.name}</h1>
        </div>
        <div 
          className="px-4 py-2 rounded-full font-bold text-sm text-white shadow-sm flex items-center"
          style={{ backgroundColor: pillColor }}
        >
          {completionPercentage}% Setup Ready
        </div>
      </div>

      {/* Row 1: Two Columns (~65/35 split if video exists, or cleaner balanced layout if not) */}
      <div className={`grid grid-cols-1 ${hasActiveVideo ? 'lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 mb-10`}>
        
        {/* Super-Admin Controlled Setup Video Card (Rendered only when active) */}
        {hasActiveVideo && (
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-soft flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold text-[#504E76]">
                {setupVideo.title || 'Watch setup guide'}
              </h2>
              <span className="text-xs font-bold text-color-primary bg-[#FFF2ED] px-2.5 py-1 rounded-full border border-[#F1642E]/20 flex items-center gap-1">
                Official Guide
              </span>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden bg-black/5 relative group min-h-[300px] flex items-center justify-center">
              {setupVideo.source === 'YOUTUBE' && setupVideo.youtubeUrl ? (
                <iframe 
                  className="w-full h-full min-h-[300px]"
                  src={setupVideo.youtubeUrl} 
                  title={setupVideo.title || 'FestOS Setup Guide'} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              ) : setupVideo.fileUrl ? (
                <video 
                  src={setupVideo.fileUrl} 
                  controls 
                  playsInline 
                  poster={setupVideo.thumbnailUrl || undefined}
                  className="w-full h-full min-h-[300px] object-cover"
                />
              ) : null}
            </div>
          </div>
        )}

        {/* Right / Ancillary Column */}
        <div className={`flex flex-col gap-6 ${!hasActiveVideo ? 'md:col-span-1' : ''}`}>
          
          {/* Profile Completion Card */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#504E76] mb-1">Profile Completion</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-[120px]">Finish setting up your organizer profile.</p>
              <Button size="sm" className="bg-color-primary text-white rounded-full font-bold text-xs h-8 px-4" asChild>
                <Link href={`/organizer/${festival.id}/settings`}>Complete profile</Link>
              </Button>
            </div>
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/50" />
                <circle 
                  cx="48" cy="48" r="36" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-[#504E76] transition-all duration-1000 ease-in-out" 
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-bold text-lg text-[#504E76]">{completionPercentage}%</span>
            </div>
          </div>

          {/* Trial/Billing Card */}
          <div className="bg-[#FDF8E2] border border-[#FCDD9D]/50 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCDD9D] rounded-full blur-3xl opacity-30 -mr-10 -mt-10"></div>
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <ShieldCheck className="w-5 h-5 text-color-primary" />
              <span className="bg-white/60 text-[#504E76] text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border border-[#504E76]/10">Trial</span>
            </div>
            <h3 className="font-bold text-[#504E76] mb-1 relative z-10">Active until Oct 12</h3>
            <p className="text-xs text-muted-foreground mb-4 relative z-10">Upgrade to unlock all premium features.</p>
            <div className="flex items-center gap-3 relative z-10">
              <Button size="sm" className="bg-color-primary text-white hover:bg-color-primary/90 rounded-full font-bold text-xs h-8 px-4" asChild>
                <Link href={`/organizer/${festival.id}/billing`}>Upgrade</Link>
              </Button>
              <Link href={`/organizer/${festival.id}/billing`} className="text-xs font-bold text-[#504E76] hover:underline">
                Upgrade &rarr;
              </Link>
            </div>
          </div>

          {/* Website Preview Card */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-soft flex flex-col group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-mono text-muted-foreground truncate">{festival.slug}.fiesto</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground group-hover:text-color-primary">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex-1 rounded-xl bg-muted border border-border/50 relative overflow-hidden min-h-[100px] flex flex-col items-center justify-center p-4">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Status: Draft</div>
              <Button size="sm" className="bg-[#A3B565] text-white hover:bg-[#A3B565]/90 rounded-full font-bold text-xs h-8 px-4" asChild>
                <Link href={`/organizer/${festival.id}/website`}>Manage Website</Link>
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Row 2: Getting Started Checklist */}
      <div className="mb-12">
        <SetupChecklist festivalId={festival.id} />
      </div>

    </div>
  );
}


