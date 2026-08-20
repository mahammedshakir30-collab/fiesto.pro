import { prisma } from '@/lib/prisma';
import PositionsClient from './PositionsClient';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function PositionsPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const criteriaList = await prisma.positionCriteria.findMany({
    where: { festivalId: params.festivalId },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-5xl">
      <PositionsClient festivalId={params.festivalId} initialCriteria={criteriaList} />
    </div>
  );
}
