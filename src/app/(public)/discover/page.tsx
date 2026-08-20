import React from 'react';
import { FestivalGrid } from '@/components/public/FestivalGrid';
import { getPublicFestivals } from '@/actions/festivals';

export default async function DiscoveryPage() {
  const { data: festivals } = await getPublicFestivals(1, 20);
  return (
    <div className="bg-color-base min-h-screen">
      <div className="bg-color-primary py-16 text-center text-color-base">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-6xl uppercase tracking-wider mb-4">All <span className="text-color-accent">Festivals</span></h1>
          <p className="font-sans text-xl text-color-soft/80 max-w-2xl mx-auto">
            Find your next unforgettable experience. Browse our curated selection of premier events worldwide.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <FestivalGrid initialFestivals={festivals} />
      </div>
    </div>
  );
}
