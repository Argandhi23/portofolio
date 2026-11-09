'use server';

import { z } from 'zod';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';
import { projectSchema, type ProjectInput } from '@/lib/validations/project.schema';
import { deleteMultipleMedia } from './storage.actions';
import type { ActionResult } from '@/types/action.types';
import type { Project } from '@/types/database.types';

const CACHE_TAG_PROJECTS = 'portfolio-projects';

/**
 * Creates a new portfolio project.
 */
export async function createProject(
  input: ProjectInput
): Promise<ActionResult<Project>> {
  try {
    const { supabase } = await requireAdmin();

    const validation = projectSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: 'Validasi data project gagal.',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...validation.data,
        tech_stack: validation.data.tech_stack || [],
        project_url: validation.data.project_url || null,
        github_url: validation.data.github_url || null,
        apk_url: validation.data.apk_url || null,
        client_name: validation.data.client_name || null,
        summary: validation.data.summary || null,
        content: validation.data.content || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          message: 'Slug project sudah digunakan. Silakan gunakan slug lain.',
          fieldErrors: { slug: ['Slug ini sudah ada dalam database.'] },
        };
      }
      return {
        success: false,
        message: `Gagal membuat project: ${error.message}`,
      };
    }

    revalidateTag(CACHE_TAG_PROJECTS, { expire: 0 });
    revalidateTag('projects', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/admin/projects');

    return {
      success: true,
      message: 'Project berhasil ditambahkan.',
      data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat membuat project.',
    };
  }
}

/**
 * Updates an existing portfolio project and cleans up replaced media files.
 */
export async function updateProject(
  id: string,
  input: ProjectInput
): Promise<ActionResult<Project>> {
  try {
    const { supabase } = await requireAdmin();

    if (!z.uuid().safeParse(id).success) {
      return { success: false, message: 'Input mutasi tidak valid.' };
    }

    const validation = projectSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: 'Validasi data project gagal.',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // 1. Fetch old project to detect replaced files (Anti-orphan storage management)
    const { data: existingProject, error: previousError } = await supabase
      .from('projects')
      .select('thumbnail_url, gallery_urls, slug')
      .eq('id', id)
      .single();

    if (previousError) return { success: false, message: 'Data lama belum dapat dibaca. Perubahan dibatalkan.' };

    // 2. Perform database update
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...validation.data,
        tech_stack: validation.data.tech_stack || [],
        project_url: validation.data.project_url || null,
        github_url: validation.data.github_url || null,
        apk_url: validation.data.apk_url || null,
        client_name: validation.data.client_name || null,
        summary: validation.data.summary || null,
        content: validation.data.content || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          message: 'Slug project sudah digunakan. Silakan gunakan slug lain.',
          fieldErrors: { slug: ['Slug ini sudah ada dalam database.'] },
        };
      }
      return {
        success: false,
        message: `Gagal memperbarui project: ${error.message}`,
      };
    }

    // Only remove media after the row has been saved. A URL may move between
    // thumbnail and gallery, so compare the complete retained set.
    const retained = new Set([data.thumbnail_url, ...data.gallery_urls]);
    const removed = existingProject
      ? [existingProject.thumbnail_url, ...existingProject.gallery_urls].filter((url) => !retained.has(url))
      : [];
    const cleanup = await deleteMultipleMedia(removed);

    revalidateTag(CACHE_TAG_PROJECTS, { expire: 0 });
    revalidateTag('projects', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/admin/projects');
    revalidatePath(`/admin/projects/${id}/edit`);
    revalidatePath(`/projects/${data.slug}`);
    if (existingProject?.slug && existingProject.slug !== data.slug) revalidatePath(`/projects/${existingProject.slug}`);

    return {
      success: true,
      warning: cleanup.success ? undefined : `Pembersihan media perlu dicoba ulang: ${cleanup.message}`,
      message: cleanup.success ? 'Project berhasil diperbarui.' : `Project tersimpan; pembersihan media perlu dicoba ulang: ${cleanup.message}`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat memperbarui project.',
    };
  }
}

/**
 * Deletes a portfolio project and completely cleans up all related media files from storage.
 */
export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!z.uuid().safeParse(id).success) {
      return { success: false, message: 'Input mutasi tidak valid.' };
    }

    // 1. Fetch project images to clean up storage
    const { data: project, error: previousError } = await supabase
      .from('projects')
      .select('thumbnail_url, gallery_urls, slug')
      .eq('id', id)
      .single();

    if (previousError) return { success: false, message: 'Data lama belum dapat dibaca. Penghapusan dibatalkan.' };

    // 2. Delete database row
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      return {
        success: false,
        message: `Gagal menghapus project: ${error.message}`,
      };
    }

    const cleanup = await deleteMultipleMedia(project ? [project.thumbnail_url, ...project.gallery_urls] : []);

    revalidateTag(CACHE_TAG_PROJECTS, { expire: 0 });
    revalidateTag('projects', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/admin/projects');
    if (project?.slug) {
      revalidatePath(`/projects/${project.slug}`);
    }

    return {
      success: true,
      warning: cleanup.success ? undefined : `Pembersihan media perlu dicoba ulang: ${cleanup.message}`,
      message: cleanup.success ? 'Project dan media terkait berhasil dihapus.' : `Project dihapus; pembersihan media perlu dicoba ulang: ${cleanup.message}`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat menghapus project.',
    };
  }
}

/**
 * Toggles draft/published status of a project.
 */
export async function toggleProjectStatus(
  id: string,
  newStatus: 'draft' | 'published'
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!z.uuid().safeParse(id).success || !z.enum(['draft', 'published']).safeParse(newStatus).success) {
      return { success: false, message: 'Input mutasi tidak valid.' };
    }

    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      return {
        success: false,
        message: `Gagal mengubah status project: ${error.message}`,
      };
    }

    revalidateTag(CACHE_TAG_PROJECTS, { expire: 0 });
    revalidateTag('projects', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/admin/projects');

    return {
      success: true,
      message: `Status project berhasil diubah menjadi ${newStatus}.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat mengubah status project.',
    };
  }
}

/**
 * Toggles featured status of a project.
 */
export async function toggleProjectFeatured(
  id: string,
  isFeatured: boolean
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!z.uuid().safeParse(id).success || !z.boolean().safeParse(isFeatured).success) {
      return { success: false, message: 'Input mutasi tidak valid.' };
    }

    const { error } = await supabase
      .from('projects')
      .update({ is_featured: isFeatured })
      .eq('id', id);

    if (error) {
      return {
        success: false,
        message: `Gagal mengubah status featured: ${error.message}`,
      };
    }

    revalidateTag(CACHE_TAG_PROJECTS, { expire: 0 });
    revalidateTag('projects', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/admin/projects');

    return {
      success: true,
      message: `Project ${isFeatured ? 'ditetapkan sebagai featured' : 'dilepas dari featured'}.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat mengubah status featured.',
    };
  }
}
