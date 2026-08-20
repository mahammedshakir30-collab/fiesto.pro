import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const defaultPassword = await bcrypt.hash('password123', 10);

    // 1. Create Super Admin User
    const superAdminUser = await prisma.user.upsert({
      where: { email: 'admin2@fiesto.app' },
      update: { password: defaultPassword },
      create: {
        id: 'user_admin2',
        email: 'admin2@fiesto.app',
        firstName: 'System',
        lastName: 'Admin',
        password: defaultPassword,
        role: 'SUPER_ADMIN',
      }
    });

    await prisma.platformUser.upsert({
      where: { userId: superAdminUser.id },
      update: { role: 'SUPER_ADMIN' },
      create: { userId: superAdminUser.id, role: 'SUPER_ADMIN' }
    });

    // 2. Create Plan
    const proPlan = await prisma.planTier.upsert({
      where: { name: 'Pro Plan' },
      update: {},
      create: {
        id: 'plan_pro',
        name: 'Pro Plan',
        monthlyPrice: 99,
        featureEntitlements: JSON.stringify({ competitionMode: true, vendorLeaderboard: true }),
      }
    });

    // 3. Create Organizer User
    const orgUser = await prisma.user.upsert({
      where: { email: 'organizer2@fiesto.app' },
      update: { password: defaultPassword },
      create: {
        id: 'user_org2',
        email: 'organizer2@fiesto.app',
        firstName: 'John',
        lastName: 'Organizer',
        password: defaultPassword,
        role: 'ORGANIZER',
      }
    });

    const organizer = await prisma.organizer.upsert({
      where: { id: 'org_main2' },
      update: { userId: orgUser.id },
      create: {
        id: 'org_main2',
        userId: orgUser.id,
        companyName: 'Neon Nights Productions',
        contactEmail: 'hello@neonnights.com',
        verified: true
      }
    });

    // 4. Create Festival
    const festival = await prisma.festival.upsert({
      where: { slug: 'neon-nights-2026-2' },
      update: { competitionModeEnabled: true, vendorLeaderboardEnabled: true, planTierId: proPlan.id },
      create: {
        id: 'fst_neon2',
        name: 'Neon Nights Festival 2026',
        slug: 'neon-nights-2026-2',
        description: 'A spectacular music and arts festival in the desert.',
        location: 'Desert Oasis, NV',
        startDate: new Date('2026-10-15'),
        endDate: new Date('2026-10-18'),
        status: 'LIVE',
        competitionModeEnabled: true,
        vendorLeaderboardEnabled: true,
        planTierId: proPlan.id
      }
    });

    await prisma.festivalOrganizer.upsert({
      where: { festivalId_organizerId: { festivalId: festival.id, organizerId: organizer.id } },
      update: { isOwner: true },
      create: { festivalId: festival.id, organizerId: organizer.id, isOwner: true }
    });

    // 5. Create Vendor
    const vendorUser = await prisma.user.upsert({
      where: { email: 'vendor2@fiesto.app' },
      update: { password: defaultPassword },
      create: {
        id: 'user_vendor2',
        email: 'vendor2@fiesto.app',
        firstName: 'Alice',
        lastName: 'Vendor',
        password: defaultPassword,
        role: 'VENDOR',
      }
    });

    const vendorProfile = await prisma.vendor.upsert({
      where: { id: 'ven_12' },
      update: {},
      create: {
        id: 'ven_12',
        festivalId: festival.id,
        userId: vendorUser.id,
        name: 'Spicy Tacos',
        description: 'Best tacos in the festival!',
        status: 'APPROVED',
        category: 'FOOD'
      }
    });

    await prisma.vendorProfile.upsert({
      where: { vendorId: vendorProfile.id },
      update: {},
      create: {
        vendorId: vendorProfile.id,
        businessName: 'Spicy Tacos LLC',
        contactEmail: 'hello@spicytacos.com',
        contactPhone: '555-0100',
        boothPhotos: '[]'
      }
    });

    // 6. Create Judge
    const judgeUser = await prisma.user.upsert({
      where: { email: 'judge2@fiesto.app' },
      update: { password: defaultPassword },
      create: {
        id: 'user_judge2',
        email: 'judge2@fiesto.app',
        firstName: 'Bob',
        lastName: 'Judge',
        password: defaultPassword,
        role: 'ATTENDEE',
      }
    });

    const category = await prisma.category.upsert({
      where: { festivalId_name: { festivalId: festival.id, name: 'Dance' } },
      update: {},
      create: {
        id: 'cat_dance2',
        festivalId: festival.id,
        name: 'Dance',
        candidateMaxPoints: 100,
        teamMaxPoints: 100
      }
    });

    const programme = await prisma.programme.upsert({
      where: { festivalId_code: { festivalId: festival.id, code: 'DN01' } },
      update: {},
      create: {
        id: 'prog_12',
        festivalId: festival.id,
        categoryId: category.id,
        name: 'Solo Dance Freestyle',
        code: 'DN01',
        status: 'published'
      }
    });


    return NextResponse.json({
      success: true,
      data: {
        festivalId: festival.id,
        vendorId: vendorProfile.id,
        superAdminUrl: 'http://localhost:3000/admin',
        organizerUrl: `http://localhost:3000/organizer/${festival.id}`,
        vendorUrl: `http://localhost:3000/vendor/${vendorProfile.id}`,
        judgeUrl: `http://localhost:3000/judge/${festival.id}`,
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
