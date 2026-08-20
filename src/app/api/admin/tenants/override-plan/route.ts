import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    const platformUser = await prisma.platformUser.findUnique({
      where: { userId: session.user.id }
    });

    if (platformUser?.role !== 'SUPER_ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const formData = await req.formData();
    const festivalId = formData.get('festivalId') as string;
    const planTierId = formData.get('planTierId') as string;

    if (!festivalId || !planTierId) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    // Upsert subscription to ACTIVE and set planTier
    await prisma.subscription.upsert({
      where: { festivalId },
      update: {
        status: 'ACTIVE',
        planTierId,
      },
      create: {
        festivalId,
        planTierId,
        status: 'ACTIVE',
        stripeCustomerId: 'manual_override',
      }
    });

    // Update festival plan
    await prisma.festival.update({
      where: { id: festivalId },
      data: { planTierId }
    });

    // Log the audit event
    await prisma.platformAuditLog.create({
      data: {
        actorId: platformUser.id,
        action: 'plan.override',
        targetType: 'festival',
        targetId: festivalId,
        metadata: { planTierId }
      }
    });

    return NextResponse.redirect(new URL(`/admin/tenants/${festivalId}`, req.url), 303);
  } catch (error) {
    console.error('Plan override error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
