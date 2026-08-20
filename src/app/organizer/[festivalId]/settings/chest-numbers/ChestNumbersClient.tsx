"use client";

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createChestNumberRule, toggleAutoGenerateChestNumbers } from '@/actions/competitions-admin';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ChestNumbersClient({ festivalId, initialRules, initialAutoGenerate }: { festivalId: string, initialRules: any[], initialAutoGenerate: boolean }) {
  const [rules, setRules] = useState(initialRules);
  const [autoGenerate, setAutoGenerate] = useState(initialAutoGenerate);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleAutoGenerate = async (mode: boolean) => {
    try {
      setAutoGenerate(mode);
      await toggleAutoGenerateChestNumbers(festivalId, mode);
      toast.success(mode ? 'Auto-generation enabled' : 'Manual generation mode enabled');
    } catch (err: any) {
      setAutoGenerate(!mode); // revert on failure
      toast.error('Failed to update setting');
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createChestNumberRule(festivalId, {
        code: formData.get('code') as string,
        priority: parseInt(formData.get('priority') as string) || 0,
        teamScope: formData.get('teamScope') as string,
        categoryScope: formData.get('categoryScope') as string,
        prefix: formData.get('prefix') as string,
        startAt: parseInt(formData.get('startAt') as string) || 100,
      });
      toast.success('Rule created');
      setIsModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create rule');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Chest Numbers</h1>
        <p className="text-muted-foreground mt-1">Configure how candidate chest numbers are generated and scoped.</p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => handleToggleAutoGenerate(true)}
          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${autoGenerate ? 'border-color-primary bg-color-primary/5' : 'border-border bg-card hover:border-muted-foreground/50'}`}
        >
          <div className="w-12 h-12 rounded-xl bg-color-primary/10 flex items-center justify-center mb-4">
            <Hash className={`w-6 h-6 ${autoGenerate ? 'text-color-primary' : 'text-muted-foreground'}`} />
          </div>
          <h3 className="font-bold text-lg mb-2">Auto-Generate Mode</h3>
          <p className="text-sm text-muted-foreground">
            Chest numbers are automatically generated using the rules below as soon as a candidate is created or registered.
          </p>
        </div>

        <div 
          onClick={() => handleToggleAutoGenerate(false)}
          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${!autoGenerate ? 'border-color-primary bg-color-primary/5' : 'border-border bg-card hover:border-muted-foreground/50'}`}
        >
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <Hash className={`w-6 h-6 ${!autoGenerate ? 'text-color-primary' : 'text-muted-foreground'}`} />
          </div>
          <h3 className="font-bold text-lg mb-2">Bulk Generation Mode</h3>
          <p className="text-sm text-muted-foreground">
            Add all your candidates first, then generate chest numbers in bulk from the Candidates page.
          </p>
        </div>
      </div>

      {/* Rules Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold">Generation Rules</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-border text-muted-foreground font-bold" onClick={() => toast.info('Export functionality coming soon')}>
              Export Bulk
            </Button>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#F1642E] hover:bg-[#F1642E]/90 text-white font-bold gap-2"
            >
              <Plus className="w-4 h-4" /> Add Rule
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-bold tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Scope (Team / Category)</th>
                  <th className="px-6 py-4">Format</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No chest number rules found. The default format (e.g. 101) will be used globally.
                    </td>
                  </tr>
                )}
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-muted-foreground">{rule.priority}</td>
                    <td className="px-6 py-4 font-bold">{rule.code}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-muted rounded font-bold text-xs">{rule.teamScope}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="px-2 py-1 bg-muted rounded font-bold text-xs">{rule.categoryScope}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {rule.prefix ? `${rule.prefix}-` : ''}{rule.startAt}++
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
      </div>

      {/* Add Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card rounded-2xl p-6 shadow-xl z-50 border border-border">
            <Dialog.Title className="font-heading text-2xl font-bold mb-4">Create Rule</Dialog.Title>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Rule Code</Label>
                  <Input id="code" name="code" required placeholder="e.g. JNR-BOYS" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority (Lower runs first)</Label>
                  <Input id="priority" name="priority" type="number" defaultValue="10" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamScope">Team Scope</Label>
                  <Input id="teamScope" name="teamScope" placeholder="e.g. ALL, TEAM_A" defaultValue="ALL" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryScope">Category Scope</Label>
                  <Input id="categoryScope" name="categoryScope" placeholder="e.g. ALL, JUNIOR" defaultValue="ALL" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prefix">Prefix (Optional)</Label>
                  <Input id="prefix" name="prefix" placeholder="e.g. JNR" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startAt">Start Number At</Label>
                  <Input id="startAt" name="startAt" type="number" defaultValue="101" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#504E76] text-white">Save Rule</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
