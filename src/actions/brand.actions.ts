'use server';

import { z } from 'zod';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';
import { brandSchema, type BrandInput } from '@/lib/validations/brand.schema';
import { deleteMedia } from './storage.actions';
import type { ActionResult } from '@/types/action.types';
import type { Brand } from '@/types/database.types';

const CACHE_TAG_BRANDS = 'portfolio-brands';

/**
 * Creates a new partner/client brand.
 */
export async function createBrand(
  input: BrandInput
): Promise<ActionResult<Brand>> {
  try {
    const { supabase } = await requireAdmin();

    const validation = brandSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: 'Validasi data brand gagal.',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { data, error } = await supabase
      .from('brands')
      .insert({
        ...validation.data,
        logo_url: validation.data.logo_url || null,
        website_url: validation.data.website_url || null,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Gagal menambahkan brand: ${error.message}`,
      };
    }

    revalidateTag(CACHE_TAG_BRANDS, { expire: 0 });
    revalidateTag('brands', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/admin/brands');

    return {
      success: true,
      message: 'Brand berhasil ditambahkan.',
      data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat menambahkan brand.',
    };
  }
}

/**
 * Updates an existing brand and manages old logo storage cleanup.
 */
export async function updateBrand(
  id: string,
  input: BrandInput
): Promise<ActionResult<Brand>> {
  try {
    const { supabase } = await requireAdmin();

    if (!z.uuid().safeParse(id).success) {
      return { success: false, message: 'Input mutasi tidak valid.' };
    }

    const validation = brandSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: 'Validasi data brand gagal.',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Anti-orphan check: If logo was changed, remove old logo
    const { data: existingBrand, error: previousError } = await supabase
      .from('brands')
      .select('logo_url')
      .eq('id', id)
      .single();

    if (previousError) return { success: false, message: 'Data lama belum dapat dibaca. Perubahan dibatalkan.' };

    const { data, error } = await supabase
      .from('brands')
      .update({
        ...validation.data,
        logo_url: validation.data.logo_url || null,
        website_url: validation.data.website_url || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Gagal memperbarui brand: ${error.message}`,
      };
    }

    let cleanupMessage = '';
    if (
      existingBrand?.logo_url &&
      existingBrand.logo_url !== validation.data.logo_url
    ) {
      const cleanup = await deleteMedia(existingBrand.logo_url);
      if (!cleanup.success) cleanupMessage = ` Pembersihan media perlu dicoba ulang: ${cleanup.message}`;
    }

    revalidateTag(CACHE_TAG_BRANDS, { expire: 0 });
    revalidateTag('brands', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/admin/brands');

    return {
      success: true,
      message: 'Brand berhasil diperbarui.' + cleanupMessage,
      warning: cleanupMessage || undefined,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat memperbarui brand.',
    };
  }
}

/**
 * Deletes a brand and removes its logo from storage.
 */
export async function deleteBrand(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!z.uuid().safeParse(id).success) {
      return { success: false, message: 'Input mutasi tidak valid.' };
    }

    // Fetch logo to clean up storage
    const { data: existingBrand, error: previousError } = await supabase
      .from('brands')
      .select('logo_url')
      .eq('id', id)
      .single();

    if (previousError) return { success: false, message: 'Data lama belum dapat dibaca. Penghapusan dibatalkan.' };

    const { error } = await supabase.from('brands').delete().eq('id', id);

    if (error) {
      return {
        success: false,
        message: `Gagal menghapus brand: ${error.message}`,
      };
    }

    const cleanup = existingBrand?.logo_url ? await deleteMedia(existingBrand.logo_url) : null;

    revalidateTag(CACHE_TAG_BRANDS, { expire: 0 });
    revalidateTag('brands', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/admin/brands');

    return {
      success: true,
      warning: cleanup && !cleanup.success ? `Pembersihan media perlu dicoba ulang: ${cleanup.message}` : undefined,
      message: cleanup && !cleanup.success ? `Brand dihapus; pembersihan media perlu dicoba ulang: ${cleanup.message}` : 'Brand dan logo terkait berhasil dihapus.',
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat menghapus brand.',
    };
  }
}

/**
 * Toggles active status of a brand.
 */
export async function toggleBrandActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!z.uuid().safeParse(id).success || !z.boolean().safeParse(isActive).success) {
      return { success: false, message: 'Input mutasi tidak valid.' };
    }

    const { error } = await supabase
      .from('brands')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      return {
        success: false,
        message: `Gagal mengubah status aktif brand: ${error.message}`,
      };
    }

    revalidateTag(CACHE_TAG_BRANDS, { expire: 0 });
    revalidateTag('brands', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/admin/brands');

    return {
      success: true,
      message: `Status brand berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat mengubah status aktif brand.',
    };
  }
}
