import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL harus berupa URL Supabase yang valid'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diisi'),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url('NEXT_PUBLIC_SITE_URL harus berupa URL yang valid')
    .default('http://localhost:3000'),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

/**
 * Validates and returns public environment variables.
 * Uses explicit property reads so Next.js can inline NEXT_PUBLIC_* on the client.
 */
export function getPublicEnv(): PublicEnv {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
    NEXT_PUBLIC_SITE_URL:
      rawSiteUrl && rawSiteUrl.length > 0
        ? rawSiteUrl.replace(/\/+$/, '')
        : 'http://localhost:3000',
  });

  if (!parsed.success) {
    const details = Object.entries(parsed.error.flatten().fieldErrors)
      .map(([key, msgs]) => `${key}: ${(msgs ?? []).join(', ')}`)
      .join(' | ');
    throw new Error(`Invalid environment configuration — ${details}`);
  }

  return parsed.data;
}

/**
 * Returns the normalized administrator email (server-only).
 */
export function getAdminEmail(): string | undefined {
  const raw = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return raw && raw.length > 0 ? raw : undefined;
}
