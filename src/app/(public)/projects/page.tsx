import type { Metadata } from 'next';
import {
  getPublishedProjects,
  getSiteSettings,
} from '@/lib/queries/portfolio.queries';
import { CompactHero } from '@/components/public/CompactHero';
import { ProjectsArchiveGrid } from '@/components/public/ProjectsArchiveGrid';
import { FooterBookend } from '@/components/public/FooterBookend';

export const metadata: Metadata = {
  title: 'Selected Works & System Archive — Argandhi.',
  description:
    'Explore production web applications, mobile APKs, and AI-integrated software systems engineered by Faqih Rafasha Argandhi.',
};

export default async function ProjectsArchivePage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings(),
  ]);

  const brandName = settings.brand_name || 'Argandhi.';

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-[#FF5510] selection:text-white">
      <CompactHero
        brandName={brandName}
        ctaUrl="/#contact"
        backHref="/"
        backLabel="Back to Home"
        eyebrow="Portfolio Archive"
        title="Selected Works & Systems"
        summary="Production-grade web platforms, cross-platform mobile APKs, and intelligent software systems engineered with clarity, security, and speed."
        bottomStrip={
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/70">
            <span>
              Showing{' '}
              <strong className="text-white font-bold">
                {projects.length}
              </strong>{' '}
              published engineering case studies
            </span>
            <span className="text-[#FF5510] font-semibold">
              Updated dynamically via Argandhi CMS
            </span>
          </div>
        }
      />

      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <ProjectsArchiveGrid projects={projects} />
      </section>

      <FooterBookend settings={settings} showContactGrid={false} />
    </main>
  );
}
