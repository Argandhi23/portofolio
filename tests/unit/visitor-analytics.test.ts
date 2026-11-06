import { describe, expect, it } from 'vitest';
import {
  computeVisitorAnalytics,
  inferLocation,
  normalizeReferrerSource,
  parseUserAgent,
} from '@/lib/visitor-utils';
import { trackVisitSchema } from '@/lib/validations/visitor.schema';
import type { PageView } from '@/types/database.types';

describe('Visitor Analytics & Detection Engine', () => {
  describe('parseUserAgent', () => {
    it('identifies desktop Chrome on Windows accurately', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
      const parsed = parseUserAgent(ua);
      expect(parsed.isBot).toBe(false);
      expect(parsed.deviceType).toBe('Desktop');
      expect(parsed.browser).toBe('Chrome');
      expect(parsed.os).toBe('Windows');
    });

    it('identifies mobile Safari on iPhone accurately', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
      const parsed = parseUserAgent(ua);
      expect(parsed.isBot).toBe(false);
      expect(parsed.deviceType).toBe('Mobile');
      expect(parsed.browser).toBe('Safari');
      expect(parsed.os).toBe('iOS');
    });

    it('flags crawlers and headless browsers as bots', () => {
      expect(
        parseUserAgent(
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        ).isBot
      ).toBe(true);
      expect(parseUserAgent('HeadlessChrome/128.0.0.0').isBot).toBe(true);
      expect(parseUserAgent('').isBot).toBe(true);
    });
  });

  describe('normalizeReferrerSource', () => {
    it('maps social & search referrers to clean source names', () => {
      expect(normalizeReferrerSource('https://www.instagram.com/')).toBe(
        'Instagram'
      );
      expect(normalizeReferrerSource('https://www.linkedin.com/in/faqih')).toBe(
        'LinkedIn'
      );
      expect(normalizeReferrerSource('https://github.com/Argandhi23')).toBe(
        'GitHub'
      );
      expect(normalizeReferrerSource('https://www.google.com/search?q=x')).toBe(
        'Google'
      );
      expect(normalizeReferrerSource(null)).toBe('Direct');
    });

    it('treats same-host referrers as Direct', () => {
      expect(
        normalizeReferrerSource(
          'https://argandhi.dev/projects',
          'argandhi.dev'
        )
      ).toBe('Direct');
    });
  });

  describe('inferLocation', () => {
    it('prefers CDN geo headers when available', () => {
      const loc = inferLocation(
        { country: 'ID', city: 'Surabaya' },
        'Asia/Jakarta'
      );
      expect(loc).toEqual({ country: 'ID', city: 'Surabaya' });
    });

    it('falls back to timezone mapping when geo headers are missing', () => {
      const loc = inferLocation({}, 'Asia/Jakarta');
      expect(loc).toEqual({ city: 'WIB (Jawa/Sumatera)', country: 'ID' });
    });
  });

  describe('computeVisitorAnalytics', () => {
    it('computes today, week, month, year, and all-time views and unique visitors accurately', () => {
      const now = new Date('2026-11-06T15:00:00.000Z');
      const rows: PageView[] = [
        {
          id: '1',
          visitor_id: 'v_user_alpha',
          path: '/',
          referrer_source: 'Instagram',
          referrer: null,
          country: 'ID',
          city: 'Surabaya',
          device_type: 'Mobile',
          browser: 'Chrome',
          os: 'Android',
          is_returning: false,
          created_at: '2026-11-06T10:00:00.000Z', // Today
        },
        {
          id: '2',
          visitor_id: 'v_user_alpha',
          path: '/projects/alparfume',
          referrer_source: 'Instagram',
          referrer: null,
          country: 'ID',
          city: 'Surabaya',
          device_type: 'Mobile',
          browser: 'Chrome',
          os: 'Android',
          is_returning: true,
          created_at: '2026-11-06T10:05:00.000Z', // Today (same visitor)
        },
        {
          id: '3',
          visitor_id: 'v_user_beta',
          path: '/about',
          referrer_source: 'LinkedIn',
          referrer: null,
          country: 'ID',
          city: 'Jakarta',
          device_type: 'Desktop',
          browser: 'Edge',
          os: 'Windows',
          is_returning: false,
          created_at: '2026-11-03T09:00:00.000Z', // Earlier this week (Tuesday)
        },
        {
          id: '4',
          visitor_id: 'v_user_gamma',
          path: '/',
          referrer_source: 'Google',
          referrer: null,
          country: 'SG',
          city: 'Singapore',
          device_type: 'Desktop',
          browser: 'Safari',
          os: 'macOS',
          is_returning: false,
          created_at: '2026-05-12T09:00:00.000Z', // Earlier this year
        },
        {
          id: '5',
          visitor_id: 'v_user_delta',
          path: '/',
          referrer_source: 'Direct',
          referrer: null,
          country: 'ID',
          city: 'Bandung',
          device_type: 'Desktop',
          browser: 'Chrome',
          os: 'Windows',
          is_returning: false,
          created_at: '2025-12-01T09:00:00.000Z', // Last year
        },
      ];

      const summary = computeVisitorAnalytics(rows, now);

      expect(summary.today).toEqual({ views: 2, unique: 1 });
      expect(summary.thisWeek).toEqual({ views: 3, unique: 2 });
      expect(summary.thisMonth).toEqual({ views: 3, unique: 2 });
      expect(summary.thisYear).toEqual({ views: 4, unique: 3 });
      expect(summary.allTime).toEqual({ views: 5, unique: 4 });
      expect(summary.topSources[0]).toEqual({ source: 'Instagram', count: 2 });
      expect(summary.topPages[0]).toEqual({ path: '/', count: 3 });
    });
  });

  describe('trackVisitSchema', () => {
    it('accepts valid public page visits and rejects /admin paths', () => {
      expect(
        trackVisitSchema.safeParse({
          visitorId: 'v_1234567890abcdef',
          path: '/projects/alparfume',
          referrer: 'https://github.com/Argandhi23',
          timezone: 'Asia/Jakarta',
          isReturning: false,
        }).success
      ).toBe(true);

      expect(
        trackVisitSchema.safeParse({
          visitorId: 'v_1234567890abcdef',
          path: '/admin/projects',
        }).success
      ).toBe(false);
    });
  });
});
