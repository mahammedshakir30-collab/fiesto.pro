"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Tent, FileText, ToggleLeft, Settings, LogOut, ShieldAlert, Gift, HelpCircle, Users, ChevronLeft, Menu } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navItems = [
    { href: '/admin', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/admin/tenants', label: 'Tenants', icon: <Tent className="w-5 h-5" /> },
    { href: '/admin/organizers', label: 'Organizers', icon: <Users className="w-5 h-5" /> },
    { href: '/admin/plans', label: 'Plans', icon: <FileText className="w-5 h-5" /> },
    { href: '/admin/feature-flags', label: 'Feature Flags', icon: <ToggleLeft className="w-5 h-5" /> },
    { href: '/admin/referrals', label: 'Referrals', icon: <Gift className="w-5 h-5" /> },
    { href: '/admin/settings/support', label: 'Support Content', icon: <HelpCircle className="w-5 h-5" /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    { href: '/admin/audit-log', label: 'Audit Log', icon: <ShieldAlert className="w-5 h-5" /> },
  ];

  return (
    <aside className={`border-r border-border bg-card flex flex-col h-full shrink-0 hidden md:flex transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-border`}>
        {!isCollapsed && (
          <>
            <Link href="/admin" className="font-display text-4xl text-color-accent tracking-wide">FIESTO</Link>
            <span className="ml-3 text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2">Admin</span>
          </>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-soft ${!isCollapsed ? 'ml-auto' : ''}`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
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
      </nav>

      <div className="p-4 border-t border-border">
        <Link 
          href="/"
          title={isCollapsed ? "Exit to Public" : undefined}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-soft ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="shrink-0"><LogOut className="w-5 h-5" /></div>
          {!isCollapsed && <span className="truncate">Exit to Public</span>}
        </Link>
      </div>
    </aside>
  );
}
