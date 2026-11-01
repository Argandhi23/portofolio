/**
 * Combines class names conditionally (Shadcn UI standard utility).
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Generates a clean URL-friendly slug from text.
 * Sanitizes to lowercase alphanumeric characters and hyphens only.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Formats a clean hostname for browser window headers (e.g. "alparfume.store").
 */
export function formatDisplayDomain(
  projectUrl?: string | null,
  fallbackSlug?: string
): string {
  if (projectUrl) {
    try {
      const parsed = new URL(projectUrl);
      return parsed.hostname.replace(/^www\./i, '');
    } catch {
      // Fallback below
    }
  }
  return fallbackSlug ? `${fallbackSlug}.app` : 'preview.app';
}

/**
 * Extracts storage relative file path from a Supabase public storage URL.
 * Example: https://xyz.supabase.co/storage/v1/object/public/portfolio-media/uploads/file.webp
 * Returns: uploads/file.webp
 */
export function extractStoragePath(
  publicUrl: string,
  bucketName = 'portfolio-media'
): string | null {
  if (!publicUrl) return null;
  try {
    // Root-relative local public assets (e.g. /projects/alparfume/hero.webp) are not in Supabase Storage
    if (publicUrl.startsWith('/')) {
      return null;
    }

    const marker = `/${bucketName}/`;
    const index = publicUrl.indexOf(marker);
    if (index === -1) {
      // If it's already a storage-relative path (e.g. uploads/custom.png)
      if (!publicUrl.startsWith('http://') && !publicUrl.startsWith('https://')) {
        return publicUrl;
      }
      return null;
    }
    return decodeURIComponent(publicUrl.substring(index + marker.length));
  } catch {
    return null;
  }
}
