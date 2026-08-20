import React from 'react';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export async function FeaturedPosters({ festivalId, festivalSlug }: { festivalId: string, festivalSlug: string }) {
  const featuredPosters = await prisma.template.findMany({
    where: {
      festivalId,
      published: true,
      featuredOnHome: true
    },
    orderBy: { publishedAt: 'desc' },
    take: 10
  });

  if (featuredPosters.length === 0) return null;

  return (
    <section className="py-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold font-heading mb-2">Featured Highlights</h2>
          <p className="text-muted-foreground max-w-2xl">
            See the latest achievements, announcements, and posters from our festival.
          </p>
        </div>
        <Link href={`/discover/${festivalSlug}/gallery`} className="hidden md:flex items-center text-primary font-medium hover:underline">
          View Full Gallery <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-8 snap-x custom-scrollbar">
        {featuredPosters.map(poster => (
          <div key={poster.id} className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] aspect-[4/5] relative rounded-2xl overflow-hidden shadow-lg snap-start shrink-0 group">
            <Image 
              src={poster.outputImageUrl} 
              alt={poster.name} 
              fill
              sizes="(max-width: 768px) 280px, 320px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
              <h3 className="text-white font-bold text-xl">{poster.name}</h3>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 md:hidden flex justify-center">
        <Link href={`/discover/${festivalSlug}/gallery`} className="flex items-center text-primary font-medium hover:underline">
          View Full Gallery <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </section>
  );
}
