import Link from 'next/link';
import { Compass, Sparkles, Trophy, Calendar } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#504E76] text-color-base py-16 border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div className="space-y-4 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F1642E] flex items-center justify-center text-white font-display text-xl font-bold">
              F
            </div>
            <span className="font-display text-4xl tracking-wide text-[#F1642E]">FIESTO</span>
          </div>
          <p className="font-sans text-color-soft/80 text-sm max-w-xs leading-relaxed">
            Enterprise Festival SaaS & Live Events Platform. From stage scheduling and team management to instant point leaderboards.
          </p>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-heading text-base font-bold text-white uppercase tracking-wider">Explore</h4>
          <ul className="space-y-2 font-sans text-sm text-color-soft">
            <li><Link href="/discover" className="hover:text-[#F1642E] transition-colors">Discover Festivals</Link></li>
            <li><Link href="/about" className="hover:text-[#F1642E] transition-colors">About Platform</Link></li>
            <li><Link href="/signin" className="hover:text-[#F1642E] transition-colors">Sign In</Link></li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-heading text-base font-bold text-white uppercase tracking-wider">Portals</h4>
          <ul className="space-y-2 font-sans text-sm text-color-soft">
            <li><Link href="/portal" className="hover:text-[#F1642E] transition-colors">Festival Workspace</Link></li>
            <li><Link href="/signin" className="hover:text-[#F1642E] transition-colors">Team Leader Access</Link></li>
            <li><Link href="/signup" className="hover:text-[#F1642E] transition-colors">Host an Event</Link></li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-heading text-base font-bold text-white uppercase tracking-wider">Platform Status</h4>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </div>
            <p className="text-[11px] text-color-soft/70">
              Live score engines, check-in scanners, and ticketing online.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-color-soft/60">
        <p>&copy; {new Date().getFullYear()} Fiesto Festival OS. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/about" className="hover:text-[#F1642E] transition-colors">About</Link>
          <Link href="/discover" className="hover:text-[#F1642E] transition-colors">Events</Link>
          <Link href="/signin" className="hover:text-[#F1642E] transition-colors">Login</Link>
        </div>
      </div>
    </footer>
  );
}
