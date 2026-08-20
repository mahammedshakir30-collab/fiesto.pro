import React from "react";
import { Hero } from "@/components/public/LandingSections";
import { FeaturedFestival, HowItWorks } from "@/components/public/LandingSections";
import { getPublicFestivals } from "@/actions/festivals";
import { prisma } from "@/lib/prisma";
import { PricingSection } from "@/components/public/PricingSection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const revalidate = 60; // ISR: revalidate every 60s for near-static speed

export default async function LandingPage() {
  const [session, { data: festivals }, plans] = await Promise.all([
    getServerSession(authOptions),
    getPublicFestivals(1, 5),
    prisma.planTier.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" }
    })
  ]);

  const featured = festivals.find(f => f.status === "LIVE") || festivals[0];
  const isLoggedIn = !!session;

  return (
    <div className="flex flex-col w-full">
      <Hero isLoggedIn={isLoggedIn} />
      {featured ? <FeaturedFestival festival={featured} /> : null}
      <HowItWorks />
      <PricingSection plans={plans} />
    </div>
  );
}
