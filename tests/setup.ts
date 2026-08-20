import { vi } from 'vitest';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock Pusher so it doesn't try to connect
vi.mock('@/lib/pusher', () => ({
  pusherServer: {
    trigger: vi.fn().mockResolvedValue(true),
  }
}));
