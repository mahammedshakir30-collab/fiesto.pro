import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { festivalId, requestedPlanId, currentPlanId } = body;

    if (!festivalId || !requestedPlanId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Since PlatformAuditLog requires actorId (PlatformUser.id), but this is triggered by an Organizer,
    // we will log this using a system actor or log it specifically as an intent.
    // Let's create an audit log with actorId as the Organizer's userId, even if it's not a PlatformUser.
    
    // Check if a platform user exists for this user, if not we will just use their userId.
    
    await prisma.platformAuditLog.create({
      data: {
        actorId: session.user.id, // Organizer ID
        action: 'upgrade_whatsapp_clicked',
        targetType: 'festival',
        targetId: festivalId,
        metadata: {
          requestedPlanId,
          currentPlanId,
          userId: session.user.id,
          userEmail: session.user.email
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging upgrade intent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
