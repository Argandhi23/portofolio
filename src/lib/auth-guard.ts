import { createClient } from '@/lib/supabase/server';
import { getAdminEmail } from '@/lib/env';
import type { User } from '@supabase/supabase-js';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export interface AdminAuthContext {
  user: User;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

/**
 * Enforces admin authentication for Server Actions and server-side operations.
 * Verifies that the user is authenticated AND the user's email matches process.env.ADMIN_EMAIL.
 * Throws UnauthorizedError if verification fails.
 */
export async function requireAdmin(): Promise<AdminAuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const adminEmail = getAdminEmail();

  if (
    error ||
    !user ||
    !user.email ||
    !adminEmail ||
    user.email.toLowerCase() !== adminEmail
  ) {
    throw new UnauthorizedError('Unauthorized access');
  }

  return { user, supabase };
}
