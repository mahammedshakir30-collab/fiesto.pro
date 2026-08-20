"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, 
  Menu, 
  X, 
  Sparkles, 
  Compass, 
  Info, 
  LogIn, 
  LayoutDashboard,
  User
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/discover', label: 'Discover Events', icon: <Compass className="w-4 h-4" /> },
    { href: '/about', label: 'About FestOS', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/85 backdrop-blur-md transition-all">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#504E76] to-[#F1642E] flex items-center justify-center text-white font-display text-2xl shadow-md group-hover:scale-105 transition-transform">
            F
          </div>
          <span className="font-display text-3xl sm:text-4xl text-color-primary tracking-wide group-hover:text-[#F1642E] transition-colors">
            FIESTO
          </span>
        </Link>
        
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-sans font-semibold text-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`transition-colors flex items-center gap-1.5 ${
                  isActive 
                    ? 'text-[#F1642E] font-bold' 
                    : 'text-foreground/80 hover:text-[#F1642E]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <Link href="/portal">
              <Button className="bg-[#504E76] hover:bg-[#504E76]/90 text-white rounded-full font-bold shadow-sm gap-2 min-h-[42px] px-5 text-sm">
                <LayoutDashboard className="w-4 h-4" />
                My Workspace
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" className="font-bold text-color-primary hover:text-[#F1642E] text-sm min-h-[42px] px-4">
                  Sign In
                </Button>
              </Link>
              <Link href="/discover">
                <Button className="bg-[#F1642E] text-white hover:bg-[#F1642E]/90 rounded-full font-bold shadow-md gap-2 min-h-[42px] px-5 text-sm">
                  <CalendarDays className="w-4 h-4" />
                  Explore Events
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl bg-muted/60 text-foreground hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 pt-2 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted font-medium text-sm text-foreground"
            >
              Home
            </Link>
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted font-medium text-sm text-foreground"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            {session ? (
              <Link href="/portal" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button className="w-full bg-[#504E76] text-white hover:bg-[#504E76]/90 rounded-xl font-bold min-h-[44px] gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="outline" className="w-full rounded-xl font-bold min-h-[44px]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/discover" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button className="w-full bg-[#F1642E] text-white hover:bg-[#F1642E]/90 rounded-xl font-bold min-h-[44px] gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Explore Events
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
