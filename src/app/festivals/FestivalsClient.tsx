"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Prisma } from '@prisma/client';
import { 
  Gift, 
  Bell, 
  Plus, 
  MoreHorizontal, 
  Calendar,
  Settings,
  Copy,
  Archive,
  Search,
  Users,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/organizer/NotificationBell';

type Festival = Prisma.FestivalGetPayload<{}>;
type TabType = 'ALL' | 'MY_FESTIVALS' | 'SHARED';

interface FestivalsClientProps {
  user: any;
  myFestivals: Festival[];
  sharedFestivals: Festival[];
}

export default function FestivalsClient({ user, myFestivals, sharedFestivals }: FestivalsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const router = useRouter();

  const allFestivals = [...myFestivals, ...sharedFestivals];

  let displayedFestivals = allFestivals;
  if (activeTab === 'MY_FESTIVALS') displayedFestivals = myFestivals;
  if (activeTab === 'SHARED') displayedFestivals = sharedFestivals;

  const handleCreateFestival = () => {
    router.push('/organizer/create');
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const getDeterministicColor = (str: string) => {
    const colors = ['#504E76', '#F1642E', '#A3B565', '#FCDD9D', '#C4C3E3'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'ACTIVE' || status === 'LIVE') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#A3B565]/20 text-[#A3B565] uppercase tracking-wider">Active</span>;
    if (status === 'DRAFT') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#C4C3E3]/30 text-[#504E76] uppercase tracking-wider">Draft</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-200 text-neutral-600 uppercase tracking-wider">{status}</span>;
  };

  const initials = user?.firstName ? user.firstName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase();

  return (
    <div className="bg-card border border-border shadow-soft rounded-3xl p-8 relative overflow-hidden">
      {/* Top row */}
      <div className="flex items-center justify-between mb-10">
        <div className="font-heading font-black text-2xl tracking-tighter text-[#504E76]">FestOS.</div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-color-primary">
            <Gift className="w-5 h-5" />
          </Button>
          <NotificationBell festivalId="" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 rounded-full bg-[#504E76] text-white flex items-center justify-center font-bold text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-soft">
              {user?.role === 'SUPER_ADMIN' && (
                <>
                  <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer font-bold text-color-primary">
                    <Settings className="w-4 h-4 mr-2" /> Admin Panel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => signOut({ callbackUrl: '/signin' })}>
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Greeting row */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-sm font-bold text-color-primary uppercase tracking-wider mb-1">Welcome back</div>
          <h1 className="font-heading text-4xl font-bold text-[#504E76]">{user?.firstName || 'Organizer'}</h1>
        </div>
        <Button onClick={handleCreateFestival} className="bg-color-primary text-white hover:bg-color-primary/90 rounded-full font-bold h-11 px-6 shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> New Festival
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border mb-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`pb-4 text-sm font-bold transition-soft relative ${activeTab === 'ALL' ? 'text-color-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All
            {activeTab === 'ALL' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-color-primary rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('MY_FESTIVALS')}
            className={`pb-4 text-sm font-bold transition-soft relative ${activeTab === 'MY_FESTIVALS' ? 'text-color-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            My Festivals
            {activeTab === 'MY_FESTIVALS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-color-primary rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('SHARED')}
            className={`pb-4 text-sm font-bold transition-soft relative ${activeTab === 'SHARED' ? 'text-color-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Shared
            {activeTab === 'SHARED' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-color-primary rounded-t-full"></div>}
          </button>
        </div>
        <div className="pb-4 text-sm font-bold text-muted-foreground">
          {displayedFestivals.length} festival{displayedFestivals.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* List */}
      {displayedFestivals.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-heading text-xl font-bold text-[#504E76] mb-2">No festivals yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">You don't have any festivals in this view. Create a new one to get started.</p>
          <Button onClick={handleCreateFestival} className="bg-color-primary text-white hover:bg-color-primary/90 rounded-full font-bold">
            <Plus className="w-4 h-4 mr-2" /> New Festival
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedFestivals.map(fest => {
            const isOwner = myFestivals.some(f => f.id === fest.id);
            const avatarColor = getDeterministicColor(fest.name);

            return (
              <div 
                key={fest.id}
                onClick={() => router.push(`/organizer/${fest.id}`)}
                className="group flex items-center p-4 rounded-2xl border border-border hover:border-color-primary hover:shadow-soft cursor-pointer transition-all bg-card hover:bg-[#FDF8E2]/30"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-heading font-bold text-lg mr-4"
                  style={{ backgroundColor: avatarColor }}
                >
                  {getInitials(fest.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#504E76] group-hover:text-color-primary transition-soft">{fest.name}</h3>
                    {!isOwner && <span title="Shared with you"><Users className="w-3 h-3 text-muted-foreground" /></span>}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">{fest.slug}.festos.app</div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={fest.status} />
                  <div onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-[#504E76] group-hover:bg-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-soft">
                        <DropdownMenuItem onClick={() => router.push(`/organizer/${fest.id}`)} className="cursor-pointer">
                          <Settings className="w-4 h-4 mr-2 text-muted-foreground" /> Open Dashboard
                        </DropdownMenuItem>
                        {isOwner && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                              <Copy className="w-4 h-4 mr-2 text-muted-foreground" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                              <Archive className="w-4 h-4 mr-2" /> Archive
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
