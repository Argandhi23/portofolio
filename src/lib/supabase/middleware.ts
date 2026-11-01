import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminEmail, getPublicEnv } from '@/lib/env';
import type { Database } from '@/types/database.types';

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login' || pathname === '/login/';
  const hasSupabaseSessionCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-'));

  // Performance Fast-Path (0ms overhead):
  // Public visitors without an active Supabase session cookie never trigger an auth network roundtrip.
  if (!isAdminRoute && !isLoginRoute && !hasSupabaseSessionCookie) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const env = getPublicEnv();

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Security Invariant: DO NOT use getSession(). ALWAYS use getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = getAdminEmail();
  const isAdmin = Boolean(
    user && user.email && adminEmail && user.email.toLowerCase() === adminEmail
  );

  // 1. Protect all /admin routes
  if (isAdminRoute && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // 2. Redirect authenticated admin from /login to /admin/projects
  if (isLoginRoute && isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/projects';
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
