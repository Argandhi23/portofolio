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
 * Detects whether a project is a mobile application (Flutter / React Native / APK).
 */
export function isMobileProject(
  project?: {
    apk_url?: string | null;
    category?: string | null;
    tech_stack?: string[] | null;
  } | null
): boolean {
  if (!project) return false;
  if (Boolean(project.apk_url)) return true;
  const category = (project.category || '').toLowerCase();
  if (
    category.includes('mobile') ||
    category.includes('apk') ||
    category.includes('flutter')
  ) {
    return true;
  }
  const stack = (project.tech_stack || []).map((t) => t.toLowerCase());
  return stack.some(
    (t) =>
      t.includes('flutter') ||
      t.includes('react native') ||
      t.includes('android') ||
      t.includes('ios')
  );
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

    let path = publicUrl;
    if (/^https?:\/\//i.test(publicUrl)) {
      const url = new URL(publicUrl);
      const prefix = `/storage/v1/object/public/${bucketName}/`;
      if (!url.pathname.startsWith(prefix)) return null;
      path = decodeURIComponent(url.pathname.slice(prefix.length));
    }
    if (!path || /[\\?#\u0000-\u001f]/.test(path) || path.split('/').some((part) => !part || part === '.' || part === '..')) return null;
    return path;
  } catch {
    return null;
  }
}
