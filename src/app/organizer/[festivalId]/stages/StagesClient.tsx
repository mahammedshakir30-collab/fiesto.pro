"use client";

import React, { useState } from 'react';
import { Plus, MapPin, Users, Settings2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createStage } from '@/actions/lineup';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StagesClient({ festivalId, stages }: { festivalId: string, stages: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createStage(festivalId, {
        name: formData.get('name') as string,
        capacity: parseInt(formData.get('capacity') as string) || undefined,
        indoor: formData.get('indoor') === 'on'
      });
      toast.success('Stage created successfully');
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create stage');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Venues & Stages</h1>
          <p className="text-muted-foreground mt-2">Manage physical locations and capacities within the festival grounds.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-color-accent text-white hover:bg-color-accent/90 rounded-full font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add Stage
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stages.map(stage => (
          <div key={stage.id} className="bg-card border border-border rounded-3xl p-6 shadow-soft hover:shadow-soft-lg transition-soft group relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-color-primary/5 rounded-full blur-2xl group-hover:bg-color-primary/10 transition-soft"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-color-primary" />
              </div>
              <button className="text-muted-foreground hover:text-foreground p-2">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10 space-y-4">
              <div>
                <h3 className="font-heading text-2xl font-bold">{stage.name}</h3>
                <p className="text-sm text-muted-foreground">{stage.indoor ? 'Indoor Stage' : 'Outdoor Stage'}</p>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-dashed border-border/50">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-bold">{stage.capacity ? stage.capacity.toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-color-accent hover:text-color-accent/80 cursor-pointer transition-soft">
                  <Settings2 className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Configure</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button onClick={() => setIsModalOpen(true)} className="bg-transparent border-2 border-dashed border-border hover:border-color-primary hover:bg-color-primary/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-color-primary transition-soft min-h-[250px]">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold">Create New Stage</span>
        </button>
      </div>

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-2xl p-6 shadow-xl z-50 border border-border">
            <Dialog.Title className="font-heading text-2xl font-bold mb-4">Add Stage</Dialog.Title>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Stage Name</Label>
                <Input id="name" name="name" required placeholder="e.g. Main Stage" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Optional)</Label>
                <Input id="capacity" name="capacity" type="number" placeholder="e.g. 5000" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="indoor" name="indoor" className="w-4 h-4" />
                <Label htmlFor="indoor" className="font-normal cursor-pointer">This is an indoor venue</Label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-border mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-[#504E76] text-white">
                  {saving ? 'Saving...' : 'Add Stage'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
