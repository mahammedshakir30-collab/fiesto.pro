"use client";

import React, { useState } from 'react';
import { Plus, Download, ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createCategory, createSection, updateCategory, deleteCategory, updateSection, deleteSection } from '@/actions/competitions-admin';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CategoriesClient({ festivalId, initialCategories }: { festivalId: string, initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  
  // Modals state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  
  // Edit State
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingSection, setEditingSection] = useState<any | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      if (editingCategory) {
        await updateCategory(festivalId, editingCategory.id, {
          name: formData.get('name') as string,
          candidateMaxPoints: parseInt(formData.get('candidateMaxPoints') as string) || 0,
          teamMaxPoints: parseInt(formData.get('teamMaxPoints') as string) || 0,
        });
        toast.success('Category updated');
      } else {
        await createCategory(festivalId, {
          name: formData.get('name') as string,
          candidateMaxPoints: parseInt(formData.get('candidateMaxPoints') as string) || 0,
          teamMaxPoints: parseInt(formData.get('teamMaxPoints') as string) || 0,
        });
        toast.success('Category created');
      }
      setIsCatModalOpen(false);
      setEditingCategory(null);
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All related sections will be deleted.')) return;
    try {
      await deleteCategory(festivalId, id);
      toast.success('Category deleted');
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  const handleAddSection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      if (editingSection) {
        await updateSection(festivalId, editingSection.id, {
          name: formData.get('name') as string,
          classification: formData.get('classification') as string,
        });
        toast.success('Section updated');
      } else {
        if (!activeCategoryId) return;
        await createSection(festivalId, activeCategoryId, {
          name: formData.get('name') as string,
          classification: formData.get('classification') as string,
        });
        toast.success('Section created');
      }
      setIsSectionModalOpen(false);
      setEditingSection(null);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save section');
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      await deleteSection(festivalId, id);
      toast.success('Section deleted');
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete section');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Categories & Sections</h1>
          <p className="text-muted-foreground mt-1">Define competitive categories and sub-sections.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="font-bold gap-2">
            <Download className="w-4 h-4" /> Import CSV
          </Button>
          <Button 
            onClick={() => { setEditingCategory(null); setIsCatModalOpen(true); }}
            className="bg-[#F1642E] hover:bg-[#F1642E]/90 text-white font-bold gap-2"
          >
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-bold tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Candidate Max Pts</th>
                <th className="px-6 py-4">Teams Participating</th>
                <th className="px-6 py-4">Team Max Pts</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No categories found. Click "Add Category" to get started.
                  </td>
                </tr>
              )}
              {categories.map((cat) => (
                <React.Fragment key={cat.id}>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => toggleExpand(cat.id)} className="text-muted-foreground hover:text-foreground">
                        {expandedCats[cat.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-bold">{cat.name}</td>
                    <td className="px-6 py-4 font-mono">{cat.candidateMaxPoints}</td>
                    <td className="px-6 py-4 font-mono">{cat._count?.teams || 0}</td>
                    <td className="px-6 py-4 font-mono">{cat.teamMaxPoints}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="font-bold text-xs"
                          onClick={() => { setEditingSection(null); setActiveCategoryId(cat.id); setIsSectionModalOpen(true); }}
                        >
                          + Section
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => { setEditingCategory(cat); setIsCatModalOpen(true); }}
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {/* Nested Sections */}
                  {expandedCats[cat.id] && (
                    <tr className="bg-muted/10 border-t-0">
                      <td colSpan={6} className="px-6 py-4 pl-16">
                        <div className="space-y-2">
                          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Sections</div>
                          {cat.sections.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No sections defined.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {cat.sections.map((sec: any) => (
                                <div key={sec.id} className="p-3 bg-card border border-border rounded-lg shadow-sm flex items-center justify-between">
                                  <div>
                                    <div className="font-bold text-sm">{sec.name}</div>
                                    <div className="text-xs text-muted-foreground">{sec.classification}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      className="text-muted-foreground hover:text-foreground transition-colors"
                                      onClick={() => { setEditingSection(sec); setIsSectionModalOpen(true); }}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      className="text-muted-foreground hover:text-destructive transition-colors"
                                      onClick={() => handleDeleteSection(sec.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      <Dialog.Root open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-2xl p-6 shadow-xl z-50 border border-border">
            <Dialog.Title className="font-heading text-2xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</Dialog.Title>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" name="name" required placeholder="e.g. Junior, Senior, Open" defaultValue={editingCategory?.name || ""} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidateMaxPoints">Candidate Max Points</Label>
                  <Input id="candidateMaxPoints" name="candidateMaxPoints" type="number" defaultValue={editingCategory?.candidateMaxPoints || 0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamMaxPoints">Team Max Points</Label>
                  <Input id="teamMaxPoints" name="teamMaxPoints" type="number" defaultValue={editingCategory?.teamMaxPoints || 0} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => { setIsCatModalOpen(false); setEditingCategory(null); }}>Cancel</Button>
                <Button type="submit" className="bg-[#504E76] text-white">{editingCategory ? 'Save Changes' : 'Create Category'}</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Add/Edit Section Modal */}
      <Dialog.Root open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-2xl p-6 shadow-xl z-50 border border-border">
            <Dialog.Title className="font-heading text-2xl font-bold mb-4">{editingSection ? 'Edit Section' : 'Add Section'}</Dialog.Title>
            <form onSubmit={handleAddSection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sec_name">Section Name</Label>
                <Input id="sec_name" name="name" required placeholder="e.g. Division A, Boys" defaultValue={editingSection?.name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classification">Classification</Label>
                <Input id="classification" name="classification" required placeholder="e.g. Age Group, Gender, Skill Level" defaultValue={editingSection?.classification || ""} />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => { setIsSectionModalOpen(false); setEditingSection(null); }}>Cancel</Button>
                <Button type="submit" className="bg-[#504E76] text-white">{editingSection ? 'Save Changes' : 'Create Section'}</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
