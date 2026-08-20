import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { notifyUsersByPermission } from '@/lib/notification-router';

// Vercel Cron or custom trigger hits this daily
export async function GET(req: Request) {
  // Simple auth check for cron if using a secret
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const today = startOfDay(new Date());

    // 1. Fetch all TRIALING subscriptions that have a currentPeriodEnd
    const trials = await prisma.subscription.findMany({
      where: {
        status: 'TRIALING',
        currentPeriodEnd: { not: null }
      },
      include: { festival: true }
    });

    const suspendedCount = 0;
    const notifiedCount = 0;

    for (const sub of trials) {
      if (!sub.currentPeriodEnd) continue;
      
      const periodEnd = startOfDay(new Date(sub.currentPeriodEnd));
      const daysLeft = differenceInDays(periodEnd, today);

      if (daysLeft < 0) {
        // Trial expired and no active subscription (since it's still TRIALING)
        // Suspend the festival
        await prisma.festival.update({
          where: { id: sub.festivalId },
          data: { 
            suspended: true,
            suspendedReason: 'TRIAL_EXPIRED'
          }
        });
        
        await notifyUsersByPermission({
          festivalId: sub.festivalId,
          resource: 'finance', // or global
          action: 'view',
          title: 'Trial Expired - Account Suspended',
          body: 'Your free trial has expired and your festival has been suspended. Please upgrade your plan to restore access.',
          type: 'ACTION_REQUIRED',
          link: `/organizer/${sub.festivalId}/billing`
        });
      } 
      else if (daysLeft === 0) {
        // Expires today
        await notifyUsersByPermission({
          festivalId: sub.festivalId,
          resource: 'finance',
          action: 'view',
          title: 'Trial Expires Today',
          body: 'Your trial expires today. Upgrade now to avoid service interruption.',
          type: 'ACTION_REQUIRED',
          link: `/organizer/${sub.festivalId}/billing`
        });
      }
      else if (daysLeft === 1) {
        // 1 day warning
        await notifyUsersByPermission({
          festivalId: sub.festivalId,
          resource: 'finance',
          action: 'view',
          title: 'Trial Expires Tomorrow',
          body: 'Your trial expires in 1 day. Upgrade to ensure your features stay active.',
          type: 'WARNING',
          link: `/organizer/${sub.festivalId}/billing`
        });
      }
      else if (daysLeft === 3) {
        // 3 days warning
        await notifyUsersByPermission({
          festivalId: sub.festivalId,
          resource: 'finance',
          action: 'view',
          title: 'Trial Expiring Soon',
          body: 'You have 3 days left on your trial. Check out our plans and upgrade.',
          type: 'WARNING',
          link: `/organizer/${sub.festivalId}/billing`
        });
      }
    }

    return NextResponse.json({ success: true, processed: trials.length });
  } catch (err: any) {
    console.error('Daily billing cron error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
