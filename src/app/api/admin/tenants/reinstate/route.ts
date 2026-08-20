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

  if (festivalId) {
    await prisma.festival.update({
      where: { id: festivalId },
      data: { suspended: false, suspendedReason: null }
    });
    
    await logPlatformAction('festival.reinstate', 'festival', festivalId);
  }

  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
