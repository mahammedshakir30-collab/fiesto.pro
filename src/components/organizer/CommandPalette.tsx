"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Map, Ticket, Store, Users, Megaphone, Settings, Trophy, BarChart3, LayoutDashboard, Compass } from "lucide-react";
import { Command } from "cmdk";

export function CommandPalette({ open, setOpen, festivalId }: { open: boolean, setOpen: (open: boolean) => void, festivalId: string }) {
  const router = useRouter();

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden shadow-2xl rounded-2xl sm:max-w-xl bg-card border border-border">
        <Command className="w-full flex flex-col h-full bg-card">
          <div className="flex items-center border-b border-border px-4 py-1">
            <Search className="mr-3 h-5 w-5 shrink-0 text-[#F1642E]" />
            <Command.Input 
              placeholder="Search anything in festival..." 
              className="flex h-14 w-full rounded-md bg-transparent py-3 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0 focus:outline-none"
            />
          </div>
          <Command.List className="max-h-[320px] overflow-y-auto overflow-x-hidden p-3 custom-scrollbar space-y-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground font-medium">
              No matching pages or tools found.
            </Command.Empty>
            
            <Command.Group heading="Navigation" className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-bold">
              <Command.Item 
                onSelect={() => runCommand(() => router.push(`/organizer/${festivalId}`))}
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors aria-selected:bg-[#F1642E]/10 aria-selected:text-[#F1642E] aria-selected:font-bold data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <LayoutDashboard className="mr-3 h-4 w-4 shrink-0 text-muted-foreground group-aria-selected:text-[#F1642E]" />
                Dashboard
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push(`/organizer/${festivalId}/settings`))}
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors aria-selected:bg-[#F1642E]/10 aria-selected:text-[#F1642E] aria-selected:font-bold data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Settings className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
                Settings
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push(`/organizer/${festivalId}/programmes`))}
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors aria-selected:bg-[#F1642E]/10 aria-selected:text-[#F1642E] aria-selected:font-bold data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Trophy className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
                Programmes
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push(`/organizer/${festivalId}/staff`))}
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors aria-selected:bg-[#F1642E]/10 aria-selected:text-[#F1642E] aria-selected:font-bold data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Users className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
                Staff & Roles
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push(`/leader/${festivalId}`))}
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors aria-selected:bg-[#F1642E]/10 aria-selected:text-[#F1642E] aria-selected:font-bold data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Compass className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
                Leader Portal
              </Command.Item>
            </Command.Group>
            
            <Command.Group heading="Settings & Access" className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-bold">
              <Command.Item 
                onSelect={() => runCommand(() => router.push(`/organizer/${festivalId}/settings/roles`))}
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors aria-selected:bg-[#F1642E]/10 aria-selected:text-[#F1642E] aria-selected:font-bold data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Settings className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
                Roles & Permissions
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
