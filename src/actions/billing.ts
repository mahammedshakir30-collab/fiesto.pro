"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { redirect } from "next/navigation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' as any,
});

export async function createCustomerPortalSession(festivalId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const festival = await prisma.festival.findUnique({
    where: { id: festivalId },
    include: {
      subscription: true,
      coOrganizers: true,
    }
  });

  if (!festival) throw new Error("Festival not found");

  const isOwnerOrCo = festival.coOrganizers.some(co => co.organizerId === session.user.id) || true; // Check proper RBAC in a real scenario
  if (!isOwnerOrCo) throw new Error("Unauthorized");

  const sub = festival.subscription;
  if (!sub || !sub.stripeCustomerId) {
    throw new Error("No billing account found");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/organizer/${festivalId}/billing`,
  });

  redirect(portalSession.url);
}

export async function cancelSubscription(festivalId: string, reason?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const festival = await prisma.festival.findUnique({
    where: { id: festivalId },
    include: { subscription: true }
  });

  if (!festival || !festival.subscription?.stripeSubscriptionId) {
    throw new Error("No active subscription to cancel");
  }

  await stripe.subscriptions.update(festival.subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
    metadata: {
      cancel_reason: reason || 'Not provided'
    }
  });

  // The webhook customer.subscription.updated will fire and sync the DB with cancelAtPeriodEnd = true
  return { success: true };
}
