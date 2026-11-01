'use server';

import crypto from 'crypto';
import { requireAdmin } from '@/lib/auth-guard';
import { validateImageBuffer } from '@/lib/file-security';
import { extractStoragePath } from '@/lib/utils';
import type { ActionResult } from '@/types/action.types';

const BUCKET_NAME = 'portfolio-media';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES = [
  'image/webp',
  'image/jpeg',
  'image/png',
  'image/avif',
  'image/svg+xml',
];

const MIME_TO_DEFAULT_EXT: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

/**
 * Upload an image file to Supabase Storage bucket 'portfolio-media'.
 * Strictly protected with requireAdmin(), validates file size, MIME type,
 * binary magic bytes, and scans SVG content against stored XSS payloads.
 */
export async function uploadMedia(
  formData: FormData
): Promise<ActionResult<{ url: string; path: string }>> {
  try {
    const { supabase } = await requireAdmin();

    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file || file.size === 0) {
      return {
        success: false,
        message: 'File gambar tidak ditemukan atau kosong.',
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: 'Ukuran file melebihi batas maksimum 5MB.',
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        message:
          'Format file tidak didukung. Harap unggah gambar WebP, JPEG, PNG, AVIF, atau SVG.',
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Deep inspection: verify magic bytes & reject malicious SVG scripts
    const integrity = validateImageBuffer(buffer, file.type);
    if (!integrity.valid) {
      return {
        success: false,
        message: integrity.reason || 'Konten binary gambar tidak valid.',
      };
    }

    const sanitizedExt = MIME_TO_DEFAULT_EXT[file.type] || 'webp';
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_\-]/g, '') || 'uploads';
    const filePath = `${sanitizedFolder}/${timestamp}-${uniqueId}.${sanitizedExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        message: `Gagal mengunggah file ke storage: ${uploadError.message}`,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      success: true,
      message: 'File berhasil diunggah.',
      data: {
        url: publicUrlData.publicUrl,
        path: filePath,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat proses unggah file.',
    };
  }
}

/**
 * Deletes a file from Supabase Storage by its public URL or relative path.
 * Anti-orphan file management helper.
 */
export async function deleteMedia(fileUrlOrPath: string): Promise<ActionResult> {
  try {
    if (!fileUrlOrPath || typeof fileUrlOrPath !== 'string') {
      return {
        success: false,
        message: 'Path file tidak valid.',
      };
    }

    const { supabase } = await requireAdmin();

    const filePath =
      fileUrlOrPath.startsWith('http://') || fileUrlOrPath.startsWith('https://')
        ? extractStoragePath(fileUrlOrPath, BUCKET_NAME)
        : fileUrlOrPath;

    if (!filePath) {
      return {
        success: false,
        message: 'Tidak dapat mengekstrak path file dari URL storage.',
      };
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      return {
        success: false,
        message: `Gagal menghapus file dari storage: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'File berhasil dihapus dari storage.',
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat menghapus file.',
    };
  }
}

/**
 * Deletes multiple files from Supabase Storage by array of URLs/paths.
 */
export async function deleteMultipleMedia(
  fileUrlsOrPaths: string[]
): Promise<ActionResult<{ deletedCount: number }>> {
  try {
    if (!Array.isArray(fileUrlsOrPaths) || fileUrlsOrPaths.length === 0) {
      return {
        success: true,
        message: 'Tidak ada file untuk dihapus.',
        data: { deletedCount: 0 },
      };
    }

    const { supabase } = await requireAdmin();

    const pathsToDelete = fileUrlsOrPaths
      .map((item) =>
        item.startsWith('http://') || item.startsWith('https://')
          ? extractStoragePath(item, BUCKET_NAME)
          : item
      )
      .filter((p): p is string => Boolean(p));

    if (pathsToDelete.length === 0) {
      return {
        success: true,
        message: 'Tidak ada file valid yang perlu dihapus.',
        data: { deletedCount: 0 },
      };
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(pathsToDelete);

    if (error) {
      return {
        success: false,
        message: `Gagal menghapus file: ${error.message}`,
      };
    }

    return {
      success: true,
      message: `${pathsToDelete.length} file berhasil dibersihkan dari storage.`,
      data: { deletedCount: pathsToDelete.length },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat menghapus beberapa file.',
    };
  }
}
