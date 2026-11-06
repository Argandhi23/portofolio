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
    { en: 'Onboarding', id: 'Pengenalan Aplikasi' },
    { en: 'User Login', id: 'Login Pengguna' },
    { en: 'Home & Clinics', id: 'Beranda & Klinik' },
    { en: 'Clinic & Doctors', id: 'Profil Klinik & Dokter' },
    { en: 'Service Booking', id: 'Pilih Layanan & Booking' },
    { en: 'Pet Health Records', id: 'Profil & Rekam Medis' },
    { en: 'Appointment Status', id: 'Jadwal & Status Booking' },
    { en: 'Clinic Admin Panel', id: 'Dashboard Admin Klinik' },
  ],
  griyanesa: [
    { en: 'Home & Search', id: 'Beranda & Pencarian' },
    { en: 'Campus Map', id: 'Peta Kampus UNESA 5' },
    { en: 'Kost Catalog & Filters', id: 'Katalog & Filter Kost' },
    { en: 'Room Details & Distance', id: 'Detail Kamar & Jarak' },
    { en: 'WhatsApp Booking', id: 'Booking via WhatsApp' },
    { en: 'Saved Wishlist', id: 'Kost Tersimpan' },
    { en: 'About PMW Initiative', id: 'Tentang Inisiatif PMW' },
  ],
  'desa-bogem': [
    { en: 'Home & Shortcuts', id: 'Beranda & Layanan Cepat' },
    { en: 'Satellite Map', id: 'Peta Satelit Wilayah' },
    { en: 'Village Structure', id: 'Struktur Perangkat Desa' },
    { en: 'Online Letter Request', id: 'Layanan Surat Online' },
    { en: 'Local UMKM Catalog', id: 'Katalog UMKM Desa' },
    { en: 'Population Stats', id: 'Statistik Penduduk & IDM' },
    { en: 'Village News', id: 'Berita & Agenda Desa' },
  ],
  fajartrans: [
    { en: 'Home & Hero', id: 'Beranda Utama' },
    { en: '4-Step Booking Guide', id: 'Alur Sewa 4 Langkah' },
    { en: 'Fleet & Pricing', id: 'Katalog Armada & Tarif' },
    { en: 'Rental & Tour Services', id: 'Layanan Sewa & Wisata' },
    { en: 'Company Profile', id: 'Profil Perusahaan' },
    { en: 'Contact & Garage Map', id: 'Kontak & Lokasi Garasi' },
    { en: 'Customer Reviews', id: 'Testimoni Pelanggan' },
  ],
  sumberwangi: [
    { en: 'Storefront Hero', id: 'Beranda Utama' },
    { en: 'Popular Scents', id: 'Varian Populer' },
    { en: '3-Step Ordering', id: 'Alur Pesan 3 Langkah' },
    { en: '11-Variant Catalog', id: 'Katalog 11 Varian' },
    { en: 'Product & WhatsApp Order', id: 'Detail Aroma & Pesan WA' },
    { en: 'Brand Story', id: 'Profil & Prinsip Mutu' },
  ],
  prabaswara: [
    { en: 'Home & Hero', id: 'Beranda Utama' },
    { en: 'Visual Philosophy & Story', id: 'Filosofi Visual & Profil' },
    { en: '4 Sub-Brand Showcase', id: 'Ekosistem 4 Sub-Brand' },
    { en: 'Service Packages & Pricing', id: 'Katalog Paket Harga' },
    { en: 'Curated Portfolio Gallery', id: 'Galeri Karya Pilihan' },
    { en: 'Sub-Brand Showcase Page', id: 'Halaman Khusus Sub-Brand' },
  ],
  'sistem-paket-warga': [
    { en: 'Login & Quick Demo Access', id: 'Login & Akses Cepat Demo' },
    { en: 'Admin Portal & System Summary', id: 'Portal Admin & Ringkasan Sistem' },
    { en: 'Security Manifest & Real-Time Log', id: 'Manifest Satpam & Log Real-Time' },
    { en: 'Package Analytics & Reports', id: 'Analitik & Laporan Paket' },
    { en: 'User & Resident Unit Mapping', id: 'Manajemen Pengguna & Unit' },
    { en: 'Resident Package Inventory', id: 'Inventaris Paket Warga' },
  ],
  craftbyhanifa: [
    { en: 'Login & 1-Click Quick Access', id: 'Login & Akses Cepat 1-Klik' },
    { en: 'Business & Profit Dashboard', id: 'Dashboard Ringkasan Usaha & Laba' },
    { en: 'Product Catalog & BOM Recipes', id: 'Katalog Produk & Formula Resep BOM' },
    { en: 'Raw Material & Moving Average Stock', id: 'Inventori Bahan Baku & Moving Average' },
    { en: 'Shopee & Offline Sales Orders', id: 'Transaksi Penjualan Shopee & Kasir' },
    { en: 'Income Statement & Net Margin', id: 'Laporan Laba Rugi & Margin Bersih' },
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
