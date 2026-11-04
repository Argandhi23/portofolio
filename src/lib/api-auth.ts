import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

/**
 * Verifies `Authorization: Bearer <secret>` against an expected secret using a
 * constant-time comparison. Fails closed when the secret is not configured.
 */
export function hasValidBearerSecret(
  request: NextRequest,
  expectedSecret: string | undefined
): boolean {
  if (!expectedSecret) return false;

  const header = request.headers.get('authorization') ?? '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';

  const a = Buffer.from(provided);
  const b = Buffer.from(expectedSecret);
  return a.length === b.length && timingSafeEqual(a, b);
}
