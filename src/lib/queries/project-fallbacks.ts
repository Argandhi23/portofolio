import type { Brand, Project, Service, SiteSettings } from '@/types/database.types';

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  brand_name: 'Argandhi.',
  hero_greeting: "Hey, I'm Faqih Rafasha — Full-Stack &",
  hero_title: 'Software Developer',
  hero_subtitle: 'Great software should feel effortless.',
  hero_description:
    "Informatics Engineering student at UNESA ('24) & Freelance Full-Stack Developer crafting fast, scalable web apps, mobile APKs, and AI-powered software.",
  hero_image_url: null,
  about_label: 'Behind the Code',
  about_heading: 'Engineering Digital Products That Solve Real Problems',
  about_description:
    "I'm Faqih Rafasha Argandhi, a Full-Stack & Software Developer based in Surabaya. With multiple production-ready websites and mobile APKs running live, I help businesses and clients turn complex ideas into clean, secure, and high-performance applications.",
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
    title: 'Web Development',
    display_order: 1,
    is_active: true,
    created_at: '',
  },
  {
    id: 's2',
    number_label: '#02',
    title: 'Mobile App (APK)',
    display_order: 2,
    is_active: true,
    created_at: '',
  },
  {
    id: 's3',
    number_label: '#03',
    title: 'AI Integration & Engineering',
    display_order: 3,
    is_active: true,
    created_at: '',
  },
  {
    id: 's4',
    number_label: '#04',
    title: 'UI/UX & Maintenance',
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

const GALLERY_CAPTION_PRESETS: Record<string, string[]> = {
  alparfume: [
    'Best Seller Catalog, Instant Fragrance Search & Obsidian Dark Mode',
    'Product Detail, Aroma Pyramid (Top / Heart / Base Notes) & Variant Stock',
    'Zero-Trust Server Checkout, Multi-Courier Shipping & Dynamic QRIS Flow',
  ],
};

/**
 * Resolves a human-friendly caption for a gallery snapshot index.
 */
export function resolveGalleryCaption(
  project: Pick<Project, 'slug' | 'title'>,
  index: number
): string {
  const preset = GALLERY_CAPTION_PRESETS[project.slug]?.[index];
  if (preset) return preset;
  const numDigits = String(index + 1).padStart(2, '0');
  return `${project.title} — System Screen #${numDigits}`;
}
