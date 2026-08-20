import React from 'react';
import { getLeaderRegistrationsData } from '@/actions/leader';
import { LeaderRegistrationsClient } from './LeaderRegistrationsClient';
import { redirect } from 'next/navigation';

export default async function LeaderRegistrationsPage({ params }: { params: { festivalId: string } }) {
  try {
    const { team, programmes, categories, teamCandidates } = await getLeaderRegistrationsData(params.festivalId);

    return (
      <div className="max-w-6xl mx-auto">
        <LeaderRegistrationsClient
          festivalId={params.festivalId}
          team={team}
          initialProgrammes={programmes as any}
          categories={categories}
          teamCandidates={teamCandidates as any}
        />
      </div>
    );
  } catch (error: any) {
    console.error('Failed to load leader registrations data:', error);
    redirect('/portal');
  }
}
