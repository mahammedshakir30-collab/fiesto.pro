import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logPlatformAction } from '@/lib/audit';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const platformUser = await prisma.platformUser.findUnique({
    where: { userId: session.user.id }
  });

  if (!platformUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await req.formData(); const festivalId = formData.get('festivalId') as string;

  if (!festivalId) {
    return NextResponse.json({ error: 'Missing festivalId' }, { status: 400 });
  }

  const cookieStore = cookies();
  cookieStore.set('festos_impersonate_festival', festivalId, {
    path: '/',
    maxAge: 60 * 60, // 1 hour time limit
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  await logPlatformAction('impersonate.start', 'festival', festivalId);

  return NextResponse.json({ success: true, redirect: `/organizer/${festivalId}` });
}
