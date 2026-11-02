import { describe, expect, it } from 'vitest';
import {
  LANG_DELIMITER,
  decodeLocalized,
  encodeLocalized,
  pickLocalized,
} from '@/lib/i18n/localized';
import { PUBLIC_COPY, tPick } from '@/lib/i18n/dictionary';

describe('Bilingual Localization Engine (EN | ID)', () => {
  it('encodes distinct EN and ID strings using the delimiter', () => {
    const encoded = encodeLocalized({
      en: 'Web Development',
      id: 'Pengembangan Web',
    });
    expect(encoded).toBe(`Web Development${LANG_DELIMITER}Pengembangan Web`);
  });

  it('omits the delimiter when EN and ID are identical or ID is empty', () => {
    expect(encodeLocalized({ en: 'Al Parfume', id: 'Al Parfume' })).toBe(
      'Al Parfume'
    );
    expect(encodeLocalized({ en: 'Software Developer', id: '  ' })).toBe(
      'Software Developer'
    );
    expect(encodeLocalized({ en: '', id: 'Aplikasi Web' })).toBe(
      'Aplikasi Web'
    );
    expect(encodeLocalized({ en: '', id: '' })).toBe('');
  });

  it('decodes explicit bilingual strings and falls back gracefully if one side is empty', () => {
    const pair = decodeLocalized(`Selected Works${LANG_DELIMITER}Proyek Pilihan`);
    expect(pair).toEqual({
      en: 'Selected Works',
      id: 'Proyek Pilihan',
    });

    const missingId = decodeLocalized(`Only English${LANG_DELIMITER}   `);
    expect(missingId).toEqual({
      en: 'Only English',
      id: 'Only English',
    });
  });

  it('maps legacy verbose Supabase strings into concise EN & ID pairs automatically', () => {
    const heroGreeting = decodeLocalized("Hey, I'm Faqih Rafasha — Full-Stack &");
    expect(heroGreeting).toEqual({
      en: "Hi, I'm Faqih Rafasha",
      id: 'Halo, saya Faqih Rafasha',
    });

    const alparfumeTitle = decodeLocalized(
      'Al Parfume — Luxury D2C Fragrance E-Commerce'
    );
    expect(alparfumeTitle).toEqual({
      en: 'Al Parfume',
      id: 'Al Parfume',
    });

    const legacyCaseStudy = decodeLocalized(
      '## Gambaran Proyek & Tantangan Bisnis\n\n- Zero-Trust Server-Side Checkout Engine: test'
    );
    expect(legacyCaseStudy.en).toContain('## Project Goal');
    expect(legacyCaseStudy.id).toContain('## Tujuan Proyek');
  });

  it('picks target locale string cleanly via pickLocalized and tPick', () => {
    const raw = `Clean code. Fast products.${LANG_DELIMITER}Kode bersih. Produk cepat.`;
    expect(pickLocalized(raw, 'en')).toBe('Clean code. Fast products.');
    expect(pickLocalized(raw, 'id')).toBe('Kode bersih. Produk cepat.');

    expect(tPick(PUBLIC_COPY.nav.projects, 'en')).toBe('Projects');
    expect(tPick(PUBLIC_COPY.nav.projects, 'id')).toBe('Proyek');
  });
});
