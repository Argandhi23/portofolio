import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(), getUser: vi.fn(), signOut: vi.fn(), updateUser: vi.fn(), requireAdmin: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: mocks }) }));
vi.mock('@/lib/auth-guard', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('next/headers', () => ({ headers: async () => new Headers() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: () => { throw new Error('REDIRECT'); } }));
vi.mock('next/dist/client/components/redirect-error', () => ({ isRedirectError: (error: Error) => error.message === 'REDIRECT' }));
import { GET } from '@/app/(auth)/auth/callback/route';
import { resetAdminPassword, logoutAdmin } from '@/actions/auth.actions';
beforeEach(() => {
  vi.clearAllMocks();
  mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
  mocks.getUser.mockResolvedValue({ data: { user: { email: 'admin@argandhi.dev' } }, error: null });
  mocks.requireAdmin.mockResolvedValue({ supabase: { auth: mocks } });
  mocks.updateUser.mockResolvedValue({ error: null });
  mocks.signOut.mockResolvedValue({ error: null });
});
it('exchanges PKCE code and verifies the admin before opening password form', async () => {
  const result = await GET(new NextRequest('https://argandhi.dev/auth/callback?code=test&next=https://evil.example'));
  expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith('test');
  expect(mocks.getUser).toHaveBeenCalled();
  expect(result.headers.get('location')).toBe('https://argandhi.dev/reset-password');
});
it('signs out a non-admin recovery user', async () => {
  mocks.getUser.mockResolvedValue({ data: { user: { email: 'visitor@example.com' } }, error: null });
  const result = await GET(new NextRequest('https://argandhi.dev/auth/callback?code=test'));
  expect(result.headers.get('location')).toContain('/login?recovery=invalid');
  expect(mocks.signOut).toHaveBeenCalled();
});
it('rejects an invalid or expired code', async () => {
  mocks.exchangeCodeForSession.mockResolvedValue({ error: { message: 'expired' } });
  const result = await GET(new NextRequest('https://argandhi.dev/auth/callback?code=expired'));
  expect(result.headers.get('location')).toContain('/login?recovery=invalid');
  expect(mocks.getUser).not.toHaveBeenCalled();
});
it('rejects mismatched passwords without updating auth', async () => {
  const form = new FormData(); form.set('password', 'secure-password'); form.set('confirmPassword', 'other-password');
  const result = await resetAdminPassword({ success: false, message: '' }, form);
  expect(result.fieldErrors?.confirmPassword).toBeDefined();
  expect(mocks.updateUser).not.toHaveBeenCalled();
});
it('requires server authorization before password update', async () => {
  mocks.requireAdmin.mockRejectedValue(new Error('Unauthorized'));
  const result = await resetAdminPassword({ success: false, message: '' }, new FormData());
  expect(result.success).toBe(false);
  expect(mocks.updateUser).not.toHaveBeenCalled();
});
it('updates a validated password, signs out and redirects', async () => {
  const form = new FormData(); form.set('password', 'secure-password'); form.set('confirmPassword', 'secure-password');
  await expect(resetAdminPassword({ success: false, message: '' }, form)).rejects.toThrow('REDIRECT');
  expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'secure-password' });
  expect(mocks.signOut).toHaveBeenCalled();
});

it('returns a safe redirect if the provider throws during code exchange', async () => {
  mocks.exchangeCodeForSession.mockRejectedValue(new Error('network offline'));
  const response = await GET(new NextRequest('https://argandhi.dev/auth/callback?code=test'));
  expect(response.headers.get('location')).toContain('/login?recovery=invalid');
});
it('does not claim logout succeeded when the password changed but sign-out failed', async () => {
  mocks.signOut.mockResolvedValue({ error: { message: 'offline' } });
  const form = new FormData(); form.set('password', 'secure-password'); form.set('confirmPassword', 'secure-password');
  const result = await resetAdminPassword({ success: false, message: '' }, form);
  expect(result.success).toBe(false);
  expect(result.message).toContain('Kata sandi sudah diperbarui');
});

it('logs out only the current admin session without revoking other devices', async () => {
  await expect(logoutAdmin()).rejects.toThrow('REDIRECT');
  expect(mocks.signOut).toHaveBeenCalledExactlyOnceWith({ scope: 'local' });
});
it('does not sign out when the server admin guard rejects the caller', async () => {
  mocks.requireAdmin.mockRejectedValue(new Error('Unauthorized'));
  expect((await logoutAdmin()).success).toBe(false);
  expect(mocks.signOut).not.toHaveBeenCalled();
});
it('reports a failed local sign-out without claiming success', async () => {
  mocks.signOut.mockResolvedValue({ error: { message: 'offline' } });
  expect((await logoutAdmin()).success).toBe(false);
  expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
});
