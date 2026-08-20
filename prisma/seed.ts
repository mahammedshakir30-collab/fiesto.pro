import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const mockUsers: any[] = [];
const mockOrganizers: any[] = [];
const mockFestivals: any[] = [];
const mockStages: any[] = [];
const mockArtists: any[] = [];
const mockLineupSlots: any[] = [];
const mockTicketTiers: any[] = [];
const mockOrders: any[] = [];
const mockAttendees: any[] = [];
const mockVendors: any[] = [];
const mockStaffMembers: any[] = [];
const mockAnnouncements: any[] = [];
import { prisma } from '../src/lib/prisma';
async function main() {
  console.log('Starting seed...');

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1a. Core Test Users
  const testUsers = [
    { id: 'test_admin', email: 'superadmin@fiesto.app', firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN' },
    { id: 'test_org', email: 'organizer@fiesto.app', firstName: 'Test', lastName: 'Organizer', role: 'ORGANIZER' },
    { id: 'test_vendor', email: 'vendor@fiesto.app', firstName: 'Test', lastName: 'Vendor', role: 'VENDOR' },
    { id: 'test_attendee', email: 'attendee@fiesto.app', firstName: 'Test', lastName: 'Attendee', role: 'ATTENDEE' },
  ];
  
  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { password: defaultPassword },
      create: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as any,
        password: defaultPassword
      }
    });
  }

  // 1b. Mock Users
  for (const user of mockUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { password: defaultPassword },
      create: {
        id: user.id,
        email: user.email,
        password: defaultPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.toUpperCase() as any,
        avatarUrl: user.avatarUrl,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      }
    });
  }
  console.log('Users seeded');

  // 2. Organizers
  // Ensure the test_org has an organizer profile
  await prisma.organizer.upsert({
    where: { id: 'org_test' },
    update: {},
    create: {
      id: 'org_test',
      userId: 'test_org',
      companyName: 'Test Organizer Inc.',
      contactEmail: 'organizer@fiesto.app',
      verified: true
    }
  });

  for (const org of mockOrganizers) {
    await prisma.organizer.upsert({
      where: { id: org.id },
      update: {},
      create: {
        id: org.id,
        userId: org.userId,
        companyName: org.companyName,
        contactEmail: org.contactEmail,
        contactPhone: org.contactPhone,
        website: org.website,
        verified: org.verified,
        createdAt: new Date(org.createdAt),
        updatedAt: new Date(org.updatedAt),
      }
    });
  }
  console.log('Organizers seeded');

  // 3. Festivals
  // Ensure a test festival exists for test_org
  await prisma.festival.upsert({
    where: { slug: 'test-festival' },
    update: {},
    create: {
      id: 'fst_test',
      name: 'Test Festival',
      slug: 'test-festival',
      description: 'A festival for testing.',
      location: 'Test City',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-03'),
      status: 'PUBLISHED'
    }
  });
  await prisma.festivalOrganizer.upsert({
    where: { festivalId_organizerId: { festivalId: 'fst_test', organizerId: 'org_test' } },
    update: {},
    create: { festivalId: 'fst_test', organizerId: 'org_test', isOwner: true }
  });

  for (const fst of mockFestivals) {
    await prisma.festival.upsert({
      where: { id: fst.id },
      update: {},
      create: {
        id: fst.id,
        name: fst.name,
        slug: fst.slug,
        description: fst.description,
        location: fst.location,
        startDate: new Date(fst.startDate),
        endDate: new Date(fst.endDate),
        status: fst.status.toUpperCase() as any,
        coverImageUrl: fst.coverImageUrl,
        createdAt: new Date(fst.createdAt),
        updatedAt: new Date(fst.updatedAt),
      }
    });

    // Create the join table record (since we moved organizer out of Festival)
    await prisma.festivalOrganizer.upsert({
      where: {
        festivalId_organizerId: {
          festivalId: fst.id,
          organizerId: fst.organizerId
        }
      },
      update: {},
      create: {
        festivalId: fst.id,
        organizerId: fst.organizerId,
        isOwner: true,
        createdAt: new Date(fst.createdAt),
      }
    });
  }
  console.log('Festivals and Co-organizers seeded');

  // 4. Stages & Artists
  for (const stage of mockStages) {
    await prisma.stage.upsert({
      where: { id: stage.id },
      update: {},
      create: {
        id: stage.id,
        festivalId: stage.festivalId,
        name: stage.name,
        capacity: stage.capacity,
        indoor: stage.indoor,
        createdAt: new Date(stage.createdAt),
        updatedAt: new Date(stage.updatedAt),
      }
    });
  }
  for (const artist of mockArtists) {
    await prisma.artist.upsert({
      where: { id: artist.id },
      update: {},
      create: {
        id: artist.id,
        name: artist.name,
        bio: artist.bio,
        genre: artist.genre,
        spotifyUrl: artist.spotifyUrl,
        instagramUrl: artist.instagramUrl,
        imageUrl: artist.imageUrl,
        createdAt: new Date(artist.createdAt),
        updatedAt: new Date(artist.updatedAt),
      }
    });
  }
  console.log('Stages & Artists seeded');

  // 5. Lineup Slots
  for (const slot of mockLineupSlots) {
    await prisma.lineupSlot.upsert({
      where: { id: slot.id },
      update: {},
      create: {
        id: slot.id,
        festivalId: slot.festivalId,
        stageId: slot.stageId,
        artistId: slot.artistId,
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime),
        createdAt: new Date(slot.createdAt),
        updatedAt: new Date(slot.updatedAt),
      }
    });
  }

  // 6. Ticket Tiers & Orders
  for (const tier of mockTicketTiers) {
    await prisma.ticketTier.upsert({
      where: { id: tier.id },
      update: {},
      create: {
        id: tier.id,
        festivalId: tier.festivalId,
        name: tier.name,
        description: tier.description,
        price: tier.price,
        currency: tier.currency,
        capacity: tier.capacity,
        soldCount: tier.soldCount,
        status: tier.status.toUpperCase() as any,
        createdAt: new Date(tier.createdAt),
        updatedAt: new Date(tier.updatedAt),
      }
    });
  }
  for (const order of mockOrders) {
    await prisma.order.upsert({
      where: { id: order.id },
      update: {},
      create: {
        id: order.id,
        festivalId: order.festivalId,
        userId: order.userId,
        totalAmount: order.totalAmount,
        currency: order.currency,
        status: order.status.toUpperCase() as any,
        purchasedAt: order.purchasedAt ? new Date(order.purchasedAt) : null,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      }
    });
  }
  console.log('Tickets & Orders seeded');

  // 7. Attendees
  for (const att of mockAttendees) {
    await prisma.attendee.upsert({
      where: { id: att.id },
      update: {},
      create: {
        id: att.id,
        orderId: att.orderId,
        userId: att.userId,
        festivalId: att.festivalId,
        ticketTierId: att.ticketTierId,
        qrCode: att.qrCode,
        checkedIn: att.checkedIn,
        checkedInAt: att.checkedInAt ? new Date(att.checkedInAt) : null,
        createdAt: new Date(att.createdAt),
        updatedAt: new Date(att.updatedAt),
      }
    });
  }

  // 8. Vendors
  for (const vendor of mockVendors) {
    await prisma.vendor.upsert({
      where: { id: vendor.id },
      update: {},
      create: {
        id: vendor.id,
        festivalId: vendor.festivalId,
        userId: vendor.userId,
        name: vendor.name,
        description: vendor.description,
        category: vendor.category.toUpperCase() as any,
        status: vendor.status.toUpperCase() as any,
        boothNumber: vendor.boothNumber,
        createdAt: new Date(vendor.createdAt),
        updatedAt: new Date(vendor.updatedAt),
      }
    });
  }

  // 9. Staff Members (mapping roles to explicit booleans)
  for (const staff of mockStaffMembers) {
    const role = staff.role;
    await prisma.staffMember.upsert({
      where: { id: staff.id },
      update: {},
      create: {
        id: staff.id,
        festivalId: staff.festivalId,
        userId: staff.userId,
        active: staff.active,
        canScanTickets: ['admin', 'manager', 'scan_team', 'security'].includes(role),
        canEditLineup: ['admin', 'manager'].includes(role),
        canManageStaff: ['admin'].includes(role),
        canManageVendors: ['admin', 'manager', 'vendor_ops'].includes(role),
        createdAt: new Date(staff.createdAt),
        updatedAt: new Date(staff.updatedAt),
      }
    });
  }

  // 10. Announcements
  for (const ann of mockAnnouncements) {
    await prisma.announcement.upsert({
      where: { id: ann.id },
      update: {},
      create: {
        id: ann.id,
        festivalId: ann.festivalId,
        title: ann.title,
        body: ann.body,
        status: ann.status.toUpperCase() as any,
        sendPushNotification: ann.sendPushNotification,
        publishedAt: ann.publishedAt ? new Date(ann.publishedAt) : null,
        createdAt: new Date(ann.createdAt),
        updatedAt: new Date(ann.updatedAt),
      }
    });
  }
  
  // 11. Seed Phase 4 Permissions
  const permissionMatrix: Record<string, string[]> = {
    festival_settings: ['view', 'edit'],
    venues: ['view', 'create', 'edit', 'delete'],
    schedule: ['view', 'create', 'edit', 'delete', 'resolve_conflicts'],
    tickets: ['view', 'create', 'edit', 'delete'],
    orders: ['view', 'refund', 'export'],
    vendors: ['view', 'approve', 'edit', 'delete'],
    vendor_payouts: ['view', 'initiate', 'export'],
    staff: ['view', 'invite', 'edit_roles', 'remove'],
    finance: ['view', 'export', 'manage_payouts'],
    content: ['view', 'create', 'edit', 'delete', 'publish'],
    notifications: ['send'],
    reports: ['view', 'export']
  };
  
  for (const [resource, actions] of Object.entries(permissionMatrix)) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: {
          resource_action: { resource, action }
        },
        update: {},
        create: { resource, action }
      });
    }
  }

  // 12. Seed SYSTEM roles for each existing festival and assign Owner to organizers
  const allPermissions = await prisma.permission.findMany();
  
  // Helpers to find specific permissions for Check-in and Vendor roles
  const checkinPerms = allPermissions.filter(p => 
    (p.resource === 'schedule' && p.action === 'view') ||
    (p.resource === 'orders' && p.action === 'view')
  );
  
  const vendorCoordPerms = allPermissions.filter(p => 
    (p.resource === 'vendors') ||
    (p.resource === 'vendor_payouts' && p.action === 'view')
  );

  for (const festival of mockFestivals) {
    // A. Owner Role
    const ownerRole = await prisma.role.upsert({
      where: {
        festivalId_name: {
          festivalId: festival.id,
          name: "Owner"
        }
      },
      update: {},
      create: {
        festivalId: festival.id,
        name: "Owner",
        description: "System owner role with full access",
        panelType: "ADMIN",
        kind: "SYSTEM",
        permissions: {
          connect: allPermissions.map(p => ({ id: p.id }))
        }
      }
    });

    // B. Check-in Staff Role
    await prisma.role.upsert({
      where: {
        festivalId_name: {
          festivalId: festival.id,
          name: "Check-in Staff"
        }
      },
      update: {},
      create: {
        festivalId: festival.id,
        name: "Check-in Staff",
        description: "Scans tickets at the gate",
        panelType: "CHECKIN",
        kind: "SYSTEM",
        permissions: {
          connect: checkinPerms.map(p => ({ id: p.id }))
        }
      }
    });

    // C. Vendor Coordinator Role
    await prisma.role.upsert({
      where: {
        festivalId_name: {
          festivalId: festival.id,
          name: "Vendor Coordinator"
        }
      },
      update: {},
      create: {
        festivalId: festival.id,
        name: "Vendor Coordinator",
        description: "Manages vendor applications and payouts",
        panelType: "VENDOR_COORDINATOR",
        kind: "SYSTEM",
        permissions: {
          connect: vendorCoordPerms.map(p => ({ id: p.id }))
        }
      }
    });

    // Find the organizer for this festival and assign Owner
    const festivalOrg = await prisma.festivalOrganizer.findFirst({
      where: { festivalId: festival.id },
      include: { organizer: true }
    });

    if (festivalOrg) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId_festivalId: {
            userId: festivalOrg.organizer.userId,
            roleId: ownerRole.id,
            festivalId: festival.id
          }
        },
        update: {},
        create: {
          userId: festivalOrg.organizer.userId,
          roleId: ownerRole.id,
          festivalId: festival.id
        }
      });
    }
  }
  
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
