import React from 'react';
import { getStaffForFestival, getPendingInvites } from '@/actions/staff';
import { getCheckinStats } from '@/actions/checkin';
import StaffClient from './StaffClient';

export default async function FestivalStaffPage({ params }: { params: { festivalId: string } }) {
  const staff = await getStaffForFestival(params.festivalId);
  const pendingInvites = await getPendingInvites(params.festivalId);
  const { prisma } = await import("@/lib/prisma");
  const teams = await prisma.team.findMany({ where: { festivalId: params.festivalId } });
  const { totalExpected, scannedIn } = await getCheckinStats(params.festivalId);

  return (
    <div className="max-w-7xl">
      <StaffClient 
        festivalId={params.festivalId} 
        staff={staff} 
        initialScannedIn={scannedIn} 
        totalExpected={totalExpected}
        teams={teams}
        pendingInvites={pendingInvites} 
      />
    </div>
  );
}
