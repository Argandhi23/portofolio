import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const passwordResetSchema = z.object({
  password: z.string().min(8, 'Kata sandi minimal 8 karakter').max(128, 'Kata sandi maksimal 128 karakter'),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
  path: ['confirmPassword'], message: 'Konfirmasi kata sandi tidak cocok',
});
