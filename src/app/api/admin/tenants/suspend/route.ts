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
  const festivalId = formData.get('festivalId') as string;
  const reason = formData.get('reason') as string;

  if (festivalId && reason) {
    await prisma.festival.update({
      where: { id: festivalId },
      data: { suspended: true, suspendedReason: reason }
    });
    
    await logPlatformAction('festival.suspend', 'festival', festivalId, { reason });
  }

  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
