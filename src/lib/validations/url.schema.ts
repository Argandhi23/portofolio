import { z } from 'zod';

export const httpUrlSchema = z.string().url('Format URL tidak valid').refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch { return false; }
}, 'Gunakan URL HTTP atau HTTPS');

export const localPathSchema = z.string().refine(
  (value) => /^\/(?![\/\\])/.test(value) && !/[\\\u0000-\u0020]/.test(value),
  'Gunakan path lokal yang valid'
);

export const mediaUrlSchema = z.union([httpUrlSchema, localPathSchema]);
export const navigationUrlSchema = z.union([
  httpUrlSchema,
  localPathSchema,
  z.string().regex(/^#[a-zA-Z][\w-]*$/, 'Anchor tidak valid'),
]);
