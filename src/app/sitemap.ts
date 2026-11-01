import type { MetadataRoute } from 'next';
import { getPublicEnv } from '@/lib/env';
import { getPublishedProjects } from '@/lib/queries/portfolio.queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${NEXT_PUBLIC_SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${NEXT_PUBLIC_SITE_URL}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${NEXT_PUBLIC_SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    const projects = await getPublishedProjects();
    const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
      url: `${NEXT_PUBLIC_SITE_URL}/projects/${project.slug}`,
      lastModified: project.updated_at ? new Date(project.updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.85,
    }));

    return [...staticRoutes, ...projectRoutes];
  } catch {
    return staticRoutes;
  }
}
