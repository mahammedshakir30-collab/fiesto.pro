import React from 'react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SupportContentClient } from './SupportContentClient';

export default async function AdminSupportSettingsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'SUPER_ADMIN') redirect('/unauthorized');

  const faqs = await prisma.fAQArticle.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  const tutorials = await prisma.tutorialVideo.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Support Content</h1>
        <p className="text-muted-foreground mt-1">Manage FAQs and Video Tutorials for the Organizer Support Hub.</p>
      </div>

      <SupportContentClient faqs={faqs} tutorials={tutorials} />
    </div>
  );
}
