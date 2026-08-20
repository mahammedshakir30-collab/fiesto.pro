import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SupportHubClient from './SupportHubClient';
import { differenceInDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export default async function OrganizerSupportPage({
  params
}: {
  params: { festivalId: string }
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/signin');

  const festival = await prisma.festival.findUnique({
    where: { id: params.festivalId }
  });

  if (!festival) redirect('/festivals');

  // Check if live event priority support is needed
  const today = new Date();
  const isLiveEvent = isWithinInterval(today, { 
    start: startOfDay(festival.startDate), 
    end: endOfDay(festival.endDate) 
  });
  
  // also check if a programme is scheduled for today (optional, but dates are fine)

  const settings = await prisma.platformSettings.findUnique({
    where: { id: 'singleton' }
  });

  const faqs = await prisma.fAQArticle.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' }
  });

  const tutorials = await prisma.tutorialVideo.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-black text-[#504E76]">Support & Help Center</h1>
        <p className="text-muted-foreground mt-1">Tutorials, FAQs, and contact channels for FestOS organizers.</p>
      </div>

      <SupportHubClient 
        festival={festival}
        settings={settings}
        faqs={faqs}
        tutorials={tutorials}
        isLiveEvent={isLiveEvent}
        user={{ name: session.user.name, email: session.user.email }}
      />
    </div>
  );
}
