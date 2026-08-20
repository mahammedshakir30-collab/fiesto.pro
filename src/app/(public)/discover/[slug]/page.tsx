import React from 'react';
import { notFound } from 'next/navigation';
import { 
  FestivalBanner, 
  LineupSection, 
  TicketSection, 
  VendorsSection, 
  FAQSection 
} from '@/components/public/FestivalDetails';
import { getFestivalBySlug } from '@/actions/festivals';
import { getStages, getLineupSlots, getArtists } from '@/actions/lineup';
import { getTicketTiers } from '@/actions/commerce';
import { getVendorsForFestival } from '@/actions/vendors';
import { FeaturedPosters } from '@/components/public/FeaturedPosters';

export default async function FestivalDetailPage({ params }: { params: { slug: string } }) {
  const festival = await getFestivalBySlug(params.slug);
  
  if (!festival) {
    notFound();
  }

  const [stages, slots, allTiers, allVendors, artists] = await Promise.all([
    getStages(festival.id),
    getLineupSlots(festival.id),
    getTicketTiers(festival.id),
    getVendorsForFestival(festival.id),
    getArtists()
  ]);

  const tiers = allTiers.filter(t => t.status !== 'HIDDEN');
  const vendors = allVendors.filter(v => v.status === 'ACTIVE');

  return (
    <div className="bg-color-base min-h-screen">
      <FestivalBanner festival={festival} />
      
      <div className="container mx-auto px-4 py-8">
        <FeaturedPosters festivalId={festival.id} festivalSlug={festival.slug} />
        <TicketSection tiers={tiers} />
        
        <LineupSection slots={slots} artists={artists} stages={stages} />
        
        <VendorsSection vendors={vendors} />
        
        <FAQSection />
      </div>
    </div>
  );
}
