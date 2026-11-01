import { describe, expect, it } from 'vitest';
import { projectSchema } from '@/lib/validations/project.schema';
import { inquirySchema } from '@/lib/validations/inquiry.schema';
import { loginSchema } from '@/lib/validations/auth.schema';

describe('Zod Input Validation Schemas', () => {
  describe('projectSchema', () => {
    const validProject = {
      title: 'Al Parfume Storefront',
      slug: 'al-parfume-storefront',
      category: 'Full-Stack E-Commerce',
      thumbnail_url: '/projects/alparfume/hero-storefront.webp',
      gallery_urls: ['https://xyz.supabase.co/storage/v1/object/public/portfolio-media/a.webp'],
      tech_stack: ['Next.js', 'Supabase'],
      project_url: 'https://www.alparfume.store',
      is_featured: true,
      status: 'published' as const,
      display_order: 1,
    };

    it('accepts a valid project payload', () => {
      const res = projectSchema.safeParse(validProject);
      expect(res.success).toBe(true);
    });

    it('rejects uppercase or malformed project slugs', () => {
      const res = projectSchema.safeParse({
        ...validProject,
        slug: 'Invalid Slug_123!',
      });
      expect(res.success).toBe(false);
    });

    it('rejects unsafe javascript: protocol in thumbnail_url', () => {
      const res = projectSchema.safeParse({
        ...validProject,
        thumbnail_url: 'javascript:alert(1)',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('inquirySchema', () => {
    it('accepts a clean client project inquiry', () => {
      const res = inquirySchema.safeParse({
        name: 'Budi Pratama',
        email: 'budi@company.co.id',
        subject: 'Custom SaaS Platform',
        message: 'Kami ingin membangun platform manajemen inventori berbasis Next.js dan Supabase.',
        website_honeypot: '',
      });
      expect(res.success).toBe(true);
    });

    it('rejects messages that are too short (< 10 chars)', () => {
      const res = inquirySchema.safeParse({
        name: 'Budi',
        email: 'budi@company.co.id',
        message: 'Halo saja',
      });
      expect(res.success).toBe(false);
    });

    it('rejects bot submissions where website_honeypot is filled', () => {
      const res = inquirySchema.safeParse({
        name: 'Spam Bot',
        email: 'bot@spam.example',
        message: 'Buy cheap backlinks right now!',
        website_honeypot: 'https://spam-link.example',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('validates administrator login fields', () => {
      expect(
        loginSchema.safeParse({ email: 'not-an-email', password: '' }).success
      ).toBe(false);
      expect(
        loginSchema.safeParse({
          email: 'admin@argandhi.dev',
          password: 'secure-password',
        }).success
      ).toBe(true);
    });
  });
});
