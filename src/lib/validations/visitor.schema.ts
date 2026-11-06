import { z } from 'zod';

export const trackVisitSchema = z.object({
  visitorId: z
    .string()
    .trim()
    .min(8, 'Visitor ID minimal 8 karakter')
    .max(120, 'Visitor ID maksimal 120 karakter')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Format Visitor ID tidak valid'),
  path: z
    .string()
    .trim()
    .min(1, 'Path wajib diisi')
    .max(300, 'Path maksimal 300 karakter')
    .refine(
      (val) =>
        val.startsWith('/') &&
        !val.startsWith('/admin') &&
        !val.startsWith('/login') &&
        !val.startsWith('/api'),
      'Path tidak dilacak'
    ),
  referrer: z.string().trim().max(500).nullable().optional().or(z.literal('')),
  timezone: z.string().trim().max(100).nullable().optional().or(z.literal('')),
  isReturning: z.boolean().optional().default(false),
});

export type TrackVisitInput = z.infer<typeof trackVisitSchema>;
