import { prisma } from '@/lib/prisma';
import CandidateProfileClient from './CandidateProfileClient';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function CandidateProfilePage({
  params
}: {
  params: { festivalId: string; candidateId: string }
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/signin');

  // Single batched query loading candidate, category, team, registrations with programme, point entries, and festival programmes
  const [candidate, festivalProgrammes] = await Promise.all([
    prisma.candidate.findUnique({
      where: {
        id: params.candidateId,
        festivalId: params.festivalId
      },
      include: {
        category: true,
        team: true,
        registrations: {
          include: {
            programme: true
          },
          orderBy: { createdAt: 'desc' }
        },
        festival: {
          select: { id: true, name: true, slug: true }
        }
      }
    }),
    prisma.programme.findMany({
      where: { festivalId: params.festivalId },
      select: { id: true, name: true, code: true },
      orderBy: { code: 'asc' }
    })
  ]);

  if (!candidate) notFound();

  // Batched query for candidate's point entries and team's total points
  const [pointEntries, teamPointSum] = await Promise.all([
    prisma.teamPointEntry.findMany({
      where: {
        festivalId: params.festivalId,
        candidateId: candidate.id
      },
      include: {
        programme: { select: { id: true, name: true, code: true, pointsPublished: true } },
        team: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    candidate.teamId
      ? prisma.teamPointEntry.aggregate({
          where: { festivalId: params.festivalId, teamId: candidate.teamId },
          _sum: { points: true }
        })
      : Promise.resolve({ _sum: { points: 0 } })
  ]);

  // Compute stats
  const totalPoints = pointEntries.reduce((acc, curr) => acc + curr.points, 0);
  const programsParticipated = candidate.registrations.length;

  // Distinct programmes where pointsPublished is true and candidate has entries
  const publishedProgrammeIds = new Set<string>();
  for (const entry of pointEntries) {
    if (entry.programme && entry.programme.pointsPublished) {
      publishedProgrammeIds.add(entry.programme.id);
    }
  }
  const pointsPublishedCount = publishedProgrammeIds.size;

  const teamTotal = teamPointSum._sum.points || 0;
  const teamContributionPercent = teamTotal > 0 && totalPoints > 0 
    ? Math.min(100, Math.round((totalPoints / teamTotal) * 100))
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      <CandidateProfileClient
        festivalId={params.festivalId}
        candidate={candidate}
        pointEntries={pointEntries}
        festivalProgrammes={festivalProgrammes}
        stats={{
          totalPoints,
          programsParticipated,
          pointsPublishedCount,
          teamContributionPercent,
          teamTotalPoints: teamTotal
        }}
      />
    </div>
  );
}
