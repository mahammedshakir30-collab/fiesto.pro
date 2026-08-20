import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { notifyUsersByPermission } from '@/lib/notification-router';

// Make sure to configure Next.js to not parse the body for this route so we can verify the signature
// wait, Next.js App Router API route parses text fine with req.text()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (!session.metadata?.festivalId || !session.metadata?.planTierId) break;

        const festivalId = session.metadata.festivalId;
        const planTierId = session.metadata.planTierId;

        // Upsert Subscription
        await prisma.subscription.upsert({
          where: { festivalId },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: 'ACTIVE',
            planTierId,
          },
          create: {
            festivalId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: 'ACTIVE',
            planTierId,
          }
        });

        // Update festival
        await prisma.festival.update({
          where: { id: festivalId },
          data: { planTierId }
        });

        // Convert Referral if exists
        const referral = await prisma.referral.findUnique({
          where: { referredFestivalId: festivalId }
        });

        if (referral && referral.status === 'PENDING') {
          await prisma.referral.update({
            where: { id: referral.id },
            data: { 
              status: 'CONVERTED',
              convertedAt: new Date()
            }
          });
        }

        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        
        let status: any = 'ACTIVE';
        if (subscription.status === 'past_due') status = 'PAST_DUE';
        if (subscription.status === 'canceled') status = 'CANCELED';
        if (subscription.status === 'incomplete') status = 'INCOMPLETE';
        if (subscription.status === 'trialing') status = 'TRIALING';

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        });

        if (status === 'ACTIVE') {
          const sub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscription.id }
          });
          if (sub) {
            const referral = await prisma.referral.findUnique({
              where: { referredFestivalId: sub.festivalId }
            });
            if (referral && referral.status === 'PENDING') {
              await prisma.referral.update({
                where: { id: referral.id },
                data: { status: 'CONVERTED', convertedAt: new Date() }
              });
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'CANCELED' }
          });
          
          // Entitlement revocation can be complex. In Phase 10 logic, simply setting it CANCELED 
          // makes plan checks fail or downgrades to a free tier. We don't remove planTierId so the record of what they had is kept,
          // or we can remove it. Let's keep it but `status` will be checked by middleware/RBAC.
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;
        
        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId }
        });

        if (sub) {
          await prisma.invoice.upsert({
            where: { stripeInvoiceId: invoice.id },
            update: {
              amountPaid: invoice.amount_paid / 100,
              status: 'paid',
              pdfUrl: invoice.hosted_invoice_url,
              issuedAt: new Date(invoice.created * 1000),
            },
            create: {
              festivalId: sub.festivalId,
              stripeInvoiceId: invoice.id,
              amountPaid: invoice.amount_paid / 100,
              status: 'paid',
              pdfUrl: invoice.hosted_invoice_url,
              issuedAt: new Date(invoice.created * 1000),
            }
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId }
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'PAST_DUE' }
          });

          await prisma.invoice.upsert({
            where: { stripeInvoiceId: invoice.id },
            update: {
              amountPaid: invoice.amount_paid / 100,
              status: 'failed',
              pdfUrl: invoice.hosted_invoice_url,
              issuedAt: new Date(invoice.created * 1000),
            },
            create: {
              festivalId: sub.festivalId,
              stripeInvoiceId: invoice.id,
              amountPaid: invoice.amount_paid / 100,
              status: 'failed',
              pdfUrl: invoice.hosted_invoice_url,
              issuedAt: new Date(invoice.created * 1000),
            }
          });

          // Notify organizer
          await notifyUsersByPermission({
            festivalId: sub.festivalId,
            resource: 'finance', // assuming 'finance' or similar
            action: 'view',
            title: 'Payment Failed',
            body: 'Your subscription payment failed. Please update your payment method to avoid service interruption.',
            type: 'ACTION_REQUIRED',
            link: `/organizer/${sub.festivalId}/billing`
          });
        }
        break;
      }

      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Webhook handler error:`, err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
