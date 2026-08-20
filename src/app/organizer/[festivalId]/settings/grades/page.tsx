import { prisma } from '@/lib/prisma';
import GradesClient from './GradesClient';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function GradesPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const criteriaList = await prisma.gradeCriteria.findMany({
    where: { festivalId: params.festivalId },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-5xl">
      <GradesClient festivalId={params.festivalId} initialCriteria={criteriaList} />
    </div>
  );
}
