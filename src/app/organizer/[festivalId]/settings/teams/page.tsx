import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TeamsClient from './TeamsClient';

export default async function TeamsSettingsPage({ params }: { params: { festivalId: string } }) {
  const festival = await prisma.festival.findUnique({
    where: { id: params.festivalId }
  });

  if (!festival) notFound();

  const teams = await prisma.team.findMany({
    where: { festivalId: params.festivalId },
    include: {
      _count: {
        select: { candidates: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-5xl mx-auto py-8">
      <TeamsClient festivalId={params.festivalId} initialTeams={teams} />
    </div>
  );
}
