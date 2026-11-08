import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminEmail, getPublicEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  const origin = getPublicEnv().NEXT_PUBLIC_SITE_URL;
  const code = request.nextUrl.searchParams.get('code');
  try {
    if (code && code.length <= 4096) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!userError && user?.email && user.email.toLowerCase() === getAdminEmail()) {
          return NextResponse.redirect(new URL('/reset-password', origin));
        }
        await supabase.auth.signOut({ scope: 'local' });
      }
    }
  } catch {
    // Network/provider failures must not expose an internal error page.
  }
  return NextResponse.redirect(new URL('/login?recovery=invalid', origin));
}
