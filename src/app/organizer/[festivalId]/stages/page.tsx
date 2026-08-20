import React from 'react';
import { notFound } from 'next/navigation';
import { getFestivalById } from '@/actions/utils';
import { getStages } from '@/actions/lineup';
import StagesClient from './StagesClient';

export default async function FestivalStagesPage({ params }: { params: { festivalId: string } }) {
  const festival = await getFestivalById(params.festivalId);
  if (!festival) notFound();

  const stages = await getStages(festival.id);

  return (
    <div className="max-w-7xl">
      <StagesClient festivalId={festival.id} stages={stages} />
    </div>
  );
}
