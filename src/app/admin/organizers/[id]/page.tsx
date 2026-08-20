import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Building2, User, Mail, Globe, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { UpdateFestivalPlanForm } from './UpdateFestivalPlanForm';

export default async function OrganizerDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  const platformUser = await prisma.platformUser.findUnique({
    where: { userId: session?.user?.id }
  });

  if (platformUser?.role !== 'SUPER_ADMIN') {
    redirect('/unauthorized');
  }

  const organizer = await prisma.organizer.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      festivals: {
        include: {
          festival: {
            include: {
              planTier: true,
              subscription: true
            }
          }
        }
      }
    }
  });

  if (!organizer) {
    notFound();
  }

  const plans = await prisma.planTier.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link href="/admin/organizers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Organizers
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-4xl font-bold tracking-tight">Organizer Details</h1>
          {organizer.verified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider bg-color-success/20 text-color-success border border-color-success/30">
              <CheckCircle2 className="w-4 h-4" /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider bg-color-warning/20 text-color-warning border border-color-warning/30">
              <AlertCircle className="w-4 h-4" /> Pending KYC
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border pb-2">
            <Building2 className="w-5 h-5 text-color-primary" /> Company Info
          </h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-muted-foreground font-bold mr-2">Name:</span> {organizer.companyName}</div>
            <div><span className="text-muted-foreground font-bold mr-2">Website:</span> {organizer.website ? <a href={organizer.website} target="_blank" className="text-color-accent hover:underline">{organizer.website}</a> : 'N/A'}</div>
            <div><span className="text-muted-foreground font-bold mr-2">Contact Email:</span> {organizer.contactEmail}</div>
            <div><span className="text-muted-foreground font-bold mr-2">Phone:</span> {organizer.contactPhone || 'N/A'}</div>
            <div><span className="text-muted-foreground font-bold mr-2">Stripe Connect:</span> {organizer.stripeConnectAccountId ? <span className="font-mono text-color-success">{organizer.stripeConnectAccountId}</span> : 'Not Connected'}</div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border pb-2">
            <User className="w-5 h-5 text-color-accent" /> Owner Account
          </h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-muted-foreground font-bold mr-2">Name:</span> {organizer.user.firstName} {organizer.user.lastName}</div>
            <div className="flex items-center"><span className="text-muted-foreground font-bold mr-2">Email:</span> <Mail className="w-3 h-3 mr-1 opacity-50"/> {organizer.user.email}</div>
            <div><span className="text-muted-foreground font-bold mr-2">Joined:</span> {new Date(organizer.user.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-soft">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-color-primary" /> Festivals & Subscriptions
        </h2>
        
        {organizer.festivals.length === 0 ? (
          <p className="text-muted-foreground">This organizer hasn't created any festivals yet.</p>
        ) : (
          <div className="space-y-6">
            {organizer.festivals.map(fo => {
              const festival = fo.festival;
              const hasSubscription = !!festival.subscription;
              
              return (
                <div key={festival.id} className="border border-border rounded-xl p-5 bg-background">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{festival.name}</h3>
                      <p className="text-sm text-muted-foreground">{festival.location} &bull; {new Date(festival.startDate).toLocaleDateString()} - {new Date(festival.endDate).toLocaleDateString()}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground uppercase">
                      {festival.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex gap-4 text-sm">
                    <div className="bg-muted/30 px-3 py-2 rounded-lg border border-border">
                      <span className="text-muted-foreground text-xs uppercase block mb-0.5">Current Plan</span>
                      <span className="font-bold text-color-primary">{festival.planTier?.name || "No Plan"}</span>
                    </div>
                    {hasSubscription && (
                      <div className="bg-muted/30 px-3 py-2 rounded-lg border border-border">
                        <span className="text-muted-foreground text-xs uppercase block mb-0.5">Stripe Subscription</span>
                        <span className="font-bold text-color-success">{festival.subscription?.status}</span>
                      </div>
                    )}
                  </div>

                  <UpdateFestivalPlanForm 
                    festivalId={festival.id}
                    currentPlanId={festival.planTierId}
                    currentTrialEndsAt={festival.trialEndsAt}
                    plans={plans}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
