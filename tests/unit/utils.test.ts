import { describe, expect, it } from 'vitest';
import {
  cn,
  extractStoragePath,
  formatDisplayDomain,
  isMobileProject,
  slugify,
} from '@/lib/utils';

describe('src/lib/utils.ts', () => {
  describe('cn()', () => {
    it('joins truthy class names and ignores falsy values', () => {
      expect(cn('px-4', false && 'hidden', undefined, null, 'bg-black')).toBe(
        'px-4 bg-black'
      );
    });
  });

  describe('slugify()', () => {
    it('normalizes titles with ampersands, symbols, and extra spaces', () => {
      expect(slugify('  Al Parfume — Luxury D2C & E-Commerce!  ')).toBe(
        'al-parfume-luxury-d2c-and-e-commerce'
      );
    });

    it('collapses consecutive hyphens and trims boundary hyphens', () => {
      expect(slugify('---Next.js   16   CMS---')).toBe('nextjs-16-cms');
    });
  });

  describe('formatDisplayDomain()', () => {
    it('strips www. prefix and protocol from valid URLs', () => {
      expect(formatDisplayDomain('https://www.alparfume.store/catalog')).toBe(
        'alparfume.store'
      );
    });

    it('falls back to slug.app when URL is missing or invalid', () => {
      expect(formatDisplayDomain(null, 'folioblox')).toBe('folioblox.app');
      expect(formatDisplayDomain('not-a-valid-url', 'argandhi')).toBe(
        'argandhi.app'
      );
    });
  });

  describe('extractStoragePath()', () => {
    it('extracts relative object path from a Supabase Storage public URL', () => {
      const url =
        'https://xyz.supabase.co/storage/v1/object/public/portfolio-media/projects/17000-hero%20image.webp';
      expect(extractStoragePath(url, 'portfolio-media')).toBe(
        'projects/17000-hero image.webp'
      );
    });

    it('returns null for local public assets starting with / to prevent false deletions', () => {
      expect(
        extractStoragePath('/projects/alparfume/hero-storefront.webp')
      ).toBeNull();
    });

    it('returns null for external third-party URLs outside the bucket', () => {
      expect(
        extractStoragePath('https://images.unsplash.com/photo-123.jpg')
      ).toBeNull();
    });
  });

  describe('isMobileProject()', () => {
    it('returns true when apk_url is provided', () => {
      expect(isMobileProject({ apk_url: 'https://drive.google.com/xyz' })).toBe(true);
    });

    it('returns true when category or tech_stack indicates mobile', () => {
      expect(isMobileProject({ category: 'Mobile App (Flutter)' })).toBe(true);
      expect(isMobileProject({ tech_stack: ['Flutter', 'Dart'] })).toBe(true);
    });

    it('returns false for desktop web projects with no mobile indicators', () => {
      expect(
        isMobileProject({
          apk_url: null,
          category: 'E-Commerce',
          tech_stack: ['Next.js', 'PostgreSQL'],
        })
      ).toBe(false);
      expect(isMobileProject(null)).toBe(false);
    });
  });
});
