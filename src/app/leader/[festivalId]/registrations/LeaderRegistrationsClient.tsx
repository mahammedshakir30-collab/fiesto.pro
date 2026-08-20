'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { 
  registerCandidateForProgramme, 
  unregisterCandidateFromProgramme 
} from '@/actions/leader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  FileSpreadsheet, 
  Users, 
  Sparkles,
  Ticket,
  Filter,
  X,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  candidateMaxPoints?: number | null;
  teamMaxPoints?: number | null;
}

interface Candidate {
  id: string;
  name: string;
  categoryId: string;
  chestNumber?: string | null;
  gender?: string | null;
  category: Category;
  registrations?: { programmeId: string; programme?: { categoryId: string; category?: Category } }[];
}

interface Curb {
  id?: string;
  maxEntriesPerTeam?: number | null;
  maxEntriesPerCategory?: number | null;
  maxPointsPerCandidate?: number | null;
}

interface Programme {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  type: string;
  category: Category;
  curbs: Curb[];
  registrations: {
    id: string;
    candidateId: string;
    topicTitle?: string | null;
    candidate: Candidate;
  }[];
}

interface LeaderRegistrationsClientProps {
  festivalId: string;
  team: { id: string; name: string };
  initialProgrammes: Programme[];
  categories: Category[];
  teamCandidates: Candidate[];
}

export function LeaderRegistrationsClient({
  festivalId,
  team,
  initialProgrammes,
  categories,
  teamCandidates
}: LeaderRegistrationsClientProps) {
  const [activeTab, setActiveTab] = useState<'programmes' | 'roster'>('programmes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [topicTitle, setTopicTitle] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  // Filter programmes
  const filteredProgrammes = useMemo(() => {
    return initialProgrammes.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
      const matchesType = selectedType === 'ALL' || p.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [initialProgrammes, searchQuery, selectedCategory, selectedType]);

  // Handle register candidate
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramme || !selectedCandidateId) {
      toast.error('Please select a candidate');
      return;
    }

    startTransition(async () => {
      try {
        await registerCandidateForProgramme(
          festivalId,
          selectedProgramme.id,
          selectedCandidateId,
          topicTitle
        );
        toast.success('Candidate registered successfully!');
        setSelectedProgramme(null);
        setSelectedCandidateId('');
        setTopicTitle('');
      } catch (err: any) {
        toast.error(err.message || 'Failed to register candidate');
      }
    });
  };

  // Handle unregister
  const handleUnregister = (registrationId: string, candidateName: string, programmeName: string) => {
    if (!confirm(`Are you sure you want to remove ${candidateName} from ${programmeName}?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await unregisterCandidateFromProgramme(festivalId, registrationId);
        toast.success(`${candidateName} removed from programme`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to remove candidate');
      }
    });
  };

  // Eligible candidates for the modal
  const eligibleCandidates = useMemo(() => {
    if (!selectedProgramme) return [];
    
    const registeredIds = new Set(selectedProgramme.registrations.map(r => r.candidateId));
    
    return teamCandidates.filter(c => {
      if (registeredIds.has(c.id)) return false;
      const isGeneral = 
        selectedProgramme.category.name.toLowerCase().includes('general') || 
        c.category.name.toLowerCase().includes('general');
      
      return isGeneral || c.categoryId === selectedProgramme.categoryId;
    });
  }, [selectedProgramme, teamCandidates]);

  const totalSlotsFilled = useMemo(() => {
    return initialProgrammes.reduce((acc, p) => acc + p.registrations.length, 0);
  }, [initialProgrammes]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-card to-muted/40 p-5 sm:p-6 rounded-2xl border border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-color-primary/10 text-color-primary border-color-primary/20 font-mono">
              {team.name}
            </Badge>
            <span className="text-xs text-muted-foreground">• Team Programme Hub</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight">Programme Registrations</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Enroll your team's candidates into events, stage programmes, and competitions with real-time curb enforcement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-background/80 backdrop-blur px-4 py-2 rounded-xl border border-border text-center">
            <div className="text-2xl font-bold font-heading text-[#F1642E]">{totalSlotsFilled}</div>
            <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase font-semibold">Total Entries</div>
          </div>
          <div className="bg-background/80 backdrop-blur px-4 py-2 rounded-xl border border-border text-center">
            <div className="text-2xl font-bold font-heading text-color-primary">{teamCandidates.length}</div>
            <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase font-semibold">Team Candidates</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'programmes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('programmes')}
            className={`gap-2 min-h-[40px] ${activeTab === 'programmes' ? 'bg-[#F1642E] text-white shadow-sm' : 'text-foreground'}`}
          >
            <Ticket className="w-4 h-4" />
            Programme Catalog ({initialProgrammes.length})
          </Button>
          <Button
            variant={activeTab === 'roster' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('roster')}
            className={`gap-2 min-h-[40px] ${activeTab === 'roster' ? 'bg-[#F1642E] text-white shadow-sm' : 'text-foreground'}`}
          >
            <Users className="w-4 h-4" />
            Team Enrollment Matrix
          </Button>
        </div>

        {activeTab === 'roster' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 hidden md:flex min-h-[40px]"
          >
            <Printer className="w-4 h-4" />
            Print Entry Sheet
          </Button>
        )}
      </div>

      {/* View 1: Programme Catalog */}
      {activeTab === 'programmes' && (
        <div className="space-y-6">
          {/* Controls & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by code or programme name..."
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
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm font-medium"
              >
                <option value="ALL">All Formats (Individual & Group)</option>
                <option value="INDIVIDUAL">Individual Only</option>
                <option value="GROUP">Group Only</option>
              </select>
            </div>
          </div>

          {/* Programme Grid */}
          {filteredProgrammes.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-2xl p-8 sm:p-12 text-center">
              <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-heading text-lg font-bold">No programmes match your filter</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or category selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredProgrammes.map(prog => {
                const curb = prog.curbs[0];
                const maxEntries = curb?.maxEntriesPerTeam;
                const isFull = maxEntries ? prog.registrations.length >= maxEntries : false;

                return (
                  <Card 
                    key={prog.id} 
                    className={`transition-all border-border hover:border-color-primary/50 shadow-sm flex flex-col justify-between ${
                      prog.registrations.length > 0 ? 'bg-card ring-1 ring-color-primary/20' : 'bg-card'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-muted rounded border border-border">
                              {prog.code}
                            </span>
                            <Badge variant="secondary" className="text-[11px]">
                              {prog.category.name}
                            </Badge>
                            <Badge variant="outline" className="text-[11px] uppercase tracking-wider">
                              {prog.type}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-bold font-heading mt-1">
                            {prog.name}
                          </CardTitle>
                        </div>

                        {maxEntries ? (
                          <div className="text-right shrink-0">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              isFull 
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
                                : 'bg-color-primary/10 text-color-primary border border-color-primary/20'
                            }`}>
                              {prog.registrations.length}/{maxEntries} Slots
                            </span>
                          </div>
                        ) : (
                          <div className="text-right shrink-0">
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                              {prog.registrations.length} Entries
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      {/* Registered candidates in this event */}
                      <div className="space-y-2 pt-2 border-t border-border/50">
                        <div className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
                          <span>Team Candidates ({prog.registrations.length})</span>
                          {isFull && <span className="text-amber-600 font-semibold text-[11px]">Team Limit Reached</span>}
                        </div>

                        {prog.registrations.length === 0 ? (
                          <div className="text-xs text-muted-foreground italic py-2 px-3 bg-muted/30 rounded-lg">
                            No candidates registered yet.
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {prog.registrations.map(reg => (
                              <div 
                                key={reg.id} 
                                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/40 text-sm hover:bg-muted/70 transition-colors border border-border/40"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div className="w-6 h-6 rounded-full bg-[#F1642E]/10 text-[#F1642E] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                                    {reg.candidate.chestNumber || '#'}
                                  </div>
                                  <span className="font-medium truncate">{reg.candidate.name}</span>
                                  {reg.topicTitle && (
                                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                      ({reg.topicTitle})
                                    </span>
                                  )}
                                </div>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isPending}
                                  onClick={() => handleUnregister(reg.id, reg.candidate.name, prog.name)}
                                  className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 shrink-0"
                                  title="Remove registration"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button
                        variant={isFull ? 'outline' : 'default'}
                        size="sm"
                        disabled={isFull || isPending}
                        onClick={() => setSelectedProgramme(prog)}
                        className={`w-full gap-2 text-xs font-bold min-h-[42px] ${
                          isFull 
                            ? 'opacity-60 border-dashed cursor-not-allowed' 
                            : 'bg-[#F1642E] text-white hover:bg-[#F1642E]/90 shadow-sm'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        {isFull ? `Team Limit Reached (${maxEntries}/${maxEntries})` : 'Register Candidate'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View 2: Enrollment Matrix / Summary Roster */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg">Team Candidates & Event Enrollments</h3>
                <p className="text-xs text-muted-foreground">Complete breakdown of candidate entries for {team.name}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-muted rounded-full text-muted-foreground">
                {teamCandidates.length} Active Candidates
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[650px]">
                <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Chest #</th>
                    <th className="px-4 py-3">Candidate Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Registered Programmes</th>
                    <th className="px-4 py-3 text-right">Total Events</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teamCandidates.map(cand => {
                    const registeredProgs = initialProgrammes.filter(p => 
                      p.registrations.some(r => r.candidateId === cand.id)
                    );

                    return (
                      <tr key={cand.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#F1642E]">
                          {cand.chestNumber || '-'}
                        </td>
                        <td className="px-4 py-3 font-semibold">{cand.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">
                            {cand.category.name}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {registeredProgs.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">Not registered in any events</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {registeredProgs.map(p => (
                                <Badge key={p.id} variant="secondary" className="text-xs font-normal">
                                  <span className="font-mono font-bold mr-1">{p.code}</span> {p.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            registeredProgs.length > 0 ? 'bg-[#F1642E]/10 text-[#F1642E]' : 'bg-muted text-muted-foreground'
                          }`}>
                            {registeredProgs.length}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal Dialog */}
      {selectedProgramme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
          <div className="bg-card border border-border w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl shadow-2xl overflow-y-auto animate-in fade-in zoom-in duration-200 flex flex-col justify-between">
            <div>
              <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-muted/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-muted rounded border border-border">
                      {selectedProgramme.code}
                    </span>
                    <Badge variant="outline" className="text-xs">{selectedProgramme.category.name}</Badge>
                    <Badge variant="secondary" className="text-xs">{selectedProgramme.type}</Badge>
                  </div>
                  <h3 className="font-heading text-xl font-bold">{selectedProgramme.name}</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedProgramme(null)}
                  className="rounded-full h-10 w-10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form id="reg-form" onSubmit={handleRegister} className="p-5 sm:p-6 space-y-4">
                {/* Curb limits callout */}
                {selectedProgramme.curbs[0]?.maxEntriesPerTeam && (
                  <div className="p-3 bg-color-primary/5 border border-color-primary/20 rounded-xl text-xs flex items-center justify-between text-muted-foreground">
                    <span>Team Registration Limit:</span>
                    <span className="font-bold text-foreground">
                      {selectedProgramme.registrations.length} / {selectedProgramme.curbs[0].maxEntriesPerTeam} Slots Filled
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Select Team Candidate *</label>
                  {eligibleCandidates.length === 0 ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" /> No eligible candidates available
                      </p>
                      <p>All candidates in category "{selectedProgramme.category.name}" are either already registered or you need to add more candidates to your team.</p>
                    </div>
                  ) : (
                    <select
                      value={selectedCandidateId}
                      onChange={e => setSelectedCandidateId(e.target.value)}
                      required
                      className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm font-medium"
                    >
                      <option value="">-- Choose Candidate from {team.name} --</option>
                      {eligibleCandidates.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.chestNumber ? `[#${c.chestNumber}] ` : ''}{c.name} ({c.category.name})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Topic / Title / Entry Details <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <Input
                    placeholder="e.g. Song Title, Speech Topic, or Presentation Theme"
                    value={topicTitle}
                    onChange={e => setTopicTitle(e.target.value)}
                    className="h-11 text-sm"
                  />
                </div>
              </form>
            </div>

            <div className="p-5 sm:p-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSelectedProgramme(null)}
                className="min-h-[44px] px-4"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="reg-form"
                disabled={isPending || eligibleCandidates.length === 0 || !selectedCandidateId}
                className="gap-2 min-h-[44px] px-5 font-bold bg-[#F1642E] text-white hover:bg-[#F1642E]/90"
              >
                {isPending ? 'Registering...' : 'Confirm Registration'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
