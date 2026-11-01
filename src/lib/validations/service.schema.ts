import { z } from 'zod';

export const serviceSchema = z.object({
  number_label: z
    .string()
    .min(1, 'Label nomor wajib diisi (contoh: #01)')
    .max(10, 'Label nomor maksimal 10 karakter'),
  title: z
    .string()
    .min(1, 'Judul layanan wajib diisi')
    .max(100, 'Judul layanan maksimal 100 karakter'),
  display_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
