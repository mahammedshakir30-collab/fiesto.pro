"use client";

import * as React from "react"
import { usePathname } from "next/navigation"
import { Bell, Search, Moon, ChevronRight, Menu, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TopNavbar() {
  const pathname = usePathname() || ""
  const pathSegments = pathname.split('/').filter(Boolean)

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-border shadow-sm">
      <div className="flex h-[72px] items-center px-8 gap-6">
        <Button variant="ghost" size="icon" className="lg:hidden text-primary">
          <Menu className="h-6 w-6" strokeWidth={2} />
        </Button>
        
        {/* Dynamic Breadcrumbs */}
        <div className="hidden md:flex items-center text-[15px] font-medium text-primary/50">
          <span className="capitalize">Home</span>
          {pathSegments.map((segment, index) => (
            <React.Fragment key={segment}>
              <ChevronRight className="h-4 w-4 mx-2 opacity-50" />
              <span className={index === pathSegments.length - 1 ? "text-primary font-bold capitalize" : "capitalize"}>
                {segment.replace(/-/g, ' ')}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 flex justify-end items-center gap-6">
          <div className="hidden sm:flex relative w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" strokeWidth={2} />
            <input
              type="search"
              placeholder="Search across FIESTO..."
              className="main-search-input w-full h-10 pl-10 pr-4 rounded-full bg-[#F4F3F9] border-none text-[#17151F] text-[15px] font-medium placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          
          <Button className="hidden md:flex h-10 px-5 rounded-full text-[15px] font-bold">
            <Plus className="mr-2 h-4 w-4" strokeWidth={2.5} />
            Quick Action
          </Button>

          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-[#F4F3F9] text-primary/60 transition-colors">
              <Moon className="h-5 w-5" strokeWidth={2} />
              <span className="sr-only">Toggle theme</span>
            </button>
            
            <button className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-[#F4F3F9] text-primary/60 transition-colors relative">
              <Bell className="h-5 w-5" strokeWidth={2} />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-action border-2 border-white"></span>
              <span className="sr-only">Notifications</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
