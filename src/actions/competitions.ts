'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function toggleCompetitionMode(festivalId: string, enabled: boolean) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  // Verify permissions (must be festival owner/admin)
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId: session.user.id,
      festivalId: festivalId,
      role: {
        permissions: {
          some: {
            resource: 'festival_settings',
            action: 'edit'
          }
        }
      }
    }
  });

  const isCoOrganizer = await prisma.festivalOrganizer.findFirst({
    where: {
      festivalId,
      organizer: {
        userId: session.user.id
      }
    }
  });

  if (!userRole && !isCoOrganizer && session.user.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden');
  }

  await prisma.festival.update({
    where: { id: festivalId },
    data: { competitionModeEnabled: enabled }
  });

  revalidatePath(`/organizer/${festivalId}`);
}
