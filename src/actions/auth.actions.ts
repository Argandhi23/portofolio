'use server';

import { z } from 'zod';
import { requireAdmin } from '@/lib/auth-guard';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { createClient } from '@/lib/supabase/server';
import { getAdminEmail, getPublicEnv } from '@/lib/env';
import { checkRateLimit } from '@/lib/rate-limit';
import { loginSchema, passwordResetSchema } from '@/lib/validations/auth.schema';
import type { ActionResult } from '@/types/action.types';

async function getClientRateKey(scope: string): Promise<string> {
  try {
    const hdrs = await headers();
    const forwarded = hdrs.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : hdrs.get('x-real-ip') || 'local';
    return `${scope}:${ip}`;
  } catch {
    return `${scope}:local`;
  }
}

/**
 * Server Action to authenticate an administrator.
 * Validates inputs with Zod, enforces sliding-window rate limiting, signs in with Supabase Auth,
 * and strictly verifies that the signed-in user matches process.env.ADMIN_EMAIL.
 */
export async function loginAdmin(
  prevStateOrFormData: ActionResult | FormData | undefined,
  formDataPayload?: FormData
): Promise<ActionResult> {
  const rateKey = await getClientRateKey('auth-login');
  const rate = checkRateLimit(rateKey, 5, 60_000);
  if (!rate.allowed) {
    return {
      success: false,
      message: `Terlalu banyak percobaan login. Silakan tunggu ${rate.retryAfterSeconds} detik lagi.`,
    };
  }

  const formData =
    prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : formDataPayload instanceof FormData
      ? formDataPayload
      : undefined;

  if (!formData) {
    return {
      success: false,
      message: 'Data formulir tidak ditemukan.',
    };
  }

  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      message: 'Validasi gagal. Periksa kembali input Anda.',
      fieldErrors: fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = validation.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        message: 'Email atau kata sandi tidak valid.',
      };
    }

    const adminEmail = getAdminEmail();
    if (!adminEmail || data.user.email?.toLowerCase() !== adminEmail) {
      // Sign out unauthorized user immediately (Defense-in-depth)
      await supabase.auth.signOut();
      return {
        success: false,
        message: 'Akses ditolak. Akun ini tidak memiliki hak akses administrator.',
      };
    }

    revalidatePath('/', 'layout');
    redirect('/admin/projects');
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat proses masuk.',
    };
  }
}

/**
 * Server Action to log out the administrator.
 * Signs out from Supabase Auth and redirects to /login.
 */
export async function logoutAdmin(): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) {
      return {
        success: false,
        message: `Gagal keluar: ${error.message}`,
      };
    }

    revalidatePath('/', 'layout');
    redirect('/login');
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat proses keluar.',
    };
  }
}

/**
 * Server Action to request a password reset email for the administrator.
 * Prevents user enumeration / admin email disclosure and uses NEXT_PUBLIC_SITE_URL.
 */
export async function sendAdminPasswordReset(email: string): Promise<ActionResult> {
  try {
    const rateKey = await getClientRateKey('auth-reset');
    const rate = checkRateLimit(rateKey, 3, 5 * 60_000);
    if (!rate.allowed) {
      return {
        success: false,
        message: `Terlalu banyak permintaan pemulihan. Coba lagi dalam ${rate.retryAfterSeconds} detik.`,
      };
    }

    const validation = z.string().trim().email().max(160).safeParse(email);
    if (!validation.success) {
      return {
        success: false,
        message: 'Masukkan alamat email yang valid terlebih dahulu.',
      };
    }

    const normalizedInput = validation.data.toLowerCase();
    const adminEmail = getAdminEmail();
    const neutralSuccessMessage =
      'Jika email terdaftar sebagai administrator, tautan pemulihan kata sandi telah dikirim. Silakan periksa inbox atau folder spam Anda.';

    // Never reveal the configured ADMIN_EMAIL if someone submits another address
    if (!adminEmail || normalizedInput !== adminEmail) {
      return {
        success: true,
        message: neutralSuccessMessage,
      };
    }

    const supabase = await createClient();
    const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedInput, {
      redirectTo: `${NEXT_PUBLIC_SITE_URL}/auth/callback`,
    });

    if (error) {
      return {
        success: false,
        message: 'Permintaan pemulihan belum dapat diproses saat ini. Silakan coba beberapa saat lagi.',
      };
    }

    return {
      success: true,
      message: neutralSuccessMessage,
    };
  } catch {
    return {
      success: false,
      message: 'Terjadi kesalahan sistem saat mengirim pemulihan kata sandi.',
    };
  }
}

/** Authenticated recovery users must still match ADMIN_EMAIL before changing a password. */
export async function resetAdminPassword(
  _previous: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const validation = passwordResetSchema.safeParse(formData instanceof FormData ? {
      password: formData.get('password'), confirmPassword: formData.get('confirmPassword'),
    } : null);
    if (!validation.success) {
      return { success: false, message: 'Periksa kata sandi baru Anda.', fieldErrors: validation.error.flatten().fieldErrors };
    }
    const { error } = await supabase.auth.updateUser({ password: validation.data.password });
    if (error) return { success: false, message: 'Kata sandi belum dapat diperbarui. Coba tautan pemulihan baru.' };
    const { error: signOutError } = await supabase.auth.signOut().catch(() => ({ error: new Error('Sign-out unavailable') }));
    if (signOutError) {
      return { success: false, message: 'Kata sandi sudah diperbarui, tetapi sesi belum dapat diakhiri. Buka /admin dan gunakan tombol keluar; jangan ulangi penyimpanan kata sandi.' };
    }
    revalidatePath('/', 'layout');
    redirect('/login');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: 'Sesi pemulihan tidak valid atau telah berakhir.' };
  }
}
