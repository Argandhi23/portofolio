import { z } from 'zod';
import { httpUrlSchema, navigationUrlSchema } from './url.schema';

export const settingsSchema = z.object({
  brand_name: z
    .string()
    .min(1, 'Nama brand wajib diisi')
    .max(50, 'Nama brand maksimal 50 karakter'),
  hero_greeting: z
    .string()
    .min(1, 'Greeting hero wajib diisi')
    .max(160, 'Greeting hero maksimal 160 karakter'),
  hero_title: z
    .string()
    .min(1, 'Judul hero wajib diisi')
    .max(220, 'Judul hero maksimal 220 karakter'),
  hero_subtitle: z
    .string()
    .min(1, 'Subtitle hero wajib diisi')
    .max(400, 'Subtitle hero maksimal 400 karakter'),
  hero_description: z
    .string()
    .min(1, 'Deskripsi hero wajib diisi'),
  hero_image_url: httpUrlSchema
    .nullable()
    .optional()
    .or(z.literal('')),
  about_label: z
    .string()
    .min(1, 'Label about wajib diisi')
    .max(140, 'Label about maksimal 140 karakter'),
  about_heading: z
    .string()
    .min(1, 'Heading about wajib diisi')
    .max(300, 'Heading about maksimal 300 karakter'),
  about_description: z
    .string()
    .min(1, 'Deskripsi about wajib diisi'),
  contact_email: z
    .string()
    .email('Format email kontak tidak valid')
    .nullable()
    .optional()
    .or(z.literal('')),
  whatsapp_number: z
    .string()
    .min(1, 'Nomor WhatsApp wajib diisi')
    .default('6285806912873'),
  github_url: httpUrlSchema
    .nullable()
    .optional()
    .or(z.literal('')),
  cta_url: navigationUrlSchema
    .default('#contact'),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
