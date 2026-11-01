import { describe, expect, it } from 'vitest';
import { parseCaseStudyMarkdown } from '@/lib/markdown';

describe('parseCaseStudyMarkdown', () => {
  it('returns empty array for null, undefined, or whitespace-only input', () => {
    expect(parseCaseStudyMarkdown(null)).toEqual([]);
    expect(parseCaseStudyMarkdown(undefined)).toEqual([]);
    expect(parseCaseStudyMarkdown('   \r\n  ')).toEqual([]);
  });

  it('cleanly splits Windows CRLF (\\r\\n\\r\\n) headings, paragraphs, and bullet lists without merging into h2', () => {
    const crlfMarkdown = [
      '## Gambaran Proyek & Tantangan Bisnis',
      '',
      'Al Parfume membutuhkan platform e-commerce Direct-to-Consumer (D2C) mandiri di alparfume.store.',
      '',
      '## Arsitektur Sistem & Fitur Unggulan',
      '',
      '- Zero-Trust Server-Side Checkout Engine: Seluruh kalkulasi harga diverifikasi di server.',
      '- Pembayaran Dynamic QRIS: Menghasilkan kode QRIS dinamis.',
      '',
      '### Sub-Section Performa',
      'Dibangun dengan arsitektur Next.js App Router dan Supabase RLS.',
    ].join('\r\n');

    const blocks = parseCaseStudyMarkdown(crlfMarkdown);

    expect(blocks).toEqual([
      { type: 'h2', text: 'Gambaran Proyek & Tantangan Bisnis' },
      {
        type: 'p',
        text: 'Al Parfume membutuhkan platform e-commerce Direct-to-Consumer (D2C) mandiri di alparfume.store.',
      },
      { type: 'h2', text: 'Arsitektur Sistem & Fitur Unggulan' },
      {
        type: 'ul',
        items: [
          'Zero-Trust Server-Side Checkout Engine: Seluruh kalkulasi harga diverifikasi di server.',
          'Pembayaran Dynamic QRIS: Menghasilkan kode QRIS dinamis.',
        ],
      },
      { type: 'h3', text: 'Sub-Section Performa' },
      {
        type: 'p',
        text: 'Dibangun dengan arsitektur Next.js App Router dan Supabase RLS.',
      },
    ]);
  });

  it('handles single-newline transitions between headings, paragraphs, and asterisk lists', () => {
    const compact = `## Ringkasan\nKalimat pertama.\nKalimat kedua.\n* Poin A\n* Poin B\n## Penutup\nSelesai.`;
    const blocks = parseCaseStudyMarkdown(compact);

    expect(blocks).toEqual([
      { type: 'h2', text: 'Ringkasan' },
      { type: 'p', text: 'Kalimat pertama. Kalimat kedua.' },
      { type: 'ul', items: ['Poin A', 'Poin B'] },
      { type: 'h2', text: 'Penutup' },
      { type: 'p', text: 'Selesai.' },
    ]);
  });
});
