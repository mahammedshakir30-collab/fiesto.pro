"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  Settings,
  ChevronLeft,
  Menu,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LeaderSidebar({ festivalId }: { festivalId: string }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { href: `/leader/${festivalId}`, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: `/leader/${festivalId}/candidates`, label: 'Candidates', icon: <Users className="w-5 h-5" /> },
    { href: `/leader/${festivalId}/registrations`, label: 'Registrations', icon: <Ticket className="w-5 h-5" /> },
    { href: `/leader/${festivalId}/settings`, label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Header / Toggle (Hidden on desktop) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <Link href="/portal" className="font-heading font-bold text-xl text-color-primary flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-color-primary flex items-center justify-center text-white text-sm">F</div>
          Fiesto
        </Link>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 bg-muted rounded-md text-foreground">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`fixed top-0 left-0 h-full bg-card border-r border-border z-30 transition-all duration-300 flex flex-col justify-between ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-64 translate-x-0'}`}>
        
        <div>
          {/* Brand Area */}
          <div className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border mt-16 lg:mt-0">
            {!isCollapsed && (
              <Link href="/portal" className="font-heading font-bold text-xl text-color-primary flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-color-primary flex items-center justify-center text-white text-sm">F</div>
                <span>Fiesto</span>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/portal" className="mx-auto">
                <div className="w-8 h-8 rounded-full bg-color-primary flex items-center justify-center text-white text-sm font-bold">F</div>
              </Link>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="hidden lg:flex p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="px-4 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
            {!isCollapsed && "Team Leader Hub"}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isRootDashboard = item.href === `/leader/${festivalId}`;
              const isActive = isRootDashboard 
                ? pathname === item.href 
                : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-3 mb-1 rounded-xl transition-all duration-200 group ${isActive ? 'bg-color-primary/10 text-color-primary font-bold shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'}`}>
                    <div className={`${isActive ? 'text-color-primary' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`}>
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <span className="ml-3 truncate">{item.label}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switch Portal Area */}
        <div className="p-3 border-t border-border">
          <Link href="/portal">
            <Button 
              variant="outline" 
              className={`w-full gap-2 text-xs text-muted-foreground hover:text-foreground ${isCollapsed ? 'px-0 justify-center' : ''}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {!isCollapsed && 'Switch Workspace'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {!isCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}

