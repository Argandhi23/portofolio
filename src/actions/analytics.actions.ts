'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';
import type { ActionResult } from '@/types/action.types';

/**
 * Clears visitor page_views logs from the database.
 * Protected by requireAdmin().
 */
export async function clearVisitorLogs(): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from('page_views')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      return {
        success: false,
        message: `Gagal membersihkan riwayat kunjungan: ${error.message}`,
      };
    }

    revalidatePath('/admin');

    return {
      success: true,
      message: 'Riwayat kunjungan berhasil dibersihkan.',
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat membersihkan riwayat kunjungan.',
    };
  }
}
