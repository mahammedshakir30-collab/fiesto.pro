import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logPlatformAction } from '@/lib/audit';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL('/admin', req.url), 303);

  const platformUser = await prisma.platformUser.findUnique({
    where: { userId: session.user.id }
  });

  if (platformUser?.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/admin', req.url), 303);
  }

  const formData = await req.formData();
  const planId = formData.get('planId') as string;
  const active = formData.get('active') === 'true';

  if (planId) {
    await prisma.planTier.update({
      where: { id: planId },
      data: { active }
    });
    
    await logPlatformAction('plan.toggle_active', 'plan', planId, { active });
  }

  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
