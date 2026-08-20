"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Settings, LogOut, RefreshCw, Menu, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { CommandPalette } from "./CommandPalette";

interface OrganizerHeaderProps {
  festivalName?: string;
  userName?: string;
  festival?: any;
  mobileSidebar?: React.ReactNode;
}

export function OrganizerHeader({
  festivalName = "Festival",
  userName = "User",
  festival,
  mobileSidebar,
}: OrganizerHeaderProps) {
  const router = useRouter();
  const params = useParams();
  const festivalId = params.festivalId as string;
  const [cmdOpen, setCmdOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen(v => !v);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const getInitials = (name: string) =>
    name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "??";

  return (
    <>
      <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center justify-between px-3 sm:px-4 lg:px-6 shrink-0 z-30 sticky top-0">
        {/* Left: Mobile hamburger + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger - only visible < lg */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/festivals" className="font-heading font-black text-lg sm:text-xl tracking-tighter text-[#504E76] hover:opacity-80 transition-opacity">
            Fiesto.
          </Link>

          {/* Festival name badge - shown on sm+ */}
          {festivalName && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#504E76]/10 text-[#504E76] border border-[#504E76]/20 truncate max-w-[160px] lg:max-w-[200px]">
              {festivalName}
            </span>
          )}
        </div>

        {/* Center: Search — hidden on xs, visible sm+ */}
        <div className="hidden sm:flex flex-1 max-w-xs lg:max-w-md mx-3 lg:mx-6">
          <div
            className="relative flex items-center w-full h-9 sm:h-10 rounded-full border border-border bg-muted/30 px-3 sm:px-4 text-sm text-muted-foreground cursor-text hover:border-[#A3B565] transition-all group"
            onClick={() => setCmdOpen(true)}
            role="button"
            tabIndex={0}
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-muted-foreground group-hover:text-[#A3B565] transition-colors shrink-0" />
            <span className="flex-1 text-left text-xs sm:text-sm">Search...</span>
            <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile search icon */}
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            onClick={() => setCmdOpen(true)}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <NotificationBell festivalId={festivalId} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="pl-1.5 pr-2 sm:pl-2 sm:pr-3 h-8 sm:h-10 rounded-full hover:bg-muted/50 gap-1.5 sm:gap-2 border border-transparent hover:border-border transition-all"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#504E76] text-white flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0">
                  {getInitials(userName)}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline-block truncate max-w-[80px] lg:max-w-[120px]">
                  {userName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 sm:w-56 rounded-xl shadow-lg">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium leading-none truncate">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{festivalName}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => router.push(`/organizer/${festivalId}/settings`)}>
                <Settings className="w-4 h-4 mr-2 text-muted-foreground" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => router.push("/festivals")}>
                <RefreshCw className="w-4 h-4 mr-2 text-muted-foreground" /> Switch Festival
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => signOut({ callbackUrl: "/signin" })}
              >
                <LogOut className="w-4 h-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} festivalId={festivalId} />

      {/* Mobile Sidebar Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="absolute left-0 top-0 h-full w-72 sm:w-80 bg-card border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link href="/festivals" className="font-heading font-black text-xl tracking-tighter text-[#504E76]" onClick={() => setDrawerOpen(false)}>
                Fiesto.
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Sidebar content */}
            <div className="flex-1 overflow-y-auto" onClick={() => setDrawerOpen(false)}>
              {mobileSidebar}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
