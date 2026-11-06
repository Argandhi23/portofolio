'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_ID_KEY = 'folioblox_vid';
const VISITOR_FIRST_SEEN_KEY = 'folioblox_first_ts';
const SESSION_COOLDOWN_PREFIX = 'folioblox_track_';
const COOLDOWN_MS = 30_000;

function getOrCreateVisitorIdentity(): {
  visitorId: string;
  isReturning: boolean;
} {
  try {
    let visitorId = window.localStorage.getItem(VISITOR_ID_KEY);
    const firstSeenRaw = window.localStorage.getItem(VISITOR_FIRST_SEEN_KEY);
    const now = Date.now();

    if (!visitorId || visitorId.length < 8) {
      const randomPart =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID().replace(/-/g, '')
          : `${Math.random().toString(36).slice(2)}${now.toString(36)}`;
      visitorId = `v_${randomPart.slice(0, 24)}`;
      window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
      window.localStorage.setItem(VISITOR_FIRST_SEEN_KEY, String(now));
      return { visitorId, isReturning: false };
    }

    const firstSeen = firstSeenRaw ? Number.parseInt(firstSeenRaw, 10) : now;
    // Consider visitor "returning" if their first visit was more than 30 minutes ago
    const isReturning = now - firstSeen > 30 * 60 * 1000;
    return { visitorId, isReturning };
  } catch {
    return {
      visitorId: `v_anon_${Date.now().toString(36)}`,
      isReturning: false,
    };
  }
}

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/api')
    ) {
      return;
    }

    // Skip automated browsers (Playwright E2E / WebDriver)
    if (typeof navigator !== 'undefined' && navigator.webdriver) {
      return;
    }

    // Deduplicate rapid reloads on the same path within 30 seconds
    try {
      const cooldownKey = `${SESSION_COOLDOWN_PREFIX}${pathname}`;
      const lastTracked = window.sessionStorage.getItem(cooldownKey);
      const now = Date.now();
      if (lastTracked && now - Number.parseInt(lastTracked, 10) < COOLDOWN_MS) {
        return;
      }
      window.sessionStorage.setItem(cooldownKey, String(now));
    } catch {
      // Ignore storage access errors in strict privacy mode
    }

    const timer = window.setTimeout(() => {
      const { visitorId, isReturning } = getOrCreateVisitorIdentity();
      let timezone = '';
      try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      } catch {
        timezone = '';
      }

      void fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          path: pathname,
          referrer: document.referrer || null,
          timezone,
          isReturning,
        }),
        keepalive: true,
      }).catch(() => {
        // Silent fail so visitor experience is never impacted
      });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
