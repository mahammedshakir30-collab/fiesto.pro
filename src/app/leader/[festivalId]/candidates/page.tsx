import React from 'react';
import { prisma } from '@/lib/prisma';
import { validateLeaderAccess } from '@/actions/leader';
import { LeaderCandidatesClient } from './LeaderCandidatesClient';
import { redirect } from 'next/navigation';

export default async function LeaderCandidatesPage({ params }: { params: { festivalId: string } }) {
  try {
    const { team } = await validateLeaderAccess(params.festivalId);

    const [candidates, categories] = await Promise.all([
      prisma.candidate.findMany({
        where: {
          festivalId: params.festivalId,
          teamId: team.id
        },
        include: {
          category: true,
          registrations: {
            include: {
              programme: {
                select: { code: true, name: true }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.category.findMany({
        where: { festivalId: params.festivalId },
        orderBy: { name: 'asc' }
      })
    ]);

    return (
      <div className="max-w-6xl mx-auto">
        <LeaderCandidatesClient
          festivalId={params.festivalId}
          team={team}
          initialCandidates={candidates as any}
          categories={categories}
        />
      </div>
    );
  } catch (error: any) {
    console.error('Leader Candidates Page Error:', error);
    redirect('/portal');
  }
}
