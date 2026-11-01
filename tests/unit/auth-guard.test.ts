import { describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

import { requireAdmin, UnauthorizedError } from '@/lib/auth-guard';

describe('requireAdmin() Server Action Security Guard', () => {
  it('throws UnauthorizedError when there is no authenticated user', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(requireAdmin()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('throws UnauthorizedError when user email does not match ADMIN_EMAIL', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: {
          id: 'user-2',
          email: 'intruder@another-domain.com',
        },
      },
      error: null,
    });

    await expect(requireAdmin()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('allows access when authenticated user email matches ADMIN_EMAIL case-insensitively', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: {
          id: 'admin-1',
          email: 'ADMIN@argandhi.dev',
        },
      },
      error: null,
    });

    const ctx = await requireAdmin();
    expect(ctx.user.id).toBe('admin-1');
  });
});
