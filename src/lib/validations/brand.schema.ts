import { z } from 'zod';
import { httpUrlSchema } from './url.schema';

export const brandSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama brand wajib diisi')
    .max(100, 'Nama brand maksimal 100 karakter'),
  logo_url: httpUrlSchema
    .nullable()
    .optional()
    .or(z.literal('')),
  website_url: httpUrlSchema
    .nullable()
    .optional()
    .or(z.literal('')),
  display_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export type BrandInput = z.infer<typeof brandSchema>;
