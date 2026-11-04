import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { hasValidBearerSecret } from '@/lib/api-auth';
import { getPublicEnv } from '@/lib/env';
import type { Database } from '@/types/database.types';

/**
 * Daily heartbeat for the Supabase free tier, which pauses projects after ~7 days
 * without activity. Triggered by Vercel Cron (see vercel.json); Vercel automatically
 * sends `Authorization: Bearer <CRON_SECRET>` when the CRON_SECRET env var is set.
 * Runs one tiny head-only query (no rows transferred) through the public RLS-protected client.
 */
export async function GET(request: NextRequest) {
  if (!hasValidBearerSecret(request, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const env = getPublicEnv();
  const supabase = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { error } = await supabase
    .from('site_settings')
    .select('id', { count: 'exact', head: true })
    .eq('id', 1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, now: Date.now() });
}
