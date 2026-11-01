import { beforeEach, describe, expect, it } from 'vitest';
import { validateImageBuffer } from '@/lib/file-security';
import { checkRateLimit, resetRateLimits } from '@/lib/rate-limit';
import { getPublicEnv } from '@/lib/env';

describe('Security Utilities (Magic Bytes, SVG XSS & Rate Limiting)', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  describe('validateImageBuffer()', () => {
    it('accepts genuine PNG magic bytes', () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ]);
      expect(validateImageBuffer(pngBuffer, 'image/png').valid).toBe(true);
    });

    it('accepts genuine JPEG magic bytes', () => {
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      ]);
      expect(validateImageBuffer(jpegBuffer, 'image/jpeg').valid).toBe(true);
    });

    it('accepts genuine WebP magic bytes (RIFF....WEBP)', () => {
      const webpBuffer = Buffer.from('RIFF\x24\x00\x00\x00WEBPVP8 ', 'binary');
      expect(validateImageBuffer(webpBuffer, 'image/webp').valid).toBe(true);
    });

    it('rejects a spoofed HTML/text file pretending to be image/png', () => {
      const spoofed = Buffer.from('<html><script>alert(1)</script></html>', 'utf8');
      const result = validateImageBuffer(spoofed, 'image/png');
      expect(result.valid).toBe(false);
    });

    it('accepts clean vector SVG markup', () => {
      const cleanSvg = Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
        'utf8'
      );
      expect(validateImageBuffer(cleanSvg, 'image/svg+xml').valid).toBe(true);
    });

    it('rejects SVG containing <script> or inline event handlers (Stored XSS protection)', () => {
      const xssSvg1 = Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script></svg>',
        'utf8'
      );
      const xssSvg2 = Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" onload="fetch(`//evil.com`)"></svg>',
        'utf8'
      );

      expect(validateImageBuffer(xssSvg1, 'image/svg+xml').valid).toBe(false);
      expect(validateImageBuffer(xssSvg2, 'image/svg+xml').valid).toBe(false);
    });
  });

  describe('checkRateLimit()', () => {
    it('enforces sliding-window limit and resets after window expires', () => {
      const baseTime = 1_000_000;
      expect(checkRateLimit('ip:1', 2, 60_000, baseTime).allowed).toBe(true);
      expect(checkRateLimit('ip:1', 2, 60_000, baseTime + 1000).allowed).toBe(
        true
      );

      const blocked = checkRateLimit('ip:1', 2, 60_000, baseTime + 2000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterSeconds).toBe(58);

      // After 60s window passes, request is allowed again
      expect(checkRateLimit('ip:1', 2, 60_000, baseTime + 61_000).allowed).toBe(
        true
      );
    });
  });

  describe('getPublicEnv()', () => {
    it('returns validated public configuration without trailing slash on site URL', () => {
      const env = getPublicEnv();
      expect(env.NEXT_PUBLIC_SUPABASE_URL).toContain('https://');
      expect(env.NEXT_PUBLIC_SITE_URL.endsWith('/')).toBe(false);
    });
  });
});
