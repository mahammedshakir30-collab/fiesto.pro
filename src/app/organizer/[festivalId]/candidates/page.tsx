import React from 'react';
import { getCandidates, getCandidateFormData } from '@/actions/candidates';
import { CandidateList } from '@/components/organizer/candidates/CandidateList';
import { Users } from 'lucide-react';
import { BulkImportWizard } from '@/components/organizer/BulkImportWizard';

interface PageProps {
  params: {
    festivalId: string;
  };
}

export default async function CandidatesPage({ params }: PageProps) {
  const { festivalId } = params;
  
  const [candidates, formData] = await Promise.all([
    getCandidates(festivalId),
    getCandidateFormData(festivalId)
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-color-primary" />
            Candidates
          </h1>
          <p className="text-muted-foreground">
            Manage and review all candidates registered for the festival.
          </p>
        </div>
        <BulkImportWizard festivalId={festivalId} entity="CANDIDATE" title="Import Candidates" />
      </div>

      <CandidateList 
        festivalId={festivalId} 
        candidates={candidates} 
        categories={formData.categories} 
        teams={formData.teams} 
      />
    </div>
  );
}
