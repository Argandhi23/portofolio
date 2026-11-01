export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface RateLimitBucket {
  timestamps: number[];
}

const buckets = new Map<string, RateLimitBucket>();
const MAX_BUCKETS = 2000;

/**
 * Lightweight zero-dependency sliding-window rate limiter.
 * Protects authentication and public inquiry endpoints against brute-force and spam.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  // Periodic memory hygiene so long-lived server instances stay lean
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets.entries()) {
      const active = b.timestamps.filter((t) => now - t < windowMs);
      if (active.length === 0) {
        buckets.delete(k);
      } else {
        b.timestamps = active;
      }
    }
  }

  const existing = buckets.get(key);
  const validTimestamps = existing
    ? existing.timestamps.filter((t) => now - t < windowMs)
    : [];

  if (validTimestamps.length >= limit) {
    const oldestInWindow = validTimestamps[0];
    const retryAfterMs = Math.max(1000, windowMs - (now - oldestInWindow));
    buckets.set(key, { timestamps: validTimestamps });
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  validTimestamps.push(now);
  buckets.set(key, { timestamps: validTimestamps });

  return {
    allowed: true,
    remaining: Math.max(0, limit - validTimestamps.length),
    retryAfterSeconds: 0,
  };
}

/**
 * Clears rate limit state (primarily used in automated unit tests).
 */
export function resetRateLimits(): void {
  buckets.clear();
}
