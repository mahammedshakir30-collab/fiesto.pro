import { prisma } from '@/lib/prisma';
import ChestNumbersClient from './ChestNumbersClient';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ChestNumbersPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const festival = await prisma.festival.findUnique({
    where: { id: params.festivalId },
    select: { id: true, chestNumberAutoGenerate: true }
  });

  if (!festival) notFound();

  const rulesList = await prisma.chestNumberRule.findMany({
    where: { festivalId: params.festivalId },
    orderBy: { priority: 'asc' }
  });

  return (
    <div className="max-w-5xl">
      <ChestNumbersClient 
        festivalId={festival.id} 
        initialRules={rulesList} 
        initialAutoGenerate={festival.chestNumberAutoGenerate} 
      />
    </div>
  );
}
