'use server';

import crypto from 'crypto';
import { z } from 'zod';
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

    const payload = z.object({
      file: z.instanceof(File),
      folder: z.string().max(80),
    }).safeParse(formData instanceof FormData ? {
      file: formData.get('file'), folder: formData.get('folder') ?? 'uploads',
    } : null);
    if (!payload.success) return { success: false, message: 'Data unggahan tidak valid.' };
    const { file, folder } = payload.data;

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
    await requireAdmin();
    const validation = z.string().min(1).max(2048).safeParse(fileUrlOrPath);
    if (!validation.success) return { success: false, message: 'Path file tidak valid.' };

    // Delegate to the batch path so reference checks are identical.
    const result = await deleteMultipleMedia([validation.data]);
    return { success: result.success, message: result.message };
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
    const { supabase } = await requireAdmin();
    const validation = z.array(z.string().min(1).max(2048)).max(200).safeParse(fileUrlsOrPaths);
    if (!validation.success) return { success: false, message: 'Daftar file tidak valid.' };

    const storage = supabase.storage.from(BUCKET_NAME);
    const bucketOrigin = new URL(storage.getPublicUrl('probe').data.publicUrl).origin;
    const objectPath = (value: string): string | null => {
      if (/^https?:/i.test(value) && new URL(value).origin !== bucketOrigin) return null;
      return extractStoragePath(value, BUCKET_NAME);
    };
    const candidates = new Set(validation.data.map(objectPath).filter((path): path is string => !!path));
    if (candidates.size > 0) {
      // Read all reference pages, not just the first PostgREST page. Normalize
      // URLs to object paths so encoded names and query/fragment aliases match.
      // Admin-only work; never load project content or private visitor data.
      const readers = [
        async (offset: number) => {
          const { data, error } = await supabase.from('projects')
            .select('thumbnail_url,gallery_urls').order('id').range(offset, offset + 199);
          return { error: error || (data === null ? new Error('Reference data unavailable') : null), count: data?.length ?? 0, urls: data?.flatMap((row) => [row.thumbnail_url, ...row.gallery_urls]) ?? [] };
        },
        async (offset: number) => {
          const { data, error } = await supabase.from('brands')
            .select('logo_url').order('id').range(offset, offset + 199);
          return { error: error || (data === null ? new Error('Reference data unavailable') : null), count: data?.length ?? 0, urls: data?.map((row) => row.logo_url) ?? [] };
        },
        async (offset: number) => {
          const { data, error } = await supabase.from('site_settings')
            .select('hero_image_url').order('id').range(offset, offset + 199);
          return { error: error || (data === null ? new Error('Reference data unavailable') : null), count: data?.length ?? 0, urls: data?.map((row) => row.hero_image_url) ?? [] };
        },
      ];
      for (const readPage of readers) {
        let offset = 0;
        while (candidates.size > 0) {
          const page = await readPage(offset);
          if (page.error) {
            return { success: false, message: 'Referensi media belum dapat diverifikasi; file dipertahankan.' };
          }
          for (const url of page.urls) {
            if (!url) continue;
            const path = objectPath(url);
            if (path) candidates.delete(path);
          }
          if (page.count === 0) break;
          // Advance by the actual count even if the service's page cap is <200.
          offset += page.count;
        }
      }
    }
    const pathsToDelete = [...candidates];

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
