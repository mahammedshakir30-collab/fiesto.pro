"use client";

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Award, 
  History, 
  Download, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  Users, 
  ShieldAlert, 
  Settings2, 
  Layers, 
  FileText,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';
import { addTeamPoint, toggleProgrammePointsPublish } from '@/actions/pulse';
import { updateCurbs, createRegistration, deleteRegistration } from '@/actions/competitions-admin';

interface Candidate {
  id: string;
  name: string;
  chestNumber: string | null;
  gender: string | null;
  photoUrl: string | null;
  teamId: string | null;
  team: { id: string; name: string } | null;
}

interface Registration {
  id: string;
  candidateId: string;
  candidate: Candidate;
  topicTitle: string | null;
  substitutedForId: string | null;
  createdAt: Date;
}

interface PointEntry {
  id: string;
  candidateId: string | null;
  teamId: string;
  points: number;
  reason: string;
  awardedBy: string;
  createdAt: Date;
  candidate?: { id: string; name: string; chestNumber: string | null; photoUrl: string | null } | null;
  team?: { id: string; name: string } | null;
}

interface ProgrammeDetailProps {
  festivalId: string;
  programme: {
    id: string;
    name: string;
    code: string;
    type: string;
    status: string;
    scheduledAt: Date | null;
    venueId: string | null;
    pointsPublished: boolean;
    pointsPublishedAt: Date | null;
    category: { id: string; name: string };
    curbs: Array<{
      id: string;
      maxEntriesPerTeam: number | null;
      maxEntriesPerCategory: number | null;
      maxPointsPerCandidate: number | null;
      maxPointsPerTeam: number | null;
    }>;
    registrations: Registration[];
    teamPointEntries: PointEntry[];
  };
  availableCandidates: Candidate[];
  candidatePointsMap: Record<string, number>;
  venues: Array<{ id: string; name: string }>;
}

type TabType = 'POINTS' | 'REGISTRATIONS' | 'CURBS' | 'SETTINGS';

export default function ProgrammeDetailClient({
  festivalId,
  programme,
  availableCandidates = [],
  candidatePointsMap = {},
  venues = []
}: ProgrammeDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('POINTS');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPointsPublished, setIsPointsPublished] = useState(programme.pointsPublished);

  // Curbs State
  const initialCurbs = programme.curbs?.[0] || {};
  const [maxEntriesPerTeam, setMaxEntriesPerTeam] = useState<number | ''>(initialCurbs.maxEntriesPerTeam ?? '');
  const [maxEntriesPerCategory, setMaxEntriesPerCategory] = useState<number | ''>(initialCurbs.maxEntriesPerCategory ?? '');
  const [maxPointsPerCandidate, setMaxPointsPerCandidate] = useState<number | ''>(initialCurbs.maxPointsPerCandidate ?? '');
  const [maxPointsPerTeam, setMaxPointsPerTeam] = useState<number | ''>(initialCurbs.maxPointsPerTeam ?? '');
  const [isSavingCurbs, setIsSavingCurbs] = useState(false);

  // Add Registration State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [topicTitle, setTopicTitle] = useState('');
  const [isAddingReg, setIsAddingReg] = useState(false);

  // Add Points Modal State
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const [pointTargetCandidate, setPointTargetCandidate] = useState<Candidate | null>(null);
  const [pointAmount, setPointAmount] = useState<string>('');
  const [pointReason, setPointReason] = useState<string>('');
  const [isSubmittingPoint, setIsSubmittingPoint] = useState(false);

  // Point History Dialog State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyCandidate, setHistoryCandidate] = useState<Candidate | null>(null);

  // Publish / Unpublish Toggle
  const handleTogglePublish = async () => {
    setIsPublishing(true);
    const nextState = !isPointsPublished;
    try {
      await toggleProgrammePointsPublish(festivalId, programme.id, nextState);
      setIsPointsPublished(nextState);
      toast.success(nextState ? 'Programme points published to standings' : 'Programme points unpublished');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to toggle publish status');
    } finally {
      setIsPublishing(false);
    }
  };

  // Save Curbs
  const handleSaveCurbs = async () => {
    setIsSavingCurbs(true);
    try {
      await updateCurbs(festivalId, programme.id, {
        maxEntriesPerTeam: maxEntriesPerTeam === '' ? undefined : Number(maxEntriesPerTeam),
        maxEntriesPerCategory: maxEntriesPerCategory === '' ? undefined : Number(maxEntriesPerCategory),
        maxPointsPerCandidate: maxPointsPerCandidate === '' ? undefined : Number(maxPointsPerCandidate),
        maxPointsPerTeam: maxPointsPerTeam === '' ? undefined : Number(maxPointsPerTeam),
      });
      toast.success('Participation limits saved');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update curbs');
    } finally {
      setIsSavingCurbs(false);
    }
  };

  // Add Registration
  const handleAddRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId) return toast.error('Please select a candidate');

    setIsAddingReg(true);
    try {
      await createRegistration(festivalId, programme.id, selectedCandidateId, topicTitle || undefined);
      toast.success('Candidate registered successfully');
      setSelectedCandidateId('');
      setTopicTitle('');
      window.location.reload();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to add registration');
    } finally {
      setIsAddingReg(false);
    }
  };

  // Remove Registration
  const handleRemoveRegistration = async (registrationId: string) => {
    if (!confirm('Are you sure you want to remove this registration?')) return;
    try {
      await deleteRegistration(festivalId, registrationId);
      toast.success('Registration removed');
      window.location.reload();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to delete registration');
    }
  };

  // Open Add Points
  const openAddPoints = (candidate: Candidate) => {
    setPointTargetCandidate(candidate);
    setPointAmount('');
    setPointReason(`${programme.name} — Points Awarded`);
    setIsAddPointsOpen(true);
  };

  // Submit Point Entry
  const handleSubmitPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointTargetCandidate || !pointTargetCandidate.teamId) {
      return toast.error('Candidate has no assigned team');
    }
    const pts = parseFloat(pointAmount);
    if (isNaN(pts)) {
      return toast.error('Please enter a valid points number');
    }
    if (!pointReason.trim()) {
      return toast.error('Please provide a reason');
    }

    setIsSubmittingPoint(true);
    try {
      const formData = new FormData();
      formData.append('festivalId', festivalId);
      formData.append('teamId', pointTargetCandidate.teamId);
      formData.append('candidateId', pointTargetCandidate.id);
      formData.append('programmeId', programme.id);
      formData.append('points', pts.toString());
      formData.append('reason', pointReason.trim());

      await addTeamPoint(formData);
      toast.success(`Awarded ${pts} points to ${pointTargetCandidate.name}`);
      setIsAddPointsOpen(false);
      window.location.reload();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to award points');
    } finally {
      setIsSubmittingPoint(false);
    }
  };

  // Open History
  const openHistory = (candidate: Candidate) => {
    setHistoryCandidate(candidate);
    setIsHistoryOpen(true);
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Chest No', 'Candidate Name', 'Team', 'Points in Programme', 'Topic Title'],
      ...programme.registrations.map(r => [
        r.candidate.chestNumber || '',
        r.candidate.name,
        r.candidate.team?.name || '',
        (candidatePointsMap[r.candidate.id] || 0).toString(),
        r.topicTitle || ''
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${programme.code}_${programme.name}_roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter entries for history dialog
  const historyEntries = historyCandidate 
    ? programme.teamPointEntries.filter(e => e.candidateId === historyCandidate.id)
    : [];

  const matchedVenue = venues.find(v => v.id === programme.venueId);

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Action Header */}
      <div className="space-y-4">
        <Link 
          href={`/organizer/${festivalId}/programmes`} 
          className="inline-flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Programmes
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[28px] border border-gray-200/80 shadow-sm">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg font-mono text-sm font-black tracking-tight">
                {programme.code}
              </span>
              <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
                {programme.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="outline" className="text-xs font-bold border-[#F1642E]/30 text-[#F1642E] bg-[#FFF2ED]">
                {programme.category.name}
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold text-gray-600 bg-gray-50 border-gray-200">
                {programme.type}
              </Badge>

              {/* Points Published Status Badge */}
              {isPointsPublished ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold text-green-700 bg-green-50 border border-green-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Points Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> Not Published
                </span>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleTogglePublish}
              disabled={isPublishing}
              variant={isPointsPublished ? "outline" : "default"}
              className={`font-bold text-xs h-10 px-5 rounded-xl transition-all ${
                isPointsPublished
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-[#F1642E] hover:bg-[#d95627] text-white shadow-sm'
              }`}
            >
              {isPublishing ? (
                'Updating...'
              ) : isPointsPublished ? (
                'Unpublish Points'
              ) : (
                'Publish Points'
              )}
            </Button>

            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="font-bold text-xs h-10 px-4 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Two-Column Info Panels (Reference Layout Density) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Panel: Schedule & Logistics */}
        <div className="bg-white rounded-[24px] border border-gray-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#111827] uppercase tracking-wider pb-2 border-b border-gray-100">
            <MapPin className="w-4 h-4 text-[#F1642E]" /> Venue & Logistics
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1">Assigned Stage / Venue</span>
              <span className="font-bold text-gray-800">
                {matchedVenue ? matchedVenue.name : 'Unassigned Stage'}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1">Scheduled Time</span>
              <span className="font-bold text-gray-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {programme.scheduledAt ? new Date(programme.scheduledAt).toLocaleString() : 'Not Scheduled'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-600">
            <span>Total Registered Candidates</span>
            <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {programme.registrations.length} Candidates
            </span>
          </div>
        </div>

        {/* Right Panel: Participation & Curbs */}
        <div className="bg-white rounded-[24px] border border-gray-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#111827] uppercase tracking-wider pb-2 border-b border-gray-100">
            <ShieldAlert className="w-4 h-4 text-[#F1642E]" /> Participation Limits & Curbs
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1">Max Entries Per Team</span>
              <span className="font-bold text-gray-800">
                {initialCurbs.maxEntriesPerTeam ?? 'Unlimited'}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1">Max Entries Per Category</span>
              <span className="font-bold text-gray-800">
                {initialCurbs.maxEntriesPerCategory ?? 'Unlimited'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-600">
            <span>Programme Points System</span>
            <span className="font-bold text-[#F1642E] bg-[#FFF2ED] px-2.5 py-0.5 rounded-full">
              Manual Ledger Mode
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabbed Container */}
      <div className="bg-white rounded-[28px] border border-gray-200/80 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 px-6 pt-4 gap-2 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('POINTS')}
            className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'POINTS'
                ? 'border-[#F1642E] text-[#F1642E]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Award className="w-4 h-4" /> Points Ledger ({programme.teamPointEntries.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REGISTRATIONS')}
            className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'REGISTRATIONS'
                ? 'border-[#F1642E] text-[#F1642E]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4" /> Registrations ({programme.registrations.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CURBS')}
            className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'CURBS'
                ? 'border-[#F1642E] text-[#F1642E]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Curbs & Limits
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {/* TAB 1: POINTS LEDGER */}
          {activeTab === 'POINTS' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Programme Points Summary</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Points awarded directly to candidates for this specific programme.
                  </p>
                </div>
              </div>

              {programme.registrations.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-600">No candidates registered for this programme yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Register candidates in the Registrations tab to award points.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Candidate</th>
                        <th className="px-6 py-4">Team</th>
                        <th className="px-6 py-4">Programme Points</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {programme.registrations.map(reg => {
                        const candidate = reg.candidate;
                        const candidatePoints = candidatePointsMap[candidate.id] || 0;
                        const entriesCount = programme.teamPointEntries.filter(e => e.candidateId === candidate.id).length;

                        return (
                          <tr key={reg.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#FFF2ED] text-[#F1642E] font-extrabold flex items-center justify-center text-xs shrink-0 border border-[#F1642E]/20">
                                  {candidate.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <Link 
                                    href={`/organizer/${festivalId}/candidates/${candidate.id}`}
                                    className="font-bold text-gray-900 hover:text-[#F1642E] transition-colors flex items-center gap-1"
                                  >
                                    {candidate.name}
                                    <ExternalLink className="w-3 h-3 opacity-40" />
                                  </Link>
                                  {candidate.chestNumber && (
                                    <span className="text-xs text-gray-400 font-mono">
                                      #{candidate.chestNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
                                {candidate.team?.name || 'No Team'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-base font-black ${
                                  candidatePoints > 0 ? 'text-[#F1642E]' : candidatePoints < 0 ? 'text-red-600' : 'text-gray-400'
                                }`}>
                                  {candidatePoints > 0 ? `+${candidatePoints}` : candidatePoints} pts
                                </span>
                                {entriesCount > 0 && (
                                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-semibold">
                                    {entriesCount} {entriesCount === 1 ? 'entry' : 'entries'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => openAddPoints(candidate)}
                                  className="h-8 px-3 text-xs font-bold bg-[#F1642E] hover:bg-[#d95627] text-white rounded-lg shadow-sm"
                                >
                                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Points
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openHistory(candidate)}
                                  className="h-8 px-3 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                  <History className="w-3.5 h-3.5 mr-1" /> History
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REGISTRATIONS */}
          {activeTab === 'REGISTRATIONS' && (
            <div className="space-y-8">
              {/* Add Registration Card */}
              <div className="p-6 bg-gray-50/60 rounded-2xl border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#F1642E]" /> Register Candidate to this Programme
                </h4>
                <form onSubmit={handleAddRegistration} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5 md:col-span-1">
                    <Label className="text-xs font-semibold text-gray-600">Select Candidate</Label>
                    <select
                      value={selectedCandidateId}
                      onChange={(e) => setSelectedCandidateId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-[#F1642E] focus:outline-none"
                    >
                      <option value="">-- Choose Candidate --</option>
                      {availableCandidates.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.chestNumber ? `(#${c.chestNumber})` : ''} - {c.team?.name || 'No Team'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-1">
                    <Label className="text-xs font-semibold text-gray-600">Topic / Title (Optional)</Label>
                    <Input
                      value={topicTitle}
                      onChange={(e) => setTopicTitle(e.target.value)}
                      placeholder="e.g. Malayalam Classical Song"
                      className="h-10 rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isAddingReg}
                    className="h-10 bg-[#F1642E] hover:bg-[#d95627] text-white font-bold rounded-xl shadow-sm"
                  >
                    {isAddingReg ? 'Registering...' : 'Add Registration'}
                  </Button>
                </form>
              </div>

              {/* Registrations List */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-900">Current Roster</h4>
                {programme.registrations.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No registrations added yet.</p>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3.5">Candidate</th>
                          <th className="px-6 py-3.5">Team</th>
                          <th className="px-6 py-3.5">Topic Title</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {programme.registrations.map(reg => (
                          <tr key={reg.id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <span className="font-bold text-gray-900">{reg.candidate.name}</span>
                              {reg.candidate.chestNumber && (
                                <span className="text-xs text-gray-400 font-mono ml-2">
                                  #{reg.candidate.chestNumber}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                                {reg.candidate.team?.name || 'No Team'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-xs">
                              {reg.topicTitle || '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveRegistration(reg.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CURBS */}
          {activeTab === 'CURBS' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Participation Curbs & Limits</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set candidate entry limits per team and category for this programme.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">Max Entries Per Team</Label>
                  <Input
                    type="number"
                    value={maxEntriesPerTeam}
                    onChange={(e) => setMaxEntriesPerTeam(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 2"
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">Max Entries Per Category</Label>
                  <Input
                    type="number"
                    value={maxEntriesPerCategory}
                    onChange={(e) => setMaxEntriesPerCategory(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 10"
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">Max Points Per Candidate</Label>
                  <Input
                    type="number"
                    value={maxPointsPerCandidate}
                    onChange={(e) => setMaxPointsPerCandidate(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 10"
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">Max Points Per Team</Label>
                  <Input
                    type="number"
                    value={maxPointsPerTeam}
                    onChange={(e) => setMaxPointsPerTeam(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 20"
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveCurbs}
                disabled={isSavingCurbs}
                className="bg-[#F1642E] hover:bg-[#d95627] text-white font-bold h-10 px-6 rounded-xl shadow-sm"
              >
                {isSavingCurbs ? 'Saving...' : 'Save Limits'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD POINTS */}
      <Dialog open={isAddPointsOpen} onOpenChange={setIsAddPointsOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-[#111827] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#F1642E]" /> Award Programme Points
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Create an immutable ledger entry for {pointTargetCandidate?.name} in {programme.name}.
            </DialogDescription>
          </DialogHeader>

          {pointTargetCandidate && (
            <form onSubmit={handleSubmitPoints} className="space-y-4 pt-2">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Candidate:</span>
                  <span className="font-bold text-gray-900">{pointTargetCandidate.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Team:</span>
                  <span className="font-bold text-gray-900">{pointTargetCandidate.team?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Programme:</span>
                  <span className="font-bold text-gray-900">{programme.name} ({programme.code})</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Points to Award</Label>
                <Input
                  type="number"
                  step="any"
                  value={pointAmount}
                  onChange={(e) => setPointAmount(e.target.value)}
                  placeholder="e.g. 5 or 10 (or -5 for deduction)"
                  className="h-10 rounded-xl font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Reason / Notation</Label>
                <Input
                  value={pointReason}
                  onChange={(e) => setPointReason(e.target.value)}
                  placeholder="e.g. 1st Place / Outstanding Solo"
                  className="h-10 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddPointsOpen(false)}
                  className="rounded-xl font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmittingPoint}
                  className="bg-[#F1642E] hover:bg-[#d95627] text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  {isSubmittingPoint ? 'Recording...' : 'Confirm Points'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG: POINT HISTORY */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-[#111827] flex items-center gap-2">
              <History className="w-5 h-5 text-[#F1642E]" /> Points History
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Audit log of all points recorded for {historyCandidate?.name} in {programme.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 max-h-96 overflow-y-auto">
            {historyEntries.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4 text-center">No point entries recorded yet.</p>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {historyEntries.map(entry => (
                  <div key={entry.id} className="p-3.5 bg-white hover:bg-gray-50/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{entry.reason}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Awarded by <span className="text-gray-600 font-semibold">{entry.awardedBy}</span> • {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`font-black text-sm px-2.5 py-1 rounded-lg ${
                      entry.points >= 0 ? 'bg-[#FFF2ED] text-[#F1642E]' : 'bg-red-50 text-red-600'
                    }`}>
                      {entry.points >= 0 ? `+${entry.points}` : entry.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
