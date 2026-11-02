export type Locale = 'en' | 'id';

export interface LocalizedPair {
  en: string;
  id: string;
}

export const LANG_DELIMITER = '<!--lang:id-->';

const ALPARFUME_CONCISE_CONTENT_EN = `## Project Goal

A fast D2C online store at alparfume.store where customers browse scents, check shipping rates, and pay via QRIS without creating an account.

## Key Features

- Server-Verified Checkout: Prices, variant sizes, and stock are validated server-side via PostgreSQL functions.
- Dynamic QRIS & Order Tracking: Instant QRIS payment with receipt upload and real-time shipment status.
- Auto Shipping & Store Pickup: Sub-district shipping calculation across major couriers plus local Madiun COD.
- Fragrance Catalog: Light/Dark storefront with scent notes pyramid and instant search.
- Admin Dashboard: Protected panel to manage products, stock, QRIS verification, and sales stats.

## Result

Built with Next.js, TypeScript, and Supabase RLS — running live in production with fast load times across mobile and desktop.`;

const ALPARFUME_CONCISE_CONTENT_ID = `## Tujuan Proyek

Toko online D2C cepat di alparfume.store agar pelanggan bisa memilih parfum, cek ongkir otomatis, dan bayar via QRIS tanpa perlu daftar akun.

## Fitur Utama

- Checkout Aman di Server: Harga varian, ongkir, dan stok diverifikasi langsung di server menggunakan fungsi PostgreSQL.
- QRIS Dinamis & Lacak Pesanan: Pembayaran QRIS instan dengan unggah bukti bayar dan pelacakan resi real-time.
- Ongkir Otomatis & COD Toko: Hitung ongkir multi-kurir hingga tingkat kecamatan serta opsi ambil di toko (Madiun).
- Katalog Parfum: Tampilan Light/Dark mode lengkap dengan piramida aroma dan pencarian instan.
- Dashboard Admin: Panel internal untuk kelola produk, stok, verifikasi pembayaran, dan statistik penjualan.

## Hasil

Dibangun dengan Next.js, TypeScript, dan Supabase RLS — aktif melayani transaksi nyata dengan performa ringan di mobile maupun desktop.`;

/**
 * Maps legacy/verbose default database strings to concise bilingual pairs
 * so existing Supabase records immediately render simplified EN & ID copy.
 */
const LEGACY_EXACT_PRESETS: Record<string, LocalizedPair> = {
  // Site Settings — Hero
  "Hey, I'm Faqih Rafasha — Full-Stack &": {
    en: "Hi, I'm Faqih Rafasha",
    id: 'Halo, saya Faqih Rafasha',
  },
  "Hey, I'm Faqih Rafasha —": {
    en: "Hi, I'm Faqih Rafasha",
    id: 'Halo, saya Faqih Rafasha',
  },
  'Software Developer': {
    en: 'Software Developer',
    id: 'Software Developer',
  },
  'Great software should feel effortless.': {
    en: 'Clean code. Fast products.',
    id: 'Kode bersih. Produk cepat.',
  },
  "Informatics Engineering student at UNESA ('24) & Freelance Full-Stack Developer crafting fast, scalable web apps, mobile APKs, and AI-powered software.":
    {
      en: 'Building web apps, Flutter APKs, and AI tools.',
      id: 'Membangun aplikasi web, APK Flutter, dan sistem AI.',
    },

  // Site Settings — About
  'Behind the Code': {
    en: 'About',
    id: 'Tentang',
  },
  'Engineering Digital Products That Solve Real Problems': {
    en: 'Building Practical Digital Products',
    id: 'Membangun Produk Digital Fungsional',
  },
  'Engineering Digital Products That Make Life Simpler': {
    en: 'Building Practical Digital Products',
    id: 'Membangun Produk Digital Fungsional',
  },
  "I'm Faqih Rafasha Argandhi, a Full-Stack & Software Developer based in Surabaya. With multiple production-ready websites and mobile APKs running live, I help businesses and clients turn complex ideas into clean, secure, and high-performance applications.":
    {
      en: 'Full-Stack Developer in Surabaya turning ideas into fast, reliable web and mobile apps.',
      id: 'Full-Stack Developer di Surabaya yang mengubah ide menjadi aplikasi web & mobile cepat.',
    },
  "I'm Faqih Rafasha Argandhi, a Full-Stack & Software Developer based in Surabaya. I focus on building clean, scalable web platforms, mobile APKs, and AI-integrated systems that solve real-world problems.":
    {
      en: 'Full-Stack Developer in Surabaya turning ideas into fast, reliable web and mobile apps.',
      id: 'Full-Stack Developer di Surabaya yang mengubah ide menjadi aplikasi web & mobile cepat.',
    },

  // Services (#01 - #04)
  'Web Development': {
    en: 'Web Development',
    id: 'Pengembangan Web',
  },
  'Mobile App (APK)': {
    en: 'Mobile App (APK)',
    id: 'Aplikasi Mobile (APK)',
  },
  'AI Integration & Engineering': {
    en: 'AI Engineering',
    id: 'Sistem & Integrasi AI',
  },
  'AI Engineering': {
    en: 'AI Engineering',
    id: 'Sistem & Integrasi AI',
  },
  'UI/UX & Maintenance': {
    en: 'UI/UX & Maintenance',
    id: 'UI/UX & Pemeliharaan',
  },

  // Al Parfume Project Fields
  'Al Parfume — Luxury D2C Fragrance E-Commerce': {
    en: 'Al Parfume',
    id: 'Al Parfume',
  },
  'Full-Stack E-Commerce': {
    en: 'E-Commerce',
    id: 'E-Commerce',
  },
  'Platform e-commerce parfum D2C produksi aktif dengan katalog editorial Light/Dark mode, piramida aroma, kalkulasi ongkir otomatis hingga tingkat kecamatan, pembayaran Dynamic QRIS, serta dashboard Admin manajemen pesanan & stok real-time.':
    {
      en: 'D2C perfume online store with auto shipping rates, dynamic QRIS checkout, and real-time stock dashboard.',
      id: 'Toko online parfum D2C dengan cek ongkir otomatis, pembayaran QRIS dinamis, dan dashboard stok real-time.',
    },
};

/**
 * Decodes a stored string into `{ en, id }`.
 * - Splits by `<!--lang:id-->` when explicitly bilingual.
 * - Maps known legacy verbose strings to concise EN/ID pairs.
 * - Falls back gracefully so both languages always have non-empty text.
 */
export function decodeLocalized(raw: string | null | undefined): LocalizedPair {
  if (!raw) {
    return { en: '', id: '' };
  }

  if (raw.includes(LANG_DELIMITER)) {
    const [rawEn = '', rawId = ''] = raw.split(LANG_DELIMITER);
    const en = rawEn.trim();
    const id = rawId.trim();
    return {
      en: en || id,
      id: id || en,
    };
  }

  const trimmed = raw.trim();

  if (LEGACY_EXACT_PRESETS[trimmed]) {
    return LEGACY_EXACT_PRESETS[trimmed];
  }

  // Legacy verbose Al Parfume markdown case study detection
  if (
    trimmed.includes('## Gambaran Proyek & Tantangan Bisnis') &&
    trimmed.includes('Zero-Trust Server-Side Checkout Engine')
  ) {
    return {
      en: ALPARFUME_CONCISE_CONTENT_EN,
      id: ALPARFUME_CONCISE_CONTENT_ID,
    };
  }

  return {
    en: trimmed,
    id: trimmed,
  };
}

/**
 * Encodes an `{ en, id }` pair into a single DB-compatible string.
 * Returns a plain string when `id` is empty or identical to `en`.
 */
export function encodeLocalized(pair: LocalizedPair): string {
  const en = pair.en.trim();
  const id = pair.id.trim();

  if (!en && !id) return '';
  if (!id || id === en) return en;
  if (!en) return id;

  return `${en}${LANG_DELIMITER}${id}`;
}

/**
 * Picks the localized text for a target locale with automatic fallback.
 */
export function pickLocalized(
  raw: string | null | undefined,
  locale: Locale
): string {
  const pair = decodeLocalized(raw);
  return locale === 'id' ? pair.id || pair.en : pair.en || pair.id;
}
