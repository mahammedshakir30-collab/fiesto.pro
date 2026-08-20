import { prisma } from '@/lib/prisma';
import ProgrammeDetailClient from './ProgrammeDetailClient';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ProgrammeDetailPage({ 
  params 
}: { 
  params: { festivalId: string, programmeId: string } 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/signin');

  // Single batched query loading programme, curbs, registrations, points ledger, available candidates, and venues
  const [programme, availableCandidates, venues] = await Promise.all([
    prisma.programme.findUnique({
      where: { 
        id: params.programmeId,
        festivalId: params.festivalId
      },
      include: {
        category: true,
        curbs: true,
        registrations: {
          include: {
            candidate: {
              include: { team: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        teamPointEntries: {
          include: {
            candidate: {
              select: { id: true, name: true, chestNumber: true, photoUrl: true }
            },
            team: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    }),
    prisma.candidate.findMany({
      where: {
        festivalId: params.festivalId,
      },
      include: { team: true, category: true },
      orderBy: { name: 'asc' }
    }),
    prisma.stage.findMany({
      where: { festivalId: params.festivalId },
      select: { id: true, name: true }
    })
  ]);

  if (!programme) notFound();

  // Aggregate points per candidate for this specific programme
  const candidatePointsMap: Record<string, number> = {};
  for (const entry of programme.teamPointEntries) {
    if (entry.candidateId) {
      candidatePointsMap[entry.candidateId] = (candidatePointsMap[entry.candidateId] || 0) + entry.points;
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      <ProgrammeDetailClient 
        festivalId={params.festivalId} 
        programme={programme}
        availableCandidates={availableCandidates}
        candidatePointsMap={candidatePointsMap}
        venues={venues}
      />
    </div>
  );
}
