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
  
  const platformName = formData.get('platformName') as string;
  const supportEmail = formData.get('supportEmail') as string;
  const defaultTrialDays = parseInt(formData.get('defaultTrialDays') as string, 10);
  const termsOfServiceUrl = formData.get('termsOfServiceUrl') as string;
  const privacyPolicyUrl = formData.get('privacyPolicyUrl') as string;

  await prisma.platformSettings.update({
    where: { id: 'singleton' },
    data: {
      platformName,
      supportEmail,
      defaultTrialDays,
      termsOfServiceUrl,
      privacyPolicyUrl
    }
  });

  await logPlatformAction('settings.update', 'platform', 'singleton');

  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
