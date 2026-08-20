"use client";

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createPositionCriteria, deletePositionCriteria, updatePositionCriteria } from '@/actions/competitions-admin';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PositionsClient({ festivalId, initialCriteria }: { festivalId: string, initialCriteria: any[] }) {
  const [criteria, setCriteria] = useState(initialCriteria);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [positionsData, setPositionsData] = useState<{position: number, points: number}[]>([]);

  const handleApplyPreset = (preset: string) => {
    if (preset === 'top3') {
      setPositionsData([
        { position: 1, points: 5 },
        { position: 2, points: 3 },
        { position: 3, points: 1 }
      ]);
    }
  };

  const handleAddRow = () => {
    const nextPos = positionsData.length > 0 ? Math.max(...positionsData.map(p => p.position)) + 1 : 1;
    setPositionsData([...positionsData, { position: nextPos, points: 0 }]);
  };

  const handleUpdateRow = (index: number, field: 'position' | 'points', value: string) => {
    const updated = [...positionsData];
    updated[index] = { ...updated[index], [field]: parseInt(value) || 0 };
    setPositionsData(updated);
  };

  const handleRemoveRow = (index: number) => {
    setPositionsData(positionsData.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    if (positionsData.length === 0) {
      toast.error('Add at least one position row.');
      return;
    }

    try {
      await createPositionCriteria(festivalId, { name, positions: positionsData });
      toast.success('Position Criteria created');
      setIsModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create position criteria');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Position Criteria</h1>
          <p className="text-muted-foreground mt-1">Define points awarded for different placements.</p>
        </div>
        <Button 
          onClick={() => { setPositionsData([]); setIsModalOpen(true); }}
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
                <th className="px-6 py-4">Placements</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {criteria.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                    No position criteria templates found.
                  </td>
                </tr>
              )}
              {criteria.map((crit) => (
                <tr key={crit.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-bold">{crit.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {crit.positions.map((p: any) => (
                        <span key={p.position} className="px-2 py-1 bg-muted rounded font-bold text-xs">
                          Pos {p.position}: {p.points}pts
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast.info('Edit functionality enabled')}>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <form onSubmit={(e) => {
                         e.preventDefault();
                         if(confirm('Are you sure you want to delete this?')) {
                             deletePositionCriteria(festivalId, crit.id).then(() => {
                                 toast.success('Deleted');
                                 window.location.reload();
                             }).catch(err => toast.error(err.message));
                         }
                      }}>
                        <Button type="submit" variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </form>
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
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card rounded-2xl p-6 shadow-xl z-50 border border-border">
            <Dialog.Title className="font-heading text-2xl font-bold mb-4">Create Position Template</Dialog.Title>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input id="name" name="name" required placeholder="e.g. Standard 1st/2nd/3rd" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Placements & Points</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleApplyPreset('top3')}>
                    Preset: Top 3 (5-3-1)
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {positionsData.map((row, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <Input 
                        type="number" 
                        value={row.position} 
                        onChange={(e) => handleUpdateRow(idx, 'position', e.target.value)}
                        placeholder="Position"
                      />
                      <Input 
                        type="number" 
                        value={row.points} 
                        onChange={(e) => handleUpdateRow(idx, 'points', e.target.value)}
                        placeholder="Points"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveRow(idx)} className="text-destructive h-10 w-10 p-0">
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
