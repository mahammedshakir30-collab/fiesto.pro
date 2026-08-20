'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { PlanTier } from '@prisma/client';

export interface DurationOption {
  months: number;
  pricePerMonth: number;
  originalPricePerMonth: number | null;
  totalPrice: number;
  originalTotalPrice: number | null;
}

export interface FeatureItem {
  label: string;
  value: string;
}

interface PlanCardProps {
  plan: any;
  currentPlanId?: string | null;
  selectedDuration?: number | null;
  context?: 'public' | 'organizer';
  festival?: { id: string; name: string } | null;
  user?: { name?: string | null; email?: string | null } | null;
}

export function PlanCard({ 
  plan, 
  currentPlanId, 
  selectedDuration,
  context = 'public', 
  festival,
  user 
}: PlanCardProps) {
  const isCurrentPlan = currentPlanId === plan.id;
  const isContactSales = plan.isContactSales;

  let durationOptions: DurationOption[] = [];
  try {
    if (plan.durationOptions) {
      durationOptions = typeof plan.durationOptions === 'string' 
        ? JSON.parse(plan.durationOptions) 
        : (plan.durationOptions as unknown as DurationOption[]);
      durationOptions.sort((a, b) => a.months - b.months);
    }
  } catch (e) {
    console.error("Failed to parse durationOptions for", plan.name);
  }

  // Local state for duration selection (default to 3 months if available, or first)
  const defaultDuration = durationOptions.length > 0 ? durationOptions[0].months : 1;
  const [activeDuration, setActiveDuration] = useState<number>(defaultDuration);

  let pricingObj: DurationOption | null = null;
  if (!isContactSales && durationOptions.length > 0) {
    pricingObj = durationOptions.find(d => d.months === activeDuration) || durationOptions[0];
  } else if (!isContactSales) {
    pricingObj = {
      months: 1,
      pricePerMonth: plan.monthlyPrice,
      originalPricePerMonth: null,
      totalPrice: plan.monthlyPrice,
      originalTotalPrice: null
    };
  }

  let featureList: FeatureItem[] = [];
  try {
    if (plan.featureList) {
      featureList = typeof plan.featureList === 'string' 
        ? JSON.parse(plan.featureList) 
        : (plan.featureList as unknown as FeatureItem[]);
    }
  } catch (e) {
    console.error("Failed to parse featureList for", plan.name);
  }

  // CTA Link and label
  const targetNumber = '919900228866';
  let ctaLabel = "Continue >";
  let ctaLink = "#";

  if (isCurrentPlan) {
    ctaLabel = "Selected";
  } else if (isContactSales) {
    ctaLabel = "Contact sales >";
    if (context === 'organizer' && festival) {
      ctaLink = buildWhatsAppLink(targetNumber, `Hi, I'd like to talk about the ${plan.name} plan for ${festival.name} (${festival.id}).`);
    } else {
      ctaLink = buildWhatsAppLink(targetNumber, `Hi, I'm interested in FestOS \u2014 tell me about the ${plan.name} plan.`);
    }
  } else {
    if (context === 'organizer' && festival) {
      ctaLink = buildWhatsAppLink(targetNumber, `Hi, I'd like to upgrade my FestOS plan.\n\nFestival: ${festival.name} (${festival.id})\nOrganizer: ${user?.name || 'N/A'}\nRequested Plan: ${plan.name} (${pricingObj?.months} months for \u20B9${pricingObj?.totalPrice?.toLocaleString()})\n\nPlease share payment details.`);
    } else {
      ctaLink = buildWhatsAppLink(targetNumber, `Hi, I'd like to sign up for FestOS.\n\nRequested Plan: ${plan.name} (${pricingObj?.months} months for \u20B9${pricingObj?.totalPrice?.toLocaleString()})\n\nPlease share payment details.`);
    }
  }

  let discountPercent = 0;
  if (pricingObj?.originalPricePerMonth && pricingObj.originalPricePerMonth > pricingObj.pricePerMonth) {
    discountPercent = Math.round((1 - (pricingObj.pricePerMonth / pricingObj.originalPricePerMonth)) * 100);
  }

  const isFree = !isContactSales && (pricingObj?.pricePerMonth === 0 || plan.name.toLowerCase() === 'trial');

  const formatDurationLabel = (m: number) => {
    if (m === 1) return '1 month';
    if (m === 12) return '1 year';
    return `${m} months`;
  };

  return (
    <div className={`relative flex flex-col p-7 rounded-[32px] bg-white transition-all h-full shadow-[0_4px_24px_rgba(0,0,0,0.03)] border
      ${isCurrentPlan ? 'border-[#F1642E]/50 ring-1 ring-[#F1642E]/30' : 'border-gray-100'}
    `}>
      {/* Top Header Badge Row */}
      <div className="flex justify-between items-center mb-4 min-h-[26px]">
        {isCurrentPlan ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" /> CURRENT PLAN
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#F1642E] bg-[#FFF2ED] border border-[#F1642E]/20 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#F1642E]" /> {plan.name}
          </div>
        )}

        {plan.badge && (
          <div className="bg-[#F1642E] text-white px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
            {plan.badge}
          </div>
        )}
      </div>

      {/* Plan Title & Tagline */}
      <h3 className="text-3xl font-extrabold text-[#111827] tracking-tight">{plan.name}</h3>
      {plan.tagline && (
        <p className="text-xs text-gray-500 mt-2 min-h-[36px] leading-relaxed">
          {plan.tagline}
        </p>
      )}

      {/* Duration Pills */}
      {!isContactSales && durationOptions.length > 1 ? (
        <div className="flex gap-1 my-4 p-1 bg-[#F4F4F5] rounded-full w-full max-w-[270px]">
          {durationOptions.map(opt => (
            <button
              key={opt.months}
              type="button"
              onClick={() => setActiveDuration(opt.months)}
              className={`flex-1 py-1.5 px-2 rounded-full text-xs font-bold transition-all text-center ${
                activeDuration === opt.months
                  ? 'bg-[#F1642E] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {formatDurationLabel(opt.months)}
            </button>
          ))}
        </div>
      ) : (
        <div className="my-4 h-9"></div>
      )}

      {/* Pricing Block */}
      <div className="bg-[#F8F9FA] rounded-2xl p-5 mb-6 min-h-[140px] flex flex-col justify-center">
        {isContactSales ? (
          <div>
            <div className="text-3xl font-extrabold text-[#111827] tracking-tight">Let's talk</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">LET'S TALK</p>
          </div>
        ) : isFree ? (
          <div>
            <div className="text-4xl font-extrabold text-[#111827] tracking-tight">Free</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">3 DAYS</p>
          </div>
        ) : pricingObj ? (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-[#111827] tracking-tight">
                INR {pricingObj.pricePerMonth?.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-gray-500">/mo</span>
            </div>

            {/* Discount line */}
            <div className="flex items-center gap-2 mt-1 min-h-[22px]">
              {pricingObj.originalPricePerMonth && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  INR {pricingObj.originalPricePerMonth.toLocaleString()}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-[10px] font-extrabold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Total price for duration */}
            {pricingObj.totalPrice > 0 && pricingObj.months > 1 && (
              <p className="text-xs text-gray-600 font-medium mt-1">
                INR {pricingObj.totalPrice.toLocaleString()} total for {pricingObj.months} months{' '}
                {pricingObj.originalTotalPrice && (
                  <span className="line-through text-gray-400 ml-1">
                    INR {pricingObj.originalTotalPrice.toLocaleString()}
                  </span>
                )}
              </p>
            )}

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
              {pricingObj.months === 12 ? '1 YEAR' : `${pricingObj.months} MONTHS`}
            </p>
          </div>
        ) : null}
      </div>

      {/* Feature List */}
      <div className="flex flex-col gap-3.5 mb-6 flex-1">
        <ul className="space-y-3">
          {featureList.length > 0 ? featureList.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#F1642E] shrink-0 fill-[#FFF2ED]" strokeWidth={2.2} />
              <div className="text-xs text-gray-700 font-medium flex items-center gap-1.5">
                <span>{feature.label}</span>
                {feature.value && <span className="font-bold text-gray-900">{feature.value}</span>}
              </div>
            </li>
          )) : (
            <li className="text-xs text-gray-500">Standard features included</li>
          )}
        </ul>
      </div>

      {/* Footer Link & Action Button */}
      <div className="mt-auto pt-2">
        <button 
          type="button"
          className="text-xs text-gray-500 font-semibold w-full text-center hover:text-[#F1642E] transition-colors mb-4 cursor-pointer"
        >
          View all features
        </button>

        <a 
          href={isCurrentPlan ? undefined : ctaLink}
          target={isCurrentPlan ? undefined : "_blank"}
          rel="noopener noreferrer"
          className={`block w-full ${isCurrentPlan ? 'pointer-events-none' : ''}`}
        >
          <button 
            type="button"
            disabled={isCurrentPlan}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer
              ${isCurrentPlan 
                ? 'bg-[#F4F4F5] text-gray-400' 
                : isFree
                  ? 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm'
                  : plan.badge === 'POPULAR'
                    ? 'bg-[#F1642E] hover:bg-[#d95627] text-white shadow-md'
                    : isContactSales
                      ? 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 shadow-sm'
                      : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 shadow-sm'
              }
            `}
          >
            {ctaLabel}
          </button>
        </a>
      </div>
    </div>
  );
}
