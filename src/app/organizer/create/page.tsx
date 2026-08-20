import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CreateFestivalClient from './CreateFestivalClient';

export default async function CreateFestivalPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/signin');
  }

  return (
    <div className="min-h-screen bg-color-base flex items-center justify-center p-4">
      <div className="bg-card border border-border shadow-soft rounded-3xl p-8 max-w-lg w-full">
        <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground hover:text-color-primary">
          <Link href="/organizer">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to festivals
          </Link>
        </Button>
        <h1 className="font-heading text-3xl font-black text-[#504E76] mb-2">Create a New Festival</h1>
        <p className="text-muted-foreground mb-8">
          Enter your festival details below to get started with your new event.
        </p>
        
        <CreateFestivalClient />
      </div>
    </div>
  );
}
