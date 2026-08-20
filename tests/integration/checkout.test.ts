import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { purchaseTicket } from '@/actions/commerce';
import { prisma } from '@/lib/prisma';

describe('Checkout Integration', () => {
  let testTierId = '';
  let testFestivalId = '';

  beforeAll(async () => {
    // Setup a clean festival and tier for testing
    const festival = await prisma.festival.create({
      data: {
        name: 'Test Fest ' + Date.now(),
        slug: 'test-fest-' + Date.now(),
        description: 'Testing',
        location: 'Nowhere',
        startDate: new Date(),
        endDate: new Date(),
        status: 'PUBLISHED',
      }
    });
    testFestivalId = festival.id;

    const tier = await prisma.ticketTier.create({
      data: {
        festivalId: festival.id,
        name: 'GA',
        price: 5000,
        currency: 'USD',
        capacity: 10,
        soldCount: 0,
        status: 'ACTIVE'
      }
    });
    testTierId = tier.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.ticketTier.delete({ where: { id: testTierId } });
    await prisma.festival.delete({ where: { id: testFestivalId } });
    // Also delete any users created (email like %test-checkout%)
    await prisma.user.deleteMany({ where: { email: { contains: 'test-checkout' } } });
  });

  it('should create an order and attendee on successful purchase', async () => {
    const userDetails = {
      firstName: 'Integration',
      lastName: 'Tester',
      email: `test-checkout-${Date.now()}@example.com`
    };

    const result = await purchaseTicket(testTierId, testFestivalId, userDetails);

    // Verify order
    expect(result.order).toBeDefined();
    expect(result.order.totalAmount).toBe(5000);
    expect(result.order.status).toBe('COMPLETED');

    // Verify attendee
    expect(result.attendee).toBeDefined();
    expect(result.attendee.qrCode).toBeDefined();
    expect(result.attendee.checkedIn).toBe(false);

    // Verify capacity was decremented (soldCount incremented)
    const tier = await prisma.ticketTier.findUnique({ where: { id: testTierId } });
    expect(tier?.soldCount).toBe(1);
  });

  it('should fail if ticket tier is sold out', async () => {
    // Manually set sold count to max
    await prisma.ticketTier.update({
      where: { id: testTierId },
      data: { soldCount: 10 }
    });

    const userDetails = {
      firstName: 'Late',
      lastName: 'Buyer',
      email: `test-checkout-late@example.com`
    };

    await expect(purchaseTicket(testTierId, testFestivalId, userDetails))
      .rejects
      .toThrow('This ticket tier is sold out.');
  });
});
