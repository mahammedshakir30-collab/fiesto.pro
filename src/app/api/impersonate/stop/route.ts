import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logPlatformAction } from '@/lib/audit';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.redirect(new URL('/admin', req.url), 303);
  }

  const platformUser = await prisma.platformUser.findUnique({
    where: { userId: session.user.id }
  });

  if (!platformUser) {
    return NextResponse.redirect(new URL('/admin', req.url), 303);
  }

  const cookieStore = cookies();
  const targetId = cookieStore.get('festos_impersonate_festival')?.value;
  
  cookieStore.delete('festos_impersonate_festival');

  if (targetId) {
    await logPlatformAction('impersonate.stop', 'festival', targetId);
  }

  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
