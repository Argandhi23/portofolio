import { z } from 'zod';

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter')
    .max(120, 'Nama maksimal 120 karakter'),
  email: z
    .string()
    .trim()
    .min(5, 'Email wajib diisi')
    .max(160, 'Email maksimal 160 karakter')
    .email('Format alamat email tidak valid'),
  subject: z
    .string()
    .trim()
    .max(200, 'Subjek maksimal 200 karakter')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(10, 'Detail pesan minimal 10 karakter agar kebutuhan proyek jelas')
    .max(4000, 'Pesan maksimal 4000 karakter'),
  website_honeypot: z.string().max(0, 'Spam terdeteksi').optional().default(''),
});

export type InquiryFormInput = z.infer<typeof inquirySchema>;
