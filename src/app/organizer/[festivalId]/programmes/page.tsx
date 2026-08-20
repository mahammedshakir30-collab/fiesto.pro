import { prisma } from '@/lib/prisma';
import ProgrammesClient from './ProgrammesClient';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ProgrammesPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const festival = await prisma.festival.findUnique({
    where: { id: params.festivalId }
  });

  if (!festival || !festival.competitionModeEnabled) {
    notFound();
  }

  const [programmes, categories, stages] = await Promise.all([
    prisma.programme.findMany({
      where: { festivalId: params.festivalId },
      include: {
        category: true,
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { code: 'asc' }
    }),
    prisma.category.findMany({
      where: { festivalId: params.festivalId },
      orderBy: { name: 'asc' }
    }),
    prisma.stage.findMany({
      where: { festivalId: params.festivalId }
    })
  ]);

  return (
    <div className="max-w-6xl">
      <ProgrammesClient 
        festivalId={params.festivalId} 
        initialProgrammes={programmes}
        categories={categories}
        stages={stages}
      />
    </div>
  );
}
