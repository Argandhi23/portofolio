import { z } from 'zod';

export const brandSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama brand wajib diisi')
    .max(100, 'Nama brand maksimal 100 karakter'),
  logo_url: z
    .string()
    .url('Format URL logo tidak valid')
    .nullable()
    .optional()
    .or(z.literal('')),
  website_url: z
    .string()
    .url('Format URL website tidak valid')
    .nullable()
    .optional()
    .or(z.literal('')),
  display_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export type BrandInput = z.infer<typeof brandSchema>;
