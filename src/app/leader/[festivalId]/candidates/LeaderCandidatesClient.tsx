'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { 
  createLeaderCandidate, 
  updateLeaderCandidate, 
  deleteLeaderCandidate,
  getNextChestNumberPreview
} from '@/actions/leader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Printer, 
  Filter, 
  X, 
  CheckCircle2, 
  Ticket, 
  Hash, 
  FileText,
  UserCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface Registration {
  id: string;
  programmeId: string;
  programme?: {
    code: string;
    name: string;
  };
}

interface Candidate {
  id: string;
  name: string;
  categoryId: string;
  chestNumber?: string | null;
  gender?: string | null;
  photoUrl?: string | null;
  category: Category;
  registrations?: Registration[];
}

interface LeaderCandidatesClientProps {
  festivalId: string;
  team: { id: string; name: string };
  initialCandidates: Candidate[];
  categories: Category[];
}

export function LeaderCandidatesClient({
  festivalId,
  team,
  initialCandidates,
  categories
}: LeaderCandidatesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formChestNumber, setFormChestNumber] = useState('');
  const [formGender, setFormGender] = useState('');
  const [autoGenInfo, setAutoGenInfo] = useState<{ autoGenerate: boolean; nextChestNumber: string | null; ruleName: string | null } | null>(null);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return initialCandidates.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.chestNumber && c.chestNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'ALL' || c.categoryId === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [initialCandidates, searchQuery, selectedCategory]);

  // Load preview when category changes in Add modal
  useEffect(() => {
    if (isAddModalOpen && formCategoryId) {
      getNextChestNumberPreview(festivalId, formCategoryId).then(res => {
        setAutoGenInfo(res);
        if (res.autoGenerate && res.nextChestNumber && !formChestNumber) {
          setFormChestNumber(res.nextChestNumber);
        }
      }).catch(() => {});
    }
  }, [isAddModalOpen, formCategoryId, festivalId]);

  const openAddModal = () => {
    const defaultCatId = categories[0]?.id || '';
    setFormName('');
    setFormCategoryId(defaultCatId);
    setFormChestNumber('');
    setFormGender('');
    setAutoGenInfo(null);
    setIsAddModalOpen(true);

    if (defaultCatId) {
      getNextChestNumberPreview(festivalId, defaultCatId).then(res => {
        setAutoGenInfo(res);
        if (res.autoGenerate && res.nextChestNumber) {
          setFormChestNumber(res.nextChestNumber);
        }
      });
    }
  };

  const openEditModal = (cand: Candidate) => {
    setEditingCandidate(cand);
    setFormName(cand.name);
    setFormCategoryId(cand.categoryId);
    setFormChestNumber(cand.chestNumber || '');
    setFormGender(cand.gender || '');
    setAutoGenInfo(null);
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategoryId) {
      toast.error('Name and Category are required');
      return;
    }

    startTransition(async () => {
      try {
        if (editingCandidate) {
          await updateLeaderCandidate(festivalId, editingCandidate.id, {
            name: formName,
            categoryId: formCategoryId,
            chestNumber: formChestNumber,
            gender: formGender
          });
          toast.success('Candidate updated successfully!');
          setEditingCandidate(null);
        } else {
          await createLeaderCandidate(festivalId, {
            name: formName,
            categoryId: formCategoryId,
            chestNumber: formChestNumber,
            gender: formGender
          });
          toast.success('Candidate added to team roster!');
          setIsAddModalOpen(false);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to save candidate');
      }
    });
  };

  const handleDeleteCandidate = (cand: Candidate) => {
    if (!confirm(`Are you sure you want to delete ${cand.name}? All programme registrations for this candidate will also be removed.`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteLeaderCandidate(festivalId, cand.id);
        toast.success(`${cand.name} deleted from team`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete candidate');
      }
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-card to-muted/40 p-5 sm:p-6 rounded-2xl border border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-color-primary/10 text-color-primary border-color-primary/20 font-mono">
              {team.name}
            </Badge>
            <span className="text-xs text-muted-foreground">â€¢ Team Candidate Roster</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight">Team Candidates</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Manage student / participant roster for team {team.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 hidden md:flex min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            Print Roster
          </Button>
          <Button
            onClick={openAddModal}
            className="gap-2 shadow-md hover:shadow-lg transition-all min-h-[44px] px-5 text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by candidate name or chest number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-card h-11 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm font-medium"
          >
            <option value="ALL">All Categories ({initialCandidates.length})</option>
            {categories.map(cat => {
              const count = initialCandidates.filter(c => c.categoryId === cat.id).length;
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Candidates List / Table */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-2xl p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-heading text-lg font-bold">No candidates found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {initialCandidates.length === 0
              ? `You haven't added any candidates to team ${team.name} yet.`
              : 'No candidates matched your search criteria.'}
          </p>
          <Button onClick={openAddModal} size="sm" className="gap-2 min-h-[44px]">
            <Plus className="w-4 h-4" /> Add Your First Candidate
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-color-primary" />
              <span>Team Roster ({filteredCandidates.length} Candidates)</span>
            </div>
            <Link href={`/leader/${festivalId}/registrations`}>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-[#F1642E] font-semibold hover:text-[#F1642E]">
                <Ticket className="w-3.5 h-3.5" />
                Go to Programme Registrations â†’
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[600px]">
              <thead className="bg-muted/60 text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Chest #</th>
                  <th className="px-4 py-3">Candidate Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Events Registered</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCandidates.map(cand => {
                  const regCount = cand.registrations?.length || 0;

                  return (
                    <tr key={cand.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#F1642E]">
                        {cand.chestNumber || (
                          <span className="text-xs font-normal text-muted-foreground italic">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-color-primary/10 text-color-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {cand.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{cand.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs font-medium">
                          {cand.category.name}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {cand.gender || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/leader/${festivalId}/registrations`}>
                          <Badge 
                            variant={regCount > 0 ? "secondary" : "outline"} 
                            className="cursor-pointer hover:bg-muted font-medium text-xs gap-1"
                          >
                            <Ticket className="w-3 h-3 text-[#F1642E]" />
                            {regCount} {regCount === 1 ? 'event' : 'events'}
                          </Badge>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isPending}
                            onClick={() => openEditModal(cand)}
                            className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            title="Edit candidate"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isPending}
                            onClick={() => handleDeleteCandidate(cand)}
                            className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-500/10"
                            title="Delete candidate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Candidate Modal with Chest Number Rule handling */}
      {(isAddModalOpen || editingCandidate) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
          <div className="bg-card border border-border w-full h-full sm:h-auto sm:max-w-md sm:rounded-2xl shadow-2xl overflow-y-auto animate-in fade-in zoom-in duration-200 flex flex-col justify-between">
            <div>
              <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-muted/20">
                <div>
                  <h3 className="font-heading text-xl font-bold">
                    {editingCandidate ? 'Edit Candidate' : 'Add Candidate to Team'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Assigned Team: <span className="font-bold text-color-primary">{team.name}</span>
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCandidate(null);
                  }}
                  className="rounded-full h-10 w-10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form id="candidate-form" onSubmit={handleSaveCandidate} className="p-5 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Full Name *</label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="h-11 text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Category *</label>
                  <select
                    value={formCategoryId}
                    onChange={e => setFormCategoryId(e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm font-medium"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold">Chest Number</label>
                      {autoGenInfo?.autoGenerate && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded">
                          Auto-Rule Active
                        </span>
                      )}
                    </div>
                    <Input
                      placeholder={autoGenInfo?.autoGenerate ? "Auto-generated" : "Optional (e.g. 101)"}
                      value={formChestNumber}
                      onChange={e => setFormChestNumber(e.target.value)}
                      className="h-11 text-sm font-mono"
                    />
                    {!autoGenInfo?.autoGenerate && !editingCandidate && (
                      <p className="text-[11px] text-muted-foreground">
                        Leave blank if organizer assigns numbers in bulk.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Gender</label>
                    <select
                      value={formGender}
                      onChange={e => setFormGender(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm font-medium"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-5 sm:p-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCandidate(null);
                }}
                className="min-h-[44px] px-4"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="candidate-form"
                disabled={isPending} 
                className="gap-2 min-h-[44px] px-5 font-bold"
              >
                {isPending ? 'Saving...' : editingCandidate ? 'Update Candidate' : 'Add Candidate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

