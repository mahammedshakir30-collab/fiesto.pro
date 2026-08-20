"use client";

import Link from "next/link";
import { Prisma } from "@prisma/client";

export function PublicSiteNavbar({ 
  festival, 
  pages,
  theme
}: { 
  festival: Prisma.FestivalGetPayload<{}>;
  pages: Prisma.SitePageGetPayload<{}>[];
  theme: any;
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b" style={{ backgroundColor: theme.background || '#FDF8E2', borderColor: 'rgba(0,0,0,0.1)' }}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/discover/${festival.slug}`} className="text-2xl font-bold font-heading" style={{ color: theme.primary || '#F1642E' }}>
          {festival.name}
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {pages.map((page) => (
            <Link 
              key={page.id} 
              href={page.slug ? `/discover/${festival.slug}/${page.slug}` : `/discover/${festival.slug}`}
              className="text-sm font-semibold hover:opacity-80 transition-opacity"
              style={{ color: theme.text || '#1A1A1A' }}
            >
              {page.title}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <Link 
            href={`/checkout/${festival.id}`} 
            className="px-4 py-2 rounded-md text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: theme.primary || '#F1642E', color: '#fff' }}
          >
            Buy Tickets
          </Link>
        </div>
      </div>
    </header>
  );
}
