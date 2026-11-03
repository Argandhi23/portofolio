import { unstable_cache } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getPublicEnv } from '@/lib/env';
import {
  DEFAULT_BRANDS,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
} from '@/lib/queries/project-fallbacks';
import type {
  Brand,
  Database,
  Project,
  Service,
  SiteSettings,
} from '@/types/database.types';

export const CACHE_TAGS = {
  SETTINGS: 'portfolio-settings',
  SERVICES: 'portfolio-services',
  BRANDS: 'portfolio-brands',
  PROJECTS: 'portfolio-projects',
} as const;

export { DEFAULT_BRANDS, DEFAULT_SERVICES, DEFAULT_SETTINGS };

/**
 * Creates a stateless public Supabase client without cookies.
 * Safe for use inside Next.js unstable_cache and static prerendering (SSG/ISR).
 */
function getPublicClient() {
  const env = getPublicEnv();
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Cached query for singleton site settings.
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      if (error) {
        console.error('Error fetching site_settings:', error.message);
      }
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...data,
      brand_name: data.brand_name || DEFAULT_SETTINGS.brand_name,
      hero_greeting: data.hero_greeting || DEFAULT_SETTINGS.hero_greeting,
      hero_title: data.hero_title || DEFAULT_SETTINGS.hero_title,
      hero_subtitle: data.hero_subtitle || DEFAULT_SETTINGS.hero_subtitle,
      hero_description: data.hero_description || DEFAULT_SETTINGS.hero_description,
      about_label: data.about_label || DEFAULT_SETTINGS.about_label,
      about_heading: data.about_heading || DEFAULT_SETTINGS.about_heading,
      about_description: data.about_description || DEFAULT_SETTINGS.about_description,
      contact_email: data.contact_email || DEFAULT_SETTINGS.contact_email,
      whatsapp_number: data.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number,
      github_url: data.github_url || DEFAULT_SETTINGS.github_url,
      cta_url: data.cta_url || DEFAULT_SETTINGS.cta_url,
    };
  },
  ['portfolio-site-settings'],
  {
    tags: [CACHE_TAGS.SETTINGS, 'settings'],
    revalidate: 3600,
  }
);

/**
 * Cached query for active services (#01 - #04).
 */
export const getServices = unstable_cache(
  async (): Promise<Service[]> => {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) {
        console.error('Error fetching services:', error.message);
      }
      return DEFAULT_SERVICES;
    }

    return data;
  },
  ['portfolio-services-list'],
  {
    tags: [CACHE_TAGS.SERVICES, 'services'],
    revalidate: 3600,
  }
);

/**
 * Cached query for active trusted brands / tech stack logos.
 */
export const getBrands = unstable_cache(
  async (): Promise<Brand[]> => {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) {
        console.error('Error fetching brands:', error.message);
      }
      return DEFAULT_BRANDS;
    }

    return data;
  },
  ['portfolio-brands-list'],
  {
    tags: [CACHE_TAGS.BRANDS, 'brands'],
    revalidate: 3600,
  }
);

/**
 * Cached query for published projects ordered by display_order ASC, created_at DESC.
 */
export const getPublishedProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching published projects:', error.message);
      return [];
    }

    return data ?? [];
  },
  ['portfolio-published-projects'],
  {
    tags: [CACHE_TAGS.PROJECTS, 'projects'],
    revalidate: 60,
  }
);

/**
 * Cached query for featured projects for the home page showcase.
 */
export const getFeaturedProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured projects:', error.message);
      return [];
    }

    return data ?? [];
  },
  ['portfolio-featured-projects'],
  {
    tags: [CACHE_TAGS.PROJECTS, 'projects'],
    revalidate: 60,
  }
);

/**
 * Cached query for a single published project by slug.
 */
export const getProjectBySlug = unstable_cache(
  async (slug: string): Promise<Project | null> => {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error(`Error fetching project by slug ${slug}:`, error.message);
      return null;
    }

    return data ?? null;
  },
  ['portfolio-project-by-slug'],
  {
    tags: [CACHE_TAGS.PROJECTS, 'projects'],
    revalidate: 60,
  }
);

/**
 * Returns the next published project in sequence for seamless case-study browsing.
 */
export async function getNextPublishedProject(
  currentSlug: string
): Promise<Project | null> {
  const projects = await getPublishedProjects();
  if (projects.length <= 1) return null;
  const idx = projects.findIndex((p) => p.slug === currentSlug);
  if (idx === -1) return projects[0];
  return projects[(idx + 1) % projects.length];
}
