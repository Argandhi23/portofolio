import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { hasValidBearerSecret } from '@/lib/api-auth';
import { CACHE_TAGS } from '@/lib/queries/portfolio.queries';

/**
 * Manual full-site cache purge (e.g. after editing rows directly in the Supabase dashboard).
 * Usage: POST /api/revalidate with header `Authorization: Bearer <REVALIDATE_SECRET>`.
 * Fails closed when REVALIDATE_SECRET is not configured.
 */
export async function POST(request: NextRequest) {
  if (!hasValidBearerSecret(request, process.env.REVALIDATE_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  for (const tag of Object.values(CACHE_TAGS)) {
    revalidateTag(tag, { expire: 0 });
  }
  revalidatePath('/', 'layout');

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
