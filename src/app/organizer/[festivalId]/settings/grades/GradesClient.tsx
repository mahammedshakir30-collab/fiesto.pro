"use client";

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createGradeCriteria } from '@/actions/competitions-admin';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function GradesClient({ festivalId, initialCriteria }: { festivalId: string, initialCriteria: any[] }) {
  const [criteria, setCriteria] = useState(initialCriteria);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradesData, setGradesData] = useState<{grade: string, points: number, minPercent: number, maxPercent: number}[]>([]);

  const handleApplyPreset = (preset: string) => {
    if (preset === 'abc') {
      setGradesData([
        { grade: 'A', points: 5, minPercent: 80, maxPercent: 100 },
        { grade: 'B', points: 3, minPercent: 60, maxPercent: 79 },
        { grade: 'C', points: 1, minPercent: 40, maxPercent: 59 }
      ]);
    } else if (preset === 'a-plus') {
      setGradesData([
        { grade: 'A+', points: 10, minPercent: 90, maxPercent: 100 },
        { grade: 'A', points: 8, minPercent: 80, maxPercent: 89 },
        { grade: 'B', points: 5, minPercent: 70, maxPercent: 79 },
        { grade: 'C', points: 2, minPercent: 50, maxPercent: 69 }
      ]);
    }
  };

  const handleAddRow = () => {
    setGradesData([...gradesData, { grade: '', points: 0, minPercent: 0, maxPercent: 100 }]);
  };

  const handleUpdateRow = (index: number, field: string, value: string) => {
    const updated = [...gradesData];
    if (field === 'grade') {
      updated[index].grade = value;
    } else {
      updated[index] = { ...updated[index], [field]: parseInt(value) || 0 };
    }
    setGradesData(updated);
  };

  const handleRemoveRow = (index: number) => {
    setGradesData(gradesData.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    if (gradesData.length === 0) {
      toast.error('Add at least one grade row.');
      return;
    }

    try {
      await createGradeCriteria(festivalId, { name, grades: gradesData });
      toast.success('Grade Criteria created');
      setIsModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create grade criteria');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Grade Criteria</h1>
          <p className="text-muted-foreground mt-1">Define points and percentage brackets for grading.</p>
        </div>
        <Button 
          onClick={() => { setGradesData([]); setIsModalOpen(true); }}
          className="bg-[#F1642E] hover:bg-[#F1642E]/90 text-white font-bold gap-2"
        >
          <Plus className="w-4 h-4" /> Add Template
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-bold tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Grades</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {criteria.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                    No grade criteria templates found.
                  </td>
                </tr>
              )}
              {criteria.map((crit) => (
                <tr key={crit.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-bold">{crit.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {crit.grades.map((g: any, i: number) => (
                        <span key={i} className="px-2 py-1 bg-muted rounded font-bold text-xs">
                          {g.grade} ({g.minPercent}-{g.maxPercent}%): {g.points}pts
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
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
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card rounded-2xl p-6 shadow-xl z-50 border border-border">
            <Dialog.Title className="font-heading text-2xl font-bold mb-4">Create Grade Template</Dialog.Title>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input id="name" name="name" required placeholder="e.g. Standard A/B/C" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Grades & Brackets</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleApplyPreset('abc')}>
                      Preset: A/B/C
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleApplyPreset('a-plus')}>
                      Preset: A+/A/B/C
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {gradesData.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input 
                        value={row.grade} 
                        onChange={(e) => handleUpdateRow(idx, 'grade', e.target.value)}
                        placeholder="Grade (e.g. A)"
                        className="w-24"
                      />
                      <Input 
                        type="number" 
                        value={row.points} 
                        onChange={(e) => handleUpdateRow(idx, 'points', e.target.value)}
                        placeholder="Points"
                        className="w-24"
                      />
                      <span className="text-muted-foreground">Min %:</span>
                      <Input 
                        type="number" 
                        value={row.minPercent} 
                        onChange={(e) => handleUpdateRow(idx, 'minPercent', e.target.value)}
                        className="w-20"
                      />
                      <span className="text-muted-foreground">Max %:</span>
                      <Input 
                        type="number" 
                        value={row.maxPercent} 
                        onChange={(e) => handleUpdateRow(idx, 'maxPercent', e.target.value)}
                        className="w-20"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveRow(idx)} className="text-destructive h-10 w-10 p-0 ml-auto">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleAddRow} className="w-full border border-dashed border-border mt-2">
                  <Plus className="w-4 h-4 mr-2" /> Add Row
                </Button>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#504E76] text-white">Save Template</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
