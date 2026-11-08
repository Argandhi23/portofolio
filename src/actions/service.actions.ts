'use server';

import { z } from 'zod';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';
import { serviceSchema, type ServiceInput } from '@/lib/validations/service.schema';
import type { ActionResult } from '@/types/action.types';
import type { Service } from '@/types/database.types';

const CACHE_TAG_SERVICES = 'portfolio-services';

/**
 * Creates a new service offering (#01 - #04).
 */
export async function createService(
  input: ServiceInput
): Promise<ActionResult<Service>> {
  try {
    const { supabase } = await requireAdmin();

    const validation = serviceSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: 'Validasi data layanan gagal.',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { data, error } = await supabase
      .from('services')
      .insert(validation.data)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Gagal menambahkan layanan: ${error.message}`,
      };
    }

    revalidateTag(CACHE_TAG_SERVICES, { expire: 0 });
    revalidateTag('services', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/admin/services');

    return {
      success: true,
      message: 'Layanan baru berhasil ditambahkan.',
      data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat menambahkan layanan.',
    };
  }
}

/**
 * Updates an existing service.
 */
export async function updateService(
  id: string,
  input: ServiceInput
): Promise<ActionResult<Service>> {
  try {
    const { supabase } = await requireAdmin();

    if (!z.uuid().safeParse(id).success) {
      return { success: false, message: 'Input mutasi tidak valid.' };
    }

    const validation = serviceSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: 'Validasi data layanan gagal.',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { data, error } = await supabase
      .from('services')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Gagal memperbarui layanan: ${error.message}`,
      };
    }

    revalidateTag(CACHE_TAG_SERVICES, { expire: 0 });
    revalidateTag('services', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/admin/services');

    return {
      success: true,
      message: 'Layanan berhasil diperbarui.',
      data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat memperbarui layanan.',
    };
  }
}

/**
 * Deletes a service.
 */
export async function deleteService(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!z.uuid().safeParse(id).success) {
      return { success: false, message: 'Input mutasi tidak valid.' };
    }

    const { error } = await supabase.from('services').delete().eq('id', id);

    if (error) {
      return {
        success: false,
        message: `Gagal menghapus layanan: ${error.message}`,
      };
    }

    revalidateTag(CACHE_TAG_SERVICES, { expire: 0 });
    revalidateTag('services', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/admin/services');

    return {
      success: true,
      message: 'Layanan berhasil dihapus.',
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat menghapus layanan.',
    };
  }
}

/**
 * Toggles active status of a service.
 */
export async function toggleServiceActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!z.uuid().safeParse(id).success || !z.boolean().safeParse(isActive).success) {
      return { success: false, message: 'Input mutasi tidak valid.' };
    }

    const { error } = await supabase
      .from('services')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      return {
        success: false,
        message: `Gagal mengubah status aktif layanan: ${error.message}`,
      };
    }

    revalidateTag(CACHE_TAG_SERVICES, { expire: 0 });
    revalidateTag('services', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/admin/services');

    return {
      success: true,
      message: `Status layanan berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat mengubah status aktif layanan.',
    };
  }
}
