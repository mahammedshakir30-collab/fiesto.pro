import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { verifyTicket } from '@/actions/checkin';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

describe('Check-in Integration', () => {
  let testFestivalId = '';
  let testTierId = '';
  let testUserId = '';
  let testOrderId = '';
  let validQr = 'mock-qr-code-123';

  beforeAll(async () => {
    // Setup Admin user
    const user = await prisma.user.create({
      data: {
        email: 'test-admin-checkin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN'
      }
    });
    testUserId = user.id;

    // Mock session
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: user.id, role: 'SUPER_ADMIN', email: user.email }
    } as any);

    // Setup festival
    const festival = await prisma.festival.create({
      data: {
        name: 'Checkin Fest',
        slug: 'checkin-fest-' + Date.now(),
        description: 'Testing',
        location: 'Nowhere',
        startDate: new Date(),
        endDate: new Date(),
        status: 'PUBLISHED',
      }
    });
    testFestivalId = festival.id;

    // Setup tier
    const tier = await prisma.ticketTier.create({
      data: {
        festivalId: festival.id,
        name: 'GA',
        price: 5000,
        currency: 'USD',
        capacity: 10,
        soldCount: 1,
        status: 'ACTIVE'
      }
    });
    testTierId = tier.id;

    // Setup Order
    const order = await prisma.order.create({
      data: {
        festivalId: festival.id,
        userId: user.id,
        totalAmount: 5000,
        currency: 'USD',
        status: 'COMPLETED'
      }
    });
    testOrderId = order.id;

    // Setup Attendee (Ticket)
    await prisma.attendee.create({
      data: {
        orderId: order.id,
        userId: user.id,
        festivalId: festival.id,
        ticketTierId: tier.id,
        qrCode: validQr,
        checkedIn: false
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.attendee.deleteMany({ where: { qrCode: validQr } });
    await prisma.order.delete({ where: { id: testOrderId } });
    await prisma.ticketTier.delete({ where: { id: testTierId } });
    await prisma.festival.delete({ where: { id: testFestivalId } });
    await prisma.user.delete({ where: { id: testUserId } });
  });

  it('should successfully check in a valid ticket', async () => {
    const result = await verifyTicket(validQr, testFestivalId);
    
    expect(result.success).toBe(true);
    expect(result.scannedInCount).toBe(1);

    const attendee = await prisma.attendee.findUnique({ where: { qrCode: validQr } });
    expect(attendee?.checkedIn).toBe(true);
    expect(attendee?.checkedInAt).toBeDefined();
  });

  it('should reject a duplicate scan', async () => {
    await expect(verifyTicket(validQr, testFestivalId))
      .rejects
      .toThrow(/Duplicate: Already Scanned/);
  });

  it('should reject a non-existent QR code', async () => {
    await expect(verifyTicket('fake-qr-code', testFestivalId))
      .rejects
      .toThrow('Invalid Code: Ticket not found');
  });

  it('should reject an empty QR code', async () => {
    await expect(verifyTicket('   ', testFestivalId))
      .rejects
      .toThrow('Invalid Code: Empty payload');
  });
});
