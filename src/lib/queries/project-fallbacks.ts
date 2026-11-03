import type { Brand, Project, Service, SiteSettings } from '@/types/database.types';
import {
  encodeLocalized,
  pickLocalized,
  type Locale,
} from '@/lib/i18n/localized';

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  brand_name: 'Argandhi.',
  hero_greeting: encodeLocalized({
    en: "Hi, I'm Faqih Rafasha",
    id: 'Halo, saya Faqih Rafasha',
  }),
  hero_title: 'Software Developer',
  hero_subtitle: encodeLocalized({
    en: 'Clean code. Fast products.',
    id: 'Kode bersih. Produk cepat.',
  }),
  hero_description: encodeLocalized({
    en: 'Building web apps, Flutter APKs, and AI tools.',
    id: 'Membangun aplikasi web, APK Flutter, dan sistem AI.',
  }),
  hero_image_url: null,
  about_label: encodeLocalized({
    en: 'About',
    id: 'Tentang',
  }),
  about_heading: encodeLocalized({
    en: 'Building Practical Digital Products',
    id: 'Membangun Produk Digital Fungsional',
  }),
  about_description: encodeLocalized({
    en: 'Full-Stack Developer in Surabaya turning ideas into fast, reliable web and mobile apps.',
    id: 'Full-Stack Developer di Surabaya yang mengubah ide menjadi aplikasi web & mobile cepat.',
  }),
  contact_email: 'argandhi23@gmail.com',
  whatsapp_number: '6285806912873',
  github_url: 'https://github.com/Argandhi23',
  cta_url: '#contact',
  updated_at: new Date().toISOString(),
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 's1',
    number_label: '#01',
    title: encodeLocalized({
      en: 'Web Development',
      id: 'Pengembangan Web',
    }),
    display_order: 1,
    is_active: true,
    created_at: '',
  },
  {
    id: 's2',
    number_label: '#02',
    title: encodeLocalized({
      en: 'Mobile App (APK)',
      id: 'Aplikasi Mobile (APK)',
    }),
    display_order: 2,
    is_active: true,
    created_at: '',
  },
  {
    id: 's3',
    number_label: '#03',
    title: encodeLocalized({
      en: 'AI Engineering',
      id: 'Sistem & Integrasi AI',
    }),
    display_order: 3,
    is_active: true,
    created_at: '',
  },
  {
    id: 's4',
    number_label: '#04',
    title: encodeLocalized({
      en: 'UI/UX & Maintenance',
      id: 'UI/UX & Pemeliharaan',
    }),
    display_order: 4,
    is_active: true,
    created_at: '',
  },
];

export const DEFAULT_BRANDS: Brand[] = [
  { id: 'b1', name: 'Next.js', logo_url: null, website_url: 'https://nextjs.org', display_order: 1, is_active: true, created_at: '' },
  { id: 'b2', name: 'Supabase', logo_url: null, website_url: 'https://supabase.com', display_order: 2, is_active: true, created_at: '' },
  { id: 'b3', name: 'Shadcn UI', logo_url: null, website_url: 'https://ui.shadcn.com', display_order: 3, is_active: true, created_at: '' },
  { id: 'b4', name: 'Tailwind CSS', logo_url: null, website_url: 'https://tailwindcss.com', display_order: 4, is_active: true, created_at: '' },
  { id: 'b5', name: 'Flutter', logo_url: null, website_url: 'https://flutter.dev', display_order: 5, is_active: true, created_at: '' },
  { id: 'b6', name: 'Firebase', logo_url: null, website_url: 'https://firebase.google.com', display_order: 6, is_active: true, created_at: '' },
  { id: 'b7', name: 'React', logo_url: null, website_url: 'https://react.dev', display_order: 7, is_active: true, created_at: '' },
  { id: 'b8', name: 'Astro', logo_url: null, website_url: 'https://astro.build', display_order: 8, is_active: true, created_at: '' },
  { id: 'b9', name: 'Vercel', logo_url: null, website_url: 'https://vercel.com', display_order: 9, is_active: true, created_at: '' },
];

const GALLERY_CAPTION_PRESETS: Record<
  string,
  Array<{ en: string; id: string }>
> = {
  alparfume: [
    { en: 'Storefront & Search', id: 'Katalog & Pencarian' },
    { en: 'Product & Scent Notes', id: 'Detail Produk & Aroma' },
    { en: 'QRIS & Shipping Checkout', id: 'Checkout QRIS & Ongkir' },
  ],
  vetsy: [
    { en: 'Onboarding & Introduction', id: 'Onboarding & Pengenalan Aplikasi' },
    { en: 'Firebase Authentication', id: 'Autentikasi Firebase & Keamanan' },
    { en: 'Patient Home Dashboard', id: 'Beranda & Rekomendasi Klinik' },
    { en: 'Clinic Profile & Veterinarians', id: 'Detail Klinik & Profil Dokter' },
    { en: 'Services & Direct Booking', id: 'Katalog Layanan & Reservasi' },
    { en: 'Pet Health Profiles & Records', id: 'Profil Hewan & Rekam Medis' },
    { en: 'Real-Time Appointment Tracking', id: 'Jadwal & Status Janji Temu' },
    { en: 'Admin Operations Dashboard', id: 'Dashboard Moderasi Admin' },
  ],
  griyanesa: [
    { en: 'Homepage & Instant Radius Search', id: 'Beranda & Pencarian Berbasis Radius' },
    { en: 'Interactive Leaflet Campus Map', id: 'Peta Interaktif Kampus UNESA 5 (Leaflet)' },
    { en: 'Multi-Criteria Kost Filters & Catalog', id: 'Filter Spesifik & Katalog Kost Terkurasi' },
    { en: 'Kost Specification & Distance Meter', id: 'Detail Kamar & Jarak Presisi dari Kampus' },
    { en: 'Instant WhatsApp Booking Modal (Zero Login)', id: 'Modal Booking WhatsApp Instan Tanpa Login' },
    { en: 'Saved Listings & Client-Side Wishlist', id: 'Daftar Kost Tersimpan (Wishlist Lokal)' },
    { en: 'About the Initiative & PMW UNESA Story', id: 'Latar Belakang & Inisiatif PMW UNESA' },
  ],
};

/**
 * Resolves a concise, localized caption for a gallery snapshot index.
 */
export function resolveGalleryCaption(
  project: Pick<Project, 'slug' | 'title'>,
  index: number,
  locale: Locale = 'en'
): string {
  const preset = GALLERY_CAPTION_PRESETS[project.slug]?.[index];
  if (preset) {
    return locale === 'id' ? preset.id : preset.en;
  }
  const numDigits = String(index + 1).padStart(2, '0');
  const title = pickLocalized(project.title, locale);
  return locale === 'id'
    ? `${title} — Layar #${numDigits}`
    : `${title} — Screen #${numDigits}`;
}
