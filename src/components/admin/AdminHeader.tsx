"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, User as UserIcon, Menu, X, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface AdminHeaderProps {
  mobileSidebar?: React.ReactNode;
}

export function AdminHeader({ mobileSidebar }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const userName = session?.user?.name || "Admin";
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <header className="h-14 sm:h-16 lg:h-20 border-b border-border bg-background flex items-center justify-between px-3 sm:px-5 lg:px-8 sticky top-0 z-40 shrink-0">
        {/* Mobile hamburger */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search - responsive width */}
          <div className="hidden sm:flex relative max-w-xs lg:max-w-xl w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search festivals, users..."
              className="pl-9 pr-4 py-2 bg-card border border-border rounded-full w-full text-sm focus:outline-none focus:border-[#F1642E] text-foreground placeholder:text-muted-foreground transition-colors h-9 sm:h-10 lg:h-12"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile search icon */}
          <button className="sm:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground">
            <Search className="w-4 h-4" />
          </button>

          <button className="relative text-muted-foreground hover:text-foreground transition-colors p-1.5">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#F1642E] rounded-full border-2 border-background" />
          </button>

          <div className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-border">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#504E76] flex items-center justify-center text-white font-bold text-xs shrink-0">
              {getInitials(userName)}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold leading-tight truncate max-w-[100px] lg:max-w-[140px]">{userName}</div>
              <div className="text-[10px] text-muted-foreground">Super Admin</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="ml-1 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors hidden sm:flex"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 sm:w-80 bg-card border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-heading font-black text-xl text-[#504E76]">FestOS Admin</span>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setDrawerOpen(false)}>
              {mobileSidebar}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
