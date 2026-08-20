import React from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Plus, ListTodo } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function ProgrammesPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const programmes = await prisma.programme.findMany({
    where: { festivalId: params.festivalId },
    include: {
      category: true,
      _count: {
        select: { registrations: true }
      }
    },
    orderBy: { code: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/organizer/${params.festivalId}/competitions`} className="text-muted-foreground hover:text-foreground transition-colors">
              <ListTodo className="w-6 h-6" />
            </Link>
            <h1 className="font-heading text-3xl font-bold tracking-tight">Programmes</h1>
          </div>
          <p className="text-muted-foreground">Manage events, limits, and judgment methods.</p>
        </div>
        <Button className="bg-color-primary text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> New Programme
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {programmes.length === 0 ? (
          <div className="p-12 text-center">
            <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-2">No Programmes Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't created any competitive programmes yet.
            </p>
            <Button className="bg-color-primary text-white font-bold">
              <Plus className="w-4 h-4 mr-2" /> Create First Programme
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase tracking-wider font-bold text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Judgment</th>
                <th className="px-6 py-4 text-center">Registrations</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {programmes.map((prog) => (
                <tr key={prog.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-color-primary">{prog.code}</td>
                  <td className="px-6 py-4 font-bold">{prog.name}</td>
                  <td className="px-6 py-4">{prog.category.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-muted rounded font-bold text-xs">
                      {prog.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">{prog.judgmentMethod.replace('_', ' ')}</td>
                  <td className="px-6 py-4 font-mono text-center">{prog._count.registrations}</td>
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
