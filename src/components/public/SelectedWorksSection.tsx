import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { ProjectSummary } from '@/types/database.types';
import { pickLocalized } from '@/lib/i18n/localized';
import { formatDisplayDomain } from '@/lib/utils';
import { CmsText, T } from '@/components/public/LanguageProvider';
import { GsapProjectsStage } from '@/components/motion/GsapProjectsStage';
import { GsapSplitText } from '@/components/motion/GsapSplitText';

interface SelectedWorksSectionProps {
  projects: ProjectSummary[];
  ctaUrl?: string;
}

export function SelectedWorksSection({
  projects,
}: SelectedWorksSectionProps) {
  const featured = projects.filter((p) => p.is_featured);
  const featuredIds = new Set(featured.map((p) => p.id));
  const rest = projects.filter((p) => !featuredIds.has(p.id));
  const showcaseProjects = [...featured, ...rest].slice(0, 6);

  const navItems = showcaseProjects.map((p) => ({
    slug: p.slug,
    title: pickLocalized(p.title, 'en'),
  }));

  if (showcaseProjects.length === 0) {
    return (
      <div className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-24 text-center space-y-2">
        <p className="text-white font-semibold text-[15px]">
          <T
            en="Projects coming soon"
            id="Daftar proyek sedang disiapkan"
          />
        </p>
        <p className="text-[#7A7A7A] text-[13px]">
          <T
            en="Publish projects from the Admin Panel to display them here."
            id="Publikasikan proyek dari Panel Admin untuk menampilkannya di sini."
          />
        </p>
      </div>
    );
  }

  return (
    <GsapProjectsStage items={navItems}>
      {showcaseProjects.map((project, index) => {
        const numDigits = String(index + 1).padStart(2, '0');
        const domain = formatDisplayDomain(project.project_url, project.slug);
        const cleanAlt = pickLocalized(project.title, 'en');

        return (
          <article
            key={project.id}
            data-gsap-project-card
            className="w-full lg:w-[460px] xl:w-[500px] shrink-0 group"
          >
            <Link
              href={`/projects/${project.slug}`}
              className="flex flex-col space-y-4"
            >
              {/* Clean Frameless Editorial Image Container (Height-bounded so caption never clips) */}
              <div className="relative aspect-[16/10] lg:h-[40svh] lg:max-h-[310px] w-full rounded-xl overflow-hidden bg-[#121212]">
                {project.thumbnail_url ? (
                  <div
                    data-gsap-project-img
                    className="relative h-full w-full scale-105 will-change-transform"
                  >
                    <Image
                      src={project.thumbnail_url}
                      alt={cleanAlt}
                      fill
                      priority={index < 2}
                      className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                      sizes="(max-width: 1024px) 100vw, 520px"
                      unoptimized={
                        project.thumbnail_url.startsWith('data:') ||
                        project.thumbnail_url.endsWith('.svg')
                      }
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/30 text-xs">
                    Preview
                  </div>
                )}
              </div>

              {/* Minimalist Editorial Caption Block */}
              <div
                data-gsap-project-text
                className="border-t border-white/12 pt-3.5 space-y-2 will-change-transform"
              >
                <div className="flex items-baseline justify-between gap-4 text-xs">
                  <div className="inline-flex items-baseline gap-2.5">
                    <span className="font-mono text-[#9E1B32]">{numDigits}</span>
                    <span className="text-white/55">
                      <CmsText value={project.category} />
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-white/40 truncate max-w-[190px]">
                    {domain}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-white font-bold text-[20px] sm:text-[23px] leading-[1.15] tracking-[-0.025em] group-hover:text-[#E04D70] transition-colors">
                    <GsapSplitText stagger={0.025}>
                      <CmsText value={project.title} />
                    </GsapSplitText>
                  </h3>

                  <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                </div>

                {project.summary && (
                  <p className="text-white/65 text-[13.5px] leading-[1.55] line-clamp-2">
                    <CmsText value={project.summary} />
                  </p>
                )}

                {project.tech_stack && project.tech_stack.length > 0 && (
                  <p className="pt-0.5 font-mono text-[11px] text-white/40 truncate">
                    {project.tech_stack.slice(0, 4).join(' / ')}
                  </p>
                )}
              </div>
            </Link>
          </article>
        );
      })}
    </GsapProjectsStage>
  );
}
