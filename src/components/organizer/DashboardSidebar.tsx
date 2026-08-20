"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Trophy, Ticket, CalendarDays, BarChart3,
  FileText, PieChart, Bell, FileCode2, Globe, CreditCard, LifeBuoy,
  MessageSquare, Settings, Search, ChevronLeft, Menu, ChevronRight
} from "lucide-react";
import { Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";

export function DashboardSidebar({ festival }: { festival: Prisma.FestivalGetPayload<{}> }) {
  const pathname = usePathname();
  const festivalId = festival.id;
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const checkPermission = (resource: string, action: string) => {
    if (!session?.user) return false;
    if (session.user.role === "SUPER_ADMIN" || session.user.role === "ORGANIZER") return true;
    const perms = (session.user as any).festivalPermissions?.[festivalId] || [];
    return perms.includes(`${resource}:${action}`);
  };

  const navItems = [
    { href: `/organizer/${festivalId}`, label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 shrink-0" />, visible: true },
    { href: `/organizer/${festivalId}/candidates`, label: "Candidates", icon: <Users className="w-5 h-5 shrink-0" />, visible: checkPermission("candidate", "view") },
    { href: `/organizer/${festivalId}/programmes`, label: "Programmes", icon: <Trophy className="w-5 h-5 shrink-0" />, visible: checkPermission("programme", "view") },
    { href: `/organizer/${festivalId}/registrations`, label: "Registrations", icon: <Ticket className="w-5 h-5 shrink-0" />, visible: checkPermission("registration", "view") },
    { href: `/organizer/${festivalId}/schedule`, label: "Schedule", icon: <CalendarDays className="w-5 h-5 shrink-0" />, visible: checkPermission("schedule", "view") },
    { href: `/organizer/${festivalId}/reports`, label: "Reports", icon: <PieChart className="w-5 h-5 shrink-0" />, visible: checkPermission("report", "view") },
    { href: `/organizer/${festivalId}/notifications`, label: "Notifications", icon: <Bell className="w-5 h-5 shrink-0" />, visible: checkPermission("notification", "view") },
    { href: `/organizer/${festivalId}/templates`, label: "Templates", icon: <FileCode2 className="w-5 h-5 shrink-0" />, visible: checkPermission("template", "view") },
    { href: `/organizer/${festivalId}/results`, label: "Results", icon: <BarChart3 className="w-5 h-5 shrink-0" />, visible: true },
    { href: `/organizer/${festivalId}/content`, label: "Content", icon: <FileText className="w-5 h-5 shrink-0" />, visible: true },
    { href: `/organizer/${festivalId}/website`, label: "Website", icon: <Globe className="w-5 h-5 shrink-0" />, visible: checkPermission("website", "view") },
    { href: `/organizer/${festivalId}/billing`, label: "Billing", icon: <CreditCard className="w-5 h-5 shrink-0" />, visible: checkPermission("finance", "view") },
  ].filter(item => item.visible);

  const bottomItems = [
    { href: `/organizer/${festivalId}/support`, label: "Support", icon: <LifeBuoy className="w-5 h-5 shrink-0" /> },
    { href: `/organizer/${festivalId}/settings`, label: "Settings", icon: <Settings className="w-5 h-5 shrink-0" /> },
  ];

  const filteredNav = navItems.filter(item =>
    !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredBottom = bottomItems.filter(item =>
    !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href || (item.href !== `/organizer/${festivalId}` && pathname.startsWith(item.href + "/"));
    return (
      <Link
        href={item.href}
        title={isCollapsed ? item.label : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? "bg-[#504E76] text-white shadow-sm"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        } ${isCollapsed ? "justify-center" : ""}`}
      >
        {item.icon}
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={`border-r border-border bg-card flex flex-col h-full shrink-0 transition-all duration-300 ${
        isCollapsed ? "w-[60px]" : "w-64"
      }`}
    >
      {/* Sidebar header */}
      <div className={`p-3 border-b border-border flex items-center ${isCollapsed ? "justify-center" : "justify-between"} h-14 sm:h-16`}>
        {!isCollapsed && (
          <div className="relative flex-1 mr-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-[#A3B565] transition-colors"
            />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors shrink-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Festival name tag */}
      {!isCollapsed && (
        <div className="px-3 py-2 border-b border-border">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
            {festival.name}
          </p>
        </div>
      )}

      {/* Navigation items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {filteredNav.map(item => (
          <NavLink key={item.href} item={item} />
        ))}

        {filteredBottom.length > 0 && (
          <>
            <div className="my-2 h-px bg-border mx-1" />
            {filteredBottom.map(item => (
              <NavLink key={item.href} item={item as any} />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            FestOS Platform
          </p>
        </div>
      )}
    </aside>
  );
}
