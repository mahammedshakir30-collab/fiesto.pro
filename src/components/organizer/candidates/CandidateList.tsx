"use client";

import { useState } from "react";
import { User, Edit, Trash2, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CandidateFormDialog } from "./CandidateFormDialog";
import { deleteCandidate } from "@/actions/candidates";
import { CloudinaryImage } from "@/components/shared/CloudinaryImage";
import Link from "next/link";

type Candidate = {
  id: string;
  name: string;
  chestNumber: string | null;
  gender: string | null;
  photoUrl: string | null;
  category: { id: string; name: string };
  team: { id: string; name: string } | null;
};

interface CandidateListProps {
  festivalId: string;
  candidates: Candidate[];
  categories: { id: string; name: string }[];
  teams: { id: string; name: string }[];
}

export function CandidateList({ festivalId, candidates, categories, teams }: CandidateListProps) {
  const [search, setSearch] = useState("");

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.chestNumber && c.chestNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this candidate?")) {
      try {
        await deleteCandidate(id, festivalId);
      } catch (error) {
        alert("Failed to delete candidate.");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search candidates by name or chest no..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm"
          />
        </div>
        <CandidateFormDialog festivalId={festivalId} categories={categories} teams={teams} />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {filteredCandidates.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
            <User className="w-12 h-12 mb-4 opacity-20" />
            <p>No candidates found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3.5 w-16">Photo</th>
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Chest No.</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Team</th>
                  <th className="px-4 py-3.5">Gender</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border">
                        {candidate.photoUrl ? (
                          <CloudinaryImage
                            src={candidate.photoUrl}
                            alt={candidate.name}
                            preset="avatar"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/organizer/${festivalId}/candidates/${candidate.id}`}
                        className="font-bold text-foreground hover:text-[#F1642E] transition-colors flex items-center gap-1"
                      >
                        {candidate.name}
                        <ExternalLink className="w-3 h-3 opacity-40" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{candidate.chestNumber || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FFF2ED] text-[#F1642E] border border-[#F1642E]/20">
                        {candidate.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{candidate.team?.name || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground uppercase text-xs">{candidate.gender || '-'}</td>
                    <td className="px-4 py-3 text-right space-x-1.5">
                      <Link
                        href={`/organizer/${festivalId}/candidates/${candidate.id}`}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-[#F1642E] hover:bg-[#FFF2ED] rounded-lg transition-colors"
                      >
                        Profile
                      </Link>
                      <CandidateFormDialog 
                        festivalId={festivalId} 
                        categories={categories} 
                        teams={teams} 
                        candidate={candidate} 
                        trigger={
                          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        } 
                      />
                      <button 
                        onClick={() => handleDelete(candidate.id)}
                        className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
