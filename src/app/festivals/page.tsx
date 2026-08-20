import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FestivalsClient from './FestivalsClient';

export default async function FestivalsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Find Organizer profile
  const organizerProfile = await prisma.organizer.findUnique({
    where: { userId: session.user.id }
  });

  // Fetch "My Festivals" (where user is Owner)
  const myFestivalIds = new Set<string>();
  const sharedFestivalIds = new Set<string>();

  if (organizerProfile) {
    const owned = await prisma.festivalOrganizer.findMany({
      where: { 
        organizerId: organizerProfile.id,
        isOwner: true
      },
      include: {
        festival: true
      }
    });
    owned.forEach(o => myFestivalIds.add(o.festivalId));
  }

  // Fetch "Shared" (where user has UserRole or StaffMember, but is not Owner)
  const userRoles = await prisma.userRole.findMany({
    where: { userId: session.user.id },
    select: { festivalId: true }
  });
  
  const staffMembers = await prisma.staffMember.findMany({
    where: { userId: session.user.id, active: true },
    select: { festivalId: true }
  });

  userRoles.forEach(ur => {
    if (!myFestivalIds.has(ur.festivalId)) sharedFestivalIds.add(ur.festivalId);
  });
  staffMembers.forEach(sm => {
    if (!myFestivalIds.has(sm.festivalId)) sharedFestivalIds.add(sm.festivalId);
  });

  // Fetch actual festival records
  const myFestivalsList = await prisma.festival.findMany({
    where: { id: { in: Array.from(myFestivalIds) } }
  });

  const sharedFestivalsList = await prisma.festival.findMany({
    where: { id: { in: Array.from(sharedFestivalIds) } }
  });

  const totalFestivals = myFestivalsList.length + sharedFestivalsList.length;

  // Routing rule: exactly 1 festival -> go straight to dashboard
  if (totalFestivals === 1) {
    const festId = myFestivalsList.length === 1 ? myFestivalsList[0].id : sharedFestivalsList[0].id;
    redirect(`/organizer/${festId}`);
  }

  return (
    <div className="min-h-screen bg-[#FDF8E2] text-foreground flex items-center justify-center p-4 relative" style={{ backgroundImage: 'radial-gradient(circle at 50% top, rgba(255, 255, 255, 0.4), transparent)' }}>
      <div className="w-full max-w-[600px] z-10 relative">
        <FestivalsClient 
          user={session.user} 
          myFestivals={myFestivalsList} 
          sharedFestivals={sharedFestivalsList} 
        />
      </div>
    </div>
  );
}
