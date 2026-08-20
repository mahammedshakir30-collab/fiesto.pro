"use client";

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createProgramme } from '@/actions/competitions-admin';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BulkImportWizard } from '@/components/organizer/BulkImportWizard';



export default function ProgrammesClient({ festivalId, initialProgrammes, categories, stages }: { festivalId: string, initialProgrammes: any[], categories: any[], stages: any[] }) {
  const [programmes, setProgrammes] = useState(initialProgrammes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = programmes.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const typeData = [
    { name: 'Individual', value: programmes.filter(p => p.type === 'INDIVIDUAL').length },
    { name: 'Group', value: programmes.filter(p => p.type === 'GROUP').length },
  ];
  
  const COLORS = ['#504E76', '#F1642E'];

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createProgramme(festivalId, {
        name: formData.get('name') as string,
        code: formData.get('code') as string,
        categoryId: formData.get('categoryId') as string,
        type: formData.get('type') as any,
        judgmentMethod: formData.get('judgmentMethod') as any,
        venueId: formData.get('venueId') as string || undefined,
        scheduledAt: formData.get('scheduledAt') as string || undefined,
      });
      toast.success('Programme created');
      setIsModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create programme');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Programmes</h1>
          <p className="text-muted-foreground mt-1">Manage events, limits, and judgment methods.</p>
        </div>
        <div className="flex items-center gap-3">
          <BulkImportWizard festivalId={festivalId} entity="PROGRAMME" title="Import Programmes" />
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#F1642E] hover:bg-[#F1642E]/90 text-white font-bold gap-2"
          >
            <Plus className="w-4 h-4" /> New Programme
          </Button>
        </div>
      </div>

      {/* Analytics Widget */}
      {programmes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Programmes</div>
              <div className="font-heading text-4xl font-bold">{programmes.length}</div>
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4">
            <div className="w-16 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} dataKey="value" cx="50%" cy="50%" innerRadius={15} outerRadius={30} paddingAngle={2}>
                    {typeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Distribution</div>
              <div className="text-sm">
                <span className="font-bold text-[#504E76]">{typeData[0].value} Individual</span><br/>
                <span className="font-bold text-[#F1642E]">{typeData[1].value} Group</span>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Judges Assigned</div>
              <div className="font-heading text-4xl font-bold text-color-success">
                {programmes.filter(p => p._count.judgeAssignments > 0).length} <span className="text-lg text-muted-foreground">/ {programmes.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search programmes..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-transparent focus:border-color-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-bold tracking-wider border-b border-border">
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No programmes found.
                  </td>
                </tr>
              )}
              {filtered.map((prog) => (
                <tr key={prog.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-color-primary">
                    <Link href={`/organizer/${festivalId}/programmes/${prog.id}`} className="hover:underline">{prog.code}</Link>
                  </td>
                  <td className="px-6 py-4 font-bold">
                    <Link href={`/organizer/${festivalId}/programmes/${prog.id}`} className="hover:underline">{prog.name}</Link>
                  </td>
                  <td className="px-6 py-4">{prog.category.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-muted rounded font-bold text-xs">
                      {prog.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">{prog.judgmentMethod.replace('_', ' ')}</td>
                  <td className="px-6 py-4 font-mono text-center">{prog._count.registrations}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast.info('Edit functionality enabled')}>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast.info('Delete functionality enabled')}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      <Link href={`/organizer/${festivalId}/programmes/${prog.id}`}>
                        <Button variant="ghost" size="sm" className="font-bold text-xs">Manage</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-card rounded-2xl p-6 shadow-xl z-50 border border-border">
            <Dialog.Title className="font-heading text-2xl font-bold mb-4">Create Programme</Dialog.Title>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Programme Name</Label>
                  <Input id="name" name="name" required placeholder="e.g. Classical Dance" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code (Auto-suggested)</Label>
                  <Input id="code" name="code" required placeholder="e.g. CL-DANCE" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <select id="categoryId" name="categoryId" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" required>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select id="type" name="type" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" required>
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="GROUP">Group</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="judgmentMethod">Judgment Method</Label>
                <select id="judgmentMethod" name="judgmentMethod" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" required>
                  <option value="MANUAL_SCORE">Manual Score (Numeric)</option>
                  <option value="POSITION_ONLY">Position Only (1st, 2nd...)</option>
                  <option value="GRADE_ONLY">Grade Only (A, B...)</option>
                  <option value="POSITIONS_AND_GRADE">Positions and Grade</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="venueId">Venue / Stage (Optional)</Label>
                  <select id="venueId" name="venueId" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    <option value="">Unassigned</option>
                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Scheduled Start (Optional)</Label>
                  <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledEndAt">Scheduled End (Optional)</Label>
                  <Input id="scheduledEndAt" name="scheduledEndAt" type="datetime-local" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#504E76] text-white">Create Programme</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

