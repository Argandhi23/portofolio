'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth-guard';
import { getPublicEnv } from '@/lib/env';
import { checkRateLimit } from '@/lib/rate-limit';
import { inquirySchema, type InquiryFormInput } from '@/lib/validations/inquiry.schema';
import type { ActionResult } from '@/types/action.types';
import type { Database, InquiryStatus } from '@/types/database.types';

async function getInquiryRateKey(): Promise<string> {
  try {
    const hdrs = await headers();
    const forwarded = hdrs.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : hdrs.get('x-real-ip') || 'local';
    return `public-inquiry:${ip}`;
  } catch {
    return 'public-inquiry:local';
  }
}

/**
 * Public Server Action to submit a project brief / contact inquiry.
 * Protected by Honeypot trap, IP sliding-window rate limiting, Zod validation,
 * and Postgres RLS (insert-only for anon).
 */
export async function submitInquiry(
  input: InquiryFormInput
): Promise<ActionResult<{ fallbackMailto?: boolean }>> {
  try {
    // 1. Silent Honeypot Anti-Bot Trap
    if (input.website_honeypot && input.website_honeypot.trim().length > 0) {
      return {
        success: true,
        message: 'Terima kasih! Pesan proyek Anda telah diterima.',
      };
    }

    // 2. Sliding-window rate limit (Max 3 inquiries per 10 minutes per IP)
    const rateKey = await getInquiryRateKey();
    const rate = checkRateLimit(rateKey, 3, 10 * 60_000);
    if (!rate.allowed) {
      return {
        success: false,
        message: `Terlalu banyak pengiriman pesan dalam waktu singkat. Silakan coba lagi dalam ${rate.retryAfterSeconds} detik atau hubungi via WhatsApp.`,
      };
    }

    // 3. Strict Zod Schema Validation
    const validation = inquirySchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: 'Mohon periksa kembali isian formulir Anda.',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const env = getPublicEnv();
    const supabase = createSupabaseClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // IMPORTANT: Do NOT chain .select() here because anon only has INSERT RLS permission (zero read leakage)
    const { error } = await supabase.from('inquiries').insert({
      name: validation.data.name,
      email: validation.data.email,
      subject: validation.data.subject || null,
      message: validation.data.message,
      status: 'unread',
    });

    if (error) {
      // Graceful fallback if table migration hasn't been executed on target DB
      if (error.code === '42P01' || error.code === 'PGRST205') {
        return {
          success: true,
          message: 'Menyiapkan aplikasi email Anda untuk mengirim brief secara langsung...',
          data: { fallbackMailto: true },
        };
      }

      return {
        success: false,
        message: 'Gagal menyimpan pesan saat ini. Silakan gunakan tombol WhatsApp atau Email langsung.',
      };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/inquiries');

    return {
      success: true,
      message:
        'Brief proyek berhasil terkirim langsung ke inbox Faqih! Saya akan segera meninjau dan membalas pesan Anda.',
    };
  } catch {
    return {
      success: false,
      message: 'Terjadi gangguan jaringan saat mengirim pesan. Silakan coba kembali.',
    };
  }
}

/**
 * Updates the read/replied status of an inquiry (Admin Only).
 */
export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id);

    if (error) {
      return {
        success: false,
        message: `Gagal memperbarui status pesan: ${error.message}`,
      };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/inquiries');

    return {
      success: true,
      message: 'Status pesan berhasil diperbarui.',
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat memperbarui status pesan.',
    };
  }
}

/**
 * Permanently deletes an inquiry from the inbox (Admin Only).
 */
export async function deleteInquiry(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from('inquiries').delete().eq('id', id);

    if (error) {
      return {
        success: false,
        message: `Gagal menghapus pesan: ${error.message}`,
      };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/inquiries');

    return {
      success: true,
      message: 'Pesan berhasil dihapus dari kotak masuk.',
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat menghapus pesan.',
    };
  }
}
