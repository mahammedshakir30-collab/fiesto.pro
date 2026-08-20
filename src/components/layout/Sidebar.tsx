"use client";

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Search, Settings, Home, Calendar, Users, LayoutDashboard, FileText, Globe, 
  BarChart, Trophy, Mic, Shield, ListVideo, Layers, MessageSquare, Bell, Image, MonitorPlay,
  ChevronDown, ChevronRight, HelpCircle, User
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigationGroups = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, href: "/organizer" },
    ]
  },
  {
    title: "Festival Management",
    items: [
      { title: "Festivals", icon: Calendar, href: "/festivals" },
      { title: "Programs", icon: ListVideo, href: "/programs" },
      { title: "Categories", icon: Layers, href: "/categories" },
      { title: "Venues", icon: Globe, href: "/venues" },
    ]
  },
  {
    title: "Participant Management",
    items: [
      { title: "Participants", icon: Users, href: "/participants" },
      { title: "Teams", icon: Shield, href: "/teams" },
    ]
  },
  {
    title: "Competition",
    items: [
      { title: "Schedule", icon: Calendar, href: "/schedule" },
      { title: "Judges", icon: Mic, href: "/judges" },
      { title: "Scoring", icon: FileText, href: "/scoring" },
      { title: "Results", icon: Trophy, href: "/results" },
      { title: "Leaderboard", icon: BarChart, href: "/leaderboard" },
      { title: "Certificates", icon: FileText, href: "/certificates" },
    ]
  },
  {
    title: "Communication",
    items: [
      { title: "Announcements", icon: MessageSquare, href: "/announcements" },
      { title: "Notifications", icon: Bell, href: "/notifications" },
    ]
  },
  {
    title: "Media",
    items: [
      { title: "Gallery", icon: Image, href: "/gallery" },
      { title: "Media Center", icon: MonitorPlay, href: "/media-center" },
    ]
  },
  {
    title: "Website",
    items: [
      { title: "Website Builder", icon: Globe, href: "/website-builder" },
      { title: "Templates", icon: Layers, href: "/templates" },
    ]
  },
  {
    title: "System",
    items: [
      { title: "Reports", icon: FileText, href: "/reports" },
      { title: "Analytics", icon: BarChart, href: "/analytics" },
      { title: "Settings", icon: Settings, href: "/settings" },
      { title: "Support", icon: HelpCircle, href: "/support" },
      { title: "Feedback", icon: MessageSquare, href: "/feedback" },
    ]
  }
]

function NavGroup({ group, pathname }: { group: typeof navigationGroups[0], pathname: string }) {
  const [isOpen, setIsOpen] = React.useState(true)

  return (
    <div className="mb-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-6 mb-3 group outline-none"
      >
        <h4 className="text-xs font-bold text-primary/60 uppercase tracking-widest group-hover:text-primary transition-colors">
          {group.title}
        </h4>
        {isOpen ? <ChevronDown className="h-4 w-4 text-primary/40" /> : <ChevronRight className="h-4 w-4 text-primary/40" />}
      </button>
      
      {isOpen && (
        <div className="space-y-1.5 px-3">
          {group.items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link 
                key={item.title} 
                href={item.href}
                className={cn(
                  "flex items-center w-full px-4 py-2.5 rounded-xl text-[15px] transition-soft outline-none",
                  isActive 
                    ? "bg-primary text-white font-semibold shadow-soft" 
                    : "text-primary/70 font-medium hover:bg-white/60 hover:text-primary"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-primary/60")} strokeWidth={isActive ? 2.5 : 2} />
                {item.title}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname() || ""

  return (
    <div className={cn(
      "min-h-screen w-[280px] hidden lg:flex flex-col flex-shrink-0 transition-all rounded-r-3xl overflow-hidden border-r border-border/40", 
      "bg-gradient-to-b from-[#F4F3F9] to-[#EBE9F5]", // Soft custom purple gradient
      className
    )}>
      {/* Pure White Logo Area */}
      <div className="flex items-center h-[72px] px-8 bg-white border-b border-border/50 flex-shrink-0 relative z-10">
        <h2 className="text-2xl font-heading font-black tracking-tighter text-primary">
          FIESTO
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto py-8 custom-scrollbar">
        {navigationGroups.map((group) => (
          <NavGroup key={group.title} group={group} pathname={pathname} />
        ))}
      </div>
      
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-white shadow-soft transition-soft hover:shadow-soft-lg cursor-pointer">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-heading font-bold">
            JD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-foreground truncate">John Doe</p>
            <p className="text-xs font-medium text-primary/60 truncate">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}
