"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, CheckCircle2, Circle, X } from 'lucide-react';
import { getOnboardingState, dismissOnboardingBanner } from '@/actions/onboarding';

interface SetupChecklistProps {
  festivalId: string;
}

export function SetupChecklist({ festivalId }: SetupChecklistProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [onboardingState, setOnboardingState] = useState<{
    dismissed: boolean;
    steps: { key: string; completed: boolean }[];
    progress: number;
    completedCount: number;
    totalSteps: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerDismissedLocal, setBannerDismissedLocal] = useState(false);

  useEffect(() => {
    // Load persisted collapsed state
    const savedState = localStorage.getItem(`fiesto_onboarding_collapsed_${festivalId}`);
    if (savedState === 'true') {
      setIsCollapsed(true);
    }

    async function loadData() {
      try {
        const state = await getOnboardingState(festivalId);
        setOnboardingState(state);
      } catch (err) {
        console.error("Failed to load onboarding state", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();

    // Refresh on focus (e.g. when navigating back from a settings page)
    const onFocus = () => loadData();
    window.addEventListener('focus', onFocus);
    
    return () => window.removeEventListener('focus', onFocus);
  }, [festivalId]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(`fiesto_onboarding_collapsed_${festivalId}`, String(newState));
  };

  const handleDismiss = async () => {
    setBannerDismissedLocal(true);
    await dismissOnboardingBanner(festivalId);
  };

  if (loading) return null;
  if (!onboardingState || onboardingState.dismissed || bannerDismissedLocal) return null;

  const { steps, progress, completedCount, totalSteps } = onboardingState;
  const allComplete = completedCount === totalSteps;

  if (allComplete) {
    return (
      <div className="bg-color-success/10 border border-color-success/20 rounded-xl p-6 mb-8 relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-color-success" />
          <div>
            <h2 className="font-heading font-bold text-xl text-color-primary">You're ready to rock!</h2>
            <p className="text-muted-foreground text-sm mt-1">All required setup steps are complete. Your festival is good to go.</p>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-color-primary transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const stepDetails: Record<string, { title: string, desc: string, link: string, btnText: string }> = {
    profile: {
      title: "Festival Profile",
      desc: "Set the name, dates, description, and cover image.",
      link: `/organizer/${festivalId}/settings`,
      btnText: "Complete Profile"
    },
    venues: {
      title: "Venues",
      desc: "Add at least one venue or stage.",
      link: `/organizer/${festivalId}/stages`,
      btnText: "Add Venue"
    },
    tickets: {
      title: "Ticket Tiers",
      desc: "Configure at least one ticket type.",
      link: `/organizer/${festivalId}/tickets`,
      btnText: "Add Tickets"
    },
    vendors: {
      title: "Vendor Applications",
      desc: "Publish your vendor application form.",
      link: `/organizer/${festivalId}/vendors`,
      btnText: "Set Up"
    },
    staff: {
      title: "Staff & Roles",
      desc: "Assign at least one non-Owner role.",
      link: `/organizer/${festivalId}/staff`,
      btnText: "Invite Staff"
    },
    payouts: {
      title: "Payouts",
      desc: "Link your Stripe Connect account.",
      link: `/organizer/${festivalId}/settings`,
      btnText: "Connect Stripe"
    },
    publish: {
      title: "Publish",
      desc: "Make your public site live.",
      link: `/organizer/${festivalId}/settings`,
      btnText: "Publish Site"
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl shadow-soft mb-8 overflow-hidden">
      {/* Header */}
      <div 
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleCollapse}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-heading font-bold text-xl text-color-primary">Getting started</h2>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Required steps before your festival goes live</span>
          </div>
          
          <div className="flex items-center gap-4 max-w-md">
            <div className="flex-1 h-3 rounded-full bg-[#C4C3E3] overflow-hidden">
              <div 
                className="h-full bg-[#504E76] transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm font-bold whitespace-nowrap text-[#504E76]">
              {completedCount}/{totalSteps} ready ({progress}%)
            </div>
          </div>
        </div>
        
        <div className="ml-4 text-muted-foreground p-2">
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </div>

      {/* Steps List */}
      {!isCollapsed && (
        <div className="border-t border-border p-6 bg-gray-50/50 space-y-4">
          {steps.map((step: { key: string; completed: boolean }) => {
            const details = stepDetails[step.key];
            if (!details) return null;
            
            return (
              <div 
                key={step.key} 
                onClick={() => router.push(details.link)}
                className={`flex items-center justify-between p-4 rounded-xl bg-white border border-border shadow-sm transition-all cursor-pointer hover:bg-gray-50 ${step.completed ? 'opacity-70' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-[#A3B565] flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-[#C4C3E3] flex-shrink-0" />
                  )}
                  
                  <div>
                    <h3 className={`font-bold text-base ${step.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {details.title}
                    </h3>
                    {!step.completed && (
                      <p className="text-sm text-muted-foreground mt-0.5">{details.desc}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(details.link);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                    step.completed 
                      ? 'bg-transparent text-muted-foreground border border-border hover:bg-gray-100'
                      : 'bg-[#504E76] text-white hover:bg-[#504E76]/90'
                  }`}
                >
                  {step.completed ? 'Done' : details.btnText}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
