'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';
import { settingsSchema, type SettingsInput } from '@/lib/validations/settings.schema';
import { deleteMedia } from './storage.actions';
import type { ActionResult } from '@/types/action.types';
import type { SiteSettings } from '@/types/database.types';

const CACHE_TAG_SETTINGS = 'portfolio-settings';

/**
 * Updates the singleton site_settings (row id = 1).
 * Cleans up old hero image from storage if replaced.
 */
export async function updateSettings(
  input: SettingsInput
): Promise<ActionResult<SiteSettings>> {
  try {
    const { supabase } = await requireAdmin();

    const validation = settingsSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: 'Validasi pengaturan situs gagal.',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // 1. Fetch current settings to clean up any legacy hero image in storage
    const { data: existingSettings, error: previousError } = await supabase
      .from('site_settings')
      .select('hero_image_url')
      .eq('id', 1)
      .single();

    if (previousError && previousError.code !== 'PGRST116') return { success: false, message: 'Data lama belum dapat dibaca. Perubahan dibatalkan.' };

    // 2. Upsert settings row id = 1 (hero_image_url is always null because Hero uses 3D character)
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1,
        ...validation.data,
        hero_image_url: null,
        contact_email: validation.data.contact_email || null,
        whatsapp_number: validation.data.whatsapp_number || '6285806912873',
        github_url: validation.data.github_url || null,
        cta_url: validation.data.cta_url || '#contact',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Gagal memperbarui pengaturan situs: ${error.message}`,
      };
    }

    let cleanupMessage = '';
    if (existingSettings?.hero_image_url) {
      const cleanup = await deleteMedia(existingSettings.hero_image_url);
      if (!cleanup.success) cleanupMessage = ` Pembersihan media perlu dicoba ulang: ${cleanup.message}`;
    }

    revalidateTag(CACHE_TAG_SETTINGS, { expire: 0 });
    revalidateTag('settings', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/admin/settings');

    return {
      success: true,
      message: 'Pengaturan situs berhasil diperbarui.' + cleanupMessage,
      warning: cleanupMessage || undefined,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat memperbarui pengaturan situs.',
    };
  }
}
