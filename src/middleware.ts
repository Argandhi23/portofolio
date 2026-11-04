import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  /*
   * Only the admin area and the login page need session checks. Public pages are
   * prerendered/cached and never touch auth, so excluding them means ZERO middleware
   * invocations (and zero Supabase Auth calls) for regular visitors, which keeps the
   * Vercel Hobby quota and Supabase free-tier usage minimal.
   */
  matcher: ['/admin/:path*', '/login'],
};
