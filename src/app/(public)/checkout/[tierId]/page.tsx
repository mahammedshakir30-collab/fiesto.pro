import React from 'react';
import { CheckoutFlow } from '@/components/public/CheckoutFlow';
import { notFound } from 'next/navigation';
import { getTicketTierById, getFestivalById } from '@/actions/utils';

export default async function CheckoutPage({ params }: { params: { tierId: string } }) {
  const tier = await getTicketTierById(params.tierId);
  
  if (!tier) {
    notFound();
  }

  const festival = await getFestivalById(tier.festivalId);

  if (!festival) {
    notFound();
  }

  return (
    <div className="bg-color-base min-h-screen py-16">
      <div className="container mx-auto px-4">
        <CheckoutFlow tier={tier} festival={festival} />
      </div>
    </div>
  );
}
