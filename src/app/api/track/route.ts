import { NextResponse, type NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/rate-limit';
import { getPublicEnv } from '@/lib/env';
import { trackVisitSchema } from '@/lib/validations/visitor.schema';
import {
  inferLocation,
  normalizeReferrerSource,
  parseUserAgent,
} from '@/lib/visitor-utils';
import type { Database } from '@/types/database.types';

export async function POST(request: NextRequest) {
  try {
    // 1. Ignore visits from logged-in Admin (if Supabase auth cookie is present)
    const hasSupabaseSession = request.cookies
      .getAll()
      .some((cookie) => cookie.name.startsWith('sb-'));

    if (hasSupabaseSession) {
      return NextResponse.json({ tracked: false, reason: 'admin_session' });
    }

    // 2. Parse User-Agent and ignore automated bots/crawlers
    const userAgent = request.headers.get('user-agent');
    const uaInfo = parseUserAgent(userAgent);
    if (uaInfo.isBot) {
      return NextResponse.json({ tracked: false, reason: 'bot' });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || request.headers.get('x-real-ip') || 'local';
    const rate = checkRateLimit(`track:${ip}`, 60, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ tracked: false, reason: 'rate_limit' }, {
        status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) },
      });
    }

    // 3. Parse & validate request payload
    const body: unknown = await request.json().catch(() => null);
    const validation = trackVisitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { tracked: false, reason: 'invalid_payload' },
        { status: 400 }
      );
    }

    const { visitorId, path, referrer, timezone, isReturning } = validation.data;

    // 4. Normalize traffic source & location
    const hostHeader = request.headers.get('host');
    const referrerSource = normalizeReferrerSource(referrer, hostHeader);

    const geoCountry =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry');
    const geoCity =
      request.headers.get('x-vercel-ip-city') ||
      request.headers.get('cf-ipcity');

    const { country, city } = inferLocation(
      { country: geoCountry, city: geoCity },
      timezone
    );

    // 5. Insert into Supabase public.page_views using stateless anon client
    const env = getPublicEnv();
    const supabase = createSupabaseClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { error } = await supabase.from('page_views').insert({
      visitor_id: visitorId,
      path,
      referrer_source: referrerSource,
      referrer: referrer ? referrer.slice(0, 500) : null,
      country,
      city,
      device_type: uaInfo.deviceType,
      browser: uaInfo.browser,
      os: uaInfo.os,
      is_returning: Boolean(isReturning),
    });

    if (error) {
      return NextResponse.json({ tracked: false, reason: 'db_skip' });
    }

    return NextResponse.json({ tracked: true });
  } catch {
    return NextResponse.json({ tracked: false });
  }
}
