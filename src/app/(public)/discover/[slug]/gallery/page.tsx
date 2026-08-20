import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getFestivalBySlug } from '@/actions/festivals';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function GalleryPage({ params }: { params: { slug: string } }) {
  const festival = await getFestivalBySlug(params.slug);
  
  if (!festival) {
    notFound();
  }

  const posters = await prisma.template.findMany({
    where: {
      festivalId: festival.id,
      published: true
    },
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <div className="bg-color-base min-h-screen pb-16">
      {/* Header */}
      <div className="bg-color-surface border-b border-color-border/30 pt-8 pb-12">
        <div className="container mx-auto px-4">
          <Link href={`/discover/${festival.slug}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to {festival.name}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-color-text-main">
            Content & Gallery
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Explore highlights, winner announcements, and official posters from {festival.name}.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        {posters.length === 0 ? (
          <div className="text-center py-20 bg-color-surface rounded-2xl border border-color-border/30">
            <h3 className="text-2xl font-semibold mb-2">No content yet</h3>
            <p className="text-muted-foreground">Check back later for posters and announcements.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {posters.map(poster => (
              <div key={poster.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-color-surface border border-color-border/30 shadow-sm hover:shadow-xl transition-all duration-300">
                <Image 
                  src={poster.outputImageUrl} 
                  alt={poster.name} 
                  width={1080}
                  height={1350}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="w-full h-auto object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-semibold text-lg line-clamp-2 leading-tight mb-3">
                    {poster.name}
                  </h3>
                  <a href={poster.outputImageUrl} download={`${poster.name}.png`}>
                    <Button variant="secondary" size="sm" className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                      <Download className="w-4 h-4 mr-2" /> Download High-Res
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
