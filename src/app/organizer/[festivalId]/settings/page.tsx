import React from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert } from 'lucide-react';
import { getFestivalById } from '@/actions/utils';
import { isFeatureEntitled } from '@/lib/features';
import { BannerUpload } from '@/components/organizer/BannerUpload';
import { SecuritySettings } from '@/components/auth/SecuritySettings';
import { CompetitionToggle } from '@/components/organizer/CompetitionToggle';
import { VendorLeaderboardToggle } from '@/components/organizer/VendorLeaderboardToggle';

export default async function FestivalSettingsPage({ params }: { params: { festivalId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) notFound();

  const festival = await prisma.festival.findUnique({
    where: { id: params.festivalId },
    include: { planTier: true }
  });
  if (!festival) notFound();

  const isCompetitionEntitled = isFeatureEntitled(festival.planTier?.featureEntitlements, 'competitionMode');
  const isVendorLeaderboardEntitled = isFeatureEntitled(festival.planTier?.featureEntitlements, 'vendorLeaderboard');

  return (
    <div className="max-w-4xl">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Festival Settings</h1>
          <p className="text-muted-foreground mt-2">Manage branding, visibility, and core configurations.</p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-xl shadow-soft">
          <span className="text-sm font-bold">Public Site Visibility</span>
          <div className={`w-12 h-6 rounded-full relative cursor-pointer ${festival.status === 'LIVE' ? 'bg-color-success' : 'bg-muted'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${festival.status === 'LIVE' ? 'right-1' : 'left-1'}`}></div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section className="space-y-6">
          <h2 className="font-heading text-2xl font-bold border-b border-border pb-2">Branding</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BannerUpload festivalId={festival.id} currentUrl={festival.coverImageUrl} />
            
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Brand Colors</label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md border border-border bg-[#504E76]"></div>
                  <Input defaultValue="#504E76" className="font-mono bg-card" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md border border-border bg-[#F1642E]"></div>
                  <Input defaultValue="#F1642E" className="font-mono bg-card" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-heading text-2xl font-bold border-b border-border pb-2">Basic Info</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Festival Name</label>
              <Input defaultValue={festival.name} className="bg-card h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Description</label>
              <textarea 
                className="w-full min-h-[120px] p-4 rounded-xl border border-input bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue={festival.description}
              ></textarea>
            </div>
          </div>
          <form action={async () => {
            'use server';
            // Save basic info logic
          }}>
            <Button type="submit" className="bg-[#A3B565] text-white hover:bg-[#A3B565]/90 font-bold rounded-md">Save Changes</Button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="border-b border-border pb-2"></div>
          <SecuritySettings userId={user.id} hasPassword={!!user.password} email={user.email} />
        </section>

        <section className="space-y-6">
          <h2 className="font-heading text-2xl font-bold border-b border-border pb-2">Features</h2>
          <CompetitionToggle 
            festivalId={festival.id} 
            initialEnabled={festival.competitionModeEnabled} 
            entitled={isCompetitionEntitled} 
          />
          <VendorLeaderboardToggle 
            festivalId={festival.id} 
            initialEnabled={festival.vendorLeaderboardEnabled} 
            entitled={isVendorLeaderboardEntitled} 
          />
          
          {festival.competitionModeEnabled && isCompetitionEntitled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <a href={`/organizer/${festival.id}/settings/categories`} className="p-4 border border-border bg-card rounded-xl hover:border-color-primary transition-colors">
                <h3 className="font-bold">Categories & Sections</h3>
                <p className="text-sm text-muted-foreground">Manage competition divisions and tiers.</p>
              </a>
              <a href={`/organizer/${festival.id}/settings/teams`} className="p-4 border border-border bg-card rounded-xl hover:border-color-primary transition-colors">
                <h3 className="font-bold">Teams & Groups</h3>
                <p className="text-sm text-muted-foreground">Manage participating groups and houses.</p>
              </a>
              <a href={`/organizer/${festival.id}/settings/positions`} className="p-4 border border-border bg-card rounded-xl hover:border-color-primary transition-colors">
                <h3 className="font-bold">Position Criteria</h3>
                <p className="text-sm text-muted-foreground">Define points for 1st, 2nd, 3rd placements.</p>
              </a>
              <a href={`/organizer/${festival.id}/settings/grades`} className="p-4 border border-border bg-card rounded-xl hover:border-color-primary transition-colors">
                <h3 className="font-bold">Grade Criteria</h3>
                <p className="text-sm text-muted-foreground">Define points for A, B, C grades.</p>
              </a>
              <a href={`/organizer/${festival.id}/settings/chest-numbers`} className="p-4 border border-border bg-card rounded-xl hover:border-color-primary transition-colors">
                <h3 className="font-bold">Chest Numbers</h3>
                <p className="text-sm text-muted-foreground">Configure auto-generation rules.</p>
              </a>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <h2 className="font-heading text-2xl font-bold border-b border-border pb-2 text-destructive">Danger Zone</h2>
          <div className="p-6 border border-destructive/50 bg-destructive/5 rounded-xl space-y-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-destructive">Cancel Festival</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                This will immediately halt all ticket sales, remove the festival from the public site, and notify the FIESTO admin team for payout freezes.
              </p>
            </div>
            <Button variant="destructive" className="font-bold whitespace-nowrap">
              <ShieldAlert className="w-4 h-4 mr-2" /> Cancel Event
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
