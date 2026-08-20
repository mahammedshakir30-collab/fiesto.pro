"use client";

import { useState } from 'react';
import { Festival } from '@prisma/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { MapPin, Calendar, Search, Sparkles, Trophy } from 'lucide-react';
import { CloudinaryImage } from '@/components/shared/CloudinaryImage';

export function FestivalGrid({ initialFestivals }: { initialFestivals: Festival[] }) {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const locations = Array.from(new Set(initialFestivals.map(f => f.location).filter(Boolean))) as string[];

  const filteredFestivals = initialFestivals.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
                          (f.description && f.description.toLowerCase().includes(search.toLowerCase()));
    const matchesLocation = locationFilter ? f.location === locationFilter : true;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-64 space-y-6 flex-shrink-0">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-heading text-base font-bold mb-2">Search Events</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Festival name or keyword..." 
                className="pl-9 bg-background h-10 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <h3 className="font-heading text-base font-bold mb-2">Filter by Location</h3>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              <button 
                className={`block w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  locationFilter === '' 
                    ? 'bg-[#504E76] text-white shadow-sm' 
                    : 'hover:bg-muted text-foreground'
                }`}
                onClick={() => setLocationFilter('')}
              >
                All Locations ({initialFestivals.length})
              </button>
              {locations.map(loc => {
                const count = initialFestivals.filter(f => f.location === loc).length;
                return (
                  <button 
                    key={loc}
                    className={`block w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      locationFilter === loc 
                        ? 'bg-[#504E76] text-white shadow-sm' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                    onClick={() => setLocationFilter(loc)}
                  >
                    {loc} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {(search || locationFilter) && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs" 
              onClick={() => { setSearch(''); setLocationFilter(''); }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold">Discover Events</h2>
            <p className="text-muted-foreground font-sans text-xs sm:text-sm">
              Showing {filteredFestivals.length} festivals
            </p>
          </div>
        </div>

        {filteredFestivals.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed rounded-3xl border-border bg-card">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <h3 className="font-heading text-xl font-bold text-color-primary mb-1">No festivals found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters to discover more events.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => { setSearch(''); setLocationFilter(''); }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFestivals.map((festival, i) => (
              <motion.div 
                key={festival.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link href={`/discover/${festival.slug}`} className="group block h-full">
                  <div className="bg-card text-card-foreground rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all h-full flex flex-col border border-border group-hover:border-[#504E76]/50">
                    <div className="aspect-[16/10] bg-[#504E76] relative overflow-hidden">
                      {festival.coverImageUrl ? (
                        <CloudinaryImage 
                          src={festival.coverImageUrl} 
                          alt={festival.name} 
                          preset="banner"
                          fill
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#504E76] to-[#3B3958] text-white">
                          <span className="font-display text-4xl opacity-40">{festival.name.charAt(0)}</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 pointer-events-none" />
                      
                      <div className="absolute top-3 left-3 z-20 flex gap-1.5">
                        {festival.status === 'LIVE' ? (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md">
                            ● Live
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-white/20 backdrop-blur text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Upcoming
                          </span>
                        )}

                        {festival.competitionModeEnabled && (
                          <span className="px-2 py-0.5 bg-[#F1642E] text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                            <Trophy className="w-2.5 h-2.5" /> Comp
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 z-20 right-3">
                        <h4 className="font-heading text-lg sm:text-xl font-bold text-white line-clamp-1 group-hover:text-[#F1642E] transition-colors">
                          {festival.name}
                        </h4>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                      <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {festival.description || 'Join us for an unforgettable festival experience with live events, stage shows, and competitions.'}
                      </p>
                      
                      <div className="space-y-1.5 text-xs font-medium text-foreground pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 text-[#F1642E] shrink-0" />
                          <span className="truncate">
                            {new Date(festival.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(festival.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-[#F1642E] shrink-0" />
                          <span className="truncate">{festival.location || 'Main Venue'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
