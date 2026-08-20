'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function checkOrganizerAccess(festivalId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');
  
  if (session.user.role === 'SUPER_ADMIN') return session.user;

  const role = await prisma.userRole.findFirst({
    where: {
      userId: session.user.id,
      festivalId
    }
  });

  const isCoOrganizer = await prisma.festivalOrganizer.findFirst({
    where: {
      festivalId,
      organizer: { userId: session.user.id }
    }
  });

  if (!role && !isCoOrganizer) throw new Error('Forbidden');
  return session.user;
}

// ================= Categories =================

export async function createCategory(festivalId: string, data: { name: string, candidateMaxPoints: number, teamMaxPoints: number }) {
  await checkOrganizerAccess(festivalId);
  await prisma.category.create({
    data: {
      festivalId,
      name: data.name,
      candidateMaxPoints: data.candidateMaxPoints,
      teamMaxPoints: data.teamMaxPoints,
    }
  });
  revalidatePath(`/organizer/${festivalId}/competitions/categories`);
}

export async function createSection(festivalId: string, categoryId: string, data: { name: string, classification: string }) {
  await checkOrganizerAccess(festivalId);
  await prisma.section.create({
    data: {
      categoryId,
      name: data.name,
      classification: data.classification
    }
  });
  revalidatePath(`/organizer/${festivalId}/settings/categories`);
}

export async function updateCategory(festivalId: string, id: string, data: { name: string, candidateMaxPoints: number, teamMaxPoints: number }) {
  await checkOrganizerAccess(festivalId);
  await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      candidateMaxPoints: data.candidateMaxPoints,
      teamMaxPoints: data.teamMaxPoints,
    }
  });
  revalidatePath(`/organizer/${festivalId}/settings/categories`);
}

export async function deleteCategory(festivalId: string, id: string) {
  await checkOrganizerAccess(festivalId);
  
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { programmes: true, candidates: true }
      }
    }
  });

  if (!category) throw new Error("Category not found");

  if (category._count.programmes > 0 || category._count.candidates > 0) {
    throw new Error(`Cannot delete this category because it contains ${category._count.programmes} programmes and ${category._count.candidates} candidates. Please remove them first.`);
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath(`/organizer/${festivalId}/settings/categories`);
}

export async function updateSection(festivalId: string, id: string, data: { name: string, classification: string }) {
  await checkOrganizerAccess(festivalId);
  await prisma.section.update({
    where: { id },
    data: {
      name: data.name,
      classification: data.classification
    }
  });
  revalidatePath(`/organizer/${festivalId}/settings/categories`);
}

export async function deleteSection(festivalId: string, id: string) {
  await checkOrganizerAccess(festivalId);
  await prisma.section.delete({ where: { id } });
  revalidatePath(`/organizer/${festivalId}/settings/categories`);
}

// ================= Teams =================

export async function createTeam(festivalId: string, data: { name: string }) {
  await checkOrganizerAccess(festivalId);
  await prisma.team.create({
    data: {
      festivalId,
      name: data.name
    }
  });
  revalidatePath(`/organizer/${festivalId}/settings/teams`);
}

export async function updateTeam(festivalId: string, id: string, data: { name: string }) {
  await checkOrganizerAccess(festivalId);
  await prisma.team.update({
    where: { id },
    data: { name: data.name }
  });
  revalidatePath(`/organizer/${festivalId}/settings/teams`);
}

export async function deleteTeam(festivalId: string, id: string) {
  await checkOrganizerAccess(festivalId);
  
  const team = await prisma.team.findUnique({
    where: { id },
    include: { _count: { select: { candidates: true } } }
  });
  
  if (!team) throw new Error("Team not found");
  
  if (team._count.candidates > 0) {
    throw new Error(`Cannot delete this team because it contains ${team._count.candidates} candidates. Please remove them first.`);
  }

  await prisma.team.delete({ where: { id } });
  revalidatePath(`/organizer/${festivalId}/settings/teams`);
}

// ================= Position Criteria =================

export async function createPositionCriteria(festivalId: string, data: { name: string, positions: { position: number, points: number }[] }) {
  await checkOrganizerAccess(festivalId);
  await prisma.positionCriteria.create({
    data: {
      festivalId,
      name: data.name,
      positions: data.positions
    }
  });
  revalidatePath(`/organizer/${festivalId}/settings/positions`);
}

export async function updatePositionCriteria(festivalId: string, id: string, data: { name: string, positions: { position: number, points: number }[] }) {
  await checkOrganizerAccess(festivalId);
  await prisma.positionCriteria.update({
    where: { id },
    data: {
      name: data.name,
      positions: data.positions
    }
  });
  revalidatePath(`/organizer/${festivalId}/settings/positions`);
}

export async function deletePositionCriteria(festivalId: string, id: string) {
  await checkOrganizerAccess(festivalId);
  await prisma.positionCriteria.delete({
    where: { id }
  });
  revalidatePath(`/organizer/${festivalId}/settings/positions`);
}

// ================= Grade Criteria =================

export async function createGradeCriteria(festivalId: string, data: { name: string, grades: { grade: string, points: number, minPercent: number, maxPercent: number }[] }) {
  await checkOrganizerAccess(festivalId);
  await prisma.gradeCriteria.create({
    data: {
      festivalId,
      name: data.name,
      grades: data.grades
    }
  });
  revalidatePath(`/organizer/${festivalId}/settings/grades`);
}

// ================= Chest Number Rules =================

export async function createChestNumberRule(festivalId: string, data: { code: string, priority: number, teamScope: string, categoryScope: string, prefix?: string, startAt: number }) {
  await checkOrganizerAccess(festivalId);
  await prisma.chestNumberRule.create({
    data: {
      festivalId,
      code: data.code,
      priority: data.priority,
      teamScope: data.teamScope,
      categoryScope: data.categoryScope,
      prefix: data.prefix,
      startAt: data.startAt
    }
  });
  revalidatePath(`/organizer/${festivalId}/settings/chest-numbers`);
}

export async function toggleAutoGenerateChestNumbers(festivalId: string, enabled: boolean) {
  await checkOrganizerAccess(festivalId);
  await prisma.festival.update({
    where: { id: festivalId },
    data: { chestNumberAutoGenerate: enabled }
  });
  revalidatePath(`/organizer/${festivalId}/settings/chest-numbers`);
}

// ================= Programmes =================

export async function createProgramme(festivalId: string, data: { name: string, code: string, categoryId: string, type: 'INDIVIDUAL' | 'GROUP', judgmentMethod: 'MANUAL_SCORE' | 'POSITION_ONLY' | 'GRADE_ONLY', venueId?: string, scheduledAt?: string }) {
  await checkOrganizerAccess(festivalId);
  await prisma.programme.create({
    data: {
      festivalId,
      name: data.name,
      code: data.code,
      categoryId: data.categoryId,
      type: data.type,
      judgmentMethod: data.judgmentMethod,
      venueId: data.venueId || null,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      status: 'DRAFT'
    }
  });
  revalidatePath(`/organizer/${festivalId}/programmes`);
}

// ================= Curbs =================

export async function updateCurbs(festivalId: string, programmeId: string, data: { maxEntriesPerTeam?: number, maxEntriesPerCategory?: number, maxPointsPerCandidate?: number, maxPointsPerTeam?: number }) {
  await checkOrganizerAccess(festivalId);
  const existing = await prisma.curb.findFirst({ where: { programmeId } });
  if (existing) {
    await prisma.curb.update({
      where: { id: existing.id },
      data
    });
  } else {
    await prisma.curb.create({
      data: {
        programmeId,
        ...data
      }
    });
  }
  revalidatePath(`/organizer/${festivalId}/programmes/${programmeId}`);
}

// ================= Registrations =================

export async function createRegistration(festivalId: string, programmeId: string, candidateId: string, topicTitle?: string) {
  await checkOrganizerAccess(festivalId);
  
  const festival = await prisma.festival.findUnique({ where: { id: festivalId }});
  
  // Enforce curbs server-side
  const curb = await prisma.curb.findFirst({ where: { programmeId } });
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId }, include: { registrations: { include: { programme: { include: { category: true } } } } } });
  const programme = await prisma.programme.findUnique({ where: { id: programmeId }, include: { category: true } });
  
  if (!candidate || !programme) throw new Error('Invalid candidate or programme');

  if (curb) {
    if (curb.maxEntriesPerTeam && candidate.teamId) {
      const teamRegs = await prisma.registration.count({
        where: { programmeId, candidate: { teamId: candidate.teamId } }
      });
      if (teamRegs >= curb.maxEntriesPerTeam) {
        throw new Error(`Team limit reached for this programme (${curb.maxEntriesPerTeam})`);
      }
    }
    if (curb.maxEntriesPerCategory) {
      const catRegs = await prisma.registration.count({
        where: { programme: { categoryId: programme.categoryId }, candidateId }
      });
      if (catRegs >= curb.maxEntriesPerCategory) {
        throw new Error(`Category entry limit reached for this candidate (${curb.maxEntriesPerCategory})`);
      }
    }
    if (curb.maxPointsPerCandidate) {
       let currentPoints = candidate.registrations.reduce((acc, r) => acc + (r.programme.category.candidateMaxPoints || 0), 0);
       if (currentPoints + (programme.category.candidateMaxPoints || 0) > curb.maxPointsPerCandidate) {
         throw new Error(`Max points per candidate reached (${curb.maxPointsPerCandidate})`);
       }
    }
  }

  // Ensure candidate isn't already registered
  const existingReg = await prisma.registration.findFirst({
    where: { programmeId, candidateId }
  });
  if (existingReg) throw new Error('Candidate already registered for this programme');

  // Chest Number Logic
  if (festival?.chestNumberAutoGenerate && !candidate.chestNumber) {
    const rules = await prisma.chestNumberRule.findMany({
      where: { festivalId },
      orderBy: { priority: 'desc' }
    });
    const rule = rules[0];
    if (rule) {
      const totalCandidates = await prisma.candidate.count({ where: { festivalId, chestNumber: { not: null } }});
      const num = rule.startAt + totalCandidates;
      const chestStr = `${rule.prefix || ''}${num}`;
      await prisma.candidate.update({
        where: { id: candidateId },
        data: { chestNumber: chestStr }
      });
    }
  }

  await prisma.registration.create({
    data: {
      programmeId,
      candidateId,
      topicTitle: topicTitle || null
    }
  });
  revalidatePath(`/organizer/${festivalId}/programmes/${programmeId}`);
}

export async function substituteCandidate(festivalId: string, registrationId: string, newCandidateId: string) {
  await checkOrganizerAccess(festivalId);
  const reg = await prisma.registration.findUnique({ where: { id: registrationId }});
  if (!reg) throw new Error("Registration not found");
  
  const existing = await prisma.registration.findFirst({
    where: { programmeId: reg.programmeId, candidateId: newCandidateId }
  });
  if (existing) throw new Error("New candidate already registered");

  await prisma.registration.update({
    where: { id: registrationId },
    data: { 
      substitutedForId: reg.candidateId,
      candidateId: newCandidateId 
    }
  });
  
  revalidatePath(`/organizer/${festivalId}/programmes/${reg.programmeId}`);
}

export async function deleteRegistration(festivalId: string, registrationId: string) {
  await checkOrganizerAccess(festivalId);
  const reg = await prisma.registration.findUnique({ where: { id: registrationId }});
  if (!reg) throw new Error("Registration not found");

  await prisma.registration.delete({
    where: { id: registrationId }
  });

  revalidatePath(`/organizer/${festivalId}/programmes/${reg.programmeId}`);
}

