import { beforeEach, describe, expect, it } from 'vitest';
import { validateImageBuffer } from '@/lib/file-security';
import { checkRateLimit, resetRateLimits } from '@/lib/rate-limit';
import { extractStoragePath } from '@/lib/utils';
import { httpUrlSchema, mediaUrlSchema, navigationUrlSchema } from '@/lib/validations/url.schema';

describe('audit security regressions', () => {
  beforeEach(resetRateLimits);
  it.each([
    '<svg xmlns="http://www.w3.org/2000/svg"><a href="jav&#x61;script:alert(1)"><text>click</text></a></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><set attributeName="onload" to="alert(1)"/></svg>',
    '<!DOCTYPE svg [<!ENTITY x SYSTEM "https://example.com">]><svg>&x;</svg>',
    '<html><svg></svg><script>alert(1)</script></html>',
    '<svg><use href="https://example.com/payload.svg#x"/></svg>',
    '<svg><path style="fill:url(https://example.com/x)"/></svg>',
  ])('rejects active or externally loaded SVG: %s', (svg) => {
    expect(validateImageBuffer(Buffer.from(svg), 'image/svg+xml').valid).toBe(false);
  });
  it('retains static SVG fragment references', () => {
    expect(validateImageBuffer(Buffer.from('<svg><defs><path id="p" d="M0 0"/></defs><use href="#p"/></svg>'), 'image/svg+xml').valid).toBe(true);
  });
  it('does not accept generic HEIF mif1 as AVIF', () => {
    expect(validateImageBuffer(Buffer.from('0000ftypmif100000000'), 'image/avif').valid).toBe(false);
  });
  it.each(['javascript:alert(1)', 'data:text/html,test', 'ftp://example.com', 'not a URL'])('rejects non-web link %s without throwing', (url) => {
    expect(httpUrlSchema.safeParse(url).success).toBe(false);
    expect(navigationUrlSchema.safeParse(url).success).toBe(false);
  });
  it('accepts local images, web links and contact anchors', () => {
    expect(mediaUrlSchema.safeParse('/projects/a.webp').success).toBe(true);
    expect(httpUrlSchema.safeParse('https://example.com').success).toBe(true);
    expect(navigationUrlSchema.safeParse('#contact').success).toBe(true);
    expect(mediaUrlSchema.safeParse('//example.com/a.webp').success).toBe(false);
    expect(mediaUrlSchema.safeParse('/\\example.com').success).toBe(false);
  });
  it('extracts only bucket object paths and excludes query parameters', () => {
    expect(extractStoragePath('https://example.com/storage/v1/object/public/portfolio-media/a.webp?download=1')).toBe('a.webp');
    expect(extractStoragePath('https://example.com/portfolio-media/a.webp')).toBeNull();
    expect(extractStoragePath('../private/file.webp')).toBeNull();
    expect(extractStoragePath('https://example.com/storage/v1/object/public/portfolio-media/%2e%2e%2ffile.webp')).toBeNull();
  });
  it('preserves long-window limits when short-window traffic fills memory', () => {
    expect(checkRateLimit('inquiry', 1, 600_000, 0).allowed).toBe(true);
    for (let i = 0; i < 2100; i++) checkRateLimit(`chat:${i}`, 1, 60_000, 0);
    checkRateLimit('fresh-chat', 1, 60_000, 61_000);
    expect(checkRateLimit('inquiry', 1, 600_000, 61_000).allowed).toBe(false);
  });
  it('does not evict an active bucket to admit new keys at capacity', () => {
    for (let i = 0; i < 2000; i++) checkRateLimit(`key:${i}`, 1, 60_000, 0);
    expect(checkRateLimit('overflow', 1, 60_000, 1000).allowed).toBe(false);
    expect(checkRateLimit('key:0', 1, 60_000, 1000).allowed).toBe(false);
  });
});

describe('restricted SVG grammar regressions', () => {
  it.each([
    '<svg><use href="https:\n//evil.example/a.svg#x"/></svg>',
    '<svg xml:base="https://evil.example/a.svg"><use href="#x"/></svg>',
    `<svg style='background-image:image-set("https://evil.example/a.png")'><path/></svg>`,
    '<svg xmlns="http://www.w3.org/1999/xhtml"><path/></svg>',
    '<svg><g></svg>', '<svg><path id="a" id="b"/></svg>',
    '<svg><path fill=red /></svg>', '<svg><path custom="x"/></svg>',
    '<svg/><svg/>',
  ])('rejects unsupported SVG structure or attributes: %s', (svg) => {
    expect(validateImageBuffer(Buffer.from(svg), 'image/svg+xml').valid).toBe(false);
  });
  it('accepts balanced static vector geometry, gradients and local paint references', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><linearGradient id="g"><stop offset="0" stop-color="#fff"/></linearGradient></defs><path d="M0 0" fill="url(#g)"/></svg>';
    expect(validateImageBuffer(Buffer.from(svg), 'image/svg+xml').valid).toBe(true);
  });
});
