'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Validates that the current user is authenticated and is the Leader of a team for this festival.
 */
export async function validateLeaderAccess(festivalId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized. Please log in.');
  }

  // Check if user is super admin (bypass)
  if (session.user.role === 'SUPER_ADMIN') {
    const team = await prisma.team.findFirst({
      where: { festivalId },
      include: { festival: true }
    });
    if (!team) throw new Error('No team found for this festival.');
    return { session, team };
  }

  const team = await prisma.team.findFirst({
    where: {
      festivalId,
      leaderId: session.user.id
    },
    include: {
      festival: true
    }
  });

  if (!team) {
    throw new Error('Forbidden: You are not a registered Team Leader for this festival.');
  }

  return { session, team };
}

/**
 * Resolves the next chest number based on the festival's active ChestNumberRules.
 */
export async function resolveNextChestNumber(festivalId: string, teamId?: string, categoryId?: string) {
  const festival = await prisma.festival.findUnique({
    where: { id: festivalId },
    select: { chestNumberAutoGenerate: true }
  });

  if (!festival?.chestNumberAutoGenerate) {
    return { autoGenerate: false, nextChestNumber: null, ruleName: null };
  }

  // Fetch all active rules ordered by priority
  const rules = await prisma.chestNumberRule.findMany({
    where: { festivalId },
    orderBy: { priority: 'desc' }
  });

  if (rules.length === 0) {
    // Default incremental fallback
    const candidateCount = await prisma.candidate.count({
      where: { festivalId, chestNumber: { not: null } }
    });
    return { autoGenerate: true, nextChestNumber: String(100 + candidateCount + 1), ruleName: 'Default Increment' };
  }

  // Find matching rule based on scope (teamScope and categoryScope)
  let matchingRule = rules.find(r => {
    const teamMatch = r.teamScope === 'all' || (teamId && r.teamScope === teamId);
    const catMatch = r.categoryScope === 'all' || (categoryId && r.categoryScope === categoryId);
    return teamMatch && catMatch;
  });

  if (!matchingRule) {
    matchingRule = rules[0];
  }

  // Count candidates already generated under this rule's scope
  const existingCandidatesWithChest = await prisma.candidate.count({
    where: {
      festivalId,
      chestNumber: { not: null },
      ...(matchingRule.teamScope !== 'all' ? { teamId: matchingRule.teamScope } : {}),
      ...(matchingRule.categoryScope !== 'all' ? { categoryId: matchingRule.categoryScope } : {})
    }
  });

  const nextSeq = matchingRule.startAt + existingCandidatesWithChest;
  const nextChestNumber = `${matchingRule.prefix || ''}${nextSeq}`;

  return {
    autoGenerate: true,
    nextChestNumber,
    ruleName: matchingRule.code
  };
}

/**
 * Public action for client preview of next chest number
 */
export async function getNextChestNumberPreview(festivalId: string, categoryId?: string) {
  const { team } = await validateLeaderAccess(festivalId);
  return await resolveNextChestNumber(festivalId, team.id, categoryId);
}

/**
 * Optimized Dashboard Data Fetcher
 */
export async function getLeaderDashboardData(festivalId: string) {
  const { team } = await validateLeaderAccess(festivalId);

  const [candidates, programmes, festival] = await Promise.all([
    prisma.candidate.findMany({
      where: { festivalId, teamId: team.id },
      include: {
        category: true,
        registrations: {
          include: {
            programme: {
              include: { category: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.programme.findMany({
      where: { festivalId },
      include: {
        category: true,
        curbs: true,
        registrations: {
          where: {
            candidate: { teamId: team.id }
          },
          include: {
            candidate: true
          }
        }
      },
      orderBy: { code: 'asc' }
    }),
    prisma.festival.findUnique({
      where: { id: festivalId },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        location: true,
        status: true,
        competitionModeEnabled: true,
        chestNumberAutoGenerate: true
      }
    })
  ]);

  const totalCandidates = candidates.length;
  const totalRegistrations = candidates.reduce((acc, c) => acc + c.registrations.length, 0);
  const registeredProgrammesCount = programmes.filter(p => p.registrations.length > 0).length;

  return {
    team,
    festival,
    stats: {
      totalCandidates,
      totalRegistrations,
      totalProgrammes: programmes.length,
      registeredProgrammesCount
    },
    candidates,
    programmes
  };
}

/**
 * Optimized Registrations Data Fetcher
 */
export async function getLeaderRegistrationsData(festivalId: string) {
  const { team } = await validateLeaderAccess(festivalId);

  const [programmes, categories, teamCandidates] = await Promise.all([
    prisma.programme.findMany({
      where: { festivalId },
      include: {
        category: true,
        curbs: true,
        registrations: {
          where: {
            candidate: { teamId: team.id }
          },
          include: {
            candidate: {
              include: { category: true }
            }
          }
        }
      },
      orderBy: { code: 'asc' }
    }),
    prisma.category.findMany({
      where: { festivalId },
      orderBy: { name: 'asc' }
    }),
    prisma.candidate.findMany({
      where: { festivalId, teamId: team.id },
      include: {
        category: true,
        registrations: {
          include: {
            programme: {
              include: { category: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })
  ]);

  return {
    team,
    programmes,
    categories,
    teamCandidates
  };
}

/**
 * Register Candidate for Programme with Strict Shared Curb Enforcement
 */
export async function registerCandidateForProgramme(
  festivalId: string,
  programmeId: string,
  candidateId: string,
  topicTitle?: string
) {
  const { team } = await validateLeaderAccess(festivalId);

  // 1. Fetch candidate with existing registrations
  const candidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      festivalId,
      teamId: team.id
    },
    include: {
      category: true,
      registrations: {
        include: {
          programme: {
            include: { category: true }
          }
        }
      }
    }
  });

  if (!candidate) {
    throw new Error('Candidate not found in your team roster.');
  }

  // 2. Fetch programme, category, and curbs
  const programme = await prisma.programme.findUnique({
    where: { id: programmeId },
    include: {
      category: true,
      curbs: true,
      registrations: {
        where: {
          candidate: { teamId: team.id }
        },
        include: {
          candidate: true
        }
      }
    }
  });

  if (!programme) {
    throw new Error('Programme not found.');
  }

  // 3. Category match check
  if (programme.categoryId !== candidate.categoryId) {
    const isGeneral = 
      programme.category.name.toLowerCase().includes('general') || 
      candidate.category.name.toLowerCase().includes('general');
    
    if (!isGeneral) {
      throw new Error(`Category mismatch: "${programme.name}" is restricted to "${programme.category.name}", but candidate is enrolled in "${candidate.category.name}".`);
    }
  }

  // 4. Strict Curb Validation
  const curb = programme.curbs[0]; // Curb associated with programme
  if (curb) {
    // 4a. Max entries per team
    if (curb.maxEntriesPerTeam !== null && curb.maxEntriesPerTeam !== undefined) {
      const teamRegsCount = programme.registrations.length;
      if (teamRegsCount >= curb.maxEntriesPerTeam) {
        throw new Error(`This programme allows a maximum of ${curb.maxEntriesPerTeam} entries per team — ${team.name} has already registered ${teamRegsCount}.`);
      }
    }

    // 4b. Max entries per category for this candidate
    if (curb.maxEntriesPerCategory !== null && curb.maxEntriesPerCategory !== undefined) {
      const candidateCatRegsCount = candidate.registrations.filter(
        r => r.programme.categoryId === programme.categoryId
      ).length;
      if (candidateCatRegsCount >= curb.maxEntriesPerCategory) {
        throw new Error(`Category entry limit reached: Candidate ${candidate.name} is already registered for ${candidateCatRegsCount} events in category "${programme.category.name}" (Max: ${curb.maxEntriesPerCategory}).`);
      }
    }

    // 4c. Max points per candidate
    if (curb.maxPointsPerCandidate !== null && curb.maxPointsPerCandidate !== undefined) {
      const currentPoints = candidate.registrations.reduce(
        (acc, r) => acc + (r.programme.category.candidateMaxPoints || 0), 
        0
      );
      const incomingPoints = programme.category.candidateMaxPoints || 0;
      if (currentPoints + incomingPoints > curb.maxPointsPerCandidate) {
        throw new Error(`Points limit reached: Enrolling in this programme would exceed the candidate limit of ${curb.maxPointsPerCandidate} points (Current: ${currentPoints}, Programme: ${incomingPoints}).`);
      }
    }
  }

  // 5. Check if candidate is already registered
  const existing = await prisma.registration.findUnique({
    where: {
      programmeId_candidateId: {
        programmeId,
        candidateId
      }
    }
  });

  if (existing) {
    throw new Error(`Candidate "${candidate.name}" is already registered for this programme.`);
  }

  // 6. Create Registration
  await prisma.registration.create({
    data: {
      programmeId,
      candidateId,
      topicTitle: topicTitle?.trim() || null
    }
  });

  revalidatePath(`/leader/${festivalId}/registrations`);
  revalidatePath(`/leader/${festivalId}`);
  revalidatePath(`/leader/${festivalId}/candidates`);

  return { success: true };
}

/**
 * Unregister Candidate from Programme
 */
export async function unregisterCandidateFromProgramme(
  festivalId: string,
  registrationId: string
) {
  const { team } = await validateLeaderAccess(festivalId);

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { candidate: true }
  });

  if (!registration || registration.candidate.teamId !== team.id) {
    throw new Error('Unauthorized or registration not found.');
  }

  await prisma.registration.delete({
    where: { id: registrationId }
  });

  revalidatePath(`/leader/${festivalId}/registrations`);
  revalidatePath(`/leader/${festivalId}`);
  revalidatePath(`/leader/${festivalId}/candidates`);

  return { success: true };
}

/**
 * Create Candidate with Chest Number Rule & Unique Validation
 */
export async function createLeaderCandidate(
  festivalId: string,
  data: {
    name: string;
    categoryId: string;
    chestNumber?: string;
    gender?: string;
    photoUrl?: string;
  }
) {
  const { team } = await validateLeaderAccess(festivalId);

  if (!data.name?.trim() || !data.categoryId) {
    throw new Error('Name and Category are required.');
  }

  let finalChestNumber = data.chestNumber?.trim() ? data.chestNumber.trim() : null;

  // If no chest number was provided, attempt auto-generation from active rules
  if (!finalChestNumber) {
    const genResult = await resolveNextChestNumber(festivalId, team.id, data.categoryId);
    if (genResult.autoGenerate && genResult.nextChestNumber) {
      finalChestNumber = genResult.nextChestNumber;
    }
  }

  // Validate unique chest number across this festival
  if (finalChestNumber) {
    const existing = await prisma.candidate.findFirst({
      where: {
        festivalId,
        chestNumber: finalChestNumber
      },
      include: { team: true }
    });

    if (existing) {
      const teamInfo = existing.team?.name ? ` (Team: ${existing.team.name})` : '';
      throw new Error(`Chest Number "${finalChestNumber}" is already assigned to "${existing.name}"${teamInfo}. Please assign a different chest number.`);
    }
  }

  try {
    const candidate = await prisma.candidate.create({
      data: {
        festivalId,
        teamId: team.id,
        name: data.name.trim(),
        categoryId: data.categoryId,
        chestNumber: finalChestNumber || undefined,
        gender: data.gender || undefined,
        photoUrl: data.photoUrl?.trim() || undefined
      }
    });

    revalidatePath(`/leader/${festivalId}/candidates`);
    revalidatePath(`/leader/${festivalId}/registrations`);
    revalidatePath(`/leader/${festivalId}`);

    return { success: true, candidate };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw new Error(`Chest Number "${finalChestNumber}" is already in use by another candidate. Please choose a different number.`);
    }
    throw error;
  }
}

/**
 * Update Leader's Candidate
 */
export async function updateLeaderCandidate(
  festivalId: string,
  candidateId: string,
  data: {
    name: string;
    categoryId: string;
    chestNumber?: string;
    gender?: string;
    photoUrl?: string;
  }
) {
  const { team } = await validateLeaderAccess(festivalId);

  const existing = await prisma.candidate.findFirst({
    where: { id: candidateId, festivalId, teamId: team.id }
  });

  if (!existing) {
    throw new Error('Candidate not found in your team.');
  }

  const cleanChestNumber = data.chestNumber?.trim() ? data.chestNumber.trim() : null;

  if (cleanChestNumber) {
    const duplicate = await prisma.candidate.findFirst({
      where: {
        festivalId,
        chestNumber: cleanChestNumber,
        NOT: { id: candidateId }
      },
      include: { team: true }
    });

    if (duplicate) {
      const teamInfo = duplicate.team?.name ? ` (Team: ${duplicate.team.name})` : '';
      throw new Error(`Chest Number "${cleanChestNumber}" is already assigned to "${duplicate.name}"${teamInfo}. Please choose a different chest number.`);
    }
  }

  try {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        name: data.name.trim(),
        categoryId: data.categoryId,
        chestNumber: cleanChestNumber,
        gender: data.gender || null,
        photoUrl: data.photoUrl?.trim() || null
      }
    });

    revalidatePath(`/leader/${festivalId}/candidates`);
    revalidatePath(`/leader/${festivalId}/registrations`);
    revalidatePath(`/leader/${festivalId}`);

    return { success: true };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw new Error(`Chest Number "${cleanChestNumber}" is already in use by another candidate. Please choose a different number.`);
    }
    throw error;
  }
}

/**
 * Delete Leader's Candidate
 */
export async function deleteLeaderCandidate(
  festivalId: string,
  candidateId: string
) {
  const { team } = await validateLeaderAccess(festivalId);

  const existing = await prisma.candidate.findFirst({
    where: { id: candidateId, festivalId, teamId: team.id }
  });

  if (!existing) {
    throw new Error('Candidate not found in your team.');
  }

  await prisma.candidate.delete({
    where: { id: candidateId }
  });

  revalidatePath(`/leader/${festivalId}/candidates`);
  revalidatePath(`/leader/${festivalId}/registrations`);
  revalidatePath(`/leader/${festivalId}`);

  return { success: true };
}
