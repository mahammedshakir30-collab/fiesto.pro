import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft, Trophy, Medal, Sparkles, Award, Star, Users, CheckCircle2 } from 'lucide-react';
import { getFestivalBySlug } from '@/actions/festivals';
import { Badge } from '@/components/ui/badge';
import PusherClient from './PusherClient';

export default async function PublicResultsPage({ params }: { params: { slug: string } }) {
  const festival = await getFestivalBySlug(params.slug);
  
  if (!festival || !(festival as any).competitionModeEnabled) {
    notFound();
  }

  // Fetch released programmes with category, registrations, and scores
  const [releasedProgrammes, teams] = await Promise.all([
    prisma.programme.findMany({
      where: { 
        festivalId: festival.id,
        pointsPublished: true
      },
      include: {
        category: true,
        registrations: {
          include: {
            candidate: {
              include: { team: true }
            }
          }
        }
      },
      orderBy: { code: 'asc' }
    }),
    prisma.team.findMany({
      where: { festivalId: festival.id },
      include: {
        candidates: {
          select: { id: true, name: true, chestNumber: true }
        }
      }
    })
  ]);

  return (
    <div className="bg-color-base min-h-screen pb-20">
      {/* Real-time Pusher listener */}
      <PusherClient festivalId={festival.id} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#504E76] to-[#3B3958] text-white pt-24 pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <Link 
            href={`/discover/${params.slug}`} 
            className="inline-flex items-center text-xs sm:text-sm font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Festival
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur shrink-0 border border-white/15">
                <Trophy className="w-8 h-8 text-[#F1642E]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-[#F1642E] text-white font-bold px-2 py-0.5 rounded-full uppercase">
                    Live Scoreboard
                  </span>
                </div>
                <h1 className="font-heading text-3xl sm:text-5xl font-extrabold mt-1">{festival.name} Results</h1>
                <p className="text-white/80 text-sm sm:text-base mt-1">Official competition scores & team standings</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-2xl border border-white/15 text-center shrink-0">
              <div className="text-2xl font-bold font-heading text-[#F1642E]">{releasedProgrammes.length}</div>
              <div className="text-[11px] text-white/70 uppercase font-semibold">Published Events</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 -mt-8 relative z-10 space-y-8">
        {/* Released Programmes Results */}
        {releasedProgrammes.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-lg">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="font-heading text-2xl font-bold mb-2">No Results Released Yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Event scores and rankings will appear here in real time as soon as judges and organizers officially publish the results.
            </p>
            <Link href={`/discover/${params.slug}`}>
              <button className="mt-6 px-6 py-2.5 rounded-full bg-[#F1642E] text-white font-bold text-sm hover:bg-[#F1642E]/90 transition-colors">
                Explore Festival Schedule
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold">Published Event Results</h2>
              <span className="text-xs text-muted-foreground">{releasedProgrammes.length} events completed</span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {releasedProgrammes.map(prog => (
                <div key={prog.id} className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-muted rounded border border-border">
                          {prog.code}
                        </span>
                        <Badge variant="secondary" className="text-xs">{prog.category.name}</Badge>
                        <Badge variant="outline" className="text-xs uppercase">{prog.type}</Badge>
                      </div>
                      <h3 className="font-heading text-xl font-bold">{prog.name}</h3>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Results Verified
                    </div>
                  </div>

                  {/* Registered Candidates / Participants */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase">Participants & Rankings</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {prog.registrations.map((reg: Prisma.RegistrationGetPayload<{include: {candidate: {include: {team: true}}}}>) => (
                        <div key={reg.id} className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-7 h-7 rounded-full bg-[#F1642E]/10 text-[#F1642E] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                              {reg.candidate.chestNumber || '#'}
                            </div>
                            <div className="overflow-hidden">
                              <div className="font-semibold text-sm truncate">{reg.candidate.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{reg.candidate.team?.name || 'Individual'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



