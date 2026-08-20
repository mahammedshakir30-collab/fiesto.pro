import { prisma } from '@/lib/prisma';
import CategoriesClient from './CategoriesClient';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function CategoriesPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const categories = await prisma.category.findMany({
    where: { festivalId: params.festivalId },
    include: {
      sections: true,
      _count: {
        select: { programmes: true, candidates: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-5xl">
      <CategoriesClient festivalId={params.festivalId} initialCategories={categories} />
    </div>
  );
}
