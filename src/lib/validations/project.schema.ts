import { z } from 'zod';
import { slugify } from '@/lib/utils';

import { httpUrlSchema, mediaUrlSchema } from './url.schema';

export const projectSchema = z.object({
  title: z
    .string()
    .min(1, 'Judul project wajib diisi')
    .max(300, 'Judul project maksimal 300 karakter'),
  slug: z
    .string()
    .min(1, 'Slug wajib diisi')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Format slug tidak valid (hanya huruf kecil, angka, dan tanda hubung)'
    ),
  category: z
    .string()
    .min(1, 'Kategori project wajib diisi')
    .max(200, 'Kategori maksimal 200 karakter'),
  client_name: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  thumbnail_url: mediaUrlSchema,
  gallery_urls: z.array(mediaUrlSchema).default([]),
  tech_stack: z.array(z.string()).default([]),
  project_url: httpUrlSchema
    .nullable()
    .optional()
    .or(z.literal('')),
  github_url: httpUrlSchema
    .nullable()
    .optional()
    .or(z.literal('')),
  apk_url: httpUrlSchema
    .nullable()
    .optional()
    .or(z.literal('')),
  is_featured: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('draft'),
  display_order: z.coerce.number().int().default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;

/**
 * Helper to auto-generate a sanitized slug for projects
 */
export function generateProjectSlug(title: string): string {
  return slugify(title);
}
