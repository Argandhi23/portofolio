'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';
import { projectSchema, type ProjectInput } from '@/lib/validations/project.schema';
import { deleteMedia, deleteMultipleMedia } from './storage.actions';
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

    const validation = projectSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: 'Validasi data project gagal.',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // 1. Fetch old project to detect replaced files (Anti-orphan storage management)
    const { data: existingProject } = await supabase
      .from('projects')
      .select('thumbnail_url, gallery_urls')
      .eq('id', id)
      .single();

    if (existingProject) {
      // If thumbnail was changed, remove old thumbnail
      if (
        existingProject.thumbnail_url &&
        existingProject.thumbnail_url !== validation.data.thumbnail_url
      ) {
        await deleteMedia(existingProject.thumbnail_url);
      }

      // Check removed gallery items
      if (Array.isArray(existingProject.gallery_urls)) {
        const newGallerySet = new Set(validation.data.gallery_urls);
        const removedGalleryItems = existingProject.gallery_urls.filter(
          (url) => !newGallerySet.has(url)
        );
        if (removedGalleryItems.length > 0) {
          await deleteMultipleMedia(removedGalleryItems);
        }
      }
    }

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

    revalidateTag(CACHE_TAG_PROJECTS, { expire: 0 });
    revalidateTag('projects', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/admin/projects');
    revalidatePath(`/admin/projects/${id}/edit`);
    revalidatePath(`/projects/${data.slug}`);

    return {
      success: true,
      message: 'Project berhasil diperbarui.',
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

    // 1. Fetch project images to clean up storage
    const { data: project } = await supabase
      .from('projects')
      .select('thumbnail_url, gallery_urls, slug')
      .eq('id', id)
      .single();

    if (project) {
      if (project.thumbnail_url) {
        await deleteMedia(project.thumbnail_url);
      }
      if (Array.isArray(project.gallery_urls) && project.gallery_urls.length > 0) {
        await deleteMultipleMedia(project.gallery_urls);
      }
    }

    // 2. Delete database row
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      return {
        success: false,
        message: `Gagal menghapus project: ${error.message}`,
      };
    }

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
      message: 'Project dan seluruh berkas media terkait berhasil dihapus.',
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
