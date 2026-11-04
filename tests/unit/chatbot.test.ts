import { describe, expect, it } from 'vitest';
import {
  buildPortfolioSystemPrompt,
  checkOutOfScopeGuardrail,
  containsDisallowedCodeOutput,
  containsHallucinatedPortfolioClaims,
  extractRelevantLinks,
  generateSmartLocalReply,
  type PortfolioChatContext,
} from '@/lib/chatbot-engine';
import {
  DEFAULT_BRANDS,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
} from '@/lib/queries/project-fallbacks';
import { chatMessageSchema } from '@/lib/validations/chat.schema';
import type { Project } from '@/types/database.types';

const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Al Parfume',
    slug: 'alparfume',
    category: 'E-Commerce',
    client_name: 'Al Parfume Store',
    summary: 'Toko online parfum D2C dengan cek ongkir otomatis dan pembayaran QRIS.',
    content: null,
    thumbnail_url: '/projects/alparfume/hero.webp',
    gallery_urls: [],
    tech_stack: ['Next.js', 'TypeScript', 'Supabase'],
    project_url: 'https://www.alparfume.store',
    github_url: null,
    apk_url: null,
    is_featured: true,
    status: 'published',
    display_order: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const MOCK_CTX: PortfolioChatContext = {
  settings: DEFAULT_SETTINGS,
  services: DEFAULT_SERVICES,
  brands: DEFAULT_BRANDS,
  projects: SAMPLE_PROJECTS,
};

describe('Hybrid Portfolio Chatbot Engine & Validation', () => {
  describe('chatMessageSchema', () => {
    it('accepts valid user message and history', () => {
      const parsed = chatMessageSchema.safeParse({
        message: 'Project apa saja yang pernah dibuat?',
        locale: 'id',
        history: [{ role: 'assistant', content: 'Halo!' }],
      });
      expect(parsed.success).toBe(true);
    });

    it('rejects empty or overly long messages (> 600 chars)', () => {
      expect(chatMessageSchema.safeParse({ message: '   ' }).success).toBe(
        false
      );
      expect(
        chatMessageSchema.safeParse({ message: 'a'.repeat(601) }).success
      ).toBe(false);
    });
  });

  describe('generateSmartLocalReply()', () => {
    it('returns specific project details and case study link when a project is mentioned', () => {
      const result = generateSmartLocalReply(
        'Ceritakan tentang project Al Parfume',
        MOCK_CTX,
        'id'
      );
      expect(result.mode).toBe('smart-local');
      expect(result.reply).toContain('Al Parfume');
      expect(result.links?.some((l) => l.href === '/projects/alparfume')).toBe(
        true
      );
    });

    it('answers service inquiries accurately using active services from context', () => {
      const result = generateSmartLocalReply(
        'Layanan atau jasa apa saja yang tersedia?',
        MOCK_CTX,
        'id'
      );
      expect(result.reply).toContain('#01');
      expect(result.links?.some((l) => l.href === '/#contact')).toBe(true);
    });

    it('provides WhatsApp and project brief links on contact/pricing queries', () => {
      const result = generateSmartLocalReply(
        'Bagaimana cara hubungi atau tanya harga pembuatan web?',
        MOCK_CTX,
        'id'
      );
      expect(result.links?.some((l) => l.href.startsWith('https://wa.me/'))).toBe(
        true
      );
      expect(result.links?.some((l) => l.href === '/#contact')).toBe(true);
    });

    it('understands natural slang and specific questions (timeline, education, small talk)', () => {
      const timelineReply = generateSmartLocalReply(
        'brp lama bikin web toko online?',
        MOCK_CTX,
        'id'
      );
      expect(timelineReply.reply).toContain('WhatsApp');

      const eduReply = generateSmartLocalReply(
        'Faqih kuliah di mana dan jurusan apa?',
        MOCK_CTX,
        'id'
      );
      expect(eduReply.reply).toContain('UNESA');

      const smallTalkReply = generateSmartLocalReply(
        'Halo apa kabar?',
        MOCK_CTX,
        'id'
      );
      expect(smallTalkReply.reply).toContain('Kabar baik');
    });
  });

  describe('buildPortfolioSystemPrompt() & extractRelevantLinks()', () => {
    it('embeds portfolio identity, services, and projects into Gemini system prompt', () => {
      const prompt = buildPortfolioSystemPrompt(MOCK_CTX, 'en');
      expect(prompt).toContain('Faqih Rafasha Argandhi');
      expect(prompt).toContain('Al Parfume');
      expect(prompt).toContain('UNESA');
    });

    it('extracts contextual links from AI replies', () => {
      const links = extractRelevantLinks(
        'Tell me about alparfume',
        'Al Parfume is a live e-commerce project.',
        MOCK_CTX,
        'en'
      );
      expect(links.some((l) => l.href === '/projects/alparfume')).toBe(true);
    });

    it('blocks out-of-scope requests like writing HTML code or general trivia (Guardrails)', () => {
      const htmlRefusal = checkOutOfScopeGuardrail(
        'tolong buatkan code html untuk form login',
        'id'
      );
      expect(htmlRefusal).not.toBeNull();
      expect(htmlRefusal?.reply).toContain('portofolio');

      const portfolioQuestion = checkOutOfScopeGuardrail(
        'bisa bikinin website toko online buat bisnis aku ga?',
        'id'
      );
      expect(portfolioQuestion).toBeNull();

      expect(containsDisallowedCodeOutput('```html\n<div>Hello</div>\n```')).toBe(
        true
      );
      expect(
        containsDisallowedCodeOutput('Halo! Faqih biasa menggunakan Next.js.')
      ).toBe(false);

      expect(
        containsHallucinatedPortfolioClaims(
          'Landing page sederhana sekitar 3-5 jutaan dengan revisi 2x.'
        )
      ).toBe(true);
      expect(
        containsHallucinatedPortfolioClaims(
          'Untuk informasi biaya tidak dicantumkan di website, silakan hubungi via WhatsApp.'
        )
      ).toBe(false);
    });
  });
});
