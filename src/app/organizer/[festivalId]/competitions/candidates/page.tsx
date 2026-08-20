import React from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';

export default async function CandidatesPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const candidates = await prisma.candidate.findMany({
    where: { festivalId: params.festivalId },
    include: {
      category: true,
      team: true,
      _count: {
        select: { registrations: true }
      }
    },
    orderBy: { name: 'asc' },
    take: 100 // pagination placeholder
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/organizer/${params.festivalId}/competitions`} className="text-muted-foreground hover:text-foreground transition-colors">
              <Users className="w-6 h-6" />
            </Link>
            <h1 className="font-heading text-3xl font-bold tracking-tight">Candidates & Teams</h1>
          </div>
          <p className="text-muted-foreground">Register candidates, assign teams, and generate chest numbers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="font-bold">
            Generate Chest Numbers
          </Button>
          <Button className="bg-color-primary text-white font-bold">
            <Plus className="w-4 h-4 mr-2" /> New Candidate
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {candidates.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-2">No Candidates Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by registering candidates for your festival.
            </p>
            <Button className="bg-color-primary text-white font-bold">
              <Plus className="w-4 h-4 mr-2" /> Add Candidate
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase tracking-wider font-bold text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4">Chest No.</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Team</th>
                <th className="px-6 py-4 text-center">Reg. Count</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {candidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-color-primary">{cand.chestNumber || '--'}</td>
                  <td className="px-6 py-4 font-bold">{cand.name}</td>
                  <td className="px-6 py-4">{cand.category.name}</td>
                  <td className="px-6 py-4">
                    {cand.team ? cand.team.name : <span className="text-muted-foreground italic">None</span>}
                  </td>
                  <td className="px-6 py-4 font-mono text-center">{cand._count.registrations}</td>
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
