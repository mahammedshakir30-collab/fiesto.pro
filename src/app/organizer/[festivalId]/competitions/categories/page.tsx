import React from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Plus, Layers } from 'lucide-react';
import Link from 'next/link';

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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/organizer/${params.festivalId}/competitions`} className="text-muted-foreground hover:text-foreground transition-colors">
              <Layers className="w-6 h-6" />
            </Link>
            <h1 className="font-heading text-3xl font-bold tracking-tight">Categories & Sections</h1>
          </div>
          <p className="text-muted-foreground">Define age groups, divisions, or competitive tiers.</p>
        </div>
        <Button className="bg-color-primary text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> New Category
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-2">No Categories Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't created any competitive categories yet. Start by adding one to group your programmes and candidates.
            </p>
            <Button className="bg-color-primary text-white font-bold">
              <Plus className="w-4 h-4 mr-2" /> Create First Category
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase tracking-wider font-bold text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Sections</th>
                <th className="px-6 py-4">Candidate Max Pts</th>
                <th className="px-6 py-4">Team Max Pts</th>
                <th className="px-6 py-4">Programmes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-bold">{cat.name}</td>
                  <td className="px-6 py-4">
                    {cat.sections.length > 0 
                      ? cat.sections.map(s => s.name).join(', ') 
                      : <span className="text-muted-foreground italic">None</span>}
                  </td>
                  <td className="px-6 py-4 font-mono">{cat.candidateMaxPoints}</td>
                  <td className="px-6 py-4 font-mono">{cat.teamMaxPoints}</td>
                  <td className="px-6 py-4 font-mono">{cat._count.programmes}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="font-bold">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
