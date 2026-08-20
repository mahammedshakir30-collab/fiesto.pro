import React from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Layers, ListTodo, Users, Gavel, BarChart3, Trophy } from 'lucide-react';

export default async function CompetitionsOverviewPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const festival = await prisma.festival.findUnique({
    where: { id: params.festivalId }
  });

  if (!festival || !festival.competitionModeEnabled) {
    notFound();
  }

  const sections = [
    {
      title: 'Categories & Sections',
      description: 'Define competitive categories (e.g. Junior, Senior) and their sections (e.g. Division A).',
      href: `/organizer/${params.festivalId}/competitions/categories`,
      icon: <Layers className="w-8 h-8 text-color-primary" />
    },
    {
      title: 'Programmes & Curbs',
      description: 'Create individual and group programmes, set up judgment methods, and define limits.',
      href: `/organizer/${params.festivalId}/competitions/programmes`,
      icon: <ListTodo className="w-8 h-8 text-color-primary" />
    },
    {
      title: 'Teams & Candidates',
      description: 'Register candidates, group them into teams, and manage chest numbers.',
      href: `/organizer/${params.festivalId}/competitions/candidates`,
      icon: <Users className="w-8 h-8 text-color-primary" />
    },
    {
      title: 'Judges',
      
      href: `/organizer/${params.festivalId}/competitions/judges`,
      icon: <Gavel className="w-8 h-8 text-color-primary" />
    },
    {
      title: 'Results & Toppers',
      description: 'View live scores, apply point adjustments, and publish results to the public site.',
      href: `/organizer/${params.festivalId}/competitions/results`,
      icon: <BarChart3 className="w-8 h-8 text-color-primary" />
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-color-primary/10 rounded-lg">
            <Trophy className="w-6 h-6 text-color-primary" />
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Competition Module</h1>
        </div>
        <p className="text-muted-foreground">
          Manage all aspects of your festival's competitions, from candidate registration to live judging and results publication.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link 
            key={section.title} 
            href={section.href}
            className="block p-6 rounded-2xl border border-border bg-card hover:border-color-primary hover:shadow-soft transition-all group"
          >
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:bg-color-primary/10 transition-colors">
              {section.icon}
            </div>
            <h3 className="font-bold text-xl mb-2">{section.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
