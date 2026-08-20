"use client";

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Award, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  Download, 
  Calendar, 
  ExternalLink, 
  User, 
  ShieldCheck, 
  Tag, 
  Clock, 
  FileText,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';
import { addTeamPoint } from '@/actions/pulse';
import { CloudinaryImage } from '@/components/shared/CloudinaryImage';

interface CandidateProfileProps {
  festivalId: string;
  candidate: {
    id: string;
    name: string;
    chestNumber: string | null;
    gender: string | null;
    photoUrl: string | null;
    categoryId: string;
    teamId: string | null;
    category: { id: string; name: string };
    team: { id: string; name: string } | null;
    registrations: Array<{
      id: string;
      topicTitle: string | null;
      createdAt: Date;
      programme: {
        id: string;
        name: string;
        code: string;
        type: string;
        status: string;
        scheduledAt: Date | null;
        pointsPublished: boolean;
      };
    }>;
    festival: { id: string; name: string; slug: string };
  };
  pointEntries: Array<{
    id: string;
    points: number;
    reason: string;
    awardedBy: string;
    createdAt: Date;
    programmeId: string | null;
    programme?: { id: string; name: string; code: string; pointsPublished: boolean } | null;
    team?: { id: string; name: string } | null;
  }>;
  festivalProgrammes: Array<{ id: string; name: string; code: string }>;
  stats: {
    totalPoints: number;
    programsParticipated: number;
    pointsPublishedCount: number;
    teamContributionPercent: number;
    teamTotalPoints: number;
  };
}

type TabType = 'PROGRAMS' | 'POINTS' | 'GALLERY';

export default function CandidateProfileClient({
  festivalId,
  candidate,
  pointEntries = [],
  festivalProgrammes = [],
  stats
}: CandidateProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>('PROGRAMS');

  // Add Points Modal
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');
  const [pointAmount, setPointAmount] = useState<string>('');
  const [pointReason, setPointReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate.teamId) return toast.error('Candidate is not assigned to any team');
    
    const pts = parseFloat(pointAmount);
    if (isNaN(pts)) return toast.error('Please enter a valid points amount');
    if (!pointReason.trim()) return toast.error('Please enter a reason');

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('festivalId', festivalId);
      formData.append('teamId', candidate.teamId);
      formData.append('candidateId', candidate.id);
      if (selectedProgrammeId) {
        formData.append('programmeId', selectedProgrammeId);
      }
      formData.append('points', pts.toString());
      formData.append('reason', pointReason.trim());

      await addTeamPoint(formData);
      toast.success(`Awarded ${pts} points to ${candidate.name}`);
      setIsAddPointsOpen(false);
      window.location.reload();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to award points');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintIDCard = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div>
        <Link
          href={`/organizer/${festivalId}/candidates`}
          className="inline-flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Candidates
        </Link>
      </div>

      {/* 4 Header Stat Cards (Matching FestOS Reference Layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Points */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Total Points
            </span>
            <span className="text-3xl font-extrabold text-[#F1642E] tracking-tight">
              {stats.totalPoints} <span className="text-sm font-semibold text-gray-400">pts</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFF2ED] text-[#F1642E] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Programs Participated */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Programmes
            </span>
            <span className="text-3xl font-extrabold text-[#111827] tracking-tight">
              {stats.programsParticipated}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Points Published */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Points Published
            </span>
            <span className="text-3xl font-extrabold text-green-600 tracking-tight">
              {stats.pointsPublishedCount} <span className="text-sm font-semibold text-gray-400">progs</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Team Contribution */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Team Share
            </span>
            <span className="text-3xl font-extrabold text-purple-600 tracking-tight">
              {stats.teamContributionPercent}%
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Candidate Profile Card */}
        <div className="bg-white rounded-[28px] border border-gray-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF2ED] text-[#F1642E] font-black text-2xl flex items-center justify-center border border-[#F1642E]/20 shadow-sm overflow-hidden">
              {candidate.photoUrl ? (
                <CloudinaryImage src={candidate.photoUrl} alt={candidate.name} preset="avatar" width={64} height={64} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                candidate.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{candidate.name}</h2>
              {candidate.chestNumber && (
                <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-700 font-mono font-bold text-xs rounded-md">
                  Chest #{candidate.chestNumber}
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-400">Team</span>
              <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">
                {candidate.team?.name || 'Unassigned'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-400">Category</span>
              <Badge variant="outline" className="font-bold text-[#F1642E] bg-[#FFF2ED] border-[#F1642E]/30">
                {candidate.category.name}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-400">Gender</span>
              <span className="font-bold text-gray-800 uppercase">
                {candidate.gender || 'Not specified'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-400">Festival</span>
              <span className="font-bold text-gray-800">
                {candidate.festival.name}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <Button
              onClick={handlePrintIDCard}
              variant="outline"
              className="w-full h-10 rounded-xl text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> Download / Print ID Card
            </Button>
          </div>
        </div>

        {/* Right Column: Tabbed Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Headers */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('PROGRAMS')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'PROGRAMS'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Registered Programmes ({candidate.registrations.length})
              </button>

              <button
                onClick={() => setActiveTab('POINTS')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'POINTS'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Award className="w-3.5 h-3.5" /> Points Ledger ({pointEntries.length})
              </button>

              <button
                onClick={() => setActiveTab('GALLERY')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'GALLERY'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Gallery
              </button>
            </div>

            {candidate.teamId && (
              <Button
                onClick={() => setIsAddPointsOpen(true)}
                size="sm"
                className="h-8 px-3 text-xs font-bold bg-[#F1642E] hover:bg-[#d95627] text-white rounded-lg shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Award Points
              </Button>
            )}
          </div>

          {/* TAB 1: REGISTERED PROGRAMMES */}
          {activeTab === 'PROGRAMS' && (
            <div className="bg-white rounded-[24px] border border-gray-200/80 shadow-sm overflow-hidden">
              {candidate.registrations.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-medium">
                  No registered programmes for this candidate.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50/75 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="px-5 py-3.5">Code</th>
                        <th className="px-5 py-3.5">Programme Name</th>
                        <th className="px-5 py-3.5">Type</th>
                        <th className="px-5 py-3.5">Points Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {candidate.registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-bold text-gray-500">
                            {reg.programme.code}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">
                            <Link
                              href={`/organizer/${festivalId}/programmes/${reg.programme.id}`}
                              className="hover:text-[#F1642E] transition-colors inline-flex items-center gap-1"
                            >
                              {reg.programme.name}
                              <ExternalLink className="w-3 h-3 opacity-40" />
                            </Link>
                            {reg.topicTitle && (
                              <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                                Topic: {reg.topicTitle}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-gray-600 uppercase text-[10px] tracking-wider px-2 py-0.5 bg-gray-100 rounded-full">
                              {reg.programme.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {reg.programme.pointsPublished ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                                <CheckCircle2 className="w-3 h-3 text-green-600" /> Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                Unpublished
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Link
                              href={`/organizer/${festivalId}/programmes/${reg.programme.id}`}
                              className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-[#F1642E] hover:bg-[#FFF2ED] rounded-lg transition-colors"
                            >
                              View Programme
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: POINTS LEDGER */}
          {activeTab === 'POINTS' && (
            <div className="bg-white rounded-[24px] border border-gray-200/80 shadow-sm overflow-hidden">
              {pointEntries.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-medium">
                  No points awarded yet to this candidate.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50/75 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="px-5 py-3.5">Points</th>
                        <th className="px-5 py-3.5">Reason / Description</th>
                        <th className="px-5 py-3.5">Programme</th>
                        <th className="px-5 py-3.5">Awarded By</th>
                        <th className="px-5 py-3.5 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pointEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3.5 font-extrabold text-sm text-[#F1642E]">
                            +{entry.points}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">
                            {entry.reason}
                          </td>
                          <td className="px-5 py-3.5 text-gray-600">
                            {entry.programme ? (
                              <span className="font-semibold text-gray-700">
                                {entry.programme.name} ({entry.programme.code})
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">General Award</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 font-mono text-[11px]">
                            {entry.awardedBy}
                          </td>
                          <td className="px-5 py-3.5 text-right text-gray-400 text-[11px]">
                            {new Date(entry.createdAt).toLocaleDateString()} {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GALLERY TAB */}
          {activeTab === 'GALLERY' && (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">Candidate Gallery & Certificates</p>
              <p className="text-xs text-gray-400 mt-1">Uploaded media for {candidate.name} will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Award Points Modal */}
      <Dialog open={isAddPointsOpen} onOpenChange={setIsAddPointsOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#F1642E]" /> Award Points to {candidate.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Award points directly to {candidate.name} and team ({candidate.team?.name}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPoints} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Programme (Optional)
              </Label>
              <select
                value={selectedProgrammeId}
                onChange={(e) => setSelectedProgrammeId(e.target.value)}
                className="w-full mt-1.5 h-10 px-3 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#F1642E]/20"
              >
                <option value="">No specific programme (General festival award)</option>
                {festivalProgrammes.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.code} — {prog.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Points to Award <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="any"
                required
                value={pointAmount}
                onChange={(e) => setPointAmount(e.target.value)}
                placeholder="e.g. 10 or 5.5"
                className="mt-1.5 h-10 text-xs rounded-xl border-gray-200"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Reason / Note <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                required
                value={pointReason}
                onChange={(e) => setPointReason(e.target.value)}
                placeholder="e.g. 1st Place Winner or Special Performance Bonus"
                className="mt-1.5 h-10 text-xs rounded-xl border-gray-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddPointsOpen(false)}
                className="rounded-xl text-xs font-bold h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#F1642E] hover:bg-[#d95627] text-white rounded-xl text-xs font-bold h-9 px-5 shadow-sm"
              >
                {isSubmitting ? 'Awarding...' : 'Award Points'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
