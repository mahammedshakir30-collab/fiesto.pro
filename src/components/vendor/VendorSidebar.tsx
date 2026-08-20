"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, ShoppingCart, CreditCard, Trophy, ArrowLeft, LifeBuoy, Settings, ChevronLeft, Menu } from 'lucide-react';
import { Prisma } from '@prisma/client';

export function VendorSidebar({ vendor }: { vendor: Prisma.VendorGetPayload<{}> }) {
  const pathname = usePathname();
  const vendorId = vendor.id;
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navItems = [
    { href: `/vendor/${vendorId}`, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: `/vendor/${vendorId}/profile`, label: 'Profile & Booth', icon: <Store className="w-5 h-5" /> },
    { href: `/vendor/${vendorId}/orders`, label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { href: `/vendor/${vendorId}/payouts`, label: 'Payouts', icon: <CreditCard className="w-5 h-5" /> },
  ];

  if ((vendor as any).festival?.vendorLeaderboardEnabled) {
    navItems.push({ href: `/vendor/${vendorId}/leaderboard`, label: 'Leaderboard', icon: <Trophy className="w-5 h-5" /> });
  }

  return (
    <aside className={`border-r border-border bg-card flex flex-col h-full shrink-0 hidden md:flex transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`p-4 border-b border-border flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div>
            <Link href="/" className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-soft mb-4">
              <ArrowLeft className="w-3 h-3 mr-1" /> Exit Portal
            </Link>
            <div className="font-heading text-xl font-bold leading-tight truncate max-w-[160px]">{vendor.name}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-color-accent"></span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Vendor Portal</span>
            </div>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-soft ${!isCollapsed ? 'self-start mt-1' : ''}`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium transition-soft ${
                isActive 
                  ? 'bg-color-primary text-white shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="shrink-0">{item.icon}</div>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        <div className="my-4 border-t border-border"></div>

        <Link 
          href={`/vendor/${vendorId}/support`}
          title={isCollapsed ? 'Support' : undefined}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium transition-soft ${
            pathname.includes('/support')
              ? 'bg-color-primary text-white shadow-sm' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          } ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="shrink-0"><LifeBuoy className="w-5 h-5" /></div>
          {!isCollapsed && <span className="truncate">Support</span>}
        </Link>
        <Link 
          href={`/vendor/${vendorId}/settings`}
          title={isCollapsed ? 'Settings' : undefined}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium transition-soft ${
            pathname.includes('/settings')
              ? 'bg-color-primary text-white shadow-sm' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          } ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="shrink-0"><Settings className="w-5 h-5" /></div>
          {!isCollapsed && <span className="truncate">Settings</span>}
        </Link>
      </nav>
    </aside>
  );
}
