"use client";

import React, { useState } from 'react';
import { Plus, Download, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createTeam, updateTeam, deleteTeam } from '@/actions/competitions-admin';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TeamsClient({ festivalId, initialTeams }: { festivalId: string, initialTeams: any[] }) {
  const [teams, setTeams] = useState(initialTeams);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);

  const handleSaveTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    try {
      if (editingTeam) {
        await updateTeam(festivalId, editingTeam.id, { name });
        toast.success('Team updated');
      } else {
        await createTeam(festivalId, { name });
        toast.success('Team created');
      }
      setIsModalOpen(false);
      setEditingTeam(null);
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err.message || 'Failed to save team');
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    try {
      await deleteTeam(festivalId, id);
      toast.success('Team deleted');
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete team');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Teams & Groups</h1>
          <p className="text-muted-foreground mt-1">Manage participating groups, houses, or institutions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="font-bold gap-2">
            <Download className="w-4 h-4" /> Import CSV
          </Button>
          <Button 
            onClick={() => { setEditingTeam(null); setIsModalOpen(true); }}
            className="bg-[#F1642E] hover:bg-[#F1642E]/90 text-white font-bold gap-2"
          >
            <Plus className="w-4 h-4" /> Add Team
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-bold tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Candidates Registered</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teams.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                    No teams found. Click "Add Team" to get started.
                  </td>
                </tr>
              )}
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-bold">{team.name}</td>
                  <td className="px-6 py-4 font-mono">{team._count?.candidates || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => { setEditingTeam(team); setIsModalOpen(true); }}
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Team Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-2xl p-6 shadow-xl z-50 border border-border">
            <Dialog.Title className="font-heading text-2xl font-bold mb-4">{editingTeam ? 'Edit Team' : 'Add Team'}</Dialog.Title>
            <form onSubmit={handleSaveTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input id="name" name="name" required placeholder="e.g. Red House, Computer Science, PARADIGM" defaultValue={editingTeam?.name || ""} />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditingTeam(null); }}>Cancel</Button>
                <Button type="submit" className="bg-[#504E76] text-white">{editingTeam ? 'Save Changes' : 'Create Team'}</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
