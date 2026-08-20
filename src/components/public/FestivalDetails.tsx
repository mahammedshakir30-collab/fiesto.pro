"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Festival, LineupSlot, Artist, Stage, TicketTier, Vendor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Info, Trophy, Ticket, Utensils, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export function FestivalBanner({ festival }: { festival: Festival }) {
  return (
    <div className="relative w-full min-h-[55vh] flex items-end bg-[#504E76]">
      {/* Background Gradient & Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#17151F] via-[#17151F]/70 to-transparent z-10" />
      <div className="absolute inset-0 bg-[#504E76]/30 mix-blend-multiply z-0" />
      
      <div className="container relative z-20 px-4 sm:px-6 pb-14 pt-28">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          {festival.status === 'LIVE' ? (
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500 text-white text-xs font-bold tracking-widest uppercase mb-4 shadow-lg">
              ● Happening Now
            </span>
          ) : (
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white text-xs font-bold tracking-widest uppercase mb-4 border border-white/20">
              Official Festival
            </span>
          )}

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl uppercase tracking-wider text-white leading-none mb-6">
            {festival.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-color-soft font-sans text-base sm:text-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#F1642E]" />
              <span>
                {new Date(festival.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {new Date(festival.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F1642E]" />
              <span>{festival.location || 'Main Venue'}</span>
            </div>
          </div>
          
          {festival.competitionModeEnabled && (
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={`/discover/${festival.slug}/results`}>
                <Button className="bg-[#F1642E] hover:bg-[#F1642E]/90 text-white font-bold px-8 py-6 rounded-2xl shadow-xl gap-2 text-base transition-transform active:scale-95">
                  <Trophy className="w-5 h-5" />
                  View Live Results & Scoreboard
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export function LineupSection({ slots, artists, stages }: { slots: LineupSlot[], artists: Artist[], stages: Stage[] }) {
  const [selectedStage, setSelectedStage] = useState<string>(stages[0]?.id || '');

  const filteredSlots = slots.filter(s => s.stageId === selectedStage).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  if (stages.length === 0) return null;

  return (
    <div className="py-14 sm:py-16">
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-foreground">Lineup & Set Times</h2>
      
      <div className="flex flex-wrap gap-2.5 mb-8">
        {stages.map(stage => (
          <button 
            key={stage.id}
            onClick={() => setSelectedStage(stage.id)}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all min-h-[44px] ${
              selectedStage === stage.id 
                ? 'bg-[#504E76] text-white shadow-md' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {stage.name}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {filteredSlots.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm font-medium">
            No performances scheduled for this stage yet. Check back soon!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredSlots.map(slot => {
              const artist = artists.find(a => a.id === slot.artistId);
              if (!artist) return null;
              
              const start = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const end = new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={slot.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-28 shrink-0 text-color-primary font-bold font-sans text-sm">
                      <Clock className="w-4 h-4 inline mr-1.5 text-[#F1642E]" />
                      {start}
                    </div>
                    <div>
                      <h3 className="font-heading text-xl sm:text-2xl font-bold">{artist.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{artist.genre.join(', ')}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full w-fit text-xs min-h-[36px]">
                    Stage Info
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function TicketSection({ tiers }: { tiers: TicketTier[] }) {
  if (tiers.length === 0) return null;
  
  return (
    <div className="py-14 sm:py-16">
      <div className="flex items-center gap-2 mb-2">
        <Ticket className="w-5 h-5 text-[#F1642E]" />
        <span className="text-xs uppercase font-bold tracking-wider text-[#F1642E]">Tickets & Passes</span>
      </div>
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-foreground">Get Your Access</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map(tier => {
          const isSoldOut = tier.status === 'SOLD_OUT';
          const price = (tier.price / 100).toLocaleString('en-US', { style: 'currency', currency: tier.currency });
          
          return (
            <div 
              key={tier.id} 
              className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between gap-6 transition-all ${
                isSoldOut 
                  ? 'bg-muted/40 border-border opacity-70' 
                  : 'bg-card border-border hover:border-[#504E76] hover:shadow-lg'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-heading text-2xl font-bold">{tier.name}</h3>
                  {isSoldOut && (
                    <span className="text-xs font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-1 rounded">
                      Sold Out
                    </span>
                  )}
                </div>
                <div className="font-display text-4xl text-[#F1642E]">{price}</div>
                {tier.description && <p className="text-muted-foreground text-sm leading-relaxed">{tier.description}</p>}
              </div>
              
              <Button 
                disabled={isSoldOut} 
                className={`w-full h-14 rounded-2xl text-base font-bold min-h-[44px] ${
                  !isSoldOut ? 'bg-[#F1642E] text-white hover:bg-[#F1642E]/90 shadow-md' : ''
                }`}
                asChild={!isSoldOut}
              >
                {isSoldOut ? (
                  <span>Sold Out</span>
                ) : (
                  <Link href={`/checkout/${tier.id}`}>Book Ticket</Link>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VendorsSection({ vendors }: { vendors: Vendor[] }) {
  if (vendors.length === 0) return null;
  
  return (
    <div className="py-14 sm:py-16">
      <div className="flex items-center gap-2 mb-2">
        <Utensils className="w-5 h-5 text-[#F1642E]" />
        <span className="text-xs uppercase font-bold tracking-wider text-[#F1642E]">Food & Stalls</span>
      </div>
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-8">Food & Experiences</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {vendors.map(vendor => (
          <div key={vendor.id} className="p-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F1642E]">{vendor.category}</span>
            <h3 className="font-heading text-xl font-bold">{vendor.name}</h3>
            <p className="text-sm text-muted-foreground">{vendor.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FAQSection() {
  return (
    <div className="py-14 sm:py-16 max-w-3xl">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-5 h-5 text-[#F1642E]" />
        <span className="text-xs uppercase font-bold tracking-wider text-[#F1642E]">Need Help?</span>
      </div>
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {[
          { q: 'What can I bring into the festival?', a: 'Small clear bags, empty reusable water bottles, and your digital or printed pass. Outside food/drink and professional cameras are restricted.' },
          { q: 'Are tickets refundable?', a: 'All ticket sales are processed securely. You can transfer your pass to another attendee via the FIESTO app up to 24 hours before the event starts.' },
          { q: 'How do live competition scores work?', a: 'As judges record scores across stages, verified results are calculated and published immediately to the Live Scoreboard.' }
        ].map((faq, i) => (
          <div key={i} className="p-6 bg-card rounded-2xl border border-border space-y-2">
            <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
              <Info className="w-5 h-5 text-color-primary shrink-0" /> {faq.q}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed pl-7">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

