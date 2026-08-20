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
  const key = formData.get('key') as string;
  const enabled = formData.get('enabled') === 'true';

  if (key) {
    await prisma.globalFeatureFlag.update({
      where: { key },
      data: { enabled }
    });
    
    await logPlatformAction('flag.toggle', 'flag', key, { enabled });
  }

  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
